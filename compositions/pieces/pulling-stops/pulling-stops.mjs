import { writeFileSync } from "node:fs";

const BAR = 4;
const STEP = 0.25;
const BARS = 32;

// Level in decibels as a linear gain, as the app's knobs read them.
function db(value) {
  return 10 ** (value / 20);
}

// Four 8-bar sections, each with its own job.
const SECTIONS = [
  { label: "Intro", bar: 0 },
  { label: "Groove", bar: 8 },
  { label: "Breakdown", bar: 16 },
  { label: "Drop", bar: 24 },
];
const GROOVE = 8;
const BREAKDOWN = 16;
const DROP = 24;

// A minor, i–VI–VII–v, one chord a bar. `organ` voicings sit around middle C
// and share their top notes, since the organ's layers already add the octaves
// below and above. `pad` voicings are wider, and `root` is the bass's note.
const CHORDS = {
  Am7: { organ: [57, 60, 64, 67], pad: [57, 64, 67, 72], root: 45 },
  Fmaj7: { organ: [57, 60, 64, 65], pad: [53, 60, 64, 69], root: 41 },
  G: { organ: [59, 62, 67], pad: [55, 62, 67, 71], root: 43 },
  Em7: { organ: [59, 62, 64, 67], pad: [52, 59, 64, 67], root: 40 },
};
const LOOP = ["Am7", "Fmaj7", "G", "Em7"];
// The breakdown holds F and G for two bars each before the loop comes back
// under the hook's first statement.
const BREAKDOWN_CHORDS = ["Fmaj7", "Fmaj7", "G", "G", "Am7", "Fmaj7", "G", "Em7"];

function chordAt(bar) {
  if (bar >= BREAKDOWN && bar < DROP) {
    return CHORDS[BREAKDOWN_CHORDS[bar - BREAKDOWN]];
  }
  return CHORDS[LOOP[bar % 4]];
}

// Organ stabs as [16th step, length in steps, velocity]. The groove plays the
// offbeats, and the drop switches to a two-bar syncopated figure that leans on
// the downbeat.
const ORGAN_GROOVE = [
  [2, 1.5, 96],
  [6, 1.5, 90],
  [10, 1.5, 96],
  [14, 1.5, 90],
];
const ORGAN_DROP = [
  [
    [0, 1.5, 112],
    [3, 1.5, 94],
    [6, 1.5, 100],
    [10, 1.5, 94],
    [13, 2.5, 100],
  ],
  [
    [0, 1.5, 108],
    [3, 1.5, 94],
    [6, 1.5, 100],
    [8, 1.5, 90],
    [11, 1.5, 96],
    [14, 2, 100],
  ],
];

function createOrganNotes() {
  const notes = [];
  for (let bar = GROOVE; bar < BARS; bar++) {
    if (bar >= BREAKDOWN && bar < DROP) {
      continue;
    }
    const hits = bar < BREAKDOWN ? ORGAN_GROOVE : ORGAN_DROP[bar % 2];
    for (const [step, length, velocity] of hits) {
      for (const pitch of chordAt(bar).organ) {
        notes.push({ pitch, start: bar * BAR + step * STEP, duration: length * STEP, velocity });
      }
    }
  }
  return notes;
}

// Bass as [16th step, semitones above the root]. The intro pumps offbeat
// roots, and from bar 5 the bass adds octave pops after the offbeats.
const BASS_PLAIN = [
  [2, 0],
  [6, 0],
  [10, 0],
  [14, 0],
];
const BASS_POP = [
  [2, 0],
  [6, 0],
  [7, 12],
  [10, 0],
  [14, 0],
  [15, 12],
];
const BASS_DROP = [
  [2, 0],
  [5, 12],
  [6, 0],
  [10, 0],
  [11, 12],
  [13, 0],
  [14, 7],
];
// Fills over the last two beats of a phrase, as [16th step, pitch], running
// from E up to G#, the leading tone back to A.
const BASS_FILL = [
  [8, 40],
  [10, 43],
  [11, 45],
  [12, 47],
  [13, 48],
  [14, 47],
  [15, 44],
];
// The breakdown's last bar climbs an octave into the drop.
const BASS_RISE = [
  [8, 40],
  [9, 43],
  [10, 45],
  [11, 47],
  [12, 48],
  [13, 50],
  [14, 52],
  [15, 56],
];

function createBassNotes() {
  const notes = [];
  const push = (bar, step, pitch, velocity) =>
    notes.push({ pitch, start: bar * BAR + step * STEP, duration: 0.4, velocity });
  for (let bar = 0; bar < BARS; bar++) {
    if (bar >= BREAKDOWN && bar < DROP - 1) {
      continue;
    }
    const root = chordAt(bar).root;
    const phraseEnd = bar % 8 === 7;
    if (bar === DROP - 1) {
      BASS_RISE.forEach(([step, pitch], i) => push(bar, step, pitch, 80 + i * 4));
      continue;
    }
    const pattern = bar < 4 ? BASS_PLAIN : bar < DROP ? BASS_POP : BASS_DROP;
    for (const [step, interval] of pattern) {
      if (phraseEnd && step >= 8) {
        continue;
      }
      push(bar, step, root + interval, interval === 0 ? 104 : 88);
    }
    if (phraseEnd) {
      BASS_FILL.forEach(([step, pitch]) => push(bar, step, pitch, 96));
    }
  }
  return notes;
}

// The hook, as [16th step, length in steps, pitch] per bar. Its first two bars
// call, rising to G; the next two answer with the same rhythm a step lower,
// falling to G. The first answer stops on B, open; the second climbs back up
// to E, and its call varies bar 2.
const CALL_1 = [
  [0, 2, 76],
  [3, 1, 74],
  [4, 2, 72],
  [6, 2, 74],
  [10, 2, 76],
  [12, 3, 79],
];
const CALL_2 = [
  [0, 3, 77],
  [4, 2, 76],
  [6, 2, 74],
  [8, 6, 72],
];
const CALL_2_VARIED = [
  [0, 3, 77],
  [4, 2, 79],
  [6, 2, 77],
  [8, 2, 76],
  [10, 5, 72],
];
const ANSWER_1 = [
  [0, 2, 74],
  [3, 1, 72],
  [4, 2, 71],
  [6, 2, 72],
  [10, 2, 74],
  [12, 3, 67],
];
const ANSWER_2_OPEN = [
  [0, 6, 71],
  [8, 2, 67],
  [10, 2, 69],
  [12, 4, 71],
];
const ANSWER_2_LIFT = [
  [0, 2, 71],
  [2, 2, 72],
  [4, 4, 74],
  [8, 7, 76],
];
const HOOK_OPEN = [CALL_1, CALL_2, ANSWER_1, ANSWER_2_OPEN];
const HOOK_LIFT = [CALL_1, CALL_2_VARIED, ANSWER_1, ANSWER_2_LIFT];

function createHookNotes() {
  const notes = [];
  // A quiet first statement over the end of the breakdown, then two loud ones
  // in the drop.
  const statements = [
    [DROP - 4, HOOK_OPEN, 52],
    [DROP, HOOK_OPEN, 104],
    [DROP + 4, HOOK_LIFT, 104],
  ];
  for (const [firstBar, bars, velocity] of statements) {
    bars.forEach((phrase, i) => {
      for (const [step, length, pitch] of phrase) {
        notes.push({
          pitch,
          start: (firstBar + i) * BAR + step * STEP,
          duration: length * STEP,
          velocity: step === 0 ? velocity : velocity - 8,
        });
      }
    });
  }
  return notes;
}

// The pad holds each breakdown chord, tied across repeats, then plays one
// chord a bar under the drop.
function createPadNotes() {
  const notes = [];
  let bar = BREAKDOWN;
  while (bar < DROP) {
    const name = BREAKDOWN_CHORDS[bar - BREAKDOWN];
    let bars = 1;
    while (bar + bars < DROP && BREAKDOWN_CHORDS[bar + bars - BREAKDOWN] === name) {
      bars++;
    }
    for (const pitch of CHORDS[name].pad) {
      notes.push({ pitch, start: bar * BAR, duration: bars * BAR - 0.1, velocity: 96 });
    }
    bar += bars;
  }
  for (bar = DROP; bar < BARS; bar++) {
    for (const pitch of chordAt(bar).pad) {
      notes.push({ pitch, start: bar * BAR, duration: BAR - 0.1, velocity: 90 });
    }
  }
  return notes;
}

// General MIDI drum notes
const KICK = 36;
const SNARE = 38;
const CLAP = 39;
const CLOSED_HAT = 42;
const OPEN_HAT = 46;
const CRASH = 49;

function createDrumNotes() {
  const notes = [];
  const hit = (pitch, start, velocity) => notes.push({ pitch, start, duration: 0.2, velocity });
  for (let bar = 0; bar < BARS; bar++) {
    const t = bar * BAR;
    const breakdown = bar >= BREAKDOWN && bar < DROP;
    if (bar === GROOVE || bar === BREAKDOWN || bar === DROP) {
      hit(CRASH, t, 100);
    }
    if (breakdown) {
      // Quiet hats come back halfway, then a snare roll builds into the drop
      // and stops for the last beat.
      if (bar >= BREAKDOWN + 4 && bar < DROP - 2) {
        for (let beat = 0; beat < 4; beat++) {
          hit(CLOSED_HAT, t + beat + 0.5, 44);
        }
      }
      if (bar === DROP - 2) {
        for (let i = 0; i < 8; i++) {
          hit(SNARE, t + i * 0.5, 50 + i * 3);
        }
      }
      if (bar === DROP - 1) {
        for (let i = 0; i < 12; i++) {
          hit(SNARE, t + i * STEP, 76 + i * 3);
        }
      }
      continue;
    }
    for (let beat = 0; beat < 4; beat++) {
      hit(KICK, t + beat, beat === 0 ? 112 : 104);
    }
    if (bar < 4) {
      for (let beat = 0; beat < 4; beat++) {
        hit(CLOSED_HAT, t + beat + 0.5, 64);
      }
      continue;
    }
    for (let beat = 0; beat < 4; beat++) {
      hit(OPEN_HAT, t + beat + 0.5, 72);
      // Closed 16ths around the open hat, which also choke it short.
      hit(CLOSED_HAT, t + beat + 0.25, 40);
      hit(CLOSED_HAT, t + beat + 0.75, 48);
    }
    hit(CLAP, t + 1, 100);
    hit(CLAP, t + 3, 104);
    if (bar >= DROP) {
      hit(SNARE, t + 1, 76);
      hit(SNARE, t + 3, 80);
    }
    // A clap fill on the last beat of each 8-bar phrase
    if (bar % 8 === 7) {
      hit(CLAP, t + 3.5, 84);
      hit(CLAP, t + 3.75, 92);
    }
  }
  return notes;
}

// Steps from `from` to `to` over `beats`, eased, one point per `step`.
function createRamp({ start, beats, from, to, step }) {
  const points = [];
  for (let t = 0; t <= beats + 1e-9; t += step) {
    const eased = (1 - Math.cos((Math.PI * t) / beats)) / 2;
    points.push({ beat: start + t, value: Math.round(from + (to - from) * eased) });
  }
  return points;
}

// CC1 swells the pad's vibrato over the breakdown's first four bars and eases
// it back for the drop.
function createPadModulation() {
  return [
    { beat: 0, value: 0 },
    ...createRamp({ start: BREAKDOWN * BAR, beats: 4 * BAR, from: 0, to: 84, step: 0.5 }),
    ...createRamp({ start: (DROP - 1) * BAR, beats: BAR, from: 84, to: 30, step: 0.5 }),
  ];
}

// CC11 lowers the pad under the drop, where the organ and hook take over.
function createPadExpression() {
  return [
    { beat: 0, value: 127 },
    { beat: DROP * BAR, value: 76 },
  ];
}

// M1-style organ from octaves: sines at the octave below, at, and above each
// key, like 16', 8', and 4' drawbars, and a sine two octaves up that only
// ticks at each note's start, like a Hammond's percussion.
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

// A short square bass with a sine sub an octave below it, which holds a little
// longer than the square's click.
const bassLayers = [
  {
    oscillator: { waveform: "square", octave: 0, detune: 0 },
    gain: 0.4,
    amp: { envelope: { attack: 0.003, decay: 0.12, sustain: 0.25, release: 0.04 } },
  },
  {
    oscillator: { waveform: "sine", octave: -1, detune: 0 },
    gain: 0.85,
    amp: { envelope: { attack: 0.003, decay: 0.2, sustain: 0.7, release: 0.05 } },
  },
];

// Three saws at -12, 0, and +12 cents, which beat against each other. The pad
// fades in slowly, and the hook speaks at once.
function createSupersaw(envelope, gain) {
  return [-12, 0, 12].map((detune) => ({
    oscillator: { waveform: "sawtooth", octave: 0, detune },
    gain,
    amp: { envelope },
  }));
}
const padLayers = createSupersaw({ attack: 0.9, decay: 1, sustain: 0.85, release: 0.8 }, 0.4);
const hookLayers = createSupersaw({ attack: 0.005, decay: 0.25, sustain: 0.6, release: 0.12 }, 0.8);

function createLowPass(frequency) {
  return {
    bypass: false,
    bands: [{ type: "low-pass", frequency, gain: 1, q: Math.SQRT1_2, bypass: false }],
  };
}

const COMMENT = `# Pulling Stops

90s organ house in A minor for [toy-midi#1067](https://github.com/hi-ogawa/toy-midi/pull/1067), which gives each synth layer an octave and a detune.

- **Intro (bars 1–8):** kick, hats, and the bass. The bass pumps offbeat roots, adds octave pops from bar 5, and fills into the groove.
- **Groove (bars 9–16):** the organ enters on offbeat stabs.
- **Breakdown (bars 17–24):** the kick drops out and a detuned saw pad swells, with CC1 vibrato rising over its first four bars. The hook plays once, quietly, over the last four, and a snare roll and a bass run climb into the drop.
- **Drop (bars 25–32):** everything, with the organ on a syncopated two-bar figure, the bass busier, and the hook twice. Each statement is a call and an answer a step lower, and the second answer climbs back up instead of stopping.

Tracks:

- **Organ:** sine layers at the octave below, at, and above each key, like 16', 8', and 4' drawbars, and a sine two octaves up that only ticks at each note's start.
- **Bass:** a short square with a sine sub an octave below.
- **Pad** and **Hook:** three saws at -12, 0, and +12 cents.

Loops all 32 bars at 122 BPM.
`;

const project = {
  title: "Pulling Stops",
  comment: COMMENT,
  tempo: 122,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: BARS * BAR }, enabled: true },
  locators: SECTIONS.map(({ label, bar }) => ({ beat: bar * BAR, label })),
  midiTracks: [
    {
      name: "Organ",
      program: 0,
      synth: { layers: organLayers },
      gain: db(-12),
      pan: -0.15,
      notes: createOrganNotes(),
    },
    {
      name: "Bass",
      program: 0,
      synth: { layers: bassLayers },
      gain: db(-5),
      // Softens the square's upper harmonics.
      eq: createLowPass(1800),
      notes: createBassNotes(),
    },
    {
      name: "Pad",
      program: 0,
      synth: { layers: padLayers },
      gain: db(-9),
      pan: 0.2,
      eq: createLowPass(2000),
      automation: [
        { type: "controller", controller: 1, points: createPadModulation() },
        { type: "controller", controller: 11, points: createPadExpression() },
      ],
      notes: createPadNotes(),
    },
    {
      name: "Hook",
      program: 0,
      synth: { layers: hookLayers },
      gain: db(0),
      pan: 0.1,
      // Takes the fizz off the top of the saws.
      eq: createLowPass(4500),
      notes: createHookNotes(),
    },
    {
      name: "Drums",
      bank: 128,
      program: 0,
      gain: db(-5),
      notes: createDrumNotes(),
    },
  ],
};

writeFileSync(new URL("project.json", import.meta.url), `${JSON.stringify(project, null, 2)}\n`);
