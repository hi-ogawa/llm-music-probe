import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const DEFAULT_SOUNDFONT = "/usr/share/soundfonts/FluidR3_GM.sf2";

/** fluidsynth's own default of 0.2 peaks around -12 dBFS on the Scrimshaw tracks */
export const DEFAULT_GAIN = 0.5;

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
    "44100",
    "-F",
    options.outputFile,
    options.soundfont,
    options.midiFile,
  ]);
}
