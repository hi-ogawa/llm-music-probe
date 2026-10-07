import fs from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { expandScore, type Song } from "./expand.ts";
import { parseScore } from "./parse.ts";

const FIXTURE_DIR = path.join(
  import.meta.dirname,
  "../../experiments/01-scrimshaw-breakdown/source",
);

function readSong(text: string, loops = 1) {
  const parsed = parseScore(text);
  const expanded = expandScore(parsed.score, { loops });
  return {
    song: expanded.song,
    diagnostics: [...parsed.diagnostics, ...expanded.diagnostics],
  };
}

/** Notes as [voice, pitch, start, duration], sorted by start, voice, then pitch */
function listNotes(song: Song) {
  return song.notes
    .toSorted(
      (a, b) =>
        a.start - b.start ||
        a.voice.localeCompare(b.voice) ||
        (a.pitch ?? 0) - (b.pitch ?? 0),
    )
    .map((note) => [note.voice, note.pitch, note.start, note.duration]);
}

describe("Scrimshaw fixtures", () => {
  const files = fs
    .readdirSync(FIXTURE_DIR)
    .filter((file) => file.endsWith(".scrim"));

  test.each(files)("%s reads without diagnostics", (file) => {
    const { song, diagnostics } = readSong(
      fs.readFileSync(path.join(FIXTURE_DIR, file), "utf-8"),
    );
    expect(diagnostics).toEqual([]);
    expect(song.notes.length).toBeGreaterThan(0);
  });
});

describe("expandScore", () => {
  test("reports a bar whose steps do not add up", () => {
    const { diagnostics } = readSong(`
voice lead flute
pattern A
lead | C4--- D4--- E4--- F4-- |
`);
    expect(diagnostics).toEqual([
      {
        line: 4,
        message: 'lead: bar "C4--- D4--- E4--- F4--" has 15 steps, expected 16',
      },
    ]);
  });

  test("reads metadata containing a bar line as text", () => {
    const { song, diagnostics } = readSong(`
about Verse | chorus | verse
voice lead flute
pattern A
lead | C4--------------- |
`);
    expect(diagnostics).toEqual([]);
    expect(song.meta.about).toBe("Verse | chorus | verse");
  });

  test("holds a note across a bar line", () => {
    const { song } = readSong(`
beats 1
voice lead flute
pattern A
lead | C4- D4- | -- E4- |
`);
    expect(listNotes(song)).toEqual([
      ["lead", 60, 0, 0.5],
      ["lead", 62, 0.5, 1],
      ["lead", 64, 1.5, 0.5],
    ]);
  });

  test("repeats, rests, and holds whole bars", () => {
    const { song } = readSong(`
beats 1
voice lead flute
pattern A
lead | C4--- | % | _ | D4--- | = |
`);
    expect(listNotes(song)).toEqual([
      ["lead", 60, 0, 1],
      ["lead", 60, 1, 1],
      ["lead", 62, 3, 2],
    ]);
  });

  test("copies a pattern with from, replacing and muting parts", () => {
    const { song } = readSong(`
beats 1
voice lead flute
voice bass fretless
voice pad strings
pattern A
lead | C5--- |
bass | C2--- |
pad  | C4--- |
pattern B from A
lead | D5--- |
mute pad
play A B
`);
    expect(listNotes(song)).toEqual([
      ["bass", 36, 0, 1],
      ["lead", 72, 0, 1],
      ["pad", 60, 0, 1],
      ["bass", 36, 1, 1],
      ["lead", 74, 1, 1],
    ]);
  });

  test("plays the intro once and the loop the given number of times, transposing all but drums", () => {
    const { song } = readSong(
      `
beats 1
voice lead flute
voice kick kick
pattern A
lead | C4--- |
kick | x... |
play A
loop A+2*2
`,
      2,
    );
    expect(listNotes(song)).toEqual([
      ["kick", undefined, 0, 0.25],
      ["lead", 60, 0, 1],
      ...[1, 2, 3, 4].flatMap((start) => [
        ["kick", undefined, start, 0.25],
        ["lead", 62, start, 1],
      ]),
    ]);
  });

  test("delays every other step by swing", () => {
    const { song } = readSong(`
beats 1
steps 2
swing 0.5
voice lead flute
pattern A
lead | C4 D4 |
`);
    expect(listNotes(song)).toEqual([
      ["lead", 60, 0, 0.75],
      ["lead", 62, 0.75, 0.25],
    ]);
  });

  test("applies gate, voice transposition, and dynamic levels", () => {
    const { song } = readSong(`
beats 1
voice lead flute gate=0.5 oct=1 trans=-2
pattern A
lead | C4!!- D4?- |
`);
    expect(
      song.notes.map((note) => [note.pitch, note.duration, note.level]),
    ).toEqual([
      [70, 0.25, 2],
      [72, 0.25, -1],
    ]);
  });

  test("voices chord names around the voice's center", () => {
    const { song } = readSong(`
beats 1
voice keys organ center=C4
pattern A
keys | [C/E]--- |
`);
    expect(song.notes.map((note) => note.pitch)).toEqual([52, 55, 60, 64]);
  });

  test("records tempo and meter changes per pattern", () => {
    const { song } = readSong(`
tempo 100
voice lead flute
pattern A
lead | C4--------------- |
pattern B tempo=140 beats=3
lead | C4----------- |
play A B
`);
    expect(song.tempos).toEqual([
      { start: 0, bpm: 100 },
      { start: 4, bpm: 140 },
    ]);
    expect(song.meters).toEqual([
      { start: 0, beats: 4 },
      { start: 4, beats: 3 },
    ]);
    expect(song.length).toBe(7);
  });
});
