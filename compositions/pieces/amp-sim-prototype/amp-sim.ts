import { execFile } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { parseArgs, promisify } from "node:util";

// Offline amp sim prototype for the guitar demos. Exports a project as MIDI
// with `toy-midi export-midi`, renders each MIDI track dry with fluidsynth on
// the track's SoundFont, runs each guitar track through the amp setting its
// name starts with (Clean, Crunch, High Gain), and remixes. Each run writes one
// variant as `<tag>.mp3` and `<tag>-guitars.mp3` with the guitars soloed, both
// loudness-normalized so an A/B compares tone, not level.

const USAGE = `\
Usage: node amp-sim.ts <project.json> --soundfonts <dir> --out <dir> --tag <name> [options]

Options:
  --amp none|v1|v2   Amp for the guitar tracks (default v2)
  --note-gate        Gate each guitar track's input by its note-offs
  --ir <cabinet.wav> Convolve with a cabinet impulse response instead of filters
  --no-cab           Leave out the cabinet
  --room             Add a short room after the amp
  --gm               Play the guitar tracks on General MIDI's guitars instead
  --cli <command>    toy-midi command (default toy-midi)
  --url <url>        Toy MIDI app for export-midi, such as a preview deploy`;

// The parts of Toy MIDI's SharedProject format this script reads.
type Project = {
  tempo: number;
  midiTracks: MidiTrack[];
};

type MidiTrack = {
  name: string;
  program: number;
  soundfont?: string;
  gain?: number;
  pan?: number;
  notes: { start: number; duration: number }[];
};

type Options = NonNullable<ReturnType<typeof parseCliOptions>>;

type GainLevel = keyof typeof GM_PROGRAMS;

type AmpName = keyof typeof AMPS;

const execFileAsync = promisify(execFile);

const MIX_LUFS = -16;

async function main() {
  const options = parseCliOptions(process.argv.slice(2));
  if (!options) {
    console.log(USAGE);
    return;
  }

  // Read the project, and for the General MIDI baseline, swap the guitar
  // tracks onto General MIDI's guitars.
  const project: Project = JSON.parse(fs.readFileSync(options.input, "utf8"));
  const variant = structuredClone(project);
  if (options.gm) {
    for (const track of variant.midiTracks) {
      const gain = findGainLevel(track);
      if (gain) {
        track.program = track.program === 1 ? 28 : GM_PROGRAMS[gain];
        delete track.soundfont;
      }
    }
  }

  // Export the project as MIDI and render each track dry on its SoundFont.
  const renderDir = await renderDryTracks({ project: variant, options });
  const workDir = path.join(options.out, options.tag);
  fs.mkdirSync(workDir, { recursive: true });

  // Run each guitar track through the amp, and give every track its gain and
  // pan.
  const tracks = await Promise.all(
    variant.midiTracks.map(async (track, index) => {
      const raw = getDryTrackPath({ renderDir, index, track });
      const gain = findGainLevel(track);
      const guitar = Boolean(gain);
      if (gain && !options.gm && options.amp !== "none") {
        const file = await runAmp({
          track,
          gain,
          amp: options.amp,
          raw,
          workDir,
          tempo: variant.tempo,
          options,
        });
        return { file, guitar };
      }
      const file = path.join(workDir, `${path.basename(raw, ".wav")}-out.wav`);
      await runFfmpeg(["-i", raw, "-af", buildChannelFilter(track), file]);
      return { file, guitar };
    }),
  );

  // Mix the full arrangement and the guitars alone, each loudness-normalized.
  await mixTracks(
    tracks.map((t) => t.file),
    path.join(options.out, `${options.tag}.mp3`),
  );
  await mixTracks(
    tracks.filter((t) => t.guitar).map((t) => t.file),
    path.join(options.out, `${options.tag}-guitars.mp3`),
  );
}

function parseCliOptions(args: string[]) {
  const { positionals, values } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      soundfonts: { type: "string" },
      out: { type: "string" },
      tag: { type: "string" },
      amp: { type: "string", default: "v2" },
      "note-gate": { type: "boolean", default: false },
      ir: { type: "string" },
      "no-cab": { type: "boolean", default: false },
      room: { type: "boolean", default: false },
      gm: { type: "boolean", default: false },
      cli: { type: "string", default: "toy-midi" },
      url: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
  });
  if (values.help) {
    return;
  }
  const [input] = positionals;
  if (
    !input ||
    positionals.length > 1 ||
    !values.soundfonts ||
    !values.out ||
    !values.tag
  ) {
    throw new Error(USAGE);
  }
  return {
    input,
    soundfonts: values.soundfonts,
    out: path.resolve(values.out),
    tag: values.tag,
    amp: parseAmp(values.amp),
    noteGate: values["note-gate"],
    ir: values.ir,
    noCab: values["no-cab"],
    room: values.room,
    gm: values.gm,
    cli: values.cli,
    url: values.url,
  };
}

function parseAmp(value: string): AmpName | "none" {
  if (value === "none" || value in AMPS) {
    return value as AmpName | "none";
  }
  throw new Error(`Unknown --amp ${value}\n\n${USAGE}`);
}

// --- rendering ----------------------------------------------------------------

// SoundFont files by a track's `soundfont`, as published on toy-midi's
// `soundfonts-1` release.
const SOUNDFONT_FILES: Record<string, string> = {
  "flamestudios-telecaster-bridge":
    "FlameStudios-Telecaster-Bridge-SM-b50f761.sf3",
  "flamestudios-telecaster-neck": "FlameStudios-Telecaster-Neck-SM-b50f761.sf3",
};
const DEFAULT_SOUNDFONT_FILE = "GeneralUserGS-2.0.3.sf3";

// Render each MIDI track dry, once per distinct project, so variants that
// only change the amp reuse the same render.
async function renderDryTracks({
  project,
  options,
}: {
  project: Project;
  options: Options;
}) {
  const json = JSON.stringify(project);
  const hash = crypto.createHash("sha1").update(json).digest("hex").slice(0, 8);
  const dir = path.join(options.out, `render-${hash}`);
  if (fs.existsSync(path.join(dir, "done"))) {
    return dir;
  }
  fs.mkdirSync(dir, { recursive: true });

  // Export a copy with every track at the dry gain and centered, so the MIDI
  // carries no mix, and the script applies each track's gain and pan after
  // the amp, as the app does after the synth.
  const dry: Project = {
    ...project,
    midiTracks: project.midiTracks.map((t) => ({ ...t, gain: DRY_GAIN, pan: 0 })),
  };
  const projectFile = path.join(dir, "project.json");
  const midiFile = path.join(dir, "project.mid");
  fs.writeFileSync(projectFile, JSON.stringify(dry));
  const url = options.url ? ["--url", options.url] : [];
  await execFileAsync(options.cli, [
    "export-midi",
    projectFile,
    midiFile,
    ...url,
  ]);

  // Render each track on its own SoundFont.
  const smf = fs.readFileSync(midiFile);
  await Promise.all(
    project.midiTracks.map(async (track, index) => {
      const raw = getDryTrackPath({ renderDir: dir, index, track });
      const trackMidi = raw.replace(/\.wav$/, ".mid");
      fs.writeFileSync(trackMidi, extractTrack(smf, index));
      const soundfont = path.join(
        options.soundfonts,
        (track.soundfont && SOUNDFONT_FILES[track.soundfont]) ??
          DEFAULT_SOUNDFONT_FILE,
      );
      await execFileAsync("fluidsynth", [
        ...["-n", "-i", "-q"],
        ...["-g", "0.5"],
        // Reverb and chorus off, so the render is dry.
        ...["-R", "0", "-C", "0"],
        ...["-r", "48000"],
        ...["-F", raw],
        soundfont,
        trackMidi,
      ]);
    }),
  );
  fs.writeFileSync(path.join(dir, "done"), "");
  return dir;
}

// export-midi writes a track's gain as CC 7 = round(127·√gain), so this gain
// becomes 100, the MIDI default. The amp's drive levels were tuned at that
// volume, and the drive depends on input level.
const DRY_GAIN = (100 / 127) ** 2;

function getDryTrackPath({
  renderDir,
  index,
  track,
}: {
  renderDir: string;
  index: number;
  track: MidiTrack;
}) {
  const slug = track.name.replace(/[^\w-]+/g, "-").toLowerCase();
  const number = String(index + 1).padStart(2, "0");
  return path.join(renderDir, `${number}-${slug}-raw.wav`);
}

// One track of an exported MIDI file, behind the file's conductor track, as a
// MIDI file of its own. Export MIDI writes the conductor first and then the
// project's tracks in order.
function extractTrack(smf: Buffer, index: number) {
  const chunks: Buffer[] = [];
  for (let p = 14; p < smf.length; ) {
    const length = smf.readUInt32BE(p + 4);
    chunks.push(smf.subarray(p, p + 8 + length));
    p += 8 + length;
  }
  const header = Buffer.from(smf.subarray(0, 14));
  header.writeUInt16BE(2, 10);
  return Buffer.concat([header, chunks[0]!, chunks[index + 1]!]);
}

// --- amp ------------------------------------------------------------------------

// Run a guitar track's dry render through the amp and cabinet, matched to its
// dry loudness, then apply the track's gain and pan.
async function runAmp({
  track,
  gain,
  amp,
  raw,
  workDir,
  tempo,
  options,
}: {
  track: MidiTrack;
  gain: GainLevel;
  amp: AmpName;
  raw: string;
  workDir: string;
  tempo: number;
  options: Options;
}) {
  const base = path.join(workDir, path.basename(raw, ".wav"));
  const rate = await readSampleRate(raw);
  // Mono, because a DI guitar is one signal. Float samples, because in the
  // 16-bit format the drive's volume boost would hard-clip before the soft
  // clipper sees it, and headroom so later boosts don't clip the 16-bit file.
  const mono = "aformat=sample_fmts=flt:channel_layouts=mono";
  const chain = [AMPS[amp][gain](rate), "volume=-18dB"];
  if (!options.ir && !options.noCab) {
    chain.push(FILTER_CABINET);
  }
  const filters = chain.filter(Boolean).join(",");
  const amped = `${base}-amp.wav`;
  if (options.noteGate) {
    const gate = `${base}-gate.wav`;
    writeNoteGate({ track, tempo, rate, file: gate });
    await runFfmpeg([
      ...["-i", raw, "-i", gate],
      "-filter_complex",
      `[0:a]${mono}[g];[1:a]${mono}[e];[g][e]amultiply,${filters}`,
      amped,
    ]);
  } else {
    await runFfmpeg(["-i", raw, "-af", `${mono},${filters}`, amped]);
  }
  let cabinet = amped;
  if (options.ir) {
    cabinet = `${base}-cab.wav`;
    await runFfmpeg([
      ...["-i", amped, "-i", options.ir],
      "-filter_complex",
      `[1:a]aresample=${rate},aformat=channel_layouts=mono[ir];[0:a][ir]afir=gtype=peak`,
      cabinet,
    ]);
  }
  const match =
    (await measureLoudness(raw)) - (await measureLoudness(cabinet));
  const post = [`volume=${match}dB`, "aformat=channel_layouts=stereo"];
  if (options.room) {
    post.push(ROOM);
  }
  post.push(buildChannelFilter(track));
  const out = `${base}-out.wav`;
  await runFfmpeg(["-i", cabinet, "-af", post.join(","), out]);
  return out;
}

// General MIDI stand-ins for `--gm`: Clean 27, Overdriven 29, Distortion 30.
// Muted tracks play Muted Guitar (28).
const GM_PROGRAMS = { clean: 27, crunch: 29, "high gain": 30 };

function findGainLevel(track: MidiTrack) {
  const name = track.name.toLowerCase();
  return (Object.keys(GM_PROGRAMS) as GainLevel[]).find((gain) =>
    name.startsWith(gain),
  );
}

// Guitar tone controls before the drive, like a mid-boost overdrive pedal in
// front of the amp. It tightens the low end so the distortion doesn't flub.
const PRE_EQ = "highpass=f=90,equalizer=f=750:t=o:w=1.2:g=4";

// Speaker cabinet as filters: a guitar speaker rolls off steeply above about
// 5 kHz, which removes the fizz that clipping adds, with a presence bump and a
// low-mid dip.
const FILTER_CABINET = [
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
const ASYMMETRIC_TANH = `dcshift=0.15,${TANH},highpass=f=20`;

// A compressor in front of the drive keeps a decaying note pushed into the
// clipper, so it sustains at full distortion instead of cleaning up.
function buildSustainCompressor(ratio: number) {
  return `acompressor=threshold=0.03:ratio=${ratio}:attack=5:release=200:makeup=4`;
}

// Drive stages run at 4x the sample rate, so the harmonics that clipping adds
// above the original Nyquist frequency are filtered out on the way back down
// instead of aliasing. asoftclip's own oversample option overshoots by about
// 9 dB, so the resampling is explicit.
function buildOversampled(rate: number, stages: string[]) {
  return [`aresample=${rate * 4}`, ...stages, `aresample=${rate}`].join(",");
}

const AMPS = {
  v1: {
    clean: () => "",
    crunch: (rate) =>
      [PRE_EQ, buildOversampled(rate, ["volume=20dB", TANH])].join(","),
    "high gain": (rate) =>
      [
        PRE_EQ,
        buildOversampled(rate, [
          "volume=24dB",
          TANH,
          "equalizer=f=1000:t=o:w=1:g=3",
          "volume=12dB",
          TANH,
        ]),
      ].join(","),
  },
  // Compression for sustain, an asymmetric first stage, and cascaded stages
  // that each clip less, the way a high-gain preamp does.
  v2: {
    clean: () => buildSustainCompressor(2),
    crunch: (rate) =>
      [
        PRE_EQ,
        buildSustainCompressor(4),
        buildOversampled(rate, [
          "volume=18dB",
          ASYMMETRIC_TANH,
          "equalizer=f=1000:t=o:w=1:g=2",
          "volume=6dB",
          TANH,
        ]),
      ].join(","),
    "high gain": (rate) =>
      [
        PRE_EQ,
        buildSustainCompressor(8),
        buildOversampled(rate, [
          "volume=18dB",
          ASYMMETRIC_TANH,
          "highpass=f=120,equalizer=f=1000:t=o:w=1:g=3",
          "volume=14dB",
          TANH,
          "volume=10dB",
          TANH,
        ]),
      ].join(","),
  },
} satisfies Record<string, Record<GainLevel, (rate: number) => string>>;

// A small room, as a few early reflections, because a fully dry distorted
// guitar sounds small next to a recorded one.
const ROOM = "aecho=0.9:0.6:19|31|47:0.18|0.12|0.08";

// A gate keyed to the notes rather than to the audio level: open while a note
// is held, closing over NOTE_GATE_RELEASE seconds after its note-off, like the
// fretting hand letting go of the string. Without it, the compressor and drive
// raise each note's decay after note-off to full distortion and smear the
// phrasing, and a gate on the audio level can't tell that decay from a held
// note's sustain.
const NOTE_GATE_RELEASE = 0.03;

function writeNoteGate({
  track,
  tempo,
  rate,
  file,
}: {
  track: MidiTrack;
  tempo: number;
  rate: number;
  file: string;
}) {
  const toSeconds = (beat: number) => (beat * 60) / tempo;
  const end = Math.max(...track.notes.map((n) => n.start + n.duration));
  const envelope = new Float32Array(Math.ceil((toSeconds(end) + 1) * rate));
  const release = NOTE_GATE_RELEASE * rate;
  for (const note of track.notes) {
    const on = Math.round(toSeconds(note.start) * rate);
    const off = Math.round(toSeconds(note.start + note.duration) * rate);
    for (let i = on; i < off + release && i < envelope.length; i++) {
      const level = i < off ? 1 : 1 - (i - off) / release;
      envelope[i] = Math.max(envelope[i]!, level);
    }
  }
  // 32-bit float mono WAV.
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + envelope.byteLength, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(3, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(32, 34);
  header.write("data", 36);
  header.writeUInt32LE(envelope.byteLength, 40);
  fs.writeFileSync(file, Buffer.concat([header, Buffer.from(envelope.buffer)]));
}

// --- mixing ---------------------------------------------------------------------

// Mix the given track files and normalize the mix to MIX_LUFS as an MP3.
async function mixTracks(inputs: string[], output: string) {
  const wav = output.replace(/\.mp3$/, ".wav");
  await runFfmpeg([
    ...inputs.flatMap((file) => ["-i", file]),
    "-filter_complex",
    `amix=inputs=${inputs.length}:normalize=0:duration=longest`,
    wav,
  ]);
  const gain = MIX_LUFS - (await measureLoudness(wav));
  await runFfmpeg([
    ...["-i", wav],
    ...["-af", `volume=${gain}dB`],
    ...["-b:a", "192k"],
    output,
  ]);
  fs.rmSync(wav);
}

// The track's gain, then an equal-power pan, as Web Audio's StereoPannerNode
// does on stereo input.
function buildChannelFilter(track: MidiTrack) {
  const pan = track.pan ?? 0;
  const x = pan <= 0 ? pan + 1 : pan;
  const a = Math.cos((x * Math.PI) / 2);
  const b = Math.sin((x * Math.PI) / 2);
  const panFilter =
    pan <= 0
      ? `pan=stereo|c0=c0+${a}*c1|c1=${b}*c1`
      : `pan=stereo|c0=${a}*c0|c1=c1+${b}*c0`;
  return `volume=${track.gain ?? 1},${panFilter}`;
}

// --- ffmpeg -------------------------------------------------------------------

async function runFfmpeg(args: string[]) {
  await execFileAsync("ffmpeg", ["-y", "-v", "error", ...args]);
}

async function measureLoudness(wav: string) {
  // ebur128 prints its summary on stderr.
  const { stderr } = await execFileAsync("ffmpeg", [
    ...["-nostats", "-i", wav],
    ...["-af", "ebur128=framelog=quiet"],
    ...["-f", "null", "-"],
  ]);
  const match = stderr.match(/I:\s*(-?[\d.]+|-inf)\s*LUFS/);
  if (!match) {
    throw new Error(`Could not measure the loudness of ${wav}`);
  }
  return match[1] === "-inf" ? -Infinity : Number(match[1]);
}

async function readSampleRate(wav: string) {
  const { stdout } = await execFileAsync("ffprobe", [
    ...["-v", "error"],
    ...["-show_entries", "stream=sample_rate"],
    ...["-of", "csv=p=0"],
    wav,
  ]);
  return Number(stdout.trim());
}

main().catch((error) => {
  // Errors carry user-facing messages, so skip stack traces.
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
