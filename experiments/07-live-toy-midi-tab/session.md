# Session log

Every script the agent ran in the page through `webmcp-bridge execute-tool toy_midi_eval`, with its result, in order. Listener prompts are verbatim. Read-only checks, playback, and looping are left out, because they wrote nothing.

## 1. Composing

Prompt: "just created empty new project. can you compose something?"

```js
const V = {
  Gmaj7: [55, 59, 62, 66],
  A7: [55, 61, 64, 69],
  A7sus4: [55, 62, 64, 69],
  Fsm7: [57, 61, 64, 66],
  Bm7: [57, 62, 66, 71],
  Em7: [55, 59, 62, 64],
  Dmaj7: [57, 61, 62, 66],
};
const ROOT = {
  Gmaj7: 43,
  A7: 45,
  A7sus4: 45,
  Fsm7: 42,
  Bm7: 47,
  Em7: 40,
  Dmaj7: 38,
};
// [chord for beats 0-2, chord for beats 2-4]
const prog = [
  ["Gmaj7"],
  ["A7"],
  ["Fsm7"],
  ["Bm7"],
  ["Em7"],
  ["A7"],
  ["Dmaj7"],
  ["A7sus4", "A7"],
];
const bars = [...prog, ...prog.slice(0, 7), ["Dmaj7", "Dmaj7", "end"]];

const mel = [
  [
    [0.5, 0.5, 78],
    [1, 0.5, 81],
    [1.5, 1, 83],
    [2.5, 0.5, 81],
    [3, 1, 78],
  ],
  [
    [0, 1.5, 76],
    [1.5, 0.5, 73],
    [2, 0.5, 76],
    [2.5, 1.5, 79],
  ],
  [
    [0, 0.5, 78],
    [0.5, 0.5, 76],
    [1, 1.5, 73],
    [2.5, 0.5, 76],
    [3, 1, 78],
  ],
  [
    [0, 2.5, 81],
    [2.5, 0.5, 78],
    [3, 0.5, 76],
    [3.5, 0.5, 74],
  ],
  [
    [0, 1, 74],
    [1, 0.5, 76],
    [1.5, 1, 79],
    [2.5, 0.5, 83],
    [3, 1, 81],
  ],
  [
    [0, 1, 79],
    [1, 0.5, 76],
    [1.5, 1.5, 73],
    [3, 0.5, 76],
    [3.5, 0.5, 78],
  ],
  [
    [0, 1, 78],
    [1, 0.5, 81],
    [1.5, 2.5, 85],
  ],
  [
    [2, 0.5, 81],
    [2.5, 0.5, 83],
    [3, 0.5, 81],
    [3.5, 0.5, 78],
  ],
];
const melody = [...mel, ...mel.slice(0, 7), [[0, 4, 86]]];

const note = (pitch, start, duration, velocity) => ({
  id: crypto.randomUUID(),
  pitch,
  start,
  duration,
  velocity,
});
const keys = [],
  bass = [],
  lead = [],
  pad = [];
bars.forEach(([a, b = a, end], i) => {
  const t = i * 4;
  if (end) {
    V[a].forEach((p) => keys.push(note(p, t, 4, 72)));
    bass.push(note(ROOT[a], t, 4, 95));
  } else {
    for (const [s, d] of [
      [0, 1.4],
      [1.5, 0.4],
      [2.5, 1.4],
    ])
      V[s < 2 ? a : b].forEach((p) =>
        keys.push(note(p, t + s, d, s === 0 ? 74 : 64)),
      );
    const r = ROOT[a],
      r2 = ROOT[b];
    const next = ROOT[bars[i + 1]?.[0]] ?? r;
    bass.push(
      note(r, t, 1.5, 100),
      note(r, t + 1.5, 0.5, 80),
      note(r2 + 7, t + 2, 1, 90),
      note(r2 + 12, t + 3, 0.5, 85),
      note(next - 1, t + 3.5, 0.5, 80),
    );
  }
  if (i >= 8) V[a].forEach((p) => pad.push(note(p + 12, t, end ? 4 : 3.9, 50)));
  melody[i].forEach(([s, d, p]) => lead.push(note(p, t + s, d, 92)));
});

runtime.setTitle("Sunset Drive");
runtime.setTempo(96);
const parts = [
  ["Keys", 4, keys],
  ["Bass", 33, bass],
  ["Lead", 73, lead],
  ["Pad", 89, pad],
];
for (const [name, program, notes] of parts) {
  const before = new Set(runtime.store.get().midiTracks.map((t) => t.id));
  await runtime.addMidiTrack({ program });
  const id = runtime.store.get().midiTracks.find((t) => !before.has(t.id)).id;
  runtime.setTrackName({ id, name });
  runtime.setMidiTrackSettings(id, {
    keySignature: { fifths: 2, mode: "major" },
  });
  runtime.setMidiTrackNotes(id, notes);
}
runtime.updateLocator({ id: runtime.addLocator(0), label: "A" });
runtime.updateLocator({ id: runtime.addLocator(32), label: "A'" });
```

Result: four tracks, Keys 184 notes, Bass 76, Lead 67, Pad 32, tempo 96, locators A at beat 0 and A' at beat 32.

## 2. Tab, first request

Prompt: "do you have tab too?"

The Bass track's default tuning was `[43, 38, 33, 28, 23]` (G D A E B, highest first), with bass pitches from 37 to 59.

### 2a. Greedy, 15-fret limit

Each note took the string whose fret was closest to the previous note's fret, with a penalty of 3 on the B string, frets 0 to 15. It threw `TypeError: Cannot read properties of undefined (reading 'fret')` on pitch 59, which is fret 16 on the G string, so nothing was written.

### 2b. Greedy, 20-fret limit

Same as 2a with frets 0 to 20. Written, and tab display turned on.

```
bar 1: D5 D5 G7 G12 A11
bar 2: A12 A12 D14 G14 E13
bar 3: E14 E14 A16 D16 E18
bar 4: E19 E19 D16 G16 B16
bar 5: E12 E12 A14 D14 E16
bar 6: E17 E17 A19 D19 B14
bar 7: E10 E10 A12 D12 A11
bar 8: A12 A12 D14 G14 E14
bar 16: E10
```

### 2c. Whole-line search

Viterbi over string choices, with cost equal to fret movement (zero to or from an open string) plus 0.3 per fret plus 2 for the B string.

```
bar 1: G0 G0 D12 G12 A11
bar 2: A12 A12 D14 G14 E13
bar 3: A9 A9 D11 G11 D8
bar 4: D9 D9 G11 G16 E11
bar 5: A7 A7 D9 G9 D6
bar 6: D7 D7 G9 G14 B14
bar 7: D0 D0 D7 G7 D6
bar 8: D7 D7 G9 G14 E14
bar 16: D0
```

### 2d. Hand-position search

Viterbi over hand positions, where a fretted note must fall within the position and the three frets above it, with cost 2 plus 0.3 per fret for a shift, 0.2 per position fret, and 1 for the B string.

```
bar 1: G0 G0 D12 G12 A11
bar 2: A12 A12 G9 G14 A8
bar 3: A9 A9 D11 G11 D8
bar 4: D9 D9 G11 G16 A6
bar 5: A7 A7 D9 G9 D6
bar 6: D7 D7 G9 G14 A4
bar 7: D0 D0 D7 G7 D6
bar 8: D7 D7 D14 G14 E14
bar 16: D0
```

## 3. Register

Prompts, in order: "isn't bass octave high? intended?", "just dropping sounds just fine?", "5 string is fine"

Every bass note was moved down 12 semitones, and the 2d search was run again without the B-string penalty. Range 25 to 47, highest fret 4.

```
bar 1: E3 E3 D0 G0 E4
bar 2: A0 A0 D2 G2 E1
bar 3: E2 E2 A4 D4 A1
bar 4: A2 A2 D4 G4 B4
bar 5: E0 E0 A2 D2 E4
bar 6: A0 A0 D2 G2 B2
bar 7: B3 B3 A0 D0 E4
bar 8: A0 A0 D2 G2 E2
bar 15: B3 B3 A0 D0 B2
bar 16: B3
```

## 4. Tab, second request

Prompt: "isn't tab awkward? or you don't have much intuition?"

The search was replaced by the root, fifth, octave box shape written as a rule. The root takes its lowest fret from 0 to 5, using the B string only when no other string reaches. The fifth goes on the next string up and the octave two strings up, and the approach note goes on the string whose fret is closest to the root's.

```js
const t = runtime.store.get().midiTracks.find((t) => t.name === "Bass");
const open = t.tabOpenStringPitches; // index 0 = string 1 (G)
const fretOn = (pitch, s) => pitch - open[s - 1];
const notes = [];
for (let b = 0; b < 16; b++) {
  const bar = t.notes
    .filter((n) => n.start >= b * 4 && n.start < b * 4 + 4)
    .sort((x, y) => x.start - y.start);
  // Root on the lowest fret, using the B string only when nothing else reaches.
  const root = bar[0].pitch;
  const cands = [1, 2, 3, 4, 5].filter(
    (s) => fretOn(root, s) >= 0 && fretOn(root, s) <= 5,
  );
  const rs =
    cands
      .filter((s) => s !== 5)
      .sort((x, y) => fretOn(root, x) - fretOn(root, y))[0] ?? 5;
  const rf = fretOn(root, rs);
  bar.forEach((n, i) => {
    let s;
    if (i <= 1 || (i === 3 && bar.length < 5)) s = rs;
    else if (i === 2)
      s = rs - 1; // fifth: next string, two frets up
    else if (i === 3)
      s = rs - 2; // octave: two strings, two frets up
    else
      s = [1, 2, 3, 4, 5]
        .filter((x) => fretOn(n.pitch, x) >= 0)
        .sort(
          (x, y) =>
            Math.abs(fretOn(n.pitch, x) - rf) -
            Math.abs(fretOn(n.pitch, y) - rf),
        )[0];
    notes.push({ ...n, tabString: s });
  });
}
const bad = notes.filter((n) => fretOn(n.pitch, n.tabString) < 0);
if (bad.length) throw new Error(`unplayable: ${JSON.stringify(bad)}`);
runtime.setMidiTrackNotes(t.id, notes);
```

Result, which is the final tab in [project-state.json](project-state.json):

```
bar 1: E3 E3 A5 D5 E4
bar 2: A0 A0 D2 G2 E1
bar 3: E2 E2 A4 D4 A1
bar 4: A2 A2 D4 G4 B4
bar 5: E0 E0 A2 D2 E4
bar 6: A0 A0 D2 G2 B2
bar 7: B3 B3 E5 A5 E4
bar 8: A0 A0 D2 G2 E2
bar 15: B3 B3 E5 A5 B2
bar 16: B3
```

Listener reply: "very cool nontheless."
