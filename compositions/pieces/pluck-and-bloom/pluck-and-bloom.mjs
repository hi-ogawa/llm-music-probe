import { writeFileSync } from "node:fs";

const BAR = 4;
const BARS = 8;

// Level in decibels as a linear gain, as the app's knobs read them.
function db(value) {
  return 10 ** (value / 20);
}

// D minor, one chord per bar. `pad` is the Pad track's voicing, `arp` the
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
  return notes;
}

function createLeadNotes() {
  return MELODY.map(([bar, beat, duration, pitch, velocity]) => ({
    pitch,
    start: bar * BAR + beat,
    duration,
    velocity,
  }));
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

function createArpNotes() {
  const notes = [];
  for (let bar = 0; bar < BARS; bar++) {
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

const leadLayers = [
  {
    oscillator: { waveform: "square" },
    gain: db(-6),
    amp: { envelope: { attack: 0.0038, decay: 0.63, sustain: 0, release: 0.2 } },
  },
  {
    oscillator: { waveform: "sine" },
    gain: 0.35,
    amp: { envelope: { attack: 0.016, decay: 0.51, sustain: 0.68, release: 2.5 } },
  },
];

const padLayers = [
  {
    oscillator: { waveform: "sine" },
    gain: db(-5),
    amp: { envelope: { attack: 1, decay: 1, sustain: 0.7, release: 2.5 } },
  },
];

const bassLayers = [
  {
    oscillator: { waveform: "sawtooth" },
    gain: db(-6.1),
    amp: { envelope: { attack: 0.095, decay: 1.8, sustain: 0, release: 0.019 } },
  },
  {
    oscillator: { waveform: "sine" },
    gain: 0.6,
    amp: { envelope: { attack: 0.003, decay: 0.61, sustain: 0.48, release: 0.08 } },
  },
];

const arpLayers = [
  {
    oscillator: { waveform: "sawtooth" },
    gain: 0.4,
    amp: { envelope: { attack: 0.1, decay: 0.13, sustain: 0.59, release: 0.12 } },
  },
  {
    oscillator: { waveform: "sine" },
    gain: db(-2.5),
    amp: { envelope: { attack: 0.005, decay: 0.3, sustain: 1, release: 0.005 } },
  },
];

const COMMENT = `# Pluck and Bloom

A slow synthwave loop in D minor for [toy-midi#1030](https://github.com/hi-ogawa/toy-midi/pull/1030), which gives each synth layer an amp envelope. Before it, every synth note had the same 5 ms fade in and out.

- **Lead:** the melody. A square layer plucks (4 ms attack, 0.63 s decay to silence) over a sine that holds at 68% and rings for 2.5 s after each note.
- **Pad:** the chords on one sine layer that swells in over 1 s and releases over 2.5 s, so the tails overlap across chord changes.
- **Bass:** a sine sub with a 3 ms attack gives each 8th note its front, and a sawtooth fades in behind it over 95 ms. A gentle low-pass at 7.75 kHz takes the fizz off the top.
- **Arp:** a 16th-note arpeggio, accented 3+3+2 across each bar, on a sine at full sustain with a sawtooth swelling in over 100 ms.
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
      name: "Lead",
      program: 0,
      synth: { layers: leadLayers },
      gain: db(-4),
      notes: createLeadNotes(),
    },
    {
      name: "Pad",
      program: 0,
      synth: { layers: padLayers },
      gain: 0.45,
      pan: -0.29,
      notes: createPadNotes(),
    },
    {
      name: "Bass",
      program: 0,
      synth: { layers: bassLayers },
      gain: db(-4.1),
      pan: -0.14,
      // Takes the fizz off the top of the saw.
      eq: {
        bypass: false,
        bands: [{ type: "low-pass", frequency: 7750, gain: 1, q: Math.SQRT1_2, bypass: false }],
      },
      notes: createBassNotes(),
    },
    {
      name: "Arp",
      program: 0,
      synth: { layers: arpLayers },
      gain: db(-8),
      pan: 0.2,
      notes: createArpNotes(),
    },
    {
      name: "Drums",
      bank: 128,
      program: 25,
      gain: 0.45,
      notes: createDrumNotes(),
    },
  ],
};

writeFileSync(new URL("project.json", import.meta.url), `${JSON.stringify(project, null, 2)}\n`);
