// Writes project.json: a slow D Dorian piece demoing per-layer synth pan.
import { writeFileSync } from "node:fs";

const BAR = 4;
const at = (bar, beat = 0) => (bar - 1) * BAR + beat;

const N = { G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81 };

// Travelling pluck: each note strikes left (short saw) and blooms right (slow triangle).
const pluckSynth = {
  layers: [
    {
      oscillator: { waveform: "sawtooth", octave: 0, detune: 0 },
      gain: 0.36,
      pan: -0.65,
      amp: { envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.15 } },
    },
    {
      oscillator: { waveform: "triangle", octave: 0, detune: 0 },
      gain: 0.8,
      pan: 0.65,
      amp: { envelope: { attack: 0.4, decay: 0.6, sustain: 0.85, release: 2.0 } },
    },
  ],
};

// Pad: two saws detuned apart and panned apart, so the width is real.
const padEnvelope = { attack: 1.6, decay: 1.2, sustain: 0.8, release: 3.0 };
const padSynth = {
  layers: [
    { oscillator: { waveform: "sawtooth", octave: 0, detune: -8 }, gain: 0.5, pan: -0.7, amp: { envelope: padEnvelope } },
    { oscillator: { waveform: "sawtooth", octave: 0, detune: 8 }, gain: 0.5, pan: 0.7, amp: { envelope: padEnvelope } },
  ],
};

// Bass: sine an octave below the written note, triangle at the written note, both centered.
const bassSynth = {
  layers: [
    {
      oscillator: { waveform: "sine", octave: -1, detune: 0 },
      gain: 0.9,
      pan: 0,
      amp: { envelope: { attack: 0.06, decay: 0.4, sustain: 0.9, release: 0.8 } },
    },
    {
      oscillator: { waveform: "triangle", octave: 0, detune: 0 },
      gain: 0.2,
      pan: 0,
      amp: { envelope: { attack: 0.08, decay: 0.6, sustain: 0.5, release: 0.6 } },
    },
  ],
};

// Chord cycle, two bars each: Dm9 → B♭maj7 → Fmaj7 → C/E.
const CYCLE = [
  { name: "Dm9", bass: 50, pad: [53, 57, 60, 64] }, // F A C E
  { name: "B♭maj7", bass: 46, pad: [53, 58, 62, 69] }, // F B♭ D A
  { name: "Fmaj7", bass: 53, pad: [52, 57, 60, 65] }, // E A C F
  { name: "C/E", bass: 52, pad: [52, 55, 60, 64] }, // E G C E
];
const CODA = [CYCLE[0], CYCLE[1], CYCLE[2], CYCLE[0]];

// Motif shapes as [beat offset, pitch, duration, velocity].
// Call: up a fourth, up a step, fall to the Dorian B, lean up to C.
const call = [
  [0, N.A4, 1, 84],
  [1.5, N.D5, 1, 78],
  [3, N.E5, 1.5, 90],
  [5, N.B4, 1, 72],
  [6, N.C5, 2, 80],
];
// Same opening, settling down onto A instead of hanging on C.
const callSettled = [
  [0, N.A4, 1, 80],
  [1.5, N.D5, 1, 76],
  [3, N.E5, 1.5, 86],
  [5, N.C5, 1, 72],
  [6, N.A4, 2, 74],
];
// Tighter rhythm so the right-side blooms overlap and smear.
const callClose = [
  [0, N.A4, 1.5, 82],
  [1, N.D5, 1.5, 78],
  [2, N.E5, 2, 90],
  [4.5, N.B4, 1.5, 70],
  [5.5, N.C5, 2.5, 78],
];
// Reaching variation: leaps to the peak A5 and falls to G.
const callPeak = [
  [0, N.A4, 1, 80],
  [1.5, N.D5, 1, 80],
  [3, N.E5, 1, 86],
  [4, N.A5, 2, 96],
  [6, N.G5, 2, 78],
];
// Inversion of the call (−4th, −step, +4th, −step), from G5 over Fmaj7.
const inversion = [
  [0, N.G5, 1, 90],
  [1.5, N.D5, 1, 78],
  [3, N.C5, 1.5, 80],
  [5, N.F5, 1, 84],
  [6, N.E5, 2.5, 80],
];
// Two-note echo over B♭maj7.
const echo = [
  [1.5, N.F5, 1.5, 70],
  [4, N.D5, 2, 66],
];
// The call's first three notes, left hanging on E into the coda.
const fragment = [
  [0, N.A4, 1, 76],
  [1.5, N.D5, 1, 72],
  [3, N.E5, 4, 80],
];

const pluckPhrases = [
  // A: pluck and bass only.
  [1, call],
  [5, callSettled],
  // B: the pad enters.
  [9, callClose],
  [13, callPeak],
  // A′: call, echo, and the inverted answer.
  [17, call],
  [19, echo],
  [21, inversion],
  [23, fragment],
];

const pluckNotes = pluckPhrases.flatMap(([bar, shape]) =>
  shape.map(([offset, pitch, duration, velocity]) => ({ pitch, start: at(bar) + offset, duration, velocity })),
);

const padNotes = [];
const bassNotes = [];
// Pad: bars 9–24 cycle twice, then the coda's own progression.
for (let i = 0; i < 12; i++) {
  const bar = 9 + i * 2;
  const chord = i < 8 ? CYCLE[i % 4] : CODA[i - 8];
  const velocity = i < 2 ? 56 : 64;
  for (const pitch of chord.pad) {
    padNotes.push({ pitch, start: at(bar), duration: i === 11 ? 8 : 7.9, velocity });
  }
}
// Bass: whole notes on roots, bars 1–24.
for (let bar = 1; bar <= 24; bar++) {
  const chord = CYCLE[Math.floor((bar - 1) / 2) % 4];
  const firstOfChord = (bar - 1) % 2 === 0;
  bassNotes.push({ pitch: chord.bass, start: at(bar), duration: 3.9, velocity: firstOfChord ? 76 : 62 });
}

// Pad expression: steady until the coda, then a fade to silence by the end.
const expression = [{ beat: 0, value: 100 }];
for (let beat = at(25); beat <= at(33); beat += 1) {
  const t = (beat - at(25)) / (at(33) - at(25));
  expression.push({ beat, value: Math.round(100 * (1 - t)) });
}

const project = {
  title: "Crosswind",
  comment: [
    "# Crosswind",
    "",
    "A demo of per-layer synth pan. D Dorian, 72 BPM, 32 bars.",
    "",
    "- **Pluck:** a short sawtooth panned left and a slow triangle panned right, so each note strikes left and blooms right.",
    "- **Pad:** two sawtooths detuned ±8 cents and panned ±0.7; its entry at bar 9 opens the width.",
    "- **Bass:** a sine an octave down and a soft triangle, both centered.",
    "",
    "Form: A (1–8) pluck and bass, B (9–16) pad enters, A′ (17–24) the motif is inverted over the full texture, Coda (25–32) pad alone, fading with CC 11.",
  ].join("\n"),
  tempo: 72,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 1,
  loop: { range: { startBeat: 0, endBeat: at(33) }, enabled: true },
  locators: [
    { beat: at(1), label: "A" },
    { beat: at(9), label: "B" },
    { beat: at(17), label: "A′" },
    { beat: at(25), label: "Coda" },
  ],
  midiTracks: [
    {
      name: "Travelling pluck",
      program: 0,
      synth: pluckSynth,
      gain: 2,
      pan: 0,
      muted: false,
      soloed: false,
      keySignature: { fifths: 0, mode: "minor" },
      notes: pluckNotes,
    },
    {
      name: "Pad",
      program: 0,
      synth: padSynth,
      gain: 1.9,
      pan: 0,
      muted: false,
      soloed: false,
      keySignature: { fifths: 0, mode: "minor" },
      automation: [{ type: "controller", controller: 11, points: expression }],
      notes: padNotes,
    },
    {
      name: "Bass",
      program: 0,
      synth: bassSynth,
      gain: 1.8,
      pan: 0,
      muted: false,
      soloed: false,
      keySignature: { fifths: 0, mode: "minor" },
      notes: bassNotes,
    },
  ],
};

writeFileSync(new URL("./project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
