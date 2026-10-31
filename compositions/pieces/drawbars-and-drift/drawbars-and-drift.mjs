import { writeFileSync } from "node:fs";

const BAR = 4;
const CHORUS_BARS = 12;
const BARS = 2 * CHORUS_BARS;
// The shuffle's offbeat, the last third of a triplet
const SWING = 2 / 3;

// Level in decibels as a linear gain, as the app's knobs read them.
function db(value) {
  return 10 ** (value / 20);
}

// A 12-bar blues in F. `organ` is the organ's voicing, around middle C.
const VOICINGS = {
  F7: [57, 60, 63, 65],
  Bb7: [56, 58, 62, 65],
  C7: [58, 60, 64, 67],
};
const CHORUS = ["F7", "F7", "F7", "F7", "Bb7", "Bb7", "F7", "F7", "C7", "Bb7", "F7", "C7"];

// One walking line per bar, chromatic into the next bar's root.
const WALK = [
  [41, 45, 48, 50],
  [51, 50, 48, 45],
  [41, 45, 48, 51],
  [53, 51, 48, 47],
  [46, 50, 53, 55],
  [46, 44, 43, 42],
  [41, 45, 48, 51],
  [53, 51, 50, 47],
  [48, 52, 50, 47],
  [46, 50, 44, 42],
  [41, 45, 46, 47],
  [48, 52, 43, 40],
];

// The lead plays the second chorus, an AAB blues in call and response with
// the organ. [bar in the chorus, beat in bar, duration, pitch, velocity, bend
// in semitones]
const LEAD_PHRASE_A = [
  [0, 0, 0.6, 72, 100],
  [0, SWING, 0.3, 75, 92],
  [0, 1, 2.2, 77, 110],
  [0, 3 + SWING, 0.3, 75, 88],
  [1, 0, 0.6, 72, 96],
  [1, SWING, 0.3, 70, 88],
  // The blue third, Ab bent up to A
  [1, 1, 1.6, 68, 104, 1],
  [1, 2 + SWING, 1.2, 65, 92],
];
const LEAD = [
  ...LEAD_PHRASE_A,
  ...LEAD_PHRASE_A.map(([bar, ...rest]) => [bar + 4, ...rest]),
  [8, 0, 0.6, 79, 104],
  [8, SWING, 0.3, 77, 92],
  [8, 1, 0.6, 75, 96],
  [8, 1 + SWING, 0.3, 72, 88],
  // Bb bent a whole step up to C
  [8, 2, 1.6, 70, 106, 2],
  [9, 0, 0.6, 72, 96],
  [9, SWING, 0.3, 70, 88],
  [9, 1, 0.6, 68, 92],
  [9, 1 + SWING, 0.3, 70, 88],
  [9, 2, 1.8, 72, 104],
  [10, SWING, 0.3, 70, 90],
  [10, 1, 0.6, 68, 94],
  [10, 1 + SWING, 0.3, 63, 88],
  [10, 2, 1.8, 65, 100],
];

function createOrganNotes() {
  const notes = [];
  for (let bar = 0; bar < BARS; bar++) {
    const voicing = VOICINGS[CHORUS[bar % CHORUS_BARS]];
    // The first chorus holds bars 9 and 10, which the vibrato swells over.
    const held = bar === 8 || bar === 9;
    const hits = held
      ? [[0, 3.9]]
      : [
          [SWING, 0.3],
          [1, 0.55],
          [2 + SWING, 0.3],
          [3, 0.55],
        ];
    for (const [beat, duration] of hits) {
      for (const pitch of voicing) {
        notes.push({ pitch, start: bar * BAR + beat, duration, velocity: 96 });
      }
    }
  }
  return notes;
}

function createBassNotes() {
  const notes = [];
  for (let bar = 0; bar < BARS; bar++) {
    WALK[bar % CHORUS_BARS].forEach((pitch, beat) => {
      notes.push({
        pitch,
        start: bar * BAR + beat,
        duration: 0.9,
        velocity: beat % 2 === 0 ? 100 : 86,
      });
    });
  }
  return notes;
}

function createLeadNotes() {
  return LEAD.map(([bar, beat, duration, pitch, velocity]) => ({
    pitch,
    start: (CHORUS_BARS + bar) * BAR + beat,
    duration,
    velocity,
  }));
}

function createDrumNotes() {
  const notes = [];
  for (let bar = 0; bar < BARS; bar++) {
    const t = bar * BAR;
    const second = bar >= CHORUS_BARS;
    for (let beat = 0; beat < 4; beat++) {
      notes.push({ pitch: 42, start: t + beat, duration: 0.2, velocity: 70 });
      notes.push({ pitch: 42, start: t + beat + SWING, duration: 0.2, velocity: 48 });
    }
    notes.push({ pitch: 36, start: t, duration: 0.25, velocity: 108 });
    notes.push({ pitch: 36, start: t + 2, duration: 0.25, velocity: 100 });
    if (second) {
      notes.push({ pitch: 36, start: t + 2 + SWING, duration: 0.25, velocity: 78 });
    }
    notes.push({ pitch: 38, start: t + 1, duration: 0.25, velocity: 96 });
    notes.push({ pitch: 38, start: t + 3, duration: 0.25, velocity: 100 });
    // A push into the next chorus
    if (bar % CHORUS_BARS === CHORUS_BARS - 1) {
      notes.push({ pitch: 38, start: t + 3 + SWING, duration: 0.25, velocity: 72 });
    }
  }
  return notes;
}

// Steps from `from` to `to` over `beats`, eased, one point per `step`.
function createRamp({ start, beats, from, to, step, key }) {
  const points = [];
  for (let t = 0; t <= beats + 1e-9; t += step) {
    const eased = (1 - Math.cos((Math.PI * t) / beats)) / 2;
    points.push({ beat: start + t, [key]: from + (to - from) * eased });
  }
  return points;
}

// CC1 swells the organ's vibrato over the two held chords of the first chorus.
function createOrganModulation() {
  const start = 8 * BAR;
  return [
    { beat: 0, value: 0 },
    ...createRamp({ start, beats: 3, from: 0, to: 110, step: 0.25, key: "value" }).map(
      (point) => ({ ...point, value: Math.round(point.value) }),
    ),
    { beat: 10 * BAR, value: 0 },
  ];
}

// CC1 brings vibrato in on each long lead note after its attack, and drops it
// at the note's end.
function createLeadModulation() {
  const points = [{ beat: 0, value: 0 }];
  for (const note of createLeadNotes()) {
    if (note.duration < 1.5) {
      continue;
    }
    points.push(
      ...createRamp({
        start: note.start + 0.4,
        beats: 0.8,
        from: 0,
        to: 90,
        step: 0.125,
        key: "value",
      }).map((point) => ({ ...point, value: Math.round(point.value) })),
      { beat: note.start + note.duration, value: 0 },
    );
  }
  return points;
}

// Each bent note rises to its target over half a beat and drops back at its end.
function createLeadBend() {
  const points = [{ beat: 0, semitones: 0 }];
  for (const [bar, beat, duration, , , bend] of LEAD) {
    if (!bend) {
      continue;
    }
    const start = (CHORUS_BARS + bar) * BAR + beat;
    points.push(
      ...createRamp({ start, beats: 0.5, from: 0, to: bend, step: 0.0625, key: "semitones" }),
      { beat: start + duration, semitones: 0 },
    );
  }
  return points;
}

// Drawbar organ: sines at 16', 8', and 4', the octave below, at, and above the
// key, plus a 2' sine two octaves up that only ticks at each note's start, like
// a Hammond's percussion.
const DRAWBAR_ENVELOPE = { attack: 0.004, decay: 0.1, sustain: 1, release: 0.03 };
const organLayers = [
  { oscillator: { waveform: "sine", octave: -1, detune: 0 }, gain: 0.55, amp: { envelope: DRAWBAR_ENVELOPE } },
  { oscillator: { waveform: "sine", octave: 0, detune: 0 }, gain: 1, amp: { envelope: DRAWBAR_ENVELOPE } },
  { oscillator: { waveform: "sine", octave: 1, detune: 0 }, gain: 0.55, amp: { envelope: DRAWBAR_ENVELOPE } },
  {
    oscillator: { waveform: "sine", octave: 2, detune: 0 },
    gain: 0.6,
    amp: { envelope: { attack: 0.002, decay: 0.18, sustain: 0, release: 0.03 } },
  },
];

// A square bass with a sine sub an octave below it.
const bassLayers = [
  {
    oscillator: { waveform: "square", octave: 0, detune: 0 },
    gain: 0.45,
    amp: { envelope: { attack: 0.004, decay: 0.25, sustain: 0.6, release: 0.05 } },
  },
  {
    oscillator: { waveform: "sine", octave: -1, detune: 0 },
    gain: 0.8,
    amp: { envelope: { attack: 0.004, decay: 0.3, sustain: 0.85, release: 0.06 } },
  },
];

// Two saws 9 cents either side of the note, 18 cents apart, which beat a few
// times a second in the lead's register.
const LEAD_ENVELOPE = { attack: 0.01, decay: 0.4, sustain: 0.75, release: 0.12 };
const leadLayers = [
  { oscillator: { waveform: "sawtooth", octave: 0, detune: -9 }, gain: 0.5, amp: { envelope: LEAD_ENVELOPE } },
  { oscillator: { waveform: "sawtooth", octave: 0, detune: 9 }, gain: 0.5, amp: { envelope: LEAD_ENVELOPE } },
];

function createLowPass(frequency) {
  return {
    bypass: false,
    bands: [{ type: "low-pass", frequency, gain: 1, q: Math.SQRT1_2, bypass: false }],
  };
}

const COMMENT = `# Drawbars and Drift

A 12-bar blues shuffle in F for [toy-midi#1067](https://github.com/hi-ogawa/toy-midi/pull/1067), which gives each synth layer an octave and a detune.

- **Organ:** a drawbar organ built from octaves. Sine layers sit at the octave below, at, and above each key, like 16', 8', and 4' drawbars, and a fourth sine two octaves up decays in 0.18 s, so each chord starts with a tick like a Hammond's percussion. CC1 swells vibrato over the held chords in bars 9 and 10.
- **Bass:** a walking line on a square with a sine sub an octave below.
- **Lead:** two saws detuned 9 cents either side of the note, so they beat against each other. It enters in the second chorus, with CC1 vibrato on the long notes and bends up to the blue notes.
- **Drums:** Standard kit, shuffled hats, with an extra kick in the second chorus.

Loops both choruses, bars 1–24, at 92 BPM.
`;

const project = {
  title: "Drawbars and Drift",
  comment: COMMENT,
  tempo: 92,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: BARS * BAR }, enabled: true },
  midiTracks: [
    {
      name: "Organ",
      program: 0,
      synth: { layers: organLayers },
      gain: db(-15),
      pan: -0.2,
      automation: [{ type: "controller", controller: 1, points: createOrganModulation() }],
      notes: createOrganNotes(),
    },
    {
      name: "Bass",
      program: 0,
      synth: { layers: bassLayers },
      gain: db(-6),
      // Softens the square's upper harmonics.
      eq: createLowPass(2500),
      notes: createBassNotes(),
    },
    {
      name: "Lead",
      program: 0,
      synth: { layers: leadLayers },
      gain: db(2),
      pan: 0.15,
      // Takes the fizz off the top of the saws.
      eq: createLowPass(3500),
      automation: [
        { type: "controller", controller: 1, points: createLeadModulation() },
        { type: "pitch-bend", points: createLeadBend() },
      ],
      notes: createLeadNotes(),
    },
    {
      name: "Drums",
      bank: 128,
      program: 0,
      gain: db(-1),
      notes: createDrumNotes(),
    },
  ],
};

writeFileSync(new URL("project.json", import.meta.url), `${JSON.stringify(project, null, 2)}\n`);
