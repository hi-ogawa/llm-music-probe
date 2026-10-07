import { Midi } from "@tonejs/midi";
import { expect, test } from "vitest";
import { expandScore } from "../score/expand.ts";
import { DRUM_INSTRUMENTS, MELODIC_INSTRUMENTS } from "../score/instruments.ts";
import { parseScore } from "../score/parse.ts";
import { exportMidi } from "./export.ts";
import { GENERAL_MIDI_SOUNDS } from "./general-midi.ts";

function readMidi(text: string): Midi {
  const parsed = parseScore(text);
  const expanded = expandScore(parsed.score, { loops: 1 });
  expect([...parsed.diagnostics, ...expanded.diagnostics]).toEqual([]);
  return new Midi(exportMidi(expanded.song));
}

test("every score instrument has a General MIDI sound", () => {
  expect(Object.keys(GENERAL_MIDI_SOUNDS).sort()).toEqual(
    [...MELODIC_INSTRUMENTS, ...DRUM_INSTRUMENTS].sort(),
  );
  for (const instrument of MELODIC_INSTRUMENTS) {
    expect(GENERAL_MIDI_SOUNDS[instrument].kind).toBe("program");
  }
  for (const instrument of DRUM_INSTRUMENTS) {
    expect(GENERAL_MIDI_SOUNDS[instrument].kind).not.toBe("program");
  }
});

test("writes tempo, meter, channels, programs, and notes", () => {
  const midi = readMidi(`
tempo 100
beats 3
steps 2
voice lead flute vol=0.8 pan=-1
voice bass fretless
voice kick kick
voice snare snare
pattern A
lead | C5! D5---- |
bass | C2----- |
kick | x.x.X. |
snare | ..o... |
`);
  expect(midi.header.tempos.map((tempo) => tempo.bpm)).toEqual([100]);
  expect(midi.header.timeSignatures[0].timeSignature).toEqual([3, 4]);
  expect(
    midi.tracks.map((track) => [
      track.name,
      track.channel,
      track.instrument.number,
    ]),
  ).toEqual([
    ["lead", 0, 73],
    ["bass", 1, 35],
    ["kick", 9, 0],
    ["snare", 9, 0],
  ]);
  expect(
    midi.tracks[0].notes.map((note) => [
      note.midi,
      note.ticks,
      note.durationTicks,
      Math.round(note.velocity * 127),
    ]),
  ).toEqual([
    [72, 0, 240, 108],
    [74, 240, 1200, 90],
  ]);
  expect(midi.tracks[0].controlChanges[10][0].value).toBe(0);
  expect(
    midi.tracks[2].notes.map((note) => [
      note.midi,
      Math.round(note.velocity * 127),
    ]),
  ).toEqual([
    [36, 90],
    [36, 90],
    [36, 126],
  ]);
});

test("skips the percussion channel when assigning channels", () => {
  const names = Array.from({ length: 11 }, (_, index) => `v${index}`);
  const midi = readMidi(`
${names.map((name) => `voice ${name} flute`).join("\n")}
pattern A
${names.map((name) => `${name} | C4--------------- |`).join("\n")}
`);
  expect(midi.tracks.map((track) => track.channel)).toEqual([
    0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11,
  ]);
});
