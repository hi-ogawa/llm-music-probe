// Per-track loudness of a toy-midi project: project JSON -> one .mid per
// track -> fluidsynth -> track gain -> integrated LUFS per track and for the mix.
//
// Usage:
//   node loudness.mjs <share-link | payload | project.json> [--out <dir>] [--sf2 <file>] [--mp3]
//
// Requires fluidsynth and ffmpeg on PATH. Writes .mid/.wav files into --out
// (default ./out/<title>) and prints a Markdown table.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { inflateRawSync } from "node:zlib";

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--") && !isFlagValue(a));
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
function isFlagValue(a) {
  const i = args.indexOf(a);
  return i > 0 && ["--out", "--sf2"].includes(args[i - 1]);
}
if (!input) {
  console.error(
    "usage: node loudness.mjs <share-link | payload | project.json> [--out dir] [--sf2 file] [--mp3]",
  );
  process.exit(1);
}

const sf2 = path.resolve(
  flag("--sf2") ?? path.join(import.meta.dirname, "GeneralUser-GS.sf2"),
);
const project = loadProject(input);
const slug = (project.title || "project")
  .replace(/[^\w-]+/g, "-")
  .toLowerCase();
const outDir = path.resolve(flag("--out") ?? path.join("out", slug));
fs.mkdirSync(outDir, { recursive: true });

// --- load ---

function loadProject(input) {
  if (fs.existsSync(input)) {
    return JSON.parse(fs.readFileSync(input, "utf8"));
  }
  const payload = input.includes("#p=") ? input.split("#p=")[1] : input;
  return JSON.parse(
    inflateRawSync(Buffer.from(payload, "base64url")).toString(),
  );
}

// --- minimal SMF writer (format 0, one channel) ---

const PPQ = 480;

function vlq(n) {
  const bytes = [n & 0x7f];
  while ((n >>= 7)) {
    bytes.unshift((n & 0x7f) | 0x80);
  }
  return bytes;
}

function writeMidi(file, { tempo, timeSignature, track }) {
  const drums = track.bank === 128;
  const ch = drums ? 9 : 0;
  const events = []; // [tick, order, bytes]; order puts note-offs before note-ons on the same tick
  for (const n of track.notes) {
    const on = Math.round(n.start * PPQ);
    const off = Math.max(on + 1, Math.round((n.start + n.duration) * PPQ));
    events.push([on, 1, [0x90 | ch, n.pitch, n.velocity ?? 100]]);
    events.push([off, 0, [0x80 | ch, n.pitch, 0]]);
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const usPerBeat = Math.round(60_000_000 / tempo);
  const denomPow = Math.log2(timeSignature?.denominator ?? 4);
  const head = [
    0,
    0xff,
    0x51,
    3,
    (usPerBeat >> 16) & 0xff,
    (usPerBeat >> 8) & 0xff,
    usPerBeat & 0xff,
    0,
    0xff,
    0x58,
    4,
    timeSignature?.numerator ?? 4,
    denomPow,
    24,
    8,
    ...(drums ? [] : [0, 0xb0 | ch, 0, track.bank ?? 0]),
    0,
    0xc0 | ch,
    track.program,
  ];
  const body = [];
  let last = 0;
  for (const [tick, , bytes] of events) {
    body.push(...vlq(tick - last), ...bytes);
    last = tick;
  }
  body.push(...vlq(PPQ * 2), 0xff, 0x2f, 0); // two beats of tail, then end of track

  const data = [...head, ...body];
  const u32 = (n) => [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ];
  fs.writeFileSync(
    file,
    Buffer.from([
      ...Buffer.from("MThd"),
      ...u32(6),
      0,
      0,
      0,
      1,
      (PPQ >> 8) & 0xff,
      PPQ & 0xff,
      ...Buffer.from("MTrk"),
      ...u32(data.length),
      ...data,
    ]),
  );
}

// --- render and measure ---

const run = (cmd, argv) =>
  execFileSync(cmd, argv, { stdio: ["ignore", "pipe", "pipe"] });

function render(mid, wav) {
  run("fluidsynth", [
    "-ni",
    "-q",
    "-R",
    "0",
    "-C",
    "0",
    "-g",
    "0.5",
    "-r",
    "48000",
    "-F",
    wav,
    sf2,
    mid,
  ]);
}

function applyGain(src, dst, gain) {
  run("ffmpeg", ["-y", "-v", "error", "-i", src, "-af", `volume=${gain}`, dst]);
}

// ebur128 prints its summary on stderr
function measure(wav) {
  const { stderr } = spawnSync(
    "ffmpeg",
    ["-nostats", "-i", wav, "-af", "ebur128=framelog=quiet", "-f", "null", "-"],
    {
      encoding: "utf8",
    },
  );
  const m = stderr.match(
    /Integrated loudness:\s*\n\s*I:\s*(-?[\d.]+|-inf)\s*LUFS/,
  );
  return m ? Number(m[1]) : NaN;
}

const db = (g) => (g > 0 ? 20 * Math.log10(g) : -Infinity);
const fmt = (x, d = 1) => (Number.isFinite(x) ? x.toFixed(d) : "–");

const rows = [];
const gained = [];
project.midiTracks.forEach((track, i) => {
  const id = String(i + 1).padStart(2, "0");
  const base = path.join(
    outDir,
    `${id}-${track.name.replace(/[^\w-]+/g, "-").toLowerCase()}`,
  );
  const gain = track.gain ?? 1;
  const notes = track.notes ?? [];
  const row = {
    name: track.name,
    preset: `${track.bank ?? 0}/${track.program}`,
    notes: notes.length,
    velocity: notes.length
      ? notes.reduce((s, n) => s + (n.velocity ?? 100), 0) / notes.length
      : NaN,
    gainDb: db(gain),
    muted: !!track.muted,
  };
  rows.push(row);
  if (track.muted || notes.length === 0) {
    return;
  }
  writeMidi(`${base}.mid`, {
    tempo: project.tempo,
    timeSignature: project.timeSignature,
    track,
  });
  render(`${base}.mid`, `${base}-raw.wav`);
  applyGain(`${base}-raw.wav`, `${base}.wav`, gain);
  row.rawLufs = measure(`${base}-raw.wav`);
  row.lufs = measure(`${base}.wav`);
  gained.push(`${base}.wav`);
  if (args.includes("--mp3")) {
    run("ffmpeg", [
      "-y",
      "-v",
      "error",
      "-i",
      `${base}.wav`,
      "-b:a",
      "192k",
      `${base}.mp3`,
    ]);
  }
});

const mixWav = path.join(outDir, "00-mix.wav");
run("ffmpeg", [
  "-y",
  "-v",
  "error",
  ...gained.flatMap((f) => ["-i", f]),
  "-filter_complex",
  `amix=inputs=${gained.length}:normalize=0:duration=longest`,
  mixWav,
]);
const mixLufs = measure(mixWav);
if (args.includes("--mp3")) {
  run("ffmpeg", [
    "-y",
    "-v",
    "error",
    "-i",
    mixWav,
    "-b:a",
    "192k",
    mixWav.replace(/\.wav$/, ".mp3"),
  ]);
}

console.log(`# ${project.title} (${project.tempo} BPM)\n`);
console.log(
  `SoundFont: ${path.basename(sf2)}, fluidsynth with reverb and chorus off. Mix: ${fmt(mixLufs)} LUFS.\n`,
);
console.log(
  "| Track | Preset (bank/program) | Notes | Mean velocity | Gain (dB) | LUFS before gain | LUFS | Δ vs mix (LU) |",
);
console.log("|---|---|---|---|---|---|---|---|");
for (const r of rows) {
  const lufsCell = r.muted ? "muted" : fmt(r.lufs);
  console.log(
    `| ${r.name} | ${r.preset} | ${r.notes} | ${fmt(r.velocity, 0)} | ${fmt(r.gainDb)} | ${fmt(r.rawLufs)} | ${lufsCell} | ${fmt(r.lufs - mixLufs)} |`,
  );
}
console.log(`\nFiles: ${outDir}`);
