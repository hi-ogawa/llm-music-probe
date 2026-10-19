// Faubourg: soul-jazz in F minor after Roy Hargrove's "Strasbourg / St. Denis".
// `node compose.mjs` writes project.json next to this file.
import { writeFileSync } from "node:fs";

// ---------- helpers ----------
const PC = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11 };
const P = (s) => {
  const m = /^([A-G][#b]?)(-?\d)$/.exec(s);
  // Cb4 is B3
  return PC[m[1]] + 12 * (Number(m[2]) + 1) - (m[1] === "Cb" ? 12 : 0);
};
const bar = (b) => (b - 1) * 4;

// Form (1-based bars)
const INTRO = 1; // 8 bars
const HEAD1 = 9; // 12 bars
const SOLO = 21; // 16 bars
const HEAD2 = 37; // 12 bars
const TAG = 49; // 2 bars
const END = bar(TAG + 2);

// Swing: the offbeat 8th lands at `ratio` of the beat. The heads sit between
// straight (0.5) and triplet swing (0.667); the solo swings harder.
const ratioAt = (t) => (t >= bar(SOLO) && t < bar(HEAD2) ? 0.63 : 0.58);
const sw = (t, r = ratioAt(t)) => {
  const b = Math.floor(t + 1e-9);
  const f = t - b;
  return b + (f <= 0.5 ? (f / 0.5) * r : r + ((f - 0.5) / 0.5) * (1 - r));
};

// Small deterministic timing drift so stacked parts don't hit like a sequencer.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

const notes = { trumpet: [], tenor: [], trombone: [], organ: [], rhodes: [], bass: [], drums: [], perc: [] };
const add = (track, pitch, start, duration, velocity, { swing = true, drift = 0 } = {}) => {
  const s = swing ? sw(start) : start;
  const e = swing ? sw(start + duration) : start + duration;
  const d = drift ? rand() * drift : 0;
  notes[track].push({
    pitch,
    start: Math.max(0, +(s + d).toFixed(4)),
    duration: +Math.max(0.05, e - s).toFixed(4),
    velocity: Math.max(1, Math.min(127, Math.round(velocity))),
  });
};
// list of [note, beatInBar, beats, velocityOffset?]
const line = (track, b, list, vel, { k = 0, drift = 0 } = {}) => {
  for (const [n, s, d, dv = 0] of list) add(track, (typeof n === "number" ? n : P(n)) + k, bar(b) + s, d, vel + dv, { drift });
};

// ---------- harmony ----------
// rootless voicings around G3-G4, shared by organ and Rhodes
const V = {
  Fm9: ["Ab3", "C4", "Eb4", "G4"],
  Bbm9: ["Ab3", "C4", "Db4", "F4"],
  Db9: ["Cb4", "Eb4", "F4", "Ab4"],
  "C7#9": ["E3", "Bb3", "Eb4", "G4"],
  "Dbmaj7#11": ["Ab3", "C4", "F4", "G4"],
  Abmaj7: ["G3", "Bb3", "C4", "Eb4"],
  Eb13: ["G3", "C4", "Db4", "F4"],
  Gm7b5: ["F3", "Bb3", "Db4", "F4"],
};

const chords = []; // { start, len, name }
const ch = (b, name, beat = 0, len = 4) => chords.push({ start: bar(b) + beat, len, name });
const headChords = (b0) => {
  for (let i = 0; i < 4; i++) ch(b0 + i, "Fm9");
  ch(b0 + 4, "Bbm9"); ch(b0 + 5, "Bbm9");
  ch(b0 + 6, "Fm9"); ch(b0 + 7, "Fm9");
  ch(b0 + 8, "Db9"); ch(b0 + 9, "C7#9");
  ch(b0 + 10, "Fm9"); ch(b0 + 11, "Fm9");
};
for (let i = 0; i < 8; i++) ch(INTRO + i, "Fm9");
headChords(HEAD1);
const soloChords = [
  "Fm9", "Fm9", "Dbmaj7#11", "Dbmaj7#11", "Bbm9", "Bbm9", null, "Fm9",
  "Fm9", "Fm9", "Abmaj7", "Dbmaj7#11", "Bbm9", "Eb13", "Db9", "C7#9",
];
soloChords.forEach((c, i) => {
  if (c) ch(SOLO + i, c);
  else { ch(SOLO + i, "Gm7b5", 0, 2); ch(SOLO + i, "C7#9", 2, 2); }
});
headChords(HEAD2);
ch(TAG, "Fm9"); ch(TAG + 1, "Fm9");
const chordAt = (t) => chords.find((c) => t >= c.start - 1e-9 && t < c.start + c.len - 1e-9);

// ---------- bass: the tune ----------
// Riff, bar A: F, octave leap, fall to C, blue climb Ab-Bb-B. Bar B: lands on C,
// falls back to F, Eb pickup.
const riffA = [["F2", 0, 0.4, 8], ["F3", 0.5, 0.4, 4], ["Eb3", 1, 0.4], ["C3", 1.5, 0.9, 4], ["Ab2", 2.5, 0.4], ["Bb2", 3, 0.4], ["B2", 3.5, 0.45, 4]];
const riffB = [["C3", 0, 0.9, 6], ["Bb2", 1.5, 0.4], ["Ab2", 2, 0.4], ["F2", 2.5, 0.9, 4], ["Eb2", 3.5, 0.4]];
// over Db9 and C7#9 the octave leap stays, the fall outlines the chord
const bassDb = [["Db2", 0, 0.4, 8], ["Db3", 0.5, 0.4, 4], ["Cb3", 1, 0.4], ["Ab2", 1.5, 0.9], ["F2", 2.5, 0.4], ["Ab2", 3, 0.4], ["Db3", 3.5, 0.4]];
const bassC = [["C2", 0, 0.4, 8], ["C3", 0.5, 0.4, 6], ["Bb2", 1, 0.4], ["G2", 1.5, 0.9], ["E2", 2.5, 0.4], ["G2", 3, 0.4], ["B2", 3.5, 0.45]];

const bassHead = (b0, vel) => {
  line("bass", b0, riffA, vel); line("bass", b0 + 1, riffB, vel);
  line("bass", b0 + 2, riffA, vel); line("bass", b0 + 3, riffB, vel);
  line("bass", b0 + 4, riffA, vel, { k: 5 }); line("bass", b0 + 5, riffB, vel, { k: 5 });
  line("bass", b0 + 6, riffA, vel + 4); line("bass", b0 + 7, riffB, vel + 4);
  line("bass", b0 + 8, bassDb, vel + 4); line("bass", b0 + 9, bassC, vel + 4);
  line("bass", b0 + 10, riffA, vel); line("bass", b0 + 11, riffB, vel);
};
// intro: riff enters in bar 3
for (let b = INTRO + 2; b < HEAD1; b += 2) { line("bass", b, riffA, 92); line("bass", b + 1, riffB, 92); }
bassHead(HEAD1, 98);

// solo, bars 1-8: in two, bar 8 teases the riff
const two = [
  [["F2", 0, 1.8], ["C3", 2, 1.4], ["E2", 3.5, 0.4]],
  [["F2", 0, 1.8], ["Ab2", 2, 1.4], ["C2", 3.5, 0.4]],
  [["Db2", 0, 1.8], ["F2", 2, 1.4], ["Ab2", 3.5, 0.4]],
  [["Db3", 0, 1.8], ["C3", 2, 1.4], ["A2", 3.5, 0.4]],
  [["Bb2", 0, 1.8], ["F2", 2, 1.4], ["A2", 3.5, 0.4]],
  [["Bb2", 0, 1.8], ["Db3", 2, 1.4], ["Ab2", 3.5, 0.4]],
  [["G2", 0, 1.8], ["C2", 2, 1.4], ["E2", 3.5, 0.4]],
  [["F2", 0, 0.4, 6], ["F3", 0.5, 0.4], ["Eb3", 1, 0.4], ["C3", 1.5, 0.9], ["Ab2", 2.5, 0.4], ["G2", 3, 0.4], ["Gb2", 3.5, 0.4]],
];
two.forEach((l, i) => line("bass", SOLO + i, l, 70 + i));
// solo, bars 9-15: walking
const walk = [
  ["F2", "Ab2", "C3", "Eb3"],
  ["F3", "Eb3", "C3", "A2"],
  ["Ab2", "C3", "Eb3", "D3"],
  ["Db3", "Ab2", "F2", "A2"],
  ["Bb2", "Db3", "F3", "E3"],
  ["Eb3", "Db3", "Bb2", "D3"],
  ["Db3", "Ab2", "F2", "Db2"],
];
walk.forEach((l, i) => line("bass", SOLO + 8 + i, l.map((n, j) => [n, j, 0.85, j === 0 ? 4 : 0]), 76 + i * 2));
// solo, bar 16: the octave leap on C is the cue back into the head
line("bass", SOLO + 15, [["C2", 0, 0.4, 10], ["C3", 0.5, 0.4, 12]], 100);
bassHead(HEAD2, 102);
// tag: the riff's first bar in unison, then the climb lands on C and the band hits F
line("bass", TAG, riffA, 108);
line("bass", TAG + 1, [["C3", 0, 0.45, 6], ["F2", 1, 0.3, 12]], 108);

// ---------- horns ----------
// call and response: the horns answer in the riff's gaps; tenor a 4th under trumpet
const respA = [
  [["C5", 3.5, 0.4]],
  [["Eb5", 0, 0.4, 6], ["F5", 0.5, 0.9, 10], ["Ab5", 2, 0.25, 8], ["F5", 2.5, 0.45]],
];
// second answer climbs with the bass's Ab-Bb-B and lands on C6
const respA2 = [
  [["C5", 3.5, 0.4]],
  [["Eb5", 0, 0.4, 4], ["F5", 0.5, 0.4], ["Ab5", 1, 0.4, 2], ["Bb5", 1.5, 0.4, 4], ["B5", 2, 0.4, 6], ["C6", 2.5, 0.9, 12]],
];
const horns = (b, phrase, vel, { k = 0, tenor = -5, bone = null } = {}) => {
  phrase.forEach((l, i) => {
    line("trumpet", b + i, l, vel, { k, drift: 0.01 });
    line("tenor", b + i, l, vel - 6, { k: k + tenor, drift: 0.012 });
    if (bone !== null) line("trombone", b + i, l, vel - 8, { k: k + bone, drift: 0.012 });
  });
};
const hornsHead = (b0, vel, bone) => {
  horns(b0, respA, vel, { bone });
  horns(b0 + 2, respA2, vel + 4, { tenor: -12, bone });
  // over Bbm9 the tenor and trombone drop to stay in range
  horns(b0 + 4, respA, vel, { k: 5, tenor: -12, bone: bone === null ? null : -24 });
  // bars 7-8: octave unison with the bass, the punch
  line("trumpet", b0 + 6, riffA, vel + 6, { k: 24, drift: 0.006 });
  line("trumpet", b0 + 7, riffB.slice(0, 4), vel + 6, { k: 24, drift: 0.006 });
  line("tenor", b0 + 6, riffA, vel, { k: 12, drift: 0.006 });
  line("tenor", b0 + 7, riffB.slice(0, 4), vel, { k: 12, drift: 0.006 });
  if (bone !== null) {
    line("trombone", b0 + 6, riffA, vel, { k: 12, drift: 0.006 });
    line("trombone", b0 + 7, riffB.slice(0, 4), vel, { k: 12, drift: 0.006 });
  }
  // bars 9-10: hits on the bass's octave leap
  const hit = (b, beat, len, [tp, ts, tb], dv = 0) => {
    add("trumpet", P(tp), bar(b) + beat, len, vel + 8 + dv);
    add("tenor", P(ts), bar(b) + beat, len, vel + 2 + dv);
    if (bone !== null) add("trombone", P(tb), bar(b) + beat, len, vel + dv);
  };
  hit(b0 + 8, 0.5, 0.3, ["Eb5", "Cb4", "F3"]);
  hit(b0 + 8, 3.5, 0.4, ["F5", "Cb4", "Ab3"], -6);
  hit(b0 + 9, 0.5, 0.3, ["Eb5", "E4", "Bb3"]);
  hit(b0 + 9, 2, 1.2, ["Eb5", "E4", "Bb3"], 4);
  horns(b0 + 10, respA, vel, { bone });
};
hornsHead(HEAD1, 92, null);
hornsHead(HEAD2, 98, -12);
// tag: everyone on the riff, then the final hit
line("trumpet", TAG, riffA, 110, { k: 24 });
line("tenor", TAG, riffA, 104, { k: 12 });
line("trombone", TAG, riffA, 102, { k: 12 });
add("trumpet", P("C5"), bar(TAG + 1), 0.45, 112);
add("tenor", P("C4"), bar(TAG + 1), 0.45, 106);
add("trombone", P("C4"), bar(TAG + 1), 0.45, 104);
add("trumpet", P("F5"), bar(TAG + 1) + 1, 0.3, 120);
add("tenor", P("Ab4"), bar(TAG + 1) + 1, 0.3, 112);
add("trombone", P("C4"), bar(TAG + 1) + 1, 0.3, 110);

// trumpet solo: starts low and spare, develops the riff's octave leap and blue climb
const solo = [
  [["C5", 1.5, 0.4], ["Eb5", 2, 0.4], ["F5", 2.5, 1.4, 6]],
  [["Ab5", 1, 0.4, 4], ["G5", 1.5, 0.4], ["F5", 2, 0.4], ["Eb5", 2.5, 0.4], ["C5", 3, 1]],
  [["F5", 0.5, 0.4], ["G5", 1, 0.9, 6], ["Ab5", 2, 0.4], ["C6", 2.5, 1.4, 8]],
  [["Bb5", 0.5, 0.4], ["Ab5", 1, 0.4], ["F5", 1.5, 0.4], ["G5", 2, 1.9, 4]],
  [["Db5", 1.5, 0.4], ["F5", 2, 0.4], ["Ab5", 2.5, 0.4], ["C6", 3, 0.9, 6]],
  [["Bb5", 0, 0.4], ["Ab5", 0.5, 0.4], ["F5", 1, 0.4], ["Db5", 1.5, 1.4], ["C5", 3.5, 0.4]],
  [["Bb4", 0, 0.4], ["Db5", 0.5, 0.4], ["F5", 1, 0.4], ["Ab5", 1.5, 0.4, 4], ["G5", 2, 0.4], ["Eb5", 2.5, 0.4, 6], ["E5", 3, 0.4], ["Bb4", 3.5, 0.4]],
  [["Ab4", 0, 0.9], ["B4", 3, 0.4, 4], ["C5", 3.5, 0.45, 6]],
  [["F4", 0, 0.4, 4], ["F5", 0.5, 0.4, 10], ["Eb5", 1, 0.4], ["C5", 1.5, 0.9, 4], ["Ab5", 3, 0.4], ["G5", 3.5, 0.4]],
  [["F5", 0, 0.4], ["C6", 0.5, 1.4, 10], ["Bb5", 2.5, 0.4], ["Ab5", 3, 0.4], ["F5", 3.5, 0.4]],
  [["G5", 0, 0.4, 4], ["Eb5", 0.5, 0.4], ["C5", 1, 0.4], ["Eb5", 1.5, 0.4], ["G5", 2, 0.9, 4], ["Bb5", 3, 0.4], ["C6", 3.5, 0.4, 4]],
  [["C6", 0, 1.4, 8], ["Ab5", 1.5, 0.4], ["F5", 2, 0.4], ["G5", 2.5, 1.4, 6]],
  [["Db6", 0.5, 0.4, 8], ["C6", 1, 0.4], ["Bb5", 1.5, 0.4], ["Ab5", 2, 0.4], ["F5", 2.5, 0.4], ["Db5", 3, 0.4], ["C5", 3.5, 0.4]],
  [["Db5", 0, 0.4], ["F5", 0.5, 0.4], ["G5", 1, 0.4], ["C6", 1.5, 0.9, 8], ["Bb5", 2.5, 0.4], ["G5", 3, 0.9]],
  [["Ab5", 0, 0.4, 4], ["Cb6", 0.5, 0.4, 6], ["Ab5", 1, 0.4], ["F5", 1.5, 0.4], ["Eb5", 2, 0.9, 4], ["F5", 3.5, 0.4]],
  [["G5", 0, 0.4, 8], ["Eb6", 0.5, 1.4, 16]],
];
solo.forEach((l, i) => line("trumpet", SOLO + i, l, 84 + (i >= 8 ? 10 : 0) + (i >= 12 ? 6 : 0), { drift: 0.015 }));

// solo backgrounds, bars 9-16: tenor and trombone hold guide tones, entering on the
// "and" of 4 before each change and growing louder
const bg = [
  [8, ["Eb4", "Ab3"], 4], [9, ["Eb4", "Ab3"], 2.5], [10, ["C4", "G3"], 4], [11, ["C4", "F3"], 4],
  [12, ["Db4", "Ab3"], 4], [13, ["Db4", "G3"], 4], [14, ["Cb4", "F3"], 4],
];
bg.forEach(([i, [ts, tb], len], j) => {
  const start = bar(SOLO + i) - 0.5;
  add("tenor", P(ts), start, len - 0.1, 56 + j * 4, { drift: 0.01 });
  add("trombone", P(tb), start, len - 0.1, 54 + j * 4, { drift: 0.01 });
});
// bar 10's background breaks for a short riff fill under the trumpet's held C6
[[3, ["F4", "C4"]], [3.5, ["Ab4", "Eb4"]]].forEach(([beat, [ts, tb]]) => {
  add("tenor", P(ts), bar(SOLO + 9) + beat, 0.4, 70);
  add("trombone", P(tb) - 12, bar(SOLO + 9) + beat, 0.4, 68);
});
// bar 16: C7#9 hit with the band
add("tenor", P("E4"), bar(SOLO + 15), 0.35, 96);
add("trombone", P("Bb3"), bar(SOLO + 15), 0.35, 94);

// ---------- organ and Rhodes ----------
// a hit on the "and" of 4 anticipates the next bar's chord
const voice = (track, t, len, vel) => {
  const c = chordAt(t % 4 >= 3.5 ? t + 0.5 : t + 0.01);
  for (const n of V[c.name]) add(track, P(n), t, len, vel, { drift: 0.006 });
};
// organ in the heads: short offbeat stabs, one per bar, the second anticipating the next bar
const organStabs = (b0, nBars, vel) => {
  for (let i = 0; i < nBars; i++) {
    const t = bar(b0 + i);
    if (i % 2 === 0) voice("organ", t + 1.5, 0.3, vel);
    else voice("organ", t + 3.5, 0.35, vel - 4);
  }
};
organStabs(INTRO + 4, 4, 70);
const organHead = (b0, vel) => {
  organStabs(b0, 8, vel);
  // with the horn hits
  voice("organ", bar(b0 + 8) + 0.5, 0.3, vel + 6);
  voice("organ", bar(b0 + 9) + 0.5, 0.3, vel + 6);
  voice("organ", bar(b0 + 9) + 2, 1.2, vel + 6);
  organStabs(b0 + 10, 2, vel);
};
organHead(HEAD1, 76);
// organ in the solo: a soft held pad, re-voiced at each change
for (const c of chords) {
  if (c.start < bar(SOLO) || c.start >= bar(SOLO + 15)) continue;
  for (const n of V[c.name]) add("organ", P(n), c.start, c.len - 0.05, 44 + (c.start >= bar(SOLO + 8) ? 8 : 0), { swing: false });
}
voice("organ", bar(SOLO + 15), 0.35, 86);
organHead(HEAD2, 80);
voice("organ", bar(TAG + 1) + 1, 0.3, 96);

// Rhodes comps the solo only: sparse offbeats answering the trumpet
const comp = [
  [[2.5, 0.4]], [[1.5, 0.3], [3.5, 0.4]], [[0.5, 0.9]], [[2.5, 0.3]],
  [[1.5, 0.4]], [[0.5, 0.3], [3.5, 0.4]], [[1.5, 0.3], [2.5, 0.4]], [[2.5, 0.3]],
  [[0.5, 0.3], [1.5, 0.3]], [[2.5, 0.4], [3.5, 0.4]], [[0.5, 0.3], [2.5, 0.6]], [[1.5, 0.3], [3.5, 0.4]],
  [[0.5, 0.3], [2, 0.3], [3.5, 0.4]], [[1.5, 0.3], [3.5, 0.4]], [[0.5, 0.3], [2.5, 0.3]], [],
];
comp.forEach((hits, i) => {
  for (const [beat, len] of hits) voice("rhodes", bar(SOLO + i) + beat, len, 58 + (i >= 8 ? 8 : 0) + (i >= 12 ? 6 : 0));
});

// ---------- drums (Jazz kit) ----------
const K = 36, S = 38, XS = 37, CH = 42, PH = 44, OH = 46, RD = 51, RB = 53, CR = 49, HT = 50, MT = 47, LT = 45;
const dr = (p, t, v, len = 0.2, swing = true) => add("drums", p, t, len, v, { swing, drift: p === CH || p === RD ? 0.005 : 0 });

const grooveBar = (b, { kicks, hard = false, ghosts = true, openHat = false }) => {
  const t0 = bar(b);
  for (let x = 0; x < 4; x += 0.5) {
    if (openHat && x === 3.5) dr(OH, t0 + x, 72, 0.4);
    else dr(CH, t0 + x, x % 1 ? 52 : 74 + (hard ? 8 : 0));
  }
  [1, 3].forEach((x) => dr(S, t0 + x, hard ? 104 : 96));
  if (ghosts) { dr(S, t0 + 1.5, 28); dr(S, t0 + 2.5, 34); dr(S, t0 + 3.5, 26); }
  for (const [x, v] of kicks) dr(K, t0 + x, v);
};
// kick follows the bass riff
const kickA = [[0, 100], [1.5, 82]];
const kickB = [[0, 96], [2.5, 84], [3.5, 60]];
const headDrums = (b0, nBars, opts = {}) => {
  for (let i = 0; i < nBars; i++) grooveBar(b0 + i, { kicks: i % 2 ? kickB : kickA, openHat: i % 2 === 1, ...opts });
};
// intro: hats and kick only for two bars, then the full groove with the riff
for (let i = 0; i < 2; i++) {
  const t0 = bar(INTRO + i);
  for (let x = 0; x < 4; x += 0.5) dr(CH, t0 + x, x % 1 ? 48 : 68);
  dr(XS, t0 + 3, 70);
  for (const [x, v] of i % 2 ? kickB : kickA) dr(K, t0 + x, v - 10);
}
headDrums(INTRO + 2, 6);
// pickup fill into the head
const fill = (b, from, v) => {
  const t0 = bar(b);
  notes.drums = notes.drums.filter((n) => !(n.start >= sw(t0 + from) - 0.01 && n.start < t0 + 4 && n.pitch !== K && n.pitch !== CH));
  const trip = [0, 1 / 3, 2 / 3];
  let x = from;
  const toms = [S, S, S, HT, HT, MT, MT, LT, LT];
  let i = 0;
  for (; x < 4 - 1e-9; x += 1) for (const f of trip) dr(toms[Math.min(i++, toms.length - 1)], t0 + x + f, v + i * 2, 0.15, false);
};
fill(HEAD1 - 1, 3, 70);

const head = (b0, hard) => {
  dr(CR, bar(b0), 108, 1);
  headDrums(b0, 8, { hard });
  // bars 9-10: hits with the horns, kick on the leap
  for (const i of [8, 9]) {
    const t0 = bar(b0 + i);
    for (let x = 0; x < 4; x += 0.5) dr(CH, t0 + x, x % 1 ? 52 : 76);
    dr(K, t0, 100); dr(K, t0 + 0.5, 96); dr(S, t0 + 0.5, 104); dr(CR, t0 + 0.5, 96, 1);
    dr(S, t0 + 3, 96);
  }
  dr(S, bar(b0 + 9) + 2, 108); dr(K, bar(b0 + 9) + 2, 100); dr(CR, bar(b0 + 9) + 2, 100, 1);
  headDrums(b0 + 10, 2, { hard });
};
head(HEAD1, false);
fill(HEAD1 + 11, 2, 62);

// solo: ride and hi-hat foot, cross-stick on 4, feathered kick; snare comping joins in bar 9
const soloComp = [[], [], [[2.5, 40]], [], [[3.5, 38]], [], [[1.5, 40]], [[2.5, 44]],
  [[1.5, 52], [3.5, 48]], [[2.5, 56]], [[0.5, 50], [2.5, 54]], [[1.5, 58], [3.5, 60]],
  [[1.5, 60], [2.5, 56], [3.5, 64]], [[0.5, 58], [2.5, 66]], [[1.5, 64], [2.5, 68], [3.5, 72]], []];
for (let i = 0; i < 16; i++) {
  const t0 = bar(SOLO + i);
  const lift = i >= 8 ? 10 : 0;
  if (i === 0) dr(CR, t0, 84, 1);
  if (i === 15) break;
  for (const x of [0, 1, 1.5, 2, 3, 3.5]) dr(RD, t0 + x, (x % 1 ? 84 : x === 1 || x === 3 ? 108 : 98) + lift / 2);
  [1, 3].forEach((x) => dr(PH, t0 + x, 60));
  if (i < 8) dr(XS, t0 + 3, 56);
  for (let x = 0; x < 4; x++) dr(K, t0 + x, 26 + lift / 2);
  for (const [x, v] of soloComp[i]) dr(S, t0 + x, v);
}
// solo bar 16: hit on the leap, then a fill back into the head
{
  const t0 = bar(SOLO + 15);
  dr(K, t0, 104); dr(CR, t0, 104, 1); dr(S, t0, 100);
  dr(K, t0 + 0.5, 100); dr(S, t0 + 0.5, 106);
  fill(SOLO + 15, 2, 72);
}
head(HEAD2, true);
// tag: groove on the riff bar, then one hit, cymbal choked short
grooveBar(TAG, { kicks: kickA, hard: true, ghosts: false });
dr(CR, bar(TAG), 110, 1);
dr(K, bar(TAG + 1), 104); dr(S, bar(TAG + 1), 96); dr(CH, bar(TAG + 1), 80);
dr(K, bar(TAG + 1) + 1, 118); dr(S, bar(TAG + 1) + 1, 116); dr(CR, bar(TAG + 1) + 1, 116, 0.3);

// ---------- percussion: congas, tambourine in the heads ----------
const MHC = 62, OHC = 63, LC = 64, TB = 54;
const pc = (p, t, v) => add("perc", p, t, 0.2, v, { drift: 0.01 });
const congaBar = (b, soft = false) => {
  const t0 = bar(b);
  const s = soft ? -22 : 0;
  pc(LC, t0, 66 + s);
  if (!soft) pc(MHC, t0 + 1, 54);
  pc(OHC, t0 + 1.5, 78 + s);
  pc(LC, t0 + 2.5, 68 + s);
  if (!soft) pc(MHC, t0 + 3, 54);
  pc(OHC, t0 + 3.5, 82 + s);
};
for (let b = INTRO; b < HEAD1; b++) congaBar(b);
for (const b0 of [HEAD1, HEAD2]) {
  for (let i = 0; i < 12; i++) {
    congaBar(b0 + i);
    [1, 3].forEach((x) => pc(TB, bar(b0 + i) + x, b0 === HEAD2 ? 70 : 62));
  }
}
for (let i = 0; i < 15; i++) congaBar(SOLO + i, true);
congaBar(TAG);

// ---------- project ----------
const key = { fifths: -4, mode: "minor" };
const project = {
  title: "Faubourg",
  comment: "Soul-jazz in F minor after Roy Hargrove's \"Strasbourg / St. Denis\". The upright bass riff carries the tune.",
  tempo: 100,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: END }, enabled: true },
  locators: [
    { beat: bar(INTRO), label: "Intro" },
    { beat: bar(HEAD1), label: "Head" },
    { beat: bar(SOLO), label: "Trumpet solo" },
    { beat: bar(SOLO + 8), label: "Solo build" },
    { beat: bar(HEAD2), label: "Head out" },
    { beat: bar(TAG), label: "Tag" },
  ],
  midiTracks: [
    { name: "Trumpet", program: 56, gain: 0.95, pan: 0.15, keySignature: key, notes: notes.trumpet },
    { name: "Tenor Sax", program: 66, gain: 0.85, pan: -0.25, keySignature: key, notes: notes.tenor },
    { name: "Trombone", program: 57, gain: 0.7, pan: 0.35, keySignature: key, notes: notes.trombone },
    { name: "Organ", program: 16, gain: 0.5, pan: -0.4, keySignature: key, notes: notes.organ },
    { name: "Rhodes", program: 4, gain: 0.6, pan: 0.4, keySignature: key, notes: notes.rhodes },
    { name: "Upright Bass", program: 32, gain: 0.85, pan: 0, keySignature: key, tabAnnotationEnabled: false, notes: notes.bass },
    { name: "Drums", program: 32, bank: 128, gain: 0.75, pan: 0, notes: notes.drums },
    { name: "Congas & Tambourine", program: 32, bank: 128, gain: 0.55, pan: 0.5, notes: notes.perc },
  ],
};

for (const t of project.midiTracks) {
  t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  for (const n of t.notes) if (n.start < 0 || n.start + n.duration > END + 0.001 || n.pitch < 0 || n.pitch > 127) throw new Error(`${t.name} out of range ${JSON.stringify(n)}`);
  console.log(t.name.padEnd(22), t.notes.length, "notes");
}
writeFileSync(new URL("./project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
