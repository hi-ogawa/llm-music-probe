#!/usr/bin/env python3
"""Re-voice the strummed nylon guitar of Cliche as a bossa guitarist would play it.

Usage: python3 revoice.py strummed.json project.json

Input is the strum-programmed project (gist 40bb09a52ec8b24e3f3c268a5cf1caa2).
Only "Comping (nylon guitar)" changes. Each chord keeps its pitch classes, the
finger strokes keep their rhythm, stroke timing and velocities, and a thumb
part on the low strings plays root then fifth on beats 1 and 3.
"""

import itertools
import json
import random
import sys

TRACK = "Comping (nylon guitar)"
BASS_TRACK = "Bass (acoustic)"
SEED = 18181
OPEN = {6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64}  # standard tuning, E2 A2 D3 G3 B3 E4
MAX_FRET = 12
THUMB_RANGE = (40, 52)  # E2..E3, mostly E2-A2 for roots
THUMB_STRINGS = (6, 5, 4)
THUMB_VEL = (64, 56)  # root, fifth
GAP_BEATS = 0.01
NAMES = "C Db D Eb E F Gb G Ab A Bb B".split()


def pc(p):
    return p % 12


def hand_ok(frets_by_string):
    """One left-hand shape: fretted notes within a 4-fret box (5 above fret 5),
    at most 4 fingers, where several notes on the lowest fret can be one barre."""
    fretted = [f for f in frets_by_string.values() if f > 0]
    if not fretted:
        return True
    lo, hi = min(fretted), max(fretted)
    if hi - lo > (4 if lo >= 5 else 3):
        return False
    # The index can barre the lowest fret across any strings; other fingers
    # can flatten over adjacent strings on one fret.
    fingers = 1 if lo in fretted else 0
    prev = None
    for s, f in sorted(frets_by_string.items()):
        if f > 0 and f != lo:
            if not (prev and prev == (s - 1, f)):
                fingers += 1
            prev = (s, f)
        else:
            prev = None
    return fingers <= 4


def candidates(chord):
    root, fifth, pcs, required = chord["root"], chord["fifth"], chord["pcs"], chord["required"]
    out = []
    thumbs = []
    for rs in THUMB_STRINGS:
        rf = (root - OPEN[rs]) % 12
        rp = OPEN[rs] + rf
        if not THUMB_RANGE[0] <= rp <= THUMB_RANGE[1]:
            continue
        thumbs.append((rs, rf, rp, None, None, None))  # root only
        if chord["thumb_slots"] < 2:
            continue
        for fs in THUMB_STRINGS:
            ff = (fifth - OPEN[fs]) % 12
            fp = OPEN[fs] + ff
            if fs != rs and THUMB_RANGE[0] <= fp <= THUMB_RANGE[1] and abs(rp - fp) <= 7:
                thumbs.append((rs, rf, rp, fs, ff, fp))
    for rs, rf, rp, fs, ff, fp in thumbs:
        if fs is None:
            fs, ff, fp = rs, rf, rp
        finger_strings = [s for s in (4, 3, 2, 1) if s < min(rs, fs)]
        for n in (4, 3):
            for strings in itertools.combinations(finger_strings, n):
                options = [
                    [(s, f) for f in range(MAX_FRET + 1) if pc(OPEN[s] + f) in pcs]
                    for s in strings
                ]
                for combo in itertools.product(*options):
                    pitches = [OPEN[s] + f for s, f in combo]
                    # Whatever the thumb does not play, the fingers must.
                    need = required if fp != rp else required | ({fifth} & pcs)
                    if not need <= {pc(p) for p in pitches}:
                        continue
                    if min(pitches) <= max(rp, fp):
                        continue
                    if not hand_ok({rs: rf, fs: ff, **dict(combo)}):
                        continue
                    out.append({
                        "thumb": {"root": (rs, rf, rp), "fifth": (fs, ff, fp)},
                        "fingers": list(combo),  # (string, fret), low string first
                        "pitches": pitches,
                    })
    return out


def cost(c, chord):
    frets = [f for _, f in c["fingers"]] + [c["thumb"]["root"][1], c["thumb"]["fifth"][1]]
    fretted = [f for f in frets if f > 0]
    k = 0.25 * (min(fretted) if fretted else 0)  # stay low on the neck
    k -= 0.8 * frets.count(0)  # open strings ring
    top = max(c["pitches"])
    k += 0.4 * max(0, 60 - top, top - 70)  # top voice around C4-Bb4
    k -= 0.5 * len({pc(p) for p in c["pitches"]})  # keep the color tones
    k += 0.6 * max(0, c["thumb"]["root"][2] - 47)  # roots around E2-B2
    if c["thumb"]["root"] == c["thumb"]["fifth"] and chord["thumb_slots"] >= 2:
        k += 3  # prefer an alternating bass
    k += 0.5 * sum(max(0, c["thumb"][x][1] - 5) for x in ("root", "fifth"))  # low strings sound tubby up high
    return k


def move(a, b):
    pa, pb = sorted(a["pitches"]), sorted(b["pitches"])
    if len(pa) != len(pb):
        short, long_ = (pa, pb) if len(pa) < len(pb) else (pb, pa)
        d = min(
            sum(abs(x - y) for x, y in zip(short, sub))
            for sub in itertools.combinations(long_, len(short))
        ) + 2
    else:
        d = sum(abs(x - y) for x, y in zip(pa, pb))
    da = abs(a["thumb"]["root"][2] - b["thumb"]["root"][2])
    return 0.35 * d + 0.1 * da


def chord_name(chord):
    return NAMES[chord["root"]]


def main(src, dst):
    rng = random.Random(SEED)
    project = json.load(open(src))
    beat_ms = 60000 / project["tempo"]
    loop_end = project["loop"]["range"]["endBeat"]
    track = next(t for t in project["midiTracks"] if t["name"] == TRACK)
    bass = sorted(
        next(t for t in project["midiTracks"] if t["name"] == BASS_TRACK)["notes"],
        key=lambda n: n["start"],
    )

    # Strokes from the strummed pass, in the order they were played.
    strokes = {}
    for n in track["notes"]:
        strokes.setdefault(round(n["start"] * 2) / 2, []).append(n)
    grid = sorted(strokes)
    feel = {}
    for g in grid:
        down = g % 1 == 0
        order = sorted(strokes[g], key=lambda n: n["pitch"] * (1 if down else -1))
        t0 = order[0]["start"]
        feel[g] = {
            "jitter": t0 - g,
            "offsets": [n["start"] - t0 for n in order],
            "vels": [n["velocity"] for n in order],
            "down": down,
        }

    # Chord spans: a new chord wherever the pitch set changes. The root is the
    # bass track's first note in the span, the fifth is perfect unless the
    # chord carries a flat fifth instead.
    chords = []
    for g in grid:
        pcs = frozenset(pc(n["pitch"]) for n in strokes[g])
        if chords and chords[-1]["pcs"] == pcs:
            chords[-1]["strokes"].append(g)
            continue
        root = next((pc(b["pitch"]) for b in bass if b["start"] >= g - 1e-6), None)
        if root is None:  # final pickup into the loop start
            root = chords[0]["root"]
        half_dim = {(root + 3) % 12, (root + 6) % 12} <= pcs and (root + 4) % 12 not in pcs
        fifth = (root + 6 if half_dim else root + 7) % 12
        chords.append({
            "start": g, "pcs": pcs, "root": root, "fifth": fifth,
            "required": pcs - {fifth}, "strokes": [g],
        })
    for i, c in enumerate(chords):
        c["end"] = chords[i + 1]["start"] if i + 1 < len(chords) else loop_end
    thumb_beats = range(0, loop_end, 2)
    for c in chords:
        c["thumb_slots"] = sum(c["start"] <= b < c["end"] for b in thumb_beats)

    # Pick one shape per chord, smoothest path overall (Viterbi).
    cands = [candidates(c) for c in chords]
    for c, cs in zip(chords, cands):
        assert cs, f"no playable voicing at beat {c['start']}"
    best = [[(cost(x, chords[0]), None) for x in cands[0]]]
    for i in range(1, len(chords)):
        row = []
        for x in cands[i]:
            base = cost(x, chords[i])
            j, v = min(
                ((j, best[-1][j][0] + move(y, x)) for j, y in enumerate(cands[i - 1])),
                key=lambda t: t[1],
            )
            row.append((base + v, j))
        best.append(row)
    k = min(range(len(best[-1])), key=lambda j: best[-1][j][0])
    for i in range(len(chords) - 1, -1, -1):
        chords[i]["shape"] = cands[i][k]
        k = best[i][k][1]
    # A guitarist keeps one shape per chord, so repeats reuse the first choice.
    first = {}
    for c in chords:
        key = (c["root"], c["pcs"])
        c["shape"] = first.setdefault(key, c["shape"])

    # Finger strokes: new pitches, same stroke direction, timing and velocities.
    notes = []
    for c in chords:
        fingers = c["shape"]["fingers"]
        for g in c["strokes"]:
            f = feel[g]
            order = fingers if f["down"] else fingers[::-1]  # string order, not pitch
            idx = [0, 1, 3] if len(order) == 3 else [0, 1, 2, 3]
            for i, (s, fr) in enumerate(order):
                notes.append({
                    "pitch": OPEN[s] + fr, "start": max(0.0, g + f["jitter"] + f["offsets"][idx[i]]),
                    "velocity": f["vels"][i], "_string": s, "_choke": g % 1 == 0 and g % 4 == 3,
                })

    # Thumb: beats 1 and 3, root when the chord is new since the last thumb note,
    # otherwise the fifth.
    prev = None
    for b in thumb_beats:
        c = next(c for c in reversed(chords) if c["start"] <= b)
        kind = "fifth" if c is prev else "root"
        prev = c
        s, fr, p = c["shape"]["thumb"][kind]
        jitter = max(-2, min(2, rng.gauss(0, 1))) * 4 / beat_ms
        vel = THUMB_VEL[kind == "fifth"] + rng.uniform(-4, 4) + (4 if b % 4 == 0 else 0)
        notes.append({
            "pitch": p, "start": max(0.0, b + jitter), "velocity": int(round(vel)),
            "_string": s, "_choke": False, "_thumb": True,
        })

    # Lengths: a string rings until it is plucked again, or until its chord
    # ends and the hand moves; the beat-4 finger hit before the &4 is choked.
    notes.sort(key=lambda n: n["start"])
    for i, n in enumerate(notes):
        nxt = next((m for m in notes[i + 1:] if m["_string"] == n["_string"]), None)
        end = nxt["start"] - GAP_BEATS if nxt else loop_end
        c = next(c for c in reversed(chords) if c["start"] <= n["start"] + 0.1)
        end = min(end, c["end"] + 0.1)  # left hand lifts at the change
        if n.get("_thumb"):
            end = min(end, n["start"] + 1.9)  # palm damps it by the next thumb pluck
        if n["_choke"]:
            end = min(end, n["start"] + 0.28 * rng.uniform(0.9, 1.1))
        n["duration"] = round(end - n["start"], 4)
        n["start"] = round(n["start"], 4)
        del n["_string"], n["_choke"]
        n.pop("_thumb", None)
    track["notes"] = notes

    with open(dst, "w") as f:
        json.dump(project, f, indent=2, ensure_ascii=False)
        f.write("\n")

    # Chord chart for the README: frets low E to high E, thumb notes in brackets.
    for c in chords:
        sh = c["shape"]
        cells = {s: "x" for s in OPEN}
        for kind in ("root", "fifth")[: 1 if sh["thumb"]["root"] == sh["thumb"]["fifth"] else 2]:
            s, fr, _ = sh["thumb"][kind]
            cells[s] = f"({fr})"
        for s, fr in sh["fingers"]:
            cells[s] = str(fr)
        names = " ".join(NAMES[pc(OPEN[s] + fr)] for s, fr in sh["fingers"])
        print(f"{c['start']:>6} {chord_name(c):<3} {' '.join(cells[s] for s in (6, 5, 4, 3, 2, 1)):<22} fingers {names}")


if __name__ == "__main__":
    main(*sys.argv[1:3])
