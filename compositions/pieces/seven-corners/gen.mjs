import { deflateRawSync } from "node:zlib";
import { writeFileSync } from "node:fs";

// 7/8: one bar = 7 eighths = 3.5 quarter-note beats. Positions below are in eighths.
const BAR = 3.5;
const at = (bar, e) => (bar - 1) * BAR + e * 0.5;

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const hv = (v) => Math.max(1, Math.min(127, Math.round(v + (rnd() - 0.5) * 8)));

const tracks = { g1: [], g2: [], bass: [], drums: [] };
const put = (t, bar, e, dur, pitch, vel, human = true) =>
  tracks[t].push({ pitch, start: at(bar, e), duration: dur * 0.5, velocity: human ? hv(vel) : vel });

// ---------- harmony ----------
// Hook voicings for Gtr 1: b x y z b2 w, played as (b x)(y z)(b2 y w) = 2+2+3.
const HOOK = {
  A: { b: 57, x: 64, y: 68, z: 71, b2: 61, w: 76 }, // Amaj9
  E: { b: 56, x: 64, y: 66, z: 71, b2: 59, w: 68 }, // E/G# add9
  F: { b: 54, x: 64, y: 69, z: 71, b2: 61, w: 76 }, // F#m11
  B: { b: 47, x: 64, y: 69, z: 73, b2: 59, w: 76 }, // A/B (B11)
  C: { b: 48, x: 55, y: 59, z: 66, b2: 64, w: 71 }, // Cmaj7#11 (bVI)
};
function hook(bar, ch, vel = 1, wOverride) {
  const v = HOOK[ch];
  const w = wOverride ?? v.w;
  const seq = [
    [0, v.b, 3, 100], [1, v.x, 2, 76],
    [2, v.y, 2, 96], [3, v.z, 2, 80],
    [4, v.b2, 2, 98], [5, v.y, 2, 74], [6, w, 2, 84],
  ];
  for (const [e, p, d, accent] of seq) put("g1", bar, e, d, p, accent * vel);
}

// Gtr 2 tapped cells: 16ths grouped 3+3+3+3+2 over the 14 sixteenths of a bar,
// a dotted-eighth pulse against Gtr 1's eighths.
const TAP = {
  A: [[68, 71, 76], [69, 73, 76]],
  E: [[64, 68, 71], [66, 71, 75]],
  F: [[66, 69, 73], [64, 69, 71]],
  B: [[64, 69, 73], [66, 71, 76]],
  C: [[67, 71, 76], [66, 71, 74]],
};
function tap(bar, ch, { vel = 1, oct = 0, reverse = false } = {}) {
  const cells = TAP[ch].map((c) => (reverse ? [...c].reverse() : c));
  const order = [0, 1, 0, 1, 0];
  let s = 0;
  order.forEach((ci, k) => {
    const cell = k === 4 ? cells[ci].slice(0, 2) : cells[ci];
    cell.forEach((p, i) => {
      put("g2", bar, s * 0.5, 0.9, p + oct, (i === 0 ? 92 : 66) * vel);
      s++;
    });
  });
}

// Melodic counter-line bass, (pitch, eighth, dur).
const BASS_A = {
  A: [[33, 0, 2], [40, 2, 2], [37, 4, 1], [35, 5, 1], [33, 6, 1]],
  E: [[32, 0, 2], [35, 2, 2], [40, 4, 1], [39, 5, 1], [37, 6, 1]],
  F: [[30, 0, 2], [33, 2, 2], [37, 4, 1], [40, 5, 1], [42, 6, 1]],
  B: [[35, 0, 3], [42, 3, 1], [40, 4, 1], [37, 5, 1], [35, 6, 1]],
};
const bassLine = (bar, line, vel = 1) =>
  line.forEach(([p, e, d], i) => put("bass", bar, e, d * 0.95, p, (i === 0 ? 100 : 84) * vel));

// Half-time melodic bass for B (3+2+2).
const BASS_B = {
  Cm: [[37, 0, 3], [44, 3, 2], [40, 5, 1], [35, 6, 1]],
  A: [[33, 0, 3], [40, 3, 2], [37, 5, 1], [35, 6, 1]],
  E: [[32, 0, 3], [35, 3, 2], [37, 5, 1], [35, 6, 1]],
  F: [[30, 0, 3], [37, 3, 2], [40, 5, 1], [42, 6, 1]],
};

// Gtr 1 low arpeggio for B, (b x y)(z x)(w y) = 3+2+2.
const ARP_B = {
  Cm: { b: 49, x: 56, y: 63, z: 64, w: 59 },
  A: { b: 45, x: 52, y: 59, z: 61, w: 56 },
  E: { b: 44, x: 52, y: 59, z: 63, w: 54 },
  F: { b: 42, x: 52, y: 57, z: 61, w: 59 },
  B: { b: 47, x: 52, y: 57, z: 61, w: 54 },
};
function arpB(bar, ch) {
  const v = ARP_B[ch];
  const seq = [[0, v.b, 3, 96], [1, v.x, 2, 70], [2, v.y, 2, 72], [3, v.z, 2, 92], [4, v.x, 2, 70], [5, v.w, 2, 90], [6, v.y, 2, 72]];
  for (const [e, p, d, vel] of seq) put("g1", bar, e, d, p, vel);
}

// Gtr 2 for B: four evenly spaced dyads per bar, a 4:7 polyrhythm against the eighths.
const DYAD_B = {
  Cm: [[75, 80], [73, 76], [71, 75], [68, 73]],
  A: [[76, 80], [73, 76], [71, 76], [69, 73]],
  E: [[75, 78], [71, 76], [68, 75], [71, 75]],
  F: [[76, 81], [73, 76], [71, 76], [69, 73]],
  B: [[76, 81], [73, 78], [71, 76], [73, 78]],
};
function dyadB(bar, ch) {
  DYAD_B[ch].forEach((pair, i) =>
    pair.forEach((p) => put("g2", bar, i * 1.75, 1.6, p, i === 0 ? 86 : 72)));
}

// The riff, 2+3+2 with the sixth eighth left empty. Offsets from the root.
const RIFF = [0, 12, 7, 5, 7, null, 4];
function riff(bar, root, { offsets = RIFF, vel = 1 } = {}) {
  // root is the bass pitch; Gtr 1 doubles an octave up in octave dyads, Gtr 2 two octaves up.
  offsets.forEach((o, e) => {
    if (o === null) return;
    const acc = [0, 2, 6].includes(e) ? 112 : 96;
    const d = e === 1 ? 0.6 : 0.9;
    put("bass", bar, e, d, root + o, acc * vel);
    put("g1", bar, e, d, root + 12 + o, acc * vel);
    put("g1", bar, e, d, root + 24 + o, (acc - 10) * vel);
    put("g2", bar, e, d, root + 36 + o, (acc - 6) * vel);
  });
}

// Block-chord hits for stop-time and cadences.
const HIT = {
  E: { g1: [40, 47, 52, 56, 59, 66], g2: [64, 71, 76, 78], bass: 28 },
  D: { g1: [50, 57, 62, 66, 69], g2: [62, 69, 74, 76], bass: 38 },
  C: { g1: [48, 55, 60, 64, 67], g2: [60, 67, 72, 74], bass: 36 },
};
function hit(bar, e, ch, dur, vel = 118) {
  const h = HIT[ch];
  h.g1.forEach((p) => put("g1", bar, e, dur, p, vel - 8));
  h.g2.forEach((p) => put("g2", bar, e, dur, p, vel - 12));
  put("bass", bar, e, dur, h.bass, vel);
}

// ---------- drums (GM) ----------
const K = 36, S = 38, HH = 42, PH = 44, OH = 46, CR = 49, CR2 = 57, RD = 51, BELL = 53;
const T_HI = 50, T_MH = 48, T_ML = 47, T_LO = 45, T_FL = 41;
const d = (bar, e, p, vel) => put("drums", bar, e, 0.5, p, vel);

function grooveA(bar, { crash = false, fill = false } = {}) {
  if (crash) d(bar, 0, CR, 110);
  for (let e = 0; e < 7; e++) if (!(crash && e === 0) && !(fill && e >= 4)) d(bar, e, HH, [0, 2, 4].includes(e) ? 92 : 62);
  d(bar, 0, K, 112); d(bar, 4, K, 100); d(bar, 3.5, K, 70);
  d(bar, 2, S, 110);
  d(bar, 1.5, S, 34); d(bar, 3, S, 30);
  if (fill) {
    [[4, T_HI], [4.5, T_HI], [5, T_MH], [5.5, T_ML], [6, T_LO], [6.5, T_FL]].forEach(([e, p], i) => d(bar, e, p, 82 + i * 6));
  } else {
    d(bar, 5, S, 106); d(bar, 6, S, 40); d(bar, 6.5, S, 48);
  }
}

function grooveB(bar, { crash = false, fill = false } = {}) {
  d(bar, 0, crash ? CR : RD, crash ? 108 : 90);
  [1, 2, 4, 6].forEach((e) => d(bar, e, RD, 58));
  d(bar, 3, BELL, 88); d(bar, 5, BELL, 80);
  d(bar, 0, K, 110); d(bar, 2, K, 78); d(bar, 5.5, K, 84);
  d(bar, 3, S, 116); // the one backbeat per bar: half-time
  d(bar, 4.5, S, 30); d(bar, 1.5, S, 26);
  d(bar, 5, PH, 60);
  if (fill) [5, 5.5, 6, 6.5].forEach((e, i) => d(bar, e, S, 60 + i * 14));
  else d(bar, 6.5, S, 38);
}

function buildRoll(bar) {
  for (let e = 0; e < 7; e++) d(bar, e, K, 78 + e * 5);
  [0, 1, 2].forEach((e, i) => d(bar, e, S, 58 + i * 8));
  for (let i = 0; i < 8; i++) d(bar, 3 + i * 0.5, S, 84 + i * 5);
}

function grooveC(bar, { crash = false, fill = false } = {}) {
  if (crash) d(bar, 0, CR, 118);
  for (let e = 0; e < 7; e++) {
    if (crash && e === 0) continue;
    if (fill && e >= 5) continue;
    d(bar, e, [0, 2, 5].includes(e) ? BELL : RD, [0, 2, 5].includes(e) ? 98 : 72);
  }
  d(bar, 0, K, 120); d(bar, 2, K, 110); d(bar, 3, K, 92);
  d(bar, 1, S, 108); d(bar, 4, S, 124);
  if (fill) {
    [[5, T_HI], [5.5, T_MH], [6, T_LO], [6.5, T_FL]].forEach(([e, p], i) => d(bar, e, p, 96 + i * 8));
    d(bar, 6, K, 100);
  } else {
    d(bar, 6, S, 104); d(bar, 5.5, S, 40); d(bar, 6, K, 88);
  }
}

// F: double-time over 2+2+3, snare on the second pulse of every group.
function grooveF(bar, { crash = false } = {}) {
  if (crash) d(bar, 0, CR, 118);
  for (let e = 0; e < 7; e++) {
    if (crash && e === 0) continue;
    d(bar, e, [0, 2, 4].includes(e) ? BELL : RD, [0, 2, 4].includes(e) ? 98 : 70);
  }
  d(bar, 0, K, 120); d(bar, 2, K, 96); d(bar, 4, K, 112); d(bar, 6, K, 84);
  d(bar, 1, S, 112); d(bar, 3, S, 114); d(bar, 5, S, 118);
  d(bar, 2.5, S, 36); d(bar, 6.5, S, 44); d(bar, 4.5, S, 32);
}

// ---------- arrangement ----------
const PROG = ["A", "E", "F", "B"];

// 1-4 Intro: Gtr 1 alone, hook. Drum pickup fill in the last group of bar 4.
PROG.forEach((ch, i) => hook(1 + i, ch, 0.85));
[[4, T_HI], [4.5, T_MH], [5, T_MH], [5.5, T_ML], [6, T_LO], [6.5, T_FL]].forEach(([e, p], i) => d(4, e, p, 58 + i * 8));

// 5-12 A: interlock. Gtr 1 hook, Gtr 2 tapped 3/16 cells, melodic bass, groove with ghosts.
for (let i = 0; i < 8; i++) {
  const bar = 5 + i, ch = PROG[i % 4];
  hook(bar, ch, 1, bar === 12 ? 78 : undefined); // last statement breaks the pattern up to F#5
  tap(bar, ch, { reverse: bar >= 9 }); // second pass: cells descend instead of ascend
  bassLine(bar, BASS_A[ch]);
  grooveA(bar, { crash: bar === 5 || bar === 9, fill: bar === 8 || bar === 12 });
}

// 13-20 B: regroup to 3+2+2, half-time, 4:7 between the guitars.
const PROG_B = ["Cm", "A", "E", "F", "Cm", "A", "F", "B"];
PROG_B.forEach((ch, i) => {
  const bar = 13 + i;
  arpB(bar, ch);
  dyadB(bar, ch);
  if (bar < 20) {
    bassLine(bar, BASS_B[ch]);
    grooveB(bar, { crash: bar === 13 || bar === 17, fill: bar === 16 });
  } else {
    // Bar 20: B pedal in eighths with a crescendo under the build roll.
    for (let e = 0; e < 7; e++) put("bass", bar, e, 0.9, 35, 72 + e * 7);
    buildRoll(bar);
  }
});

// 21-25 C: the riff in octave and unison doubling, double-time, 2+3+2.
riff(21, 28);
riff(22, 28, { offsets: [0, 12, 7, 5, 7, null, 11] }); // loop mutation: lifts to D#
riff(23, 36, { offsets: [0, 12, 7, 6, 7, null, 4] }); // C Lydian, bVI
riff(24, 38, { offsets: [0, 12, 7, 6, 7, null, 4] }); // D Lydian, bVII
riff(25, 28, { offsets: [0, 12, 7, 5, 7, null, 11] });
grooveC(21, { crash: true }); grooveC(22); grooveC(23, { crash: true }); grooveC(24, { fill: true }); grooveC(25, { crash: true });

// 26 cadence hits bVI bVI bVII, 27 the tonic rings out (false ending), 28 silence.
hit(26, 0, "C", 1); hit(26, 2, "C", 1.5); hit(26, 5, "D", 2);
[0, 2].forEach((e) => { d(26, e, CR, 118); d(26, e, K, 122); d(26, e, S, 116); });
d(26, 5, K, 120); d(26, 5, S, 110);
[5.5, 6, 6.5].forEach((e, i) => d(26, e, S, 80 + i * 18));
hit(27, 0, "E", 7, 124);
d(27, 0, CR, 127); d(27, 0, CR2, 120); d(27, 0, K, 127);

// 29-32 E: Gtr 2 alone, then a density build back.
PROG.forEach((ch, i) => tap(29 + i, ch, { vel: 0.78 }));
[30, 31].forEach((bar) => { for (let e = 0; e < 7; e++) d(bar, e, HH, [0, 2, 4].includes(e) ? 56 : 38); });
bassLine(31, BASS_A.F, 0.85);
bassLine(32, BASS_A.B, 0.95);
hook(32, "B", 0.9);
for (let i = 0; i < 14; i++) {
  const toms = [T_HI, T_HI, T_MH, T_MH, T_ML, T_ML, T_LO, T_LO, T_FL, T_FL, S, S, S, S];
  d(32, i * 0.5, toms[i], 64 + i * 4);
}
[0, 2, 4, 6].forEach((e) => d(32, e, K, 90 + e * 4));

// 33-36 F: climax. Gtr 1 hook, Gtr 2 tapping an octave up, riff bass, double-time.
// Bar 36 swaps B11 for Cmaj7#11.
const PROG_F = ["A", "E", "F", "C"];
const ROOT_F = { A: 33, E: 32, F: 30, C: 36 };
PROG_F.forEach((ch, i) => {
  const bar = 33 + i, r = ROOT_F[ch];
  hook(bar, ch, 1.12);
  tap(bar, ch, { oct: 12, vel: 1.05 });
  [[0, r], [1, r + 12], [2, r + 7], [3, r + 12], [4, r], [5, r + 7], [6, r + 10]].forEach(([e, p]) =>
    put("bass", bar, e, e % 2 ? 0.6 : 0.9, p, [0, 2, 4].includes(e) ? 112 : 88));
  grooveF(bar, { crash: bar === 33 || bar === 35 });
});
// Fill out of 36: replace the last group with a snare-to-tom run.
tracks.drums = tracks.drums.filter((n) => !(n.start >= at(36, 4) && n.start < at(37, 0) && n.pitch !== K));
[[4, S], [4.5, S], [5, T_HI], [5.5, T_MH], [6, T_LO], [6.5, T_FL]].forEach(([e, p], i) => d(36, e, p, 92 + i * 6));

// 37 the riff once more in full doubling, 38 stop-time hits E D C, then silence.
riff(37, 28);
grooveC(37, { crash: true });
hit(38, 0, "E", 1, 124); hit(38, 2, "D", 1, 118); hit(38, 4, "C", 1.5, 122);
[0, 2, 4].forEach((e) => { d(38, e, CR, 120); d(38, e, K, 124); d(38, e, S, 112); });

// 39-40 Outro: Gtr 1 alone with the second half of the hook, which leads into bar 1.
hook(39, "F", 0.8);
hook(40, "B", 0.75);

// ---------- project ----------
const E_MAJOR = { fifths: 4, mode: "major" };
const project = {
  title: "Seven Corners (math rock, 7/8)",
  comment: "Instrumental math rock in 7/8. Gtr 1 left, Gtr 2 right. Loops bar 40 back into bar 1.",
  tempo: 144,
  timeSignature: { numerator: 7, denominator: 8 },
  loop: { range: { startBeat: 0, endBeat: 40 * BAR }, enabled: true },
  locators: [
    [1, "Intro: Gtr 1 hook"], [5, "A: interlock"], [13, "B: half-time 3+2+2"], [20, "Build"],
    [21, "C: riff 2+3+2"], [26, "Cadence"], [27, "False ending"], [29, "Gtr 2 alone"],
    [33, "Climax"], [37, "Riff"], [38, "Stop"], [39, "Outro: Gtr 1"],
  ].map(([bar, label]) => ({ beat: at(bar, 0), label })),
  midiTracks: [
    { name: "Gtr 1 (clean, L)", program: 27, gain: 1.0, pan: -0.6, muted: false, soloed: false, keySignature: E_MAJOR, notes: tracks.g1 },
    { name: "Gtr 2 (clean, R)", program: 27, gain: 0.8, pan: 0.6, muted: false, soloed: false, keySignature: E_MAJOR, notes: tracks.g2 },
    { name: "Bass", program: 33, gain: 0.95, pan: 0, muted: false, soloed: false, keySignature: E_MAJOR, notes: tracks.bass },
    { name: "Drums (Room)", program: 8, bank: 128, gain: 0.7, pan: 0, muted: false, soloed: false, notes: tracks.drums },
  ],
};

for (const t of project.midiTracks) {
  t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  // Trim ringing notes so they end before the same pitch restarts and before the loop point.
  const end = 40 * BAR;
  for (const [i, n] of t.notes.entries()) {
    const next = t.notes.slice(i + 1).find((m) => m.pitch === n.pitch);
    if (next && next.start < n.start + n.duration) n.duration = next.start - n.start - 0.02;
    if (n.start + n.duration > end) n.duration = end - n.start;
  }
  for (const n of t.notes) {
    n.start = +n.start.toFixed(4);
    n.duration = +n.duration.toFixed(4);
  }
}

const json = JSON.stringify(project);
writeFileSync(new URL("./project.json", import.meta.url), JSON.stringify(project, null, 1));
const payload = deflateRawSync(json).toString("base64url");
const link = `https://toy-midi.hiro18181.workers.dev/draft#p=${payload}`;
writeFileSync(new URL("./link.txt", import.meta.url), link);
console.log(project.midiTracks.map((t) => `${t.name}: ${t.notes.length} notes`).join("\n"));
console.log("link length", link.length);
