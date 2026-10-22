import { writeFileSync } from "node:fs";

// Château d'Eau: a soul-jazz riff tune in E♭ major at 100 BPM, after the techniques of
// Roy Hargrove's "Strasbourg / St. Denis". See README.md for the reading and the plan.

// ---------- helpers ----------
const PC = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const P = (s) => { const m = /^([A-G][#b]?)(-?\d)$/.exec(s); return PC[m[1]] + 12 * (Number(m[2]) + 1); };
const bar = (b) => (b - 1) * 4; // bar b (1-based) -> start beat
const BARS = 50;

// seeded random for small timing and velocity scatter
let seed = 20261019;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const jitter = (amount) => (rand() * 2 - 1) * amount;

const ms = (x) => (x * 100) / 60000; // milliseconds to beats at 100 BPM
// Each horn player leans on the beat in their own way, a fixed offset in ms, so stacked parts
// don't attack as one block and comb-filter into a thin, phasey note.
const LEAN = { trumpet: 0, alto: 6, tenor: 11, trombone: 9, bari: 14, brass: 3, horns: 8 };

const notes = {};
const add = (track, pitch, start, duration, velocity, { tJit = 0, vJit = 0 } = {}) => {
  (notes[track] ??= []).push({
    pitch,
    start: Math.max(0, start + ms(LEAN[track] ?? 0) + jitter(tJit)),
    duration,
    velocity: Math.max(1, Math.min(127, Math.round(velocity + jitter(vJit)))),
  });
};
// list of [note, beatInBar, duration], placed at bar b
const phrase = (track, b, list, vel, opts = {}) => {
  for (const [n, s, d, dv = 0] of list) add(track, typeof n === "number" ? n : P(n), bar(b) + s, d, vel + dv, opts);
};

// ---------- harmony ----------
// Chord tones (pitch classes) for harmonizing and comping, plus the comp voicings.
const CHORDS = {
  Gm7: { tones: ["G", "Bb", "D", "F"], rhodes: ["Bb3", "D4", "F4", "G4"], gtr: ["F4", "Bb4", "D5"], organ: ["F3", "Bb3", "D4", "G4"] },
  Abmaj7: { tones: ["Ab", "C", "Eb", "G"], rhodes: ["C4", "Eb4", "G4", "Bb4"], gtr: ["G4", "C5", "Eb5"], organ: ["G3", "C4", "Eb4", "Ab4"] },
  Bb7sus: { tones: ["Bb", "Eb", "F", "Ab", "C"], rhodes: ["Ab3", "C4", "Eb4", "F4"], gtr: ["Ab4", "C5", "F5"], organ: ["Ab3", "C4", "Eb4", "F4"] },
  Bb7: { tones: ["Bb", "D", "F", "Ab", "C"], rhodes: ["Ab3", "C4", "D4", "F4"], gtr: ["F4", "Ab4", "D5"], organ: ["Ab3", "D4", "F4", "Bb4"] },
  D7b9: { tones: ["D", "F#", "A", "C", "Eb"], rhodes: ["F#3", "C4", "Eb4", "A4"], gtr: ["F#4", "C5", "Eb5"], organ: ["F#3", "C4", "Eb4", "A4"] },
  Ebmaj7: { tones: ["Eb", "G", "Bb", "D"], rhodes: ["G3", "Bb3", "D4", "F4"], gtr: ["G4", "Bb4", "D5"], organ: ["G3", "Bb3", "D4", "F4"] },
  Ebmaj9: { tones: ["Eb", "G", "Bb", "D", "F"], rhodes: ["G3", "Bb3", "D4", "F4"], gtr: ["G4", "Bb4", "D5"], organ: ["G3", "Bb3", "D4", "F4"] },
  Cm9: { tones: ["C", "Eb", "G", "Bb", "D"], rhodes: ["G3", "Bb3", "D4", "Eb4"], gtr: ["Eb4", "Bb4", "D5"], organ: ["G3", "Bb3", "D4", "Eb4"] },
  // solo section: the same keys, opened up with 9ths, 11ths and #11
  Gm11: { tones: ["G", "Bb", "D", "F", "C"], rhodes: ["F3", "Bb3", "C4", "D4"], gtr: ["F4", "C5", "D5"], organ: ["F3", "Bb3", "C4", "D4"] },
  Abmaj7s11: { tones: ["Ab", "C", "Eb", "G", "D", "Bb"], rhodes: ["G3", "C4", "D4", "Eb4"], gtr: ["G4", "D5", "Eb5"], organ: ["G3", "C4", "D4", "Eb4"] },
  Cm11: { tones: ["C", "Eb", "G", "Bb", "F", "D"], rhodes: ["Bb3", "Eb4", "F4", "G4"], gtr: ["Bb4", "Eb5", "F5"], organ: ["Bb3", "Eb4", "F4", "G4"] },
  Fm9: { tones: ["F", "Ab", "C", "Eb", "G"], rhodes: ["Ab3", "C4", "Eb4", "G4"], gtr: ["Ab4", "Eb5", "G5"], organ: ["Ab3", "C4", "Eb4", "G4"] },
};
const ROOT = { Gm7: "G", Abmaj7: "Ab", Bb7sus: "Bb", Bb7: "Bb", D7b9: "D", Ebmaj7: "Eb", Ebmaj9: "Eb", Cm9: "C", Gm11: "G", Abmaj7s11: "Ab", Cm11: "C", Fm9: "F" };

// Bar types. The head is an 8-bar form: a two-bar cycle iii-IV | V7sus (V/iii) three times,
// then the tonic arrival I | vi (V/iii) back to the top.
const TYPES = {
  a: [["Gm7", 0], ["Abmaj7", 2]], // the push into Bb7sus on the "and" of 4 belongs to the next bar
  a3: [["Gm7", 0], ["Abmaj7", 2]], // a, with the riff opening on G5 to resolve the previous F#
  b1: [["Bb7sus", 0], ["D7b9", 3]],
  b2: [["Bb7sus", 0], ["D7b9", 3]],
  b6: [["Bb7sus", 0], ["Bb7", 2]],
  c7: [["Ebmaj7", 0]],
  c8: [["Cm9", 0], ["D7b9", 3]],
  // solo: one chord per two bars, tightening into the return
  sG: [["Gm11", 0]],
  sAb: [["Abmaj7s11", 0]],
  sC: [["Cm11", 0]],
  sF: [["Fm9", 0]],
  sBb: [["Bb7sus", 0]],
  sBbD: [["Bb7sus", 0], ["D7b9", 3]],
  end: [["Gm7", 0], ["Abmaj7", 2], ["Ebmaj9", 3.5]],
  rest: [["Ebmaj9", 0]],
};
const HEAD = ["a", "b1", "a", "b2", "a3", "b6", "c7", "c8"];
const form = []; // form[b] = { sec, type }
const put = (sec, types) => types.forEach((type) => form.push({ sec, type }));
put("intro", ["a", "b1", "a", "b1", "a", "b1", "a", "b1"]); // 1-8
put("head1", HEAD); // 9-16
put("head2", HEAD); // 17-24
put("solo", ["sG", "sG", "sAb", "sAb", "sG", "sG", "sC", "sC", "sAb", "sAb", "sF", "sF", "sG", "sAb", "sBb", "sBbD"]); // 25-40
put("head3", HEAD); // 41-48
put("ending", ["end", "rest"]); // 49-50
form.unshift(null); // 1-based
if (form.length - 1 !== BARS) throw new Error("bars " + (form.length - 1));

const segments = [];
for (let b = 1; b <= BARS; b++) {
  const chords = TYPES[form[b].type];
  chords.forEach(([name, s], i) => {
    const end = i + 1 < chords.length ? chords[i + 1][1] : 4;
    segments.push({ name, start: bar(b) + s, len: end - s, b, sec: form[b].sec });
  });
}
const chordAt = (t) => segments.findLast((s) => s.start <= t + 1e-6).name;

// ---------- the riff head (horns) ----------
// The run F#-Eb-C-A over D7b9 is the snap back to the top, used as a pickup into every head.
const RUN = [["F#5", 3, 0.25, 6], ["Eb5", 3.25, 0.25], ["C5", 3.5, 0.25], ["A4", 3.75, 0.25, -4]];
const RIFF = {
  a: [["D5", 0.5, 0.2], ["F5", 0.75, 0.2], ["G5", 1, 0.45, 8], ["F5", 1.5, 0.2], ["D5", 2, 0.2], ["Eb5", 2.25, 0.45, 4], ["C5", 2.75, 0.2], ["Bb4", 3, 0.45]],
  b1: [["Eb5", 1.5, 0.2], ["F5", 1.75, 0.2], ["Ab5", 2, 0.7, 8], ...RUN],
  b2: [["Eb5", 1.5, 0.2], ["F5", 1.75, 0.2], ["Ab5", 2, 0.45, 8], ["F5", 2.5, 0.4], ["A4", 3, 0.2, 4], ["C5", 3.25, 0.2], ["Eb5", 3.5, 0.2], ["F#5", 3.75, 0.2, 6]],
  b6: [["Eb5", 1.5, 0.2], ["F5", 1.75, 0.2], ["Ab5", 2, 0.45, 8], ["G5", 2.5, 0.2], ["F5", 2.75, 0.2], ["D5", 3, 0.2], ["F5", 3.25, 0.2], ["G5", 3.5, 2.0, 10]],
  c7: [["F5", 2, 0.2], ["G5", 2.25, 0.2], ["Bb5", 2.5, 0.45, 8], ["G5", 3, 0.2], ["F5", 3.25, 0.2], ["Eb5", 3.5, 0.45]],
  c8: [["C5", 0, 0.2], ["D5", 0.5, 0.45, 4], ["Bb4", 1, 0.7], ...RUN],
};
RIFF.a3 = [["G5", 0, 0.2, 10], ...RIFF.a];

// Second voice: the nearest chord tone at least a minor third below the lead.
const below = (p, t) => {
  const pcs = CHORDS[chordAt(t)].tones.map((n) => PC[n]);
  for (let q = p - 3; q > p - 9; q--) if (pcs.includes(((q % 12) + 12) % 12)) return q;
  return p - 3;
};

const hornOpts = { tJit: 0.008, vJit: 4 };
const headVel = { head1: 96, head2: 100, head3: 108 };
// No literal unison, which comb-filters on General MIDI samples. The riff is spread in octaves
// plus a second voice, and GM's Brass Section, recorded as an ensemble, doubles both voices an
// octave down for body under the solo horns. The bari adds the bottom from head 2.
const voices = (p, t, sec) => {
  const second = below(p, t);
  const v = [["trumpet", p, 0], ["alto", second, -6], ["tenor", p - 12, -4], ["brass", p - 12, -16], ["brass", second - 12, -20]];
  if (sec !== "head1") v.push(["bari", p - 24, -6]);
  return v;
};
for (let b = 1; b <= BARS; b++) {
  const { sec, type } = form[b];
  if (!sec.startsWith("head")) continue;
  const v = headVel[sec];
  for (const [n, s, d, dv = 0] of RIFF[type]) {
    const t = bar(b) + s;
    for (const [track, p, tv] of voices(P(n), t, sec)) add(track, p, t, d, v + dv + tv, hornOpts);
  }
}
// pickup run into each head (intro bar 8, solo bar 40)
for (const b of [8, 40]) {
  for (const [n, s, d, dv = 0] of RUN) {
    const t = bar(b) + s;
    for (const [track, p, tv] of voices(P(n), t, b === 40 ? "head2" : "head1")) add(track, p, t, d, 100 + dv + tv, hornOpts);
  }
}
const RIFF_TRACKS = ["trumpet", "alto", "tenor", "brass", "bari"];
// Falls off the last note of each riff bar (the B♭ on beat 4), and an sfz-cresc on the G held
// over the tonic arrival.
const falls = [];
const sfz = { trumpet: [], alto: [], tenor: [], brass: [], bari: [], trombone: [], horns: [] };
for (let b = 1; b <= BARS; b++) {
  const { sec, type } = form[b];
  if (!sec.startsWith("head")) continue;
  if (type === "a" || type === "a3") falls.push(bar(b) + 3);
  if (type === "b6") for (const tr of RIFF_TRACKS) sfz[tr].push([bar(b) + 3.5, 2.0]);
}

// Trombone counter-line (heads 2 and 3): long guide tones against the riff's punch,
// a chromatic line F-G-Ab-F# that falls back to F at each top.
const BONE = {
  a: [["F3", 0, 1.75], ["G3", 2, 1.25]],
  b1: [["Ab3", 0.5, 2.25], ["F#3", 3, 0.75]],
  b2: [["Ab3", 0.5, 2.25], ["F#3", 3, 0.75]],
  b6: [["Ab3", 0.5, 1.25], ["D4", 2, 1.25], ["Eb4", 3.5, 2.25, 6]],
  c7: [["D4", 2, 1.75]],
  c8: [["Bb3", 0, 2.5], ["F#3", 3, 0.75]],
};
BONE.a3 = BONE.a;
// Each long guide tone is played sfz, drops, and swells into the next one. French horns double
// the line an octave up in head 3.
for (let b = 1; b <= BARS; b++) {
  const { sec, type } = form[b];
  if (sec !== "head2" && sec !== "head3") continue;
  for (const [n, s, d, dv = 0] of BONE[type]) {
    const t = bar(b) + s;
    add("trombone", P(n), t, d, (sec === "head3" ? 90 : 84) + dv, hornOpts);
    if (d >= 1) sfz.trombone.push([t, d]);
    if (sec === "head3") {
      add("horns", P(n) + 12, t, d, 76 + dv, hornOpts);
      if (d >= 1) sfz.horns.push([t, d]);
    }
  }
}
add("trombone", P("D3"), bar(40) + 3, 0.6, 96);

// Horn backgrounds behind the solo. French horns hold soft two-note pads that swell with each
// two-bar chord from the start of the solo, so its first half breathes without going empty. From
// bar 33 alto, tenor, and trombone join the pads, and bars 37-39 push on the "and" of 4 into the
// next chord, like the bass figure.
const swells = { horns: [], alto: [], tenor: [], trombone: [], strings: [] };
const HORN_PADS = { Gm11: ["Bb3", "F4"], Abmaj7s11: ["C4", "G4"], Cm11: ["Bb3", "Eb4"], Fm9: ["Ab3", "Eb4"] };
for (let b = 25; b <= 36; b += 2) {
  const name = chordAt(bar(b));
  for (const n of HORN_PADS[name]) add("horns", P(n), bar(b), 7.75, 70);
  swells.horns.push([bar(b), 8]);
}
const PADS = [
  [33, { alto: "D4", tenor: "Eb3", trombone: "Ab2" }],
  [35, { alto: "C4", tenor: "F3", trombone: "C3" }],
];
for (const [b, v] of PADS) for (const h of ["alto", "tenor", "trombone"]) { add(h, P(v[h]), bar(b), 7.75, 70); swells[h].push([bar(b), 8]); }
const PUSHES = [
  [37, { trumpet: "C5", alto: "G4", tenor: "Eb4", trombone: "Ab3", bari: "Ab2", brass: "C4", horns: "G4" }], // into Abmaj7
  [38, { trumpet: "Eb5", alto: "C5", tenor: "Ab4", trombone: "F3", bari: "Bb2", brass: "Eb4", horns: "C5" }], // into Bb7sus
  [39, { trumpet: "F5", alto: "Eb5", tenor: "C5", trombone: "Ab3", bari: "Bb2", brass: "F4", horns: "Eb5" }], // into Bb7sus again, higher
];
for (const [b, v] of PUSHES) for (const [h, n] of Object.entries(v)) add(h, P(n), bar(b) + 3.5, 0.75, 84 + (b - 37) * 6 - (h === "brass" ? 14 : 0), hornOpts);

// ---------- ending ----------
// Bar 49: the riff once more in stop time, the one place for true unison and octaves, then
// everyone hits Ebmaj9 on the "and" of 4, anticipated like the pushes, and stops.
const END = RIFF.a.slice(0, 7);
for (const [n, s, d, dv = 0] of END) {
  const p = P(n), t = bar(49) + s;
  for (const [track, k, v] of [["trumpet", 0, 110], ["alto", 0, 102], ["tenor", -12, 106], ["trombone", -24, 100], ["bari", -24, 100], ["brass", -12, 90]]) add(track, p + k, t, d, v + dv, hornOpts);
}
const STAB = { trumpet: ["G5"], alto: ["D5"], tenor: ["Bb4"], trombone: ["F4"], bari: ["Eb2"], brass: ["G4", "D4"], horns: ["Bb4", "F4"] };
for (const [h, ns] of Object.entries(STAB)) for (const n of ns) add(h, P(n), bar(49) + 3.5, 0.9, h === "brass" ? 100 : 116);

// ---------- horn automation ----------
// CC11 (expression): full by default, sfz-drop-cresc on held notes, and swells on the pads.
// Pitch bend: a small fixed detune per player, the cheap version of a section's spread, plus
// the falls.
const DETUNE = { trumpet: 0, alto: -0.06, tenor: 0.07, trombone: -0.05, bari: 0.05, brass: 0.04, horns: -0.04, strings: 0 };
const automation = (track) => {
  const shapes = [];
  for (const [t, len] of sfz[track] ?? []) shapes.push([t, len, (x) => (x < 0.12 ? 124 : x < 0.3 ? 70 : 70 + ((x - 0.3) / (len - 0.3)) * 50)]);
  for (const [t, len] of swells[track] ?? []) shapes.push([t, len, (x) => (x < len * 0.6 ? 46 + (x / (len * 0.6)) * 70 : 116 - ((x - len * 0.6) / (len * 0.4)) * 50)]);
  shapes.sort((a, b) => a[0] - b[0]);
  const cc = [{ beat: 0, value: 127 }];
  for (const [t, len, f] of shapes) {
    for (let x = 0; x < len; x += 0.125) cc.push({ beat: t + x, value: Math.round(Math.min(127, f(x))) });
    cc.push({ beat: t + len, value: 127 });
  }
  const d = DETUNE[track] ?? 0;
  const pb = [{ beat: 0, semitones: d }];
  if (RIFF_TRACKS.includes(track)) {
    for (const f of falls) {
      for (let x = 0.15; x <= 0.45 + 1e-9; x += 0.05) pb.push({ beat: f + x, semitones: d - 2.5 * ((x - 0.15) / 0.3) ** 2 });
      pb.push({ beat: f + 0.5, semitones: d });
    }
  }
  const dedupe = (pts) => pts.filter((p, i) => i + 1 >= pts.length || pts[i + 1].beat > p.beat + 1e-6);
  return [
    { type: "controller", controller: 11, points: dedupe(cc) },
    { type: "pitch-bend", points: dedupe(pb).map((p) => ({ beat: p.beat, semitones: Math.round(p.semitones * 1000) / 1000 })) },
  ];
};

// ---------- bass: the defining figure ----------
// Staccato roots with an octave pop, a climb G-Ab-Bb with Bb pushed on the "and" of 4 and tied
// over the barline, and a D-C-A tumble over D7b9 back to G.
const BASS = {
  a: [["G2", 0, 0.4, 8], ["G3", 0.75, 0.15, -14], ["G2", 1, 0.35], ["Ab2", 2, 0.4, 4], ["Ab2", 2.75, 0.15, -12], ["Bb2", 3.5, 1.85, 12]],
  b1: [["Ab2", 1.5, 0.2, -10], ["F2", 1.75, 0.2, -12], ["Bb2", 2, 0.3, -2], ["D3", 3, 0.35, 8], ["C3", 3.5, 0.2, -4], ["A2", 3.75, 0.2, -2]],
  b6: [["Ab2", 1.5, 0.2, -10], ["F2", 1.75, 0.2, -12], ["Bb2", 2, 0.3, -2], ["Bb2", 2.75, 0.15, -12], ["D3", 3, 0.25, 4], ["Bb2", 3.25, 0.2, -6], ["Eb2", 3.5, 1.85, 12]],
  c7: [["Bb2", 2, 0.3], ["Eb3", 2.75, 0.15, -12], ["D3", 3, 0.4, 2], ["Bb2", 3.5, 0.4, -4]],
  c8: [["C3", 0, 0.4, 8], ["C3", 0.75, 0.15, -14], ["Bb2", 1, 0.35], ["G2", 2, 0.4, 4], ["G2", 2.75, 0.15, -12], ["D3", 3, 0.35, 8], ["C3", 3.5, 0.2, -4], ["A2", 3.75, 0.2, -2]],
  // solo, loosened: long roots and space, two bars per chord
  sG: [[["G2", 0, 1.4, 4], ["D3", 2.5, 0.4, -10], ["G3", 3.5, 0.3, -14]], [["G2", 0, 0.6], ["F2", 1.5, 0.5, -8], ["G2", 3, 0.4, -10], ["G#2", 3.75, 0.2, -12]]],
  sAb: [[["Ab2", 0, 1.4, 4], ["Eb3", 2.5, 0.4, -10], ["Ab3", 3.5, 0.3, -14]], [["Ab2", 0, 0.6], ["G2", 1.5, 0.5, -8], ["Ab2", 3, 0.4, -10], ["F#2", 3.75, 0.2, -12]]],
  sC: [[["C3", 0, 1.4, 4], ["G2", 2.5, 0.4, -10], ["C3", 3.5, 0.3, -14]], [["C3", 0, 0.6], ["Bb2", 1.5, 0.5, -8], ["G2", 3, 0.4, -10], ["A2", 3.75, 0.2, -12]]],
  sF: [[["F2", 0, 1.4, 4], ["C3", 2.5, 0.4, -10], ["F3", 3.5, 0.3, -14]], [["F2", 0, 0.6], ["Eb2", 1.5, 0.5, -8], ["F2", 3, 0.4, -10], ["F#2", 3.75, 0.2, -12]]],
};
BASS.a3 = BASS.a;
BASS.b2 = BASS.b1;
// solo bars 37-40: the figure reassembles itself into the return
const BASS_RETURN = {
  37: [["G2", 0, 0.4, 6], ["G3", 0.75, 0.15, -14], ["G2", 1, 0.35], ["Bb2", 2, 0.35, -4], ["D3", 2.75, 0.15, -12], ["Ab2", 3.5, 1.85, 10]],
  38: [["Eb2", 1.5, 0.3, -8], ["Ab2", 2, 0.35], ["Ab2", 2.75, 0.15, -12], ["Bb2", 3.5, 1.85, 10]],
  39: [["F2", 1.5, 0.2, -8], ["Ab2", 1.75, 0.2, -8], ["Bb2", 2, 0.3], ["Bb2", 2.75, 0.15, -10], ["C3", 3, 0.3], ["Bb2", 3.5, 0.2, -6], ["Ab2", 3.75, 0.2, -6]],
  40: [["Bb2", 0, 0.4, 8], ["Bb2", 0.75, 0.15, -12], ["Ab2", 1, 0.35], ["F2", 1.5, 0.3, -6], ["Bb2", 2, 0.3], ["D3", 3, 0.35, 10], ["C3", 3.5, 0.2, -2], ["A2", 3.75, 0.2]],
};
const bassVel = { intro: 98, head1: 100, head2: 102, solo: 84, head3: 106 };
let soloChordBar = 0;
for (let b = 1; b <= BARS; b++) {
  const { sec, type } = form[b];
  const opts = { tJit: 0.006, vJit: 3 };
  if (sec === "ending") continue;
  if (BASS_RETURN[b]) { phrase("bass", b, BASS_RETURN[b], 92 + (b - 37) * 3, opts); continue; }
  if (sec === "solo") { phrase("bass", b, BASS[type][soloChordBar++ % 2], bassVel.solo, opts); continue; }
  phrase("bass", b, BASS[type], bassVel[sec], opts);
}
phrase("bass", 49, [["G2", 0, 0.4, 8], ["G3", 0.75, 0.15, -10], ["G2", 1, 0.35], ["Ab2", 2, 0.4, 4], ["Ab2", 2.75, 0.15, -8], ["C3", 3, 0.25], ["Eb2", 3.5, 0.6, 14]], 106);

// ---------- guitar: doubles the bass figure an octave up ----------
// The figure is written above at guitar pitch. The guitar plays it there from bar 3 on, outside
// the loose part of the solo, and the bass takes it an octave down, in the real bass register.
// The octave pops go under velocity 46, which the Telecaster font plays from its muted layer, and
// the one note under the low E string goes up an octave.
for (const n of notes.bass) {
  const b = Math.floor(n.start / 4) + 1;
  if (b < 3 || (form[b].sec === "solo" && b < 37)) continue;
  const pop = n.duration <= 0.15;
  add("guitar", n.pitch < 40 ? n.pitch + 12 : n.pitch, n.start, pop ? n.duration : Math.min(n.duration, 0.9), pop ? 40 : n.velocity - 18, { vJit: 3 });
}
// In the loose part of the solo, ringing sixths instead, two per chord.
const SIXTHS = { Gm11: [["D4", "Bb4"], ["F4", "D5"]], Abmaj7s11: [["C4", "Ab4"], ["Eb4", "C5"]], Cm11: [["Eb4", "C5"], ["G4", "Eb5"]], Fm9: [["C4", "Ab4"], ["Eb4", "C5"]] };
for (let b = 25; b <= 36; b += 2) {
  const [first, second] = SIXTHS[chordAt(bar(b))];
  first.forEach((n, k) => add("guitar", P(n), bar(b) + 1.5 + ms(k * 12), 2.3, 72 - k * 4, { tJit: 0.004, vJit: 3 }));
  second.forEach((n, k) => add("guitar", P(n), bar(b + 1) + 0.5 + ms(k * 12), 2.2, 68 - k * 4, { tJit: 0.004, vJit: 3 }));
}

// The bass rings closer to full value, since staccato on upright reads as gaps, keeping the pops
// short and the pushes tied.
notes.bass.sort((x, y) => x.start - y.start);
notes.bass.forEach((n, i) => {
  if (n.pitch - 12 >= 28) n.pitch -= 12; // E1 is the open E string
  const next = notes.bass[i + 1]?.start ?? n.start + 4;
  if (n.duration > 0.15) n.duration = Math.max(n.duration, Math.min(n.duration * 1.8, next - n.start - 0.04));
});

// ---------- Rhodes comp: a two-bar phrase per cycle ----------
// Few attacks, each ringing: chords held for a dotted quarter or longer on the bass's hits and
// pushes, and a small answer in the hole at the start of each second bar, where the horns rest.
const chordNotes = (name, key) => CHORDS[name][key].map(P);
const stab = (track, key, name, t, d, v, opts = { tJit: 0.008, vJit: 4 }) => chordNotes(name, key).forEach((p) => add(track, p, t, d, v, opts));
const ANSWER = [[["Eb4", "Ab4"], 0.75, 0.2, -8], [["F4", "Bb4"], 1, 0.9, -2]];
const RHODES = {
  a: [["Gm7", 0, 1.4], ["Abmaj7", 2, 1.4], ["Bb7sus", 3.5, 1.9, 6]],
  b1: [...ANSWER, ["D7b9", 3, 0.95, 4]],
  b6: [...ANSWER, ["Bb7", 2, 1.4], ["Ebmaj7", 3.5, 2.4, 8]],
  c7: [[["D4", "G4"], 2.75, 0.2, -8], [["F4", "Bb4"], 3, 0.45, -4]],
  c8: [["Cm9", 0, 2.8], ["D7b9", 3, 0.95, 4]],
};
RHODES.a3 = RHODES.a;
RHODES.b2 = RHODES.b1;
for (let b = 1; b <= BARS; b++) {
  const { sec, type } = form[b];
  if (sec === "solo" || sec === "ending" || (sec === "intro" && b < 5)) continue;
  const t0 = bar(b), v = sec === "intro" ? 66 : sec === "head3" ? 80 : 74;
  for (const [what, s, d, dv = 0] of RHODES[type]) {
    if (typeof what === "string") stab("rhodes", "rhodes", what, t0 + s, d, v + dv);
    else what.forEach((n) => add("rhodes", P(n), t0 + s, d, v + dv, { tJit: 0.008, vJit: 4 }));
  }
}
stab("rhodes", "rhodes", "Ebmaj9", bar(49) + 3.5, 1.5, 96);

// ---------- organ and strings: a continuous bed ----------
// The organ holds every chord from bar 5 on, so something always rings between the riff's
// attacks. Strings join in the solo, where they swell with each two-bar chord, and in head 3.
const organVel = { intro: 46, head1: 50, head2: 54, solo: 50, head3: 58 };
for (const s of segments) {
  if (s.sec === "ending" || (s.sec === "intro" && s.b < 5)) continue;
  chordNotes(s.name, "organ").forEach((p) => add("organ", p, s.start, s.len, organVel[s.sec]));
  if (s.sec === "solo" || s.sec === "head3") {
    const [low, , , top] = chordNotes(s.name, "organ");
    [low, top, top + 12].forEach((p) => add("strings", p, s.start, s.len, s.sec === "solo" ? 66 : 58));
  }
}
for (let b = 25; b <= 39; b += 2) swells.strings.push([bar(b), b === 39 ? 4 : 8]);
chordNotes("Ebmaj9", "organ").forEach((p) => add("organ", p, bar(49) + 3.5, 2.5, 70));
chordNotes("Ebmaj9", "organ").forEach((p) => add("strings", p + 12, bar(49) + 3.5, 2.5, 80));

// ---------- Rhodes solo (bars 25-40) ----------
// Starts from the riff's first gesture, D-F-G, answers it a step up over Abmaj7#11, then lengthens
// the phrases and climbs to the peak in bar 39, leaving the D7b9 run to the horns in bar 40.
const SOLO = {
  25: [["D5", 0.5, 0.2], ["F5", 0.75, 0.2], ["G5", 1, 1.0, 8], ["F5", 3, 0.2], ["D5", 3.25, 0.5]],
  26: [["Bb4", 1.5, 0.45], ["C5", 2, 0.2], ["D5", 2.25, 1.25, 4]],
  27: [["Eb5", 0.5, 0.2], ["G5", 0.75, 0.2], ["Bb5", 1, 1.0, 8], ["Ab5", 3, 0.2], ["G5", 3.25, 0.5]],
  28: [["D5", 1.5, 0.45, 4], ["Eb5", 2, 0.2], ["C5", 2.25, 1.25]],
  29: [["F5", 0, 0.45], ["G5", 0.5, 0.2], ["Bb5", 0.75, 0.7, 8], ["G5", 1.5, 0.2], ["F5", 1.75, 0.2], ["D5", 2, 0.45], ["C5", 2.5, 0.45], ["Bb4", 3, 0.7]],
  30: [["G4", 0, 1.4], ["Bb4", 3, 0.2], ["C5", 3.25, 0.2], ["D5", 3.5, 0.2], ["F5", 3.75, 0.2]],
  31: [["G5", 0, 0.7, 8], ["Eb5", 0.75, 0.2], ["F5", 1, 0.45], ["C5", 1.5, 0.45], ["Bb4", 2.5, 0.2], ["C5", 2.75, 0.2], ["Eb5", 3, 0.2], ["G5", 3.25, 0.2], ["Bb5", 3.5, 0.45, 6]],
  32: [["C6", 0, 1.4, 10], ["Bb5", 1.5, 0.2], ["G5", 1.75, 0.2], ["F5", 2, 0.45], ["Eb5", 2.5, 0.2], ["C5", 2.75, 0.7]],
  33: [["Ab4", 0.5, 0.2], ["C5", 0.75, 0.2], ["Eb5", 1, 0.2], ["G5", 1.25, 0.2], ["Bb5", 1.5, 0.2, 6], ["G5", 1.75, 0.2], ["D5", 2, 0.45, 4], ["Eb5", 2.5, 0.2], ["F5", 2.75, 0.2], ["G5", 3, 0.9, 6]],
  34: [["F5", 1, 0.2], ["Eb5", 1.25, 0.2], ["D5", 1.5, 0.2], ["C5", 1.75, 0.2], ["D5", 2, 0.45], ["C5", 2.5, 0.45], ["Eb5", 3, 0.45, 4]],
  35: [["Ab5", 0, 0.45, 6], ["G5", 0.5, 0.2], ["F5", 0.75, 0.2], ["C5", 1, 0.45], ["Eb5", 1.5, 0.2], ["F5", 1.75, 0.2], ["Ab5", 2, 0.2], ["C6", 2.25, 0.7, 8], ["Bb5", 3, 0.45], ["Ab5", 3.5, 0.45]],
  36: [["G5", 0, 0.2], ["F5", 0.25, 0.2], ["Eb5", 0.5, 0.2], ["C5", 0.75, 0.2], ["F5", 1, 0.9, 4], ["Eb5", 2.5, 0.2], ["F5", 2.75, 0.2], ["G5", 3, 0.2], ["Ab5", 3.25, 0.2], ["Bb5", 3.5, 0.45, 6]],
  37: [["D6", 0, 0.7, 10], ["C6", 0.75, 0.2], ["Bb5", 1, 0.2], ["G5", 1.25, 0.2], ["F5", 1.5, 0.45], ["G5", 2, 0.2], ["Bb5", 2.25, 0.2], ["D6", 2.5, 0.45, 6], ["C6", 3, 0.2], ["Bb5", 3.25, 0.2], ["G5", 3.5, 0.45]],
  38: [["Ab5", 0, 0.2], ["G5", 0.25, 0.2], ["Eb5", 0.5, 0.2], ["C5", 0.75, 0.2], ["D5", 1, 0.45], ["Eb5", 1.5, 0.2], ["G5", 1.75, 0.2], ["Bb5", 2, 0.2], ["C6", 2.25, 0.2], ["D6", 2.5, 0.45, 6], ["Eb6", 3, 0.9, 10]],
  39: [["F6", 0, 0.7, 14], ["Eb6", 0.75, 0.2], ["C6", 1, 0.2], ["Bb5", 1.25, 0.2], ["Ab5", 1.5, 0.2], ["F5", 1.75, 0.2], ["Eb5", 2, 0.2], ["F5", 2.25, 0.2], ["Ab5", 2.5, 0.2], ["Bb5", 2.75, 0.2], ["C6", 3, 0.45, 8], ["Bb5", 3.5, 0.45]],
  40: [["Ab5", 0, 0.2], ["F5", 0.25, 0.2], ["Eb5", 0.5, 0.45], ["C5", 1, 0.45], ["Bb4", 1.5, 0.9]],
};
for (const [b, list] of Object.entries(SOLO)) phrase("solo", Number(b), list, 80 + (Number(b) >= 33 ? 6 : 0), { tJit: 0.015, vJit: 6 });

// ---------- drums ----------
const K = 36, S = 38, SS = 37, CH = 42, PH = 44, OH = 46, CR = 49, RD = 51, LT = 45, MT = 47, HT = 50, FT = 43;
const d = (p, t, v, len = 0.2) => add("drums", p, t, len, v, { tJit: 0.006, vJit: 5 });
const hats16 = (t0, base, skipAt = []) => {
  for (let x = 0; x < 4; x += 0.25) if (!skipAt.includes(x)) d(CH, t0 + x, x % 1 === 0 ? base : x % 0.5 === 0 ? base - 18 : base - 34, 0.1);
};
const fill = (t0) => {
  notes.drums = notes.drums.filter((n) => !(n.start >= t0 + 2 - 0.02 && n.start < t0 + 4 && n.pitch !== K));
  [[S, 2], [S, 2.25], [S, 2.5], [HT, 2.75], [S, 3], [MT, 3.25], [LT, 3.5], [FT, 3.75]].forEach(([p, x]) => d(p, t0 + x, 84 + (x - 2) * 14));
};
for (let b = 1; b <= BARS; b++) {
  const { sec, type } = form[b];
  const t0 = bar(b);
  const second = ["b1", "b2", "b6", "c8", "sBbD"].includes(type); // second bar of a cycle
  if (sec === "intro" && b <= 2) { hats16(t0, 74); continue; } // bass and hats only
  if (sec === "intro" || sec.startsWith("head")) {
    const hard = sec === "head3";
    if ([3, 9, 17, 41].includes(b)) d(CR, t0, 108);
    // kicks follow the bass: downbeat and the push in the first bar, the D7 hit in the second
    const kicks = second ? [1.5, 2, 3] : [0, 1.75, 2, 3.5];
    if (type === "b6") kicks.splice(2, 1, 3.5);
    kicks.forEach((x) => d(K, t0 + x, x % 1 ? 84 : 100 + (hard ? 6 : 0)));
    [1, 3].forEach((x) => d(S, t0 + x, hard ? 112 : 104));
    [0.75, 2.25, 3.75].forEach((x) => d(S, t0 + x, 32));
    hats16(t0, hard ? 86 : 80, second ? [3.5] : []);
    if (second) d(OH, t0 + 3.5, 72, 0.4);
    if ([8, 24].includes(b)) fill(t0);
  } else if (sec === "solo") {
    // loosened: ride and cross-stick, kick on 1 and a soft push, hats come back from bar 37
    if (b === 25) d(CR, t0, 90);
    if (b < 37) {
      [0, 1, 1.5, 2, 3, 3.5].forEach((x) => d(RD, t0 + x, x % 1 ? 58 : 72));
      d(SS, t0 + 3, 70); if (b >= 33) d(SS, t0 + 1, 62);
      d(K, t0, 86); d(K, t0 + 2.5, b >= 33 ? 72 : 60);
      d(PH, t0 + 1, 50); d(PH, t0 + 3, 50);
      if (b >= 33) [1.75, 2.75].forEach((x) => d(S, t0 + x, 28));
    } else {
      if (b === 37) d(CR, t0, 96);
      hats16(t0, 70 + (b - 37) * 4);
      [1, 3].forEach((x) => d(S, t0 + x, 92 + (b - 37) * 4));
      (b === 40 ? [0, 1.5, 2, 3] : [0, 1.75, 2, 3.5]).forEach((x) => d(K, t0 + x, 92));
      if (b === 40) fill(t0);
    }
  } else if (b === 49) {
    // stop time: kick and snare hit with the riff, then the anticipated last hit with a crash
    [[K, 0], [S, 1], [K, 2], [S, 3]].forEach(([p, x]) => d(p, t0 + x, 104));
    d(K, t0 + 3.5, 118); d(CR, t0 + 3.5, 120, 2);
  }
}

// ---------- percussion: congas and shaker ----------
const LC = 64, OC = 63, MC = 62, SH = 82, TB = 54;
const pc = (p, t, v, len = 0.2) => add("perc", p, t, len, v, { tJit: 0.01, vJit: 6 });
for (let b = 1; b <= BARS; b++) {
  const { sec } = form[b];
  const t0 = bar(b);
  if (sec === "ending" || (sec === "intro" && b < 5)) continue;
  const solo = sec === "solo";
  for (let x = 0; x < 4; x += 0.25) pc(SH, t0 + x, (solo ? 34 : 44) + (x % 0.5 === 0.25 ? 10 : 0), 0.1);
  if (!solo || b >= 33) {
    [[MC, 0.5, 58], [OC, 1.75, 70], [MC, 2.5, 56], [LC, 3, 72], [OC, 3.25, 66], [LC, 3.75, 62]].forEach(([p, x, v]) => pc(p, t0 + x, solo ? v - 12 : v));
  }
  if (sec === "head2" || sec === "head3") [1, 3].forEach((x) => pc(TB, t0 + x, 64));
}

// ---------- project ----------
const key = { fifths: -3, mode: "major" };
const endBeat = bar(BARS + 1);
const project = {
  title: "Château d'Eau",
  comment: "Soul-jazz riff tune in Eb major, 100 BPM, after the techniques of Roy Hargrove's \"Strasbourg / St. Denis\". Intro on the bass figure, riff head twice, a loose Rhodes solo with horn backgrounds, the head again, and a stop-time ending.",
  tempo: 100,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat }, enabled: true },
  locators: [
    { beat: bar(1), label: "Intro (bass figure)" },
    { beat: bar(9), label: "Head" },
    { beat: bar(17), label: "Head (full section)" },
    { beat: bar(25), label: "Rhodes solo" },
    { beat: bar(33), label: "Solo + horn backgrounds" },
    { beat: bar(41), label: "Head" },
    { beat: bar(49), label: "Ending" },
  ],
  midiTracks: [
    { name: "Trumpet", program: 56, gain: 0.85, pan: 0.15, keySignature: key, automation: automation("trumpet"), notes: notes.trumpet },
    { name: "Alto sax", program: 65, gain: 0.6, pan: -0.25, keySignature: key, automation: automation("alto"), notes: notes.alto },
    { name: "Tenor sax", program: 66, gain: 0.62, pan: 0.3, keySignature: key, automation: automation("tenor"), notes: notes.tenor },
    { name: "Bari sax", program: 67, gain: 0.55, pan: 0.4, keySignature: key, automation: automation("bari"), notes: notes.bari },
    { name: "Trombone", program: 57, gain: 0.6, pan: -0.35, keySignature: key, automation: automation("trombone"), notes: notes.trombone },
    { name: "Brass section (body)", program: 61, gain: 0.5, pan: -0.05, keySignature: key, automation: automation("brass"), notes: notes.brass },
    { name: "French horns", program: 60, gain: 0.45, pan: -0.45, keySignature: key, automation: automation("horns"), notes: notes.horns },
    { name: "Rhodes solo", program: 4, gain: 1.1, pan: 0.05, keySignature: key, notes: notes.solo },
    { name: "Rhodes comp", program: 4, gain: 0.6, pan: -0.4, keySignature: key, notes: notes.rhodes },
    { name: "Guitar", soundfont: "flamestudios-telecaster-neck", program: 0, gain: 0.42, pan: 0.5, keySignature: key, notes: notes.guitar },
    { name: "Organ", program: 16, gain: 0.7, pan: -0.15, keySignature: key, notes: notes.organ },
    { name: "Strings", program: 48, gain: 0.5, pan: 0.2, keySignature: key, automation: automation("strings"), notes: notes.strings },
    { name: "Upright bass", program: 32, gain: 0.75, pan: 0, keySignature: key, notes: notes.bass },
    { name: "Drums", program: 0, bank: 128, gain: 0.8, pan: 0, notes: notes.drums },
    { name: "Congas + shaker", program: 0, bank: 128, gain: 0.5, pan: 0.45, notes: notes.perc },
  ],
};

for (const t of project.midiTracks) {
  t.notes.sort((x, y) => x.start - y.start || x.pitch - y.pitch);
  for (const n of t.notes) if (n.start < 0 || n.start + n.duration > endBeat + 0.001 || n.pitch < 0 || n.pitch > 127) throw new Error(`${t.name} out of range ${JSON.stringify(n)}`);
  console.log(t.name.padEnd(18), t.notes.length, "notes");
}
writeFileSync(new URL("./v2.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
