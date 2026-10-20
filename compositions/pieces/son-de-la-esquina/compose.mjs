// Writes project.json, a Toy MIDI SharedProject, next to this script.
// Run with `node compose.mjs`.
import { writeFileSync } from "node:fs";

const TEMPO = 190;

// Deterministic humanization, so reruns produce the same file.
let seed = 18181;
function rand() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const vel = (v, amount = 5) => clamp(Math.round(v + (rand() * 2 - 1) * amount), 1, 127);

// ---------------------------------------------------------------------------
// Harmony

const PC = { C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, G: 7, A: 9, Bb: 10, B: 11 };
const QUALITY = {
  m7: [0, 3, 7, 10],
  7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7b5: [0, 3, 6, 10],
  m69: [0, 3, 7, 9, 2],
};
const chordCache = new Map();
function chord(name) {
  if (!chordCache.has(name)) {
    const [, root, quality] = name.match(/^([A-G]b?)(.*)$/);
    const intervals = QUALITY[quality];
    chordCache.set(name, {
      name,
      root: PC[root],
      intervals,
      tones: intervals.map((i) => (PC[root] + i) % 12),
    });
  }
  return chordCache.get(name);
}

// Form, in bars of 4/4. Every section starts on an even bar, so even bars are
// always the 2 side of the 2-3 son clave and odd bars the 3 side.
const VAMP = ["Dm7", "G7", "Bbmaj7", "A7"];
const HEAD_A = ["Dm7", "Dm7", "Gm7", "C7", "Fmaj7", "Bbmaj7", ["Em7b5", "A7"], "A7"];
const HEAD_A2 = ["Dm7", "Dm7", "Gm7", "C7", "Fmaj7", "Bbmaj7", ["Em7b5", "A7"], "Dm7"];
const HEAD_B = ["Gm7", "C7", "Fmaj7", "Dm7", "Gm7", "A7", "Dm7", "A7"];
const repeat = (bars, n) => Array.from({ length: n }, () => bars).flat();

const SECTIONS = {
  intro: { start: 0, bars: repeat(VAMP, 2) },
  head: { start: 8, bars: [...HEAD_A, ...HEAD_A2, ...HEAD_B, ...HEAD_A2] },
  montuno: { start: 40, bars: repeat(VAMP, 8) },
  mambo: { start: 72, bars: repeat(VAMP, 6) },
  cierre: { start: 96, bars: repeat(["Dm7"], 4) },
};
const BARS = Object.values(SECTIONS).flatMap((s) => s.bars);
const END_BEAT = BARS.length * 4;

function chordAt(beat) {
  const spec = BARS[Math.min(Math.floor(beat / 4), BARS.length - 1)];
  if (typeof spec === "string") return chord(spec);
  return chord(beat % 4 < 2 ? spec[0] : spec[1]);
}
// An offbeat eighth right before a chord change belongs to the next chord:
// the anticipation that bass, piano, and horns all share in this style.
function harmonyAt(beat) {
  const here = chordAt(beat);
  if (beat % 1 === 0.5) {
    const next = chordAt(beat + 0.5);
    if (next !== here) return next;
  }
  return here;
}
const isTone = (pitch, c) => c.tones.includes(((pitch % 12) + 12) % 12);
function chordTonesIn(c, lo, hi) {
  const out = [];
  for (let p = lo; p <= hi; p++) if (isTone(p, c)) out.push(p);
  return out;
}
function nearestTone(target, c, lo, hi) {
  let best;
  for (const p of chordTonesIn(c, lo, hi)) {
    if (best === undefined || Math.abs(p - target) < Math.abs(best - target)) best = p;
  }
  return best;
}
// The highest chord tone at least `gap` semitones under `pitch`.
function toneBelow(pitch, c, gap = 3) {
  for (let p = pitch - gap; p > pitch - 13; p--) if (isTone(p, c)) return p;
  return pitch - 12;
}
const pcIn = (pc, lo) => lo + ((((pc - lo) % 12) + 12) % 12);

// ---------------------------------------------------------------------------
// Tracks

function track(name, program, options = {}) {
  return { name, program, notes: [], ...options };
}
const keySignature = { fifths: -1, mode: "minor" };
const drums = (name, options) => track(name, 0, { bank: 128, ...options });

const tracks = {
  lead: track("Lead (tenor sax)", 66, { gain: 0.95, pan: 0, keySignature }),
  coro: track("Coro", 52, { gain: 0.7, pan: 0.05, keySignature }),
  trumpets: track("Trumpets", 56, { gain: 0.55, pan: 0.3, keySignature }),
  trombones: track("Trombones", 57, { gain: 0.6, pan: -0.3, keySignature }),
  piano: track("Piano montuno", 0, { gain: 0.6, pan: -0.15, keySignature }),
  bass: track("Bass tumbao", 32, { gain: 0.85, pan: 0, keySignature }),
  clave: drums("Clave 2-3", { gain: 0.55, pan: 0.15 }),
  congas: drums("Congas", { gain: 0.6, pan: 0.35 }),
  bongo: drums("Bongo martillo", { gain: 0.55, pan: -0.4 }),
  cowbell: drums("Bongo bell", { gain: 0.45, pan: -0.25 }),
  timbales: drums("Timbales", { gain: 0.5, pan: 0.25 }),
  guiro: drums("Guiro and maracas", { gain: 0.45, pan: 0.5 }),
};
function add(t, start, pitch, duration, velocity) {
  tracks[t].notes.push({ pitch, start, duration, velocity });
}

// GM percussion keys in the drum kit
const HI_BONGO = 60;
const LO_BONGO = 61;
const MUTE_CONGA = 62;
const OPEN_CONGA = 63;
const TUMBA = 64;
const HI_TIMBALE = 65;
const LO_TIMBALE = 66;
const COWBELL = 56;
const CLAVES = 75;
const SHORT_GUIRO = 73;
const LONG_GUIRO = 74;
const MARACAS = 70;
const CRASH = 49;
const RIDE_BELL = 53;

const barsOf = (section) => {
  const s = SECTIONS[section];
  return s.bars.map((_, i) => s.start + i);
};
const range = (a, b) => Array.from({ length: b - a }, (_, i) => a + i);

// ---------------------------------------------------------------------------
// Clave: 2-3 son clave, two hits on the 2 side and three on the 3 side.

const CLAVE_2_3 = [1, 2, 4, 5.5, 7];
for (let bar = 0; bar < 96; bar += 2) {
  for (const b of CLAVE_2_3) add("clave", bar * 4 + b, CLAVES, 0.25, vel(95));
}

// ---------------------------------------------------------------------------
// Bass tumbao: "and" of 2 and beat 4, with beat 4 taking the next bar's root
// and tying over the barline. The downbeat only sounds where a section starts.

function bassRoot(c) {
  return pcIn(c.root, 31);
}
function bassFifth(c) {
  const p = bassRoot(c) + 7;
  return p > 45 ? p - 12 : p;
}
// Only the bass's entry lands on a downbeat; elsewhere the tied beat-4 note
// already carries the bar's root over the barline.
const SECTION_STARTS = new Set([4]);
for (const bar of range(4, 96)) {
  const t = bar * 4;
  const here = chordAt(t);
  const mid = chordAt(t + 2);
  const next = chordAt(t + 4);
  if (SECTION_STARTS.has(bar)) add("bass", t, bassRoot(here), 1.4, vel(100));
  const twoAnd = mid !== here ? bassRoot(mid) : bassFifth(here);
  add("bass", t + 1.5, twoAnd, 1.45, vel(88));
  // The last tie stops before the cierre's first hit on beat 2.
  add("bass", t + 3, bassRoot(next), bar === 95 ? 1.9 : 2.4, vel(102));
}

// ---------------------------------------------------------------------------
// Piano montuno: a two-bar guajeo in octaves with inner chord tones. The
// 2-side bar leans on the beat, the 3-side bar on the offbeats, and the last
// eighth of each bar anticipates the next chord.

const GUAJEO = [
  // [beat within the two bars, contour target, full voicing]
  [0, 69, true],
  [1, 72, false],
  [2, 74, true],
  [2.5, 72, false],
  [3.5, 74, true],
  [4.5, 71, false],
  [5.5, 74, true],
  [6, 71, true],
  [7, 67, false],
  [7.5, 69, true],
];
function guajeo(firstBar, lastBar, level) {
  for (let bar = firstBar; bar < lastBar; bar += 2) {
    for (const [i, [b, target, full]] of GUAJEO.entries()) {
      const t = bar * 4 + b;
      const c = harmonyAt(t);
      const top = nearestTone(target, c, 62, 77);
      const bottom = top - 12;
      const anticipation = c !== chordAt(t);
      // An anticipation rings until just before the next hit.
      const gap = (GUAJEO[i + 1]?.[0] ?? 8) - b;
      const duration = anticipation ? Math.min(0.9, gap - 0.05) : 0.42;
      const v = vel((full ? 86 : 74) * level);
      add("piano", t, bottom, duration, v);
      add("piano", t, top, duration, v);
      if (full) {
        const inner = chordTonesIn(c, bottom + 1, top - 1).slice(-2);
        for (const p of inner) add("piano", t, p, duration, vel(v - 14));
      }
    }
  }
}
guajeo(0, 8, 0.85);
guajeo(8, 40, 0.82);
guajeo(40, 96, 1);

// ---------------------------------------------------------------------------
// Percussion grooves

function congaTumbao(bar, level = 1) {
  const t = bar * 4;
  const strokes = [
    [0, MUTE_CONGA, 34],
    [0.5, MUTE_CONGA, 28],
    [1, MUTE_CONGA, 96],
    [1.5, MUTE_CONGA, 28],
    [2, MUTE_CONGA, 34],
    [2.5, MUTE_CONGA, 28],
    [3, OPEN_CONGA, 92],
    [3.5, TUMBA, 90],
  ];
  for (const [b, p, v] of strokes) add("congas", t + b, p, 0.25, vel(v * level));
}
function martillo(bar) {
  const t = bar * 4;
  const strokes = [80, 44, 68, 44, 80, 44, 102];
  strokes.forEach((v, i) => add("bongo", t + i * 0.5, HI_BONGO, 0.25, vel(v)));
  add("bongo", t + 3.5, LO_BONGO, 0.25, vel(78));
}
function bongoBell(bar) {
  const t = bar * 4;
  [110, 72, 104, 72].forEach((v, i) => add("cowbell", t + i, COWBELL, 0.3, vel(v)));
}
function guiro(bar) {
  const t = bar * 4;
  add("guiro", t, LONG_GUIRO, 0.9, vel(72));
  add("guiro", t + 1, SHORT_GUIRO, 0.25, vel(60));
  add("guiro", t + 1.5, SHORT_GUIRO, 0.25, vel(52));
  add("guiro", t + 2, LONG_GUIRO, 0.9, vel(72));
  add("guiro", t + 3, SHORT_GUIRO, 0.25, vel(60));
  add("guiro", t + 3.5, SHORT_GUIRO, 0.25, vel(52));
}
function maracas(bar) {
  for (let i = 0; i < 8; i++) {
    add("guiro", bar * 4 + i * 0.5, MARACAS, 0.2, vel(i % 2 ? 42 : 66));
  }
}
// The timbalero's bell, locked to clave: on-beat on the 2 side, with the
// 3 side's offbeat hits.
function mamboBell(bar) {
  const t = bar * 4;
  const twoSide = bar % 2 === 0;
  const hits = twoSide ? [0, 1, 2, 3, 3.5] : [0, 1, 1.5, 2.5, 3];
  const accents = twoSide ? [1, 2] : [0, 1.5, 3];
  for (const b of hits) {
    add("timbales", t + b, RIDE_BELL, 0.3, vel(accents.includes(b) ? 96 : 66));
  }
}
// A fill in the last two beats of a bar, landing a crash on the next downbeat.
function fill(bar, crashBeat = 0) {
  const t = bar * 4;
  const strokes = [
    [2, HI_TIMBALE],
    [2.5, HI_TIMBALE],
    [3, LO_TIMBALE],
    [3.25, HI_TIMBALE],
    [3.5, LO_TIMBALE],
    [3.75, LO_TIMBALE],
  ];
  strokes.forEach(([b, p], i) => add("timbales", t + b, p, 0.2, vel(70 + i * 8)));
  add("timbales", t + 4 + crashBeat, CRASH, 2, vel(100));
  add("timbales", t + 4 + crashBeat, LO_TIMBALE, 0.3, vel(105));
}

// Intro: piano and clave alone, then bass, congas, and guiro.
for (const bar of range(4, 8)) {
  congaTumbao(bar, 0.85);
  guiro(bar);
}
fill(7);
// Head: congas and guiro carry it; the bongo and bell wait for the montuno.
for (const bar of barsOf("head")) {
  congaTumbao(bar);
  guiro(bar);
}
fill(39);
// Montuno: bongo martillo and bell come in, then maracas, then the mambo bell.
for (const bar of barsOf("montuno")) {
  const cycle = Math.floor((bar - 40) / 4);
  congaTumbao(bar);
  guiro(bar);
  martillo(bar);
  bongoBell(bar);
  if (cycle >= 2) maracas(bar);
  if (cycle >= 6) mamboBell(bar);
}
fill(71);
for (const bar of barsOf("mambo")) {
  congaTumbao(bar, 1.05);
  guiro(bar);
  martillo(bar);
  bongoBell(bar);
  maracas(bar);
  mamboBell(bar);
}
fill(95, 1);

// ---------------------------------------------------------------------------
// Melodic lines are [bar, beat, pitch, duration] relative to a start bar.

function line(t, startBar, notes, options = {}) {
  const { level = 1, harmony = 0, octaveBelow = false } = options;
  for (const [bar, beat, pitch, duration] of notes) {
    const at = (startBar + bar) * 4 + beat;
    const v = vel(100 * level);
    add(t, at, pitch, duration, v);
    const c = harmonyAt(at);
    let p = pitch;
    for (let i = 0; i < harmony; i++) {
      p = toneBelow(p, c);
      add(t, at, p, duration, vel(v - 8));
    }
    if (octaveBelow) add(t, at, pitch - 12, duration, vel(v - 10));
  }
}

// Intro horn pickup into the head.
const INTRO_HORNS = [
  [0, 1, 74, 0.45],
  [0, 1.5, 77, 0.45],
  [0, 2, 74, 0.45],
  [0, 3, 72, 0.45],
  [0, 3.5, 73, 1],
  [1, 1.5, 76, 0.45],
  [1, 2, 73, 0.45],
  [1, 3, 69, 0.9],
];
line("trumpets", 6, INTRO_HORNS, { level: 0.95, harmony: 1 });
line(
  "trombones",
  6,
  INTRO_HORNS.map(([b, beat, p, d]) => [b, beat, p - 12, d]),
  { level: 0.9 },
);

// Head: A A' B A', sung on the lead voice. Phrases mostly enter on beat 2 of
// the 2-side bar, where the clave's first hit is.
const A = [
  [0, 1, 69, 0.5],
  [0, 1.5, 74, 1],
  [0, 2.5, 72, 0.5],
  [0, 3, 69, 1],
  [1, 1.5, 65, 0.5],
  [1, 2, 67, 0.5],
  [1, 2.5, 69, 1.5],
  [2, 1, 70, 0.5],
  [2, 1.5, 74, 1],
  [2, 2.5, 72, 0.5],
  [2, 3, 70, 0.5],
  [2, 3.5, 69, 0.5],
  [3, 0, 67, 1.5],
  [3, 1.5, 64, 0.5],
  [3, 2, 67, 0.5],
  [3, 2.5, 70, 1.5],
  [4, 0, 69, 1],
  [4, 1.5, 72, 0.5],
  [4, 2, 69, 0.5],
  [4, 2.5, 65, 0.5],
  [4, 3, 64, 0.5],
  [4, 3.5, 65, 0.5],
  [5, 0, 62, 1],
  [5, 1.5, 65, 0.5],
  [5, 2, 69, 0.5],
  [5, 2.5, 74, 1.5],
  [6, 0, 72, 1],
  [6, 1, 70, 0.5],
  [6, 1.5, 67, 1],
  [6, 2.5, 64, 0.5],
  [6, 3, 61, 0.5],
  [6, 3.5, 64, 0.5],
  [7, 0, 67, 1],
  [7, 1.5, 65, 0.5],
  [7, 2, 64, 2],
];
const A2 = [
  ...A.filter(([bar]) => bar === 0),
  [1, 1.5, 65, 0.5],
  [1, 2, 67, 0.5],
  [1, 2.5, 69, 0.5],
  [1, 3, 72, 1],
  ...A.filter(([bar]) => bar >= 2 && bar <= 4),
  [5, 0, 74, 1],
  [5, 1.5, 72, 0.5],
  [5, 2, 74, 0.5],
  [5, 2.5, 77, 1.5],
  [6, 0, 76, 1],
  [6, 1, 74, 0.5],
  [6, 1.5, 70, 0.5],
  [6, 2, 69, 0.5],
  [6, 2.5, 67, 0.5],
  [6, 3, 64, 0.5],
  [6, 3.5, 61, 0.5],
  [7, 0, 62, 2],
];
const B = [
  [0, 0, 74, 1.5],
  [0, 1.5, 74, 0.5],
  [0, 2, 70, 0.5],
  [0, 2.5, 74, 1.5],
  [1, 0, 72, 1],
  [1, 1, 70, 0.5],
  [1, 1.5, 67, 1],
  [1, 2.5, 64, 0.5],
  [1, 3, 67, 1],
  [2, 0, 69, 1.5],
  [2, 1.5, 72, 0.5],
  [2, 2, 76, 2],
  [3, 1, 74, 0.5],
  [3, 1.5, 72, 0.5],
  [3, 2, 69, 1],
  [3, 3, 65, 1],
  [4, 1, 70, 0.5],
  [4, 1.5, 74, 0.5],
  [4, 2, 77, 1.5],
  [4, 3.5, 76, 0.5],
  [5, 0, 73, 1],
  [5, 1, 76, 0.5],
  [5, 1.5, 74, 0.5],
  [5, 2, 73, 0.5],
  [5, 2.5, 69, 1.5],
  [6, 0, 74, 1.5],
  [6, 1.5, 69, 0.5],
  [6, 2, 65, 0.5],
  [6, 2.5, 62, 1.5],
  [7, 1, 64, 0.5],
  [7, 1.5, 67, 0.5],
  [7, 2, 70, 0.5],
  [7, 2.5, 73, 0.5],
  [7, 3, 76, 1],
];
const legato = (notes) => notes.map(([b, beat, p, d]) => [b, beat, p, d * 0.95]);
line("lead", 8, legato(A), { level: 0.95 });
line("lead", 16, legato(A2), { level: 0.95 });
line("lead", 24, legato(B), { level: 1 });
line("lead", 32, legato(A2), { level: 0.97 });

// Montuno: the coro sings the 2 bars over Dm7 and G7, and the lead answers
// over Bbmaj7 and A7, getting higher and busier each cycle.
const CORO = [
  [0, 1, 69, 0.45],
  [0, 1.5, 72, 0.45],
  [0, 2, 74, 0.95],
  [0, 3, 72, 0.45],
  [0, 3.5, 71, 1.45],
  [1, 1.5, 74, 0.45],
  [1, 2, 71, 0.45],
  [1, 2.5, 67, 1.2],
];
const PREGONES = [
  [
    [2, 1, 74, 0.5],
    [2, 1.5, 74, 0.5],
    [2, 2, 72, 0.5],
    [2, 2.5, 69, 1],
    [3, 0.5, 67, 0.5],
    [3, 1, 64, 0.5],
    [3, 1.5, 67, 0.5],
    [3, 2, 69, 1.5],
  ],
  [
    [2, 0.5, 65, 0.5],
    [2, 1, 69, 0.5],
    [2, 1.5, 72, 1],
    [2, 2.5, 74, 0.5],
    [2, 3, 72, 0.5],
    [2, 3.5, 69, 0.5],
    [3, 0, 73, 1],
    [3, 1.5, 69, 0.5],
    [3, 2, 67, 0.5],
    [3, 2.5, 64, 1],
  ],
  [
    [2, 0, 77, 2.5],
    [2, 3, 74, 0.5],
    [2, 3.5, 72, 0.5],
    [3, 0, 73, 1.5],
    [3, 1.5, 70, 0.5],
    [3, 2, 69, 1.5],
  ],
  [
    [2, 1, 72, 0.5],
    [2, 1.5, 74, 0.5],
    [2, 2, 72, 0.5],
    [2, 2.5, 74, 0.5],
    [2, 3, 77, 1],
    [3, 0, 76, 0.5],
    [3, 0.5, 73, 0.5],
    [3, 1.5, 69, 0.5],
    [3, 2, 70, 0.5],
    [3, 2.5, 69, 1],
  ],
  [
    [1, 3.5, 62, 0.5],
    [2, 0, 65, 0.5],
    [2, 0.5, 69, 0.5],
    [2, 1, 74, 0.5],
    [2, 1.5, 77, 1],
    [2, 2.5, 74, 0.5],
    [2, 3, 72, 1],
    [3, 0, 73, 0.5],
    [3, 0.5, 76, 1],
    [3, 1.5, 73, 0.5],
    [3, 2, 69, 1.5],
  ],
  [
    [2, 1, 79, 1.5],
    [2, 2.5, 77, 0.5],
    [2, 3, 74, 1],
    [3, 0, 76, 0.5],
    [3, 0.5, 79, 0.5],
    [3, 1, 76, 0.5],
    [3, 1.5, 73, 0.5],
    [3, 2, 69, 1],
  ],
  [
    [2, 0.5, 77, 0.5],
    [2, 1, 77, 0.5],
    [2, 1.5, 77, 0.5],
    [2, 2, 74, 0.5],
    [2, 2.5, 77, 1],
    [3, 0, 79, 0.5],
    [3, 0.5, 76, 0.5],
    [3, 1, 73, 0.5],
    [3, 1.5, 70, 0.5],
    [3, 2, 69, 0.5],
    [3, 2.5, 67, 0.5],
    [3, 3, 64, 1],
  ],
  [
    [2, 1, 74, 0.5],
    [2, 1.5, 77, 0.5],
    [2, 2, 81, 1.5],
    [2, 3.5, 79, 0.5],
    [3, 0, 76, 1],
    [3, 1, 73, 0.5],
    [3, 1.5, 76, 0.5],
    [3, 2, 79, 2],
  ],
];
for (let cycle = 0; cycle < 8; cycle++) {
  const start = 40 + cycle * 4;
  // The coro thickens to four voices for the last two cycles.
  line("coro", start, CORO, { level: 0.82, harmony: 2, octaveBelow: cycle >= 6 });
  line("lead", start, legato(PREGONES[cycle]), { level: 0.92 + cycle * 0.015 });
  // Trombone pads on the guide tones join behind the coro from cycle 5.
  if (cycle >= 4) {
    for (let bar = start; bar < start + 4; bar++) {
      const c = chordAt(bar * 4);
      const third = pcIn((c.root + c.intervals[1]) % 12, 52);
      const seventh = pcIn((c.root + c.intervals[3]) % 12, 52);
      for (const p of [third, seventh]) add("trombones", bar * 4, p, 3.6, vel(52));
    }
  }
}

// Mambo: three interlocking riffs over the same vamp, entering one at a time.
// Trombones take the clave hits, trumpets fill the gaps between them, and the
// sax rides on top with a longer line.
const R1 = [
  [0, 1, 53, 0.45],
  [0, 1.5, 57, 0.45],
  [0, 2, 60, 0.4],
  [0, 3.5, 59, 0.95],
  [1, 1.5, 62, 0.45],
  [1, 2, 59, 0.4],
  [1, 3, 55, 0.9],
  [2, 1, 53, 0.45],
  [2, 1.5, 57, 0.45],
  [2, 2, 62, 0.4],
  [2, 3.5, 61, 0.95],
  [3, 1.5, 64, 0.45],
  [3, 2, 61, 0.4],
  [3, 3, 57, 0.9],
];
const R2 = [
  [0, 0.5, 76, 0.45],
  [0, 2.5, 77, 0.45],
  [0, 3, 76, 0.4],
  [1, 0, 77, 0.45],
  [1, 0.5, 74, 0.4],
  [1, 3.5, 74, 0.95],
  [2, 0.5, 77, 0.45],
  [2, 2.5, 77, 0.45],
  [2, 3, 74, 0.4],
  [2, 3.5, 76, 0.95],
  [3, 0.5, 79, 0.45],
  [3, 1, 76, 0.4],
  [3, 2.5, 73, 0.45],
  [3, 3.5, 77, 0.95],
];
const R3 = [
  [0, 0, 69, 1.45],
  [0, 1.5, 72, 0.95],
  [0, 2.5, 74, 1.9],
  [1, 0.5, 71, 1.9],
  [1, 2.5, 74, 0.45],
  [1, 3, 77, 0.45],
  [1, 3.5, 74, 1.45],
  [2, 1, 77, 1.45],
  [2, 2.5, 81, 0.95],
  [2, 3.5, 79, 1.45],
  [3, 1, 76, 0.95],
  [3, 2, 73, 0.95],
  [3, 3, 69, 0.95],
];
for (let cycle = 0; cycle < 6; cycle++) {
  const start = 72 + cycle * 4;
  line("trombones", start, R1, { level: 0.95, harmony: 1 });
  if (cycle >= 2) line("trumpets", start, R2, { level: 0.95, harmony: 1 });
  if (cycle >= 4) line("lead", start, R3, { level: 1 });
}

// Cierre: the whole band hits the clave, then an A7 stab and the final chord,
// both on the 2 side's hits.
const CIERRE = [
  // [beat from the cierre's start, chord, trumpet top, duration]
  [1, "Dm7", 74, 0.4],
  [2, "Dm7", 77, 0.4],
  [4, "G7", 77, 0.4],
  [5.5, "Bbmaj7", 77, 0.4],
  [7, "A7", 76, 0.4],
  [9, "A7", 73, 0.4],
  [10, "Dm69", 76, 4],
];
for (const [b, name, top, duration] of CIERRE) {
  const t = 96 * 4 + b;
  const c = chord(name);
  const v = vel(112, 3);
  add("trumpets", t, top, duration, v);
  add("trumpets", t, toneBelow(top, c), duration, v - 6);
  const third = pcIn((c.root + c.intervals[1]) % 12, 52);
  const color = pcIn((c.root + c.intervals[3]) % 12, 52);
  for (const p of [third, color]) add("trombones", t, p, duration, v - 4);
  add("lead", t, top - 12, duration, v - 6);
  const root = bassRoot(c);
  add("bass", t, root, duration === 4 ? 4 : 0.45, v);
  add("piano", t, root + 12, duration, v - 10);
  for (const p of chordTonesIn(c, top - 11, top)) add("piano", t, p, duration, v - 14);
  add("congas", t, MUTE_CONGA, 0.25, vel(100));
  add("timbales", t, b === 10 ? LO_TIMBALE : HI_TIMBALE, 0.3, vel(108));
  if (b < 10) add("clave", t, CLAVES, 0.25, vel(95));
}
add("timbales", 96 * 4 + 10, CRASH, 4, vel(110));

// ---------------------------------------------------------------------------

for (const t of Object.values(tracks)) {
  t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  for (const n of t.notes) {
    n.start = Math.round(n.start * 1000) / 1000;
    n.duration = Math.round(n.duration * 1000) / 1000;
  }
}

const project = {
  title: "Son de la Esquina",
  comment:
    "Salsa in the son montuno tradition, locked to a 2-3 son clave. D minor, 190 BPM. Intro, head, montuno with coro and pregón, mambo, cierre.",
  tempo: TEMPO,
  timeSignature: { numerator: 4, denominator: 4 },
  locators: [
    { beat: 0, label: "Intro" },
    { beat: 32, label: "Head A" },
    { beat: 96, label: "Head B" },
    { beat: 128, label: "Head A'" },
    { beat: 160, label: "Montuno" },
    { beat: 288, label: "Mambo" },
    { beat: 384, label: "Cierre" },
  ],
  loop: { range: { startBeat: 160, endBeat: 288 }, enabled: false },
  midiTracks: Object.values(tracks),
};

const out = new URL("./project.json", import.meta.url);
writeFileSync(out, JSON.stringify(project, null, 2) + "\n");
const total = project.midiTracks.reduce((n, t) => n + t.notes.length, 0);
console.log(`wrote ${out.pathname}: ${project.midiTracks.length} tracks, ${total} notes, ${END_BEAT} beats`);
