#!/usr/bin/env python3
"""Accent and light-stroke texture on the full-shape nylon guitar of Cliche.

Usage: python3 light.py fullshapes.json project.json

Input is the full-shape project (gist 6175c1e7f2fd273d48db544b27b67b2e), and
shapes.py from that gist must sit next to this script. Shapes, stroke times
and stroke treatment stay. The in-between strokes become light strokes on the
top strings, while the rest of the shape keeps ringing under them, so there
is no dead air. Only "Comping (nylon guitar)" changes.
"""

import json
import random
import sys

from shapes import OPEN, SHAPES

TRACK = "Comping (nylon guitar)"
SEED = 18181
GAP_BEATS = 0.01

# Position in the 2-bar cell (beats) -> role. 1 &2 &3 &4 | 2 3 4 &4: the beat,
# the syncopations and the anticipations carry the pattern; &3 and beats 3-4
# of bar 2 are the in-between strokes. A new shape is always an accent.
ROLE = {0: "accent", 1.5: "accent", 2.5: "light", 3.5: "accent",
        5: "accent", 6: "light", 7: "light", 7.5: "accent"}

ACCENT_VEL = 1.08
LIGHT_VEL = (0.6, 0.72)
LIGHT_STRINGS = (2, 3)  # top strings only
DRIFT_SD = 2.5  # per-bar random walk in velocity, clipped to +-6
JITTER_VEL = 4
JITTER_LEN = 0.12  # up to 12% shorter
MAX_SHORTEN = 0.06  # but never more than this many beats, so no audible gap


def main(src, dst):
    rng = random.Random(SEED)
    project = json.load(open(src))
    loop_end = project["loop"]["range"]["endBeat"]
    track = next(t for t in project["midiTracks"] if t["name"] == TRACK)

    strokes = {}
    for n in track["notes"]:
        strokes.setdefault(round(n["start"] * 2) / 2, []).append(n)
    grid = sorted(strokes)

    # Shape of each stroke and the string of each pitch in it. Upstrokes play
    # only the top strings, so match by containment: stay on the previous
    # shape when it fits, otherwise take the one the following strokes settle
    # on (Bbm9 and Eb13 share their top three strings).
    string_of = {
        name: {OPEN[s] + f: s for s, f in zip((6, 5, 4, 3, 2, 1), frets) if f is not None}
        for name, (_, frets) in SHAPES.items()
    }
    fits = {g: [name for name, sp in string_of.items() if {n["pitch"] for n in strokes[g]} <= set(sp)] for g in grid}
    shape_of, prev = {}, None
    for i, g in enumerate(grid):
        if prev in fits[g]:
            shape_of[g] = prev
        else:
            later = next(fits[h] for h in grid[i:] if len(fits[h]) == 1 or not set(fits[h]) <= set(fits[g]))
            shape_of[g] = next(x for x in fits[g] if x in later)
        prev = shape_of[g]

    drift, d = {}, 0.0
    for bar in range(loop_end // 4):
        d = max(-6, min(6, d + rng.gauss(0, DRIFT_SD)))
        drift[bar] = d

    notes, prev_shape, counts = [], None, {}
    for g in grid:
        role = ROLE[g % 8] if shape_of[g] == prev_shape else "accent"
        prev_shape = shape_of[g]
        counts[role] = counts.get(role, 0) + 1
        dv = drift[int(g // 4)] + rng.uniform(-JITTER_VEL, JITTER_VEL)
        played = sorted(strokes[g], key=lambda n: n["start"])  # as strummed
        if role == "accent":
            scale = ACCENT_VEL
        else:
            k = min(rng.choice(LIGHT_STRINGS), len(played) - 1)
            top = sorted(played, key=lambda n: n["pitch"])[-k:]
            played = [n for n in played if n in top]
            scale = rng.uniform(*LIGHT_VEL)
        for n in played:
            notes.append({
                "pitch": n["pitch"], "start": n["start"],
                "velocity": int(round(max(1, min(127, n["velocity"] * scale + dv)))),
                "_string": string_of[shape_of[g]][n["pitch"]], "_g": g, "_role": role,
            })

    # A string rings until it is struck again or the hand moves to the next
    # shape. Light-stroke notes also stop at the next stroke, so they stay a
    # lighter layer over the strings still ringing from the last accent.
    notes.sort(key=lambda n: n["start"])
    stroke_start = {g: min(n["start"] for n in notes if n["_g"] == g) for g in grid}
    shape_change = [stroke_start[g] for i, g in enumerate(grid) if i == 0 or shape_of[g] != shape_of[grid[i - 1]]]
    for i, n in enumerate(notes):
        end = min(
            next((m["start"] for m in notes[i + 1:] if m["_string"] == n["_string"]), loop_end),
            next((t for t in shape_change if t > n["start"]), loop_end),
        )
        if n["_role"] == "light":
            end = min(end, next((stroke_start[h] for h in grid if h > n["_g"]), loop_end))
        if end < loop_end:
            end -= GAP_BEATS
        length = end - n["start"]
        length -= min(MAX_SHORTEN, length * rng.uniform(0, JITTER_LEN))
        n["duration"] = round(length, 4)
        n["start"] = round(n["start"], 4)
        del n["_string"], n["_g"], n["_role"]
    track["notes"] = notes

    with open(dst, "w") as f:
        json.dump(project, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(counts)


if __name__ == "__main__":
    main(*sys.argv[1:3])
