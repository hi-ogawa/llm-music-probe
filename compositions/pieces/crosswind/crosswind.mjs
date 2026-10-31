// Writes project.json: a slow D Dorian piece demoing per-layer synth pan.
import { writeFileSync } from "node:fs";

const BAR = 4;
const at = (bar, beat = 0) => (bar - 1) * BAR + beat;

const N = {
  C4: 60, E4: 64, F4: 65, G4: 67, A4: 69, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81,
};

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

// Answer: a soft sine leaning left with a quiet triangle an octave up nearer the center.
// The pluck's sustained bloom makes it lean right, so the answer replies from the left
// and balances it.
const answerSynth = {
  layers: [
    {
      oscillator: { waveform: "sine", octave: 0, detune: 0 },
      gain: 0.8,
      pan: -0.45,
      amp: { envelope: { attack: 0.02, decay: 0.5, sustain: 0.55, release: 0.9 } },
    },
    {
      oscillator: { waveform: "triangle", octave: 1, detune: 0 },
      gain: 0.12,
      pan: -0.2,
      amp: { envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.6 } },
    },
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
  // `fifth` and `approach` (a step into the next chord's root) shape the moving bass.
  { name: "Dm9", bass: 50, fifth: 45, approach: 48, pad: [53, 57, 60, 64] }, // F A C E
  { name: "B♭maj7", bass: 46, fifth: 53, approach: 52, pad: [53, 58, 62, 69] }, // F B♭ D A
  { name: "Fmaj7", bass: 53, fifth: 48, approach: 50, pad: [52, 57, 60, 65] }, // E A C F
  { name: "C/E", bass: 52, fifth: 47, approach: 49, pad: [52, 55, 60, 64] }, // E G C E
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

// Answers fill the bars the motif leaves empty, then harmonize it in A′.
// Over B♭maj7: rise and fall back to A, answering the call's open C.
const answerRise = [
  [0.5, N.F4, 1, 62],
  [1.5, N.A4, 1, 66],
  [2.5, N.D5, 1.5, 72],
  [4, N.C5, 1, 64],
  [5, N.A4, 2.5, 60],
];
// Over C/E: up to the Dorian B and down onto A, which leads into Dm.
const answerTurn = [
  [0.5, N.G4, 1, 62],
  [1.5, N.C5, 1, 68],
  [2.5, N.B4, 1.5, 70],
  [4, N.G4, 1, 62],
  [5, N.A4, 2.5, 60],
];
// B's busier answer over B♭maj7, climbing back to D.
const answerRun = [
  [0, N.D5, 0.5, 70],
  [0.5, N.C5, 0.5, 64],
  [1, N.A4, 1, 66],
  [2, N.F4, 1, 62],
  [3, N.A4, 1, 66],
  [4, N.C5, 1.5, 70],
  [6, N.D5, 2, 66],
];
// Over C/E: a stepwise descent from E onto A, into A′.
const answerDescent = [
  [0.5, N.E5, 1, 72],
  [1.5, N.D5, 1, 68],
  [2.5, N.C5, 1, 66],
  [3.5, N.B4, 1, 64],
  [4.5, N.G4, 1, 62],
  [5.5, N.A4, 2.5, 64],
];
// A′ harmonies: the call a diatonic third below, the inversion a sixth below,
// and the closing fragment a sixth below.
const harmonyCall = [
  [0, N.F4, 1, 66],
  [1.5, N.B4, 1, 62],
  [3, N.C5, 1.5, 70],
  [5, N.G4, 1, 58],
  [6, N.A4, 2, 64],
];
const harmonyInversion = [
  [0, N.B4, 1, 70],
  [1.5, N.F4, 1, 62],
  [3, N.E4, 1.5, 64],
  [5, N.A4, 1, 66],
  [6, N.G4, 2.5, 64],
];
const harmonyFragment = [
  [0, N.C4, 1, 60],
  [1.5, N.F4, 1, 58],
  [3, N.G4, 4, 64],
];

const answerPhrases = [
  [3, answerRise],
  [7, answerTurn],
  [11, answerRun],
  [15, answerDescent],
  [17, harmonyCall],
  [21, harmonyInversion],
  [23, harmonyFragment],
];

const toNotes = (phrases) =>
  phrases.flatMap(([bar, shape]) =>
    shape.map(([offset, pitch, duration, velocity]) => ({ pitch, start: at(bar) + offset, duration, velocity })),
  );
const answerNotes = toNotes(answerPhrases);

const pluckNotes = toNotes(pluckPhrases);

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
// Bass: half notes on roots through bar 4, then a moving figure from bar 5:
// root with a push on the "and" of 2, the fifth, and a step into the next chord.
for (let bar = 1; bar <= 24; bar++) {
  const chord = CYCLE[Math.floor((bar - 1) / 2) % 4];
  const firstOfChord = (bar - 1) % 2 === 0;
  const figure =
    bar <= 4
      ? [
          [0, chord.bass, 1.9, firstOfChord ? 76 : 66],
          [2, chord.bass, 1.9, 62],
        ]
      : firstOfChord
        ? [
            [0, chord.bass, 1.25, 80],
            [1.5, chord.bass, 0.4, 62],
            [2.5, chord.fifth, 1.4, 70],
          ]
        : [
            [0, chord.bass, 1.5, 72],
            [2, chord.fifth, 0.9, 62],
            [3, chord.approach, 0.9, 68],
          ];
  for (const [offset, pitch, duration, velocity] of figure) {
    bassNotes.push({ pitch, start: at(bar) + offset, duration, velocity });
  }
}

// Drums, all centered on GeneralUser GS's Standard kit: a shaker alone through
// bar 4, kick and side stick from bar 5, hats and a soft snare from B, and a
// short snare pickup into A′. They stop for the coda.
const KICK = 36;
const SIDE_STICK = 37;
const SNARE = 38;
const CLOSED_HAT = 42;
const SHAKER = 82;
const drumNotes = [];
const hit = (bar, beat, pitch, velocity) =>
  drumNotes.push({ pitch, start: at(bar, beat), duration: 0.25, velocity: Math.round(velocity * 1.25) });
for (let bar = 1; bar <= 24; bar++) {
  for (let step = 0; step < 16; step++) {
    hit(bar, step / 4, SHAKER, step % 4 === 2 ? 46 : step % 2 === 0 ? 36 : 26);
  }
  if (bar < 5) continue;
  hit(bar, 0, KICK, 84);
  hit(bar, 2.5, KICK, 70);
  if (bar < 9) {
    hit(bar, 1, SIDE_STICK, 58);
    hit(bar, 3, SIDE_STICK, 62);
    continue;
  }
  hit(bar, 1.75, KICK, 56);
  hit(bar, 1, SNARE, 60);
  hit(bar, 3, SNARE, 66);
  for (let eighth = 0; eighth < 8; eighth++) {
    hit(bar, eighth / 2, CLOSED_HAT, eighth % 2 === 0 ? 50 : 38);
  }
  if (bar === 16) {
    for (const beat of [3.25, 3.5, 3.75]) hit(bar, beat, SNARE, 48 + beat * 4);
  }
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
    "- **Answer:** a soft sine leaning left that replies in the motif's gaps, then harmonizes it in A′.",
    "- **Bass:** a sine an octave down and a soft triangle, both centered, moving from bar 5.",
    "- **Drums:** a centered downtempo groove that builds from a lone shaker.",
    "",
    "Form: A (1–8) pluck, answer, bass, and drums building, B (9–16) pad enters, A′ (17–24) the motif is harmonized and inverted over the full texture, Coda (25–32) pad alone, fading with CC 11.",
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
      name: "Answer",
      program: 0,
      synth: answerSynth,
      gain: 2,
      pan: 0,
      muted: false,
      soloed: false,
      keySignature: { fifths: 0, mode: "minor" },
      notes: answerNotes,
    },
    {
      name: "Bass",
      program: 0,
      synth: bassSynth,
      gain: 1.1,
      pan: 0,
      muted: false,
      soloed: false,
      keySignature: { fifths: 0, mode: "minor" },
      notes: bassNotes,
    },
    {
      name: "Drums",
      program: 0,
      bank: 128,
      gain: 1.4,
      pan: 0,
      muted: false,
      soloed: false,
      keySignature: { fifths: 0, mode: "minor" },
      notes: drumNotes,
    },
  ],
};

writeFileSync(new URL("./project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
