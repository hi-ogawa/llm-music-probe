#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { exportMidi } from "./midi/export.ts";
import { DEFAULT_GAIN, DEFAULT_SOUNDFONT, renderWav } from "./midi/render.ts";
import { expandScore, type Song } from "./score/expand.ts";
import { parseScore } from "./score/parse.ts";

const HELP = `\
Usage:
  llm-music-probe check <score...>
      Report problems in each score, and exit non-zero if there are any
  llm-music-probe render <score> <output> [--loops <n>] [--gain <g>] [--soundfont <file>]
      Render a score. The output extension picks the format:
      .json for note events, .mid for MIDI, .wav for audio through fluidsynth.
      --loops sets how many times the loop section plays (default 1).
      --gain sets the fluidsynth output gain for .wav (default ${DEFAULT_GAIN})`;

async function main() {
  const { positionals, values } = parseArgs({
    allowPositionals: true,
    options: {
      loops: { type: "string", default: "1" },
      gain: { type: "string", default: String(DEFAULT_GAIN) },
      soundfont: { type: "string", default: DEFAULT_SOUNDFONT },
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
      const [scoreFile, outputFile] = args;
      if (!scoreFile || !outputFile) {
        throw new Error("render needs a score and an output file");
      }
      const loops = Number(values.loops);
      if (!Number.isInteger(loops) || loops < 0) {
        throw new Error("--loops must be a whole number from 0");
      }
      const song = readSong(scoreFile, loops);
      if (!song) {
        process.exitCode = 1;
        break;
      }
      const gain = Number(values.gain);
      if (!(gain > 0)) {
        throw new Error("--gain must be a positive number");
      }
      await writeSong(song, { outputFile, soundfont: values.soundfont, gain });
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

async function writeSong(
  song: Song,
  options: { outputFile: string; soundfont: string; gain: number },
) {
  const { outputFile, soundfont, gain } = options;
  switch (path.extname(outputFile)) {
    case ".json": {
      fs.writeFileSync(outputFile, JSON.stringify(song, null, 2));
      break;
    }
    case ".mid": {
      fs.writeFileSync(outputFile, exportMidi(song));
      break;
    }
    case ".wav": {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "llm-music-probe-"));
      const midiFile = path.join(dir, "song.mid");
      try {
        fs.writeFileSync(midiFile, exportMidi(song));
        await renderWav({ midiFile, outputFile, soundfont, gain });
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
