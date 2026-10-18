// Offline amp sim prototype for the guitar demos.
//
// Renders a project with Toy MIDI's offline render tool (tools/render in a
// toy-midi checkout), runs each guitar track through a drive stage and a
// filter-based cabinet chosen by the gain its name starts with (Clean, Crunch,
// High Gain), and remixes. Each variant's mix is loudness-normalized so the
// A/B compares tone, not level.
//
//   node amp-sim.mjs <project.json> --toy-midi <checkout> --out <dir> [--lespaul <sf3>]

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    "toy-midi": { type: "string" },
    out: { type: "string" },
    lespaul: { type: "string" },
  },
});
const [projectPath] = positionals;
const toyMidi = values["toy-midi"];
const outDir = path.resolve(values.out);
const MIX_LUFS = -16;

// Guitar tone controls before the drive, like a mid-boost overdrive pedal in
// front of the amp. It tightens the low end so the distortion doesn't flub.
const PRE = "highpass=f=90,equalizer=f=750:t=o:w=1.2:g=4";
// Speaker cabinet as filters: a guitar speaker rolls off steeply above about
// 5 kHz, which removes the fizz that clipping adds, with a presence bump and a
// low-mid dip.
const CAB = [
  "highpass=f=75",
  "lowpass=f=5200",
  "lowpass=f=5200",
  "lowpass=f=7000",
  "equalizer=f=2400:t=o:w=1:g=3",
  "equalizer=f=450:t=o:w=1.5:g=-2.5",
].join(",");
const CLIP = "asoftclip=type=tanh";

// Drive stages run at 4x the sample rate, so the harmonics that clipping adds
// above the original Nyquist frequency are filtered out on the way back down
// instead of aliasing. asoftclip's own oversample option overshoots by about
// 9 dB, so the resampling is explicit.
function oversampled(rate, stages) {
  return [`aresample=${rate * 4}`, ...stages, `aresample=${rate}`].join(",");
}

const AMP = {
  clean: () => CAB,
  crunch: (rate) =>
    [PRE, oversampled(rate, ["volume=20dB", CLIP]), CAB].join(","),
  "high gain": (rate) =>
    [
      PRE,
      oversampled(rate, [
        "volume=24dB",
        CLIP,
        "equalizer=f=1000:t=o:w=1:g=3",
        "volume=12dB",
        CLIP,
      ]),
      CAB,
    ].join(","),
};

// General MIDI stand-ins for the baseline: Clean 27, Muted 28, Overdriven 29,
// Distortion 30.
const GM = { clean: 27, crunch: 29, "high gain": 30 };

function gainOf(track) {
  const name = track.name.toLowerCase();
  return Object.keys(AMP).find((g) => name.startsWith(g));
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

function render(project, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "project.json");
  fs.writeFileSync(file, JSON.stringify(project));
  execFileSync(
    "pnpm",
    ["exec", "tsx", "tools/render/render.ts", file, "--out", path.join(dir, "render")],
    { cwd: toyMidi, stdio: ["ignore", "ignore", "inherit"] },
  );
  return path.join(dir, "render");
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

// Run each guitar track through its amp, matched to its dry loudness, then
// apply the track's gain and pan. Other tracks keep the render tool's output.
function amp(project, renderDir, ampDir) {
  fs.mkdirSync(ampDir, { recursive: true });
  return project.midiTracks.map((track, i) => {
    const { raw, post } = trackFiles(renderDir, i, track);
    const gain = gainOf(track);
    if (!gain) return { track, file: post, guitar: false };
    const driven = path.join(ampDir, path.basename(raw));
    // Float samples, because in the 16-bit format the drive's volume boost
    // would hard-clip before the soft clipper sees it, and headroom so the
    // cabinet's boosts don't clip the 16-bit file. The track is
    // loudness-matched afterwards anyway.
    const chain = AMP[gain](sampleRate(raw));
    ffmpeg(["-i", raw, "-af", `aformat=sample_fmts=flt,${chain},volume=-18dB`, driven]);
    const match = lufs(raw) - lufs(driven);
    const file = path.join(ampDir, path.basename(post));
    ffmpeg([
      "-i",
      driven,
      "-af",
      `volume=${match}dB,${channelFilter(track.gain ?? 1, track.pan ?? 0)}`,
      file,
    ]);
    return { track, file, guitar: true };
  });
}

const project = JSON.parse(fs.readFileSync(projectPath, "utf8"));
const solo = (tracks) => tracks.filter((t) => t.guitar).map((t) => t.file);
const all = (tracks) => tracks.map((t) => t.file);
fs.mkdirSync(outDir, { recursive: true });

// 1. The Telecaster as written, no amp.
const teleRender = render(project, path.join(outDir, "tele"));
const teleDry = project.midiTracks.map((track, i) => ({
  track,
  file: trackFiles(teleRender, i, track).post,
  guitar: Boolean(gainOf(track)),
}));
mix(all(teleDry), path.join(outDir, "1-tele-dry.mp3"));

// 2. General MIDI's guitars, the baseline.
const gmProject = structuredClone(project);
for (const track of gmProject.midiTracks) {
  const gain = gainOf(track);
  if (!gain) continue;
  const muted = track.program === 1;
  delete track.soundfont;
  track.program = muted ? 28 : GM[gain];
}
const gmRender = render(gmProject, path.join(outDir, "gm"));
const gm = gmProject.midiTracks.map((track, i) => ({
  track,
  file: trackFiles(gmRender, i, track).post,
  guitar: Boolean(gainOf(track)),
}));
mix(all(gm), path.join(outDir, "2-gm.mp3"));
mix(solo(gm), path.join(outDir, "2-gm-guitars.mp3"));

// 3. The Telecaster through the amp sim.
const tele = amp(project, teleRender, path.join(outDir, "tele", "amp"));
mix(all(tele), path.join(outDir, "3-tele-amp.mp3"));
mix(solo(tele), path.join(outDir, "3-tele-amp-guitars.mp3"));

// 4. The Les Paul bridge through the same amp sim.
if (values.lespaul) {
  const lpProject = structuredClone(project);
  for (const track of lpProject.midiTracks) {
    if (!gainOf(track)) continue;
    delete track.soundfont;
    track.sf2 = path.resolve(values.lespaul);
  }
  const lpRender = render(lpProject, path.join(outDir, "lespaul"));
  const lp = amp(lpProject, lpRender, path.join(outDir, "lespaul", "amp"));
  mix(all(lp), path.join(outDir, "4-lespaul-amp.mp3"));
  mix(solo(lp), path.join(outDir, "4-lespaul-amp-guitars.mp3"));
}
