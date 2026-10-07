"""Check bar step counts in Scrimshaw scores and measure how pitched voices relate to the written harmony.

Usage: python3 analyze.py source/*.scrim
"""

import re
import sys
from collections import Counter, defaultdict

DRUMS = set(
    "kick snare rim hat ohat ride crash clap conga tumba bongo bongolo timbale bodhran shaker tamb clave block cowbell guiro tri tomlo tommid tomhi gong thunder surf".split()
)
PC = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
ACC = {"": 0, "#": 1, "##": 2, "b": -1, "bb": -2}
QUALITY = {
    "": [0, 4, 7], "m": [0, 3, 7], "7": [0, 4, 7, 10], "m7": [0, 3, 7, 10], "maj7": [0, 4, 7, 11],
    "mmaj7": [0, 3, 7, 11], "6": [0, 4, 7, 9], "m6": [0, 3, 7, 9], "9": [0, 4, 7, 10, 2], "m9": [0, 3, 7, 10, 2],
    "maj9": [0, 4, 7, 11, 2], "add9": [0, 4, 7, 2], "madd9": [0, 3, 7, 2], "sus2": [0, 2, 7], "sus4": [0, 5, 7],
    "7sus4": [0, 5, 7, 10], "dim": [0, 3, 6], "dim7": [0, 3, 6, 9], "m7b5": [0, 3, 6, 10], "aug": [0, 4, 8],
    "5": [0, 7], "7b9": [0, 4, 7, 10, 1],
}
NOTE = re.compile(r"^~?([A-G])(##|#|bb|b)?(\d)$")
CHORD = re.compile(r"^\[([A-G])(#|b)?([a-z0-9]*)(?:/([A-G])(#|b)?)?\]$")

def main():
    for path in sys.argv[1:]:
        song = parse(path)
        print(f"\n=== {path.split('/')[-1]}  ({song['beats']}x{song['steps']} steps)")
        report(song)

def parse(path):
    song = {"beats": 4, "steps": 4, "voices": {}, "patterns": {}}
    current = None
    for raw in open(path):
        line = re.sub(r"(^|\s)#.*", "", raw).rstrip()
        if not line.strip():
            continue
        words = line.split()
        key = words[0]
        if key in ("beats", "steps") and current is None:
            song[key] = int(words[1])
        elif key == "voice":
            song["voices"][words[1]] = words[2]
        elif key == "pattern":
            opts = dict(w.split("=") for w in words[2:] if "=" in w)
            base = song["patterns"][words[3]] if len(words) > 3 and words[2] == "from" else None
            current = {
                "steps": int(opts.get("steps", song["steps"])),
                "beats": int(opts.get("beats", song["beats"])),
                "parts": {k: list(v) for k, v in base["parts"].items()} if base else {},
                "fresh": set(),
            }
            song["patterns"][words[1]] = current
        elif key == "mute":
            current["parts"].pop(words[1], None)
        elif key in ("beats", "steps") and current is not None:
            current[key] = int(words[1])
        elif "|" in line and current is not None:
            name, _, rest = line.partition("|")
            name = name.strip()
            if name not in current["fresh"]:
                current["parts"][name] = []
                current["fresh"].add(name)
            current["parts"][name] += [b.strip() for b in rest.split("|") if b.strip()]
    return song

def report(song):
    errors = 0
    stats = defaultdict(Counter)  # voice -> counter of (position, in_chord)
    outside = defaultdict(Counter)  # voice -> interval above chord root for non-chord tones
    for pname, pat in song["patterns"].items():
        size = pat["beats"] * pat["steps"]
        timelines = {}
        for voice, bars in pat["parts"].items():
            drum = song["voices"][voice] in DRUMS
            events, prev = [], []
            for i, bar in enumerate(bars):
                if bar in ("_", "="):
                    prev = []
                elif bar != "%":
                    n, prev = (count_drum(bar), []) if drum else count_melodic(bar)
                    if n != size:
                        errors += 1
                        print(f"  bar error: pattern {pname} voice {voice} bar {i + 1}: {n} steps, expected {size}")
                events += [(t + i * size, e) for t, e in prev]
            timelines[voice] = events
        chords = sorted((t, c) for evs in timelines.values() for t, kind in evs for c in [kind] if c[0] == "chord")
        for voice, evs in timelines.items():
            for t, ev in evs:
                if ev[0] != "note":
                    continue
                chord = active(chords, t)
                if chord is None:
                    continue
                root, tones = chord[1], chord[2]
                pos = "beat" if t % pat["steps"] == 0 else "off"
                inside = ev[1] % 12 in tones
                stats[voice][(pos, inside)] += 1
                if not inside:
                    outside[voice][(ev[1] - root) % 12] += 1
    print(f"  bar errors: {errors}")
    names = ["R", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"]
    print("  chord-tone ratio per voice (on beat / off beat), non-chord tones by interval above root")
    for voice, c in stats.items():
        on = ratio(c, "beat")
        off = ratio(c, "off")
        nct = " ".join(f"{names[k]}x{v}" for k, v in outside[voice].most_common(5))
        print(f"    {voice:8} {song['voices'][voice]:11} on {on:>12}  off {off:>12}  {nct}")

def count_melodic(bar):
    steps, events = 0, []
    for tok in bar.split():
        body = tok.rstrip("!?").rstrip("-").rstrip("!?").rstrip("-")
        length = 1 + tok.count("-") if body else tok.count("-")
        if body == "" or set(body) == {"."}:
            steps += len(body) + tok.count("-")
            continue
        for part in body.split("+"):
            m = NOTE.match(part)
            if m:
                events.append((steps, ("note", PC[m[1]] + ACC[m[2] or ""] + 12 * int(m[3]))))
            m = CHORD.match(part)
            if m:
                root = (PC[m[1]] + ACC[m[2] or ""]) % 12
                tones = {(root + i) % 12 for i in QUALITY[m[3]]}
                if m[4]:
                    tones.add((PC[m[4]] + ACC[m[5] or ""]) % 12)
                events.append((steps, ("chord", root, tones)))
        steps += length
    return steps, events

def count_drum(bar):
    return len(bar.replace(" ", ""))

def active(chords, t):
    found = None
    for ct, c in chords:
        if ct > t:
            break
        found = c
    return found

def ratio(c, pos):
    total = c[(pos, True)] + c[(pos, False)]
    return f"{c[(pos, True)]}/{total} {c[(pos, True)] / total:.0%}" if total else "-"

main()
