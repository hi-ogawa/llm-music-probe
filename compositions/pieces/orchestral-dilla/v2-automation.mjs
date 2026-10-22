// v2: v1's notes unchanged, plus controller automation and pitch bend.
//
// Usage: node v2-automation.mjs
// Reads orchestral-dilla.json (v1) and writes orchestral-dilla-v2.json. Each track
// keeps its notes as they are, so v1 and v2 differ only in `automation`.
//
// Each value holds until the next point, so a ramp is written as a point every 16th
// of a beat (about 43 ms at 88 BPM). Every sequence starts at beat 0, so the loop
// wrap at beat 160 resets it.
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

const v1 = JSON.parse(readFileSync("orchestral-dilla.json", "utf8"));
const project = structuredClone(v1);
project.comment = `${v1.comment} v2 adds expression (CC11), vibrato (CC1), harp and celesta pedal (CC64), and pitch bend, without changing a note.`;
const T = Object.fromEntries(project.midiTracks.map((t) => [t.name, t]));

const END = 160;
const GRID = 1 / 16;
const BOUNDARIES = [32, 96, 128]; // each has a half-beat dropout before it
const BUILD_BARS = [6, 22, 30]; // first bar of each two-bar build
const sectionOf = (bar) => (bar < 8 ? "A" : bar < 24 ? "B" : bar < 32 ? "C" : bar < 38 ? "D" : "breakdown");
const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
// smooth rise and fall, 0 at t=0, 1 at t=peak, `end` at t=1
const swell = (t, peak, end) => (t < peak ? Math.sin((t / peak) * Math.PI / 2) : lerp(1, end, (t - peak) / (1 - peak)));

// Sample `fn(beat)` on the grid plus `extra` breakpoints, keeping only changes.
function sample(fn, extra = [], { min = 0, max = 127, round = Math.round } = {}) {
  const beats = new Set(extra.map((b) => Math.round(b * 1000) / 1000));
  for (let b = 0; b < END; b += GRID) beats.add(Math.round(b * 1000) / 1000);
  const points = [];
  for (const beat of [...beats].filter((b) => b >= 0 && b < END).sort((a, b) => a - b)) {
    const value = round(Math.min(max, Math.max(min, fn(beat))));
    if (points.length && points.at(-1).value === value) continue;
    points.push({ beat, value });
  }
  return points;
}
const cc = (controller, points) => ({ type: "controller", controller, points });
const bend = (points) => ({ type: "pitch-bend", points: points.map(({ beat, value }) => ({ beat, semitones: value })) });

// the note sounding (or last started) at a beat, for monophonic lines
const noteAt = (notes, beat) => {
  let cur;
  for (const n of notes) if (n.start <= beat + 1e-6) cur = n; else break;
  return cur;
};

// ---- melodic lines: louder toward the top of each phrase, long notes bloom
// and taper, and the last note of a phrase releases.
function melodic(notes, { lo = 92, hi = 114, from = 0, to = END, envelope = () => 1, buildRun = false } = {}) {
  const groups = new Map();
  for (const n of notes) {
    if (n.start < from || n.start >= to) continue;
    const g = Math.floor(n.start / 16);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(n);
  }
  const base = new Map();
  for (const ns of groups.values()) {
    const ps = ns.map((n) => n.pitch);
    const pmin = Math.min(...ps), pmax = Math.max(...ps);
    ns.forEach((n, i) => {
      const inRun = buildRun && BUILD_BARS.includes(Math.floor(n.start / 4) - 1);
      const b = inRun ? lerp(90, 127, i / (ns.length - 1)) : lerp(lo, hi, (n.pitch - pmin) / Math.max(1, pmax - pmin));
      base.set(n, { b, last: i === ns.length - 1 && !inRun });
    });
  }
  return (beat) => {
    const n = noteAt(notes, beat);
    if (!n || !base.has(n)) return null;
    const { b, last } = base.get(n);
    const t = (beat - n.start) / n.duration;
    let v = b;
    if (n.duration >= 0.9) v = t < 0.2 ? b : b + (t < 0.55 ? lerp(0, 10, (t - 0.2) / 0.35) : lerp(10, last ? -30 : -14, (t - 0.55) / 0.45));
    else if (last) v = lerp(b, b - 20, t);
    return v * envelope(beat);
  };
}
// combine section functions; the first that returns a number wins
const first = (...fns) => (beat) => {
  for (const f of fns) { const v = f(beat); if (v != null) return v; }
  return 127;
};

// delayed vibrato on long notes: straight attack, depth arrives after the note settles
const vibrato = (notes, depth) => (beat) => {
  const n = noteAt(notes, beat);
  if (!n || n.duration < 0.9 || beat >= n.start + n.duration) return 0;
  const t = beat - n.start;
  return t < 0.3 ? 0 : lerp(0, typeof depth === "function" ? depth(n.start) : depth, (t - 0.3) / 0.5);
};

// a build's two bars: `from` at the first downbeat to 127 at the dropout
const buildRamp = (from, curve = 1.4) => (beat) => {
  for (const bar of BUILD_BARS) {
    const w = bar * 4;
    if (beat >= w && beat < w + 7.5) return lerp(from, 127, ((beat - w) / 7.5) ** curve);
  }
  return null;
};
const starts = (name) => T[name].notes.map((n) => n.start);
const ends = (name) => T[name].notes.map((n) => n.start + n.duration);
const barLines = Array.from({ length: 41 }, (_, i) => i * 4);
const dropouts = BOUNDARIES.map((b) => b - 0.5);

// ---- Strings (pad): each chord swells and settles, builds crescendo into the
// dropout, and the breakdown fades into the loop seam.
const PAD = { A: [78, 100, 84], B: [88, 108, 92], C: [86, 110, 90], D: [100, 124, 104] };
T["Strings (pad)"].automation = [cc(11, sample(first(
  buildRamp(86),
  (beat) => (beat >= 152 ? lerp(108, 40, ((beat - 152) / 8) ** 0.8) : null),
  (beat) => {
    const [lo, peak, end] = PAD[sectionOf(Math.floor(beat / 4))];
    const t = (beat % 4) / 4;
    return lo + (peak - lo) * swell(t, 0.4, (end - lo) / (peak - lo));
  },
), [...barLines, ...dropouts]))];

// ---- Horns: guide tones swell through each chord (messa di voce), crescendo
// through the build into B's dropout. In C they double the trumpet an octave
// down, shaped like a melody but kept under it.
const hornsC = melodic(T.Horns.notes, { lo: 84, hi: 102, from: 96, to: 128 });
T.Horns.automation = [cc(11, sample(first(
  hornsC,
  (beat) => (beat >= 88 && beat < 95.5 ? lerp(86, 127, ((beat - 88) / 7.5) ** 1.3) : null),
  (beat) => {
    const lo = beat >= 128 ? 100 : 86;
    const t = ((beat % 4) - 0.04) / 3.8;
    return t < 0 ? lo : lo + 24 * swell(Math.min(1, t), 0.5, 4 / 24);
  },
), [...starts("Horns"), ...barLines.map((b) => b + 0.04), ...dropouts]))];

// ---- Melodies
const violinFade = (beat) => (beat >= 152 ? lerp(1, 0.55, (beat - 152) / 8) : 1);
T.Flute.automation = [
  cc(11, sample(first(melodic(T.Flute.notes)), starts("Flute"))),
  cc(1, sample(vibrato(T.Flute.notes, 38), [...starts("Flute"), ...ends("Flute")])),
];
T.Clarinet.automation = [cc(11, sample(first(melodic(T.Clarinet.notes, { lo: 88, hi: 108 })), starts("Clarinet")))];
T["Violins (melody)"].automation = [
  cc(11, sample(first(melodic(T["Violins (melody)"].notes, { lo: 96, hi: 120, envelope: violinFade, buildRun: true })), starts("Violins (melody)"))),
  cc(1, sample(vibrato(T["Violins (melody)"].notes, (s) => (s < 144 ? 50 : 42)), [...starts("Violins (melody)"), ...ends("Violins (melody)")])),
];

// ---- Muted trumpet: straight tone, jazz scoops into long notes and the blue
// A natural, and a fall into the dropout before D.
const tpt = T["Muted Trumpet"].notes;
const SCOOP = 0.2;
const fall = tpt.find((n) => n.start < 127.5 && n.start + n.duration >= 127.45);
const scoops = tpt.filter((n) => n !== fall && (n.duration >= 1.2 || n.pitch === 69));
T["Muted Trumpet"].automation = [
  cc(11, sample(first(melodic(tpt, { lo: 92, hi: 116 })), starts("Muted Trumpet"))),
  bend(sample((beat) => {
    if (fall && beat >= fall.start + 0.15 && beat < 128) return lerp(0, -3, ((beat - fall.start - 0.15) / (127.5 - fall.start - 0.15)) ** 1.6);
    const n = scoops.find((s) => beat >= s.start && beat < s.start + SCOOP);
    return n ? lerp(-1, 0, ((beat - n.start) / SCOOP) ** 0.7) : 0;
  }, [...scoops.flatMap((n) => Array.from({ length: 9 }, (_, i) => n.start + (i * SCOOP) / 8)), 128,
    ...(fall ? Array.from({ length: 13 }, (_, i) => fall.start + 0.15 + (i * (127.5 - fall.start - 0.15)) / 12) : [])],
  { min: -12, max: 12, round: (v) => Math.round(v * 100) / 100 })),
];

// ---- Contrabass: a bow accent with each kick that relaxes over the note, and
// the breakdown's held roots fade with the pad.
const cb = T.Contrabass.notes;
T.Contrabass.automation = [cc(11, sample((beat) => {
  if (beat >= 152) return lerp(105, 40, (beat - 152) / 8);
  const n = noteAt(cb, beat);
  if (!n) return 120;
  return lerp(120, 92, (beat - n.start) / Math.min(n.duration, 1.2));
}, starts("Contrabass")))];

// ---- Tremolo strings: one continuous crescendo under the per-beat re-strikes,
// then each tutti hit decays sforzando-piano.
const hit = (lo) => (beat) => {
  for (const b of BOUNDARIES) if (beat >= b - 0.5 && beat < b + 1.6) return beat < b ? 127 : lerp(127, lo, (beat - b) / 1.5);
  return null;
};
T["Tremolo Strings"].automation = [cc(11, sample(first(buildRamp(70), hit(72), () => 70), [...dropouts, ...BOUNDARIES]))];

// ---- Brass section: the build's 8ths crescendo inside each note too, and the
// tutti chord decays instead of ending as a flat block. D's snare stabs play at
// full level, so the decay resets before the first one.
T["Brass Section"].automation = [cc(11, sample(first(
  (beat) => {
    for (const b of BOUNDARIES) if (beat >= b - 0.5 && beat < b + 0.95) return beat < b ? 127 : lerp(127, 80, (beat - b) / 0.9);
    return null;
  },
  (beat) => {
    for (const bar of BUILD_BARS) {
      const w = (bar + 1) * 4;
      if (beat >= w && beat < w + 3.5) return lerp(72, 127, (beat - w) / 3.5);
    }
    return null;
  },
  () => 127,
), [...dropouts, ...BOUNDARIES, ...BOUNDARIES.map((b) => b + 0.95), ...BUILD_BARS.map((b) => (b + 1) * 4)]))];

// ---- Pedal: harp and celesta ring through each bar in the intro and the
// breakdown, changing with the chord. Elsewhere the harp's answers stay dry.
const pedal = (bars) => {
  const points = [{ beat: 0, value: 0 }];
  for (const bar of bars) {
    const b0 = bar * 4;
    points.push({ beat: b0 + 0.06, value: 127 });
    // up just before the next chord, or at the dropout into B
    points.push({ beat: bar === 7 ? 31.5 : Math.min(b0 + 3.96, END - 0.04), value: 0 });
  }
  return cc(64, points);
};
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// ---- Wow: in the dusty intro and the breakdown, the pad, harp, and celesta
// drift together by a few cents, like a worn record of the sample. Same phase on
// all three, so they stay in tune with each other.
const wowBars = [...range(0, 7), 38, 39];
const wow = bend(sample((beat) => {
  if (!wowBars.includes(Math.floor(beat / 4)) || (beat >= 31.5 && beat < 32)) return 0;
  return 0.06 * Math.sin((beat / 2.5) * 2 * Math.PI) + 0.03 * Math.sin((beat / 0.9) * 2 * Math.PI + 1);
}, [31.5, 32, 152], { min: -12, max: 12, round: (v) => Math.round(v * 100) / 100 }));

T.Harp.automation = [pedal([...range(0, 7), 38, 39]), wow];
T.Celesta.automation = [pedal([...range(4, 7), ...range(36, 39)]), wow];
T["Strings (pad)"].automation.push(wow);

// v1 and v2 must differ only in automation
v1.midiTracks.forEach((t, i) => {
  const { automation, ...rest } = project.midiTracks[i];
  if (!isDeepStrictEqual(t, rest)) throw new Error(`${t.name} changed beyond automation`);
});
for (const t of project.midiTracks) for (const a of t.automation ?? []) {
  if (a.points[0].beat !== 0) throw new Error(`${t.name} sequence does not start at 0`);
  a.points.forEach((p, i) => { if (i && p.beat <= a.points[i - 1].beat) throw new Error(`${t.name} points unsorted`); });
}
writeFileSync("orchestral-dilla-v2.json", JSON.stringify(project, null, 1));
for (const t of project.midiTracks)
  console.log(t.name.padEnd(20), (t.automation ?? []).map((a) => `${a.type === "controller" ? `CC${a.controller}` : "bend"}:${a.points.length}`).join(" "));
