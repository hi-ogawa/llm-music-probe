import { deflateRawSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const p = (s) => {
  const m = /^([A-G])(b|#)?(-?\d)$/.exec(s);
  return PC[m[1]] + (m[2] === "b" ? -1 : m[2] === "#" ? 1 : 0) + (+m[3] + 1) * 12;
};
const ps = (str) => str.split(" ").map(p);
const at = (bar, beat) => (bar - 1) * 4 + beat;

const tracks = {};
const add = (name, pitch, start, duration, velocity) => {
  (tracks[name] ??= []).push({ pitch, start: +start.toFixed(4), duration, velocity: Math.max(1, Math.min(127, Math.round(velocity))) });
};

// ---------- harmony: [bar, beat, dur, voicing] ----------
const verseChords = [
  [1, 0, 2, "G3 Bb3 C4 Eb4"], [1, 2, 2, "Ab3 C4 Eb4 Ab4"],
  [2, 0, 2, "Ab3 C4 Eb4 F4"], [2, 2, 2, "Ab3 B3 D4 F4"],
  [3, 0, 2, "Ab3 C4 Eb4 Ab4"], [3, 2, 2, "A3 Eb4 F4 Ab4 Db5"],
  [4, 0, 2, "Ab3 C4 Db4 F4"], [4, 2, 2, "G3 Db4 E4 G4 C5"],
  [5, 0, 2, "Ab3 C4 Eb4 G4"], [5, 2, 2, "Ab3 C4 F4 G4"],
  [6, 0, 2, "Ab3 C4 Eb4 F4"], [6, 2, 2, "Bb3 E4 Ab4 C5 Eb5"],
  [7, 0, 2, "Ab3 C4 Db4 F4"], [7, 2, 2, "Ab3 B3 D4 F4"],
  [8, 0, 2, "Ab3 C4 Eb4 Ab4"], [8, 2, 2, "Gb3 C4 E4 Ab4 B4"],
];
// chorus written at bars 9-16 in Ab; reused +1 at bars 25-31
const chorusChords = [
  [9, 0, 2, "Ab3 C4 Eb4 F4"], [9, 2, 2, "G3 Bb3 Eb4 G4"],
  [10, 0, 2, "G3 Bb3 D4 Eb4"], [10, 2, 2, "A3 Eb4 F4 Ab4 Db5"],
  [11, 0, 2, "Ab3 C4 Db4 F4"], [11, 2, 2, "G3 Db4 E4 G4 C5"],
  [12, 0, 2, "G3 Bb3 C4 Eb4"], [12, 2, 2, "Ab3 C4 Eb4 Gb4"],
  [13, 0, 2, "Ab3 Db4 F4 Ab4"], [13, 2, 2, "G3 Bb3 Db4 E4"],
  [14, 0, 2, "Ab3 C4 Eb4 Ab4"], [14, 2, 2, "A3 Eb4 F4 Ab4 Db5"],
  [15, 0, 2, "Ab3 C4 Db4 F4"], [15, 2, 1, "Ab3 Db4 F4 Bb4"], [15, 3, 1, "G3 Db4 E4 G4 C5"],
  [16, 0, 2, "G3 Bb3 C4 Eb4"], [16, 2, 2, "Gb3 C4 E4 Ab4 B4"],
];
const DbMaj9 = "Ab3 C4 Eb4 F4", EbOverDb = "G3 Bb3 Eb4 G4";
const vampChords = [];
for (let b = 17; b <= 23; b++) vampChords.push([b, 0, 4, b % 2 ? DbMaj9 : EbOverDb]);
vampChords.push([24, 0, 2, EbOverDb], [24, 2, 2, "G3 C#4 F4 A4 C5"]); // A7(#9b13)/C# = F triad over A7
const tagChords = [[32, 0, 2, "G#3 B3 C#4 E4"], [32, 2, 1, "Ab3 Db4 F4"], [32, 3, 1, "G3 Db4 E4 G4 C5"]];

const shift = (list, dBar, semi) => list.filter(([b]) => b <= 15).map(([b, beat, d, v]) => [b + dBar, beat, d, v, semi]);
const allChords = [
  ...verseChords, ...chorusChords, ...vampChords,
  ...shift(chorusChords, 16, 1), ...tagChords,
].map(([b, beat, d, v, semi = 0]) => [b, beat, d, ps(v).map((x) => x + semi)]);

// Organ = pad role: hold every chord, velocity follows the energy curve
const energy = (bar) =>
  bar <= 4 ? 2 : bar <= 8 ? 3 : bar <= 16 ? 6 : bar <= 24 ? 4 + (bar - 17) * 0.7 : bar <= 31 ? 10 : 3;
for (const [b, beat, d, v] of allChords) {
  const e = energy(b);
  for (const x of v) add("organ", x, at(b, beat), d, 48 + e * 3);
  if (b >= 25 && b <= 31) add("organ", v[v.length - 1] + 12, at(b, beat), d, 70); // final chorus: extra top octave
}

// Piano = pulse role, an octave up; pushed placement: the second chord of each bar lands a 16th early
const pianoActive = (b) => (b >= 5 && b <= 16) || b >= 19;
for (const [b, beat, d, v] of allChords) {
  if (!pianoActive(b)) continue;
  const e = energy(b);
  const base = 62 + e * 3;
  const hits =
    b >= 17 && b <= 24
      ? beat === 0 && d === 4 ? [[0, 0.5], [0.75, 0.5], [1.5, 0.5], [2.5, 0.25], [3, 0.25], [3.5, 0.25]] : beat === 0 ? [[0, 0.5], [0.75, 0.5], [1.5, 0.25]] : [[-0.25, 0.75], [1, 0.5]]
      : b === 32 ? [[0, d]]
      : d === 1 ? [[-0.25, 0.5], [0.5, 0.25]]
      : beat === 0 ? [[0, 0.5], [0.75, 0.25], [1.5, 0.25]] : [[-0.25, 0.75], [0.75, 0.25], [1.25, 0.25]];
  for (const [off, dur] of hits) {
    const accent = off === 0 || off === -0.25 ? 10 : 0;
    for (const x of v) add("piano", x + 12, Math.max(0, at(b, beat) + off), dur, base + accent);
  }
}

// ---------- bass: melodic counter-line ----------
const B = (bar, list, semi = 0, vel = 96) => {
  for (const [beat, dur, n] of list) add("bass", p(n) + semi, at(bar, beat), dur, vel + (beat === 0 ? 6 : 0));
};
const verseBass = {
  1: [[0, 1.5, "Ab1"], [1.5, 0.5, "Bb1"], [2, 1, "C2"], [3, 0.5, "Eb2"], [3.5, 0.5, "C2"]],
  2: [[0, 1.5, "Db2"], [1.5, 0.5, "Ab1"], [2, 1, "D2"], [3, 0.5, "F2"], [3.5, 0.5, "D2"]],
  3: [[0, 1, "Eb2"], [1, 0.5, "Ab2"], [1.5, 0.5, "G2"], [2, 1.5, "F2"], [3.5, 0.5, "A1"]],
  4: [[0, 1.5, "Bb1"], [1.5, 0.5, "Db2"], [2, 1, "Eb2"], [3, 0.25, "G2"], [3.25, 0.25, "Bb2"], [3.5, 0.25, "Db3"], [3.75, 0.25, "C3"]],
  5: [[0, 1.5, "F2"], [1.5, 0.5, "C2"], [2, 1, "Eb2"], [3, 0.25, "F2"], [3.25, 0.25, "Eb2"], [3.5, 0.5, "C2"]],
  6: [[0, 1.5, "Db2"], [1.5, 0.5, "Ab1"], [2, 1, "C2"], [3, 0.5, "E2"], [3.5, 0.5, "C2"]],
  7: [[0, 1, "Bb1"], [1, 0.5, "Db2"], [1.5, 0.5, "F2"], [2, 1, "B1"], [3, 0.5, "D2"], [3.5, 0.5, "B1"]],
  8: [[0, 1.5, "C2"], [1.5, 0.5, "Eb2"], [2, 1, "C2"], [3, 0.25, "C2"], [3.25, 0.25, "Eb2"], [3.5, 0.25, "E2"], [3.75, 0.25, "C2"]],
};
const chorusBass = {
  9: [[0, 1.5, "Db2"], [1.5, 0.5, "Ab1"], [2, 1.5, "Db2"], [3.5, 0.5, "Db2"]],
  10: [[0, 1, "C2"], [1, 0.5, "Eb2"], [1.5, 0.5, "E2"], [2, 1, "F2"], [3, 0.5, "C2"], [3.5, 0.5, "A1"]],
  11: [[0, 1.5, "Bb1"], [1.5, 0.5, "F2"], [2, 1, "Eb2"], [3, 0.25, "Db2"], [3.25, 0.25, "C2"], [3.5, 0.5, "Bb1"]],
  12: [[0, 1, "Ab2"], [1, 0.5, "Eb2"], [1.5, 0.5, "Ab2"], [2, 2, "Gb2"]],
  13: [[0, 1, "F2"], [1, 0.5, "Ab2"], [1.5, 0.5, "F2"], [2, 1.5, "E2"], [3.5, 0.5, "E2"]],
  14: [[0, 1, "Eb2"], [1, 0.5, "C2"], [1.5, 0.25, "Eb2"], [1.75, 0.25, "E2"], [2, 1, "F2"], [3, 0.5, "C2"], [3.5, 0.5, "A1"]],
  15: [[0, 1.5, "Bb1"], [1.5, 0.5, "Db2"], [2, 1, "Eb2"], [3, 0.25, "Db2"], [3.25, 0.25, "C2"], [3.5, 0.5, "Bb1"]],
  16: [[0, 1, "Ab1"], [1, 0.5, "Eb2"], [1.5, 0.5, "Bb1"], [2, 1, "C2"], [3, 0.25, "C2"], [3.25, 0.25, "Eb2"], [3.5, 0.25, "E2"], [3.75, 0.25, "C2"]],
};
for (const [b, l] of Object.entries(verseBass)) B(+b, l, 0, 88);
for (const [b, l] of Object.entries(chorusBass)) B(+b, l);
for (const [b, l] of Object.entries(chorusBass)) if (+b <= 15) B(+b + 16, l, 1, 104);
// vamp: D♭ pedal with a melodic line climbing off it
const vampOdd = [[0, 1.5, "Db2"], [1.5, 0.5, "Ab1"], [2, 0.5, "Db2"], [2.5, 0.5, "Eb2"], [3, 0.5, "F2"], [3.5, 0.5, "Ab2"]];
const vampEven = [[0, 1, "Db2"], [1, 0.5, "Eb2"], [1.5, 0.5, "G2"], [2, 1, "Bb2"], [3, 0.5, "Ab2"], [3.5, 0.5, "F2"]];
for (let b = 17; b <= 23; b++) B(b, b % 2 ? vampOdd : vampEven, 0, 90 + (b - 17) * 2);
B(24, [[0, 1, "Db2"], [1, 0.5, "Eb2"], [1.5, 0.5, "F2"], [2, 1, "C#2"], [3, 0.5, "E2"], [3.5, 0.5, "C#2"]], 0, 104);
B(32, [[0, 1.5, "A1"], [1.5, 0.5, "E2"], [2, 1, "Bb1"], [3, 1, "Eb2"]], 0, 96);

// ---------- choir: backing vocal parts, split S/A (top two) and T (bottom) ----------
const C = (bar, beat, dur, voicing, vel, semi = 0) => {
  const [t, a, s] = ps(voicing).map((x) => x + semi);
  add("choirSA", s, at(bar, beat), dur, vel);
  add("choirSA", a, at(bar, beat), dur, vel - 6);
  add("choirT", t, at(bar, beat), dur, vel - 4);
};
// verse: responses to the lead's calls
C(2, 2, 0.5, "D4 F4 Ab4", 62); C(2, 2.5, 1.5, "F4 Ab4 B4", 66);
C(4, 2.5, 1.5, "Db4 G4 C5", 66);
C(6, 3, 1, "Bb3 E4 Ab4", 60);
C(8, 2, 1, "C4 E4 Ab4", 70); C(8, 3.5, 0.5, "C4 E4 Ab4", 78);
// chorus hook: choir is the call
const hook = [
  [9, 0, 1.5, "F4 Ab4 C5"], [9, 1.5, 0.5, "Db4 F4 Bb4"], [9, 2, 2, "Eb4 G4 Bb4"],
  [10, 0, 1, "C4 Eb4 G4"], [10, 1, 1, "Eb4 G4 Bb4"], [10, 2, 2, "Eb4 F4 A4"],
  [11, 0, 1.5, "Db4 F4 Ab4"], [11, 1.5, 0.5, "Bb3 Db4 F4"], [11, 2, 2, "Bb3 Db4 G4"],
  [12, 0, 2, "C4 Eb4 Ab4"], [12, 3.5, 0.5, "C4 Eb4 Ab4"],
  [13, 0, 1.5, "F4 Ab4 Db5"], [13, 1.5, 0.5, "F4 Ab4 C5"], [13, 2, 2, "E4 G4 Bb4"],
  [14, 0, 1, "Eb4 Ab4 C5"], [14, 1, 1, "Ab4 C5 Eb5"], [14, 2, 2, "Eb4 A4 Db5"],
  [15, 0, 1, "F4 Ab4 Db5"], [15, 1, 0.5, "F4 Ab4 C5"], [15, 1.5, 0.5, "Db4 F4 Bb4"], [15, 2, 1, "Db4 F4 Bb4"], [15, 3, 1, "Bb3 Db4 G4"],
  [16, 0, 2, "C4 Eb4 Ab4"], [16, 2, 1.5, "C4 E4 Ab4"],
];
for (const [b, beat, d, v] of hook) C(b, beat, d, v, b === 16 && beat === 2 ? 60 : 84);
for (const [b, beat, d, v] of hook) if (b <= 15) C(b + 16, beat, d, v, 96, 1);
// vamp chant, tresillo-ish pushes, growing louder
for (let b = 17; b <= 23; b++) {
  const v = 64 + (b - 17) * 4;
  const [x, y] = b % 2 ? ["F4 Ab4 C5", "Eb4 Ab4 C5"] : ["Eb4 G4 Bb4", "Eb4 G4 C5"];
  C(b, 0, 0.75, x, v + 6); C(b, 0.75, 0.75, x, v); C(b, 1.5, 2, y, v + 4);
}
C(24, 0, 0.75, "Eb4 G4 Bb4", 96); C(24, 0.75, 0.75, "Eb4 G4 Bb4", 92); C(24, 1.5, 0.5, "Eb4 G4 Bb4", 98);
C(24, 2, 1.5, "F4 A4 C5", 104); // upper-structure F triad over A7
C(24, 3.5, 0.5, "C#4 F4 A4", 100); // pickup into the A chorus
C(32, 0, 2, "C#4 E4 A4", 80); C(32, 2, 1, "Db4 F4 Ab4", 62); C(32, 3, 1, "Db4 G4 C5", 58);

// ---------- lead (voice stand-in): calls in the verse, responses + runs in the chorus ----------
const L = (bar, list, semi = 0, vel = 96, lag = 0) => {
  for (const [beat, dur, n] of list) add("lead", p(n) + semi, at(bar, beat) + lag, dur, vel + (dur >= 1 ? 4 : 0));
};
const verseLead = {
  1: [[0.5, 0.25, "Eb4"], [0.75, 0.25, "F4"], [1, 1, "Ab4"], [2, 0.5, "Ab4"], [2.5, 0.5, "Bb4"], [3, 1, "C5"]],
  2: [[0, 0.75, "C5"], [0.75, 0.25, "Bb4"], [1, 1, "Ab4"]],
  3: [[0.5, 0.25, "Eb4"], [0.75, 0.25, "F4"], [1, 0.75, "Ab4"], [1.75, 0.25, "C5"], [2, 1, "Eb5"], [3, 0.5, "Db5"], [3.5, 0.5, "C5"]],
  4: [[0, 1.5, "Bb4"], [1.5, 0.25, "Ab4"], [1.75, 0.25, "F4"], [2, 0.5, "G4"]],
  5: [[0.5, 0.25, "C5"], [0.75, 0.25, "C5"], [1, 0.5, "C5"], [1.5, 0.5, "Eb5"], [2, 0.75, "Eb5"], [2.75, 0.25, "C5"], [3, 0.5, "Bb4"], [3.5, 0.5, "Ab4"]],
  6: [[0, 1, "Ab4"], [1, 0.5, "F4"], [1.5, 0.5, "Ab4"], [2, 0.5, "Eb5"], [2.5, 0.5, "C5"]],
  7: [[0, 1, "Db5"], [1, 0.5, "C5"], [1.5, 0.5, "Bb4"], [2, 1, "Ab4"], [3, 0.5, "F4"], [3.5, 0.5, "Ab4"]],
  8: [[0, 2, "Ab4"]],
};
// laid-back placement: the lead sits ~a 32nd behind the beat in the verse
for (const [b, l] of Object.entries(verseLead)) L(+b, l, 0, 88, 0.06);
const chorusLead = {
  9: [[2.5, 0.25, "Bb4"], [2.75, 0.25, "C5"], [3, 0.25, "Eb5"], [3.25, 0.25, "F5"], [3.5, 0.5, "G5"]],
  10: [[0, 0.5, "G5"], [0.5, 0.25, "F5"], [0.75, 0.25, "Eb5"], [1, 1, "C5"], [3, 0.25, "Ab5"], [3.25, 0.25, "F5"], [3.5, 0.25, "Eb5"], [3.75, 0.25, "Db5"]],
  11: [[0, 0.75, "C5"], [3, 0.25, "Db5"], [3.25, 0.25, "C5"], [3.5, 0.25, "Bb4"], [3.75, 0.25, "G4"]],
  12: [[2, 0.5, "C5"], [2.5, 0.25, "Eb5"], [2.75, 0.25, "F5"], [3, 0.125, "Eb5"], [3.125, 0.125, "C5"], [3.25, 0.125, "B4"], [3.375, 0.125, "Bb4"], [3.5, 0.25, "Ab4"], [3.75, 0.25, "Gb4"]],
  13: [[0, 0.5, "F4"], [3, 0.25, "G4"], [3.25, 0.25, "Bb4"], [3.5, 0.25, "Db5"], [3.75, 0.25, "E5"]],
  14: [[0, 0.75, "F5"], [3, 0.25, "F5"], [3.25, 0.25, "Eb5"], [3.5, 0.25, "Db5"], [3.75, 0.25, "A4"]],
  15: [[2, 0.5, "F5"], [2.5, 0.5, "Eb5"], [3, 0.25, "Db5"], [3.25, 0.25, "C5"], [3.5, 0.25, "Bb4"], [3.75, 0.25, "G4"]],
  16: [[2, 0.25, "Ab4"], [2.25, 0.25, "B4"], [2.5, 0.25, "C5"], [2.75, 0.25, "E5"], [3, 0.5, "Gb5"], [3.5, 0.25, "F5"], [3.75, 0.25, "Eb5"]],
};
for (const [b, l] of Object.entries(chorusLead)) L(+b, l, 0, 98);
for (const [b, l] of Object.entries(chorusLead)) if (+b <= 15) L(+b + 16, l, 1, 108);
// final chorus extra melisma where chorus 1 rested
L(27, [[1, 0.125, "Db5"], [1.125, 0.125, "Eb5"], [1.25, 0.125, "Db5"], [1.375, 0.125, "Bb4"], [1.5, 0.25, "Ab4"], [1.75, 0.25, "F4"]], 1, 100);
L(31, [[0, 0.125, "F5"], [0.125, 0.125, "Ab5"], [0.25, 0.125, "F5"], [0.375, 0.125, "Eb5"], [0.5, 0.5, "Db5"]], 1, 104);
// vamp: melisma climbing through the density build
const vampLead = {
  17: [[0, 1, "C5"]],
  19: [[1, 0.5, "Ab4"], [1.5, 0.25, "Bb4"], [1.75, 0.25, "C5"], [2, 1, "Eb5"], [3, 0.5, "C5"], [3.5, 0.5, "Bb4"]],
  20: [[0, 0.5, "G4"], [0.5, 0.25, "Bb4"], [0.75, 0.25, "C5"], [1, 1, "Bb4"], [3, 0.25, "Eb5"], [3.25, 0.25, "F5"], [3.5, 0.5, "G5"]],
  21: [[0, 1, "F5"], [1, 0.125, "Eb5"], [1.125, 0.125, "F5"], [1.25, 0.125, "Eb5"], [1.375, 0.125, "C5"], [1.5, 0.25, "Bb4"], [1.75, 0.25, "Ab4"], [2, 0.5, "C5"], [2.5, 0.5, "Eb5"], [3, 0.5, "F5"], [3.5, 0.5, "Ab5"]],
  22: [[0, 1.5, "G5"], [1.5, 0.125, "F5"], [1.625, 0.125, "Eb5"], [1.75, 0.125, "C5"], [1.875, 0.125, "Bb4"], [2, 0.5, "C5"], [2.5, 0.25, "Eb5"], [2.75, 0.25, "F5"], [3, 0.25, "G5"], [3.25, 0.25, "Ab5"], [3.5, 0.5, "Bb5"]],
  23: [[0, 1, "Ab5"], [1, 0.5, "Bb5"], [1.5, 0.125, "Ab5"], [1.625, 0.125, "G5"], [1.75, 0.125, "F5"], [1.875, 0.125, "Eb5"], [2, 0.25, "F5"], [2.25, 0.25, "Eb5"], [2.5, 0.25, "C5"], [2.75, 0.25, "Bb4"], [3, 0.25, "C5"], [3.25, 0.25, "Eb5"], [3.5, 0.25, "F5"], [3.75, 0.25, "G5"]],
  24: [[0, 1.5, "Ab5"], [1.5, 0.5, "G5"], [2, 0.25, "F5"], [2.25, 0.25, "C5"], [2.5, 0.5, "A4"]],
};
for (const [b, l] of Object.entries(vampLead)) L(+b, l, 0, 92 + (+b - 17) * 2);
L(32, [[0.5, 0.25, "C#5"], [0.75, 0.25, "E5"], [1, 0.25, "F#5"], [1.25, 0.25, "E5"], [1.5, 0.5, "C#5"], [3, 0.5, "C5"], [3.5, 0.5, "Bb4"]], 0, 90);

// ---------- drums (GM: 36 kick, 37 stick, 38 snare, 42 hat, 46 open hat, 49 crash, 51 ride, 54 tamb, toms 50/48/47/43) ----------
const D = (pitch, bar, beat, vel, dur = 0.25) => add("drums", pitch, at(bar, beat), dur, vel);
const LATE = 0.05; // laid-back backbeat
for (let b = 1; b <= 8; b++) {
  D(37, b, 1 + LATE, 72); D(37, b, 3 + LATE, 76);
  for (let i = 0; i < 8; i++) D(42, b, i / 2, i % 2 ? 34 : 52);
  D(36, b, 0, 82); D(36, b, 2.5, 64);
  if (b === 4) D(36, b, 3.75, 56);
}
// bar 8 tom fill
D(38, 8, 3, 70); D(50, 8, 3.25, 76); D(47, 8, 3.5, 82); D(43, 8, 3.75, 92);
const chorusGroove = (b, ride, vel) => {
  D(36, b, 0, vel); D(36, b, 1.5, vel - 18); D(36, b, 2.5, vel - 10); D(36, b, 3.75, vel - 30);
  D(38, b, 1 + LATE, vel + 4); D(38, b, 3 + LATE, vel + 6);
  D(38, b, 0.75, 30); D(38, b, 2.25, 28);
  D(54, b, 1 + LATE, 58); D(54, b, 3 + LATE, 58);
  if (ride) for (let i = 0; i < 8; i++) D(51, b, i / 2, i % 2 ? 50 : 72);
  else for (let i = 0; i < 16; i++) D(42, b, i / 4, i % 2 ? 32 : i % 4 ? 52 : 68);
};
for (let b = 9; b <= 16; b++) chorusGroove(b, false, 98);
for (let b = 25; b <= 31; b++) chorusGroove(b, true, 108);
for (const b of [9, 13, 25, 29]) D(49, b, 0, 100, 2);
// linear chops: sextuplets, no two limbs together
const chop = (b, from, vel) => [38, 48, 36, 38, 47, 36].forEach((x, i) => D(x, b, from + i / 6, vel + i * 3, 1 / 6));
// strip the groove from the chop span
const clearSpan = (from, to) => (tracks.drums = tracks.drums.filter((n) => n.start < from || n.start >= to));
clearSpan(at(12, 3), at(13, 0)); chop(12, 3, 80);
clearSpan(at(16, 2), at(17, 0));
[38, 50, 36, 38, 48, 36, 47, 43].forEach((x, i) => D(x, 16, 2 + i / 4, 80 + i * 4));
clearSpan(at(28, 2), at(29, 0)); chop(28, 2, 84); chop(28, 3, 96);
// vamp: density build, a layer every 2 bars
for (let b = 17; b <= 20; b++) {
  D(36, b, 0, 88); D(36, b, 0.75, 70); D(36, b, 1.5, 76);
  for (let i = 0; i < 4; i++) D(42, b, i, 54);
  D(54, b, 1 + LATE, 60); D(54, b, 3 + LATE, 60);
  if (b >= 19) { D(37, b, 1 + LATE, 74); D(37, b, 3 + LATE, 78); }
}
D(49, 17, 0, 80, 2);
// bars 21-23: linear groove on a 16th grid (K, H, S, H | S, H, K, H | K, H, S, K | S, H, K, S)
const linear = [[36, 0], [42, 0.25], [38, 0.5, 34], [42, 0.75], [38, 1 + LATE, 100], [42, 1.25], [36, 1.5], [42, 1.75],
  [36, 2], [42, 2.25], [38, 2.5, 34], [36, 2.75], [38, 3 + LATE, 104], [42, 3.25], [36, 3.5], [38, 3.75, 40]];
for (let b = 21; b <= 23; b++) for (const [x, beat, v] of linear) D(x, b, beat, v ?? (x === 36 ? 90 : 60) + (b - 21) * 4);
// bar 24: build roll, 8ths -> triplets -> 16ths -> 32nds with a velocity ramp
let k = 0;
for (const [from, n] of [[0, 2], [1, 3], [2, 4], [3, 8]]) for (let i = 0; i < n; i++, k++) D(38, 24, from + i / n, 56 + k * 4, 1 / n);
for (let i = 0; i < 4; i++) D(36, 24, i, 90 + i * 6);
// bar 32 tag: hit and drop out, so the loop restarts sparse
D(49, 32, 0, 104, 2); D(36, 32, 0, 104); D(38, 32, 0, 90); D(37, 32, 3.5, 40);

// ---------- project ----------
const ab = { fifths: -4, mode: "major" };
const meta = {
  lead: { name: "Lead (voice stand-in)", program: 65, gain: 0.8, pan: 0 },
  choirSA: { name: "Choir S/A", program: 52, gain: 0.55, pan: -0.3 },
  choirT: { name: "Choir T", program: 52, gain: 0.55, pan: 0.3 },
  organ: { name: "Organ (pad)", program: 16, gain: 0.45, pan: -0.55 },
  piano: { name: "Piano (pulse)", program: 0, gain: 0.55, pan: 0.55 },
  bass: { name: "Bass", program: 33, gain: 0.95, pan: 0, tabOpenStringPitches: [43, 38, 33, 28] },
  drums: { name: "Drums (Room kit)", program: 8, bank: 128, gain: 0.85, pan: 0 },
};
const project = {
  title: "Lift It Higher",
  comment: "Ab major, final chorus in A, loops 1-32. Plan and technique checklist in the gist.",
  tempo: 76,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: 128 }, enabled: true },
  locators: [
    { beat: 0, label: "Verse" }, { beat: 32, label: "Chorus" }, { beat: 64, label: "Vamp" },
    { beat: 96, label: "Final chorus (A)" }, { beat: 124, label: "Tag -> Ab" },
  ],
  midiTracks: Object.entries(meta).map(([key, m]) => ({
    ...m, keySignature: ab, viewMode: "overview", height: 72, muted: false, soloed: false,
    notes: tracks[key].sort((a, b) => a.start - b.start),
  })),
};
for (const [k, n] of Object.entries(tracks)) {
  const bad = n.filter((x) => x.start < 0 || x.start + x.duration > 128.001 || x.duration <= 0);
  console.log(k, n.length, "notes, pitch", Math.min(...n.map((x) => x.pitch)), "-", Math.max(...n.map((x) => x.pitch)), bad.length ? `BAD ${bad.length}` : "");
}
const payload = deflateRawSync(JSON.stringify(project)).toString("base64url");
const url = `https://toy-midi.hiro18181.workers.dev/draft#p=${payload}`;
writeFileSync("/tmp/gospel/link.txt", url + "\n");
writeFileSync("/tmp/gospel/project.json", JSON.stringify(project, null, 1));
console.log("url length", url.length);
