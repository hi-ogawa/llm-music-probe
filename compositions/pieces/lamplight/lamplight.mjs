// "Lamplight": a sustain pedal (CC64), vibrato (CC1), and pitch-bend demo for Toy MIDI.
// A clarinet and piano ballad, 16 bars of 4/4 at 66 BPM in E-flat major.
//
// Usage: node lamplight.mjs <out dir>
// Writes v1-plain.json (no expression, piano notes stretched to fake sustain) and
// v2-expression.json (pedaled piano, clarinet vibrato and scoops). Both versions have the same
// notes and velocities. Only the piano's note lengths differ, because v1 fakes the pedal.
//
// Form (bars):
// 1-2   Piano alone. Ebmaj9, then Abmaj9 and Bb13sus4, re-pedaled on each change.
// 3-6   Clarinet phrase. Long G5 and Ab5 with delayed vibrato, a scooped pickup into bar 3.
// 7-10  Clarinet climbs to C6 over Abmaj7 turning to Abm6 (C to Cb, the clearest smear in v1),
//       then falls back through Eb/G, Gbdim7, Fm7, Bb9.
// 11-12 Piano alone. Cm9, F9/A, Abm6, Bb13sus4, two chords a bar.
// 13-16 Clarinet returns and cadences on a held Eb5 with the deepest vibrato. The pedal holds the
//       last chord and lifts at the end.
//
// The lead was planned as Flute (73), but the GeneralUser GS flute sample has its own vibrato baked
// in (about ±20 cents at 5.7 Hz with CC1 at 0), which masks CC1. Clarinet (71) is a clean sample.
import fs from "node:fs";
import path from "node:path";

const [outDir] = process.argv.slice(2);
const BAR = 4;
const END = 16 * BAR;

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const m = (n) => {
  const [, l, acc, o] = n.match(/^([A-G])([#b]?)(\d)$/);
  return 12 * (Number(o) + 1) + NOTE[l] + (acc === "#" ? 1 : acc === "b" ? -1 : 0);
};
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)); // smoothstep
const easeOut = (x) => 1 - (1 - Math.min(1, Math.max(0, x))) ** 2;
const at = (bar, off) => (bar - 1) * BAR + off;

// --- harmony: [bar, beat offset, beats, voicing low to high (bass, then four arpeggio tones)] ---

const V = {
  Ebmaj9: ["Eb2", "Bb2", "G3", "D4", "F4"],
  Ebmaj7: ["Eb2", "Bb2", "G3", "Bb3", "D4"],
  Abmaj9: ["Ab1", "Eb2", "G3", "Bb3", "C4"],
  Abmaj7: ["Ab1", "Eb2", "G3", "C4", "Eb4"],
  Abm6: ["Ab1", "Eb2", "F3", "Cb4", "Eb4"],
  Bb13sus: ["Bb1", "F2", "Ab3", "C4", "Eb4"],
  Bb9: ["Bb1", "F2", "Ab3", "C4", "D4"],
  Gm7: ["G1", "D2", "F3", "Bb3", "D4"],
  C7b9: ["C2", "G2", "E3", "Bb3", "Db4"],
  Cm9: ["C2", "G2", "Eb3", "Bb3", "D4"],
  Fm9: ["F1", "C2", "Ab3", "Eb4", "G4"],
  Fm7: ["F1", "C2", "Ab3", "C4", "Eb4"],
  EbG: ["G1", "Eb2", "G3", "Bb3", "Eb4"],
  Gbdim7: ["Gb1", "Eb2", "A3", "C4", "Eb4"],
  F9A: ["A1", "Eb2", "G3", "A3", "C4"],
  EbBb: ["Bb1", "Eb2", "G3", "Bb3", "Eb4"],
};
const CHORDS = [
  [1, 0, 4, "Ebmaj9"],
  [2, 0, 2, "Abmaj9"], [2, 2, 2, "Bb13sus"],
  [3, 0, 4, "Ebmaj7"],
  [4, 0, 2, "Gm7"], [4, 2, 2, "C7b9"],
  [5, 0, 4, "Fm9"],
  [6, 0, 2, "Bb13sus"], [6, 2, 2, "Bb9"],
  [7, 0, 2, "Gm7"], [7, 2, 2, "Cm9"],
  [8, 0, 2, "Abmaj7"], [8, 2, 2, "Abm6"],
  [9, 0, 2, "EbG"], [9, 2, 2, "Gbdim7"],
  [10, 0, 2, "Fm7"], [10, 2, 2, "Bb9"],
  [11, 0, 2, "Cm9"], [11, 2, 2, "F9A"],
  [12, 0, 2, "Abm6"], [12, 2, 2, "Bb13sus"],
  [13, 0, 4, "Ebmaj7"],
  [14, 0, 2, "Abmaj7"], [14, 2, 2, "Abm6"],
  [15, 0, 2, "EbBb"], [15, 2, 2, "Bb9"],
  [16, 0, 4, "Ebmaj9"],
];
const SOLO_BARS = [1, 2, 11, 12];

// --- piano: broken chords in 8ths, as a pianist plays them with the pedal ---
// Each note has its key length (v2). v1 stretches them to fake the pedal, the way agents do:
// every note rings to the end of its bar, so the first chord of a bar smears into the second.

const piano = [];
for (const [bar, off, dur, name] of CHORDS) {
  const tones = V[name].map(m);
  const start = at(bar, off);
  const solo = SOLO_BARS.includes(bar);
  const last = bar === 16;
  piano.push({ pitch: tones[0], start, duration: 1, velocity: solo ? 70 : 64, role: "bass" });
  const order = last ? [1, 2, 3, 4] : dur === 4 ? [1, 2, 3, 4, 3, 2, 4, 3] : [1, 2, 3, 4];
  order.forEach((idx, i) => {
    if (i === 0 && !last) return; // the bass takes the first 8th
    const s = start + i * 0.5;
    const accent = i === 2 || i === 4 ? 4 : 0;
    piano.push({ pitch: tones[idx], start: s, duration: 0.5, velocity: (solo ? 60 : 54) + accent, role: "arp" });
  });
  if (last) {
    // after the rising arpeggio, a soft high Bb on beat 3 that the pedal lets ring
    piano.push({ pitch: m("Bb4"), start: start + 2, duration: 0.5, velocity: 56, role: "arp" });
  }
}
// a top line in the piano-alone bars, so they sing on their own
const TOP = [
  [1, 0, 1.5, "Bb4", 70], [1, 1.5, 0.5, "C5", 62], [1, 2, 2, "G4", 66],
  [2, 0, 1.5, "C5", 70], [2, 1.5, 0.5, "Bb4", 62], [2, 2, 1, "Eb5", 66],
  [11, 0, 1.5, "G4", 70], [11, 1.5, 0.5, "Bb4", 62], [11, 2, 2, "A4", 66],
  [12, 0, 1.5, "Cb5", 70], [12, 1.5, 0.5, "Bb4", 62], [12, 2, 1, "Ab4", 64],
];
for (const [bar, off, dur, n, velocity] of TOP) {
  piano.push({ pitch: m(n), start: at(bar, off), duration: dur, velocity, role: "top" });
}
piano.sort((a, b) => a.start - b.start || a.pitch - b.pitch);

const barEnd = (beat) => (Math.floor(beat / BAR) + 1) * BAR;
const pianoPlain = piano.map((n) => ({
  ...n,
  duration: (n.start >= at(16, 0) ? END + 1 : barEnd(n.start)) - n.start,
}));

// --- clarinet: [bar, beat offset, pitch, beats, velocity, marks] ---
// marks: "scoop" on a phrase entry, "end" for a phrase end (released a little early)

const LINE = [
  [2, 3, "Bb4", 1, 72, "scoop"],
  [3, 0, "G5", 3, 82], [3, 3, "F5", 0.5, 74], [3, 3.5, "Eb5", 0.5, 72],
  [4, 0, "D5", 1.5, 76], [4, 1.5, "Eb5", 0.5, 72], [4, 2, "E5", 1, 76], [4, 3, "G5", 1, 78],
  [5, 0, "Ab5", 3, 84], [5, 3, "G5", 0.5, 76], [5, 3.5, "F5", 0.5, 74],
  [6, 0, "Eb5", 2, 76], [6, 2, "D5", 1.5, 72, "end"],
  [7, 0.5, "Bb4", 0.5, 70, "scoop"], [7, 1, "D5", 0.5, 74], [7, 1.5, "G5", 0.5, 78], [7, 2, "Bb5", 2, 84],
  [8, 0, "C6", 2, 90, "scoop"], [8, 2, "Cb6", 1.5, 84], [8, 3.5, "Bb5", 0.5, 78],
  [9, 0, "Bb5", 2, 80], [9, 2, "A5", 1, 78], [9, 3, "C6", 1, 82],
  [10, 0, "Ab5", 1.5, 80], [10, 1.5, "G5", 0.5, 74], [10, 2, "F5", 2, 74, "end"],
  [12, 3, "Bb4", 0.5, 70, "scoop"], [12, 3.5, "C5", 0.5, 72],
  [13, 0, "G5", 2.5, 80], [13, 2.5, "F5", 0.5, 72], [13, 3, "Eb5", 0.5, 72], [13, 3.5, "F5", 0.5, 74],
  [14, 0, "G5", 2, 80], [14, 2, "F5", 1.5, 76], [14, 3.5, "Eb5", 0.5, 72],
  [15, 0, "G5", 1.5, 78], [15, 1.5, "Eb5", 0.5, 72], [15, 2, "F5", 1, 74], [15, 3, "D5", 1, 72],
  [16, 0, "Eb5", 3.75, 76, "end"],
];
const lead = LINE.map(([bar, off, n, dur, velocity, mark], i) => {
  const next = LINE[i + 1];
  const start = at(bar, off);
  const nextStart = next ? at(next[0], next[1]) : Infinity;
  // legato: touch the next note, but don't overlap it, so a scoop on it bends only it
  const duration = mark === "end" ? dur - 0.1 : Math.min(dur, nextStart - start);
  return { pitch: m(n), start, duration, velocity, mark };
});

// --- expression ---

// Scoop: start a semitone low and ease up to pitch within a 1/16, points every 1/64.
// Kept to a semitone (less near the top), so the scoop reads as a lift rather than a smear.
const bendPoints = [{ beat: 0, semitones: 0 }];
for (const n of lead.filter((n) => n.mark === "scoop")) {
  const depth = n.pitch >= m("C6") ? 0.6 : 1;
  for (let i = 0; i <= 4; i++) {
    const x = i / 4;
    bendPoints.push({ beat: n.start + x * 0.25, semitones: -depth * (1 - easeOut(x)) });
  }
}
const round = (v, d = 1000) => Math.round(v * d) / d;
const bend = { type: "pitch-bend", points: bendPoints.map((p) => ({ beat: round(p.beat), semitones: round(p.semitones) })) };

// Delayed vibrato: CC1 at 0 for the attack, then easing up to a depth that grows with the note
// length, and back to 0 at the next note. Only notes of 1.5 beats or more get vibrato.
const vibrato = [{ beat: 0, value: 0 }];
for (const n of lead.filter((n) => n.duration >= 1.4)) {
  const long = n.duration >= 2.5;
  const final = n.start >= at(16, 0);
  const delay = long ? 0.75 : 0.5;
  const rise = long ? 1.25 : 0.75;
  const depth = final ? 60 : long ? 54 : 42;
  const end = n.start + n.duration;
  for (let b = n.start + delay; b < end - 0.0625; b += 0.125) {
    // phrase ends taper the vibrato with the breath
    const taper = n.mark === "end" ? 1 - ease((b - (end - 1)) / 1) * 0.5 : 1;
    vibrato.push({ beat: round(b), value: Math.round(depth * ease((b - n.start - delay) / rise) * taper) });
  }
  vibrato.push({ beat: round(end), value: 0 });
}
const dedupe = (points) => points.filter((p, i) => i === 0 || p.value !== points[i - 1].value);
const cc1 = { type: "controller", controller: 1, points: dedupe(vibrato) };

// Pedal: down a 1/16 after each chord starts, up exactly at the next change, so each harmony
// rings and the previous one clears. The last chord holds until the end.
const pedalPoints = [];
CHORDS.forEach(([bar, off, dur], i) => {
  const start = at(bar, off);
  if (i > 0) pedalPoints.push({ beat: start, value: 0 });
  pedalPoints.push({ beat: start + 0.25, value: 127 });
});
pedalPoints.push({ beat: END + 1, value: 0 });
const cc64 = { type: "controller", controller: 64, points: pedalPoints };

// --- project ---

const track = (name, program, gain, pan, notes) => ({
  name,
  program,
  notes: notes.map(({ pitch, start, duration, velocity }) => ({ pitch, start, duration: round(duration), velocity })),
  muted: false,
  soloed: false,
  gain,
  pan,
});

const project = (version, shaped) => ({
  title: `Lamplight ${version}`,
  comment:
    "A sustain pedal, vibrato, and pitch-bend demo, 16 bars at 66 BPM in E-flat major, clarinet and piano. " +
    "Bars 1-2 and 11-12 are piano alone, re-pedaled on every chord change. Bars 3-10 and 13-16 put the clarinet " +
    "over the pedaled piano, with delayed vibrato on long notes and gentle scoops on phrase entries. " +
    (shaped
      ? "This is the shaped version: CC64 on the piano, CC1 and pitch bend on the clarinet."
      : "This is the plain version, with the same notes and no expression. The piano notes are stretched to fake the pedal."),
  tempo: 66,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 1,
  locators: [
    { id: "intro", beat: 0, label: "Piano alone" },
    { id: "phrase-1", beat: 8, label: "Clarinet" },
    { id: "climb", beat: 24, label: "Climb" },
    { id: "interlude", beat: 40, label: "Piano alone" },
    { id: "return", beat: 48, label: "Return" },
  ],
  midiTracks: [
    { ...track("Clarinet", 71, 0.6, 0.15, lead), ...(shaped ? { automation: [cc1, bend] } : {}) },
    { ...track("Piano", 0, 0.95, -0.1, shaped ? piano : pianoPlain), ...(shaped ? { automation: [cc64] } : {}) },
  ],
  loop: { enabled: false, range: { startBeat: 0, endBeat: END } },
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "v1-plain.json"), JSON.stringify(project("v1 (plain)", false), null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "v2-expression.json"), JSON.stringify(project("v2 (expression)", true), null, 2) + "\n");
