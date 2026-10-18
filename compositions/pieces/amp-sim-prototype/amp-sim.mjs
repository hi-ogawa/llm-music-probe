// Offline amp sim prototype for the guitar demos.
//
// Renders a project with Toy MIDI's offline render tool (tools/render in a
// toy-midi checkout), runs each guitar track through the amp setting its name
// starts with (Clean, Crunch, High Gain), and remixes. Each call writes one
// variant, `<tag>.mp3` and `<tag>-guitars.mp3` with the guitars soloed, both
// loudness-normalized so an A/B compares tone, not level.
//
//   node amp-sim.mjs <project.json> --toy-midi <checkout> --out <dir> --tag <name>
//     [--amp v1|v2] [--ir <cabinet.wav>] [--room] [--sf2 <guitar font>]
//   node amp-sim.mjs <project.json> --toy-midi <checkout> --out <dir> --tag gm --gm

import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    "toy-midi": { type: "string" },
    out: { type: "string" },
    tag: { type: "string" },
    amp: { type: "string", default: "v2" },
    ir: { type: "string" },
    room: { type: "boolean", default: false },
    sf2: { type: "string" },
    gm: { type: "boolean", default: false },
  },
});
const [projectPath] = positionals;
const outDir = path.resolve(values.out);
const MIX_LUFS = -16;

// Guitar tone controls before the drive, like a mid-boost overdrive pedal in
// front of the amp. It tightens the low end so the distortion doesn't flub.
const PRE = "highpass=f=90,equalizer=f=750:t=o:w=1.2:g=4";
// Speaker cabinet as filters, for when no impulse response is given: a guitar
// speaker rolls off steeply above about 5 kHz, which removes the fizz that
// clipping adds, with a presence bump and a low-mid dip.
const FILTER_CAB = [
  "highpass=f=75",
  "lowpass=f=5200",
  "lowpass=f=5200",
  "lowpass=f=7000",
  "equalizer=f=2400:t=o:w=1:g=3",
  "equalizer=f=450:t=o:w=1.5:g=-2.5",
].join(",");
const TANH = "asoftclip=type=tanh";
// A DC offset before the clipper flattens one half of the wave more than the
// other, which adds even harmonics like a tube stage. The high-pass after it
// removes the offset again.
const ASYM_TANH = `dcshift=0.15,${TANH},highpass=f=20`;
// A compressor in front of the drive keeps a decaying note pushed into the
// clipper, so it sustains at full distortion instead of cleaning up.
const SUSTAIN = (ratio) =>
  `acompressor=threshold=0.03:ratio=${ratio}:attack=5:release=200:makeup=4`;

// Drive stages run at 4x the sample rate, so the harmonics that clipping adds
// above the original Nyquist frequency are filtered out on the way back down
// instead of aliasing. asoftclip's own oversample option overshoots by about
// 9 dB, so the resampling is explicit.
function oversampled(rate, stages) {
  return [`aresample=${rate * 4}`, ...stages, `aresample=${rate}`].join(",");
}

const AMPS = {
  v1: {
    clean: () => "",
    crunch: (rate) => [PRE, oversampled(rate, ["volume=20dB", TANH])].join(","),
    "high gain": (rate) =>
      [
        PRE,
        oversampled(rate, [
          "volume=24dB",
          TANH,
          "equalizer=f=1000:t=o:w=1:g=3",
          "volume=12dB",
          TANH,
        ]),
      ].join(","),
  },
  // Compression for sustain, asymmetric first stage, and cascaded stages that
  // each clip less, the way a high-gain preamp does.
  v2: {
    clean: () => SUSTAIN(2),
    crunch: (rate) =>
      [
        PRE,
        SUSTAIN(4),
        oversampled(rate, [
          "volume=18dB",
          ASYM_TANH,
          "equalizer=f=1000:t=o:w=1:g=2",
          "volume=6dB",
          TANH,
        ]),
      ].join(","),
    "high gain": (rate) =>
      [
        PRE,
        SUSTAIN(8),
        oversampled(rate, [
          "volume=18dB",
          ASYM_TANH,
          "highpass=f=120,equalizer=f=1000:t=o:w=1:g=3",
          "volume=14dB",
          TANH,
          "volume=10dB",
          TANH,
        ]),
      ].join(","),
  },
};
const AMP = AMPS[values.amp];

// A small room, as a few early reflections, because a fully dry distorted
// guitar sounds small next to a recorded one.
const ROOM = "aecho=0.9:0.6:19|31|47:0.18|0.12|0.08";

// General MIDI stand-ins for the baseline: Clean 27, Muted 28, Overdriven 29,
// Distortion 30.
const GM = { clean: 27, crunch: 29, "high gain": 30 };

function gainOf(track) {
  const name = track.name.toLowerCase();
  return Object.keys(GM).find((g) => name.startsWith(g));
}

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-y", "-v", "error", ...args]);
}

function lufs(wav) {
  // ebur128 prints its summary on stderr.
  const text = execFileSync(
    "sh",
    ["-c", `ffmpeg -nostats -i "${wav}" -af ebur128=framelog=quiet -f null - 2>&1`],
    { encoding: "utf8" },
  );
  const match = text.match(/I:\s*(-?[\d.]+|-inf)\s*LUFS/);
  return match[1] === "-inf" ? -Infinity : Number(match[1]);
}

function sampleRate(wav) {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "stream=sample_rate", "-of", "csv=p=0", wav],
    { encoding: "utf8" },
  );
  return Number(out.trim());
}

// Same equal-power pan as the render tool and Web Audio's StereoPannerNode.
function channelFilter(gain, pan) {
  const x = pan <= 0 ? pan + 1 : pan;
  const a = Math.cos((x * Math.PI) / 2);
  const b = Math.sin((x * Math.PI) / 2);
  const panFilter =
    pan <= 0
      ? `pan=stereo|c0=c0+${a}*c1|c1=${b}*c1`
      : `pan=stereo|c0=${a}*c0|c1=c1+${b}*c0`;
  return `volume=${gain},${panFilter}`;
}

// Render once per distinct project, so variants that only change the amp
// reuse the same render.
function render(project) {
  const json = JSON.stringify(project);
  const hash = crypto.createHash("sha1").update(json).digest("hex").slice(0, 8);
  const dir = path.join(outDir, `render-${hash}`);
  if (!fs.existsSync(path.join(dir, "00-mix.wav"))) {
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, "project.json");
    fs.writeFileSync(file, json);
    execFileSync(
      "pnpm",
      ["exec", "tsx", "tools/render/render.ts", file, "--out", dir],
      { cwd: values["toy-midi"], stdio: ["ignore", "ignore", "inherit"] },
    );
  }
  return dir;
}

function trackFiles(renderDir, index, track) {
  // The render tool's file naming.
  const slug = track.name.replace(/[^\w-]+/g, "-").toLowerCase();
  const stem = path.join(renderDir, `${String(index + 1).padStart(2, "0")}-${slug}`);
  return { raw: `${stem}-raw.wav`, post: `${stem}.wav` };
}

// Mix the given track files and normalize the mix to MIX_LUFS as an MP3.
function mix(inputs, output) {
  const tmp = output.replace(/\.mp3$/, ".wav");
  ffmpeg([
    ...inputs.flatMap((f) => ["-i", f]),
    "-filter_complex",
    `amix=inputs=${inputs.length}:normalize=0:duration=longest`,
    tmp,
  ]);
  const gain = MIX_LUFS - lufs(tmp);
  ffmpeg(["-i", tmp, "-af", `volume=${gain}dB`, "-b:a", "192k", output]);
  fs.rmSync(tmp);
}

// Run a guitar track's dry render through the amp and cabinet, matched to its
// dry loudness, then apply the track's gain and pan.
function ampTrack(track, raw, workDir) {
  const base = path.join(workDir, path.basename(raw, ".wav"));
  const rate = sampleRate(raw);
  // Mono, because a DI guitar is one signal. Float samples, because in the
  // 16-bit format the drive's volume boost would hard-clip before the soft
  // clipper sees it, and headroom so later boosts don't clip the 16-bit file.
  const amp = AMP[gainOf(track)](rate);
  const chain = ["aformat=sample_fmts=flt:channel_layouts=mono", amp, "volume=-18dB"];
  if (!values.ir) chain.push(FILTER_CAB);
  ffmpeg(["-i", raw, "-af", chain.filter(Boolean).join(","), `${base}-amp.wav`]);
  let cab = `${base}-amp.wav`;
  if (values.ir) {
    cab = `${base}-cab.wav`;
    ffmpeg([
      "-i",
      `${base}-amp.wav`,
      "-i",
      values.ir,
      "-filter_complex",
      `[1:a]aresample=${rate},aformat=channel_layouts=mono[ir];[0:a][ir]afir=gtype=peak`,
      cab,
    ]);
  }
  const match = lufs(raw) - lufs(cab);
  const post = [`volume=${match}dB`, "aformat=channel_layouts=stereo"];
  if (values.room) post.push(ROOM);
  post.push(channelFilter(track.gain ?? 1, track.pan ?? 0));
  const out = `${base}-out.wav`;
  ffmpeg(["-i", cab, "-af", post.join(","), out]);
  return out;
}

const project = JSON.parse(fs.readFileSync(projectPath, "utf8"));
const variant = structuredClone(project);
for (const track of variant.midiTracks) {
  const gain = gainOf(track);
  if (!gain) continue;
  if (values.gm) {
    track.program = track.program === 1 ? 28 : GM[gain];
    delete track.soundfont;
  } else if (values.sf2) {
    track.sf2 = path.resolve(values.sf2);
    delete track.soundfont;
  }
}

const renderDir = render(variant);
const workDir = path.join(outDir, values.tag);
fs.mkdirSync(workDir, { recursive: true });
const tracks = variant.midiTracks.map((track, i) => {
  const { raw, post } = trackFiles(renderDir, i, track);
  const guitar = Boolean(gainOf(track));
  const file = guitar && !values.gm ? ampTrack(track, raw, workDir) : post;
  return { file, guitar };
});
mix(
  tracks.map((t) => t.file),
  path.join(outDir, `${values.tag}.mp3`),
);
mix(
  tracks.filter((t) => t.guitar).map((t) => t.file),
  path.join(outDir, `${values.tag}-guitars.mp3`),
);
