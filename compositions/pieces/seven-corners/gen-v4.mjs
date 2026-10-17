import { writeFileSync } from "node:fs";

// v4: v3 leaning into fusion. Rhodes carries the harmony with extended voicings and anticipations,
// piano keeps the riff and hits, a drawbar organ pads B and the climax, the guitars step back, and
// the riff is back on ride bell.
// 7/8: one bar = 7 eighths = 14 sixteenths = 3.5 quarter-note beats. `e` is in eighths, so a
// sixteenth position s is e = s / 2.
const BAR = 3.5;
const TEMPO = 144;
const at = (bar, e) => (bar - 1) * BAR + e * 0.5;
const msToBeats = (ms) => (ms / 1000) * (TEMPO / 60);

let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const hv = (v) => Math.max(1, Math.min(127, Math.round(v + (rnd() - 0.5) * 8)));

const tracks = { g1: [], g1m: [], g1d: [], g2: [], g2d: [], pno: [], rh: [], org: [], bass: [], drums: [], tpt: [] };
// `shift` is an extra offset in ms, used for rakes and flams. Humanisation is applied at the end.
const put = (t, bar, e, dur, pitch, vel, shift = 0) =>
  tracks[t].push({ pitch, start: at(bar, e) + msToBeats(shift), duration: dur * 0.5, velocity: hv(vel) });
const put16 = (t, bar, s, dur16, pitch, vel, shift = 0) => put(t, bar, s / 2, dur16 / 2, pitch, vel, shift);

// ---------- Gtr 1 hook ----------
const HOOK = {
  A: { b: 57, x: 64, y: 68, z: 71, b2: 61, w: 76 }, // Amaj9
  E: { b: 56, x: 64, y: 66, z: 71, b2: 59, w: 68 }, // E/G# add9
  F: { b: 54, x: 64, y: 69, z: 71, b2: 61, w: 76 }, // F#m11
  B: { b: 47, x: 64, y: 69, z: 73, b2: 59, w: 76 }, // A/B (B11)
  C: { b: 48, x: 55, y: 59, z: 66, b2: 64, w: 71 }, // Cmaj7#11 (bVI)
};
// feel "T": tail 1+1+1 (2+2+1+1+1). feel "L": tail 1.5+1.5 (4+4+3+3 in sixteenths).
// Notes let ring well past the next note, like open strings. The trim pass at the end cuts a
// note only when the same pitch restarts.
function hook(bar, ch, feel, vel = 1, wOverride) {
  const v = HOOK[ch];
  const w = wOverride ?? v.w;
  const seq =
    feel === "T"
      ? [[0, v.b, 14, 100], [2, v.x, 8, 74], [4, v.y, 8, 96], [6, v.z, 8, 78], [8, v.b2, 6, 98], [10, v.y, 4, 72], [12, w, 8, 86]]
      : [[0, v.b, 14, 100], [2, v.x, 8, 74], [4, v.y, 8, 96], [6, v.z, 8, 78], [8, v.b2, 6, 100], [11, w, 10, 98]];
  for (const [s, p, d, accent] of seq) put16("g1", bar, s, d, p, accent * vel);
}

// Muted dead-string chucks on Gtr 1's side, in the gaps before the pulses.
const DEAD = [50, 55, 59];
function chucks(bar, positions, vel = 72) {
  for (const s of positions) DEAD.forEach((p, i) => put16("g1m", bar, s, 0.6, p, vel - i * 4, i * 4));
}

// ---------- Gtr 2 ----------
const TAP = {
  A: [[68, 71, 76], [69, 73, 76]],
  E: [[64, 68, 71], [66, 71, 75]],
  F: [[66, 69, 73], [64, 69, 71]],
  B: [[64, 69, 73], [66, 71, 76]],
  C: [[67, 71, 76], [66, 71, 74]],
};
// Tapped cells. The first note of a cell is the tap, the rest are softer hammer-ons and
// pull-offs that overlap slightly (legato). Default grouping 3+3+3+3+2 sixteenths.
function tap(bar, ch, { vel = 1, oct = 0, reverse = false, groups = [3, 3, 3, 3, 2] } = {}) {
  const cells = TAP[ch].map((c) => (reverse ? [...c].reverse() : c));
  let s = 0;
  groups.forEach((len, k) => {
    const base = cells[k % 2];
    const cell = len === 4 ? [base[0], base[1], base[2], base[1]] : base.slice(0, len);
    cell.forEach((p, i) => {
      put16("g2", bar, s, 1.3, p + oct, (i === 0 ? 94 : 60 + (i === 1 ? 4 : 0)) * vel);
      s++;
    });
  });
}

const DYAD_B = {
  Cm: [[75, 80], [73, 76], [71, 75], [68, 73]],
  A: [[76, 80], [73, 76], [71, 76], [69, 73]],
  E: [[75, 78], [71, 76], [68, 75], [71, 75]],
  F: [[76, 81], [73, 76], [71, 76], [69, 73]],
  B: [[76, 81], [73, 78], [71, 76], [73, 78]],
};
// B: four evenly spaced dyads per bar (4:7).
function dyadB(bar, ch) {
  DYAD_B[ch].forEach((pair, i) =>
    pair.forEach((p, j) => put("g2", bar, i * 1.75, 2.4, p, i === 0 ? 86 : 70, j * 6)));
}

// ---------- bass ----------
const BASS_A = {
  A: [[33, 0, 2], [40, 2, 2], [37, 4, 1], [35, 5, 1], [33, 6, 1]],
  E: [[32, 0, 2], [35, 2, 2], [40, 4, 1], [39, 5, 1], [37, 6, 1]],
  F: [[30, 0, 2], [33, 2, 2], [37, 4, 1], [40, 5, 1], [42, 6, 1]],
  B: [[35, 0, 3], [42, 3, 1], [40, 4, 1], [37, 5, 1], [35, 6, 1]],
};
// The same counter-line on the 4+4+3+3 pulses (sixteenths 0, 4, 8, 11), with one passing note dropped.
const BASS_A_LIMP = {
  A: [[33, 0, 4], [40, 4, 4], [37, 8, 3], [35, 11, 3]],
  E: [[32, 0, 4], [35, 4, 4], [40, 8, 3], [37, 11, 3]],
  F: [[30, 0, 4], [33, 4, 4], [37, 8, 3], [42, 11, 3]],
  B: [[35, 0, 6], [42, 6, 2], [40, 8, 3], [37, 11, 3]],
};
const bassLine = (bar, line, vel = 1) =>
  line.forEach(([p, e, d], i) => put("bass", bar, e, d * 0.95, p, (i === 0 ? 100 : 84) * vel));
const bassLimp = (bar, line, vel = 1) =>
  line.forEach(([p, s, d], i) => put16("bass", bar, s, d * 0.92, p, (i === 0 ? 102 : 88) * vel));

const BASS_B = {
  Cm: [[37, 0, 3], [44, 3, 2], [40, 5, 1], [35, 6, 1]],
  A: [[33, 0, 3], [40, 3, 2], [37, 5, 1], [35, 6, 1]],
  E: [[32, 0, 3], [35, 3, 2], [37, 5, 1], [35, 6, 1]],
  F: [[30, 0, 3], [37, 3, 2], [40, 5, 1], [42, 6, 1]],
};

const ARP_B = {
  Cm: { b: 49, x: 56, y: 63, z: 64, w: 59 },
  A: { b: 45, x: 52, y: 59, z: 61, w: 56 },
  E: { b: 44, x: 52, y: 59, z: 63, w: 54 },
  F: { b: 42, x: 52, y: 57, z: 61, w: 59 },
  B: { b: 47, x: 52, y: 57, z: 61, w: 54 },
};
function arpB(bar, ch) {
  const v = ARP_B[ch];
  const seq = [[0, v.b, 7, 96], [1, v.x, 3, 70], [2, v.y, 4, 72], [3, v.z, 4, 92], [4, v.x, 3, 70], [5, v.w, 3, 90], [6, v.y, 3, 72]];
  for (const [e, p, d, vel] of seq) put("g1", bar, e, d, p, vel);
}

// ---------- riff and hits ----------
const RIFF = [0, 12, 7, 5, 7, null, 4];
function riff(bar, root, { offsets = RIFF, vel = 1 } = {}) {
  offsets.forEach((o, e) => {
    if (o === null) return;
    const acc = [0, 2, 6].includes(e) ? 112 : 96;
    const d = e === 1 ? 0.6 : 0.9;
    put("bass", bar, e, d, root + o, acc * vel);
    put("g1", bar, e, d, root + 12 + o, acc * vel);
    put("g1", bar, e, d, root + 24 + o, (acc - 10) * vel, 5);
    put("g2", bar, e, d, root + 36 + o, (acc - 6) * vel);
  });
  // The riff's empty eighth gets a muted scratch instead of silence.
  chucks(bar, [10], 84);
}

const HIT = {
  E: { g1: [40, 47, 52, 56, 59, 66], g2: [64, 71, 76, 78], bass: 28, tpt: 76 },
  D: { g1: [50, 57, 62, 66, 69], g2: [62, 69, 74, 76], bass: 38, tpt: 74 },
  C: { g1: [48, 55, 60, 64, 67], g2: [60, 67, 72, 74], bass: 36, tpt: 72 },
};
// Hits are raked low string first, 9 ms per string, instead of stacked on the grid.
function hit(bar, e, ch, dur, vel = 118, { tpt = false } = {}) {
  const h = HIT[ch];
  h.g1.forEach((p, i) => put("g1", bar, e, dur, p, vel - 8, i * 9));
  h.g2.forEach((p, i) => put("g2", bar, e, dur, p, vel - 12, i * 9));
  put("bass", bar, e, dur, h.bass, vel);
  if (tpt) put("tpt", bar, e, dur, h.tpt, vel - 6);
}

// ---------- drums (GM) ----------
const K = 36, SS = 37, S = 38, HH = 42, PH = 44, OH = 46, CR = 49, CR2 = 57, RD = 51, BELL = 53, SPL = 55;
const T_HI = 50, T_MH = 48, T_ML = 47, T_LO = 45, T_FL = 41;
const d = (bar, e, p, vel, shift = 0) => put("drums", bar, e, 0.5, p, vel, shift);
const d16 = (bar, s, p, vel, shift = 0) => d(bar, s / 2, p, vel, shift);
const flam = (bar, s, vel) => { d16(bar, s, S, 46, -22); d16(bar, s, S, vel); };

// A: the 4+4+3+3 home groove. Kick 0 and 8, backbeat on 4 and 11 (the clipped "4").
// `side` uses side-stick for the backbeat (A1), and the variant changes ghosts and open hats bar to bar.
function grooveA(bar, { crash = false, fill = false, side = false, variant = 0 } = {}) {
  const back = side ? SS : S;
  if (crash) d16(bar, 0, CR, 110);
  const hats = [0, 2, 4, 6, 8, 10, 11, 13];
  for (const s of hats) {
    if (crash && s === 0) continue;
    if (fill && s >= 8) continue;
    const open = variant % 2 === 1 && s === 10;
    d16(bar, s, open ? OH : HH, [0, 4, 8, 11].includes(s) ? 92 : 58);
  }
  if (variant % 2 === 1 && !fill) d16(bar, 11, PH, 64);
  d16(bar, 0, K, 112); d16(bar, 8, K, 104);
  if (variant >= 2) d16(bar, 7, K, 72); else d16(bar, 13, K, 70);
  d16(bar, 4, back, side ? 96 : 112);
  d16(bar, 3, S, 30); d16(bar, 6, S, 34);
  if (fill) {
    [[8, T_HI], [9, T_HI], [10, T_MH], [11, T_ML], [12, T_LO], [13, T_FL]].forEach(([s, p], i) => d16(bar, s, p, 82 + i * 6));
  } else {
    d16(bar, 11, back, side ? 92 : 110);
    d16(bar, 10, S, 32); d16(bar, 13, S, variant === 3 ? 52 : 40);
  }
}

// B: half-time in 3+2+2, as in v1.
function grooveB(bar, { crash = false, fill = false } = {}) {
  d(bar, 0, crash ? CR : RD, crash ? 108 : 90);
  [1, 2, 4, 6].forEach((e) => d(bar, e, RD, 58));
  d(bar, 3, BELL, 88); d(bar, 5, BELL, 80);
  d(bar, 0, K, 110); d(bar, 2, K, 78); d(bar, 5.5, K, 84);
  d(bar, 3, S, 116);
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

// C: double-time riff groove in 2+3+2 on ride and bell, with a flam on the big backbeat.
function grooveC(bar, { crash = false, fill = false } = {}) {
  if (crash) d(bar, 0, CR, 118);
  for (let e = 0; e < 7; e++) {
    if (crash && e === 0) continue;
    if (fill && e >= 5) continue;
    d(bar, e, [0, 2, 5].includes(e) ? BELL : RD, [0, 2, 5].includes(e) ? 98 : 72);
  }
  d(bar, 0, K, 120); d(bar, 2, K, 110); d(bar, 3, K, 92);
  d(bar, 1, S, 108); flam(bar, 8, 124);
  if (fill) {
    [[5, T_HI], [5.5, T_MH], [6, T_LO], [6.5, T_FL]].forEach(([e, p], i) => d(bar, e, p, 96 + i * 8));
    d(bar, 6, K, 100);
  } else {
    d(bar, 6, S, 104); d(bar, 5.5, S, 40); d(bar, 6, K, 88);
  }
}

// Climax: 4+4+3+3 drive. Ride on the eighths with the bell on the pulses, kick-bass lock on 0 and 8,
// backbeat flams on 4 and 11, and a splash on the clipped "4" every other bar.
function grooveF(bar, { crash = false, splash = false } = {}) {
  if (crash) d16(bar, 0, CR, 118);
  for (const s of [0, 2, 4, 6, 8, 10, 11, 13]) {
    if (crash && s === 0) continue;
    d16(bar, s, [0, 4, 8, 11].includes(s) ? BELL : RD, [0, 4, 8, 11].includes(s) ? 100 : 68);
  }
  d16(bar, 0, K, 122); d16(bar, 2, K, 88); d16(bar, 8, K, 116); d16(bar, 13, K, 84);
  flam(bar, 4, 116); flam(bar, 11, 120);
  if (splash) d16(bar, 11, SPL, 96);
  d16(bar, 6, S, 38); d16(bar, 10, S, 34); d16(bar, 13, S, 46);
}

// ---------- arrangement ----------
const PROG = ["A", "E", "F", "B"];

// 1-4 Intro: Gtr 1 alone, hook with the 1+1+1 tail.
PROG.forEach((ch, i) => hook(1 + i, ch, "T", 0.85));
[[8, T_HI], [9, T_MH], [10, T_MH], [11, T_ML], [12, T_LO], [13, T_FL]].forEach(([s, p], i) => d16(4, s, p, 58 + i * 8));

// 5-12 A. Drums and bass sit in 4+4+3+3 throughout. Gtr 1 alternates tails, so the 1+1+1
// bars rub 3-against-2 against the drums and the 1.5+1.5 bars lock with them.
const FEEL_A = { 5: "T", 6: "L", 7: "T", 8: "L", 9: "L", 10: "L", 11: "T", 12: "L" };
for (let i = 0; i < 8; i++) {
  const bar = 5 + i, ch = PROG[i % 4];
  hook(bar, ch, FEEL_A[bar], 1, bar === 12 ? 78 : undefined);
  tap(bar, ch, { reverse: bar >= 9 });
  bassLimp(bar, BASS_A_LIMP[ch]);
  chucks(bar, FEEL_A[bar] === "L" ? [7, 13] : [7], 66);
  grooveA(bar, { crash: bar === 5 || bar === 9, fill: bar === 8 || bar === 12, side: bar <= 8, variant: i % 4 });
}

// 13-20 B: 3+2+2, half-time, 4:7.
const PROG_B = ["Cm", "A", "E", "F", "Cm", "A", "F", "B"];
PROG_B.forEach((ch, i) => {
  const bar = 13 + i;
  arpB(bar, ch);
  dyadB(bar, ch);
  if (bar < 20) {
    bassLine(bar, BASS_B[ch]);
    grooveB(bar, { crash: bar === 13 || bar === 17, fill: bar === 16 });
  } else {
    for (let e = 0; e < 7; e++) put("bass", bar, e, 0.9, 35, 72 + e * 7);
    buildRoll(bar);
  }
});

// 21-25 C: riff, 2+3+2, double-time.
riff(21, 28);
riff(22, 28, { offsets: [0, 12, 7, 5, 7, null, 11] });
riff(23, 36, { offsets: [0, 12, 7, 6, 7, null, 4] });
riff(24, 38, { offsets: [0, 12, 7, 6, 7, null, 4] });
riff(25, 28, { offsets: [0, 12, 7, 5, 7, null, 11] });
grooveC(21, { crash: true }); grooveC(22); grooveC(23, { crash: true }); grooveC(24, { fill: true }); grooveC(25, { crash: true });

// 26-28 cadence hits, false ending, silence.
hit(26, 0, "C", 1); hit(26, 2, "C", 1.5); hit(26, 5, "D", 2);
[0, 2].forEach((e) => { d(26, e, CR, 118); d(26, e, K, 122); d(26, e, S, 116); });
d(26, 5, K, 120); d(26, 5, S, 110);
[5.5, 6, 6.5].forEach((e, i) => d(26, e, S, 80 + i * 18));
hit(27, 0, "E", 7, 124);
d(27, 0, CR, 127); d(27, 0, CR2, 120); d(27, 0, K, 127);

// 29-32: Gtr 2 alone, then the build. Soft hats already hint at 4+4+3+3.
PROG.forEach((ch, i) => tap(29 + i, ch, { vel: 0.78 }));
[30, 31].forEach((bar) => { for (const s of [0, 2, 4, 6, 8, 10, 11, 13]) d16(bar, s, HH, [0, 4, 8, 11].includes(s) ? 56 : 36); });
bassLimp(31, BASS_A_LIMP.F, 0.85);
bassLimp(32, BASS_A_LIMP.B, 0.95);
hook(32, "B", "L", 0.9);
for (let i = 0; i < 14; i++) {
  const toms = [T_HI, T_HI, T_MH, T_MH, T_ML, T_ML, T_LO, T_LO, T_FL, T_FL, S, S, S, S];
  d16(32, i, toms[i], 64 + i * 4);
}
[0, 4, 8, 11].forEach((s) => d16(32, s, K, 90 + s * 2));

// 33-36 Climax: everyone locks onto 4+4+3+3. Gtr 2 taps 4+4+3+3 cells an octave up, the bass
// riff lands on the pulses, and the trumpet enters with the melody.
const PROG_F = ["A", "E", "F", "C"];
const ROOT_F = { A: 33, E: 32, F: 30, C: 36 };
const TPT = [
  [[73, 0, 8], [71, 8, 3], [73, 11, 3]],
  [[76, 0, 8], [75, 8, 3], [71, 11, 3]],
  [[73, 0, 4], [76, 4, 4], [78, 8, 6]],
  [[79, 0, 8], [78, 8, 3], [76, 11, 3]],
];
PROG_F.forEach((ch, i) => {
  const bar = 33 + i, r = ROOT_F[ch];
  hook(bar, ch, "L", 1.12);
  tap(bar, ch, { oct: 12, vel: 1.05, groups: [4, 4, 3, 3] });
  [[0, r, 2], [2, r + 12, 1], [4, r + 7, 2], [6, r + 12, 1], [8, r, 3], [11, r + 7, 2], [13, r + 12, 1]].forEach(([s, p, dur]) =>
    put16("bass", bar, s, dur * 0.9, p, [0, 4, 8, 11].includes(s) ? 114 : 86));
  chucks(bar, [3, 7, 13], 78);
  TPT[i].forEach(([p, s, dur], j) => put16("tpt", bar, s, dur - 0.3, p, j === 0 ? 104 : 92));
  grooveF(bar, { crash: bar === 33 || bar === 35, splash: bar === 34 });
});
tracks.drums = tracks.drums.filter((n) => !(n.start >= at(36, 4) - 0.1 && n.start < at(37, 0) && n.pitch !== K));
[[8, S], [9, S], [10, T_HI], [11, T_MH], [12, T_LO], [13, T_FL]].forEach(([s, p], i) => d16(36, s, p, 92 + i * 6));

// 37 riff with the trumpet holding E over it, 38 stop-time hits E D C, then silence.
riff(37, 28);
grooveC(37, { crash: true });
put16("tpt", 37, 0, 13, 76, 108);
hit(38, 0, "E", 1, 124, { tpt: true }); hit(38, 2, "D", 1, 118, { tpt: true }); hit(38, 4, "C", 1.5, 122, { tpt: true });
[0, 2, 4].forEach((e) => { d(38, e, CR, 120); d(38, e, K, 124); d(38, e, S, 112); });

// 39-40 Outro: Gtr 1 alone with the 1+1+1 tail again, which leads into bar 1.
hook(39, "F", "T", 0.8);
hook(40, "B", "T", 0.75);

// ---------- piano ----------
// Piano is the punch: the build, the riff doubling, and the hits. The Rhodes has the harmony.
const pn = (bar, s, dur16, pitches, vel) => pitches.forEach((p, i) => put16("pno", bar, s, dur16, p, vel - i * 4, i * 3));
// 20: octave B eighths with the build.
for (let e = 0; e < 7; e++) put("pno", 20, e, 0.8, 47, 70 + e * 7), put("pno", 20, e, 0.8, 59, 64 + e * 7);
// Riff: two octaves of piano doubling the bass.
[[21, 28, RIFF], [22, 28, [0, 12, 7, 5, 7, null, 11]], [23, 36, [0, 12, 7, 6, 7, null, 4]],
 [24, 38, [0, 12, 7, 6, 7, null, 4]], [25, 28, [0, 12, 7, 5, 7, null, 11]], [37, 28, RIFF]].forEach(([bar, root, offsets]) =>
  offsets.forEach((o, e) => {
    if (o === null) return;
    pn(bar, e * 2, e === 1 ? 1.2 : 1.8, [root + 12 + o, root + 24 + o], [0, 2, 6].includes(e) ? 108 : 94);
  }));
// Hits and the false-ending chord.
const PNO_HIT = { E: [40, 52, 56, 59, 64], D: [38, 50, 54, 57, 62], C: [36, 48, 52, 55, 60] };
[[26, 0, "C", 2], [26, 4, "C", 3], [26, 10, "D", 4], [27, 0, "E", 14], [38, 0, "E", 2], [38, 4, "D", 2], [38, 8, "C", 3]].forEach(
  ([bar, s, ch, dur]) => pn(bar, s, dur, PNO_HIT[ch], bar === 27 ? 116 : 110));

// ---------- Rhodes ----------
// Rootless voicings between the bass and the guitar hook (E3-G#4), so the guitars keep their own
// register and the colour comes from the Rhodes.
const RH = {
  A: [56, 59, 61, 64], // Amaj9: G# B C# E
  E: [54, 56, 59, 63], // Emaj9/G#: F# G# B D#
  F: [52, 57, 59, 61], // F#m11: E A B C#
  B: [56, 57, 61, 64], // B13sus: G# A C# E
  C: [55, 59, 62, 66], // Cmaj9#11: G B D F#
  Cm: [56, 59, 63, 64], // C#m9: G# B D# E
};
const RH_HIT = { E: [56, 59, 63, 66], D: [54, 57, 61, 64], C: [52, 55, 59, 62] };
const rh = (bar, s, dur16, pitches, vel) => pitches.forEach((p, i) => put16("rh", bar, s, dur16, p, vel - i * 3, i * 4));
// Comping on the 4+4+3+3 pulses. `next` anticipates the next bar's chord on the last sixteenth,
// and `skip0` leaves that bar's downbeat to the anticipation.
function comp(bar, ch, { sparse = false, next, skip0 = false, vel = 1 } = {}) {
  const v = RH[ch];
  if (sparse) {
    if (!skip0) rh(bar, 0, 7, v, 78 * vel);
    rh(bar, 11, 2.5, v, 72 * vel);
  } else {
    if (!skip0) rh(bar, 0, 3, v, 86 * vel);
    rh(bar, 6, 1.5, v, 68 * vel);
    rh(bar, 11, next ? 1.5 : 2.5, v, 82 * vel);
  }
  if (next) rh(bar, 13, 5, RH[next], 90 * vel);
}
// Intro and outro: one soft held voicing per bar under the solo guitar.
[[1, "A"], [2, "E"], [3, "F"], [4, "B"], [39, "F"], [40, "B"]].forEach(([bar, ch]) => rh(bar, 0, 13, RH[ch], 56));
// A1 sparse, A2 full with anticipations into bars 10 and 12.
for (let i = 0; i < 8; i++) {
  const bar = 5 + i, ch = PROG[i % 4];
  if (bar <= 8) comp(bar, ch, { sparse: true });
  else comp(bar, ch, { next: bar === 9 || bar === 11 ? PROG[(i + 1) % 4] : undefined, skip0: bar === 10 || bar === 12 });
}
// B: held voicing on the downbeat, a soft restrike on the second group (16th 6).
PROG_B.forEach((ch, i) => {
  const bar = 13 + i;
  if (i === 7) { rh(bar, 0, 13, RH.B, 80); return; }
  rh(bar, 0, 6, RH[ch], 74);
  rh(bar, 6, 8, RH[ch], 60);
});
// Riff 21-25 and 37: tacet, so the unison stays a unison. The false-ending E and the stop hits get colour.
rh(27, 0, 14, RH_HIT.E, 100);
[[38, 0, "E", 2], [38, 4, "D", 2], [38, 8, "C", 3]].forEach(([bar, s, ch, dur]) => rh(bar, s, dur, RH_HIT[ch], 104));
// 31-32 rejoin in the build, then the climax comps full with anticipations into 34 and 36.
rh(31, 0, 13, RH.F, 62);
comp(32, "B", { vel: 0.95 });
PROG_F.forEach((ch, i) => {
  const bar = 33 + i;
  comp(bar, ch, { vel: 1.1, next: bar === 33 ? "E" : bar === 35 ? "C" : undefined, skip0: bar === 34 || bar === 36 });
});

// ---------- organ ----------
// Drawbar organ as quiet glue under B and the climax, one held chord per bar.
const ORG = {
  Cm: [49, 56, 59, 64], A: [45, 52, 56, 61], E: [44, 52, 59, 63], F: [42, 49, 57, 61], B: [47, 54, 57, 61], C: [48, 55, 59, 64],
};
PROG_B.forEach((ch, i) => ORG[ch].forEach((p) => put16("org", 13 + i, 0, 13.5, p, i === 7 ? 70 : 60)));
PROG_F.forEach((ch, i) => ORG[ch].forEach((p) => put16("org", 33 + i, 0, 13.5, p, 64)));

// ---------- double tracks for the big sections ----------
// Copies of Gtr 1 and Gtr 2, 15 and 19 ms late, a little softer, panned toward the other side.
const BIG = [[21, 27], [33, 38]];
const inBig = (n) => BIG.some(([a, b]) => n.start >= at(a, 0) && n.start < at(b + 1, 0));
for (const [src, dst, ms] of [["g1", "g1d", 15], ["g2", "g2d", 19]]) {
  for (const n of tracks[src].filter(inBig)) {
    tracks[dst].push({ ...n, start: n.start + msToBeats(ms), velocity: Math.max(1, n.velocity - 10) });
  }
}

// ---------- timing humanisation ----------
// Per-track bias (drums slightly ahead, bass slightly behind) plus bounded jitter, in ms.
const FEEL = { drums: [-4, 4], bass: [7, 5], g1: [0, 6], g1d: [0, 6], g1m: [2, 5], g2: [0, 8], g2d: [0, 8], pno: [-2, 4], rh: [5, 5], org: [0, 2], tpt: [10, 8] };
for (const [name, [bias, jitter]] of Object.entries(FEEL)) {
  for (const n of tracks[name]) {
    n.start = Math.max(0, n.start + msToBeats(bias + (rnd() * 2 - 1) * jitter));
  }
}

// ---------- project ----------
const E_MAJOR = { fifths: 4, mode: "major" };
const guitarEq = (presence) => ({
  bypass: false,
  bands: [
    { frequency: 320, gain: 0.6, q: 1, bypass: false },
    { frequency: 2600, gain: presence, q: 1, bypass: false },
  ],
});
const track = (name, program, gain, pan, notes, extra = {}) =>
  ({ name, program, gain, pan, muted: false, soloed: false, ...extra, notes });
const project = {
  title: "Seven Corners v4 (math rock / fusion, 7/8)",
  comment: "v4: Rhodes carries the harmony, piano the riff and hits, organ pads B and the climax, guitars step back. Loops bar 40 back into bar 1.",
  tempo: TEMPO,
  timeSignature: { numerator: 7, denominator: 8 },
  loop: { range: { startBeat: 0, endBeat: 40 * BAR }, enabled: true },
  locators: [
    [1, "Intro: Gtr 1 hook"], [5, "A: 4+4+3+3"], [13, "B: half-time 3+2+2"], [20, "Build"],
    [21, "C: riff 2+3+2"], [26, "Cadence"], [27, "False ending"], [29, "Gtr 2 alone"],
    [33, "Climax: all 4+4+3+3"], [37, "Riff"], [38, "Stop"], [39, "Outro: Gtr 1"],
  ].map(([bar, label]) => ({ beat: at(bar, 0), label })),
  midiTracks: [
    track("Gtr 1 (clean, L)", 27, 0.85, -0.75, tracks.g1, { keySignature: E_MAJOR, eq: guitarEq(1.4) }),
    track("Gtr 1 mutes", 28, 0.55, -0.5, tracks.g1m, { keySignature: E_MAJOR }),
    track("Gtr 1 double", 27, 0.45, 0.35, tracks.g1d, { keySignature: E_MAJOR, eq: guitarEq(1.2) }),
    track("Gtr 2 (clean, R)", 27, 0.7, 0.75, tracks.g2, { keySignature: E_MAJOR, eq: guitarEq(1.2) }),
    track("Gtr 2 double", 27, 0.4, -0.35, tracks.g2d, { keySignature: E_MAJOR, eq: guitarEq(1.2) }),
    track("Rhodes", 4, 0.8, 0.25, tracks.rh, { keySignature: E_MAJOR }),
    track("Piano", 0, 0.75, -0.15, tracks.pno, { keySignature: E_MAJOR }),
    track("Organ", 16, 0.45, -0.25, tracks.org, { keySignature: E_MAJOR }),
    track("Trumpet", 56, 0.7, 0.1, tracks.tpt, { keySignature: E_MAJOR }),
    track("Bass", 33, 0.95, 0, tracks.bass, { keySignature: E_MAJOR }),
    track("Drums (Room)", 8, 0.7, 0, tracks.drums, { bank: 128 }),
  ],
};

for (const t of project.midiTracks) {
  t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  const end = 40 * BAR;
  for (const [i, n] of t.notes.entries()) {
    const next = t.notes.slice(i + 1).find((m) => m.pitch === n.pitch);
    if (next && next.start < n.start + n.duration) n.duration = next.start - n.start - 0.02;
    if (n.start + n.duration > end) n.duration = end - n.start;
  }
  t.notes = t.notes.filter((n) => n.duration > 0.01);
  for (const n of t.notes) {
    n.start = +n.start.toFixed(4);
    n.duration = +n.duration.toFixed(4);
  }
}

writeFileSync(new URL("./project-v4.json", import.meta.url), JSON.stringify(project, null, 1));
console.log(project.midiTracks.map((t) => `${t.name}: ${t.notes.length} notes`).join("\n"));
