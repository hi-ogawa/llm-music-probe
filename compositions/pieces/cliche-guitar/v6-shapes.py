#!/usr/bin/env python3
"""Play the strummed nylon guitar of Cliche with full guitar chord shapes.

Usage: python3 shapes.py strummed.json project.json

Input is the strummed project (gist 40bb09a52ec8b24e3f3c268a5cf1caa2). Each
chord hit's pitches become the full shape from the re-voicing search (gist
375801d436784457d2f8f9eeb4093381), strummed as one stroke across the strings.
Stroke times, directions, spread and velocity taper come from the strummed pass.
Only "Comping (nylon guitar)" changes.
"""

import json
import sys

TRACK = "Comping (nylon guitar)"
OPEN = {6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64}  # standard tuning, E2 A2 D3 G3 B3 E4
GAP_BEATS = 0.01
GRAZE_VEL = 30  # a strummed upstroke whose bottom note was grazed below this caught 3 strings
TAPER = 4  # velocity drop per extra string, as in the strummed pass

# Frets from string 6 (low E) to string 1 (high E), None = not played.
# Keyed by the chord's pitch classes in the original voicing.
NAMES = "C Db D Eb E F Gb G Ab A Bb B".split()
SHAPES = {
    "Dm(add9)": ("F A D E", (None, 0, 0, 7, 6, 0)),
    "Dm(maj7)": ("F A Db E", (None, 0, 0, 6, 6, 0)),
    "Dm7": ("F A C E", (None, 0, 0, 5, 6, 0)),
    "Dm6": ("F A B E", (None, 0, 0, 4, 6, 0)),
    "Gm9": ("F A Bb D", (3, None, 0, 3, 6, 5)),
    "C13": ("E A Bb D", (3, 3, 0, 3, 5, 5)),
    "Fmaj9": ("E G A C", (1, 3, 2, 2, None, 3)),
    "Em7b5(11)": ("D G A Bb", (0, None, 5, 3, 3, 5)),
    "Eb9(#11)": ("G A Db F", (None, 6, 5, 6, 6, 5)),
    "Cm9": ("Eb G Bb D", (None, 3, 0, 3, 4, 3)),
    "F13": ("Eb G A D", (1, None, 0, 2, 4, 3)),
    "Bbmaj9": ("D F A C", (1, 1, 0, 2, 1, None)),
    "Ebm9": ("Gb Bb Db F", (None, 6, 4, 6, 6, 6)),
    "Ab13": ("Gb Bb C F", (4, None, 3, 3, 1, 2)),
    "Am7b5(11)": ("G C D Eb", (None, 0, 0, 5, 4, 3)),
    "Ab9(#11)": ("Gb Bb C D", (4, None, 0, 5, 7, 6)),
    "Bbm9": ("Ab C Db F", (6, None, 6, 6, 6, 8)),
    "Eb13": ("G C Db F", (None, 6, 5, 6, 6, 8)),
    "A7(b9,b13)": ("G Bb Db F", (None, 0, 3, 3, 2, 3)),
}
BY_PCS = {
    frozenset(NAMES.index(x) for x in tones.split()): (name, frets)
    for name, (tones, frets) in SHAPES.items()
}


def main(src, dst):
    project = json.load(open(src))
    loop_end = project["loop"]["range"]["endBeat"]
    track = next(t for t in project["midiTracks"] if t["name"] == TRACK)

    strokes = {}
    for n in track["notes"]:
        strokes.setdefault(round(n["start"] * 2) / 2, []).append(n)
    grid = sorted(strokes)

    notes, used = [], {}
    for g in grid:
        down = g % 1 == 0
        order = sorted(strokes[g], key=lambda n: n["start"])  # as strummed
        t0 = order[0]["start"]
        offsets = [n["start"] - t0 for n in order]
        vels = [n["velocity"] for n in order]
        gaps = [b - a for a, b in zip(offsets, offsets[1:])]
        mean_gap = sum(gaps) / len(gaps)

        name, frets = BY_PCS[frozenset(n["pitch"] % 12 for n in order)]
        used[name] = frets
        strings = [s for s, f in zip((6, 5, 4, 3, 2, 1), frets) if f is not None]  # low first
        if down:
            play = strings
        else:
            k = 3 if vels[-1] < GRAZE_VEL else 4
            play = strings[::-1][:k]  # top strings, high to low
            vels = vels[:k]
        for i, s in enumerate(play):
            # Extra strings keep the stroke's average string-to-string speed
            # and continue its velocity taper.
            off = offsets[i] if i < len(offsets) else offsets[-1] + mean_gap * (i - len(offsets) + 1)
            vel = vels[i] if i < len(vels) else vels[-1] - TAPER * (i - len(vels) + 1)
            notes.append({
                "pitch": OPEN[s] + frets[6 - s], "start": t0 + off,
                "velocity": int(round(max(1, vel))),
                "_string": s, "_shape": name, "_g": g,
            })

    # A string rings until it is struck again or the hand moves to the next shape.
    notes.sort(key=lambda n: n["start"])
    shape_starts = []
    for g in grid:
        first = min(n["start"] for n in notes if n["_g"] == g)
        shape = next(n["_shape"] for n in notes if n["_g"] == g)
        if not shape_starts or shape_starts[-1][1] != shape:
            shape_starts.append((first, shape))
    for i, n in enumerate(notes):
        restrike = next((m["start"] for m in notes[i + 1:] if m["_string"] == n["_string"]), loop_end)
        change = next((t for t, _ in shape_starts if t > n["start"]), loop_end)
        end = min(restrike, change)
        n["duration"] = round(end - n["start"] - (GAP_BEATS if end < loop_end else 0), 4)
        n["start"] = round(n["start"], 4)
        del n["_string"], n["_shape"], n["_g"]
    track["notes"] = notes

    with open(dst, "w") as f:
        json.dump(project, f, indent=2, ensure_ascii=False)
        f.write("\n")

    for name, frets in used.items():
        pitches = [OPEN[s] + f for s, f in zip((6, 5, 4, 3, 2, 1), frets) if f is not None]
        print(f"{name:<11} {' '.join('x' if f is None else str(f) for f in frets):<14} span {max(pitches) - min(pitches)} semitones")


if __name__ == "__main__":
    main(*sys.argv[1:3])
