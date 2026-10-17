// Stroke simulation for Night Drive's cutting guitar on FSBS.
//
// Usage: node stroke.mjs <in project.json> <out project.json> [--fsbs]
//
// Without --fsbs, the output stays a plain Toy MIDI project on GeneralUser
// program 27, for reviewing the notes. With --fsbs, both guitar tracks render
// on FSBS with the release offsets below.
//
// Splits the guitar into two FSBS channels:
// - open: accents, and every stab in the sparse bars, choked with a shorter release
// - muted: the non-accent 16ths in the continuous bars, faked as left-hand mutes
//   with very short notes and a very short release, since FSBS has no mute samples
// and re-strokes every hit: downstrokes on even 16ths roll low to high, upstrokes
// roll high to low, with per-stroke spread, velocity taper, and jitter.

import fs from "node:fs";

const [input, output] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const fsbs = process.argv.includes("--fsbs");
const project = JSON.parse(fs.readFileSync(input, "utf8"));
const gi = project.midiTracks.findIndex((t) => t.name === "Guitar (clean cutting)");
const guitar = project.midiTracks[gi];
const BEAT_MS = 60000 / project.tempo;
const ms = (x) => x / BEAT_MS; // milliseconds to beats

let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const jit = (amount) => (rnd() * 2 - 1) * amount;

// group notes into hits
const hits = [];
for (const n of [...guitar.notes].sort((a, b) => a.start - b.start)) {
  const h = hits.at(-1);
  if (h && n.start - h.start < 0.06) h.notes.push(n);
  else hits.push({ start: n.start, notes: [n] });
}
const perBar = {};
for (const h of hits) perBar[Math.floor(h.start / 4)] = (perBar[Math.floor(h.start / 4)] ?? 0) + 1;

const open = [];
const muted = [];
for (const h of hits) {
  const grid = Math.round(h.start * 4) / 4;
  const down = Math.round(grid * 4) % 2 === 0;
  const continuous = perBar[Math.floor(h.start / 4)] >= 12;
  const vel = Math.max(...h.notes.map((n) => n.velocity));
  const accent = vel >= 75;
  const isMuted = continuous && !accent;
  const grip = [...new Set(h.notes.map((n) => n.pitch))].sort((a, b) => a - b);

  // strings struck, in stroke order
  let strings = grip;
  if (isMuted) strings = down ? [grip[0] - 5, ...grip] : grip.slice(-2);
  if (!down) strings = [...strings].reverse();

  // total spread across the stroke
  const spread = ms(accent ? 18 : isMuted ? (down ? 8 : 5) : 12) + ms(jit(3));
  const step = strings.length > 1 ? spread / (strings.length - 1) : 0;
  const start = h.start + ms(jit(4)); // keeps the written upstroke push, plus jitter
  const len = Math.max(...h.notes.map((n) => n.duration));
  const end = start + len; // open strokes choke together

  strings.forEach((pitch, i) => {
    const t = start + i * step + (i ? ms(jit(1.5)) : 0);
    const taper = strings.length > 1 ? 4 - (8 * i) / (strings.length - 1) : 0;
    const velocity = Math.max(1, Math.min(127, Math.round(vel - (accent ? 3 : 2) + taper + jit(4))));
    if (isMuted) muted.push({ pitch, start: t, duration: ms(22 + jit(4)), velocity });
    else open.push({ pitch, start: t, duration: Math.max(ms(30), end - t), velocity });
  });
}

// The muted channel is 6 dB up, because the short strokes lose most of their energy.
const font = (release) => (fsbs ? { sf2: "/tmp/egtr/fsbs.sf2", program: 0, nrpn: { 38: release } } : {});
project.midiTracks.splice(
  gi,
  1,
  { ...guitar, name: "Guitar (open)", notes: open, ...font(-1000) },
  { ...guitar, name: "Guitar (muted)", notes: muted, gain: guitar.gain * 2, ...font(-2800) },
);
fs.writeFileSync(output, JSON.stringify(project));
console.log({ hits: hits.length, open: open.length, muted: muted.length });
