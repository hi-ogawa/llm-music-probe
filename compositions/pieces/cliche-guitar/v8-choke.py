#!/usr/bin/env python3
"""Release the beat-4 stroke just before each &4 push on the full-shape nylon guitar.

Usage: python3 choke.py fullshapes.json project.json

Input is the full-shape project (gist 6175c1e7f2fd273d48db544b27b67b2e).
Everything rings as there, except the stroke on beat 4 of every second bar,
which sits an 8th before the &4 anticipation. The left hand lets go a moment
before the push, leaving a short, uneven breath. Only "Comping (nylon guitar)"
changes, and only those notes' lengths.
"""

import json
import random
import sys

TRACK = "Comping (nylon guitar)"
SEED = 18181
REST_BEATS = (0.06, 0.14)  # silence before the &4 stroke, about 30-65 ms at 130 BPM
STRING_SPREAD = 0.02  # fingers lift unevenly, +- this many beats per string


def main(src, dst):
    rng = random.Random(SEED)
    project = json.load(open(src))
    track = next(t for t in project["midiTracks"] if t["name"] == TRACK)

    strokes = {}
    for n in track["notes"]:
        strokes.setdefault(round(n["start"] * 2) / 2, []).append(n)

    released = 0
    for g, notes in sorted(strokes.items()):
        if g % 8 != 7 or g + 0.5 not in strokes:
            continue
        t0 = min(n["start"] for n in notes)
        push = min(n["start"] for n in strokes[g + 0.5])
        release = push - rng.uniform(*REST_BEATS)
        # Anything still ringing from earlier strokes is cut by the same release.
        for n in track["notes"]:
            end = release + rng.uniform(-STRING_SPREAD, STRING_SPREAD)
            if n["start"] <= t0 + 0.1 and n["start"] + n["duration"] > end:
                n["duration"] = round(end - n["start"], 4)
        released += 1

    with open(dst, "w") as f:
        json.dump(project, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("released", released)


if __name__ == "__main__":
    main(*sys.argv[1:3])
