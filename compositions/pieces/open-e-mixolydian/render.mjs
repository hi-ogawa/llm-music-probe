// Level check: renders each track as a stem with fluidsynth, applies the track gain,
// and compares riff and lead RMS against the drums bar by bar.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const require = createRequire("/tmp/compose-hard-rock/.tools/package.json");
const { Midi } = require("@tonejs/midi");

const project = JSON.parse(readFileSync(new URL("./project.json", import.meta.url)));
const GM = "/home/hiroshi/code/personal/toy-midi-issue-863-render-scripts/public/soundfonts/GeneralUserGS-2.0.3.sf3";
const TELE = new URL("./tele-bridge.sf3", import.meta.url).pathname;
const spb = 60 / project.tempo;
mkdirSync("/tmp/compose-hard-rock/stems", { recursive: true }); // scratch, safe to delete

const RATE = 44100;
const stems = {};
for (const [i, track] of project.midiTracks.entries()) {
  const midi = new Midi();
  midi.header.setTempo(project.tempo);
  const t = midi.addTrack();
  const isDrum = track.bank === 128;
  t.channel = isDrum ? 9 : 0;
  t.instrument.number = track.program;
  // pitch-bend range 12 semitones via RPN 0, as toy-midi does
  const cc = (number, value) => t.addCC({ number, value: value / 127, time: 0 });
  cc(101, 0); cc(100, 0); cc(6, 12); cc(38, 0);
  for (const nn of track.notes)
    t.addNote({ midi: nn.pitch, time: nn.start * spb, duration: nn.duration * spb, velocity: nn.velocity / 127 });
  for (const a of track.automation ?? [])
    for (const p of a.points) t.addPitchBend({ time: p.beat * spb, value: p.semitones / 12 });
  const mid = `/tmp/compose-hard-rock/stems/${i}.mid`;
  const wav = `/tmp/compose-hard-rock/stems/${i}.wav`;
  writeFileSync(mid, Buffer.from(midi.toArray()));
  const sf = track.soundfont ? TELE : GM;
  execFileSync("fluidsynth", ["-ni", "-q", "-g", "0.5", "-r", String(RATE), "-F", wav, "-T", "wav", "-O", "float", sf, mid], {
    stdio: "ignore",
  });
  // mono float samples via ffmpeg
  const raw = execFileSync("ffmpeg", ["-v", "quiet", "-i", wav, "-ac", "1", "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
  stems[track.name] = x.map((v) => v * track.gain);
}

const group = (pred) => {
  const names = Object.keys(stems).filter(pred);
  const len = Math.max(...names.map((n) => stems[n].length));
  const out = new Float32Array(len);
  for (const n of names) stems[n].forEach((v, i) => (out[i] += v));
  return out;
};
const riff = group((n) => n.startsWith("Crunch L"));
const rhythm = group((n) => n.startsWith("Crunch R"));
const lead = group((n) => n.startsWith("High Gain"));
const drums = group((n) => n === "Drums");
const bass = group((n) => n === "Bass");

const db = (x, a, b) => {
  let s = 0, c = 0;
  for (let i = a; i < Math.min(b, x.length); i++) (s += x[i] * x[i]), c++;
  return c && s > 0 ? 10 * Math.log10(s / c) : -Infinity;
};
const barSamples = 4 * spb * RATE;
const f = (v) => (v === -Infinity ? "   --" : v.toFixed(1).padStart(5));
console.log("bar  drums  bass  riffL rhyR  lead | riff-drums lead-drums");
for (let bar = 1; bar <= 24; bar++) {
  const a = Math.round((bar - 1) * barSamples), b = Math.round(bar * barSamples);
  const [dr, ba, ri, rh, le] = [drums, bass, riff, rhythm, lead].map((x) => db(x, a, b));
  console.log(
    `${String(bar).padStart(3)} ${f(dr)} ${f(ba)} ${f(ri)} ${f(rh)} ${f(le)} | ${f(ri - dr)}     ${f(le - dr)}`,
  );
}

// Full-mix peak with pan (equal-power) and master gain, to check for clipping
let peak = 0;
const tracks = project.midiTracks.map((t) => [stems[t.name], t.pan ?? 0]);
const len = Math.max(...tracks.map(([x]) => x.length));
for (let i = 0; i < len; i++) {
  let l = 0, r = 0;
  for (const [x, pan] of tracks) {
    const v = x[i] ?? 0, a = ((pan + 1) * Math.PI) / 4;
    l += v * Math.cos(a); r += v * Math.sin(a);
  }
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
}
console.log(`mix peak ${(20 * Math.log10(peak * project.masterGain)).toFixed(1)} dBFS (fluidsynth -g 0.5)`);
