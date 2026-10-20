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

const notes = {};
const add = (track, pitch, start, duration, velocity, { tJit = 0, vJit = 0 } = {}) => {
  (notes[track] ??= []).push({
    pitch,
    start: Math.max(0, start + jitter(tJit)),
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
  a: [["D5", 0.5, 0.2], ["F5", 0.75, 0.2], ["G5", 1, 0.45, 8], ["F5", 1.5, 0.2], ["D5", 2, 0.2], ["Eb5", 2.25, 0.45, 4], ["C5", 2.75, 0.2], ["Bb4", 3, 0.4]],
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

const HORNS = ["trumpet", "alto", "tenor", "trombone"];
const hornOpts = { tJit: 0.012, vJit: 4 };
const headVel = { head1: 96, head2: 100, head3: 108 };
for (let b = 1; b <= BARS; b++) {
  const { sec, type } = form[b];
  if (!sec.startsWith("head")) continue;
  const v = headVel[sec];
  for (const [n, s, d, dv = 0] of RIFF[type]) {
    const p = P(n), t = bar(b) + s;
    add("trumpet", p, t, d, v + dv, hornOpts);
    add("tenor", p - 12, t, d, v + dv - 4, hornOpts);
    // head 1 in unison and octaves (alto drops under the lead above its range); heads 2 and 3
    // harmonized in two parts
    add("alto", sec === "head1" && p <= P("Ab5") ? p : below(p, t), t, d, v + dv - 6, hornOpts);
  }
}
// pickup run into each head (intro bar 8, solo bar 40), in octaves
for (const b of [8, 40]) {
  for (const [n, s, d, dv = 0] of RUN) {
    const p = P(n), t = bar(b) + s;
    add("trumpet", p, t, d, 100 + dv, hornOpts);
    add("alto", below(p, t), t, d, 94 + dv, hornOpts);
    add("tenor", p - 12, t, d, 96 + dv, hornOpts);
  }
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
for (let b = 1; b <= BARS; b++) {
  const { sec, type } = form[b];
  if (sec === "head2" || sec === "head3") phrase("trombone", b, BONE[type], sec === "head3" ? 88 : 80, hornOpts);
}
add("trombone", P("D3"), bar(40) + 3, 0.6, 96);

// Horn backgrounds behind the solo: sustained pads that swell (bars 33-36), then pushes on the
// "and" of 4 that anticipate the next chord (bars 37-39), like the bass figure.
const PADS = [
  [33, 8, { trumpet: "G4", alto: "D4", tenor: "C4", trombone: "Eb3" }],
  [35, 8, { trumpet: "G4", alto: "Eb4", tenor: "C4", trombone: "Ab3" }],
];
for (const [b, len, v] of PADS) for (const h of HORNS) add(h, P(v[h]), bar(b), len - 0.25, 72);
const PUSHES = [
  [37, { trumpet: "C5", alto: "G4", tenor: "Eb4", trombone: "Ab3" }], // into Abmaj7
  [38, { trumpet: "Eb5", alto: "C5", tenor: "Ab4", trombone: "F3" }], // into Bb7sus
  [39, { trumpet: "F5", alto: "Eb5", tenor: "C5", trombone: "Ab3" }], // into Bb7sus again, higher
];
for (const [b, v] of PUSHES) for (const h of HORNS) add(h, P(v[h]), bar(b) + 3.5, 0.75, 84 + (b - 37) * 6, hornOpts);
// CC11 swells for the pads, flat elsewhere
const swell = () => {
  const points = [{ beat: 0, value: 110 }];
  for (const b of [33, 35]) {
    for (let x = 0; x < 8; x += 0.25) {
      const value = x < 5 ? 50 + (x / 5) * 60 : 110 - ((x - 5) / 3) * 40;
      points.push({ beat: bar(b) + x, value: Math.round(value) });
    }
  }
  points.push({ beat: bar(37), value: 110 });
  return [{ type: "controller", controller: 11, points }];
};

// ---------- ending ----------
// Bar 49: the riff once more in stop time, all in octaves, then everyone hits Ebmaj9 on the
// "and" of 4, anticipated like the pushes, and stops.
const END = RIFF.a.slice(0, 7);
for (const [n, s, d, dv = 0] of END) {
  const p = P(n), t = bar(49) + s;
  add("trumpet", p, t, d, 110 + dv, hornOpts);
  add("alto", p, t, d, 104 + dv, hornOpts);
  add("tenor", p - 12, t, d, 106 + dv, hornOpts);
  add("trombone", p - 24, t, d, 100 + dv, hornOpts);
}
const STAB = { trumpet: "G5", alto: "D5", tenor: "Bb4", trombone: "F4" };
for (const h of HORNS) add(h, P(STAB[h]), bar(49) + 3.5, 0.6, 116);

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

// ---------- Rhodes comp: sparse stabs and the push ----------
const chordNotes = (name, key) => CHORDS[name][key].map(P);
const stab = (track, key, name, t, d, v, opts = { tJit: 0.008, vJit: 4 }) => chordNotes(name, key).forEach((p) => add(track, p, t, d, v, opts));
const NEXT_PUSH = { a: "Bb7sus", a3: "Bb7sus", b6: "Ebmaj7" };
for (let b = 1; b <= BARS; b++) {
  const { sec, type } = form[b];
  if (sec === "solo" || sec === "ending" || (sec === "intro" && b < 5)) continue;
  const t0 = bar(b), v = sec === "intro" ? 70 : sec === "head3" ? 82 : 76;
  if (type === "a" || type === "a3") { stab("rhodes", "rhodes", "Gm7", t0 + 1.75, 0.2, v - 8); stab("rhodes", "rhodes", NEXT_PUSH[type], t0 + 3.5, 1.1, v + 6); }
  if (type === "b1" || type === "b2") { stab("rhodes", "rhodes", "Bb7sus", t0 + 2.5, 0.2, v - 10); stab("rhodes", "rhodes", "D7b9", t0 + 3, 0.4, v + 4); }
  if (type === "b6") { stab("rhodes", "rhodes", "Bb7", t0 + 2.5, 0.2, v - 6); stab("rhodes", "rhodes", "Ebmaj7", t0 + 3.5, 1.6, v + 8); }
  if (type === "c7") stab("rhodes", "rhodes", "Ebmaj7", t0 + 2.5, 0.2, v - 8);
  if (type === "c8") { stab("rhodes", "rhodes", "Cm9", t0 + 0.5, 0.3, v - 4); stab("rhodes", "rhodes", "Cm9", t0 + 1.75, 0.2, v - 10); stab("rhodes", "rhodes", "D7b9", t0 + 3, 0.4, v + 4); }
}
stab("rhodes", "rhodes", "Ebmaj9", bar(49) + 3.5, 0.6, 96);

// ---------- guitar: open accents and muted chks on the top three strings ----------
// After the cutting-guitar lessons in toy-midi#861: the rhythm is carried by which strokes ring
// and which are muted, not by velocity steps; the hand keeps moving in 16ths with air strokes in
// between; and the grips stay in one position on the G, B, and e strings, voice-led.
const ms = (x) => (x * 100) / 60000; // milliseconds to beats at 100 BPM
const STRINGS = [55, 59, 64]; // G3, B3, E4
let prevGrip = [65, 70, 74]; // F-Bb-D around the 10th fret
const gripFor = (name) => {
  const pcs = CHORDS[name].gtr.map((n) => PC[n.replace(/-?\d$/, "")]);
  let best;
  for (let a = 1; a <= 15; a++)
    for (let b = 1; b <= 15; b++)
      for (let c = 1; c <= 15; c++) {
        const frets = [a, b, c];
        if (Math.max(...frets) - Math.min(...frets) > 3) continue;
        const grip = frets.map((f, i) => STRINGS[i] + f);
        if (!grip.every((p) => pcs.includes(p % 12)) || new Set(grip.map((p) => p % 12)).size !== 3) continue;
        const score = grip.reduce((s, p, i) => s + Math.abs(p - prevGrip[i]), 0) + Math.abs(frets[0] - 9) * 0.5; // stay near the 9th fret
        if (!best || score < best.score) best = { grip, score };
      }
  return (prevGrip = best.grip);
};
// X open accent, P open push into the next bar's chord, x muted chk, . air stroke
const GTR = {
  a: "x...X.x.....x.P.",
  b: "....X..x..x.X.x.",
  b6: "....X..x..x.X.P.",
  c7: "..x.X..x..x.X..x",
  c8: "X.x.X..x..x.X.x.",
  soloOdd: "......X.......x.",
  soloEven: "..x.......X.....",
  soloBuild: "x...X.x...x...P.",
  end: "..............P.",
};
const gtrGrid = (b) => {
  const { sec, type } = form[b];
  if (sec === "intro" && b < 5) return null;
  if (sec === "ending") return b === 49 ? GTR.end : null;
  if (sec === "solo") return b === 40 ? GTR.b : b >= 37 ? GTR.soloBuild : b % 2 ? GTR.soloOdd : GTR.soloEven;
  return { a: GTR.a, a3: GTR.a, b1: GTR.b, b2: GTR.b, b6: GTR.b6, c7: GTR.c7, c8: GTR.c8 }[type];
};
const strokes = [];
for (let b = 1; b <= BARS; b++) {
  const grid = gtrGrid(b);
  if (!grid) continue;
  [...grid].forEach((c, s) => {
    if (c === ".") return;
    const t = bar(b) + s / 4;
    const name = c === "P" ? (b === 49 ? "Ebmaj9" : chordAt(bar(b + 1))) : chordAt(t);
    strokes.push({ t, s, kind: c, name, b, sec: form[b].sec });
  });
}
strokes.forEach((st, i) => {
  const grip = gripFor(st.name);
  const down = st.s % 2 === 0;
  const open = st.kind !== "x";
  let strs = open ? grip : down ? [grip[0] - 5, ...grip] : grip.slice(-2);
  if (!down) strs = [...strs].reverse();
  const start = st.t + (down ? 0 : ms(6)) + ms(jitter(4));
  const spread = (ms(open ? 16 : down ? 8 : 5) + ms(jitter(3))) / (strs.length - 1);
  // accents choke at a 16th; the last accent in a bar and the pushes ring until just before the
  // next stroke, with the left hand letting go 0.06-0.14 beat early
  const next = strokes[i + 1]?.t ?? st.t + 2.4;
  const lastInBar = !strokes.slice(i + 1).some((o) => o.b === st.b && o.kind !== "x");
  const ringEnd = st.kind === "P" || lastInBar ? Math.min(next, st.t + 1.5) - (0.06 + rand() * 0.08) : st.t + 0.2;
  const base = !open ? (down ? 40 : 34) : st.sec === "head3" ? 94 : st.sec === "solo" && st.b < 37 ? 74 : 86;
  strs.forEach((pitch, k) => {
    const on = start + k * spread;
    const velocity = base + 4 - (8 * k) / (strs.length - 1);
    if (open) add("guitar", pitch, on, Math.max(ms(30), ringEnd - on + jitter(0.02)), velocity, { vJit: 4 });
    else add("guitarMuted", pitch, on, ms(22 + jitter(4)), velocity, { vJit: 4 });
  });
});

// ---------- organ: pads under head 2, the solo, and head 3 ----------
for (const s of segments) {
  if (!["head2", "solo", "head3"].includes(s.sec)) continue;
  const v = s.sec === "solo" ? 46 + (s.b >= 33 ? 8 : 0) : s.sec === "head3" ? 56 : 50;
  chordNotes(s.name, "organ").forEach((p) => add("organ", p, s.start, s.len, v));
}
chordNotes("Ebmaj9", "organ").forEach((p) => add("organ", p, bar(49) + 3.5, 2.5, 70));

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
    { beat: bar(9), label: "Head (unison)" },
    { beat: bar(17), label: "Head (harmonized)" },
    { beat: bar(25), label: "Rhodes solo" },
    { beat: bar(33), label: "Solo + horn backgrounds" },
    { beat: bar(41), label: "Head" },
    { beat: bar(49), label: "Ending" },
  ],
  midiTracks: [
    { name: "Trumpet", program: 56, gain: 0.72, pan: 0.1, keySignature: key, automation: swell(), notes: notes.trumpet },
    { name: "Alto sax", program: 65, gain: 0.6, pan: -0.3, keySignature: key, automation: swell(), notes: notes.alto },
    { name: "Tenor sax", program: 66, gain: 0.66, pan: 0.3, keySignature: key, automation: swell(), notes: notes.tenor },
    { name: "Trombone", program: 57, gain: 0.6, pan: -0.1, keySignature: key, automation: swell(), notes: notes.trombone },
    { name: "Rhodes solo", program: 4, gain: 0.8, pan: 0.05, keySignature: key, notes: notes.solo },
    { name: "Rhodes comp", program: 4, gain: 0.55, pan: -0.4, keySignature: key, notes: notes.rhodes },
    { name: "Guitar (open)", soundfont: "flamestudios-telecaster-neck", program: 0, gain: 0.45, pan: 0.5, keySignature: key, notes: notes.guitar },
    { name: "Guitar (muted)", soundfont: "flamestudios-telecaster-neck", program: 1, gain: 0.6, pan: 0.5, keySignature: key, notes: notes.guitarMuted },
    { name: "Organ pad", program: 16, gain: 0.32, pan: -0.2, keySignature: key, notes: notes.organ },
    { name: "Upright bass", program: 32, gain: 0.9, pan: 0, keySignature: key, notes: notes.bass },
    { name: "Drums", program: 0, bank: 128, gain: 0.8, pan: 0, notes: notes.drums },
    { name: "Congas + shaker", program: 0, bank: 128, gain: 0.5, pan: 0.45, notes: notes.perc },
  ],
};

for (const t of project.midiTracks) {
  t.notes.sort((x, y) => x.start - y.start || x.pitch - y.pitch);
  for (const n of t.notes) if (n.start < 0 || n.start + n.duration > endBeat + 0.001 || n.pitch < 0 || n.pitch > 127) throw new Error(`${t.name} out of range ${JSON.stringify(n)}`);
  console.log(t.name.padEnd(18), t.notes.length, "notes");
}
writeFileSync(new URL("./v1.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
