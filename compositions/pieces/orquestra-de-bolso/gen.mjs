import { writeFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const p = (n) => {
  const m = /^([A-G])(b|#)?(-?\d)$/.exec(n);
  return 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === "b" ? -1 : m[2] === "#" ? 1 : 0);
};

// chord: bass, alternate bass (the "fifth" side of the bossa bass), and a close voicing
const CH = {
  Fmaj9: ["F2", "C3", "A3 C4 E4 G4"],
  "Bbm6/F": ["F2", "C3", "Bb3 Db4 F4 G4"],
  Am7: ["A2", "E2", "A3 C4 E4 G4"],
  Abdim7: ["Ab2", "D3", "Ab3 B3 D4 F4"],
  Gm9: ["G2", "D3", "A3 Bb3 D4 F4"],
  C7b9: ["C3", "G2", "Bb3 Db4 E4 G4"],
  F13: ["F2", "C3", "A3 D4 Eb4 G4"],
  Bbmaj9: ["Bb2", "F2", "A3 C4 D4 F4"],
  "Eb9#11": ["Eb2", "Bb2", "G3 Db4 F4 A4"],
  D7b9: ["D3", "A2", "F#3 C4 Eb4 A4"],
  C13: ["C3", "G2", "E3 Bb3 D4 A4"],
  C13sus: ["C3", "G2", "Bb3 D4 F4 A4"],
  F7b9: ["F2", "C3", "A3 Db4 Eb4 Gb4"],
  "Gb7#11": ["Gb2", "Db3", "Bb3 C4 E4 Ab4"],
  Bbm9: ["Bb2", "F2", "Ab3 C4 Db4 F4"],
  Eb13: ["Eb2", "Bb2", "G3 C4 Db4 F4"],
  Abmaj9: ["Ab2", "Eb2", "G3 Bb3 C4 Eb4"],
  "Dbmaj9#11": ["Db3", "Ab2", "F3 G3 C4 Eb4"],
  Eb9: ["Eb2", "Bb2", "G3 Bb3 Db4 F4"],
  C7alt: ["C3", "G2", "Bb3 Db4 E4 Ab4"],
};
const chord = (name) => {
  const [b, a, v] = CH[name];
  return { name, bass: p(b), alt: p(a), voicing: v.split(" ").map(p) };
};

// form: [section, bars of chord lists (one name = whole bar, two = half bars)]
const A = (last) => [
  ["Fmaj9"], ["Fmaj9"], ["Bbm6/F"], ["Bbm6/F"], ["Am7"], ["Abdim7"], ["Gm9"], ["C7b9"],
  ["Fmaj9"], ["F13"], ["Bbmaj9"], ["Eb9#11"], ["Am7", "D7b9"], ["Gm9", "C13"], ["Gm9", "C13sus"], [last],
];
const form = [
  ["intro", [["Fmaj9"], ["Bbm6/F"], ["Fmaj9"], ["Gb7#11"]]],
  ["A1", A("F7b9")],
  ["B", [["Bbm9"], ["Eb13"], ["Abmaj9"], ["Dbmaj9#11"], ["Bbm9"], ["Eb9"], ["Gm9"], ["C7alt"]]],
  ["A2", A("Fmaj9")],
  ["tag", [["Gm9", "C13"], ["Am7", "D7b9"], ["Gm9"], ["Gb7#11"]]],
];

const bars = []; // { section, i (bar in section), start (beat), chords: [{start, dur, ...chord}] }
let beat = 0;
const sectionStart = {};
for (const [section, list] of form) {
  sectionStart[section] = beat;
  list.forEach((names, i) => {
    const d = 4 / names.length;
    bars.push({ section, i, start: beat, chords: names.map((n, k) => ({ start: beat + k * d, dur: d, ...chord(n) })) });
    beat += 4;
  });
}
const total = beat;
const barOf = (s, i) => bars.find((b) => b.section === s && b.i === i);

const tracks = {};
const T = (name, program, opts = {}) => (tracks[name] = { name, program, notes: [], ...opts });
const add = (t, pitch, start, duration, velocity) =>
  tracks[t].notes.push({ pitch, start: +start.toFixed(4), duration: +duration.toFixed(4), velocity: Math.max(1, Math.min(127, Math.round(velocity))) });

T("Flute", 73, { gain: 0.9, pan: 0.25 });
T("Oboe", 68, { gain: 0.85, pan: 0.15 });
T("Clarinets", 71, { gain: 0.55, pan: 0.35 });
T("Horns", 60, { gain: 0.8, pan: -0.3 });
T("Timpani", 47, { gain: 0.75, pan: 0 });
T("Celesta", 8, { gain: 0.5, pan: 0.45 });
T("Harp", 46, { gain: 0.85, pan: -0.45 });
T("Violins", 48, { gain: 0.95, pan: -0.25 });
T("Tremolo Strings", 44, { gain: 0.6, pan: -0.1 });
T("Violas pizz", 45, { gain: 0.5, pan: 0.3 });
T("String Pad", 49, { gain: 0.45, pan: 0 });
T("Cellos", 42, { gain: 0.65, pan: 0.3 });
T("Basses pizz", 45, { gain: 0.9, pan: 0.1 });

// section dynamics (0..1)
const energy = { intro: 0.35, A1: 0.55, B: 0.75, A2: 0.9, tag: 0.4 };
const E = (b) => energy[b.section] + (b.section === "A1" && b.i >= 8 ? 0.08 : 0);

// --- groove layers ---------------------------------------------------------
for (const b of bars) {
  const e = E(b);
  // bossa bass: root on 1, fifth on the "and" of 2 and on 3, root on the "and" of 4
  for (const c of b.chords) {
    const rel = c.start - b.start;
    if (c.dur === 4) {
      add("Basses pizz", c.bass, c.start, 1.5, 88 * (0.75 + e / 3));
      add("Basses pizz", c.alt, c.start + 1.5, 0.5, 62 * (0.75 + e / 3));
      add("Basses pizz", c.alt, c.start + 2, 1.5, 80 * (0.75 + e / 3));
      add("Basses pizz", c.bass, c.start + 3.5, 0.5, 60 * (0.75 + e / 3));
    } else {
      add("Basses pizz", c.bass, c.start, 1.5, 88 * (0.75 + e / 3));
      add("Basses pizz", c.alt, c.start + 1.5, 0.5, 62 * (0.75 + e / 3));
    }
  }
  // harp as the guitar's finger chords: 2-bar figure X..X..X. | ..X..X..
  const hits = b.i % 2 === 0 ? [0, 1.5, 3] : [1, 2.5];
  for (const h of hits) {
    const t = b.start + h;
    const c = b.chords.find((c) => t >= c.start && t < c.start + c.dur);
    c.voicing.forEach((v, k) => add("Harp", v, t, 0.75, (k === 3 ? 68 : 58) * (0.8 + e / 3)));
  }
  // string pad
  for (const c of b.chords) c.voicing.forEach((v) => add("String Pad", v, c.start, c.dur, 38 + 30 * e));
  // violas pizz pulse in 8ths, accents on the upbeats (the ganzá's job)
  const pulse = (b.section === "A1" && b.i >= 10) || b.section === "B" || b.section === "A2";
  if (pulse) {
    for (let k = 0; k < 8; k++) {
      const t = b.start + k * 0.5;
      const c = b.chords.find((c) => t >= c.start && t < c.start + c.dur);
      const acc = [50, 68, 44, 72, 50, 68, 44, 76][k];
      add("Violas pizz", c.voicing[1 + (k % 2)] + 12, t, 0.3, acc * (0.7 + e / 2));
    }
  }
  // clarinets: guide-tone dyads, anticipated by an eighth
  const clar = (b.section === "A1" && b.i >= 8) || b.section === "B" || b.section === "A2";
  if (clar) {
    for (const c of b.chords) {
      const s = c.start - 0.5;
      [c.voicing[1], c.voicing[3]].forEach((v) => add("Clarinets", v, s, c.dur - 0.1, 50 + 25 * e));
    }
  }
  // horns pad in A2
  if (b.section === "A2" && b.i < 15) {
    for (const c of b.chords) [c.voicing[0], c.voicing[2]].forEach((v) => add("Horns", v, c.start, c.dur, 52));
  }
  // cellos: the chromatic inner line (lowest voice of the voicing), audible in A2
  if (b.section === "A2") {
    for (const c of b.chords) add("Cellos", c.voicing[0] - 12, c.start - (c.start === b.start && b.i > 0 ? 0.5 : 0), c.dur, 72);
  }
  // celesta sparkles
  if ((b.section === "intro" || b.section === "A2" || (b.section === "tag" && b.i >= 2)) && b.i % 2 === 0) {
    const c = b.chords[b.chords.length - 1];
    [1, 2, 3].forEach((k, j) => add("Celesta", c.voicing[k] + 24, b.start + 2.5 + j * 0.5, 0.75, 52));
  }
}

// --- build-ups -------------------------------------------------------------
const gliss = (b, from, to, vel) => {
  const c = b.chords[b.chords.length - 1];
  const pcs = new Set(c.voicing.map((v) => v % 12));
  const ps = [];
  for (let x = from; x <= to; x++) if (pcs.has(x % 12)) ps.push(x);
  ps.forEach((x, k) => add("Harp", x, b.start + 2 + (2 * k) / ps.length, 1, vel + (k / ps.length) * 20));
};
const buildUp = (b, { timp, run, land, hornsRise }) => {
  const c = b.chords[0];
  for (let k = 0; k < 8; k++)
    [...c.voicing, ...c.voicing.map((v) => v + 12)].forEach((v) => add("Tremolo Strings", v, b.start + k * 0.5, 0.5, 30 + k * 11));
  for (let k = 0; k < 16; k++) add("Timpani", p(timp), b.start + k * 0.25, 0.25, 28 + k * 5.5);
  run.split(" ").forEach((n, k) => add("Flute", p(n), b.start + 2 + k * 0.25, 0.25, 72 + k * 4));
  add("Flute", p(land[0]), b.start + 4, land[1], 108);
  gliss(b, p("C4"), p("C7"), 60);
  if (hornsRise) hornsRise.split(" ").forEach((n, k) => add("Horns", p(n), b.start + k, 1, 70 + k * 12));
};
buildUp(barOf("A1", 15), { timp: "F2", run: "Bb4 C5 Db5 Eb5 F5 Gb5 A5 Bb5", land: ["Db6", 1.5] });
buildUp(barOf("B", 7), { timp: "C3", run: "Bb4 Db5 E5 G5 Ab5 Bb5 Db6 E6", land: ["F6", 2], hornsRise: "Bb4 C5 Db5 E5" });
// downbeat hits at the arrivals
add("Timpani", p("Bb2"), barOf("B", 0).start, 1, 112);
add("Timpani", p("F2"), barOf("A2", 0).start, 1, 116);
add("Timpani", p("F2"), barOf("A1", 0).start, 1, 70);
add("Timpani", p("Bb2"), barOf("B", 4).start, 1, 80);
add("Timpani", p("F2"), barOf("A2", 8).start, 1, 90);
// softer builds into A1 and back around the loop: harp gliss over the tritone sub
gliss(barOf("intro", 3), p("Bb3"), p("C6"), 48);
gliss(barOf("tag", 3), p("Bb3"), p("C6"), 40);

// --- melodies --------------------------------------------------------------
const MEL_A = [
  [[1, "C5", 0.5], [1.5, "A4", 0.5], [2, "C5", 0.5], [2.5, "E5", 3.5]],
  [[2, "D5", 0.5], [2.5, "C5", 0.5], [3, "A4", 0.5], [3.5, "Db5", 2.5]],
  [[2, "C5", 0.5], [2.5, "Bb4", 0.5], [3, "G4", 1]],
  [[1, "G4", 0.5], [1.5, "Ab4", 0.5], [2, "Bb4", 0.5], [2.5, "C5", 1.5]],
  [[0, "D5", 1], [1.5, "D5", 0.5], [2, "D5", 1], [3.5, "D5", 1]],
  [[1, "D5", 0.5], [1.5, "F5", 0.5], [2, "D5", 1], [3, "B4", 0.5], [3.5, "D5", 2]],
  [[2, "D5", 0.5], [2.5, "E5", 0.5], [3, "F5", 1]],
  [[0, "E5", 1], [1, "Db5", 1], [2, "C5", 0.5], [2.5, "Bb4", 0.5], [3, "G4", 0.5], [3.5, "A4", 2.5]],
  [[2.5, "C5", 0.5], [3, "E5", 0.5], [3.5, "G5", 2.5]],
  [[2, "F5", 0.5], [2.5, "Eb5", 0.5], [3, "C5", 1]],
  [[0, "D5", 1.5], [1.5, "F5", 0.5], [2, "A5", 1.5], [3.5, "G5", 0.5]],
  [[0, "A5", 2], [2, "G5", 0.5], [2.5, "F5", 0.5], [3, "Db5", 1]],
  [[0, "C5", 1], [1, "E5", 0.5], [1.5, "G5", 0.5], [2, "F#5", 1], [3, "Eb5", 1]],
  [[0, "D5", 1.5], [1.5, "F5", 0.5], [2, "E5", 0.5], [2.5, "D5", 0.5], [3, "E5", 0.5], [3.5, "G5", 0.5]],
  [[0, "F5", 1.5], [1.5, "D5", 0.5], [2, "A4", 1], [3, "G4", 0.5]],
];
const melody = (track, section, bars, vel, shift = 0, from = 0) =>
  bars.forEach((list, i) => {
    if (i < from) return;
    const b = barOf(section, i);
    for (const [s, n, d] of list) add(track, p(n) + shift, b.start + s, d, vel + (d >= 1.5 ? 6 : 0));
  });

// A1: flute carries the tune, ending on the 3rd of F7 before the run
melody("Flute", "A1", [...MEL_A.slice(0, 14), [...MEL_A[14], [3.5, "A4", 1.5]]], 90);
// A2: violins take it, flute doubles an octave up in the second half, final note is the maj7
const MEL_A2 = [...MEL_A.slice(0, 14), [...MEL_A[14], [3.5, "E5", 3]]];
melody("Violins", "A2", MEL_A2, 96);
melody("Flute", "A2", MEL_A2, 74, 12, 8);
// intro: a small flute sigh over the minor iv
melody("Flute", "intro", [[], [[2.5, "Db5", 0.5], [3, "C5", 1]], [], []], 70);

// B: horns sing, cellos answer from below, oboe and violins join for the second half
const MEL_B = [
  [[0, "C5", 3], [3, "Db5", 1]],
  [[0, "C5", 2], [2, "Bb4", 1], [3, "G4", 1]],
  [[0, "G4", 1.5], [1.5, "Bb4", 0.5], [2, "Eb5", 2]],
  [[0, "G5", 2], [2, "F5", 1], [3, "Eb5", 1]],
  [[0, "Db5", 2], [2, "C5", 1], [3, "Ab4", 1]],
  [[0, "G4", 1.5], [1.5, "Bb4", 0.5], [2, "Db5", 2]],
  [[0, "D5", 1.5], [1.5, "F5", 0.5], [2, "A5", 1], [3, "G5", 1]],
];
melody("Horns", "B", MEL_B, 92);
melody("Oboe", "B", MEL_B, 80, 0, 4);
melody("Violins", "B", MEL_B, 78, 12, 4);
const CELLO_B = [
  [[0, "F3", 2], [2, "Ab3", 2]], [[0, "G3", 4]], [[0, "C4", 2], [2, "Bb3", 2]], [[0, "Ab3", 4]],
  [[0, "Db4", 2], [2, "C4", 2]], [[0, "Bb3", 4]], [[0, "A3", 2], [2, "Bb3", 2]],
];
melody("Cellos", "B", CELLO_B, 80);

// tag: oboe echoes the opening motif, fading toward the loop point
melody("Oboe", "tag", [
  [[1, "D5", 0.5], [1.5, "Bb4", 0.5], [2, "D5", 0.5], [2.5, "E5", 1.5]],
  [[1, "C5", 0.5], [1.5, "A4", 0.5], [2, "C5", 0.5], [2.5, "Eb5", 1.5]],
  [[1, "D5", 0.5], [1.5, "Bb4", 0.5], [2, "A4", 2]],
  [[0, "Bb4", 3]],
], 72);

const project = {
  title: "Orquestra de Bolso (orchestral bossa after Jobim)",
  comment:
    "No drum kit: the groove is pizzicato basses (bossa thumb pattern), harp as the guitar's syncopated finger chords, violas pizz on upbeats, and clarinets anticipating each chord by an eighth. Form: intro / A (flute) / B up a minor third (horns) / A' (violins, full) / tag over Gm9 to Gb7#11, looping back to F.",
  tempo: 132,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { enabled: true, range: { startBeat: 0, endBeat: total } },
  locators: [
    { beat: sectionStart.intro, label: "Intro" },
    { beat: sectionStart.A1, label: "A (flute)" },
    { beat: sectionStart.B, label: "B (horns, Ab)" },
    { beat: sectionStart.A2, label: "A' (tutti)" },
    { beat: sectionStart.tag, label: "Tag" },
  ],
  midiTracks: Object.values(tracks).map((t) => ({ ...t, keySignature: { fifths: -1, mode: "major" } })),
};
writeFileSync("project.json", JSON.stringify(project, null, 1));
const payload = deflateRawSync(JSON.stringify(project)).toString("base64url");
const link = `https://toy-midi.hiro18181.workers.dev/draft#p=${payload}`;
writeFileSync("link.txt", link);
console.log("bars", bars.length, "beats", total, "seconds", ((total * 60) / 132).toFixed(1));
for (const t of Object.values(tracks)) console.log(t.name, t.notes.length);
console.log("link length", link.length);
