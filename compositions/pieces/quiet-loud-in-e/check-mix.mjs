// Renders each track of quiet-loud.json to a stem with fluidsynth, applies the
// track gain, and compares guitar against drum levels per section, broadband
// and in the 800 Hz-4 kHz band where the guitars have to cut through.
//
// fluidsynth is not Toy MIDI's synth, so absolute levels differ, but both
// load the same SoundFonts, so the guitar-to-drum ratio carries over.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const dir = new URL("./stems/", import.meta.url).pathname;
mkdirSync(dir, { recursive: true });
const project = JSON.parse(readFileSync(new URL("./quiet-loud.json", import.meta.url)));
const GU = process.env.GU_SF2 ?? "/tmp/sf/GeneralUser-GS.sf2";
const TELE = new URL("./tele-bridge.sf3", import.meta.url).pathname;
const PPQ = 480, SR = 44100;

function vlq(n) {
  const out = [n & 0x7f];
  while ((n >>= 7)) out.unshift((n & 0x7f) | 0x80);
  return out;
}
function midiFile(track) {
  const drums = track.bank === 128, ch = drums ? 9 : 0;
  const ev = [];
  ev.push([0, [0xff, 0x51, 3, 0x07, 0xa1, 0x20]]); // 120 BPM
  ev.push([0, [0xb0 | ch, 101, 0], [0xb0 | ch, 100, 0], [0xb0 | ch, 6, 12]]); // bend range 12
  ev.push([0, [0xc0 | ch, track.program]]);
  for (const n of track.notes) {
    ev.push([Math.round(n.start * PPQ), [0x90 | ch, n.pitch, n.velocity]]);
    ev.push([Math.round((n.start + n.duration) * PPQ) - 1, [0x80 | ch, n.pitch, 0]]);
  }
  for (const a of track.automation ?? []) if (a.type === "pitch-bend")
    for (const p of a.points) {
      const v = Math.round(8192 + (p.semitones / 12) * 8191);
      ev.push([Math.round(p.beat * PPQ), [0xe0 | ch, v & 0x7f, v >> 7]]);
    }
  ev.push([100 * PPQ, [0xff, 0x2f, 0]]);
  ev.sort((a, b) => a[0] - b[0]);
  const body = [];
  let t = 0;
  for (const [tick, ...msgs] of ev) for (const m of msgs) { body.push(...vlq(tick - t), ...m); t = tick; }
  const hdr = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, PPQ >> 8, PPQ & 0xff];
  const len = body.length;
  return Buffer.from([...hdr, 0x4d, 0x54, 0x72, 0x6b, len >>> 24, (len >> 16) & 0xff, (len >> 8) & 0xff, len & 0xff, ...body]);
}

function renderStem(track) {
  const base = dir + track.name.replaceAll(" ", "_");
  writeFileSync(base + ".mid", midiFile(track));
  const sf = track.soundfont ? TELE : GU;
  execFileSync("fluidsynth", ["-ni", "-q", "-g", "0.5", "-r", String(SR), "-F", base + ".wav", sf, base + ".mid"], { stdio: "ignore" });
  return base + ".wav";
}
function pcm(wav, filter) {
  const args = ["-v", "error", "-i", wav, ...(filter ? ["-af", filter] : []), "-ac", "1", "-f", "f32le", "-ar", String(SR), "-"];
  const buf = execFileSync("ffmpeg", args, { maxBuffer: 1 << 30 });
  return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4);
}

const SECTIONS = [["Intro", 1, 4], ["Verse", 5, 8], ["Pre-chorus", 9, 12], ["Chorus", 13, 20], ["Lead break", 21, 24]];
const secSamples = (b0, b1) => [Math.round((b0 - 1) * 2 * SR), Math.round(b1 * 2 * SR)]; // 2 s per bar
const db = (x) => (10 * Math.log10(x + 1e-12)).toFixed(1);
const BANDS = { broadband: null, "800 Hz-4 kHz": "highpass=f=800:poles=2,lowpass=f=4000:poles=2" };

const stems = project.midiTracks.map((t) => ({ t, wav: renderStem(t) }));
for (const [band, filter] of Object.entries(BANDS)) {
  const data = stems.map(({ t, wav }) => ({ t, x: pcm(wav, filter) }));
  const power = (sel, a, b) => data.filter(({ t }) => sel(t)).reduce((sum, { t, x }) => {
    let s = 0;
    for (let i = a; i < Math.min(b, x.length); i++) s += x[i] * x[i];
    return sum + (s / (b - a)) * t.gain * t.gain;
  }, 0);
  console.log(`\n${band}: guitar power vs drum power, dB`);
  for (const [name, b0, b1] of SECTIONS) {
    const [a, b] = secSamples(b0, b1);
    const gtr = power((t) => !!t.soundfont, a, b), drm = power((t) => t.name === "Drums", a, b);
    const lead = power((t) => t.name === "High Gain Lead", a, b);
    const bars = [];
    for (let k = b0; k <= b1; k++) {
      const [c, d] = secSamples(k, k);
      bars.push(+db(power((t) => !!t.soundfont, c, d) / power((t) => t.name === "Drums", c, d)));
    }
    console.log(`${name.padEnd(11)} guitars ${db(gtr)}  drums ${db(drm)}  ratio ${db(gtr / drm)}  worst bar ${Math.min(...bars)}` +
      (lead ? `  lead vs drums ${db(lead / drm)}` : ""));
  }
}
