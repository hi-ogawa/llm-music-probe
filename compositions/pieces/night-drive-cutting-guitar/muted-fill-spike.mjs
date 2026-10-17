import { execFileSync } from "node:child_process";
import fs from "node:fs";
const p = JSON.parse(fs.readFileSync("/tmp/nd.json", "utf8"));
const gtr = p.midiTracks.find((t) => t.program === 27);
const BEATS_PER_BAR = 4, PPQ = 480;
const first = Math.min(...gtr.notes.map((n) => n.start));
const from = Math.floor(first / 4) * 4, to = from + 16 * BEATS_PER_BAR; // 16 bars
const stabs = gtr.notes.filter((n) => n.start >= from && n.start < to).map((n) => ({ ...n, start: n.start - from }));

// group stabs into hits
const hits = [];
for (const n of [...stabs].sort((a, b) => a.start - b.start)) {
  const h = hits.at(-1);
  if (h && n.start - h.start < 0.06) h.notes.push(n); else hits.push({ start: n.start, notes: [n] });
}
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// muted 16th fill: every free 16th inside a bar where the guitar plays
function fill() {
  const out = [];
  const bars = new Set(hits.map((h) => Math.floor(h.start / 4)));
  for (const bar of bars) for (let s = 0; s < 16; s++) {
    const t = bar * 4 + s / 4;
    if (hits.some((h) => Math.abs(h.start - t) < 0.2)) continue;
    const prev = [...hits].reverse().find((h) => h.start <= t) ?? hits[0];
    const pitches = prev.notes.map((n) => n.pitch).sort((a, b) => a - b);
    const down = s % 2 === 0;
    const order = down ? pitches : [...pitches].reverse();
    order.forEach((pitch, i) => out.push({
      pitch, start: t + i * 0.012 + (rnd() - 0.5) * 0.01, duration: 0.04,
      velocity: Math.round((down ? 38 : 30) + rnd() * 8 - i * 3), mute: true,
    }));
  }
  return out;
}

function vlq(n) { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; }
function midi(file, notes, program) {
  const ev = [];
  for (const n of notes) {
    const on = Math.max(0, Math.round(n.start * PPQ)), off = Math.max(on + 1, Math.round((n.start + n.duration) * PPQ));
    ev.push([on, 1, [0x90, n.pitch, n.velocity]], [off, 0, [0x80, n.pitch, 0]]);
  }
  ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const us = Math.round(60e6 / p.tempo);
  const body = [0, 0xff, 0x51, 3, (us >> 16) & 255, (us >> 8) & 255, us & 255, 0, 0xc0, program];
  let last = 0; for (const [t, , b] of ev) { body.push(...vlq(t - last), ...b); last = t; }
  body.push(...vlq(PPQ * 2), 0xff, 0x2f, 0);
  const trk = Buffer.from(body);
  const hdr = Buffer.from([0x4d,0x54,0x68,0x64,0,0,0,6,0,0,0,1,(PPQ>>8)&255,PPQ&255,0x4d,0x54,0x72,0x6b]);
  const len = Buffer.alloc(4); len.writeUInt32BE(trk.length);
  fs.writeFileSync(file, Buffer.concat([hdr, len, trk]));
}
const run = (c, a) => execFileSync(c, a, { stdio: ["ignore", "pipe", "pipe"] });
const fonts = { gu: "/tmp/sf/GeneralUser-GS.sf2", fsbs: "/tmp/egtr/fsbs.sf2" };
const muted = fill();
for (const [font, sf] of Object.entries(fonts)) for (const withFill of [false, true]) {
  const name = `${font}-${withFill ? "fill" : "stabs"}`;
  const parts = [];
  const stabProg = font === "gu" ? 27 : 0;
  midi(`out/${name}-a.mid`, stabs, stabProg); parts.push(`${name}-a`);
  if (withFill) {
    if (font === "gu") { midi(`out/${name}-b.mid`, muted, 28); parts.push(`${name}-b`); }
    else { midi(`out/${name}-a.mid`, [...stabs, ...muted], 0); }
  }
  for (const part of parts) run("fluidsynth", ["-ni", "-q", "-g", "0.5", "-r", "48000", "-F", `out/${part}.wav`, sf, `out/${part}.mid`]);
  const inputs = parts.flatMap((x) => ["-i", `out/${x}.wav`]);
  run("ffmpeg", ["-y", "-v", "error", ...inputs, "-filter_complex",
    `${parts.length > 1 ? `amix=inputs=${parts.length}:normalize=0,` : ""}loudnorm=I=-18:TP=-1.5`, "-ar", "48000", "-b:a", "192k", `out/${name}.mp3`]);
  console.log(name, parts);
}
console.log({ from, bars: 16, stabHits: hits.length, mutedStrokes: new Set(muted.map((m) => m.start.toFixed(1))).size });
