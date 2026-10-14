import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

export const DEFAULT_SOUNDFONT = "/usr/share/soundfonts/FluidR3_GM.sf2";

/** fluidsynth's own default of 0.2 peaks around -12 dBFS on the Scrimshaw tracks */
export const DEFAULT_GAIN = 0.5;

/** The integrated loudness `normalize` brings a render to, a common target for listening */
export const LISTENING_LUFS = -16;

const SAMPLE_RATE = 44100;

/** Render a MIDI file to a WAV file with fluidsynth, faster than real time */
export async function renderWav(options: {
  midiFile: string;
  outputFile: string;
  soundfont: string;
  gain: number;
}): Promise<void> {
  await promisify(execFile)("fluidsynth", [
    "-niq",
    "-g",
    String(options.gain),
    "-r",
    String(SAMPLE_RATE),
    "-F",
    options.outputFile,
    options.soundfont,
    options.midiFile,
  ]);
}

/**
 * Mix WAV files with ffmpeg, each with its own linear gain and pan, and write
 * the sum as `.wav` or `.mp3`. `normalize` brings the mix to `LISTENING_LUFS`.
 */
export async function mixAudio(options: {
  inputs: { file: string; gain: number; pan: number }[];
  outputFile: string;
  normalize: boolean;
}): Promise<void> {
  const { inputs, outputFile, normalize } = options;
  const extension = path.extname(outputFile);
  if (extension !== ".wav" && extension !== ".mp3") {
    throw new Error(`unknown audio format "${outputFile}"`);
  }
  const tracks = inputs.map(({ gain, pan }, i) => {
    const filters = [`volume=${gain}`];
    if (pan !== 0) {
      filters.push(getPanFilter(pan));
    }
    return `[${i}:a]${filters.join(",")}[t${i}]`;
  });
  const mix = [
    `${inputs.map((_, i) => `[t${i}]`).join("")}amix=inputs=${inputs.length}:normalize=0:duration=longest`,
  ];
  if (normalize) {
    // loudnorm works at 192 kHz, so resample back afterwards
    mix.push(`loudnorm=I=${LISTENING_LUFS}`, `aresample=${SAMPLE_RATE}`);
  }
  await promisify(execFile)("ffmpeg", [
    "-y",
    "-v",
    "error",
    ...inputs.flatMap(({ file }) => ["-i", file]),
    "-filter_complex",
    [...tracks, mix.join(",")].join(";"),
    ...(extension === ".mp3" ? ["-q:a", "2"] : []),
    outputFile,
  ]);
}

/**
 * An ffmpeg `pan` filter that matches Web Audio's StereoPannerNode on stereo
 * input, which is how toy-midi pans a track. Panning left keeps the left
 * channel and folds part of the right into it, and panning right does the
 * mirror image.
 */
export function getPanFilter(pan: number): string {
  const x = pan <= 0 ? pan + 1 : pan;
  const a = Math.cos((x * Math.PI) / 2);
  const b = Math.sin((x * Math.PI) / 2);
  return pan <= 0
    ? `pan=stereo|c0=c0+${a}*c1|c1=${b}*c1`
    : `pan=stereo|c0=${a}*c0|c1=c1+${b}*c0`;
}
