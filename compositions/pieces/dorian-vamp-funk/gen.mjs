import { deflateRawSync } from "node:zlib";
import fs from "node:fs";

// 16th swing ~56%: odd 16ths land 0.03 beats late
const SWING = 0.03;
const r = (x) => Math.round(x * 1000) / 1000;
function track() {
  const notes = [];
  const add = (bar, step, pitch, dur, vel) => {
    let start = (bar - 1) * 4 + step * 0.25;
    if (step % 2 === 1) start += SWING;
    notes.push({ pitch, start: r(start), duration: r(dur), velocity: Math.max(1, Math.min(127, Math.round(vel))) });
  };
  const chord = (bar, step, pitches, dur, vel) => pitches.forEach((p) => add(bar, step, p, dur, vel));
  return { notes, add, chord };
}
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const A1 = range(1, 8), A2 = range(17, 23), A = [...A1, ...A2];
const isEm = (bar) => bar % 2 === 1;

// voicings
const V = {
  Em: [52, 57, 62, 67, 71], // E A D G B "So What"
  A9: [55, 61, 66, 71], // G C# F# B
  Cmaj7: [59, 64, 69, 74], // B E A D
  Bm7: [54, 59, 64, 69, 74], // F# B E A D
  Am7: [57, 62, 67, 72], // A D G C
  Ab7: [54, 60, 65, 70], // Gb C F Bb
  Gmaj7: [54, 59, 64, 69], // F# B E A
  Cm7: [53, 58, 63], // F Bb Eb
  F7: [51, 57, 62, 67], // Eb A D G
  B7alt: [57, 63, 67, 74], // A D# G D
  D7: [60, 66, 71, 76], // C F# B E
};
const HITS15 = [0, 3, 6];

// ---------------- drums ----------------
const dr = track();
const K = 36, S = 38, H = 42, OH = 46, CR = 49, RD = 51, T1 = 50, T2 = 47, T3 = 45, T4 = 43;
const linear = [[K,110],[H,60],[H,88],[K,95],[S,118],[H,55],[S,34],[H,72],[H,92],[S,30],[K,102],[H,58],[S,120],[H,55],[S,38],[K,88]];
for (const bar of A) {
  const scale = bar <= 2 ? 0.85 : 1;
  linear.forEach(([p, v], step) => {
    if (bar === 8 && step >= 12) return;
    if (A2.includes(bar) && bar % 2 === 0 && step === 7) p = OH;
    dr.add(bar, step, p, 0.2, v * scale);
  });
}
dr.add(1, 0, CR, 1, 85);
dr.add(5, 0, CR, 1, 95);
dr.add(17, 0, CR, 1, 120);
[[12,S,105],[13,T1,95],[14,T2,100],[15,T4,108]].forEach(([s,p,v]) => dr.add(8, s, p, 0.2, v));
for (const bar of range(9, 14)) {
  for (let s = 0; s < 16; s += 2) dr.add(bar, s, RD, 0.4, s % 4 === 0 ? 92 : 68);
  [[0,K,105],[7,K,85],[10,K,100],[4,S,115],[12,S,115],[6,S,32],[9,S,30],[14,S,36]].forEach(([s,p,v]) => {
    if (bar === 14 && s >= 12) return;
    dr.add(bar, s, p, 0.2, v);
  });
}
dr.add(9, 0, CR, 1, 105);
[[12,S,95],[13,S,85],[14,S,108],[15,S,118]].forEach(([s,p,v]) => dr.add(14, s, p, 0.2, v));
// bar 15 stop-time hits
dr.add(15, 0, K, 0.2, 120); dr.add(15, 0, CR, 2, 115);
dr.add(15, 3, K, 0.2, 110); dr.add(15, 3, S, 0.2, 112);
dr.add(15, 6, K, 0.2, 122); dr.add(15, 6, S, 0.2, 120); dr.add(15, 6, CR, 2, 112);
// bar 16 linear drum break, F7 hit on step 14
[[0,K,100],[1,H,70],[2,S,90],[3,H,60],[4,S,115],[5,T1,90],[6,T1,80],[7,K,95],[8,T2,95],[9,T2,85],[10,S,110],[11,K,90],[12,T3,100],[13,T4,105]].forEach(([s,p,v]) => dr.add(16, s, p, 0.2, v));
dr.add(16, 14, K, 0.2, 122); dr.add(16, 14, CR, 1.5, 110);
// bar 24 unison hits + fill back to bar 1
dr.add(24, 0, K, 0.2, 120); dr.add(24, 0, CR, 1.5, 110);
dr.add(24, 3, K, 0.2, 110); dr.add(24, 3, S, 0.2, 112);
dr.add(24, 8, K, 0.2, 122); dr.add(24, 8, CR, 1.5, 112);
[[12,S,100],[13,T1,95],[14,T2,102],[15,T4,112]].forEach(([s,p,v]) => dr.add(24, s, p, 0.2, v));

// ---------------- bass ----------------
const bs = track();
function bassA(bar, root, seventh, last) {
  const ev = [[0,root,115,0.22],[2,root+12,38,0.08],[3,root,100,0.2],[5,root+12,112,0.18],[6,root+12,35,0.08],[7,seventh,92,0.2],[10,root,112,0.22],[11,root+12,35,0.08],[12,root+12,108,0.18],[13,seventh,88,0.2],[14,root+7-12 < 28 ? root+7 : root+7-12,85,0.2],[15,last,95,0.2]];
  if (A2.includes(bar)) ev.push([1,root+12,35,0.08],[9,root+12,100,0.15]);
  for (const [s,p,v,d] of ev) bs.add(bar, s, p, d, v);
}
for (const bar of A) {
  if (isEm(bar)) bassA(bar, 28, 38, 38);
  else bassA(bar, 33, 43, bar === 8 ? 35 : 31);
}
const bridge = { 9: [36], 10: [35], 11: [33, 32], 12: [31], 13: [36, 29], 14: [31] };
const nextRoot = { 9: 35, 10: 33, 11: 31, 12: 36, 13: 31, 14: 35 };
for (const [b, roots] of Object.entries(bridge)) {
  const bar = +b, R = roots[0], n = nextRoot[bar];
  const approach = n + (n > 30 ? -1 : 1);
  if (roots.length === 1) {
    [[0,R,110,0.6],[3,R+12,100,0.2],[6,R+12,30,0.08],[7,R,100,0.4],[10,R+7,104,0.4],[12,R+12,105,0.2],[14,approach,90,0.2]].forEach(([s,p,v,d]) => bs.add(bar, s, p, d, v));
  } else {
    const R2 = roots[1];
    [[0,R,110,0.6],[3,R+12,100,0.2],[6,R2+1,80,0.15],[7,R2,105,0.5],[10,R2+7,100,0.4],[12,R2+12,105,0.2],[14,approach,90,0.2]].forEach(([s,p,v,d]) => bs.add(bar, s, p, d, v));
  }
}
bs.add(15, 0, 35, 0.2, 120); bs.add(15, 3, 47, 0.2, 112); bs.add(15, 6, 35, 0.6, 122);
bs.add(16, 14, 29, 0.4, 120);
bs.add(24, 0, 33, 0.2, 120); bs.add(24, 3, 45, 0.2, 112); bs.add(24, 8, 38, 0.9, 122);

// ---------------- Rhodes: quartal voicings ----------------
const rh = track();
for (const bar of range(3, 8)) rh.chord(bar, 0, isEm(bar) ? V.Em : V.A9, 3.6, 70);
for (const bar of A2) for (const [s, d] of [[0,0.2],[6,0.2],[10,0.35]]) rh.chord(bar, s, isEm(bar) ? V.Em : V.A9, d, 92);
const bridgeChords = { 9: ["Cmaj7"], 10: ["Bm7"], 11: ["Am7", "Ab7"], 12: ["Gmaj7"], 13: ["Cm7", "F7"], 14: ["Gmaj7"] };
for (const [b, cs] of Object.entries(bridgeChords)) {
  if (cs.length === 1) { rh.chord(+b, 0, V[cs[0]], 1.25, 85); rh.chord(+b, 6, V[cs[0]], 1.5, 80); }
  else { rh.chord(+b, 0, V[cs[0]], 1.5, 85); rh.chord(+b, 7, V[cs[1]], 2.0, 85); }
}
for (const s of HITS15) rh.chord(15, s, V.B7alt, s === 6 ? 0.6 : 0.2, 110);
rh.chord(16, 14, V.F7, 0.4, 110);
rh.chord(24, 0, V.Am7, 0.2, 110); rh.chord(24, 3, V.Am7, 0.2, 105); rh.chord(24, 8, V.D7, 1.0, 112);

// ---------------- Clav: two-hand comping ----------------
// Low hand: single-note E Dorian line in the slap bass's gaps, with dead-note ghosts.
// High hand: 3rd-7th dyad chops above the Rhodes (D-G on Em7, C#-G tritone on A9).
const cl = track();
const lowLine = { Em: [[1,52],[6,55],[8,57],[11,59],[14,62]], A9: [[1,57],[6,55],[8,57],[11,61],[14,59]] };
const lowGhosts = [0, 2, 5, 9, 13];
const lowGhostsA2 = [3, 10, 15];
for (const bar of [...range(3, 8), ...A2]) {
  const line = lowLine[isEm(bar) ? "Em" : "A9"];
  const ghosts = A2.includes(bar) ? [...lowGhosts, ...lowGhostsA2] : lowGhosts;
  for (const [s, p] of line) {
    if (bar === 8 && s >= 12) continue;
    cl.add(bar, s, p, 0.1, s === 1 || s === 8 ? 95 : 82);
  }
  for (const s of ghosts) {
    if (bar === 8 && s >= 12) continue;
    const prev = [...line].reverse().find(([ls]) => ls <= s) ?? line[0];
    cl.add(bar, s, prev[1], 0.05, 34);
  }
  // chops enter with the sax at bar 5; backbeats under the sax call, pushes around the brass answer
  if (bar < 5) continue;
  const call = isEm(bar);
  const chops = call ? [4, 12] : bar === 8 ? [4, 7] : [4, 7, 14];
  if (A2.includes(bar) && call) chops.push(15);
  for (const s of chops) cl.chord(bar, s, isEm(bar) ? [74,79] : [73,79], 0.1, s === 4 || s === 12 ? 100 : 85);
}
for (const s of HITS15) cl.chord(15, s, [63,67,74], 0.15, 112);
cl.chord(16, 14, [62,67,69], 0.15, 112);
cl.chord(24, 0, [62,67,72], 0.15, 112); cl.chord(24, 3, [62,67,72], 0.15, 105); cl.chord(24, 8, [66,71,76], 0.3, 112);

// ---------------- Tenor sax: riff hook (call) + bridge line ----------------
const sx = track();
const riff = [[2,64,0.25,100],[3,67,0.25,95],[4,69,0.25,115],[6,70,0.12,85],[7,71,0.5,110],[10,69,0.25,95],[11,67,0.25,90]];
const endA = [[12,64,0.5,110],[14,62,0.25,95],[15,64,0.4,105]];
const endB = [[12,64,0.25,105],[13,67,0.25,95],[14,69,0.25,100],[15,71,0.6,115]];
const endC = [[12,71,0.25,105],[13,74,0.25,108],[14,76,0.75,120]];
for (const bar of [5, 7, 17, 19, 21, 23]) {
  const end = bar === 23 ? endC : bar === 7 || bar === 19 ? endB : endA;
  for (const [s,p,d,v] of [...riff, ...end]) sx.add(bar, s, p, d, v);
}
const sxBridge = [
  [8,14,71,1.75,95],
  [9,8,72,0.25,95],[9,9,71,0.25,90],[9,10,69,0.5,100],[9,14,69,1.5,95],
  [10,8,71,0.25,95],[10,9,74,0.25,100],[10,10,73,0.25,92],[10,11,71,0.25,90],[10,12,69,0.5,100],[10,14,67,1.0,95],
  [11,7,66,0.75,100],[11,10,68,0.25,95],[11,11,66,0.25,90],[11,12,65,0.25,92],[11,13,63,0.25,88],[11,14,66,1.75,100],
  [12,8,67,0.25,95],[12,9,69,0.25,95],[12,10,71,0.25,100],[12,11,74,0.25,102],[12,12,76,0.5,112],[12,14,75,1.0,100],
  [13,4,74,0.25,95],[13,5,72,0.25,92],[13,6,70,0.25,95],[13,7,69,0.75,100],[13,10,72,0.25,95],[13,11,75,0.25,100],[13,12,74,0.5,105],[13,14,71,1.5,100],
  [14,8,69,0.25,95],[14,9,71,0.25,100],[14,10,74,0.5,108],
];
for (const [b,s,p,d,v] of sxBridge) sx.add(b, s, p, d, v);
for (const s of HITS15) sx.add(15, s, 74, s === 6 ? 0.6 : 0.2, 115);
sx.add(16, 14, 67, 0.4, 112);
sx.add(24, 0, 72, 0.2, 112); sx.add(24, 3, 72, 0.2, 108); sx.add(24, 8, 76, 1.0, 115);

// ---------------- Brass: response stabs + hits ----------------
const br = track();
const X = [61,67,71], Y = [64,69,73];
for (const bar of [6, 8, 18, 20, 22]) {
  const ev = bar === 8
    ? [[2,X,0.15,100],[3,X,0.15,92],[6,Y,0.6,115],[10,Y,1.0,110]]
    : [[2,X,0.15,100],[3,X,0.15,92],[6,Y,0.6,115],[10,X,0.15,95],[11,X,0.15,90],[12,Y,0.4,110]];
  for (const [s,c,d,v] of ev) br.chord(bar, s, c, d, v);
}
for (const s of HITS15) br.chord(15, s, [63,67,74], s === 6 ? 0.6 : 0.2, 118);
br.chord(16, 14, [57,62,67], 0.4, 115);
br.chord(24, 0, [62,67,72], 0.2, 115); br.chord(24, 3, [62,67,72], 0.2, 108); br.chord(24, 8, [66,71,76], 1.0, 118);

const project = {
  title: "Dorian Vamp Funk",
  comment: "~24-bar funk in E Dorian. A (1-8) Em7-A9 vamp, Bridge (9-16) in G with tritone subs, backdoor ii-V, stop-time and drum break, A' (17-24) full band, ending on a backdoor iv-bVII7 turnaround that loops back to bar 1. Swing ~56% on 16ths is baked into the note timing.",
  tempo: 100,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: 96 }, enabled: true },
  locators: [
    { beat: 0, label: "A" },
    { beat: 32, label: "Bridge" },
    { beat: 56, label: "Stop-time / break" },
    { beat: 64, label: "A'" },
    { beat: 92, label: "Turnaround" },
  ],
  midiTracks: [
    { name: "Drums", program: 0, bank: 128, gain: 0.9, pan: 0, notes: dr.notes },
    { name: "Slap Bass", program: 36, gain: 1, pan: 0, notes: bs.notes },
    { name: "Tenor Sax (riff)", program: 66, gain: 0.75, pan: 0, notes: sx.notes },
    { name: "Rhodes (quartal)", program: 4, gain: 0.65, pan: -0.25, notes: rh.notes },
    { name: "Clav", program: 7, gain: 0.6, pan: -0.5, notes: cl.notes },
    { name: "Brass (response)", program: 61, gain: 0.6, pan: 0.3, notes: br.notes },
  ],
};
const json = JSON.stringify(project);
fs.writeFileSync("/tmp/funk/project.json", JSON.stringify(project, null, 2));
const payload = deflateRawSync(json).toString("base64url");
const url = `https://toy-midi.hiro18181.workers.dev/draft#p=${payload}`;
fs.writeFileSync("/tmp/funk/url.txt", url);
const maxBeat = Math.max(...project.midiTracks.flatMap(t => t.notes.map(n => n.start + n.duration)));
console.log({ urlLength: url.length, maxBeat, counts: project.midiTracks.map(t => [t.name, t.notes.length]) });
