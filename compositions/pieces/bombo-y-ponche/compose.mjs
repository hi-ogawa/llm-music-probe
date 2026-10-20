// "Bombo y Ponche": salsa in the son montuno tradition for Toy MIDI, C minor, 184 BPM, 4/4.
//
// Usage: node compose.mjs <out file>
//
// Everything locks to a 2-3 son clave. Odd bars are the 2-side (strokes on beats 2 and 3) and
// even bars the 3-side (1, the "and" of 2, 4), and every section starts on an odd bar. The
// 3-side's "and" of 2 is the bombo and its 4 the ponche, which is where the tumbao lands.
//
// Form (bars):
// 1-10   Intro. Piano guajeo on Abmaj7 | G7 with clave, then bass, congas, and güiro, then the
//        tutti figure in 9-10.
// 11-26  Head. The flute sings a 16-bar melody through a minor circle of fifths.
// 27-58  Montuno on Cm Fm | G7 Fm. Coro 4 bars, sonero 4 bars, four times. Bongo martillo and
//        the timbalero's campana come in at 27, and each cycle adds a layer.
// 59-74  Mambo. Trombones, then trumpets, then saxes, each riff in the others' gaps.
// 75-78  Cierre. The intro figure, then hits on the clave strokes, ending on the last one.
import fs from "node:fs";

const [outFile] = process.argv.slice(2);
const BAR = 4;
const at = (bar, beat) => (bar - 1) * BAR + beat;

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const m = (n) => {
  const [, l, acc, o] = n.match(/^([A-G])([#b]?)(\d)$/);
  return 12 * (Number(o) + 1) + NOTE[l] + (acc === "#" ? 1 : acc === "b" ? -1 : 0);
};

// Deterministic humanization: ±0.008 beat, ±4 velocity.
let seed = 18181;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648) * 2 - 1;
const round = (x) => Math.round(x * 1000) / 1000;
const clampVel = (v) => Math.max(1, Math.min(127, Math.round(v)));
const note = (start, duration, pitch, velocity, { tight = false } = {}) => ({
  pitch,
  start: round(Math.max(0, start + (tight ? 0 : rand() * 0.008))),
  duration: round(duration),
  velocity: clampVel(velocity + rand() * 4),
});

// --- harmony ---

const CHORDS = {
  Cm7: ["C", [0, 3, 7, 10]],
  Cm: ["C", [0, 3, 7, 10]],
  C7: ["C", [0, 4, 7, 10]],
  Fm7: ["F", [0, 3, 7, 10]],
  Fm: ["F", [0, 3, 7, 10]],
  Bb7: ["Bb", [0, 4, 7, 10]],
  Ebmaj7: ["Eb", [0, 4, 7, 11]],
  Abmaj7: ["Ab", [0, 4, 7, 11]],
  Dm7b5: ["D", [0, 3, 6, 10]],
  G7: ["G", [0, 4, 7, 10]],
  G7b9: ["G", [0, 4, 7, 10, 13]],
};
const ROOT_PC = { C: 0, D: 2, Eb: 3, F: 5, G: 7, Ab: 8, Bb: 10 };
const pcs = (name) => {
  const [root, ivs] = CHORDS[name];
  return ivs.map((i) => (ROOT_PC[root] + i) % 12);
};
const rootPc = (name) => ROOT_PC[CHORDS[name][0]];

// Timeline of [beat, chord], filled section by section.
const timeline = [];
const setChords = (bar, perBar) => {
  perBar.forEach((c, i) => {
    for (const [beat, name] of Array.isArray(c) ? c : [[0, c]]) timeline.push([at(bar + i, beat), name]);
  });
};
const chordAt = (beat) => {
  let cur = timeline[0][1];
  for (const [b, name] of timeline) if (b <= beat + 1e-6) cur = name;
  return cur;
};
const tones = (name, lo, hi) => {
  const set = pcs(name).slice(0, 4);
  const out = [];
  for (let p = lo; p <= hi; p++) if (set.includes(p % 12)) out.push(p);
  return out;
};
const nearest = (name, target, lo, hi) =>
  tones(name, lo, hi).reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) || (Math.abs(b - target) === Math.abs(a - target) && b > a) ? b : a));
// The highest chord tone below `top`, then the next one at least a minor third under it.
const innerBelow = (name, top) => {
  const below = tones(name, top - 11, top - 1).reverse();
  const first = below[0];
  const second = below.find((p) => p <= first - 3);
  return [first, second].filter((p) => p !== undefined);
};

const INTRO_VAMP = ["Abmaj7", "G7"];
const HEAD = ["Cm7", "Fm7", "Bb7", "Ebmaj7", "Abmaj7", "Dm7b5", "G7", "Cm7", "Cm7", "C7", "Fm7", "Bb7", "Ebmaj7", "Abmaj7", "Dm7b5", "G7b9"];
const VAMP = [[[0, "Cm"], [2, "Fm"]], [[0, "G7"], [2, "Fm"]]];

setChords(1, [...Array(4)].flatMap(() => INTRO_VAMP));
setChords(9, INTRO_VAMP);
setChords(11, HEAD);
for (let bar = 27; bar <= 73; bar += 2) setChords(bar, VAMP);
setChords(75, [...INTRO_VAMP, "Cm", "Cm"]);

// --- piano: two-bar guajeo in octaves with inner chord tones ---
// Positions are 8ths over a 2-3 clave pair, 0-7 on the 2-side and 8-15 on the 3-side.
// "O" is the line in octaves with two inner chord tones between, "i" is the inner tones alone,
// and "Oa" anticipates the next 8th's chord, tied over the empty position after it. The
// 2-side bar leans on the beat with its line on beats 2, 3, 4, matching the strokes on 2 and 3.
// The 3-side bar pushes, with the line on the "and" of 2, the clave's offbeat, and on the
// "and" of 4 into the next 2-side. Beat 1 of each bar is tied from the anticipation before it.
const GUAJEO = [
  [1, "i", 0],
  [2, "O", 67],
  [3, "i", 0],
  [4, "O", 68],
  [5, "i", 0],
  [6, "O", 72],
  [7, "Oa", 71],
  [9, "i", 0],
  [10, "O", 74],
  [11, "Oa", 72],
  [13, "i", 0],
  [14, "O", 68],
  [15, "Oa", 63],
];
const piano = [];
const pianoGuajeo = (bar, { vel = 0 } = {}) => {
  let top = 63;
  for (let k = 0; k < GUAJEO.length; k++) {
    const [pos, kind, target] = GUAJEO[k];
    const nextPos = k + 1 < GUAJEO.length ? GUAJEO[k + 1][0] : 17;
    const start = at(bar, pos / 2);
    const dur = kind === "Oa" ? (nextPos - pos) / 2 - 0.05 : 0.42;
    if (kind === "i") {
      const c = chordAt(start);
      for (const p of innerBelow(c, top + 12)) piano.push(note(start, dur, p, 66 + vel));
    } else {
      const c = chordAt(kind === "Oa" ? start + 0.5 : start);
      top = nearest(c, target, 63, 84);
      const v = (kind === "Oa" ? 96 : 86) + vel;
      piano.push(note(start, dur, top, v - 6));
      piano.push(note(start, dur, top + 12, v));
      for (const p of innerBelow(c, top + 12)) piano.push(note(start, dur, p, v - 18));
    }
  }
};
// The guajeo's anticipation on the "and" of 4 of a 3-side bar sets up the next pair's beat 1,
// so the first pair of a section gets a pickup on the "and" of 4 before it.
const pianoPickup = (bar) => {
  const start = at(bar, -0.5);
  const c = chordAt(at(bar, 0));
  const top = nearest(c, 63, 63, 84);
  piano.push(note(start, 0.95, top, 90), note(start, 0.95, top + 12, 96));
  for (const p of innerBelow(c, top + 12)) piano.push(note(start, 0.95, p, 76));
};

// --- bass: tumbao ---
// The "and" of 2 and beat 4 carry it, and beat 4 ties over the barline, so the downbeat is
// almost never struck. The "and" of 2 plays the fifth of the bar's chord, or the root of the
// chord arriving on beat 3. Beat 4 plays the root of the next bar's chord, a beat early.
const bass = [];
const bassPitch = (pc, near) => {
  let best;
  for (let p = 31; p <= 52; p++) if (p % 12 === pc && (best === undefined || Math.abs(p - near) < Math.abs(best - near))) best = p;
  return best;
};
let bassLast = 36;
const tumbaoBar = (bar, { busy = false, pop = false } = {}) => {
  const mid = chordAt(at(bar, 2));
  const first = chordAt(at(bar, 0));
  const andOf2 = mid !== first ? rootPc(mid) : (rootPc(first) + 7) % 12;
  const p1 = bassPitch(andOf2, bassLast);
  bass.push(note(at(bar, 1.5), 1.2, p1, 98));
  if (pop) bass.push(note(at(bar, 2.5), 0.25, p1 + 12, 70));
  const next = rootPc(chordAt(at(bar + 1, 0)));
  const p2 = bassPitch(next, p1);
  if (busy) bass.push(note(at(bar, 2.75), 0.22, bassPitch((next + 7) % 12, p2 + 5), 72));
  bass.push(note(at(bar, 3), 1.45, p2, 104));
  bassLast = p2;
};

// --- melody helpers ---
// [bar, beat, beats, pitch, velocity]
const line = (rows, vel = 0) => rows.map(([bar, beat, d, p, v]) => note(at(bar, beat), d, m(p), v + vel));

// The tutti figure: intro 9-10 and cierre 75-76. Abmaj7 | G7 with the push into G7 on the
// "and" of 4 and accents on the 3-side's "and" of 2 and 4.
const FIGURE = [
  [0, 1, 0.45, "C6", 98],
  [0, 1.5, 0.45, "Bb5", 90],
  [0, 2, 0.45, "G5", 100],
  [0, 2.5, 0.45, "Ab5", 92],
  [0, 3, 0.45, "Eb5", 94],
  [0, 3.5, 0.9, "F5", 112],
  [1, 1.5, 0.45, "Ab5", 114],
  [1, 2, 0.45, "G5", 96],
  [1, 2.5, 0.45, "F5", 94],
  [1, 3, 0.45, "D5", 110],
  [1, 3.5, 0.4, "B4", 100],
];
const figureAt = (bar) => FIGURE.map(([b, beat, d, p, v]) => [bar + b, beat, d, p, v]);

// --- head (bars 11-26), flute ---
const HEAD_MELODY = [
  // 11-14: Cm7 Fm7 Bb7 Ebmaj7, a rising call and a stepwise answer
  [11, 1, 0.5, "Eb5", 88], [11, 1.5, 0.5, "F5", 84], [11, 2, 1, "G5", 94], [11, 3.5, 1.5, "C6", 104],
  [12, 1.5, 0.5, "Bb5", 92], [12, 2, 0.5, "Ab5", 86], [12, 2.5, 0.5, "G5", 84], [12, 3, 0.5, "Ab5", 88], [12, 3.5, 1.5, "F5", 98],
  [13, 1, 0.5, "D5", 84], [13, 1.5, 0.5, "Eb5", 86], [13, 2, 0.5, "F5", 90], [13, 2.5, 1, "Ab5", 96], [13, 3.5, 2.5, "G5", 100],
  // 15-18: Abmaj7 Dm7b5 G7 Cm7
  [15, 1, 0.5, "C6", 96], [15, 1.5, 0.5, "Bb5", 88], [15, 2, 1, "G5", 92], [15, 3, 0.5, "Eb5", 86], [15, 3.5, 1.5, "F5", 98],
  [16, 1.5, 0.5, "Ab5", 100], [16, 2, 0.5, "G5", 88], [16, 2.5, 0.5, "F5", 86], [16, 3, 0.5, "D5", 86], [16, 3.5, 1.5, "B4", 96],
  [17, 1, 0.5, "D5", 86], [17, 1.5, 0.5, "F5", 92], [17, 2, 0.5, "Ab5", 98], [17, 2.5, 0.5, "G5", 88], [17, 3, 0.5, "F5", 86], [17, 3.5, 2, "Eb5", 98],
  [18, 1.5, 0.5, "D5", 84], [18, 2, 1.5, "C5", 90],
  // 19-22: Cm7 C7 Fm7 Bb7, the opening again, pushed higher by the secondary dominant
  [19, 1, 0.5, "Eb5", 90], [19, 1.5, 0.5, "F5", 86], [19, 2, 1, "G5", 96], [19, 3.5, 1.5, "Bb5", 106],
  [20, 1.5, 0.5, "Db6", 104], [20, 2, 0.5, "C6", 92], [20, 2.5, 0.5, "Bb5", 88], [20, 3, 0.5, "G5", 88], [20, 3.5, 1.5, "Ab5", 100],
  [21, 1, 0.5, "C6", 96], [21, 1.5, 0.5, "Eb6", 112], [21, 2, 0.5, "C6", 96], [21, 2.5, 0.5, "Ab5", 90], [21, 3, 0.5, "F5", 88], [21, 3.5, 1.5, "D5", 96],
  [22, 1, 0.5, "F5", 88], [22, 1.5, 0.5, "Ab5", 96], [22, 2, 1, "G5", 92], [22, 3, 0.5, "F5", 86], [22, 3.5, 1.5, "G5", 100],
  // 23-26: Ebmaj7 Abmaj7 Dm7b5 G7b9
  [23, 1.5, 0.5, "Bb5", 94], [23, 2, 1, "D6", 104], [23, 3, 0.5, "Bb5", 88], [23, 3.5, 2, "C6", 104],
  [24, 1.5, 0.5, "G5", 94], [24, 2, 0.5, "Eb5", 86], [24, 2.5, 0.5, "G5", 88], [24, 3, 0.5, "F5", 86], [24, 3.5, 1.5, "Ab5", 100],
  [25, 1, 0.5, "F5", 88], [25, 1.5, 0.5, "D5", 90], [25, 2, 0.5, "C5", 84], [25, 2.5, 0.5, "D5", 86], [25, 3, 0.5, "F5", 90], [25, 3.5, 1.5, "Ab5", 104],
  [26, 1, 0.5, "G5", 90], [26, 1.5, 0.5, "F5", 92], [26, 2, 0.5, "D5", 86], [26, 2.5, 0.5, "B4", 86], [26, 3, 0.5, "D5", 90], [26, 3.5, 1.5, "G5", 102],
];

// --- montuno (bars 27-58): coro and sonero ---
// Coro top line, 4 bars. Its strokes fall on the 2-side's beats 2 and 3 and the 3-side's
// "and" of 2. The voices under it are chord tones of the anticipated chord.
const CORO = [
  [0, 1, 0.45, "Eb5", 92], [0, 1.5, 0.45, "Eb5", 88], [0, 2, 0.95, "F5", 100], [0, 3, 0.45, "Eb5", 88], [0, 3.5, 1.45, "D5", 98],
  [1, 1.5, 0.95, "C5", 98], [1, 2.5, 0.45, "C5", 86], [1, 3, 0.45, "Ab4", 86], [1, 3.5, 1.45, "G4", 94],
  [2, 1, 0.45, "Eb5", 92], [2, 1.5, 0.45, "Eb5", 88], [2, 2, 0.95, "F5", 100], [2, 3, 0.45, "Eb5", 88], [2, 3.5, 1.45, "D5", 98],
  [3, 1, 0.45, "B4", 88], [3, 1.5, 1.45, "C5", 100],
];
// Sonero inspiraciones, 4 bars each, getting busier and higher cycle by cycle.
const INSPIRACIONES = [
  [
    [0, 0.5, 0.5, "G5", 86], [0, 1, 0.5, "C6", 96], [0, 1.5, 0.5, "Bb5", 88], [0, 2, 0.5, "Ab5", 90], [0, 2.5, 0.5, "G5", 84], [0, 3, 0.5, "F5", 84], [0, 3.5, 1.5, "D5", 96],
    [1, 1.5, 1, "Ab5", 98], [1, 2.5, 0.5, "G5", 86], [1, 3, 0.5, "F5", 84], [1, 3.5, 1.5, "Eb5", 94],
    [2, 1.5, 0.5, "C5", 84], [2, 2, 0.5, "Eb5", 88], [2, 2.5, 0.5, "F5", 88], [2, 3, 0.5, "Ab5", 92], [2, 3.5, 1.5, "G5", 98],
    [3, 1.5, 0.5, "Eb5", 88], [3, 2, 1, "C5", 92],
  ],
  [
    [0, 1, 0.25, "Eb5", 84], [0, 1.25, 0.25, "G5", 88], [0, 1.5, 0.5, "C6", 104], [0, 2, 0.45, "C6", 94], [0, 2.5, 0.45, "C6", 96], [0, 3, 0.5, "Bb5", 90], [0, 3.5, 1.5, "B5", 104],
    [1, 1.5, 1, "C6", 104], [1, 2.5, 0.5, "Ab5", 90], [1, 3, 0.5, "F5", 88], [1, 3.5, 1.5, "G5", 98],
    [2, 1, 0.5, "G5", 88], [2, 1.5, 0.5, "Bb5", 92], [2, 2, 0.5, "C6", 96], [2, 2.5, 0.5, "Eb6", 104], [2, 3, 0.5, "D6", 96], [2, 3.5, 0.5, "D6", 102],
    [3, 0, 0.5, "B5", 96], [3, 0.5, 0.5, "G5", 88], [3, 1, 0.5, "F5", 86], [3, 1.5, 0.5, "Ab5", 96], [3, 2, 1, "G5", 92],
  ],
  [
    [0, 0.75, 0.25, "G5", 84], [0, 1, 0.25, "Bb5", 88], [0, 1.25, 0.25, "C6", 92], [0, 1.5, 0.5, "Eb6", 106], [0, 2, 0.75, "F6", 108], [0, 2.75, 0.25, "Eb6", 90], [0, 3, 0.5, "C6", 94], [0, 3.5, 1, "D6", 104],
    [1, 0.5, 0.25, "B5", 88], [1, 0.75, 0.25, "D6", 92], [1, 1, 0.5, "F6", 104], [1, 1.5, 0.5, "Eb6", 106], [1, 2, 0.5, "C6", 94], [1, 2.5, 0.5, "Ab5", 90], [1, 3, 0.25, "F5", 86], [1, 3.25, 0.25, "Ab5", 88], [1, 3.5, 1.5, "G5", 100],
    [2, 1.5, 0.5, "C6", 98], [2, 2, 0.25, "C6", 90], [2, 2.25, 0.25, "Bb5", 88], [2, 2.5, 0.5, "G5", 90], [2, 3, 0.5, "Eb5", 88], [2, 3.5, 1.5, "F5", 98],
    [3, 1, 0.5, "D5", 86], [3, 1.5, 0.5, "Eb5", 92], [3, 2, 0.5, "F5", 90], [3, 2.5, 0.5, "Ab5", 94], [3, 3, 0.5, "C6", 100],
  ],
  [
    [0, 0.5, 0.5, "C6", 96], [0, 1, 0.5, "Eb6", 104], [0, 1.5, 2, "F6", 114], [0, 3.5, 1.5, "D6", 108],
    [1, 1, 0.25, "B5", 96], [1, 1.25, 0.25, "D6", 98], [1, 1.5, 0.25, "C6", 104], [1, 1.75, 0.25, "Ab5", 92], [1, 2, 0.25, "F5", 92], [1, 2.25, 0.25, "Ab5", 90], [1, 2.5, 0.25, "G5", 92], [1, 2.75, 0.25, "F5", 88], [1, 3, 0.25, "Eb5", 90], [1, 3.25, 0.25, "D5", 88], [1, 3.5, 1.5, "C5", 98],
    [2, 1, 0.5, "G5", 92], [2, 1.5, 0.5, "Bb5", 96], [2, 2, 0.5, "C6", 98], [2, 2.5, 0.5, "Bb5", 92], [2, 3, 0.5, "C6", 98], [2, 3.5, 0.5, "D6", 104],
    [3, 0, 0.5, "Eb6", 110], [3, 0.5, 0.5, "D6", 100], [3, 1, 0.5, "B5", 98], [3, 1.5, 1.5, "C6", 110],
  ],
];
const shift = (rows, bar) => rows.map(([b, ...rest]) => [bar + b, ...rest]);

const flute = [...line(HEAD_MELODY)];
const coro = [];
const coroAt = (bar, voices, vel) => {
  for (const [b, beat, d, p, v] of shift(CORO, bar)) {
    const start = at(b, beat);
    const top = m(p);
    // An offbeat stroke just before a chord change takes the new chord.
    const c = chordAt(beat % 1 === 0.5 ? start + 0.5 : start);
    coro.push(note(start, d, top, v + vel));
    const under = tones(c, top - 11, top - 1).reverse();
    const second = under[0];
    if (voices >= 2) coro.push(note(start, d, second, v + vel - 10));
    if (voices >= 3) {
      const third = under.find((x) => x <= second - 3);
      if (third !== undefined) coro.push(note(start, d, third, v + vel - 14));
    }
  }
};

// --- tres (montuno cycles 3-4 and the mambo) ---
// Single notes in octave pairs, as the tres's doubled courses sound, on the beats the piano
// ties over (1 of each bar and 3 of the 3-side) plus a few it shares.
const TRES = [[0, 60], [1, 63], [5, 65], [8, 62], [9, 65], [12, 63], [13, 60]];
const tres = [];
const tresAt = (bar) => {
  for (const [pos, target] of TRES) {
    const start = at(bar, pos / 2);
    const p = nearest(chordAt(start), target, 55, 70);
    tres.push(note(start, 0.4, p, 80), note(start, 0.4, p + 12, 72));
  }
};

// --- mambo riffs (2 bars each, on the vamp) ---
// Trombones on the 2-side's beat 2 into a held "and" of 2, and on the 3-side's beat 2 into a
// held "and" of 2. Trumpets in the gaps: the "and" of 3 to the "and" of 4 in both bars, held
// over each barline. Saxes on the two strokes left open, the 2-side's beat 3 and the 3-side's
// 1, plus the 3-side's "and" of 1 and beat 3. Together they spell the clave and fill most 8ths.
const RIFF_TBN = [
  [0, 1, 0.25, ["Eb3", "G3"], 104], [0, 1.5, 1, ["F3", "Ab3"], 110],
  [1, 1, 0.25, ["G3", "B3"], 104], [1, 1.5, 1.5, ["Ab3", "C4"], 112],
];
const RIFF_TPT = [
  [0, 2.5, 0.4, ["F5", "Ab5"], 100], [0, 3, 0.4, ["Eb5", "G5"], 96], [0, 3.5, 0.9, ["D5", "F5"], 114],
  [1, 2.5, 0.4, ["F5", "Ab5"], 100], [1, 3, 0.4, ["Eb5", "G5"], 96], [1, 3.5, 0.9, ["Eb5", "G5"], 116],
];
const RIFF_SAX = [
  [0, 2, 0.45, ["Ab4", "C5"], 96],
  [1, 0, 0.45, ["G4", "B4"], 98], [1, 0.5, 0.45, ["B4", "D5"], 90], [1, 2, 0.95, ["Ab4", "C5"], 98],
];
const trumpets = [];
const trombones = [];
const saxes = [];
const riffAt = (out, riff, bar, { cutLast = false } = {}) => {
  riff.forEach(([b, beat, d, ps, v], i) => {
    if (cutLast && i === riff.length - 1) return;
    for (const [k, p] of ps.entries()) out.push(note(at(bar + b, beat), d, m(p), v - (k === 0 ? 8 : 0)));
  });
};

// --- percussion (GeneralUser GS standard kit, bank 128) ---
const P = { kick: 36, crash: 49, cowbell: 56, hiBongo: 60, loBongo: 61, muteConga: 62, openConga: 63, lowConga: 64, hiTimbale: 65, loTimbale: 66, shortGuiro: 73, longGuiro: 74, claves: 75 };
const clave = [];
const congas = [];
const bongos = [];
const campana = [];
const guiro = [];
const timbales = [];
const hit = (out, start, pitch, vel, dur = 0.2) => out.push(note(start, dur, pitch, vel));

const claveBar = (bar) => {
  const strokes = bar % 2 === 1 ? [1, 2] : [0, 1.5, 3];
  for (const s of strokes) hit(clave, at(bar, s), P.claves, 100);
};
// Conga tumbao: heel and tip on the muted drum, a slap on 2, open tones on 4 and the "and"
// of 4. With two drums, the open tones of the 3-side move to the low conga (tumba).
const congaBar = (bar, { twoDrums = false } = {}) => {
  hit(congas, at(bar, 0), P.muteConga, 60);
  hit(congas, at(bar, 0.5), P.muteConga, 48);
  hit(congas, at(bar, 1), P.muteConga, 100);
  hit(congas, at(bar, 1.5), P.muteConga, 50);
  hit(congas, at(bar, 2), P.muteConga, 58);
  hit(congas, at(bar, 2.5), P.muteConga, 48);
  const open = twoDrums && bar % 2 === 0 ? P.lowConga : P.openConga;
  hit(congas, at(bar, 3), open, 98);
  hit(congas, at(bar, 3.5), open, 94);
};
// Bongo martillo: steady 8ths on the macho, the index-finger beats louder than the thumb's
// offbeats, an open tone on 4, and the hembra on the "and" of 4.
const bongoBar = (bar) => {
  const vel = [92, 56, 76, 54, 80, 56, 100, 0];
  for (let i = 0; i < 7; i++) hit(bongos, at(bar, i / 2), P.hiBongo, vel[i]);
  hit(bongos, at(bar, 3.5), P.loBongo, 96);
};
// Campana (mambo bell): the mouth on every clave stroke, the neck around it.
const campanaBar = (bar, { vel = 0 } = {}) => {
  const strokes =
    bar % 2 === 1
      ? [[0, 70], [1, 104], [1.5, 68], [2, 104], [3, 72], [3.5, 66]]
      : [[0, 106], [0.5, 66], [1, 72], [1.5, 106], [2, 70], [3, 106]];
  for (const [s, v] of strokes) hit(campana, at(bar, s), P.cowbell, v + vel);
};
const guiroBar = (bar) => {
  hit(guiro, at(bar, 0), P.longGuiro, 72, 0.9);
  hit(guiro, at(bar, 1), P.shortGuiro, 60);
  hit(guiro, at(bar, 1.5), P.shortGuiro, 62);
  hit(guiro, at(bar, 2), P.longGuiro, 70, 0.9);
  hit(guiro, at(bar, 3), P.shortGuiro, 60);
  hit(guiro, at(bar, 3.5), P.shortGuiro, 62);
};
// Abanico-style fill on beat 4 into the next downbeat, with a crash on it.
const timbaleFill = (bar, { crash = true } = {}) => {
  [[3, P.hiTimbale, 86], [3.25, P.hiTimbale, 78], [3.5, P.loTimbale, 92], [3.75, P.hiTimbale, 104]].forEach(([s, p, v]) => hit(timbales, at(bar, s), p, v));
  if (crash) hit(timbales, at(bar + 1, 0), P.crash, 96, 2);
};

// --- arrangement ---

// Intro (1-10)
for (let bar = 1; bar <= 7; bar += 2) pianoGuajeo(bar);
for (let bar = 1; bar <= 10; bar++) claveBar(bar);
for (let bar = 5; bar <= 8; bar++) {
  tumbaoBar(bar);
  congaBar(bar);
  guiroBar(bar);
}
bass.push(note(at(4, 3), 1.45, m("Ab2"), 100)); // lead-in to the tumbao's first bar
bassLast = m("Ab2");
timbaleFill(8, { crash: false });

const tutti = (bar) => {
  const rows = figureAt(bar);
  for (const [b, beat, d, p, v] of rows) {
    const start = at(b, beat);
    const top = m(p);
    const c = chordAt(beat % 1 === 0.5 ? start + 0.5 : start);
    const under = tones(c, top - 11, top - 1).reverse();
    trumpets.push(note(start, d, top, v, { tight: true }), note(start, d, under[0], v - 10, { tight: true }));
    saxes.push(note(start, d, under[1] ?? under[0] - 3, v - 8, { tight: true }));
    trombones.push(note(start, d, top - 12, v - 4, { tight: true }), note(start, d, under[0] - 12, v - 12, { tight: true }));
    bass.push(note(start, d, top - 36, v, { tight: true }));
    piano.push(note(start, d, top - 12, v - 6, { tight: true }), note(start, d, top, v, { tight: true }));
  }
  for (const [b, beat] of [[bar, 3.5], [bar + 1, 1.5], [bar + 1, 3]]) {
    hit(congas, at(b, beat), P.muteConga, 112);
    hit(timbales, at(b, beat), P.hiTimbale, 108);
  }
};
tutti(9);

// Head (11-26): changes, piano guajeo, tumbao, conga, güiro. No bongo or bell yet.
pianoPickup(11);
for (let bar = 11; bar <= 25; bar += 2) pianoGuajeo(bar);
for (let bar = 11; bar <= 26; bar++) {
  claveBar(bar);
  tumbaoBar(bar);
  congaBar(bar);
  guiroBar(bar);
}
timbaleFill(18, { crash: false });
timbaleFill(26);

// Montuno (27-58): four cycles of coro 4 + sonero 4, each adding a layer.
for (let cycle = 0; cycle < 4; cycle++) {
  const start = 27 + cycle * 8;
  for (let bar = start; bar < start + 8; bar += 2) pianoGuajeo(bar, { vel: cycle >= 3 ? 6 : 0 });
  for (let bar = start; bar < start + 8; bar++) {
    claveBar(bar);
    tumbaoBar(bar, { busy: cycle >= 1 && bar % 2 === 0, pop: cycle >= 3 && bar % 2 === 1 });
    congaBar(bar, { twoDrums: cycle >= 1 });
    guiroBar(bar);
    bongoBar(bar);
    campanaBar(bar, { vel: cycle >= 3 ? 6 : 0 });
  }
  coroAt(start, cycle === 0 ? 2 : 3, cycle * 3);
  flute.push(...line(shift(INSPIRACIONES[cycle], start + 4)));
  if (cycle >= 2) for (let bar = start; bar < start + 8; bar += 2) tresAt(bar);
  if (cycle >= 3) {
    timbaleFill(start + 3, { crash: false });
    timbaleFill(start + 7);
  } else timbaleFill(start + 7, { crash: cycle === 1 });
}

// Mambo (59-74): trombones, + trumpets, + saxes, then all three.
for (let bar = 59; bar <= 73; bar += 2) {
  const last = bar === 73;
  pianoGuajeo(bar, { vel: 6 });
  tresAt(bar);
  riffAt(trombones, RIFF_TBN, bar);
  if (bar >= 63) riffAt(trumpets, RIFF_TPT, bar, { cutLast: last });
  if (bar >= 67) riffAt(saxes, RIFF_SAX, bar);
}
for (let bar = 59; bar <= 74; bar++) {
  claveBar(bar);
  tumbaoBar(bar, { busy: bar % 2 === 0, pop: bar % 2 === 1 });
  congaBar(bar, { twoDrums: true });
  guiroBar(bar);
  bongoBar(bar);
  campanaBar(bar, { vel: 8 });
}
timbaleFill(62);
timbaleFill(66);
timbaleFill(70);
timbaleFill(74, { crash: false });

// Cierre (75-78): the intro figure, then the band hits the clave strokes and stops on the last.
claveBar(75);
claveBar(76);
tutti(75);
const CM = ["C4", "Eb4", "G4", "Bb4"];
const CM69 = ["C4", "Eb4", "G4", "A4", "D5"];
const cierreHits = [
  [at(77, 1), 0.4, CM, 104],
  [at(77, 2), 0.4, CM, 106],
  [at(78, 0), 0.4, CM, 108],
  [at(78, 1.5), 0.4, CM, 112],
  [at(78, 3), 3, CM69, 118],
];
for (const [start, d, chord, v] of cierreHits) {
  const ps = chord.map(m);
  for (const p of ps) piano.push(note(start, d, p, v - 12, { tight: true }), note(start, d, p + 12, v - 8, { tight: true }));
  trumpets.push(note(start, d, ps[ps.length - 1] + 12, v, { tight: true }), note(start, d, ps[ps.length - 2] + 12, v - 8, { tight: true }));
  saxes.push(note(start, d, ps[2], v - 8, { tight: true }), note(start, d, ps[1] + 12, v - 8, { tight: true }));
  trombones.push(note(start, d, ps[0], v - 4, { tight: true }), note(start, d, ps[2] - 12, v - 8, { tight: true }));
  coro.push(...ps.slice(1, 4).map((p) => note(start, d, p + 12, v - 16, { tight: true })));
  bass.push(note(start, d, m("C2"), v, { tight: true }));
  hit(congas, start, P.openConga, v);
  hit(timbales, start, P.hiTimbale, v);
  hit(campana, start, P.cowbell, v - 6);
  hit(clave, start, P.claves, 100);
}
hit(timbales, at(78, 3), P.crash, 120, 3);
hit(timbales, at(78, 3), P.loTimbale, 118);
hit(bongos, at(78, 3), P.loBongo, 110);

// --- project ---
const END = at(80, 0);
const clip = (notes) => notes.filter((n) => n.start < END).sort((a, b) => a.start - b.start || a.pitch - b.pitch);
const track = (name, program, gain, pan, notes, extra = {}) => ({ name, program, gain, pan, muted: false, soloed: false, ...extra, notes: clip(notes) });
const drum = (name, gain, pan, notes) => track(name, 0, gain, pan, notes, { bank: 128 });

const project = {
  title: "Bombo y Ponche",
  comment:
    "Salsa in the son montuno tradition, C minor, 184 BPM, on a 2-3 son clave (odd bars are the 2-side). Intro on Abmaj7 | G7, a flute head through a minor circle of fifths, a montuno on Cm Fm | G7 Fm where coro and sonero trade and each cycle adds a layer, a mambo of trombone, trumpet, and sax riffs entering one at a time, and a cierre that stops on the last clave stroke.",
  tempo: 184,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { enabled: false },
  locators: [
    [1, "1 Intro"],
    [9, "9 Tutti figure"],
    [11, "11 Head"],
    [27, "27 Montuno: coro and sonero"],
    [43, "43 Montuno: + tres"],
    [59, "59 Mambo: trombones"],
    [63, "63 Mambo: + trumpets"],
    [67, "67 Mambo: + saxes"],
    [75, "75 Cierre"],
  ].map(([bar, label]) => ({ beat: at(bar, 0), label })),
  midiTracks: [
    track("Sonero (flute)", 73, 0.95, 0, flute),
    track("Coro", 52, 0.75, 0.15, coro),
    track("Trumpets", 56, 0.62, -0.2, trumpets),
    track("Trombones", 57, 0.72, 0.25, trombones),
    track("Saxes", 65, 0.6, -0.4, saxes),
    track("Piano montuno", 0, 0.62, -0.25, piano),
    track("Tres", 25, 0.55, 0.4, tres),
    track("Bass (tumbao)", 32, 1, 0, bass),
    drum("Clave", 0.45, 0.5, clave),
    drum("Congas", 0.7, 0.3, congas),
    drum("Bongos", 0.6, -0.3, bongos),
    drum("Campana", 0.42, 0.15, campana),
    drum("Güiro", 0.45, -0.45, guiro),
    drum("Timbales", 0.6, 0.2, timbales),
  ],
};

fs.writeFileSync(outFile, JSON.stringify(project, null, 1) + "\n");
console.log(`${outFile}: ${project.midiTracks.map((t) => `${t.name} ${t.notes.length}`).join(", ")}`);
