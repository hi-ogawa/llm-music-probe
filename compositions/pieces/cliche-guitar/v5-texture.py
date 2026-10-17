#!/usr/bin/env python3
"""Add bossa comping texture to the full-shape nylon guitar of Cliche.

Usage: python3 texture.py fullshapes.json project.json

Input is the full-shape project (gist 6175c1e7f2fd273d48db544b27b67b2e), and
shapes.py from that gist must sit next to this script. Shapes, stroke times
and stroke treatment stay. Strokes are sorted into accented strokes that ring,
light strokes that the left hand half-mutes, and chucks that move to a muted
guitar track (GM 28).
"""

import copy
import json
import random
import sys

from shapes import OPEN, SHAPES

TRACK = "Comping (nylon guitar)"
MUTED = "Comping (muted guitar)"
SEED = 18181
GAP_BEATS = 0.01

# Position in the 2-bar cell (beats) -> role, for strokes that keep the chord.
# 1 &2 &3 &4 | 2 3 4 &4: the beat, the syncopations and the anticipations
# carry the pattern; &3 and beats 3-4 of bar 2 are the in-between strokes.
ROLE = {0: "accent", 1.5: "accent", 2.5: "light", 3.5: "accent",
        5: "accent", 6: "light", 7: "light", 7.5: "accent"}
CHUCK_PROB = {2.5: 0.35, 6: 0.3, 7: 0.7}  # beat 4 before the push is mostly a chuck

ACCENT_VEL = 1.08
LIGHT_VEL = (0.6, 0.72)
LIGHT_STRINGS = (2, 3)  # top strings only
LIGHT_LEN = (0.16, 0.3)  # beats, the left hand lets go
CHUCK_VEL = (30, 44)
CHUCK_LEN = (0.05, 0.09)
CHUCK_SPREAD_MS = (6, 12)
DRIFT_SD = 2.5  # per-bar random walk in velocity, clipped to +-6
JITTER_VEL = 4
JITTER_LEN = 0.12  # +-12% on accent lengths


def main(src, dst):
    rng = random.Random(SEED)
    project = json.load(open(src))
    beat_ms = 60000 / project["tempo"]
    loop_end = project["loop"]["range"]["endBeat"]
    tracks = project["midiTracks"]
    ti = next(i for i, t in enumerate(tracks) if t["name"] == TRACK)
    track = tracks[ti]

    strokes = {}
    for n in track["notes"]:
        strokes.setdefault(round(n["start"] * 2) / 2, []).append(n)
    grid = sorted(strokes)

    # Which shape each stroke belongs to. Upstrokes play only the top strings,
    # so match by containment: stay on the previous shape when it fits,
    # otherwise take the one the following strokes settle on (Bbm9 and Eb13
    # share their top three strings).
    shape_pitches = {
        name: {OPEN[s] + f for s, f in zip((6, 5, 4, 3, 2, 1), frets) if f is not None}
        for name, (_, frets) in SHAPES.items()
    }
    fits = {g: [name for name, sp in shape_pitches.items() if {n["pitch"] for n in strokes[g]} <= sp] for g in grid}
    shape_of, prev = {}, None
    for i, g in enumerate(grid):
        if prev in fits[g]:
            shape_of[g] = prev
        else:
            later = next(fits[h] for h in grid[i:] if len(fits[h]) == 1 or not set(fits[h]) <= set(fits[g]))
            shape_of[g] = next(x for x in fits[g] if x in later)
        prev = shape_of[g]

    # Per-bar dynamic drift so repeats differ.
    drift, d = {}, 0.0
    for bar in range(loop_end // 4):
        d = max(-6, min(6, d + rng.gauss(0, DRIFT_SD)))
        drift[bar] = d

    nylon, muted = [], []
    roles = {}
    prev_shape = None
    for g in grid:
        notes = strokes[g]
        role = ROLE[g % 8]
        if shape_of[g] != prev_shape:
            role = "accent"  # a chord change always speaks
        elif role == "light" and rng.random() < CHUCK_PROB[g % 8]:
            role = "chuck"
        prev_shape = shape_of[g]
        roles[g] = role
        down = g % 1 == 0
        order = sorted(notes, key=lambda n: n["start"])  # as strummed
        dv = drift[int(g // 4)] + rng.uniform(-JITTER_VEL, JITTER_VEL)

        if role == "accent":
            for n in order:
                nylon.append({**n, "velocity": n["velocity"] * ACCENT_VEL + dv, "_g": g, "_role": role})
        elif role == "light":
            k = min(rng.choice(LIGHT_STRINGS), len(notes) - 1)
            top = sorted(notes, key=lambda n: n["pitch"])[-k:]
            scale = rng.uniform(*LIGHT_VEL)
            length = rng.uniform(*LIGHT_LEN)
            for n in order:
                if n in top:
                    nylon.append({**n, "velocity": n["velocity"] * scale + dv,
                                  "duration": length * rng.uniform(0.85, 1.15), "_g": g, "_role": role})
        else:  # chuck: tight, quiet, percussive, on the muted sample
            spread = rng.uniform(*CHUCK_SPREAD_MS) / beat_ms
            t0 = order[0]["start"]
            for i, n in enumerate(order):
                muted.append({
                    "pitch": n["pitch"],
                    "start": t0 + spread * i / max(1, len(order) - 1),
                    "velocity": rng.uniform(*CHUCK_VEL) - 3 * i + dv / 2,
                    "duration": rng.uniform(*CHUCK_LEN),
                })

    # Accents keep the full-shape lengths (ring until the string is struck
    # again or the shape changes), but the left hand lets go for the next
    # light stroke or chuck. A little length variation on top.
    releases = [min(n["start"] for n in strokes[h]) for h in grid if roles[h] != "accent"]
    for n in nylon:
        if n["_role"] != "accent":
            continue
        end = n["start"] + n["duration"]
        release = next((t for t in releases if t > n["start"]), None)
        if release is not None:
            end = min(end, release - GAP_BEATS)
        n["duration"] = (end - n["start"]) * (1 - rng.uniform(0, JITTER_LEN))

    out = []
    for n in nylon:
        out.append({
            "pitch": n["pitch"], "start": round(n["start"], 4),
            "duration": round(n["duration"], 4),
            "velocity": int(round(max(1, min(127, n["velocity"])))),
        })
    track["notes"] = sorted(out, key=lambda n: (n["start"], n["pitch"]))

    mt = copy.deepcopy({k: v for k, v in track.items() if k != "notes"})
    mt.update(name=MUTED, program=28)
    mt["notes"] = sorted(({
        "pitch": n["pitch"], "start": round(n["start"], 4),
        "duration": round(n["duration"], 4),
        "velocity": int(round(max(1, min(127, n["velocity"])))),
    } for n in muted), key=lambda n: (n["start"], n["pitch"]))
    tracks.insert(ti + 1, mt)

    with open(dst, "w") as f:
        json.dump(project, f, indent=2, ensure_ascii=False)
        f.write("\n")

    counts = {}
    for r in roles.values():
        counts[r] = counts.get(r, 0) + 1
    print(counts)


if __name__ == "__main__":
    main(*sys.argv[1:3])
