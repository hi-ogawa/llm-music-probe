// Generates strasbourg-st-denis.json, a Toy MIDI SharedProject.
// Usage: node compose.mjs
import { writeFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";

const TEMPO = 108;

// Form, in bars (4/4)
const INTRO = 0; // 8 bars: riff on the groove, then the turnaround hits
const HEAD1 = 8; // 16 bars: riff head twice
const SOLO = 24; // 32 bars: two 16-bar trumpet choruses
const HEAD2 = 56; // 16 bars: riff head twice
const TAG = 72; // 3 bars: riff, unison climb, final hit
const END = 75;

// The head sits between straight and swung eighths; the solo loosens toward triplet swing.
const swingRatioAt = (beat) => {
  const bar = Math.floor(beat / 4);
  return bar >= SOLO && bar < HEAD2 ? 0.64 : 0.58;
};

// Maps a nominal beat position (straight grid) onto the swung grid.
function sw(t) {
  const r = swingRatioAt(t);
  const b = Math.floor(t);
  const f = t - b;
  return f <= 0.5 ? b + f * (r / 0.5) : b + r + (f - 0.5) * ((1 - r) / 0.5);
}

// Deterministic humanization
let seed = 0x5d3e15;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const round = (x) => Math.round(x * 10000) / 10000;
const clampVel = (v) => Math.max(1, Math.min(127, Math.round(v)));

function track(name, preset, mix) {
  return { name, ...preset, ...mix, viewMode: "overview", height: 64, notes: [] };
}

// Adds a note at a nominal beat. Start and end are both mapped through the swing grid.
function add(tr, start, pitch, dur, vel, { jitter = 0.006, velJitter = 3 } = {}) {
  let s = sw(start);
  const e = sw(start + dur);
  s = Math.max(0, s + (rand() - 0.5) * 2 * jitter);
  tr.notes.push({
    pitch,
    start: round(s),
    duration: round(Math.max(0.05, e - s)),
    velocity: clampVel(vel + (rand() - 0.5) * 2 * velJitter),
  });
}

// ---------------------------------------------------------------------------
// Harmony

const CH = {
  Fm9: { root: 29, q: "m", v: [56, 60, 63, 67] },
  Fm11: { root: 29, q: "m", v: [56, 58, 63, 67] },
  Bbm9: { root: 34, q: "m", v: [56, 60, 61, 65] },
  Bbm11: { root: 34, q: "m", v: [53, 56, 61, 63] },
  Db7: { root: 37, q: "7", v: [53, 59, 63, 70] },
  C7alt: { root: 36, q: "alt", v: [52, 58, 63, 68] },
  Dbmaj7s11: { root: 37, q: "M", v: [53, 55, 60, 63] },
  Gm7b5: { root: 31, q: "h", v: [53, 58, 61, 65] },
  Gbmaj7: { root: 30, q: "M", v: [53, 58, 60, 63] },
  Dbmaj7: { root: 37, q: "M", v: [53, 60, 63, 68] },
  Fm69: { root: 29, q: "m", v: [56, 62, 67, 72] },
};

const HEAD_FORM = ["Fm9", "Fm9", "Fm9", "Fm9", "Bbm9", "Bbm9", "Db7", "C7alt"];
// The solo opens up: long modal stretches and major-seventh colors instead of the riff's two-bar cycle.
const SOLO_FORM = [
  "Fm11", "Fm11", "Fm11", "Fm11", "Dbmaj7s11", "Dbmaj7s11", "Gm7b5", "C7alt",
  "Bbm11", "Bbm11", "Bbm11", "Bbm11", "Gbmaj7", "Gbmaj7", "Dbmaj7", "C7alt",
];

function chordAt(bar) {
  if (bar < HEAD1) return ["Fm9", "Fm9", "Fm9", "Fm9", "Fm9", "Fm9", "Db7", "C7alt"][bar];
  if (bar < SOLO) return HEAD_FORM[(bar - HEAD1) % 8];
  if (bar < HEAD2) return SOLO_FORM[(bar - SOLO) % 16];
  if (bar < TAG) return HEAD_FORM[(bar - HEAD2) % 8];
  return bar < END - 1 ? "Fm9" : "Fm69";
}

// ---------------------------------------------------------------------------
// Tracks

const trumpet = track("Trumpet", { program: 56 }, { gain: 0.85, pan: 0.05 });
const tenor = track("Tenor Sax", { program: 66 }, { gain: 0.72, pan: -0.3 });
const trombone = track("Trombone", { program: 57 }, { gain: 0.68, pan: 0.32 });
const rhodes = track("Rhodes", { program: 4 }, { gain: 0.62, pan: -0.22 });
const organ = track("Organ", { program: 16 }, { gain: 0.4, pan: 0.25 });
const guitar = track(
  "Guitar (muted)",
  { soundfont: "flamestudios-telecaster-neck", program: 1 },
  { gain: 0.5, pan: 0.45 },
);
const bass = track("Bass", { program: 33 }, { gain: 1.0, pan: 0 });
const drums = track("Drums", { bank: 128, program: 32 }, { gain: 0.85, pan: 0 });
const perc = track("Percussion", { bank: 128, program: 0 }, { gain: 0.45, pan: -0.45 });

// ---------------------------------------------------------------------------
// The bass figure: two bars. Bar 1 punches root, octave pop, b7 push, and fifth;
// bar 2 leaves beat 1 empty, then climbs b3-3-4-b5-5 chromatically and holds the
// fifth across beat 4 before a leading-tone pickup.

const RIFF = [
  [0, 0, 0.4, 114],
  [0.5, 12, 0.2, 86],
  [1.5, 10, 0.4, 102],
  [2, 12, 0.3, 94],
  [3, 7, 0.4, 104],
  [3.5, 10, 0.25, 82],
  [4.5, 3, 0.4, 100],
  [5, 4, 0.3, 90],
  [5.5, 5, 0.4, 100],
  [6, 6, 0.4, 106],
  [6.5, 7, 0.95, 112],
];
const CLIMB = RIFF.slice(6, 11);

function bassRiff(bar, R, pickup, vs = 1) {
  const b = bar * 4;
  for (const [p, i, d, v] of RIFF) add(bass, b + p, R + i, d, v * vs, { jitter: 0.004 });
  if (pickup != null) add(bass, b + 7.5, pickup, 0.4, 94 * vs);
}

// Turnaround hits: Db7 then C7alt, horns and bass together on 1 and the and of 2.
function bassHits(bar, pickup = 28) {
  const b = bar * 4;
  [[0, 37, 0.45, 116], [1.5, 37, 0.3, 106], [2, 32, 0.4, 88], [3, 35, 0.4, 94]].forEach(([p, n, d, v]) =>
    add(bass, b + p, n, d, v),
  );
  [[4, 36, 0.45, 116], [5.5, 36, 0.3, 106], [6, 31, 0.4, 88], [7, 34, 0.4, 92], [7.5, pickup, 0.4, 96]].forEach(
    ([p, n, d, v]) => add(bass, b + p, n, d, v),
  );
}

// Guitar doubles the bass figure two octaves up with muted strokes.
function guitarRiff(bar, R) {
  for (const [p, i, d, v] of RIFF) add(guitar, bar * 4 + p, R + i + 24, Math.min(d, 0.3), v * 0.62);
}
function guitarHits(bar) {
  for (const [p, n] of [[0, 61], [1.5, 61], [4, 60], [5.5, 60]]) add(guitar, bar * 4 + p, n, 0.25, 80);
}

// ---------------------------------------------------------------------------
// Horn head: a call that lands on the fifth, an answer that lands on the root,
// the call again up a fourth over Bbm, then the hits.

const CALL = [
  [0, 72, 0.3, 112], [0.5, 75, 0.4, 100], [1, 77, 0.3, 108],
  [2.5, 75, 0.3, 98], [3, 72, 0.4, 104], [3.5, 71, 0.4, 96],
  [4, 72, 0.6, 116],
];
const ANSWER = [
  [0, 72, 0.3, 110], [0.5, 75, 0.4, 100], [1, 77, 0.3, 106],
  [2, 80, 0.45, 118], [2.5, 77, 0.3, 100], [3, 72, 0.3, 98], [3.5, 75, 0.4, 102],
  [4, 77, 0.8, 118],
];

function hornPhrase(bar, phrase, transpose = 0) {
  for (const [p, n, d, v] of phrase) {
    add(trumpet, bar * 4 + p, n + transpose, d, v);
    add(tenor, bar * 4 + p, n + transpose - 12, d, v - 6);
  }
}

const HIT_VOICINGS = { Db7: [75, 71, 65], C7alt: [75, 70, 64] };
function hornHits(bar) {
  for (const [p, name] of [[0, "Db7"], [1.5, "Db7"], [4, "C7alt"], [5.5, "C7alt"]]) {
    const [t, x, b] = HIT_VOICINGS[name];
    const d = p % 4 === 0 ? 0.45 : 0.3;
    add(trumpet, bar * 4 + p, t, d, 116);
    add(tenor, bar * 4 + p, x, d, 110);
    add(trombone, bar * 4 + p, b, d, 112);
  }
}

// Trombone doubles the bass climb an octave up on the second pass.
function tromboneClimb(bar, R) {
  for (const [p, i, d, v] of CLIMB) add(trombone, bar * 4 + p, R + i + 12, d, v - 8);
}

// ---------------------------------------------------------------------------
// Keys

function stab(tr, beat, voicing, dur, vel, shift = 0) {
  for (const n of voicing) add(tr, beat, n + shift, dur, vel - (n === voicing[0] ? 6 : 0));
}

function rhodesRiffUnit(bar) {
  const v = CH[chordAt(bar)].v;
  stab(rhodes, bar * 4 + 1.5, v, 0.3, 74);
  stab(rhodes, bar * 4 + 4, v, 0.35, 70);
  stab(rhodes, bar * 4 + 7, v, 0.25, 66);
}
function keysHits(bar) {
  for (const [p, name] of [[0, "Db7"], [1.5, "Db7"], [4, "C7alt"], [5.5, "C7alt"]]) {
    const d = p % 4 === 0 ? 0.45 : 0.3;
    stab(rhodes, bar * 4 + p, CH[name].v, d, 92);
    stab(organ, bar * 4 + p, CH[name].v, d, 70);
  }
}
function organPad(startBeat, beats, chord, vel) {
  for (const n of CH[chord].v) add(organ, startBeat, n, beats - 0.15, vel, { jitter: 0, velJitter: 1 });
}

// ---------------------------------------------------------------------------
// Drums (GM: 36 kick, 37 side stick, 38 snare, 42 closed hat, 44 pedal hat,
// 46 open hat, 49 crash, 51 ride, 41/45/48/50 toms)

const dr = (beat, pitch, vel, dur = 0.2) => add(drums, beat, pitch, dur, vel, { jitter: 0.004 });

function fill(bar, from) {
  const seq = [38, 38, 50, 50, 48, 48, 45, 41, 38, 38, 50, 48, 45, 45, 41, 41];
  let k = 0;
  for (let p = from; p < 4; p += 0.25, k++) {
    const vel = 62 + ((p - from) / (4 - from)) * 50;
    dr(bar * 4 + p, seq[seq.length - (4 - from) / 0.25 + k], vel);
  }
  dr(bar * 4 + 3.5, 36, 90);
}

// kind: "A" (riff bar 1), "B" (riff bar 2), "hit1", "hit2"
function grooveBar(bar, kind, { rim = false, fillFrom = null, crash = false } = {}) {
  const b = bar * 4;
  const end = fillFrom ?? 4;
  const hitPos = kind === "hit1" || kind === "hit2" ? [0, 1.5] : [];
  for (let p = 0; p < end; p += 0.5) {
    if (hitPos.includes(p)) continue;
    if (kind === "B" && p === 3.5) dr(b + p, 46, 82, 0.4);
    else dr(b + p, 42, p % 1 === 0 ? 84 : 56);
  }
  for (const p of [1, 3]) if (p < end && !(hitPos.length && p === 1)) dr(b + p, rim ? 37 : 38, rim ? 88 : 108);
  if (!rim) for (const p of [0.75, 2.25, 3.75]) if (p < end && !hitPos.length) dr(b + p, 38, 30);
  // Kick locks to the bass figure's accents
  const kicks = { A: [[0, 110], [1.5, 90], [3, 96]], B: [[0.5, 84], [2.5, 100]], hit1: [], hit2: [] }[kind];
  for (const [p, v] of kicks) if (p < end) dr(b + p, 36, v);
  for (const p of hitPos) {
    dr(b + p, 36, 112);
    dr(b + p, 38, 104);
    if (p === 0) dr(b + p, 49, 104, 1);
  }
  if (crash && !hitPos.includes(0)) dr(b, 49, 108, 1);
  if (fillFrom != null) fill(bar, fillFrom);
}

function soloDrumBar(bar, i) {
  const b = bar * 4;
  const c2 = i >= 16;
  // Ride pattern; the skip note falls on the swung offbeat
  [[0, 82], [1, 90], [1.5, 60], [2, 82], [3, 90], [3.5, 60]].forEach(([p, v]) => dr(b + p, 51, v + (c2 ? 6 : 0), 0.5));
  dr(b + 1, 44, 64);
  dr(b + 3, 44, 64);
  const accentedDownbeat = i === 0 || i === 16 || i === 31;
  for (const p of [0, 1, 2, 3]) if (!(p === 0 && accentedDownbeat)) dr(b + p, 36, c2 ? 34 : 26);
  if (i === 0 || i === 16) {
    dr(b, 49, 100, 1.5);
    dr(b, 36, 100);
  }
  if (i === 31) {
    dr(b, 38, 110);
    dr(b, 36, 112);
    dr(b + 1.5, 38, 106);
    dr(b + 1.5, 36, 108);
    fill(bar, 2);
    return;
  }
  if (c2 && i >= 24 && i <= 29) {
    // Rimshots with the horn background stabs
    dr(b + 1.5, 38, 96);
    dr(b + 3.5, 38, 90);
    return;
  }
  // Sparse snare comping, busier in the second chorus
  const offbeats = [0.5, 1.5, 2.5, 3.5];
  const count = c2 ? 2 : i % 2;
  for (let k = 0; k < count; k++) {
    const p = offbeats[Math.floor(rand() * 4)];
    dr(b + p, 38, c2 ? 58 + rand() * 18 : 38 + rand() * 12);
  }
  if (c2 && i % 4 === 3) dr(b + 3.5, 36, 80);
}

// Percussion (GM standard kit: 54 tambourine, 62/63 mute/open high conga, 64 low conga, 82 shaker)
const pc = (beat, pitch, vel) => add(perc, beat, pitch, 0.2, vel, { jitter: 0.008, velJitter: 5 });
function percBar(bar, { shaker = false, tamb = false, congas = "full" } = {}) {
  const b = bar * 4;
  if (shaker) for (let p = 0; p < 4; p += 0.5) pc(b + p, 82, p % 1 === 0 ? 46 : 32);
  if (tamb) for (const p of [1, 3]) pc(b + p, 54, 62);
  if (congas === "full") {
    pc(b + 0.5, 62, 55);
    pc(b + 1.5, 63, 72);
    pc(b + 3, 64, 78);
    pc(b + 3.5, 64, 70);
  } else if (congas === "light") {
    pc(b + 1.5, 63, 48);
    pc(b + 3.5, 64, 54);
  }
}

// ---------------------------------------------------------------------------
// Sections

function intro() {
  for (let u = 0; u < 3; u++) {
    const bar = INTRO + u * 2;
    bassRiff(bar, 29, u === 2 ? 36 : 28);
    grooveBar(bar, "A", { rim: u < 2 });
    grooveBar(bar + 1, "B", { rim: u < 2 });
    percBar(bar, { shaker: u > 0, congas: "full" });
    percBar(bar + 1, { shaker: u > 0, congas: "full" });
    if (u === 2) {
      rhodesRiffUnit(bar);
      guitarRiff(bar, 29);
    }
  }
  bassHits(INTRO + 6);
  keysHits(INTRO + 6);
  guitarHits(INTRO + 6);
  grooveBar(INTRO + 6, "hit1");
  grooveBar(INTRO + 7, "hit2", { fillFrom: 2 });
  percBar(INTRO + 6, { shaker: true, congas: "none" });
  percBar(INTRO + 7, { shaker: true, congas: "none" });
  organPad(INTRO * 4 + 16, 8, "Fm9", 50);
}

function headPass(start, pass, { lastFill = 3 } = {}) {
  const roots = [29, 29, 34];
  const pickups = [28, 33, 36];
  const phrases = [[CALL, 0], [ANSWER, 0], [CALL, 5]];
  for (let u = 0; u < 3; u++) {
    const bar = start + u * 2;
    bassRiff(bar, roots[u], pickups[u]);
    guitarRiff(bar, roots[u]);
    hornPhrase(bar, ...phrases[u]);
    if (pass === 2) tromboneClimb(bar, roots[u]);
    rhodesRiffUnit(bar);
    organPad(bar * 4, 8, chordAt(bar), 52);
    grooveBar(bar, "A", { crash: u === 0 });
    grooveBar(bar + 1, "B");
    percBar(bar, { shaker: true, tamb: true });
    percBar(bar + 1, { shaker: true, tamb: true });
  }
  const h = start + 6;
  bassHits(h);
  hornHits(h);
  keysHits(h);
  guitarHits(h);
  grooveBar(h, "hit1");
  grooveBar(h + 1, "hit2", { fillFrom: lastFill });
  percBar(h, { shaker: true, congas: "none" });
  percBar(h + 1, { shaker: true, congas: "none" });
}

// --- Solo ------------------------------------------------------------------

function parsePitch(name) {
  const m = /^([A-G])(b|#)?(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad pitch ${name}`);
  const pc = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === "b" ? -1 : m[2] === "#" ? 1 : 0);
  return 12 * (Number(m[3]) + 1) + pc;
}

// One string per bar; tokens are pitch/eighths, "r" for rest, ">" for an accent.
const SOLO_LINE = [
  // Chorus 1: lyrical, lots of air
  "r/2 C5/1 Eb5/1 F5/3 r/1",
  "Eb5/1 C5/1 r/6",
  "r/3 Ab4/1 Bb4/1 C5/1 Eb5/2",
  "C5/4 r/4",
  "r/2 G5/2 F5/1 Eb5/1 C5/2",
  "Ab4/4 r/4",
  "r/1 Bb4/1 Db5/1 F5/1 Ab5/2 G5/1 F5/1",
  "E5/2 Db5/1 Bb4/1 Ab4/2 G4/1 E4/1",
  "F4/3 r/1 Db5/1 C5/1 Bb4/1 Ab4/1",
  "Bb4/2 r/6",
  "r/4 Eb5/1 F5/1 Ab5/2",
  "F5/3 Db5/1 Eb5/4",
  "r/2 Bb4/1 C5/1 Db5/1 F5/3",
  "Eb5/2 Db5/2 r/4",
  "r/2 F5/1 Eb5/1 C5/2 Ab4/2",
  "r/1 E5/1 Eb5/1 Db5/1 Bb4/1 Ab4/1 E4/1 G4/1",
  // Chorus 2: bluesier, denser, building to the head
  "Ab4/1 C5/1 Eb5/1 F5/1 Ab5/2 F5/1 Eb5/1",
  "C5/1 B4/1 Bb4/1 Ab4/1 F4/2 r/2",
  "r/1 >F5/1 F5/1 Eb5/1 F5/1 Ab5/1 >Bb5/2",
  "Ab5/1 F5/1 Eb5/1 C5/1 Eb5/2 r/2",
  "G5/1 F5/1 Eb5/1 C5/1 Db5/1 Eb5/1 F5/1 G5/1",
  "Ab5/4 F5/2 r/2",
  "Db5/1 F5/1 Ab5/1 Bb5/1 Ab5/1 F5/1 Db5/1 Bb4/1",
  "Db5/1 E5/1 Ab5/1 Bb5/1 Ab5/1 E5/1 Eb5/1 Db5/1",
  "C5/2 Bb4/1 Db5/1 F5/1 Ab5/1 Bb5/2",
  "Ab5/1 F5/1 Db5/1 Bb4/1 C5/2 r/2",
  "r/1 F5/1 Ab5/1 F5/1 E5/1 Eb5/1 Db5/1 Bb4/1",
  "Db5/2 Bb4/2 r/4",
  "Bb5/2 Ab5/1 F5/1 Db5/1 Bb4/1 C5/1 Db5/1",
  "F5/4 Eb5/2 r/2",
  ">Ab5/2 >Ab5/1 >Ab5/1 >Ab5/2 F5/1 G5/1",
  ">Ab5/1 E5/1 Db5/1 Bb4/1 r/4",
];

function soloTrumpet() {
  SOLO_LINE.forEach((barStr, i) => {
    const bar = SOLO + i;
    let pos = 0;
    const c2 = i >= 16;
    for (const tok of barStr.split(/\s+/)) {
      const [raw, len] = tok.split("/");
      const eighths = Number(len);
      const accent = raw.startsWith(">");
      const name = raw.replace(">", "");
      if (name !== "r") {
        const pitch = parsePitch(name);
        const beats = eighths * 0.5;
        const dur = eighths === 1 ? 0.42 : beats - 0.08;
        const vel = (c2 ? 92 : 76) + (accent ? 14 : 0) + (pitch - 72) * 0.7;
        add(trumpet, bar * 4 + pos * 0.5, pitch, dur, vel, { jitter: 0.012 });
      }
      pos += eighths;
    }
    if (pos !== 8) throw new Error(`solo bar ${i} has ${pos} eighths`);
  });
}

const THIRD = { m: 3, h: 3, M: 4, "7": 4, alt: 4 };
const FIFTH = { m: 7, h: 6, M: 7, "7": 7, alt: 10 };

function soloBass() {
  for (let i = 0; i < 32; i++) {
    const bar = SOLO + i;
    const b = bar * 4;
    const ch = CH[chordAt(bar)];
    const next = CH[chordAt(bar + 1)];
    const r = ch.root;
    const approach = next.root - (i % 2 ? 1 : -1);
    if (i === 31) {
      add(bass, b, 36, 0.45, 116);
      add(bass, b + 1.5, 36, 0.3, 106);
      add(bass, b + 3.5, 28, 0.4, 98);
      continue;
    }
    if (i < 16) {
      // Two-feel, with the riff's octave pop as a reminder every fourth bar
      add(bass, b, r, 1.4, 96);
      if (i % 4 === 0) add(bass, b + 0.5, r + 12, 0.2, 72);
      else add(bass, b + 1.5, r + 7, 0.3, 66);
      add(bass, b + 2, r + FIFTH[ch.q], 1.4, 86);
      add(bass, b + 3.5, approach, 0.45, 78);
    } else {
      // Walking quarters push the second chorus forward
      const up = i % 2 === 0;
      const line = up
        ? [r, r + THIRD[ch.q], r + FIFTH[ch.q], approach]
        : [r + 12, r + 10, r + FIFTH[ch.q], approach];
      const skip = i % 4 === 2;
      line.forEach((n, k) => add(bass, b + k, n, skip && k === 2 ? 0.4 : 0.85, k === 0 ? 100 : 88));
      if (skip) add(bass, b + 2.5, r + FIFTH[ch.q], 0.2, 60); // swung skip
    }
  }
}

function soloKeys() {
  const C1 = [[[1.5, 0.9]], [], [[0, 0.4], [2.5, 0.3]], [[3.5, 0.5]]];
  const C2 = [[[0.5, 0.3], [1.5, 0.3], [3, 0.3]], [[1, 0.25], [2.5, 0.4]], [[0, 0.3], [1.5, 0.3], [3.5, 0.3]], [[2, 0.3], [3.5, 0.4]]];
  for (let i = 0; i < 32; i++) {
    const bar = SOLO + i;
    if (i === 31) {
      stab(rhodes, bar * 4, CH.C7alt.v, 0.45, 96);
      stab(rhodes, bar * 4 + 1.5, CH.C7alt.v, 0.3, 96);
      stab(organ, bar * 4, CH.C7alt.v, 0.45, 80);
      stab(organ, bar * 4 + 1.5, CH.C7alt.v, 0.3, 80);
      continue;
    }
    const pat = (i < 16 ? C1 : C2)[i % 4];
    for (const [p, d] of pat) {
      const chord = p >= 3.5 ? chordAt(bar + 1) : chordAt(bar);
      stab(rhodes, bar * 4 + p, CH[chord].v, d, i < 16 ? 62 : 76);
    }
    // Organ pads span each chord
    if (i === 0 || chordAt(bar) !== chordAt(bar - 1)) {
      let len = 1;
      while (i + len < 31 && chordAt(bar + len) === chordAt(bar)) len++;
      organPad(bar * 4, len * 4, chordAt(bar), i < 16 ? 70 : 80);
    }
  }
}

const BG = {
  Fm11: [56, 63], Dbmaj7s11: [56, 60], Gm7b5: [53, 58], C7alt: [52, 58],
  Bbm11: [53, 56], Gbmaj7: [53, 58], Dbmaj7: [53, 60],
};
function soloBackgrounds() {
  for (let i = 16; i < 32; i++) {
    const bar = SOLO + i;
    const b = bar * 4;
    const name = chordAt(bar);
    const [lo, hi] = BG[name];
    if (i < 24) {
      // Long guide-tone pads, swelling over eight bars
      if (i === 16 || name !== chordAt(bar - 1)) {
        let len = 1;
        while (i + len < 24 && chordAt(bar + len) === name) len++;
        const vel = 58 + (i - 16) * 4;
        add(trombone, b, lo, len * 4 - 0.25, vel, { jitter: 0 });
        add(tenor, b, hi, len * 4 - 0.25, vel, { jitter: 0 });
      }
    } else if (i < 30) {
      // Punches on the and of 2 and the and of 4, anticipating the next chord
      for (const p of [1.5, 3.5]) {
        const [l2, h2] = BG[p === 3.5 ? chordAt(bar + 1) : name];
        add(trombone, b + p, l2, 0.32, 96);
        add(tenor, b + p, h2, 0.32, 94);
      }
    } else if (i === 30) {
      add(trombone, b, lo, 3.6, 104, { jitter: 0 });
      add(tenor, b, hi, 3.6, 104, { jitter: 0 });
    } else {
      for (const [p, d] of [[0, 0.45], [1.5, 0.3]]) {
        add(trombone, b + p, 52, d, 112);
        add(tenor, b + p, 58, d, 110);
      }
    }
  }
}

function solo() {
  soloTrumpet();
  soloBass();
  soloKeys();
  soloBackgrounds();
  for (let i = 0; i < 32; i++) {
    soloDrumBar(SOLO + i, i);
    if (i < 16) percBar(SOLO + i, { congas: "light" });
    else percBar(SOLO + i, { congas: i >= 24 ? "full" : "light", shaker: true, tamb: i >= 24 });
  }
}

// --- Tag ending ----------------------------------------------------------------

function tag() {
  const b0 = TAG * 4;
  // Bar 1: the riff and the call one last time
  bassRiff(TAG, 29, 28);
  guitarRiff(TAG, 29);
  for (const [p, n, d, v] of CALL) {
    add(trumpet, b0 + p, n, d, v);
    add(tenor, b0 + p, n - 12, d, v - 6);
  }
  // Bar 2: everyone joins the bass climb in octaves
  for (const [p, i, d, v] of CLIMB) {
    add(trumpet, b0 + p, 29 + i + 36, d, v);
    add(tenor, b0 + p, 29 + i + 24, d, v - 4);
    add(trombone, b0 + p, 29 + i + 12, d, v);
    stab(rhodes, b0 + p, [29 + i + 24, 29 + i + 36], d, v - 10);
    dr(b0 + p, 36, 104);
    dr(b0 + p, 38, 96 + (p - 4.5) * 8);
  }
  stab(rhodes, b0 + 1.5, CH.Fm9.v, 0.3, 74);
  organPad(b0, 7.5, "Fm9", 60);
  grooveBar(TAG, "A", { crash: true });
  percBar(TAG, { shaker: true, tamb: true });
  for (const p of [4, 4.5]) dr(b0 + p, 42, 70);
  // Bar 3: one hit on Fm6/9 and out
  const h = (TAG + 2) * 4;
  add(bass, h, 29, 0.6, 120);
  add(bass, h, 41, 0.6, 104);
  add(trumpet, h, 77, 0.6, 120);
  add(tenor, h, 68, 0.6, 114);
  add(trombone, h, 62, 0.6, 114);
  add(guitar, h, 65, 0.3, 90);
  stab(rhodes, h, CH.Fm69.v, 0.6, 104);
  stab(organ, h, CH.Fm69.v, 0.6, 90);
  dr(h, 49, 115, 2);
  dr(h, 36, 118);
  dr(h, 38, 112);
  pc(h, 63, 90);
}

// ---------------------------------------------------------------------------

intro();
headPass(HEAD1, 1);
headPass(HEAD1 + 8, 2, { lastFill: 2 });
solo();
headPass(HEAD2, 1);
headPass(HEAD2 + 8, 2, { lastFill: 3 });
tag();

// Organ level rides with the form: quiet under the head, forward in the solo.
organ.automation = [
  {
    type: "controller",
    controller: 11,
    points: [
      { beat: 0, value: 90 },
      { beat: HEAD1 * 4, value: 72 },
      { beat: SOLO * 4, value: 110 },
      { beat: (SOLO + 16) * 4, value: 120 },
      { beat: HEAD2 * 4, value: 72 },
      { beat: TAG * 4, value: 100 },
    ],
  },
];

const tracks = [trumpet, tenor, trombone, rhodes, organ, guitar, bass, drums, perc];
for (const t of tracks) {
  t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  for (const n of t.notes) {
    if (!(n.pitch >= 0 && n.pitch <= 127)) throw new Error(`${t.name}: pitch ${n.pitch}`);
    if (!(n.duration > 0) || !(n.start >= 0)) throw new Error(`${t.name}: bad timing`);
  }
}

const project = {
  title: "Rue Saint-Denis (after Roy Hargrove)",
  comment:
    "Soul-jazz riff tune in F minor inspired by Roy Hargrove's \"Strasbourg / St. Denis\". " +
    "Intro on the bass figure, riff head x2, 32-bar trumpet solo over opened-up harmony, head x2, tag ending.",
  tempo: TEMPO,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 0.9,
  locators: [
    { beat: INTRO * 4, label: "Intro" },
    { beat: HEAD1 * 4, label: "Head" },
    { beat: SOLO * 4, label: "Solo (chorus 1)" },
    { beat: (SOLO + 16) * 4, label: "Solo (chorus 2, backgrounds)" },
    { beat: HEAD2 * 4, label: "Head" },
    { beat: TAG * 4, label: "Tag" },
  ],
  loop: { range: { startBeat: HEAD1 * 4, endBeat: (HEAD1 + 8) * 4 }, enabled: false },
  midiTracks: tracks,
};

// One note per line keeps the file diffable without ballooning it.
const json = JSON.stringify(project, null, 2).replace(
  /\{\s+"pitch": (\d+),\s+"start": ([\d.]+),\s+"duration": ([\d.]+),\s+"velocity": (\d+)\s+\}/g,
  '{ "pitch": $1, "start": $2, "duration": $3, "velocity": $4 }',
);
writeFileSync(new URL("./strasbourg-st-denis.json", import.meta.url), json + "\n");

const payload = deflateRawSync(JSON.stringify(project)).toString("base64url");
writeFileSync(
  new URL("./share-link.txt", import.meta.url),
  `https://toy-midi.hiro18181.workers.dev/draft#p=${payload}\n`,
);

const seconds = (END * 4 * 60) / TEMPO;
console.log(
  `${tracks.map((t) => `${t.name}: ${t.notes.length}`).join(", ")}\n` +
    `length ${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}, ` +
    `json ${json.length} bytes, share link ${payload.length + 50} chars`,
);
