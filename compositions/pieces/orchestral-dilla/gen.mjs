import { writeFileSync } from "node:fs";

// deterministic humanize
let seed = 1974;
const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const jit = (a) => (rnd() * 2 - 1) * a;
const r3 = (x) => Math.round(x * 1000) / 1000;
const clampV = (v) => Math.max(1, Math.min(127, Math.round(v)));

// harmony: loop1 in Db (IV - iii - ii - V), loop2 in Bb minor flip
const L1 = [
  { root: 42, v: [58, 61, 65, 68] }, // Gbmaj9
  { root: 41, v: [56, 60, 63, 68] }, // Fm7
  { root: 39, v: [54, 58, 61, 65] }, // Ebm9
  { root: 44, v: [54, 60, 63, 65] }, // Ab13
];
const L2 = [
  { root: 46, v: [56, 60, 61, 65] }, // Bbm9
  { root: 42, v: [58, 60, 61, 65] }, // Gbmaj7#11
  { root: 39, v: [54, 58, 61, 65] }, // Ebm9
  { root: 41, v: [57, 60, 63, 66] }, // F7b9
];
// sections in bars (0-based): A 0-7, B 8-23, C 24-31, D 32-39
const sectionOf = (bar) => (bar < 8 ? "A" : bar < 24 ? "B" : bar < 32 ? "C" : "D");
const chordAtBar = (bar) => (sectionOf(bar) === "C" ? L2 : L1)[bar % 4];
const chordAt = (beat) => chordAtBar(Math.floor(beat / 4) % 40);

const T = {};
const track = (name, program, opts = {}) => (T[name] = { name, program, ...opts, notes: [] });
const add = (name, start, pitch, duration, velocity) => {
  start = Math.max(0, start);
  T[name].notes.push({ pitch, start: r3(start), duration: r3(Math.max(0.05, duration)), velocity: clampV(velocity) });
};

track("Flute", 73, { gain: 0.9, pan: 0.25 });
track("Muted Trumpet", 59, { gain: 0.85, pan: -0.1 });
track("Violins (melody)", 40, { gain: 0.85, pan: -0.35 });
track("Clarinet", 71, { gain: 0.6, pan: 0.15 });
track("Horns", 60, { gain: 0.6, pan: 0.3 });
track("Brass Section", 61, { gain: 0.5, pan: 0 });
track("Celesta", 8, { gain: 0.55, pan: 0.4 });
track("Harp", 46, { gain: 0.7, pan: -0.45 });
track("Strings (chops)", 48, { gain: 0.7, pan: -0.15 });
track("Strings (pad)", 49, { gain: 0.45, pan: 0.1 });
track("Tremolo Strings", 44, { gain: 0.55, pan: -0.2 });
track("Pizz (hats)", 45, { gain: 0.5, pan: 0.5 });
track("Pizz (backbeat)", 45, { gain: 0.8, pan: 0.05 });
track("Pizz Basses (kick)", 45, { gain: 1.0, pan: 0 });
track("Contrabass", 43, { gain: 0.75, pan: 0 });
track("Timpani", 47, { gain: 0.7, pan: 0.2 });

// ---- melodies (beat offsets within a 4-bar phrase; .08/.58 = laid back)
const P1 = [[0.58,73,.4],[1,77,1],[2.08,75,.4],[2.5,73,1.3],[4.5,72,.5],[5,75,.5],[5.58,80,1.9],[8.5,78,.5],[9.08,77,.4],[9.5,73,.5],[10.08,70,1.5],[12.75,72,.25],[13,75,.5],[13.5,77,1],[14.75,75,.6]];
const P2 = [[0.5,80,.5],[1.08,82,.4],[1.5,80,.5],[2,77,1.5],[3.58,75,.4],[4.08,77,.4],[4.5,75,.5],[5,72,2],[8.5,73,.5],[9,75,.5],[9.58,77,.4],[10,78,.5],[10.5,77,1.25],[12.5,75,.5],[13.08,72,.4],[13.5,68,2.3]];
const PC = [[0.75,65,.25],[1,68,.75],[1.83,70,1.2],[3.5,68,.4],[4.08,65,.5],[4.58,72,1.5],[6.5,70,.4],[7,65,.8],[8.5,66,.4],[9,65,.4],[9.5,61,.5],[10.08,63,1.5],[12,69,.5],[12.58,72,.4],[13,75,.75],[14,73,.5],[14.5,72,.5],[15,69,.9]];
const phrase = (name, at, P, { shift = 0, vel = 80, fade = 0 } = {}) =>
  P.forEach(([s, p, d], i) => add(name, at + s + jit(0.015), p + shift, d, vel - fade * (i / P.length) + jit(6)));

// A: celesta hints at the hook through the dust
phrase("Celesta", 16, P1, { shift: 12, vel: 50 });
// B: groove alone for 4 bars, then the hook
phrase("Flute", 48, P1, { vel: 82 });
phrase("Flute", 64, P2, { vel: 86 });
phrase("Flute", 80, P1, { vel: 92 });
phrase("Clarinet", 80, P1, { shift: -12, vel: 70 });
// C: the flip, muted trumpet, horns answer the second time
phrase("Muted Trumpet", 96, PC, { vel: 88 });
phrase("Muted Trumpet", 112, PC, { vel: 94 });
phrase("Horns", 112, PC, { shift: -12, vel: 62 });
// D: everyone sings the hook, then it dissolves back into the intro
phrase("Violins (melody)", 128, P1, { vel: 100 });
phrase("Flute", 128, P1, { shift: 12, vel: 78 });
phrase("Violins (melody)", 144, P2, { vel: 98, fade: 40 });
phrase("Celesta", 144, P2, { shift: 12, vel: 55 });

// ---- per-bar parts
const kickVariants = [[0, 1.75, 2.5], [0, 0.75, 2.25, 3.5], [0, 1.75, 2.5, 3], [0, 2.5, 2.75, 3.75]];
const kickHalf = [[0, 2.75], [0, 0.75, 2.75, 3.5]];
for (let bar = 0; bar < 40; bar++) {
  const S = sectionOf(bar);
  const b0 = bar * 4;
  const ch = chordAtBar(bar);
  const next = chordAtBar((bar + 1) % 40);
  const inBuild = bar === 7 || bar === 23 || bar === 31;
  const preBuild = bar === 6 || bar === 22 || bar === 30;
  const breakdown = bar >= 38;

  // pad
  if (S === "A" || (S === "B" && bar >= 16) || S === "C" || S === "D") {
    const vel = S === "A" ? 48 : S === "D" && !breakdown ? 70 : breakdown ? 50 - (bar - 38) * 10 : 55;
    ch.v.forEach((p) => add("Strings (pad)", b0 + 0.02 + jit(0.02), p, 3.9, vel + jit(4)));
  }

  // harp: rolled arpeggios in A and the breakdown, chord chops elsewhere
  if (S === "A" || breakdown) {
    const ps = [ch.root + 12, ...ch.v, ch.v[3] + 12];
    ps.forEach((p, i) => add("Harp", b0 + i * 0.25 + jit(0.01), p, 1.5, 62 + i * 3 + jit(5)));
    [...ps].reverse().slice(1, 4).forEach((p, i) => add("Harp", b0 + 2.5 + i * 0.33, p, 1, 50 + jit(5)));
  } else if (bar % 2 === 1 || S === "C") {
    ch.v.forEach((p, i) => add("Harp", b0 + 2.5 + i * 0.03, p + 12, 1.2, 58 + jit(5)));
  }

  // sample chops on string ensemble
  if (S !== "A" && !breakdown) {
    const rhythm = S === "C"
      ? [[0, 0.6], [0.75, 0.5], [1.5, 1.0], [3.25, 0.6]]
      : [[0, 1.4], [1.55, 0.4], [2.75, 1.1]];
    const vel = S === "D" ? 92 : 76;
    rhythm.forEach(([s, d], k) => {
      const c = s >= 3.25 && S === "C" ? next : ch; // chop of the next chord, pushed early
      c.v.forEach((p) => add("Strings (chops)", b0 + s + jit(0.012), p, d, vel - k * 6 + jit(5)));
      if (S === "D") add("Strings (chops)", b0 + s + jit(0.012), c.v[3] + 12, d, vel - 10);
    });
  }

  // kick = low pizz basses (+ timpani in D), slightly early, Dilla-drunk
  const kicksOn = (S === "A" && bar >= 4) || (S !== "A" && !breakdown);
  if (kicksOn) {
    let ks = S === "A" ? [0, 2.5] : S === "C" ? kickHalf[bar % 2] : kickVariants[bar % 4];
    if (inBuild) ks = [0, 1.75, 2.5];
    const kv = S === "A" ? 70 : S === "D" ? 112 : 104;
    ks.forEach((k, i) => {
      const root = k >= 3.5 ? next.root : ch.root;
      const t = b0 + k - 0.02 + jit(0.015);
      add("Pizz Basses (kick)", t, root, 0.35, (k === 0 ? kv : kv - 14) + jit(5));
      add("Pizz Basses (kick)", t, root - 12, 0.35, (k === 0 ? kv : kv - 14) - 10);
      if (S === "D") add("Timpani", t, root, 0.6, (k === 0 ? 100 : 82) + jit(5));
      // contrabass sustains under the kick until the next one
      const nk = ks[i + 1] ?? 4;
      add("Contrabass", t, root, nk - k - 0.06, (S === "A" ? 58 : 82) + jit(4));
    });
  } else if (breakdown) {
    add("Contrabass", b0, ch.root, 3.8, 50 - (bar - 38) * 12);
  }

  // backbeat = pizz chord dragged late (half-time in C)
  if ((S === "B" || S === "C" || S === "D") && !breakdown) {
    const beats = S === "C" ? [2] : [1, 3];
    beats.forEach((bb) => {
      const t = b0 + bb + 0.065 + jit(0.012);
      ch.v.slice(0, 3).forEach((p) => add("Pizz (backbeat)", t, p, 0.25, 104 + jit(6)));
      add("Pizz (backbeat)", t, ch.root + 12, 0.25, 96);
      if (S === "D") ch.v.forEach((p) => add("Brass Section", t + 0.01, p - 12 >= 48 ? p - 12 : p, 0.18, 88 + jit(5)));
    });
    // ghost before the 4 in B/D
    if (S !== "C" && bar % 2 === 1) add("Pizz (backbeat)", b0 + 3.81, ch.v[1], 0.15, 52);
  }

  // hats = high pizz violins, swung 16ths (triplet feel in C)
  if ((S === "B" || S === "C" || S === "D") && !breakdown) {
    const hp = [ch.v[3] + 12, ch.v[2] + 12];
    if (S === "C") {
      for (let i = 0; i < 12; i++) {
        const strong = i % 3 === 0;
        if (!strong && rnd() < 0.3) continue;
        add("Pizz (hats)", b0 + i / 3 + 0.02 + jit(0.01), hp[strong ? 0 : 1], 0.15, (strong ? 78 : 44) + jit(6));
      }
    } else {
      for (let i = 0; i < 16; i++) {
        const eighth = i % 2 === 0;
        if (!eighth && !inBuild && rnd() < 0.55) continue;
        const swing = eighth ? 0 : 0.07;
        const accent = i % 4 === 2 ? 8 : 0;
        const ramp = inBuild ? (i / 16) * 30 : 0;
        add("Pizz (hats)", b0 + i * 0.25 + swing + jit(0.012), hp[eighth ? 0 : 1], 0.15, (eighth ? 70 + accent : 40) + ramp + jit(6));
      }
    }
  }

  // horns: guide-tone lines in late B and D
  if ((S === "B" && bar >= 16) || (S === "D" && !breakdown)) {
    const lo = [58, 56, 54, 54][bar % 4], hi = [61, 60, 58, 60][bar % 4];
    const v = S === "D" ? 80 : 60;
    add("Horns", b0 + 0.04, lo, 3.8, v + jit(4));
    add("Horns", b0 + 0.04, hi, 3.8, v - 4 + jit(4));
  }

  // celesta dust in the breakdown
  if (breakdown) [3.5, 3.75].forEach((s, i) => add("Celesta", b0 + s, ch.v[3 - i] + 24, 0.5, 40));

  // ---- build-ups (pre-build bar + build bar)
  if (preBuild || inBuild) {
    // timpani roll on each bar's root, crescendo
    const start = preBuild ? 0 : 0;
    for (let s = start; s < 4; s += 0.125) {
      const g = preBuild ? s / 8 : (4 + s) / 8;
      if (inBuild && s >= 3.5) break;
      add("Timpani", b0 + s, ch.root, 0.12, 22 + g * 95 + jit(3));
    }
    // tremolo strings re-articulated each beat, rising
    for (let s = 0; s < 4; s++) {
      if (inBuild && s === 3) {
        ch.v.forEach((p) => add("Tremolo Strings", b0 + 3, p + 12, 0.5, 115));
        continue;
      }
      const g = (preBuild ? s : 4 + s) / 8;
      ch.v.forEach((p) => add("Tremolo Strings", b0 + s, p + (g > 0.5 ? 12 : 0), 1, 35 + g * 80));
    }
  }
  if (inBuild) {
    // violin run into the boundary, brass swells in 8ths
    const run = S === "C" ? [57, 58, 60, 61, 63, 65, 66, 69] : [56, 58, 60, 61, 63, 65, 66, 68];
    run.forEach((p, i) => add("Violins (melody)", b0 + 1.5 + i * 0.25, p + 12, 0.24, 70 + i * 6));
    for (let i = 0; i < 7; i++) ch.v.forEach((p) => add("Brass Section", b0 + i * 0.5, p, 0.4, 45 + i * 11));
  }
}

// dropout: half a beat of silence before each boundary, then a tutti downbeat
for (const boundary of [32, 96, 128]) {
  for (const t of Object.values(T)) {
    t.notes = t.notes.filter((n) => n.start < boundary - 0.5 || n.start >= boundary);
    for (const n of t.notes) if (n.start < boundary - 0.5 && n.start + n.duration > boundary - 0.5) n.duration = r3(boundary - 0.5 - n.start);
  }
  const ch = chordAt(boundary);
  const loud = boundary === 32 ? 90 : 118;
  add("Timpani", boundary - 0.02, ch.root, 1.5, loud);
  add("Timpani", boundary - 0.02, ch.root + 12, 1.5, loud - 15);
  ch.v.forEach((p) => add("Brass Section", boundary, p, 1.2, loud - 8));
  add("Brass Section", boundary, ch.root, 1.2, loud - 8);
  ch.v.forEach((p) => add("Tremolo Strings", boundary, p + 12, 1.5, loud - 20));
}

for (const t of Object.values(T)) t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);

const project = {
  title: "Orchestral Dilla",
  comment: "No drums: low pizz basses + timpani are the kick, a late pizz chord is the snare, swung high pizz are the hats, string ensemble chops are the sample. Db: Gbmaj9 - Fm7 - Ebm9 - Ab13. Flip in Bb minor: Bbm9 - Gbmaj7#11 - Ebm9 - F7b9.",
  tempo: 88,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { enabled: true, range: { startBeat: 0, endBeat: 160 } },
  locators: [
    { beat: 0, label: "A: dusty intro" },
    { beat: 32, label: "B: beat drops" },
    { beat: 96, label: "C: the flip" },
    { beat: 128, label: "D: tutti" },
    { beat: 152, label: "breakdown" },
  ],
  midiTracks: Object.values(T).map((t) => ({ ...t, keySignature: { fifths: -5, mode: "major" } })),
};
writeFileSync("orchestral-dilla.json", JSON.stringify(project, null, 1));
const total = project.midiTracks.reduce((a, t) => a + t.notes.length, 0);
console.log("tracks", project.midiTracks.length, "notes", total);
for (const t of project.midiTracks) console.log(t.name.padEnd(20), t.notes.length);
