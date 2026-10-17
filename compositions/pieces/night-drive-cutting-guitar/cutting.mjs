// Ports the Interlock in E cutting part back to Night Drive's guitar.
//
// Usage: node cutting.mjs <in project.json> <out project.json> [--fsbs]
//
// - Grips: each chord keeps its written pitch classes, revoiced as a 3-note grip
//   on the G, B, and e strings within a 4-fret span, choosing the grip closest to
//   the previous one, so the hand stays in one position and voice-leads.
// - Rhythm, bars 9–23: the interlock grids, cycling per bar. X is an open accent,
//   x a muted chk, and . an air stroke. The chord at each 16th follows the written
//   chord timeline, which already anticipates changes on the last 16th.
// - Bars 1–8 keep their written stab rhythm on the new grips, ringing only the
//   accents and the push into each chord change, with light muted
//   downstrokes on the free 8ths. The final chord stays as written.
//
// Without --fsbs the chks play GeneralUser program 28. With --fsbs both guitar
// tracks render on FSBS with short release offsets.

import fs from "node:fs";

const [input, output] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const fsbs = process.argv.includes("--fsbs");
const project = JSON.parse(fs.readFileSync(input, "utf8"));
const gi = project.midiTracks.findIndex((t) => t.name === "Guitar (clean cutting)");
const guitar = project.midiTracks[gi];
const ms = (x) => (x * project.tempo) / 60000; // milliseconds to beats

let seed = 5;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const jit = (amount) => (rnd() * 2 - 1) * amount;
const clampVel = (v) => Math.max(1, Math.min(127, Math.round(v)));

// written hits and the chord timeline
const hits = [];
for (const n of [...guitar.notes].sort((a, b) => a.start - b.start)) {
  const h = hits.at(-1);
  if (h && n.start - h.start < 0.06) h.notes.push(n);
  else hits.push({ start: n.start, notes: [n] });
}
const FINAL = 92; // bar 24, the closing chord stays as written
const timeline = hits.filter((h) => h.start < FINAL).map((h) => ({ start: h.start, pcs: [...new Set(h.notes.map((n) => n.pitch % 12))] }));
const chordAt = (t) => timeline.findLast((c) => c.start <= t + 0.06) ?? timeline[0];

// grips on the G, B, and e strings
const STRINGS = [55, 59, 64];
const gripCache = new Map();
let prevGrip = [62, 66, 71];
function gripFor(pcs) {
  const key = pcs.join(",") + "|" + prevGrip.join(",");
  if (gripCache.has(key)) return gripCache.get(key);
  let best;
  for (let a = 1; a <= 14; a++)
    for (let b = 1; b <= 14; b++)
      for (let c = 1; c <= 14; c++) {
        const frets = [a, b, c];
        if (Math.max(...frets) - Math.min(...frets) > 3) continue;
        const grip = frets.map((f, i) => STRINGS[i] + f);
        const gpcs = grip.map((p) => p % 12);
        if (!gpcs.every((pc) => pcs.includes(pc)) || !pcs.every((pc) => gpcs.includes(pc))) continue;
        const move = grip.reduce((s, p, i) => s + Math.abs(p - prevGrip[i]), 0);
        const score = move + Math.abs(grip[2] - 70) * 0.5; // stay near the top of the Rhodes
        if (!best || score < best.score) best = { grip, score };
      }
  const grip = best?.grip ?? prevGrip;
  gripCache.set(key, grip);
  return grip;
}

const GRIDS = ["X.xX.xXx.xX.xXx.", ".xXx.xX.xX.xXx.x", "X.xX.xXx.xX.xX.X", ".xXx.xX.xXxXx.x."];

const open = [];
const muted = [];
function stroke(t0, s, kind, grip, len) {
  const down = s % 2 === 0;
  const accent = kind === "X";
  let strings = accent ? grip : down ? [grip[0] - 5, ...grip] : grip.slice(-2);
  if (!down) strings = [...strings].reverse();
  const start = t0 + (down ? 0 : ms(6)) + ms(jit(4));
  const step = (ms(accent ? 16 : down ? 8 : 5) + ms(jit(3))) / (strings.length - 1);
  const vel = accent ? 92 : down ? 52 : 42;
  strings.forEach((pitch, i) => {
    const t = start + i * step;
    const velocity = clampVel(vel + 4 - (8 * i) / (strings.length - 1) + jit(4));
    if (accent) open.push({ pitch, start: t, duration: Math.max(ms(30), start + len - t), velocity });
    else muted.push({ pitch, start: t, duration: ms(22 + jit(4)), velocity });
  });
}

// bars 1–8: written stab rhythm on voice-led grips. A guitar marks the rhythm by
// which strokes ring, not by velocity steps, so only the written accents and the
// last-16th push into the next chord ring open, and the other stabs become chks.
for (const h of hits.filter((h) => h.start < 32)) {
  const grip = (prevGrip = gripFor(chordAt(h.start).pcs));
  const t0 = Math.round(h.start * 4) / 4;
  const s = Math.round((t0 % 4) * 4);
  const accent = Math.max(...h.notes.map((n) => n.velocity)) >= 75;
  stroke(t0, s, accent || s === 15 ? "X" : "x", grip, 0.2);
}

// bars 1–8: light muted downstrokes on the 8ths the stabs leave free
for (let bar = 0; bar < 8; bar++) {
  for (let s = 0; s < 16; s += 2) {
    const t0 = bar * 4 + s / 4;
    if (hits.some((h) => Math.abs(h.start - t0) < 0.3)) continue;
    stroke(t0, s, "x", (prevGrip = gripFor(chordAt(t0).pcs)), 0);
  }
}

// bars 9–23: interlock grids
for (let bar = 8; bar < 23; bar++) {
  const grid = GRIDS[bar % 4];
  [...grid].forEach((c, s) => {
    if (c === ".") return;
    const t0 = bar * 4 + s / 4;
    const grip = (prevGrip = gripFor(chordAt(t0).pcs));
    stroke(t0, s, c, grip, c === "X" && grid.lastIndexOf("X") === s ? 0.5 : 0.2);
  });
}

// the closing chord as written
for (const h of hits.filter((h) => h.start >= FINAL)) open.push(...h.notes);

const font = (release) => (fsbs ? { sf2: "/tmp/egtr/fsbs.sf2", program: 0, nrpn: { 38: release } } : {});
project.midiTracks.splice(
  gi,
  1,
  { ...guitar, name: "Guitar (cutting)", notes: open, ...font(-1000) },
  { ...guitar, name: "Guitar (muted)", program: 28, notes: muted, gain: guitar.gain * 1.4, ...font(-2800) },
);
fs.writeFileSync(output, JSON.stringify(project));
console.log({ open: open.length, muted: muted.length });
