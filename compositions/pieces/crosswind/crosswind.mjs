// Writes project.json: a slow D Dorian piece demoing per-layer synth pan.
import { writeFileSync } from "node:fs";

const BAR = 4;
const at = (bar, beat = 0) => (bar - 1) * BAR + beat;

const N = {
  F4: 65, G4: 67, A4: 69, BB4: 70, B4: 71, C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81,
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

// Keys: an electric-piano-like patch, a sine body with a soft triangle "tine" an
// octave up, both struck and decaying. Centered, so A stays narrow.
const keysSynth = {
  layers: [
    {
      oscillator: { waveform: "sine", octave: 0, detune: 0 },
      gain: 0.7,
      pan: 0,
      amp: { envelope: { attack: 0.004, decay: 1.2, sustain: 0.35, release: 0.4 } },
    },
    {
      oscillator: { waveform: "triangle", octave: 1, detune: 0 },
      gain: 0.15,
      pan: 0,
      amp: { envelope: { attack: 0.002, decay: 0.35, sustain: 0.05, release: 0.3 } },
    },
  ],
};

// Answer: a soft sine leaning left with a quiet triangle an octave up nearer the center.
// The pluck's sustained bloom makes it lean right, so the answer replies from the left
// and balances it.
const answerSynth = {
  layers: [
    {
      oscillator: { waveform: "sine", octave: 0, detune: 0 },
      gain: 1.1,
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

// Melody: a one-bar hook traded bar by bar. The pluck calls, and the answer replies
// in the next bar in the same rhythm with the contour turned over, so the reply is
// audibly about the call. Every call opens on the same A–C head, and the peaks climb
// E → F → G across the phrase before falling back. In each phrase's last bar the
// pluck goes on unanswered, rising B–C–D into Dm, which closes the phrase.

// Syncopated cell on the 16th grid: two dotted eighths, a held note, then a pickup
// into a held note. [beat offset, duration]
const CELL = [
  [0, 0.75],
  [0.75, 0.75],
  [1.5, 1],
  [2.5, 0.5],
  [3, 1],
];
const CALL_VELOCITIES = [84, 76, 92, 74, 80];
const REPLY_VELOCITIES = [80, 72, 86, 70, 76];
// A′'s doubled thirds sit under the voice they double.
const HARMONY_VELOCITIES = [62, 56, 68, 54, 60];

// Calls over Dm9, B♭maj7, Fmaj7, C/E; replies over the first three.
const CALLS = [
  [N.A4, N.C5, N.E5, N.D5, N.C5],
  [N.A4, N.C5, N.F5, N.D5, N.C5],
  [N.A4, N.C5, N.G5, N.E5, N.D5],
  [N.G4, N.C5, N.E5, N.D5, N.C5],
];
const REPLIES = [
  [N.C5, N.A4, N.G4, N.A4, N.F4],
  [N.D5, N.C5, N.BB4, N.C5, N.A4],
  [N.E5, N.D5, N.C5, N.D5, N.A4],
];
// B's call over Fmaj7 reaches A5 instead, and its C/E call G5.
const CALLS_B = [CALLS[0], CALLS[1], [N.A4, N.C5, N.A5, N.G5, N.E5], [N.G4, N.C5, N.G5, N.E5, N.D5]];
// The unanswered last bar: up through the Dorian B into D.
const cadence = (holdD) => [
  [0, N.B4, 0.75, 78],
  [0.75, N.C5, 0.75, 82],
  [1.5, N.D5, holdD, 90],
];

const playCell = (notes, bar, pitches, velocities) =>
  CELL.forEach(([offset, duration], i) =>
    notes.push({ pitch: pitches[i], start: at(bar) + offset, duration, velocity: velocities[i] }),
  );
const playShape = (notes, bar, shape) =>
  shape.forEach(([offset, pitch, duration, velocity]) =>
    notes.push({ pitch, start: at(bar) + offset, duration, velocity }),
  );

// Diatonic shifts in D Dorian, with B♭ in place of B over B♭maj7, for A′'s thirds.
const DORIAN_PCS = [2, 4, 5, 7, 9, 11, 0];
const scaleFor = (bar) => {
  const flatB = Math.floor((bar - 1) / 2) % 4 === 1;
  const pcs = DORIAN_PCS.map((pc) => (flatB && pc === 11 ? 10 : pc));
  const pitches = [];
  for (let pitch = 48; pitch <= 96; pitch++) if (pcs.includes(pitch % 12)) pitches.push(pitch);
  return pitches;
};
const shiftThird = (pitches, bar, direction) => {
  const scale = scaleFor(bar);
  return pitches.map((pitch) => scale[scale.indexOf(pitch) + 2 * direction]);
};

const pluckNotes = [];
const answerNotes = [];
// One 8-bar phrase from `startBar`. In A′ the two voices join: the answer doubles
// each call a third below, and the pluck doubles each reply a third above.
const playPhrase = (startBar, calls, together) => {
  calls.forEach((call, i) => {
    const callBar = startBar + 2 * i;
    playCell(pluckNotes, callBar, call, CALL_VELOCITIES);
    if (together) playCell(answerNotes, callBar, shiftThird(call, callBar, -1), HARMONY_VELOCITIES);
    if (i < 3) {
      const replyBar = callBar + 1;
      playCell(answerNotes, replyBar, REPLIES[i], REPLY_VELOCITIES);
      if (together) playCell(pluckNotes, replyBar, shiftThird(REPLIES[i], replyBar, 1), HARMONY_VELOCITIES);
    }
  });
  const cadenceBar = startBar + 7;
  const last = startBar === 17;
  playShape(pluckNotes, cadenceBar, cadence(last ? 4.5 : 2.5));
  if (together) {
    playShape(answerNotes, cadenceBar, [
      [0, N.G4, 0.75, 70],
      [0.75, N.A4, 0.75, 74],
      [1.5, N.B4, 4.5, 80],
    ]);
  }
};
playPhrase(1, CALLS, false);
playPhrase(9, CALLS_B, false);
playPhrase(17, CALLS, true);

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

// Keys comping the chords from bar 1, so the melody and
// bass have harmony under them before the wide pad arrives. Hits on 1, the "and" of
// 2 as a push, and a short stab on 4, voiced below the melody.
const keysNotes = [];
for (let bar = 1; bar <= 24; bar++) {
  const chord = CYCLE[Math.floor((bar - 1) / 2) % 4];
  const firstOfChord = (bar - 1) % 2 === 0;
  const hits = firstOfChord
    ? [
        [0, 1.4, 64],
        [1.5, 0.9, 54],
        [3, 0.4, 50],
      ]
    : [
        [0.5, 1, 56],
        [2.5, 0.9, 52],
      ];
  for (const [offset, duration, velocity] of hits) {
    for (const pitch of chord.pad) {
      keysNotes.push({ pitch, start: at(bar) + offset, duration, velocity });
    }
  }
}

// Drums, all centered on GeneralUser GS's TR-808 kit: maracas alone through bar 4,
// kick and rim from bar 5, hats and a soft clap on 4 from B, and a short rim
// pickup into A′. They stop for the coda.
const KICK = 36;
const RIM = 37;
const CLAP = 39;
const CLOSED_HAT = 42;
const MARACAS = 70;
const drumNotes = [];
const hit = (bar, beat, pitch, velocity) =>
  drumNotes.push({ pitch, start: at(bar, beat), duration: 0.25, velocity: Math.round(velocity * 1.25) });
for (let bar = 1; bar <= 24; bar++) {
  for (let step = 0; step < 16; step++) {
    hit(bar, step / 4, MARACAS, step % 4 === 2 ? 46 : step % 2 === 0 ? 36 : 26);
  }
  if (bar < 5) continue;
  hit(bar, 0, KICK, 84);
  hit(bar, 2.5, KICK, 70);
  hit(bar, 1, RIM, 58);
  hit(bar, 3, RIM, 62);
  if (bar < 9) continue;
  hit(bar, 1.75, KICK, 56);
  hit(bar, 3, CLAP, 50);
  for (let eighth = 0; eighth < 8; eighth++) {
    hit(bar, eighth / 2, CLOSED_HAT, eighth % 2 === 0 ? 50 : 38);
  }
  if (bar === 16) {
    for (const beat of [3.25, 3.5, 3.75]) hit(bar, beat, RIM, 48 + beat * 4);
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
    "- **Keys:** an electric-piano-like synth patch at the center, comping the chords from bar 1.",
    "- **Answer:** a soft sine leaning left that replies to each call in the next bar, in the call's rhythm, then doubles it in thirds in A′.",
    "- **Bass:** a sine an octave down and a soft triangle, both centered, moving from bar 5.",
    "- **Drums:** a centered downtempo groove on the TR-808 kit that builds from lone maracas.",
    "",
    "Form: A (1–8) pluck, answer, bass, and drums building, B (9–16) pad enters, A′ (17–24) the two voices join in thirds over the full texture, Coda (25–32) pad alone, fading with CC 11.",
  ].join("\n"),
  tempo: 72,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 0.85,
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
      name: "Keys",
      program: 0,
      synth: keysSynth,
      gain: 1.5,
      pan: 0,
      muted: false,
      soloed: false,
      keySignature: { fifths: 0, mode: "minor" },
      notes: keysNotes,
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
      program: 25,
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
