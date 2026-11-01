// Writes project.json: a gallery of white-noise patches on Toy MIDI's synth,
// in A minor at 120 BPM. Each part is 4 bars on its own track, so looping a
// part's locator range plays that patch alone over the drum kit.
//
//   node noise-gallery.mjs

import { writeFileSync } from "node:fs";

const BAR = 4;
const PART = 4 * BAR;
const KEY = { fifths: 0, mode: "minor" };

// CC74 as a cutoff offset in octaves, assuming 64 leaves the patch as
// written and 0 and 127 move it about 4 octaves down and up.
const cc74 = (octaves) => Math.round(Math.min(127, Math.max(0, 64 + (octaves / 4) * 63)));

const env = (attack, decay, sustain, release) => ({ attack, decay, sustain, release });

function layer({ waveform, gain = 1, pan = 0, octave = 0, detune = 0, filter, amp }) {
  return {
    oscillator: { waveform, octave, detune },
    gain,
    pan,
    filter: {
      cutoff: 20000,
      resonance: 0.707,
      keytrack: 0,
      ...filter,
      envelope: { ...env(0, 0, 0, 0), amount: 0, velocity: 0, ...filter?.envelope },
    },
    amp: { envelope: amp },
  };
}

// Melody notes as [pitch, beats], laid end to end from `start`.
function phrase(start, notes, { velocity = 96, legato = 0.92 } = {}) {
  const out = [];
  let beat = start;
  for (const [pitch, beats, vel = velocity] of notes) {
    if (pitch !== null) out.push({ pitch, start: beat, duration: beats * legato, velocity: vel });
    beat += beats;
  }
  return out;
}

// Points every `step` beats from a function of the beat.
function curve(from, to, step, fn) {
  const points = [];
  for (let beat = from; beat <= to + 1e-9; beat += step) {
    points.push({ beat: +beat.toFixed(4), value: Math.round(fn(beat)) });
  }
  return points;
}

const controller = (number, points) => ({ type: "controller", controller: number, points });

// --- Part 1: riser and downlifter (bars 1–4) ---------------------------------
// One patch with a negative filter envelope at full velocity depth. The riser
// is played softly, so its envelope only dips the cutoff about 1.6 octaves
// while CC74 carries it up over bars 1–3. The downlifter is played hard, so
// the envelope's 2 s attack drags the cutoff down 5 octaves into bar 5.
const riserStart = 0;
const riser = {
  name: "Riser & Downlifter",
  program: 0,
  keySignature: KEY,
  gain: 0.8,
  synth: {
    layers: [
      layer({
        waveform: "noise",
        gain: 0.7,
        filter: {
          cutoff: 2000,
          resonance: 4,
          envelope: { ...env(2, 0, 1, 0.25), amount: -5, velocity: 1 },
        },
        amp: env(0.05, 0, 1, 0.3),
      }),
    ],
  },
  notes: [
    { pitch: 57, start: riserStart, duration: 3 * BAR, velocity: 40 },
    { pitch: 57, start: riserStart + 3 * BAR, duration: BAR, velocity: 127 },
  ],
  automation: [
    controller(74, [
      { beat: 0, value: 16 },
      ...curve(riserStart, riserStart + 3 * BAR, 0.25, (b) => {
        const t = (b - riserStart) / (3 * BAR);
        return 16 + (127 - 16) * t ** 1.6;
      }).slice(1, -1),
      // Downlifter starts near 12 kHz, where the riser peaked.
      { beat: riserStart + 3 * BAR, value: cc74(Math.log2(12000 / 2000)) },
      { beat: riserStart + PART, value: 16 },
    ]),
    controller(11, [
      { beat: 0, value: 96 },
      ...curve(riserStart, riserStart + 3 * BAR, 0.5, (b) => 96 + 31 * ((b - riserStart) / (3 * BAR))).slice(1, -1),
      ...curve(riserStart + 3 * BAR, riserStart + PART - 0.25, 0.25, (b) => 80 - 40 * ((b - riserStart - 3 * BAR) / BAR)),
      { beat: riserStart + PART, value: 96 },
    ]),
  ],
};

// --- Part 2: wind (bars 5–8) -------------------------------------------------
// Two resonant noise layers panned apart, one note held across the part, and
// CC74 drifting through slow gusts. It starts and ends at the same value so
// the loop joins.
const windStart = PART;
const gust = (b) => {
  const t = (b - windStart) / PART;
  const shape = Math.sin(2 * Math.PI * t) * 0.45 + Math.sin(2 * Math.PI * 3 * t + 0.7) * 0.35 + Math.sin(2 * Math.PI * 5 * t + 2.1) * 0.2;
  return 56 + shape * 34 - 8 * Math.sin(Math.PI * t);
};
const wind = {
  name: "Wind",
  program: 0,
  keySignature: KEY,
  gain: 0.85,
  synth: {
    layers: [
      layer({
        waveform: "noise",
        gain: 0.6,
        pan: -0.5,
        filter: { cutoff: 600, resonance: 7 },
        amp: env(1.5, 0, 1, 2),
      }),
      layer({
        waveform: "noise",
        gain: 0.6,
        pan: 0.5,
        filter: { cutoff: 950, resonance: 7 },
        amp: env(1.5, 0, 1, 2),
      }),
    ],
  },
  notes: [{ pitch: 57, start: windStart, duration: PART, velocity: 100 }],
  automation: [
    controller(74, [{ beat: 0, value: Math.round(gust(windStart)) }, ...curve(windStart, windStart + PART, 0.125, gust).slice(1)]),
  ],
};

// --- Part 3: tuned noise (bars 9–12) -----------------------------------------
// Q 40 and keytrack 1 with the cutoff at middle C's own frequency, so the
// resonant peak rings at each note's pitch: a whistled melody.
const tunedStart = 2 * PART;
const tuned = {
  name: "Tuned Noise",
  program: 0,
  keySignature: KEY,
  gain: 0.75,
  synth: {
    layers: [
      layer({
        waveform: "noise",
        gain: 0.5,
        filter: { cutoff: 261.63, resonance: 40, keytrack: 1 },
        amp: env(0.03, 0.2, 0.8, 0.15),
      }),
    ],
  },
  notes: phrase(tunedStart, [
    [81, 1], [84, 0.5], [83, 0.5], [81, 1], [76, 1],
    [77, 1.5], [79, 0.5], [81, 1], [84, 1],
    [83, 0.5], [84, 0.5], [86, 1], [88, 1.5], [86, 0.5],
    [84, 1], [83, 1], [81, 2],
  ]),
};

// --- Part 4: breathy lead (bars 13–16) ---------------------------------------
// A triangle with a quiet noise layer whose filter envelope opens for about
// 0.1 s on each attack, then leaves a faint steady breath.
const breathStart = 3 * PART;
const breathy = {
  name: "Breathy Lead",
  program: 0,
  keySignature: KEY,
  gain: 0.85,
  synth: {
    layers: [
      layer({
        waveform: "triangle",
        gain: 0.7,
        filter: { cutoff: 5000 },
        amp: env(0.03, 0.3, 0.8, 0.2),
      }),
      layer({
        waveform: "noise",
        gain: 0.12,
        filter: {
          cutoff: 700,
          resonance: 1,
          keytrack: 1,
          envelope: { ...env(0.003, 0.09, 0, 0.05), amount: 3.5, velocity: 0.5 },
        },
        amp: env(0.002, 0.12, 0.1, 0.1),
      }),
    ],
  },
  notes: phrase(breathStart, [
    [76, 1], [74, 0.5], [72, 0.5], [69, 2],
    [72, 0.5], [74, 0.5], [76, 1], [79, 1], [76, 1],
    [77, 1.5], [76, 0.5], [74, 1], [72, 1],
    [71, 1], [68, 1], [69, 2],
  ]),
};

// --- Part 5: air on a pad (bars 17–20) ---------------------------------------
// Two detuned saws under a slow filter envelope, with a quiet noise layer
// under the same envelope, so the air swells and settles with the chord.
const padStart = 4 * PART;
const padFilterEnvelope = { ...env(1.4, 1.2, 0.55, 1.6), amount: 3.5, velocity: 0 };
const padAmp = env(0.6, 0, 1, 1.6);
const chords = [
  [0, 4, [57, 60, 64, 67, 71]], // Am9
  [4, 4, [53, 57, 60, 64]], // Fmaj7
  [8, 4, [50, 53, 57, 60, 64]], // Dm9
  [12, 2, [52, 57, 59, 62]], // E7sus4
  [14, 2, [52, 56, 59, 62]], // E7
];
const pad = {
  name: "Air Pad",
  program: 0,
  keySignature: KEY,
  gain: 0.8,
  synth: {
    layers: [
      layer({
        waveform: "sawtooth",
        gain: 0.3,
        pan: -0.3,
        detune: -8,
        filter: { cutoff: 300, resonance: 1.2, keytrack: 0.5, envelope: padFilterEnvelope },
        amp: padAmp,
      }),
      layer({
        waveform: "sawtooth",
        gain: 0.3,
        pan: 0.3,
        detune: 8,
        filter: { cutoff: 300, resonance: 1.2, keytrack: 0.5, envelope: padFilterEnvelope },
        amp: padAmp,
      }),
      layer({
        waveform: "noise",
        gain: 0.06,
        filter: { cutoff: 1200, resonance: 1.2, envelope: padFilterEnvelope },
        amp: padAmp,
      }),
    ],
  },
  notes: chords.flatMap(([beat, beats, pitches]) =>
    pitches.map((pitch) => ({ pitch, start: padStart + beat, duration: beats - 0.05, velocity: 88 })),
  ),
};

// --- Part 6: noise drums (bars 21–24) ----------------------------------------
// One patch, with pitch picking the drum through keytrack. The noise layer
// brightens with pitch, and the triangle body darkens 4 octaves per octave,
// so it only sounds on the snare's low note.
const HAT = 96;
const SHAKER = 84;
const CLAP = 72;
const SNARE = 55;
const drumStart = 5 * PART;
const drumNotes = [];
const hit = (pitch, beat, duration, velocity) => drumNotes.push({ pitch, start: drumStart + beat, duration, velocity });
for (let bar = 0; bar < 4; bar++) {
  const b = bar * BAR;
  for (let i = 0; i < 8; i++) {
    const openHat = i === 7 && bar % 2 === 1;
    hit(HAT, b + i / 2, openHat ? 0.45 : 0.04, i % 2 ? 96 : 80);
  }
  for (let i = 0; i < 16; i++) {
    hit(SHAKER, b + i / 4, 0.1, [70, 40, 55, 45][i % 4]);
  }
  hit(SNARE, b + 1, 0.15, 112);
  hit(SNARE, b + 3, 0.15, 112);
  if (bar % 2 === 1) {
    // Clap: three quick bursts about 15 ms apart, then the tail
    for (const [offset, vel] of [[0, 90], [0.03, 100], [0.06, 110]]) hit(CLAP, b + 3 + offset, 0.02, vel);
    hit(CLAP, b + 3.09, 0.3, 100);
  }
  if (bar === 3) hit(SNARE, b + 3.75, 0.1, 70);
}
const noiseDrums = {
  name: "Noise Drums",
  program: 0,
  keySignature: KEY,
  gain: 0.8,
  synth: {
    layers: [
      layer({
        waveform: "noise",
        gain: 0.5,
        filter: { cutoff: 6000, resonance: 0.9, keytrack: 0.5 },
        amp: env(0.001, 0.06, 0.3, 0.05),
      }),
      layer({
        waveform: "triangle",
        gain: 0.9,
        filter: { cutoff: 1000, keytrack: -4 },
        amp: env(0.001, 0.08, 0, 0.05),
      }),
    ],
  },
  notes: drumNotes.sort((a, b) => a.start - b.start),
};

// --- GeneralUser GS TR-808 kit under parts 1–5 -------------------------------
const KICK = 36;
const KIT_SNARE = 38;
const KIT_CLAP = 39;
const CH = 42;
const OH = 46;
const CRASH = 49;
const MARACAS = 70;
const kitNotes = [];
const kit = (pitch, beat, velocity, duration = 0.25) => kitNotes.push({ pitch, start: beat, duration, velocity });
const hats = (b, vel = 70) => {
  for (let i = 0; i < 8; i++) kit(CH, b + i / 2, i % 2 ? vel : vel - 20);
};

// Part 1: four on the floor building into a snare roll, then the downlifter
// alone after the crash.
for (let bar = 0; bar < 3; bar++) {
  const b = riserStart + bar * BAR;
  for (let i = 0; i < 4; i++) kit(KICK, b + i, 110);
  hats(b);
}
for (let i = 0; i < 8; i++) kit(KIT_SNARE, riserStart + 2 * BAR + i / 4, 50 + i * 6);
for (let i = 0; i < 8; i++) kit(KIT_SNARE, riserStart + 2 * BAR + 2 + i / 4, 90 + i * 4);
kit(KICK, riserStart + 3 * BAR, 120);
kit(CRASH, riserStart + 3 * BAR, 100, 2);

// Part 2: sparse, so the gusts carry it.
for (let bar = 0; bar < 4; bar++) {
  const b = windStart + bar * BAR;
  kit(KICK, b, 100);
  kit(KICK, b + 2.5, 80);
  kit(KIT_CLAP, b + 2, 70);
  for (let i = 1; i < 8; i += 2) kit(CH, b + i / 2, 45);
}

// Parts 3 and 4: a laid-back backbeat with maracas.
for (const start of [tunedStart, breathStart]) {
  for (let bar = 0; bar < 4; bar++) {
    const b = start + bar * BAR;
    kit(KICK, b, 110);
    kit(KICK, b + 1.75, 70);
    kit(KICK, b + 2.5, 95);
    kit(KIT_SNARE, b + 1, 100);
    kit(KIT_SNARE, b + 3, 100);
    hats(b, 65);
    if (bar === 3) kit(OH, b + 3.5, 70, 0.5);
    for (let i = 0; i < 4; i++) kit(MARACAS, b + i + 0.25, 45);
  }
}

// Part 5: half time under the pad.
for (let bar = 0; bar < 4; bar++) {
  const b = padStart + bar * BAR;
  kit(KICK, b, 100);
  kit(KICK, b + 3.5, 70);
  kit(KIT_SNARE, b + 2, 95);
  for (let i = 0; i < 8; i++) kit(CH, b + i / 2, 40 + (i % 2) * 15);
}

const drums = {
  name: "Drums (TR-808)",
  bank: 128,
  program: 25,
  gain: 0.55,
  notes: kitNotes.sort((a, b) => a.start - b.start),
};

const parts = [
  ["Riser & Downlifter", riserStart],
  ["Wind", windStart],
  ["Tuned Noise", tunedStart],
  ["Breathy Lead", breathStart],
  ["Air Pad", padStart],
  ["Noise Drums", drumStart],
];

const comment = `# Noise Gallery

White noise on Toy MIDI's synth, one patch per part, in A minor at 120 BPM. Each part is 4 bars on its own track, named by a locator. Set the loop to a part's 4 bars to hear its patch alone. A GeneralUser GS TR-808 kit plays under every part except the noise drums.

- **Riser & Downlifter** (bars 1–4): resonant noise that CC74 opens over bars 1–3, then a hard-played note whose negative filter envelope sweeps the cutoff down 5 octaves into bar 5. The riser is played softly, since filter velocity depth is 1, so the same envelope only dips it.
- **Wind** (bars 5–8): two resonant noise layers panned apart, with CC74 drifting in slow gusts.
- **Tuned Noise** (bars 9–12): Q 40 and keytrack 1, with the cutoff at middle C's frequency, so the noise rings at each note's pitch as a whistled melody.
- **Breathy Lead** (bars 13–16): a triangle with a quiet noise layer whose fast filter envelope adds a breath on each attack.
- **Air Pad** (bars 17–20): two detuned saws with a quiet noise layer under the same slow filter envelope.
- **Noise Drums** (bars 21–24): one patch, with pitch picking the drum through keytrack. Closed and open hats at C7 and a shaker at C6 are short and long noise bursts, the snare at G3 is a noise burst over a triangle body, and the clap at C5 is three quick noise notes plus a tail.

Only the lowpass exists, so the hats are open noise, whose energy already sits in the top octaves.`;

const project = {
  title: "Noise Gallery",
  comment,
  tempo: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  locators: parts.map(([label, beat]) => ({ beat, label })),
  loop: { range: { startBeat: 0, endBeat: PART }, enabled: true },
  midiTracks: [riser, wind, tuned, breathy, pad, noiseDrums, drums],
};

writeFileSync(new URL("project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
