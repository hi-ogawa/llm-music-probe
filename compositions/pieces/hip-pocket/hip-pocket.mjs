// "Hip Pocket": a pitch-bend, CC1, and CC64 demo for Toy MIDI, 16 bars of 4/4 at 98 BPM in E Dorian.
//
// Usage: node hip-pocket.mjs <out dir>
// Writes v1-plain.json (no automation, piano notes lengthened to fake the pedal) and
// v2-expression.json (pitch bend and CC1 on the lead, CC64 on the electric piano).
// Both versions have the same notes and velocities.
//
// Form (bars):
// 1-4   Groove, Em7 | A9 vamp. The saw lead plays a call and answer with scoops, bends up into
//       accented notes, and glides. Bar 4 ends on a held A4 with delayed vibrato.
// 5-8   Groove. Tighter riffs with bends on back-to-back 16ths, a fall at the end of bar 6,
//       and a doit off the A4 in bar 8.
// 9-12  Breakdown, Cmaj9 | Bm11 | Am9 | B7sus4 B7. Electric piano voicings ring under the
//       sustain pedal, re-pedaled on each change. The lead sings long notes with glides and
//       delayed vibrato, and bends D up to D# over the B7.
// 13-16 Groove returns with the busiest bends, then a final E5 over an Em9 hit, with delayed
//       vibrato and a long fall.
import fs from "node:fs";
import path from "node:path";

const [outDir] = process.argv.slice(2);
const BAR = 4;
const END = 16 * BAR;
const at = (bar, beat) => (bar - 1) * BAR + beat;

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const m = (n) => {
  const [, l, acc, o] = n.match(/^([A-G])(#?)(\d)$/);
  return 12 * (Number(o) + 1) + NOTE[l] + (acc ? 1 : 0);
};
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)); // smoothstep
const round = (x) => Math.round(x * 1000) / 1000;

// --- lead: [bar, beat, beats, pitch, velocity, effect] ---
// s: scoop from 1.5 below. u / u1: bend up into the note from 2 / 1 below.
// g: hold, then glide to the next note, which must start where this one ends.
// f<n>: fall n semitones over the tail. d<n>: doit n semitones off the end. v: delayed vibrato.

const LEAD = [
  // bars 1-2: call
  [1, 1.5, 0.25, "B4", 88, "s"],
  [1, 1.75, 0.25, "D5", 90],
  [1, 2, 0.5, "E5", 112, "u"],
  [1, 2.5, 0.25, "D5", 86],
  [1, 2.75, 0.25, "B4", 84],
  [1, 3, 0.5, "A4", 96, "g"],
  [1, 3.5, 0.5, "B4", 98],
  [2, 0.5, 0.25, "E5", 100],
  [2, 0.75, 0.75, "G5", 114, "u1"],
  [2, 1.5, 0.25, "E5", 92],
  [2, 1.75, 0.25, "D5", 88, "g"],
  [2, 2, 1.25, "E5", 100],
  // bars 3-4: answer, ending on a held note with delayed vibrato
  [3, 0.5, 0.25, "E4", 90, "s"],
  [3, 0.75, 0.25, "G4", 92],
  [3, 1, 0.5, "A4", 110, "u"],
  [3, 1.5, 0.25, "G4", 86],
  [3, 1.75, 0.25, "E4", 88],
  [3, 2, 0.25, "D4", 84, "g"],
  [3, 2.25, 0.75, "E4", 96],
  [3, 3.5, 0.25, "B4", 94],
  [3, 3.75, 0.25, "C#5", 96, "g"],
  [4, 0, 0.5, "D5", 108],
  [4, 0.5, 0.25, "C#5", 90],
  [4, 0.75, 0.25, "B4", 88],
  [4, 1, 2, "A4", 100, "v"],
  // bars 5-6: bends on back-to-back 16ths, then a fall
  [5, 0.5, 0.25, "G5", 100, "u1"],
  [5, 0.75, 0.25, "E5", 86],
  [5, 1, 0.25, "G5", 104, "u1"],
  [5, 1.25, 0.25, "E5", 86],
  [5, 1.5, 0.5, "A5", 114, "u"],
  [5, 2, 0.25, "G5", 90],
  [5, 2.25, 0.25, "E5", 88],
  [5, 2.5, 0.25, "D5", 90, "g"],
  [5, 2.75, 0.5, "E5", 98],
  [6, 0.25, 0.25, "C#5", 92, "s"],
  [6, 0.5, 0.25, "E5", 94],
  [6, 0.75, 0.5, "F#5", 110, "u"],
  [6, 1.25, 0.25, "E5", 88],
  [6, 1.5, 0.25, "C#5", 88, "g"],
  [6, 1.75, 0.25, "D5", 90, "g"],
  [6, 2, 1, "E5", 104, "f5"],
  // bars 7-8: call again, then a doit
  [7, 0.5, 0.25, "B4", 88, "s"],
  [7, 0.75, 0.25, "D5", 90],
  [7, 1, 0.25, "E5", 108, "u"],
  [7, 1.25, 0.25, "D5", 100, "u1"],
  [7, 1.5, 0.25, "E5", 108, "u"],
  [7, 1.75, 0.5, "G5", 112, "u1"],
  [7, 2.25, 0.25, "E5", 90],
  [7, 2.5, 0.25, "D5", 88],
  [7, 2.75, 0.5, "B4", 92, "g"],
  [7, 3.25, 0.75, "D5", 100, "g"],
  [8, 0, 0.5, "E5", 104],
  [8, 0.5, 0.25, "C#5", 90],
  [8, 0.75, 0.25, "B4", 88],
  [8, 1, 1, "A4", 100, "d4"],
  // bars 9-12: breakdown, long notes
  [9, 0.5, 0.5, "E5", 94, "s"],
  [9, 1, 2.5, "G5", 100, "v"],
  [9, 3.5, 0.5, "F#5", 88, "g"],
  [10, 0, 2, "D5", 96, "v"],
  [10, 2, 0.5, "E5", 90],
  [10, 2.5, 1.5, "F#5", 98, "g"],
  [11, 0, 2, "A5", 108, "v"],
  [11, 2, 0.5, "G5", 92],
  [11, 2.5, 1.5, "E5", 94, "g"],
  [12, 0, 2, "F#5", 100, "v"],
  [12, 2, 2, "D#5", 104, "u1v"],
  // bars 13-15: the busiest bends
  [13, 0.25, 0.25, "B4", 90, "s"],
  [13, 0.5, 0.25, "D5", 100, "u1"],
  [13, 0.75, 0.25, "E5", 104, "u"],
  [13, 1, 0.5, "G5", 112, "u1"],
  [13, 1.5, 0.25, "E5", 88],
  [13, 1.75, 0.25, "D5", 88],
  [13, 2, 0.5, "B4", 96, "g"],
  [13, 2.5, 0.25, "D5", 92],
  [13, 2.75, 0.75, "E5", 100],
  [14, 0.5, 0.25, "C#5", 90, "s"],
  [14, 0.75, 0.25, "E5", 92],
  [14, 1, 0.25, "F#5", 104, "u"],
  [14, 1.25, 0.25, "E5", 88],
  [14, 1.5, 0.25, "F#5", 106, "u"],
  [14, 1.75, 0.75, "A5", 114, "u"],
  [14, 2.5, 0.25, "G5", 92, "g"],
  [14, 2.75, 0.25, "F#5", 90, "g"],
  [14, 3, 0.5, "E5", 98],
  [15, 0.5, 0.5, "B5", 116, "u"],
  [15, 1, 0.25, "A5", 96],
  [15, 1.25, 0.25, "G5", 92],
  [15, 1.5, 0.25, "E5", 90],
  [15, 1.75, 0.25, "D5", 88, "g"],
  [15, 2, 0.5, "E5", 100],
  [15, 2.5, 0.25, "D5", 88],
  [15, 2.75, 0.25, "B4", 86],
  [15, 3, 0.5, "A4", 96, "g"],
  [15, 3.5, 0.25, "B4", 92],
  [15, 3.75, 0.25, "D5", 94, "g"],
  // bar 16: final note, vibrato then a long fall
  [16, 0, 3.5, "E5", 110, "vf7"],
].map(([bar, beat, dur, n, velocity, fx = ""]) => ({
  pitch: m(n),
  start: at(bar, beat),
  duration: dur,
  velocity,
  fx,
}));

// --- lead pitch bend and CC1, built note by note ---

const STEP = 0.0625; // a 1/64 note, finer than the 1/32 minimum so 16th-note bends stay smooth

const bend = [];
const mod = [];
LEAD.forEach((note, i) => {
  const { start, duration, fx } = note;
  const end = start + duration;
  const next = LEAD[i + 1];
  const ramp = (from, to, a, b, shape = ease) => {
    const n = Math.max(2, Math.round((b - a) / STEP));
    for (let k = 0; k <= n; k++) {
      bend.push({ beat: round(a + ((b - a) * k) / n), semitones: round(from + (to - from) * shape(k / n)) });
    }
  };
  // the bend returns to 0 a 1/64 after the note ends, or where the next note starts
  const reset = () => bend.push({ beat: round(Math.min(end + STEP, next ? next.start : Infinity)), semitones: 0 });

  if (fx.startsWith("s")) ramp(-1.5, 0, start, start + 0.25);
  const up = fx.match(/^u(1?)/);
  if (up) ramp(up[1] ? -1 : -2, 0, start, start + Math.min(0.375, duration * 0.6));
  if (fx === "g") {
    if (!next || next.start !== end) throw new Error(`glide at ${start} needs a legato next note`);
    const len = Math.min(0.375, duration * 0.5);
    ramp(0, next.pitch - note.pitch, end - len, end - 0.03);
    bend.push({ beat: round(end), semitones: 0 });
  }
  const fall = fx.match(/f(\d)/);
  if (fall) {
    const len = Math.min(1, duration * 0.5);
    ramp(0, -Number(fall[1]), end - len, end, (x) => x * x); // accelerating, like a released key
    reset();
  }
  const doit = fx.match(/d(\d)/);
  if (doit) {
    ramp(0, Number(doit[1]), end - Math.min(0.5, duration * 0.5), end, (x) => x * x);
    reset();
  }
  if (fx.includes("v")) {
    // straight tone for the attack, then the vibrato eases in over a beat and stops at the release
    const depth = 60;
    const delay = 0.5;
    for (let b = start; b < end - 0.01; b += 0.125) {
      const value = Math.round(depth * ease((b - start - delay) / 1));
      if (mod.at(-1)?.value !== value) mod.push({ beat: round(b), value });
    }
    mod.push({ beat: round(end), value: 0 });
  }
});
// later points win at the same beat, so a reset never cancels the next note's own bend
const dedupe = (points) =>
  [...new Map(points.map((p) => [p.beat, p])).values()].sort((a, b) => a.beat - b.beat);
const leadBend = dedupe(bend);
const leadMod = dedupe([{ beat: 0, value: 0 }, ...mod]);

// --- harmony ---

const isBreakdown = (bar) => bar >= 9 && bar <= 12;
const GROOVE = { 0: "Em7", 1: "A9" }; // odd bars Em7, even bars A9
const chordOf = (bar) => (bar === 16 ? "Em9" : isBreakdown(bar) ? null : GROOVE[(bar - 1) % 2]);

// rootless voicings in the middle of the keyboard, like a Rhodes player's left hand
const VOICING = {
  Em7: ["G3", "B3", "D4", "F#4"],
  A9: ["G3", "B3", "C#4", "E4"],
  Em9: ["E3", "G3", "B3", "D4", "F#4"],
  Cmaj9: ["C3", "G3", "B3", "D4", "E4"],
  Bm11: ["B2", "A3", "D4", "E4"],
  Am9: ["A2", "G3", "B3", "C4", "E4"],
  B7sus4: ["B2", "A3", "E4", "F#4"],
  B7: ["B2", "A3", "D#4", "F#4"],
};

// --- electric piano: short stabs in the groove, pedaled voicings in the breakdown ---

// [beat in bar, beats, velocity]
const STABS = [
  [0.5, 0.2, 90],
  [1.75, 0.2, 78],
  [2.5, 0.2, 92],
  [3, 0.12, 62],
  [3.25, 0.35, 86],
];
// each breakdown chord: [beat in bar, beats, which voices (indices), velocity]
// the struck notes are short, and the pedal holds them until the next change
const BREAKDOWN_FIGURE = [
  [0, 0.75, "all", 82],
  [1.5, 0.5, "top", 66],
  [2.5, 0.5, "top", 72],
  [3.25, 0.5, "inner", 60],
];
const BREAKDOWN_CHORDS = [
  [9, 0, 4, "Cmaj9"],
  [10, 0, 4, "Bm11"],
  [11, 0, 4, "Am9"],
  [12, 0, 2, "B7sus4"],
  [12, 2, 2, "B7"],
];
const PEDAL_CHANGES = [...BREAKDOWN_CHORDS.map(([bar, beat]) => at(bar, beat)), at(16, 0)];
const PEDAL_LIFTS = [at(13, 0), at(16, 0) + 4];

// v1 fakes the pedal the way an agent does: every note held to the next pedal change
const fakeSustain = (start) => {
  const until = [...PEDAL_CHANGES, ...PEDAL_LIFTS].filter((b) => b > start + 0.01).sort((a, b) => a - b)[0];
  return until - start;
};

const keys = [];
for (let bar = 1; bar <= 16; bar++) {
  const chord = chordOf(bar);
  if (bar === 16) {
    VOICING.Em9.forEach((n, i) => keys.push({ pitch: m(n), start: at(16, 0), duration: 1, velocity: 96 - i * 2, pedal: true }));
    continue;
  }
  if (chord) {
    for (const [beat, dur, velocity] of STABS) {
      VOICING[chord].forEach((n) => keys.push({ pitch: m(n), start: at(bar, beat), duration: dur, velocity }));
    }
  }
}
for (const [bar, off, dur, name] of BREAKDOWN_CHORDS) {
  const voicing = VOICING[name];
  for (const [beat, len, which, velocity] of BREAKDOWN_FIGURE) {
    if (beat >= dur) continue;
    const voices = which === "all" ? voicing : which === "top" ? voicing.slice(-2) : voicing.slice(1, -1);
    voices.forEach((n, i) =>
      keys.push({ pitch: m(n), start: at(bar, off + beat) + (which === "all" ? i * 0.02 : 0), duration: len, velocity, pedal: true }),
    );
  }
}

const pedal = [{ beat: 0, value: 0 }];
for (const change of PEDAL_CHANGES) {
  pedal.push({ beat: change, value: 0 }, { beat: change + 0.25, value: 127 });
}
for (const lift of PEDAL_LIFTS) pedal.push({ beat: lift, value: 0 });
pedal.sort((a, b) => a.beat - b.beat);

// --- bass: 16th-note fingered bass with ghost notes ---

const bass = [];
const ROOT = { Em7: "E1", A9: "A1", Em9: "E1" };
const THIRD = { Em7: 3, A9: 4 };
for (let bar = 1; bar <= 15; bar++) {
  if (isBreakdown(bar)) continue;
  const chord = chordOf(bar);
  const r = m(ROOT[chord]);
  const nextRoot = bar === 8 ? m("C2") : m(ROOT[chordOf(bar + 1)]);
  const pattern = [
    [0, 0.4, 112, r],
    [0.75, 0.2, 92, r + 12],
    [1, 0.12, 52, r], // ghost
    [1.5, 0.25, 96, r + 10],
    [1.75, 0.2, 90, r + 12],
    [2.25, 0.15, 58, r + 12], // ghost
    [2.5, 0.4, 102, r + 7],
    [3, 0.2, 94, r + 10],
    [3.5, 0.2, 84, r + THIRD[chord] + 12],
    [3.75, 0.22, 92, nextRoot - 1], // chromatic approach
  ];
  for (const [beat, dur, velocity, pitch] of pattern) bass.push({ pitch, start: at(bar, beat), duration: dur, velocity });
}
// breakdown: long roots with a pickup into each bar
for (const [bar, root, pickup] of [
  [9, "C2", ["B1", "A#1"]],
  [10, "B1", ["A1", "G#1"]],
  [11, "A1", ["A1", "A#1"]],
]) {
  bass.push({ pitch: m(root), start: at(bar, 0), duration: 3.25, velocity: 104 });
  bass.push({ pitch: m(pickup[0]), start: at(bar, 3.5), duration: 0.22, velocity: 84 });
  bass.push({ pitch: m(pickup[1]), start: at(bar, 3.75), duration: 0.22, velocity: 88 });
}
bass.push({ pitch: m("B1"), start: at(12, 0), duration: 1.75, velocity: 104 });
for (const [beat, n, velocity] of [
  [2, "B1", 100],
  [2.75, "B2", 90],
  [3, "A2", 92],
  [3.25, "F#2", 90],
  [3.5, "D#2", 94],
  [3.75, "D2", 96],
]) {
  bass.push({ pitch: m(n), start: at(12, beat), duration: 0.22, velocity });
}
bass.push({ pitch: m("E1"), start: at(16, 0), duration: 3, velocity: 116 });

// --- drums: GM kit on bank 128 ---

const KICK = 36;
const SNARE = 38;
const RIM = 37;
const HAT = 42;
const OPEN_HAT = 46;
const CRASH = 49;
const drums = [];
const hit = (pitch, start, velocity, duration = 0.2) => drums.push({ pitch, start, duration, velocity });
for (let bar = 1; bar <= 15; bar++) {
  const t = at(bar, 0);
  if (isBreakdown(bar)) {
    for (let i = 0; i < 8; i++) hit(HAT, t + i * 0.5, i % 2 ? 44 : 60);
    hit(KICK, t, 92);
    hit(KICK, t + 2.5, 80);
    hit(RIM, t + 1, 78);
    hit(RIM, t + 3, 78);
    if (bar === 12) {
      // snare fill out of the breakdown, crescendo over beats 3-4
      for (let i = 0; i < 8; i++) hit(SNARE, t + 2 + i * 0.25, 58 + i * 8);
    }
    continue;
  }
  for (let i = 0; i < 16; i++) {
    if (i === 14) {
      hit(OPEN_HAT, t + 3.5, 78, 0.4);
      continue;
    }
    if (i === 15) continue;
    hit(HAT, t + i * 0.25, i % 2 ? 46 : i % 4 === 0 ? 84 : 70);
  }
  for (const beat of [0, 0.75, 2.5]) hit(KICK, t + beat, beat === 0 ? 112 : 98);
  if (bar % 2 === 0) hit(KICK, t + 3.25, 90);
  hit(SNARE, t + 1, 112);
  hit(SNARE, t + 3, 114);
  for (const beat of [1.75, 2.25, 3.75]) hit(SNARE, t + beat, 38); // ghosts
  if (bar === 1 || bar === 5 || bar === 13) hit(CRASH, t, bar === 1 ? 86 : 100, 1);
  if (bar === 8) for (const beat of [3.5, 3.75]) hit(SNARE, t + beat, 96);
}
hit(KICK, at(16, 0), 120);
hit(CRASH, at(16, 0), 110, 2);
hit(SNARE, at(16, 0), 100);

// --- project ---

const strip = ({ pitch, start, duration, velocity }) => ({ pitch, start: round(start), duration: round(duration), velocity });
const track = (name, program, gain, pan, notes, extra = {}) => ({
  name,
  program,
  notes: notes.map(strip),
  muted: false,
  soloed: false,
  gain,
  pan,
  ...extra,
});

const project = (version, shaped) => ({
  title: `Hip Pocket ${version}`,
  comment:
    "A pitch bend, CC1, and CC64 demo, 16 bars of funk at 98 BPM in E Dorian. Bars 1-8 are a 16th-note groove " +
    "on Em7 | A9 under a saw lead riffing with scoops, bends into accents, glides, a fall, and a doit. Bars 9-12 " +
    "break down to Cmaj9 Bm11 Am9 B7sus4 B7, with the electric piano under the sustain pedal and the lead holding " +
    "long notes with delayed vibrato. Bars 13-16 bring the groove back and end on a long fall. " +
    (shaped
      ? "This is the expression version: pitch bend and CC1 on the lead, CC64 on the electric piano."
      : "This is the plain version: the same notes without automation, and electric piano notes in the breakdown held to each chord change instead of pedaled."),
  tempo: 98,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 1,
  locators: [
    { id: "groove", beat: 0, label: "Groove" },
    { id: "riffs", beat: 16, label: "Riffs" },
    { id: "breakdown", beat: 32, label: "Breakdown" },
    { id: "out", beat: 48, label: "Out" },
  ],
  midiTracks: [
    track("Lead", 81, 0.9, 0.15, LEAD, shaped ? {
      automation: [
        { type: "pitch-bend", points: leadBend },
        { type: "controller", controller: 1, points: leadMod },
      ],
    } : {}),
    track(
      "Electric Piano",
      4,
      0.6,
      -0.3,
      shaped ? keys : keys.map((n) => (n.pedal ? { ...n, duration: fakeSustain(n.start) } : n)),
      shaped ? { automation: [{ type: "controller", controller: 64, points: pedal }] } : {},
    ),
    track("Bass", 33, 0.95, 0, bass),
    track("Drums", 0, 1, 0, drums, { bank: 128 }),
  ],
  loop: { enabled: false, range: { startBeat: 0, endBeat: END } },
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "v1-plain.json"), JSON.stringify(project("v1 (plain)", false), null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "v2-expression.json"), JSON.stringify(project("v2 (expression)", true), null, 2) + "\n");
