#!/usr/bin/env python3
"""Rewrite the nylon guitar track of Cliche with strum programming.

Usage: python3 strum.py cliche.json project.json

Only start, duration and velocity of "Comping (nylon guitar)" notes change.
Pitches, chord voicings, rhythm grid and all other tracks are copied as is.
"""

import json
import random
import sys

TRACK = "Comping (nylon guitar)"
SEED = 18181

DOWN_SPREAD_MS = (18, 40)  # whole stroke, first to last string
UP_SPREAD_MS = (10, 24)  # upstrokes are shorter flicks
JITTER_SD_MS = 4  # per-stroke timing jitter, clipped to +-2 sd
UP_VEL_SCALE = 0.82  # upstrokes lighter than downstrokes
TAPER = 4  # velocity drop per string along the stroke
GRAZE_PROB = 0.6  # upstroke catches only the top 3 notes
GRAZE_VEL = (16, 24)  # the missed lowest string, barely touched
CHOKE_BEATS = 0.28  # left-hand release on the beat-4 hit before the anticipation
GAP_BEATS = 0.01  # a note stops just before its string is struck again


def main(src, dst):
    rng = random.Random(SEED)
    project = json.load(open(src))
    beat_ms = 60000 / project["tempo"]
    loop_end = project["loop"]["range"]["endBeat"]
    track = next(t for t in project["midiTracks"] if t["name"] == TRACK)

    # Group notes into strokes by the eighth-note grid they belong to.
    strokes = {}
    for n in track["notes"]:
        strokes.setdefault(round(n["start"] * 2) / 2, []).append(n)
    grid = sorted(strokes)

    # Pass 1: timing and velocity per stroke.
    for g in grid:
        notes = sorted(strokes[g], key=lambda n: n["pitch"])
        down = g % 1 == 0
        order = notes if down else notes[::-1]  # up rolls high to low
        base = sum(n["velocity"] for n in notes) / len(notes)
        if not down:
            base *= UP_VEL_SCALE
        if g % 4 == 0:
            base += 6  # bar downbeat leans in a little

        spread = rng.uniform(*(DOWN_SPREAD_MS if down else UP_SPREAD_MS)) / beat_ms
        jitter = max(-2, min(2, rng.gauss(0, 1))) * JITTER_SD_MS / beat_ms
        # Uneven string-to-string gaps so the roll is not a perfect ramp.
        gaps = [rng.uniform(0.6, 1.4) for _ in order[1:]]
        offsets = [0.0]
        for w in gaps:
            offsets.append(offsets[-1] + w)
        offsets = [o / offsets[-1] * spread for o in offsets]

        graze = not down and len(order) >= 4 and rng.random() < GRAZE_PROB
        for i, n in enumerate(order):
            n["start"] = max(0.0, g + jitter + offsets[i])
            vel = base - TAPER * i + rng.uniform(-3, 3)
            if graze and i == len(order) - 1:
                vel = rng.uniform(*GRAZE_VEL)
            n["velocity"] = int(round(max(1, min(127, vel))))
            n["_rank"] = notes.index(n)  # string slot, low to high

    # Pass 2: lengths. Each string rings until the next stroke reaches it,
    # except the beat-4 hit right before the "and of 4" anticipation is choked.
    for i, g in enumerate(grid):
        nxt = strokes[grid[i + 1]] if i + 1 < len(grid) else None
        choke = g % 1 == 0 and g % 4 == 3 and i + 1 < len(grid) and grid[i + 1] - g == 0.5
        for n in strokes[g]:
            if nxt is None:
                end = loop_end
            else:
                same = [m for m in nxt if m["_rank"] == n["_rank"]]
                end = (same[0] if same else min(nxt, key=lambda m: m["start"]))["start"] - GAP_BEATS
            if choke:
                end = min(end, g + CHOKE_BEATS * rng.uniform(0.9, 1.1))
            n["duration"] = end - n["start"]

    for n in track["notes"]:
        del n["_rank"]
        n["start"] = round(n["start"], 4)
        n["duration"] = round(n["duration"], 4)
    track["notes"].sort(key=lambda n: (n["start"], n["pitch"]))

    with open(dst, "w") as f:
        json.dump(project, f, indent=2, ensure_ascii=False)
        f.write("\n")


if __name__ == "__main__":
    main(*sys.argv[1:3])
