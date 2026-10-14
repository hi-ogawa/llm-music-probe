import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { mixAudio, renderWav } from "../midi/render.ts";
import { exportTrackMidi } from "./export.ts";
import { getAudibleTracks, type Project } from "./read.ts";

/** GeneralUser GS, the soundfont toy-midi plays with, as experiment 13 rendered it */
export const DEFAULT_PROJECT_SOUNDFONT = path.join(
  os.homedir(),
  ".local/share/soundfonts/GeneralUser-GS.sf2",
);

/**
 * Render a project to audio the way toy-midi mixes it: each audible track
 * through fluidsynth on its own, then the track's gain and pan, the sum of
 * the tracks, and the master gain.
 */
export async function renderProject(
  project: Project,
  options: {
    outputFile: string;
    soundfont: string;
    gain: number;
    normalize: boolean;
  },
): Promise<void> {
  if (![".wav", ".mp3"].includes(path.extname(options.outputFile))) {
    throw new Error(
      `a project renders to .wav or .mp3, not "${options.outputFile}"`,
    );
  }
  const tracks = getAudibleTracks(project);
  if (tracks.length === 0) {
    throw new Error("the project has no audible tracks with notes");
  }
  const masterGain = project.masterGain ?? 1;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "llm-music-probe-"));
  try {
    const inputs = await Promise.all(
      tracks.map(async (track, i) => {
        const midiFile = path.join(dir, `${i}.mid`);
        const wavFile = path.join(dir, `${i}.wav`);
        fs.writeFileSync(midiFile, exportTrackMidi(project, track));
        await renderWav({
          midiFile,
          outputFile: wavFile,
          soundfont: options.soundfont,
          gain: options.gain,
        });
        return {
          file: wavFile,
          gain: (track.gain ?? 1) * masterGain,
          pan: track.pan ?? 0,
        };
      }),
    );
    await mixAudio({
      inputs,
      outputFile: options.outputFile,
      normalize: options.normalize,
    });
  } finally {
    fs.rmSync(dir, { recursive: true });
  }
}
