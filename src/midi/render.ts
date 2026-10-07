import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const DEFAULT_SOUNDFONT = "/usr/share/soundfonts/FluidR3_GM.sf2";

/** Render a MIDI file to a WAV file with fluidsynth, faster than real time */
export async function renderWav(options: {
  midiFile: string;
  outputFile: string;
  soundfont: string;
}): Promise<void> {
  await promisify(execFile)("fluidsynth", [
    "-niq",
    // The default gain of 0.2 peaks around -12 dBFS on the Scrimshaw tracks
    "-g",
    "0.5",
    "-r",
    "44100",
    "-F",
    options.outputFile,
    options.soundfont,
    options.midiFile,
  ]);
}
