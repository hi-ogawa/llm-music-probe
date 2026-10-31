// Writes project.json for "Supersaw Horizon", a trance piece in A minor at 138 BPM
// that demos Toy MIDI's per-layer `octave` and `detune` on its own synth.
//
// Usage: node generate.mjs

import fs from "node:fs";
import path from "node:path";

const TEMPO = 138;
const BAR = 4;
const bar = (n) => (n - 1) * BAR; // 1-based bar number -> beat

// --- sections (1-based bars, end exclusive) ---

const SECTIONS = [
  { label: "Intro", start: 1 },
  { label: "Build", start: 9 },
  { label: "Breakdown", start: 17 },
  { label: "Riser", start: 25 },
  { label: "Drop 1", start: 29 },
  { label: "Drop 2", start: 37 },
  { label: "Outro", start: 45 },
];
const END_BAR = 49;

// --- harmony ---

// One chord per 2 bars. Drop 2 swaps the last G for E major, the harmonic
// minor V, so the lead's G# can bend up into the outro's A.
const CHORDS = {
  Am: { root: 45, pad: [57, 60, 64, 69], arp: [69, 72, 76, 81] },
  F: { root: 41, pad: [57, 60, 65, 69], arp: [65, 69, 72, 77] },
  C: { root: 48, pad: [55, 60, 64, 67], arp: [67, 72, 76, 79] },
  G: { root: 43, pad: [55, 59, 62, 67], arp: [67, 71, 74, 79] },
  E: { root: 40, pad: [56, 59, 64, 68], arp: [68, 71, 76, 80] },
};
const PROG_A = ["Am", "F", "C", "G"];
const PROG_B = ["Am", "F", "C", "E"];

// Chord at a bar, for the 8-bar cycles from bar 9 on.
function chordAt(barNo, prog) {
  const i = Math.floor(((barNo - 1) % 8) / 2);
  return CHORDS[prog[i]];
}

// --- patches ---

const env = (attack, decay, sustain, release) => ({
  envelope: { attack, decay, sustain, release },
});
// Layer gains below are relative within a patch. The synth renders quietly
// at those values, so every layer is scaled up by the same factor.
const LAYER_SCALE = 4;
const layer = (waveform, gain, amp, { octave = 0, detune = 0 } = {}) => ({
  oscillator: { waveform, octave, detune },
  gain: Math.round(gain * LAYER_SCALE * 1000) / 1000,
  amp,
});

// Lead: four saws spread to ±14 cents for the beating, a fifth saw an
// octave up for air, and a sine an octave down for body.
const leadAmp = env(0.008, 0.25, 0.8, 0.22);
const LEAD = {
  layers: [
    layer("sawtooth", 0.13, leadAmp, { detune: -14 }),
    layer("sawtooth", 0.13, leadAmp, { detune: -5 }),
    layer("sawtooth", 0.13, leadAmp, { detune: 6 }),
    layer("sawtooth", 0.13, leadAmp, { detune: 15 }),
    layer("sawtooth", 0.07, leadAmp, { octave: 1, detune: 8 }),
    layer("sine", 0.18, leadAmp, { octave: -1 }),
  ],
};

// Pad: the widest stack in the piece, five saws spread unevenly to about
// ±20 cents, so the beating never settles into one rate. A triangle an
// octave down gives it body.
const padAmp = env(0.45, 0.6, 0.85, 1.4);
const PAD = {
  layers: [
    ...[-21, -10, -3, 9, 20].map((detune) => layer("sawtooth", 0.1, padAmp, { detune })),
    layer("triangle", 0.14, padAmp, { octave: -1, detune: -3 }),
  ],
};

// Bass: a saw at pitch for the bite, and the sub as a sine an octave down.
const bassAmp = env(0.002, 0.09, 0.55, 0.03);
const BASS = {
  layers: [
    layer("sawtooth", 0.22, bassAmp),
    layer("sine", 0.55, env(0.002, 0.12, 0.8, 0.04), { octave: -1 }),
  ],
};

// Pluck arp: two saws at ±7 cents and a square an octave up, all decaying
// to nothing.
const pluckAmp = env(0.001, 0.16, 0, 0.09);
const ARP = {
  layers: [
    layer("sawtooth", 0.35, pluckAmp, { detune: -7 }),
    layer("sawtooth", 0.35, pluckAmp, { detune: 7 }),
    layer("square", 0.14, env(0.001, 0.07, 0, 0.05), { octave: 1 }),
  ],
};

// --- helpers ---

const note = (pitch, start, duration, velocity = 100) => ({
  pitch,
  start,
  duration,
  velocity,
});

function sortPoints(points) {
  return points.sort((a, b) => a.beat - b.beat);
}

// --- lead melody ---

// [beat offset, pitch, duration] over 8 bars (32 beats).
const A4 = 69, B4 = 71, C5 = 72, D5 = 74, E5 = 76, F5 = 77, G5 = 79;
const Gs5 = 80, A5 = 81, B5 = 83, C6 = 84, G4 = 67;

// Call: climbs the A minor triad to A5 and falls back, then answers itself
// a step lower over F.
const CALL = [
  [0, A4, 0.75], [0.75, C5, 0.75], [1.5, E5, 1], [2.5, D5, 0.5], [3, E5, 1],
  [4, A5, 1.5], [5.5, G5, 0.5], [6, E5, 2],
  [8, F5, 0.75], [8.75, E5, 0.75], [9.5, C5, 1], [10.5, A4, 0.5], [11, C5, 1],
  [12, D5, 1.5], [13.5, C5, 0.5], [14, A4, 2],
];
// Answer: the same rhythm from G4 up to the peak, C6, then down over G,
// leaving E5 hanging to pull back to the call's A.
const ANSWER_A = [
  [16, G4, 0.75], [16.75, C5, 0.75], [17.5, E5, 1], [18.5, G5, 0.5], [19, E5, 1],
  [20, E5, 0.75], [20.75, G5, 0.75], [21.5, C6, 2.5],
  [24, B5, 0.75], [24.75, A5, 0.75], [25.5, G5, 1], [26.5, D5, 0.5], [27, G5, 1],
  [28, D5, 1], [29, B4, 0.5], [29.5, D5, 0.5], [30, E5, 2],
];
// Drop 2's answer turns to E major and ends on a held G# that bends up a
// semitone into the outro's A.
const ANSWER_B = [
  ...ANSWER_A.filter(([t]) => t < 24),
  [24, B5, 0.75], [24.75, Gs5, 0.75], [25.5, E5, 1], [26.5, B4, 0.5], [27, E5, 1],
  [28, Gs5, 4],
];

function leadPart() {
  const notes = [];
  const cc1 = [{ beat: 0, value: 0 }];
  const cc11 = [{ beat: 0, value: 100 }];
  const bend = [{ beat: 0, semitones: 0 }];

  const place = (phrase, startBeat, velocity) => {
    for (const [t, pitch, dur] of phrase) {
      const s = startBeat + t;
      notes.push(note(pitch, s, dur, velocity));
      // Vibrato fades in on long notes and is gone by the next note.
      if (dur >= 2) {
        cc1.push({ beat: s, value: 0 });
        cc1.push({ beat: s + 0.75, value: 30 });
        cc1.push({ beat: s + 1.25, value: 55 });
        cc1.push({ beat: s + dur - 0.01, value: 0 });
      }
    }
  };

  // Breakdown: the whole hook, softer, over the pad alone.
  cc11.push({ beat: bar(17), value: 100 });
  place([...CALL, ...ANSWER_A], bar(17), 90);
  // Riser: the call again, louder each bar, cut before the drop.
  cc11.push({ beat: bar(25), value: 102 });
  cc11.push({ beat: bar(26), value: 106 });
  cc11.push({ beat: bar(27), value: 110 });
  cc11.push({ beat: bar(28), value: 114 });
  place(CALL.filter(([t]) => t < 14), bar(25), 100);
  notes.push(note(A4, bar(28) + 2, 1.5, 100));
  // Drops: full level.
  cc11.push({ beat: bar(29), value: 118 });
  place([...CALL, ...ANSWER_A], bar(29), 112);
  place([...CALL, ...ANSWER_B], bar(37), 116);
  // The held G# bends up into A over its last beat.
  const gs = bar(37) + 28;
  bend.push({ beat: gs + 2.5, semitones: 0 });
  for (let i = 1; i <= 8; i++) {
    bend.push({ beat: gs + 2.5 + i * 0.1875, semitones: i / 8 });
  }
  bend.push({ beat: bar(45), semitones: 0 });
  // Outro: the A lands, held and fading.
  notes.push(note(A5, bar(45), 7.5, 110));
  cc1.push({ beat: bar(45), value: 0 });
  cc1.push({ beat: bar(45) + 1, value: 60 });
  cc1.push({ beat: bar(45) + 7.5, value: 0 });
  for (let i = 1; i <= 8; i++) {
    cc11.push({ beat: bar(45) + 2 + i * 0.6, value: Math.round(118 - i * 11) });
  }

  return {
    notes,
    automation: [
      { type: "controller", controller: 1, points: sortPoints(cc1) },
      { type: "controller", controller: 11, points: sortPoints(cc11) },
      { type: "pitch-bend", points: sortPoints(bend) },
    ],
  };
}

// --- pad ---

function padPart() {
  const notes = [];
  const cc11 = [{ beat: 0, value: 0 }];
  const chordBlock = (startBar, bars, prog, velocity) => {
    for (let b = startBar; b < startBar + bars; b += 2) {
      const chord = chordAt(b, prog);
      for (const p of chord.pad) notes.push(note(p, bar(b), 8, velocity));
    }
  };
  // Build: swells in over the second half.
  chordBlock(13, 4, PROG_A, 80);
  cc11.push({ beat: bar(13), value: 20 });
  for (let i = 1; i <= 8; i++) {
    cc11.push({ beat: bar(13) + i * 2, value: 20 + i * 10 });
  }
  // Breakdown and riser carry the most pad.
  cc11.push({ beat: bar(17), value: 112 });
  chordBlock(17, 8, PROG_A, 95);
  chordBlock(25, 4, ["Am", "F", "Am", "F"], 95);
  // Drops sit the pad behind the lead.
  cc11.push({ beat: bar(29), value: 105 });
  chordBlock(29, 8, PROG_A, 90);
  chordBlock(37, 8, PROG_B, 90);
  // Outro: one last Am.
  notes.push(...CHORDS.Am.pad.map((p) => note(p, bar(45), 8, 85)));
  return {
    notes,
    automation: [{ type: "controller", controller: 11, points: sortPoints(cc11) }],
  };
}

// --- bass ---

// Rolling bass: the three 16ths after each kick.
function rollBar(notes, barNo, root, { octaveFlip = false } = {}) {
  for (let beat = 0; beat < 4; beat++) {
    for (let step = 1; step < 4; step++) {
      const up = octaveFlip && beat === 3 && step === 3;
      notes.push(
        note(root + (up ? 12 : 0), bar(barNo) + beat + step / 4, 0.2, step === 1 ? 108 : 92),
      );
    }
  }
}

function bassPart() {
  const notes = [];
  // Intro: an A pedal, flipping up an octave at the end of each 4 bars.
  for (let b = 1; b < 9; b++) {
    rollBar(notes, b, CHORDS.Am.root, { octaveFlip: b % 4 === 0 });
  }
  // Build: the progression arrives. The last two beats drop out.
  for (let b = 9; b < 17; b++) rollBar(notes, b, chordAt(b, PROG_A).root);
  dropFrom(notes, bar(16) + 2);
  // Drops, with an octave flip at each chord change.
  for (let b = 29; b < 37; b++) {
    rollBar(notes, b, chordAt(b, PROG_A).root, { octaveFlip: b % 2 === 0 });
  }
  for (let b = 37; b < 45; b++) {
    rollBar(notes, b, chordAt(b, PROG_B).root, { octaveFlip: b % 2 === 0 });
  }
  // Outro: two bars of A, then a last low A.
  for (let b = 45; b < 47; b++) rollBar(notes, b, CHORDS.Am.root);
  notes.push(note(CHORDS.Am.root, bar(47), 2, 110));
  return { notes };
}

function dropFrom(notes, beat) {
  for (let i = notes.length - 1; i >= 0; i--) {
    if (notes[i].start >= beat && notes[i].start < beat + 2) notes.splice(i, 1);
  }
}

// --- arp ---

const ARP_A = [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3, 2, 1, 3, 2];
const ARP_B = [3, 2, 0, 2, 3, 1, 0, 1, 3, 2, 0, 2, 1, 2, 3, 2];

function arpBar(notes, barNo, chord, pattern, velocity) {
  pattern.forEach((idx, step) => {
    notes.push(note(chord.arp[idx], bar(barNo) + step / 4, 0.22, step % 4 === 0 ? velocity : velocity - 14));
  });
}

function arpPart() {
  const notes = [];
  const cc11 = [{ beat: 0, value: 0 }];
  // Build: fades up over 8 bars, dropping out with the bass.
  for (let b = 9; b < 17; b++) arpBar(notes, b, chordAt(b, PROG_A), ARP_A, 100);
  dropFrom(notes, bar(16) + 2);
  for (let i = 0; i <= 16; i++) {
    cc11.push({ beat: bar(9) + i * 2, value: Math.round(35 + i * 4.5) });
  }
  // Drop 1 keeps the build's pattern, drop 2 turns it around.
  cc11.push({ beat: bar(29), value: 105 });
  for (let b = 29; b < 37; b++) arpBar(notes, b, chordAt(b, PROG_A), ARP_A, 105);
  for (let b = 37; b < 45; b++) arpBar(notes, b, chordAt(b, PROG_B), ARP_B, 108);
  return {
    notes,
    pan: 0.25,
    automation: [{ type: "controller", controller: 11, points: sortPoints(cc11) }],
  };
}

// --- drums ---

const KICK = 36, SNARE = 38, CLAP = 39, CH = 42, OH = 46, CRASH = 49;

function drumPart() {
  const notes = [];
  const hit = (pitch, beat, velocity) => notes.push(note(pitch, beat, 0.25, velocity));
  const kicks = (b, beats = [0, 1, 2, 3]) => beats.forEach((x) => hit(KICK, bar(b) + x, 118));
  const offHats = (b, pitch, velocity) => [0.5, 1.5, 2.5, 3.5].forEach((x) => hit(pitch, bar(b) + x, velocity));
  const claps = (b) => [1, 3].forEach((x) => hit(CLAP, bar(b) + x, 100));
  const sixteenths = (b, velocity) => {
    for (let s = 0; s < 16; s++) if (s % 2 === 1 || s % 4 === 0) hit(CH, bar(b) + s / 4, s % 4 === 2 ? velocity : velocity - 25);
  };
  const roll = (fromBeat, toBeat, step, v0, v1) => {
    const n = Math.round((toBeat - fromBeat) / step);
    for (let i = 0; i < n; i++) hit(SNARE, fromBeat + i * step, Math.round(v0 + ((v1 - v0) * i) / n));
  };

  // Intro: kick and off-beat hat, then clap and 16th hats from bar 5.
  for (let b = 1; b < 9; b++) {
    kicks(b, b === 8 ? [0, 1, 2] : [0, 1, 2, 3]);
    offHats(b, CH, 85);
    if (b >= 5) {
      claps(b);
      sixteenths(b, 70);
    }
  }
  hit(SNARE, bar(8) + 3, 80);
  hit(SNARE, bar(8) + 3.5, 95);
  // Build: open hats, then a snare roll that tightens into bar 16.
  hit(CRASH, bar(9), 100);
  for (let b = 9; b < 17; b++) {
    kicks(b, b === 16 ? [0, 1] : [0, 1, 2, 3]);
    offHats(b, OH, 80);
    claps(b);
    sixteenths(b, 65);
  }
  roll(bar(13), bar(15), 1, 50, 75);
  roll(bar(15), bar(16), 0.5, 75, 95);
  roll(bar(16), bar(17), 0.25, 95, 125);
  // Breakdown: only a crash to mark it.
  hit(CRASH, bar(17), 80);
  // Riser: a snare roll from quarters to 32nds, no kick.
  roll(bar(25), bar(26), 1, 25, 40);
  roll(bar(26), bar(27), 0.5, 40, 54);
  roll(bar(27), bar(28), 0.25, 54, 70);
  roll(bar(28), bar(28) + 3.5, 0.125, 70, 90);
  // Drops: everything, with a fill before drop 2.
  for (let b = 29; b < 45; b++) {
    if (b === 29 || b === 37) hit(CRASH, bar(b), 115);
    kicks(b);
    offHats(b, OH, 88);
    claps(b);
    sixteenths(b, 72);
  }
  roll(bar(36) + 3, bar(37), 0.25, 90, 120);
  // Outro: thins out to the kick.
  hit(CRASH, bar(45), 110);
  for (let b = 45; b < 49; b++) {
    kicks(b, b === 48 ? [0] : [0, 1, 2, 3]);
    if (b < 47) {
      offHats(b, OH, 80);
      claps(b);
    } else if (b === 47) {
      offHats(b, CH, 70);
    }
  }
  return { notes };
}

// --- project ---

const eq = (...bands) => ({ bypass: false, bands: bands.map((b) => ({ gain: 1, q: 0.707, bypass: false, ...b })) });

const track = (name, fields) => ({
  name,
  program: 0,
  muted: false,
  soloed: false,
  ...fields,
});

const lead = leadPart();

const project = {
  title: "Supersaw Horizon",
  comment: [
    "Trance in A minor at 138 BPM, on Toy MIDI's own synth.",
    "",
    "Detune is the star: the lead, the pad, and the pluck are each a stack of saws, spread from ±7 cents on the pluck to about ±20 on the pad. `octave` layers add a sine sub under the bass, air over the lead, and body under the pad.",
    "",
    "Intro (1) · Build (9) · Breakdown (17) · Riser (25) · Drop 1 (29) · Drop 2 (37) · Outro (45)",
  ].join("\n"),
  tempo: TEMPO,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 0.6,
  locators: SECTIONS.map((s) => ({ beat: bar(s.start), label: s.label })),
  loop: { enabled: false, range: { startBeat: bar(29), endBeat: bar(37) } },
  midiTracks: [
    track("Lead", {
      synth: LEAD,
      gain: 1.6,
      ...lead,
      eq: eq({ type: "high-pass", frequency: 180 }, { type: "low-pass", frequency: 7500 }),
      keySignature: { fifths: 0, mode: "minor" },
    }),
    track("Pad", {
      synth: PAD,
      gain: 0.67,
      ...padPart(),
      eq: eq({ type: "high-pass", frequency: 220 }, { type: "low-pass", frequency: 4200 }),
      keySignature: { fifths: 0, mode: "minor" },
    }),
    track("Pluck Arp", {
      synth: ARP,
      gain: 1.3,
      ...arpPart(),
      eq: eq({ type: "high-pass", frequency: 300 }, { type: "low-pass", frequency: 3200 }),
      keySignature: { fifths: 0, mode: "minor" },
    }),
    track("Bass", {
      synth: BASS,
      gain: 1,
      ...bassPart(),
      eq: eq({ type: "low-pass", frequency: 900 }),
      keySignature: { fifths: 0, mode: "minor" },
    }),
    track("Drums", {
      bank: 128,
      program: 24,
      gain: 2,
      ...drumPart(),
    }),
  ],
};

for (const t of project.midiTracks) t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);

const out = path.join(import.meta.dirname, "project.json");
fs.writeFileSync(out, JSON.stringify(project, null, 2) + "\n");
console.log(`wrote ${out}`);
