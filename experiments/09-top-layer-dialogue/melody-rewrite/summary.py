# Bar-by-bar readable summary of the non-melody parts of 08, for a melody writer.
import json, sys
from collections import defaultdict
d = json.load(open(sys.argv[1]))
T = {t['name']: t['notes'] for t in d['midiTracks']}
NAMES = 'C C# D Eb E F F# G Ab A Bb B'.split()
nm = lambda p: f"{NAMES[p % 12]}{p // 12 - 1}"
sys.path.insert(0, '.')
spec = [("intro", 4), ("verseA", 8), ("bridgeB", 8), ("breakdown", 4), ("verseA2", 8), ("outro", 4)]
chords = json.load(open(sys.argv[2]))  # [[start, length, name], ...]
def pos(b):  # beat within bar as 1-based "beat.sixteenth" text, e.g. 2.5 -> "3", 2.75 -> "3a"
    q = round(b * 4) / 4; whole = int(q) + 1; frac = q - int(q)
    return str(whole) + {0: '', .25: 'e', .5: '&', .75: 'a'}[frac]
def bar_of(n): return int(round(n['start'] * 4) / 4 // 4)
def by_bar(notes, f=lambda n: True):
    out = defaultdict(list)
    for n in notes:
        if f(n): out[bar_of(n)].append(n)
    return out
kick = by_bar(T['Drums Standard'] + T['Drums Brush'] + T['Drums 808 Layer'], lambda n: n['pitch'] in (35, 36))
snare = by_bar(T['Drums Standard'] + T['Drums Brush'] + T['Drums 808 Layer'], lambda n: n['pitch'] in (38, 40, 39) and n['velocity'] >= 60)
bass = by_bar(T['Bass Fingered'] + T['Bass Synth'])
keys = defaultdict(list)
for n in T['Rhodes Keys']:  # group strummed chord hits by onset
    keys[bar_of(n)].append(n)
bar = 0
for name, bars in spec:
    print(f"\n## {name} (bars {bar + 1}-{bar + bars}, beats {bar * 4}-{(bar + bars) * 4})")
    for b in range(bar, bar + bars):
        ch = [c[2] + (f"@{pos(c[0] - b * 4)}" if c[0] != b * 4 else '') for c in chords if b * 4 <= c[0] < b * 4 + 4]
        hits = sorted({pos(round(n['start'] * 4) / 4 - b * 4) for n in keys[b]}, key=lambda s: (int(s.rstrip('ea&')), s))
        tops = {}
        for n in keys[b]:
            k = pos(round(n['start'] * 4) / 4 - b * 4); tops[k] = max(tops.get(k, 0), n['pitch'])
        sk = lambda s: (int(s.rstrip('ea&')), 'xe&a'.index(s[-1]) if s[-1] in 'e&a' else 0)
        line = lambda notes: ' '.join(sorted({pos(round(n['start'] * 4) / 4 - b * 4) for n in notes}, key=sk)) or '-'
        print(f"bar {b + 1:2} | {' '.join(ch) or '(same chord)':24} | keys: {' '.join(f'{k}({nm(tops[k])})' for k in sorted(tops, key=sk)) or '-'}")
        print(f"       kick: {line(kick[b])} | snare: {line(snare[b])} | bass: {' '.join(f'{pos(round(n['start'] * 4) / 4 - b * 4)}:{nm(n['pitch'])}' for n in sorted(bass[b], key=lambda n: n['start'])) or '-'}")
    bar += bars
