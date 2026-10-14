#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { exportMidi } from "./midi/export.ts";
import {
  DEFAULT_GAIN,
  DEFAULT_SOUNDFONT,
  LISTENING_LUFS,
  mixAudio,
  renderWav,
} from "./midi/render.ts";
import { exportShareLink } from "./midi/share-link.ts";
import { isProjectInput, readProject } from "./project/read.ts";
import { DEFAULT_PROJECT_SOUNDFONT, renderProject } from "./project/render.ts";
import { expandScore, type Song } from "./score/expand.ts";
import { parseScore } from "./score/parse.ts";

const HELP = `\
Usage:
  llm-music-probe check <score...>
      Report problems in each score, and exit non-zero if there are any
  llm-music-probe render <score> <output> [--loops <n>] [--phrase <voices>]
                         [--solo <voices>] [--gain <g>] [--soundfont <file>]
                         [--normalize]
      Render a score. The output extension picks the format:
      .json for note events, .mid for MIDI, .wav or .mp3 for audio through
      fluidsynth, .link for a toy-midi share link.
      --loops sets how many times the loop section plays (default 1).
      --phrase plays the listed voices, comma-separated, through the phrasing
      pass, which shapes velocity, length, and expression without changing notes.
      --solo keeps only the listed voices, comma-separated.
      --gain sets the fluidsynth output gain for audio (default ${DEFAULT_GAIN}).
      --soundfont defaults to ${DEFAULT_SOUNDFONT}.
      --normalize brings audio to ${LISTENING_LUFS} LUFS for listening.
  llm-music-probe render <project> <output> [--gain <g>] [--soundfont <file>]
                         [--normalize]
      Render a toy-midi project to .wav or .mp3, mixed with each track's gain
      and pan, and without muted tracks. The project is a .json file, a share
      link with #p=, a /draft?src= link, or the raw URL of a .json file.
      --soundfont defaults to GeneralUser GS at ${DEFAULT_PROJECT_SOUNDFONT}.`;

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      loops: { type: "string" },
      phrase: { type: "string" },
      solo: { type: "string" },
      gain: { type: "string", default: String(DEFAULT_GAIN) },
      soundfont: { type: "string" },
      normalize: { type: "boolean", default: false },
      help: { type: "boolean", short: "h" },
    },
  });
  const [command, ...args] = positionals;
  if (values.help || !command) {
    console.log(HELP);
    return;
  }

  switch (command) {
    case "check": {
      const songs = args.map((file) => readSong(file, 1));
      process.exitCode = songs.includes(undefined) ? 1 : 0;
      break;
    }
    case "render": {
      const [inputFile, outputFile] = args;
      if (!inputFile || !outputFile) {
        throw new Error("render needs a score or project and an output file");
      }
      const gain = Number(values.gain);
      if (!(gain > 0)) {
        throw new Error("--gain must be a positive number");
      }
      if (isProjectInput(inputFile)) {
        for (const option of ["loops", "phrase", "solo"] as const) {
          if (values[option] !== undefined) {
            throw new Error(`--${option} only applies to a score`);
          }
        }
        const soundfont = readSoundfont(
          values.soundfont ?? DEFAULT_PROJECT_SOUNDFONT,
        );
        await renderProject(await readProject(inputFile), {
          outputFile,
          soundfont,
          gain,
          normalize: values.normalize,
        });
        break;
      }
      const loops = Number(values.loops ?? "1");
      if (!Number.isInteger(loops) || loops < 0) {
        throw new Error("--loops must be a whole number from 0");
      }
      const read = readSong(inputFile, loops);
      if (!read) {
        process.exitCode = 1;
        break;
      }
      const phrase = readVoiceList(read, values.phrase);
      const solo = readVoiceList(read, values.solo);
      const song = solo ? soloVoices(read, solo) : read;
      await writeSong(song, {
        outputFile,
        soundfont: values.soundfont ?? DEFAULT_SOUNDFONT,
        gain,
        normalize: values.normalize,
        phrase,
      });
      break;
    }
    default: {
      throw new Error(`unknown command "${command}"\n\n${HELP}`);
    }
  }
}

/** Read and expand a score, printing its diagnostics. Returns nothing if there are any. */
function readSong(file: string, loops: number): Song | undefined {
  const parsed = parseScore(fs.readFileSync(file, "utf-8"));
  const expanded = expandScore(parsed.score, { loops });
  const diagnostics = [...parsed.diagnostics, ...expanded.diagnostics];
  for (const { line, message } of diagnostics) {
    console.error(`${file}:${line}: ${message}`);
  }
  return diagnostics.length === 0 ? expanded.song : undefined;
}

/** Check that a soundfont exists, since fluidsynth renders silence without one */
function readSoundfont(file: string): string {
  if (!fs.existsSync(file)) {
    throw new Error(`no soundfont at ${file}, so pass one with --soundfont`);
  }
  return file;
}

/** Split a comma-separated list of voice names, checking that the song declares each */
function readVoiceList(song: Song, text: string | undefined) {
  if (text === undefined) {
    return undefined;
  }
  const names = text.split(",");
  for (const name of names) {
    if (!song.voices.some((voice) => voice.name === name)) {
      throw new Error(`unknown voice "${name}"`);
    }
  }
  return names;
}

function soloVoices(song: Song, names: string[]): Song {
  return {
    ...song,
    voices: song.voices.filter((voice) => names.includes(voice.name)),
    notes: song.notes.filter((note) => names.includes(note.voice)),
  };
}

async function writeSong(
  song: Song,
  options: {
    outputFile: string;
    soundfont: string;
    gain: number;
    normalize: boolean;
    phrase?: string[];
  },
) {
  const { outputFile, gain, normalize, phrase } = options;
  switch (path.extname(outputFile)) {
    case ".json": {
      fs.writeFileSync(outputFile, JSON.stringify(song, null, 2));
      break;
    }
    case ".mid": {
      fs.writeFileSync(outputFile, exportMidi(song, { phrase }));
      break;
    }
    case ".link": {
      if (song.tempos.length > 1 || song.meters.length > 1) {
        console.error(
          `${outputFile}: toy-midi keeps one tempo and one meter, so later changes are dropped`,
        );
      }
      fs.writeFileSync(outputFile, exportShareLink(song) + "\n");
      break;
    }
    case ".wav":
    case ".mp3": {
      const soundfont = readSoundfont(options.soundfont);
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "llm-music-probe-"));
      const midiFile = path.join(dir, "song.mid");
      try {
        fs.writeFileSync(midiFile, exportMidi(song, { phrase }));
        if (path.extname(outputFile) === ".wav" && !normalize) {
          await renderWav({ midiFile, outputFile, soundfont, gain });
          break;
        }
        const wavFile = path.join(dir, "song.wav");
        await renderWav({ midiFile, outputFile: wavFile, soundfont, gain });
        await mixAudio({
          inputs: [{ file: wavFile, gain: 1, pan: 0 }],
          outputFile,
          normalize,
        });
      } finally {
        fs.rmSync(dir, { recursive: true });
      }
      break;
    }
    default: {
      throw new Error(`unknown output format "${outputFile}"`);
    }
  }
}

main();
