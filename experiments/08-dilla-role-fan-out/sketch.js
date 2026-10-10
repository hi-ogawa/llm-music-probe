let seed = 1974;
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const jit = (a) => (rand() * 2 - 1) * a;
const n = (pitch, start, duration, velocity) => ({
  id: crypto.randomUUID(),
  pitch,
  start: Math.max(0, start),
  duration,
  velocity: Math.max(1, Math.min(127, Math.round(velocity))),
});

runtime.setTitle("Dilla Sketch");
runtime.setTempo(88);

const before = new Set(runtime.store.get().midiTracks.map((t) => t.id));
await runtime.addMidiTrack({ bank: 128, program: 8 }); // Room kit
await runtime.addMidiTrack({ bank: 0, program: 4 }); // Electric Piano 1 (Rhodes)
await runtime.addMidiTrack({ bank: 0, program: 33 }); // Fingered bass
const [drums, keys, bass] = runtime.store
  .get()
  .midiTracks.filter((t) => !before.has(t.id))
  .map((t) => t.id);
runtime.setTrackName({ id: drums, name: "Drums" });
runtime.setTrackName({ id: keys, name: "Rhodes" });
runtime.setTrackName({ id: bass, name: "Bass" });

// Bbmaj9 | Am11 | Dm9 | Gm9 C13
const chords = [
  { at: 0, len: 4, v: [50, 57, 60, 65], root: 34 },
  { at: 4, len: 4, v: [55, 60, 62, 64], root: 33 },
  { at: 8, len: 4, v: [53, 57, 60, 64], root: 38 },
  { at: 12, len: 2, v: [53, 57, 58, 62], root: 31 },
  { at: 14, len: 2, v: [52, 58, 62, 69], root: 36 },
];

const BARS = 8,
  keyNotes = [],
  bassNotes = [],
  drumNotes = [];
for (let pass = 0; pass < BARS / 4; pass++) {
  const off = pass * 16;
  for (const c of chords) {
    // Chopped-sample feel: a long hit, then a late stab
    const hits =
      c.len === 4
        ? [
            [0, 1.4, 92],
            [1.75, 0.6, 78],
            [3.5, 0.45, 70],
          ]
        : [
            [0, 1.2, 90],
            [1.5, 0.45, 72],
          ];
    for (const [t, d, vel] of hits) {
      const s = off + c.at + t + jit(0.025);
      c.v.forEach((p, i) =>
        keyNotes.push(n(p, s + i * 0.012, d, vel - i * 3 + jit(6))),
      );
    }
    // Bass that leans on the kick, slightly behind
    const b = off + c.at;
    bassNotes.push(n(c.root, b + 0.03, 0.9, 100));
    if (c.len === 4) {
      bassNotes.push(n(c.root + 12, b + 1.62, 0.25, 80));
      bassNotes.push(n(c.root, b + 2.55, 1.1, 95));
      bassNotes.push(n(c.root + 7, b + 3.72, 0.25, 78));
    } else {
      bassNotes.push(n(c.root, b + 1.55, 0.4, 88));
    }
  }
  for (let bar = 0; bar < 4; bar++) {
    const b = off + bar * 4;
    // Kicks: loose and swung, never quite on the grid
    const kicks = [
      [0, 112],
      [0.79, 84],
      [1.66, 96],
      [2.55, 104],
      [3.71, 76],
    ];
    if (bar === 3) {
      kicks.push([3.3, 88]);
    }
    for (const [t, v] of kicks) {
      drumNotes.push(n(36, b + t + jit(0.02), 0.25, v + jit(6)));
    }
    // Snare lazily late on 2 and 4, with ghosts
    for (const t of [1, 3]) {
      drumNotes.push(n(38, b + t + 0.045 + jit(0.01), 0.25, 108 + jit(5)));
    }
    drumNotes.push(n(38, b + 2.83 + jit(0.03), 0.15, 38 + jit(6)));
    if (bar % 2 === 1) {
      drumNotes.push(n(38, b + 3.6 + jit(0.03), 0.15, 34 + jit(6)));
    }
    // Hats: near-straight 8ths, hand-played velocity
    for (let i = 0; i < 8; i++) {
      const t = i * 0.5 + (i % 2 ? 0.02 : 0) + jit(0.018);
      const open = bar === 3 && i === 7;
      drumNotes.push(
        n(
          open ? 46 : 42,
          b + t,
          open ? 0.45 : 0.15,
          (i % 2 ? 58 : 82) + jit(10),
        ),
      );
    }
  }
}

runtime.setMidiTrackNotes(drums, drumNotes);
runtime.setMidiTrackNotes(keys, keyNotes);
runtime.setMidiTrackNotes(bass, bassNotes);
runtime.setTrackMix(keys, { gain: 0.75 });
runtime.setTrackMix(bass, { gain: 0.9 });
runtime.setLoop({ range: { startBeat: 0, endBeat: BARS * 4 }, enabled: true });
runtime.seek(0);
await runtime.play();
const s = runtime.store.get();
return {
  tempo: s.tempo,
  playing: s.isPlaying,
  tracks: s.midiTracks.map((t) => [
    t.name,
    t.bank ?? 0,
    t.program,
    t.notes.length,
  ]),
};
