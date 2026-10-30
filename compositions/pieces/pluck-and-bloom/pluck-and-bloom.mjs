import { writeFileSync } from "node:fs";

const BAR = 4;
const BARS = 8;

// D minor, one chord per bar. `pad` is the centerpiece's voicing, `arp` the
// four tones the arpeggio cycles through, `root` the bass note.
const CHORDS = [
  { name: "Dm9", root: 38, pad: [53, 57, 60, 64], arp: [62, 65, 69, 72] },
  { name: "Bbmaj7", root: 34, pad: [53, 57, 58, 62], arp: [58, 62, 65, 69] },
  { name: "Gm9", root: 31, pad: [57, 58, 62, 65], arp: [62, 65, 67, 70] },
  { name: "A7sus4", root: 33, pad: [55, 57, 62, 64], arp: [62, 64, 67, 69] },
  { name: "Dm9", root: 38, pad: [53, 57, 60, 64], arp: [62, 65, 69, 72] },
  { name: "Bbmaj7", root: 34, pad: [53, 57, 58, 62], arp: [58, 62, 65, 69] },
  { name: "Fmaj7", root: 29, pad: [53, 57, 60, 64], arp: [60, 64, 65, 69] },
  { name: "A7sus4", root: 33, pad: [55, 57, 62, 64], arp: [62, 64, 67, 69] },
];

// [bar, beat in bar, duration, pitch, velocity]
const MELODY = [
  [0, 1, 1.5, 76, 96],
  [0, 2.5, 1.5, 74, 88],
  [1, 0, 3, 77, 104],
  [1, 3, 1, 74, 84],
  [2, 0, 2, 74, 92],
  [2, 2, 2, 81, 108],
  [3, 0, 2, 79, 100],
  [3, 2, 2, 76, 90],
  [4, 1, 1.5, 76, 96],
  [4, 2.5, 1.5, 81, 110],
  [5, 0, 3, 81, 106],
  [5, 3, 1, 77, 86],
  [6, 0, 2, 76, 98],
  [6, 2, 2, 72, 88],
  [7, 0, 2, 74, 96],
  [7, 2, 2, 73, 104],
];

// 3+3+2 accents across the bar's sixteenths
const ARP_VELOCITIES = [
  112, 48, 60, 104, 48, 60, 100, 48, 110, 48, 60, 104, 48, 64, 100, 56,
];

const BASS_STEPS = [
  [0, 110],
  [0, 64],
  [12, 92],
  [0, 66],
  [0, 104],
  [0, 64],
  [12, 92],
  [0, 72],
];

function createPadNotes() {
  const notes = [];
  CHORDS.forEach((chord, bar) => {
    const pad = [...chord.pad];
    // The last bar's sus4 resolves to the major third on beat 3.
    const resolves = bar === BARS - 1;
    for (const pitch of pad) {
      const isSus = resolves && pitch === 62;
      notes.push({
        pitch,
        start: bar * BAR,
        duration: isSus ? 2 : 3.9,
        velocity: 76,
      });
    }
    if (resolves) {
      notes.push({ pitch: 61, start: bar * BAR + 2, duration: 1.9, velocity: 70 });
    }
  });
  for (const [bar, beat, duration, pitch, velocity] of MELODY) {
    notes.push({ pitch, start: bar * BAR + beat, duration, velocity });
  }
  return notes;
}

function createBassNotes() {
  const notes = [];
  CHORDS.forEach((chord, bar) => {
    BASS_STEPS.forEach(([offset, velocity], step) => {
      notes.push({
        pitch: chord.root + offset,
        start: bar * BAR + step * 0.5,
        duration: 0.4,
        velocity,
      });
    });
  });
  return notes;
}

function createArpNotes(bars) {
  const notes = [];
  for (const bar of bars) {
    const tones = [...CHORDS[bar].arp];
    for (let step = 0; step < 16; step++) {
      let pitch = tones[step % 4];
      if (bar === BARS - 1 && step >= 8 && pitch === 62) {
        pitch = 61;
      }
      if (step % 8 >= 4) {
        pitch += 12;
      }
      notes.push({
        pitch,
        start: bar * BAR + step * 0.25,
        duration: 0.2,
        velocity: ARP_VELOCITIES[step],
      });
    }
  }
  return notes;
}

function createDrumNotes() {
  const notes = [];
  for (let bar = 0; bar < BARS; bar++) {
    const t = bar * BAR;
    notes.push({ pitch: 36, start: t, duration: 0.25, velocity: 110 });
    notes.push({ pitch: 36, start: t + 2, duration: 0.25, velocity: 104 });
    for (let i = 0; i < 8; i++) {
      notes.push({
        pitch: 42,
        start: t + i * 0.5,
        duration: 0.25,
        velocity: i % 2 === 0 ? 46 : 62,
      });
    }
    if (bar >= 4) {
      notes.push({ pitch: 38, start: t + 1, duration: 0.25, velocity: 96 });
      notes.push({ pitch: 38, start: t + 3, duration: 0.25, velocity: 100 });
    }
  }
  return notes;
}

const pluckLayer = {
  oscillator: { waveform: "square" },
  gain: 0.3,
  amp: {
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.2 },
    velocity: 1,
  },
};

const bloomLayer = {
  oscillator: { waveform: "sine" },
  gain: 0.35,
  amp: {
    envelope: { attack: 1, decay: 1, sustain: 0.7, release: 2.5 },
    velocity: 0.5,
  },
};

function createArpPatch(velocity) {
  return {
    layers: [
      {
        oscillator: { waveform: "sawtooth" },
        gain: 0.4,
        amp: {
          envelope: { attack: 0.002, decay: 0.14, sustain: 0.15, release: 0.12 },
          velocity,
        },
      },
    ],
  };
}

const COMMENT = `# Pluck and Bloom

A slow synthwave loop in D minor for [toy-midi#1030](https://github.com/hi-ogawa/toy-midi/pull/1030), which gives each synth layer an amp envelope and a velocity depth. Before it, every synth note had the same 5 ms fade in and out.

- **Pluck & Bloom:** the centerpiece, playing the chords and the melody. A square layer plucks (1 ms attack, 0.25 s decay, sustain 0) while a sine layer swells in behind it (1 s attack, 2.5 s release), so each note pings and then blooms into a pad. Listen to the long melody notes, and to the pad tails overlapping across chord changes.
- **Bass:** sawtooth with sine sub, 8th-note pulse with octave jumps. A 3 ms attack and 0.25 s decay to sustain 0.45 give each note a punchy front.
- **Even Arp (bars 1–4)** and **Accent Arp (bars 5–8):** the same 16th-note sawtooth arpeggio with the same 3+3+2 accent velocities. Even Arp has velocity depth 0, so every note plays at full level and the accents vanish. Accent Arp has velocity depth 1, so the accents come through. Even Arp's track gain is lower to keep the two halves at a similar loudness.
- **Drums:** TR-808 kit, kick and hats throughout, snare from bar 5.

Loops bars 1–8 at 84 BPM.
`;

const project = {
  title: "Pluck and Bloom",
  comment: COMMENT,
  tempo: 84,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: BARS * BAR }, enabled: true },
  midiTracks: [
    {
      name: "Pluck & Bloom",
      program: 0,
      synth: { layers: [pluckLayer, bloomLayer] },
      gain: 0.5,
      viewMode: "editor",
      height: 220,
      notes: createPadNotes(),
    },
    {
      name: "Bass",
      program: 0,
      synth: {
        layers: [
          {
            oscillator: { waveform: "sawtooth" },
            gain: 0.35,
            amp: {
              envelope: { attack: 0.003, decay: 0.25, sustain: 0.45, release: 0.08 },
              velocity: 1,
            },
          },
          {
            oscillator: { waveform: "sine" },
            gain: 0.6,
            amp: {
              envelope: { attack: 0.003, decay: 0.6, sustain: 0.7, release: 0.08 },
              velocity: 0.5,
            },
          },
        ],
      },
      gain: 0.7,
      viewMode: "editor",
      height: 140,
      notes: createBassNotes(),
    },
    {
      name: "Even Arp (velocity depth 0)",
      program: 0,
      synth: createArpPatch(0),
      gain: 0.22,
      pan: 0.2,
      viewMode: "editor",
      height: 140,
      notes: createArpNotes([0, 1, 2, 3]),
    },
    {
      name: "Accent Arp (velocity depth 1)",
      program: 0,
      synth: createArpPatch(1),
      gain: 0.32,
      pan: 0.2,
      viewMode: "editor",
      height: 140,
      notes: createArpNotes([4, 5, 6, 7]),
    },
    {
      name: "Drums",
      bank: 128,
      program: 25,
      gain: 0.45,
      viewMode: "editor",
      height: 120,
      notes: createDrumNotes(),
    },
  ],
};

writeFileSync(new URL("project.json", import.meta.url), `${JSON.stringify(project, null, 2)}\n`);
