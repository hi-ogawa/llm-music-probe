#!/usr/bin/env python3
"""Choke the beat-4 stroke before each &4 push on the full-shape nylon guitar.

Usage: python3 choke.py fullshapes.json project.json

Input is the full-shape project (gist 6175c1e7f2fd273d48db544b27b67b2e).
Everything rings as there, except the stroke on beat 4 of every second bar,
which sits an 8th before the &4 anticipation. The left hand lets go after
about a 16th, so the push into the next bar gets a short breath. Only
"Comping (nylon guitar)" changes, and only those notes' lengths.
"""

import json
import random
import sys

TRACK = "Comping (nylon guitar)"
SEED = 18181
CHOKE_BEATS = (0.2, 0.28)  # about a 16th at 130 BPM


def main(src, dst):
    rng = random.Random(SEED)
    project = json.load(open(src))
    track = next(t for t in project["midiTracks"] if t["name"] == TRACK)

    strokes = {}
    for n in track["notes"]:
        strokes.setdefault(round(n["start"] * 2) / 2, []).append(n)

    choked = 0
    for g, notes in sorted(strokes.items()):
        if g % 8 != 7 or g + 0.5 not in strokes:
            continue
        t0 = min(n["start"] for n in notes)
        end = t0 + rng.uniform(*CHOKE_BEATS)
        # Anything still ringing from earlier strokes is cut by the same release.
        for n in track["notes"]:
            if n["start"] <= t0 + 0.1 and n["start"] + n["duration"] > end:
                n["duration"] = round(end - n["start"], 4)
        choked += 1

    with open(dst, "w") as f:
        json.dump(project, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("choked", choked)


if __name__ == "__main__":
    main(*sys.argv[1:3])
