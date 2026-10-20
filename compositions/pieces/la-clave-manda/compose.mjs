// Writes project.json for "La Clave Manda", a son montuno salsa in D minor.
// Run: node compose.mjs
//
// The piece is in 4/4 at 190 quarter notes per minute, felt in two, so one
// 2-3 son clave cycle spans two bars. Even bars (0, 2, 4, ...) are the 2 side,
// with clave on beats 2 and 3; odd bars are the 3 side, with clave on 1, the
// "and" of 2, and 4. Every section has an even number of bars, so the clave
// never turns around.

import { writeFileSync } from "node:fs";

const BAR = 4;
const TEMPO = 190;

// --- harmony ----------------------------------------------------------------

const PC = { C: 0, "C#": 1, D: 2, Eb: 3, E: 4, F: 5, "F#": 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11 };
const chord = (root, intervals) => ({
  root: PC[root],
  tones: intervals.map((i) => (PC[root] + i) % 12),
});
const C = {
  Dm: chord("D", [0, 3, 7]),
  Dm7: chord("D", [0, 3, 7, 10]),
  Dm69: chord("D", [0, 3, 7, 9, 14]),
  Gm: chord("G", [0, 3, 7]),
  Gm7: chord("G", [0, 3, 7, 10]),
  A7: chord("A", [0, 4, 7, 10]),
  A7b9: chord("A", [0, 4, 7, 10, 13]),
  C7: chord("C", [0, 4, 7, 10]),
  Fmaj7: chord("F", [0, 4, 7, 11]),
  Bbmaj7: chord("Bb", [0, 4, 7, 11]),
  Em7b5: chord("E", [0, 3, 6, 10]),
};

// Section layout in bars.
const S = {
  intro: 0,
  head: 8,
  puente: 24,
  montuno: 28,
  mambo: 44,
  coro: 60,
  cierre: 68,
  end: 72,
};

// The vamp: Dm | Gm on the 2 side, A7 | Gm on the 3 side, two beats each.
const VAMP = [C.Dm, C.Gm, C.A7, C.Gm];

// The head: one chord per bar, except bar 15 splits Em7b5 | A7.
const HEAD = [
  [C.Dm7], [C.Dm7], [C.Gm7], [C.C7], [C.Fmaj7], [C.Bbmaj7], [C.Em7b5], [C.A7],
  [C.Dm7], [C.Dm7], [C.Gm7], [C.C7], [C.Fmaj7], [C.Bbmaj7], [C.Em7b5, C.A7], [C.Dm7],
];

function chordAt(beat) {
  const bar = Math.floor(beat / BAR);
  const inBar = beat - bar * BAR;
  if (bar >= S.head && bar < S.puente) {
    const chords = HEAD[bar - S.head];
    return chords[chords.length === 1 ? 0 : inBar < 2 ? 0 : 1];
  }
  const cycleBeat = (beat - S.intro * BAR) % (2 * BAR);
  return VAMP[Math.floor(cycleBeat / 2)];
}

// An offbeat attack belongs to the chord it anticipates half a beat later,
// which is how the guajeo and the horns push the harmony.
const pushedChordAt = (beat) => chordAt(beat % 1 === 0.5 ? beat + 0.5 : beat);

const isTone = (pitch, ch) => ch.tones.includes(((pitch % 12) + 12) % 12);
function nearestTone(target, ch, { below = Infinity, above = -Infinity } = {}) {
  let best;
  for (let d = 0; d < 12; d++) {
    for (const p of [target + d, target - d]) {
      if (p < below && p > above && isTone(p, ch)) {
        best ??= p;
      }
    }
    if (best !== undefined) return best;
  }
  return target;
}
// Chord tones strictly between `low` and `high`, descending.
function tonesBetween(low, high, ch) {
  const out = [];
  for (let p = high - 1; p > low; p--) if (isTone(p, ch)) out.push(p);
  return out;
}

// --- note helpers -----------------------------------------------------------

const NOTE = (name) => {
  const m = /^([A-G](?:#|b)?)(-?\d)$/.exec(name);
  return PC[m[1]] + 12 * (Number(m[2]) + 1);
};

// Deterministic velocity humanizing.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const vel = (v, spread = 6) =>
  Math.max(1, Math.min(127, Math.round(v + (rand() * 2 - 1) * spread)));

function track(name, program, opts = {}) {
  return { name, program, notes: [], ...opts };
}
function add(t, pitch, start, duration, velocity) {
  t.notes.push({ pitch, start, duration, velocity: vel(velocity) });
}
// Notes written as [beatInBar, "A4", duration] inside a bar.
function phrase(t, bar, notes, velocity, legato = 0.92) {
  for (const [b, n, d] of notes) {
    add(t, NOTE(n), bar * BAR + b, d * legato, velocity + (b % 1 === 0.5 ? 4 : 0));
  }
}

// --- tracks -----------------------------------------------------------------

const DRUMS = { bank: 128 };
const lead = track("Lead (sonero)", 65, { gain: 0.95, pan: 0 });
const coro = track("Coro", 52, { gain: 0.8, pan: 0.1 });
const piano = track("Piano montuno", 0, { gain: 0.75, pan: -0.25 });
const bass = track("Bass tumbao", 32, { gain: 0.95, pan: 0 });
const trumpets = track("Trumpets", 56, { gain: 0.7, pan: 0.35 });
const trombones = track("Trombones", 57, { gain: 0.75, pan: -0.35 });
const bari = track("Baritone sax", 67, { gain: 0.6, pan: 0.15 });
const clave = track("Clave", 0, { ...DRUMS, gain: 0.55, pan: 0.45 });
const congas = track("Congas", 0, { ...DRUMS, gain: 0.7, pan: 0.3 });
const bongos = track("Bongos", 0, { ...DRUMS, gain: 0.6, pan: -0.4 });
const cowbell = track("Cowbell", 0, { ...DRUMS, gain: 0.45, pan: 0.2 });
const guiro = track("Guiro", 0, { ...DRUMS, gain: 0.45, pan: -0.5 });
const timbales = track("Timbales", 0, { ...DRUMS, gain: 0.6, pan: 0.05 });

// GM percussion keys.
const K = {
  claves: 75, hiBongo: 60, loBongo: 61, muteConga: 62, openConga: 63, lowConga: 64,
  hiTimbale: 65, loTimbale: 66, cowbell: 56, shortGuiro: 73, longGuiro: 74, crash: 49,
};

const is2Side = (bar) => bar % 2 === 0;
const CLAVE_2 = [1, 2];
const CLAVE_3 = [0, 1.5, 3];
const claveHits = (bar) => (is2Side(bar) ? CLAVE_2 : CLAVE_3);

// --- percussion ---------------------------------------------------------------

function playClave(from, to) {
  for (let bar = from; bar < to; bar++) {
    for (const b of claveHits(bar)) add(clave, K.claves, bar * BAR + b, 0.25, 92);
  }
}

// Conga tumbao: heel-toe in eighths, slap on 2, open tones on 4 and 4&.
// On the 3 side the and-of-4 drops to the low drum.
function playCongas(from, to, { fills = false } = {}) {
  for (let bar = from; bar < to; bar++) {
    const t = bar * BAR;
    add(congas, K.muteConga, t + 0, 0.25, 50);
    add(congas, K.muteConga, t + 0.5, 0.25, 40);
    add(congas, K.muteConga, t + 1, 0.25, 98);
    add(congas, K.muteConga, t + 1.5, 0.25, 42);
    add(congas, K.muteConga, t + 2, 0.25, 50);
    add(congas, K.muteConga, t + 2.5, 0.25, 40);
    add(congas, K.openConga, t + 3, 0.4, 100);
    add(congas, is2Side(bar) ? K.openConga : K.lowConga, t + 3.5, 0.4, 96);
    if (fills && !is2Side(bar) && (bar - from) % 4 === 3) {
      add(congas, K.lowConga, t + 2.5, 0.3, 80);
    }
  }
}

// Bongo martillo: eight strokes a bar, open on 1 and 3, slap on 2, the low
// bongo on 4.
function playMartillo(from, to) {
  for (let bar = from; bar < to; bar++) {
    const t = bar * BAR;
    const strokes = [
      [0, K.hiBongo, 92], [0.5, K.hiBongo, 50], [1, K.hiBongo, 80], [1.5, K.hiBongo, 50],
      [2, K.hiBongo, 90], [2.5, K.hiBongo, 50], [3, K.loBongo, 98], [3.5, K.hiBongo, 58],
    ];
    for (const [b, k, v] of strokes) add(bongos, k, t + b, 0.25, v);
  }
}

// Bongo bell: quarters with the mouth on 1 and 3; the 3 side adds the
// and-of-2 so the bell sits on the clave's bombo.
function playCowbell(from, to) {
  for (let bar = from; bar < to; bar++) {
    const t = bar * BAR;
    add(cowbell, K.cowbell, t + 0, 0.25, 108);
    add(cowbell, K.cowbell, t + 1, 0.25, 72);
    if (!is2Side(bar)) add(cowbell, K.cowbell, t + 1.5, 0.25, 80);
    add(cowbell, K.cowbell, t + 2, 0.25, 104);
    add(cowbell, K.cowbell, t + 3, 0.25, 72);
  }
}

// Guiro: long-short-short each half bar.
function playGuiro(from, to) {
  for (let bar = from; bar < to; bar++) {
    for (const half of [0, 2]) {
      const t = bar * BAR + half;
      add(guiro, K.longGuiro, t, 0.5, 70);
      add(guiro, K.shortGuiro, t + 1, 0.25, 58);
      add(guiro, K.shortGuiro, t + 1.5, 0.25, 62);
    }
  }
}

// A one-bar timbale fill into the next section, landing with a crash.
function timbaleFill(bar, { crash = true } = {}) {
  const t = bar * BAR;
  const pattern = [
    [1, K.hiTimbale], [1.5, K.hiTimbale], [2, K.loTimbale], [2.25, K.hiTimbale],
    [2.5, K.hiTimbale], [2.75, K.loTimbale], [3, K.loTimbale], [3.5, K.hiTimbale],
  ];
  pattern.forEach(([b, k], i) => add(timbales, k, t + b, 0.25, 72 + i * 5));
  if (crash) add(timbales, K.crash, t + BAR, 2, 104);
}

// --- bass ---------------------------------------------------------------------

// Tumbao: the and-of-2 anticipates the chord on beat 3, and beat 4 takes
// the root of the next bar's chord, held across the barline. The downbeat is
// left to the previous bar's held note.
let lastBass = NOTE("D2");
function bassNote(pc, center = lastBass) {
  let best;
  for (let p = NOTE("F1"); p <= NOTE("A2"); p++) {
    if (p % 12 === pc && (best === undefined || Math.abs(p - center) < Math.abs(best - center))) best = p;
  }
  return (lastBass = best);
}
function playTumbao(from, to, { fifthOn2Side = false } = {}) {
  for (let bar = from; bar < to; bar++) {
    const t = bar * BAR;
    const ch3 = chordAt(t + 2);
    // Over one chord per bar, the root on the and-of-2 would repeat the held
    // anticipation, so the line moves to the fifth instead.
    const repeats = ch3.root === lastBass % 12;
    const pcA = (fifthOn2Side && is2Side(bar)) || repeats ? ch3.tones[2] : ch3.root;
    add(bass, bassNote(pcA), t + 1.5, 1.35, 100);
    const next = chordAt(t + BAR);
    add(bass, bassNote(next.root), t + 3, bar + 1 < to ? 2.4 : 0.9, 108);
  }
}

// --- piano guajeo -------------------------------------------------------------

// The guajeo's shape over two bars. The 2 side is on the beat (2, 3, 4) with
// pushes on the and-of-2 and the and-of-4; the 3 side is all offbeats, so the
// right hand answers the clave's bombo. Each slot names a target top note that
// snaps to the nearest tone of the chord it anticipates. On the vamp the
// targets are the line itself: A D D Bb D C# | E D Bb A.
const GUAJEO_2 = [[0, 69], [1, 74], [1.5, 74], [2, 70], [3, 74], [3.5, 73]];
const GUAJEO_3 = [[0.5, 76], [1.5, 74], [2.5, 70], [3.5, 69]];

function guajeoBar(bar, { firstBar = false, highOctave = false, velocity = 78 } = {}) {
  const slots = is2Side(bar) ? GUAJEO_2 : GUAJEO_3;
  slots.forEach(([b, target], i) => {
    // Beat 1 of the 2 side is tied over from the and-of-4, unless the guajeo
    // starts there.
    if (b === 0 && !firstBar) return;
    const start = bar * BAR + b;
    const ch = pushedChordAt(start);
    const top = nearestTone(target, ch);
    const next = slots[i + 1]?.[0] ?? BAR + (is2Side(bar) ? 0.5 : 1);
    const dur = Math.min(next - b, 1) * 0.85;
    const inner = tonesBetween(top - 12, top, ch);
    const mid = inner.reduce((a, p) => (Math.abs(p - (top - 5)) < Math.abs(a - (top - 5)) ? p : a), inner[0]);
    const v = velocity + (b % 1 === 0.5 ? 8 : 0);
    add(piano, top, start, dur, v);
    add(piano, top - 12, start, dur, v - 6);
    if (mid !== undefined) add(piano, mid, start, dur, v - 14);
    if (highOctave) add(piano, top + 12, start, dur, v - 12);
  });
}
function playGuajeo(from, to, opts = {}) {
  for (let bar = from; bar < to; bar++) guajeoBar(bar, { ...opts, firstBar: bar === from && opts.firstBar });
}

// --- hits (puente and cierre) -------------------------------------------------

// A stacked hit under a given top note: two trumpets and two trombones on
// descending chord tones, the bari and bass on the root, piano in octaves.
function tutti(beat, ch, top, dur, velocity, { bassToo = true } = {}) {
  const below = tonesBetween(top - 13, top, ch);
  add(trumpets, top, beat, dur, velocity);
  add(trumpets, below[0], beat, dur, velocity - 6);
  const tb1 = below[1] - 12;
  const tb2 = tonesBetween(tb1 - 9, tb1, ch)[0];
  add(trombones, tb1, beat, dur, velocity);
  add(trombones, tb2, beat, dur, velocity - 6);
  let root = 36 + ch.root;
  if (root < NOTE("A2")) root += 12;
  add(bari, root, beat, dur, velocity - 10);
  add(piano, top, beat, dur, velocity - 10);
  add(piano, top - 12, beat, dur, velocity - 16);
  add(piano, below[0] - 12, beat, dur, velocity - 22);
  if (bassToo) add(bass, bassNote(ch.root, NOTE("D2")), beat, dur, velocity);
}

// --- sections -----------------------------------------------------------------

// Intro (bars 0-7). Piano alone with clave, then bass, congas and guiro, then
// the horns' intro figure twice; bar 7 breaks on the 3 side into the head.
playClave(S.intro, S.end);
playGuajeo(0, 7, { firstBar: true });
playTumbao(2, 7);
playCongas(2, 7);
playGuiro(2, 7);

const INTRO_FIGURE = [
  // 2 side: a run up to the downbeat-of-3 accent, then a push into A7.
  [0, [[1, "D5", 0.5], [1.5, "F5", 0.5], [2, "Bb5", 0.5], [3, "G5", 0.5], [3.5, "E5", 1]]],
  // 3 side: offbeats settling on the anticipated Dm.
  [1, [[0.5, "C#5", 0.5], [1.5, "D5", 1], [2.5, "Bb4", 0.5], [3.5, "A4", 1]]],
];
function introFigure(bar, last) {
  for (const [offset, notes] of INTRO_FIGURE) {
    for (const [b, n, d] of notes) {
      if (last && offset === 1) continue;
      const start = (bar + offset) * BAR + b;
      const ch = pushedChordAt(start);
      const top = NOTE(n);
      const second = tonesBetween(top - 10, top, ch)[0] ?? top - 3;
      add(trumpets, top, start, d * 0.85, 96);
      add(trumpets, second, start, d * 0.85, 88);
      const tb = nearestTone(top - 15, ch, { below: top - 12 });
      add(trombones, tb, start, d * 0.85, 92);
      add(trombones, nearestTone(tb - 4, ch, { below: tb }), start, d * 0.85, 86);
    }
  }
}
introFigure(4, false);
introFigure(6, true);
// Bar 7: the band breaks on the 3 side of the clave, pushing into the head.
tutti(7 * BAR + 0, C.A7, NOTE("E5"), 0.4, 100);
tutti(7 * BAR + 1.5, C.Gm, NOTE("D5"), 0.4, 100);
tutti(7 * BAR + 3, C.Dm, NOTE("D5"), 0.9, 108, { bassToo: false });
add(bass, NOTE("D2"), 7 * BAR + 3, 2.4, 108);
timbaleFill(7);

// Head (bars 8-23): the lead sings over the changes; piano and bass follow
// them. Two eight-bar halves, the second rising higher before the cadence.
const HEAD_MELODY = [
  [[1, "A4", 1], [2, "D5", 1], [3, "C5", 0.5], [3.5, "D5", 1.5]],
  [[1.5, "F5", 1.5], [3, "E5", 0.5], [3.5, "D5", 1.5]],
  [[1, "D5", 0.5], [1.5, "C5", 0.5], [2, "Bb4", 1], [3, "A4", 0.5], [3.5, "G4", 1.5]],
  [[1.5, "Bb4", 1], [2.5, "G4", 0.5], [3, "E4", 0.5], [3.5, "F4", 1.5]],
  [[1, "A4", 0.5], [1.5, "C5", 0.5], [2, "E5", 1.5], [3.5, "D5", 1.5]],
  [[1.5, "C5", 1], [2.5, "Bb4", 0.5], [3, "A4", 1]],
  [[0, "G4", 1], [1, "Bb4", 1], [2, "D5", 1.5], [3.5, "C#5", 2]],
  [[1.5, "E5", 0.5], [2, "C#5", 0.5], [2.5, "Bb4", 0.5], [3, "A4", 1]],
  [[1, "A4", 1], [2, "D5", 1], [3, "C5", 0.5], [3.5, "D5", 1.5]],
  [[1.5, "F5", 1.5], [3, "G5", 0.5], [3.5, "A5", 1.5]],
  [[1, "G5", 0.5], [1.5, "F5", 0.5], [2, "D5", 1], [3, "Bb4", 0.5], [3.5, "D5", 1.5]],
  [[1.5, "E5", 1], [2.5, "D5", 0.5], [3, "C5", 0.5], [3.5, "A4", 1.5]],
  [[1, "C5", 0.5], [1.5, "E5", 0.5], [2, "G5", 1], [3, "F5", 0.5], [3.5, "D5", 1.5]],
  [[1.5, "C5", 0.5], [2, "D5", 0.5], [2.5, "Bb4", 0.5], [3, "A4", 1]],
  [[0, "G4", 1], [1, "Bb4", 1], [2, "C#5", 1], [3, "E5", 0.5], [3.5, "D5", 3]],
  [],
];
HEAD_MELODY.forEach((notes, i) => phrase(lead, S.head + i, notes, 92));
playGuajeo(S.head, S.puente);
playTumbao(S.head, S.puente);
playCongas(S.head, S.puente);
playGuiro(S.head, S.puente);
// Second half: soft trombone guide tones (3rd and 7th) under the lead.
for (let bar = S.head + 8; bar < S.puente - 1; bar++) {
  const chords = HEAD[bar - S.head];
  chords.forEach((ch, i) => {
    const start = bar * BAR + i * (BAR / chords.length);
    const len = BAR / chords.length - 0.1;
    const third = nearestTone(NOTE("A3"), { tones: [(ch.root + (ch.tones.includes((ch.root + 4) % 12) ? 4 : 3)) % 12] });
    const seventh = ch.tones[3] ?? ch.tones[2];
    add(trombones, third, start, len, 54);
    add(trombones, nearestTone(third - 4, { tones: [seventh] }, { below: third }), start, len, 50);
  });
}
timbaleFill(S.puente - 1, { crash: false });

// Puente (bars 24-27): the band plays the clave as block hits on the vamp,
// twice, and the bongo and bell take over at the montuno.
for (const bar of [S.puente, S.puente + 2]) {
  const second = bar === S.puente + 2;
  tutti(bar * BAR + 1, C.Dm, NOTE("F5"), 0.4, 100);
  tutti(bar * BAR + 2, C.Gm, NOTE(second ? "G5" : "D5"), 0.4, 104);
  tutti((bar + 1) * BAR + 0, C.A7, NOTE(second ? "G5" : "E5"), 0.4, 100);
  tutti((bar + 1) * BAR + 1.5, C.Gm, NOTE(second ? "Bb5" : "D5"), 0.4, 106);
  tutti((bar + 1) * BAR + 3, second ? C.A7 : C.Dm, NOTE(second ? "A5" : "F5"), second ? 0.9 : 0.4, 110, { bassToo: false });
  add(bass, NOTE(second ? "A1" : "D2"), (bar + 1) * BAR + 3, second ? 0.9 : 0.5, 108);
}
playCongas(S.puente, S.montuno);
timbaleFill(S.montuno - 1);

// Montuno (bars 28-43): coro answers the lead on the vamp. Four four-bar
// cycles, each adding a layer: bongo and bell from the start, coro harmony in
// cycle 2, the piano's top octave in cycle 3, conga and bass variations in
// cycle 4.
const CORO = [
  // [beat from cycle start, top, mid, low, duration]
  [1, "A4", "F4", "D4", 0.5],
  [1.5, "A4", "F4", "D4", 0.5],
  [2, "D5", "Bb4", "G4", 1],
  [3, "D5", "Bb4", "G4", 0.5],
  [3.5, "C#5", "A4", "E4", 1.5],
  [5.5, "D5", "Bb4", "G4", 1],
  [6.5, "Bb4", "G4", "D4", 0.5],
  [7, "A4", "F4", "D4", 0.75],
];
function playCoro(bar, voices, velocity = 88) {
  for (const [b, top, mid, low, d] of CORO) {
    const notes = [top, low, mid].slice(0, voices);
    notes.forEach((n, i) => add(coro, NOTE(n), bar * BAR + b, d * 0.95, velocity - i * 6));
  }
}
const PREGONES = [
  [[[1, "F5", 0.5], [1.5, "E5", 0.5], [2, "D5", 0.5], [2.5, "Bb4", 0.5], [3, "D5", 0.5], [3.5, "E5", 1]],
    [[1.5, "D5", 1], [2.5, "Bb4", 0.5], [3, "A4", 0.5]]],
  [[[0.5, "A4", 0.5], [1, "D5", 0.5], [1.5, "F5", 1], [2.5, "E5", 0.5], [3, "D5", 0.5], [3.5, "C#5", 1]],
    [[1, "E5", 0.5], [1.5, "G5", 1], [2.5, "F5", 0.5], [3, "E5", 0.5], [3.5, "D5", 0.5]]],
  [[[0.5, "D5", 0.5], [1, "F5", 0.5], [1.5, "A5", 1], [2.5, "G5", 0.5], [3, "F5", 0.5], [3.5, "E5", 1]],
    [[1.5, "G5", 1], [2.5, "F5", 0.5], [3, "E5", 0.5], [3.5, "D5", 0.5]]],
  [[[1, "A5", 0.5], [1.5, "A5", 0.5], [2, "G5", 0.5], [2.5, "A5", 0.5], [3, "G5", 0.5], [3.5, "A5", 1.5]],
    [[1.5, "F5", 0.5], [2, "E5", 0.5], [2.5, "D5", 0.5], [3, "C#5", 0.5], [3.5, "D5", 0.5]]],
  [[[0.5, "A4", 0.5], [1, "D5", 0.5], [1.5, "D5", 0.5], [2, "D5", 0.5], [2.5, "F5", 0.5], [3, "G5", 0.5], [3.5, "A5", 1]],
    [[1.5, "G5", 0.5], [2, "F5", 0.5], [2.5, "G5", 0.5], [3, "F5", 0.5], [3.5, "D5", 0.5]]],
  [[[1, "F5", 1], [2, "G5", 0.5], [2.5, "F5", 0.5], [3, "D5", 0.5], [3.5, "E5", 1]],
    [[1.5, "D5", 1.5]]],
];
function pregon(bar, i, velocity = 96) {
  const [a, b] = PREGONES[i];
  phrase(lead, bar, a, velocity);
  phrase(lead, bar + 1, b, velocity);
}

for (let c = 0; c < 4; c++) {
  const bar = S.montuno + c * 4;
  playCoro(bar, c === 0 ? 1 : 3, 84 + c * 2);
  pregon(bar + 2, c, 92 + c * 2);
  playGuajeo(bar, bar + 4, { highOctave: c >= 2, velocity: 78 + c });
}
playTumbao(S.montuno, S.montuno + 12);
playTumbao(S.montuno + 12, S.mambo, { fifthOn2Side: true });
playCongas(S.montuno, S.montuno + 12);
playCongas(S.montuno + 12, S.mambo, { fills: true });
playMartillo(S.montuno, S.mambo);
playCowbell(S.montuno, S.mambo);
playGuiro(S.montuno, S.mambo);
timbaleFill(S.mambo - 1);

// Mambo (bars 44-59): three interlocking horn riffs on the vamp, entering one
// at a time every four bars. The trombones own the 2 side, the trumpets answer
// on the 3 side, and the bari punches the clave underneath; the last four bars
// stack all three.
const TROMBONE_RIFF = [
  [0, [[0.5, "A3", "F3"], [1, "D4", "A3"], [1.5, "F4", "D4"], [2, "D4", "Bb3"], [2.5, "Bb3", "G3"],
    [3, "D4", "Bb3"], [3.5, "C#4", "A3", 1]]],
  [1, [[3, "Bb3", "G3"], [3.5, "A3", "F3"]]],
];
const TRUMPET_RIFF = [
  [1, [[0.5, "A5", "E5"], [1, "G5", "E5"], [1.5, "Bb5", "G5", 1], [2.5, "A5", "F5"], [3, "G5", "D5"]]],
];
const BARI_RIFF = [
  [0, [[1, "D3", 0.4], [2, "G2", 0.4], [3.5, "A2", 0.4]]],
  [1, [[1.5, "G2", 0.4], [3, "D3", 0.9]]],
];
function playRiff(t, riff, bar, velocity) {
  for (const [offset, notes] of riff) {
    for (const [b, top, second, d = 0.5] of notes) {
      const start = (bar + offset) * BAR + b;
      add(t, NOTE(top), start, d * 0.8, velocity + (b % 1 === 0.5 ? 6 : 0));
      add(t, NOTE(second), start, d * 0.8, velocity - 6);
    }
  }
}
function playBari(bar, velocity) {
  for (const [offset, notes] of BARI_RIFF) {
    for (const [b, n, d] of notes) add(bari, NOTE(n), (bar + offset) * BAR + b, d, velocity);
  }
}
for (let bar = S.mambo; bar < S.coro; bar += 2) {
  const step = bar - S.mambo;
  playRiff(trombones, TROMBONE_RIFF, bar, 98);
  if (step >= 4) playRiff(trumpets, TRUMPET_RIFF, bar, 100);
  if (step >= 8) playBari(bar, 96);
}
playGuajeo(S.mambo, S.coro, { highOctave: true, velocity: 76 });
playTumbao(S.mambo, S.coro, { fifthOn2Side: true });
playCongas(S.mambo, S.coro, { fills: true });
playMartillo(S.mambo, S.coro);
playCowbell(S.mambo, S.coro);
playGuiro(S.mambo, S.coro);
timbaleFill(S.coro - 1);

// Coro return (bars 60-67): two more cycles with the bari still punching the
// clave, the lead at its most open.
for (let c = 0; c < 2; c++) {
  const bar = S.coro + c * 4;
  playCoro(bar, 3, 92);
  pregon(bar + 2, 4 + c, 98 - c * 4);
  playBari(bar, 82);
  playBari(bar + 2, 82);
}
playGuajeo(S.coro, S.cierre, { highOctave: true, velocity: 78 });
playTumbao(S.coro, S.cierre);
playCongas(S.coro, S.cierre, { fills: true });
playMartillo(S.coro, S.cierre);
playCowbell(S.coro, S.cierre);
playGuiro(S.coro, S.cierre);
timbaleFill(S.cierre - 1, { crash: false });

// Cierre (bars 68-71): the whole band plays the clave itself, twice, the second
// time climbing to a final Dm6/9 on the 3 side's beat 4.
const CIERRE = [
  [1, C.Gm7, "F5"], [2, C.A7, "E5"], [4, C.Bbmaj7, "D5"], [5.5, C.A7, "C#5"], [7, C.Dm, "D5"],
  [9, C.Gm7, "G5"], [10, C.A7b9, "Bb5"], [12, C.Bbmaj7, "A5"], [13.5, C.A7, "G5"],
];
for (const [b, ch, top] of CIERRE) {
  const start = S.cierre * BAR + b;
  tutti(start, ch, NOTE(top), 0.4, 104 + (b % 1 === 0.5 ? 6 : 0));
  add(timbales, b % 1 === 0.5 ? K.hiTimbale : K.loTimbale, start, 0.25, 96);
}
// The final hit: Dm6/9 voiced D F B E A from the bass up through the horns.
const final = S.cierre * BAR + 15;
for (const [t, n, v] of [
  [trumpets, "A5", 112], [trumpets, "E5", 104], [trombones, "B3", 106], [trombones, "F3", 100],
  [bari, "D3", 100], [bass, "D2", 112], [piano, "A5", 96], [piano, "E5", 90], [piano, "B4", 86],
  [piano, "F4", 84], [piano, "D4", 84], [piano, "D3", 90],
]) {
  add(t, NOTE(n), final, 1.5, v);
}
add(timbales, K.loTimbale, final, 0.25, 110);
add(timbales, K.hiTimbale, final, 0.25, 104);
add(timbales, K.crash, final, 3, 112);

// --- project ------------------------------------------------------------------

const tracks = [
  lead, coro, trumpets, trombones, bari, piano, bass,
  clave, congas, bongos, cowbell, guiro, timbales,
];
for (const t of tracks) t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);

const project = {
  title: "La Clave Manda",
  comment:
    "Son montuno salsa in D minor on a 2-3 son clave. Intro, sung-style head over changes, " +
    "montuno with coro and pregón on a Dm-Gm-A7-Gm vamp, mambo of layered horn riffs, coro return, cierre.",
  tempo: TEMPO,
  timeSignature: { numerator: 4, denominator: 4 },
  locators: [
    { beat: S.intro * BAR, label: "Intro" },
    { beat: S.head * BAR, label: "Head" },
    { beat: S.puente * BAR, label: "Puente" },
    { beat: S.montuno * BAR, label: "Montuno" },
    { beat: S.mambo * BAR, label: "Mambo" },
    { beat: S.coro * BAR, label: "Coro" },
    { beat: S.cierre * BAR, label: "Cierre" },
  ],
  midiTracks: tracks,
};

writeFileSync(new URL("project.json", import.meta.url), JSON.stringify(project, null, 1) + "\n");
const count = tracks.reduce((n, t) => n + t.notes.length, 0);
console.log(`wrote project.json: ${tracks.length} tracks, ${count} notes, ${S.end} bars`);
