import { describe, expect, test } from "vitest";
import { phraseLine, type PlayedNote } from "./phrase.ts";

/** Notes from [pitch, start, duration] with velocity 100 */
function makeNotes(specs: [number, number, number][]): PlayedNote[] {
  return specs.map(([pitch, start, duration]) => ({
    pitch,
    start,
    duration,
    velocity: 100,
  }));
}

describe("phraseLine", () => {
  test("rises toward the highest note of a phrase and falls after it", () => {
    const { notes } = phraseLine(
      makeNotes([
        [60, 0.5, 1],
        [64, 1.5, 1],
        [67, 2.5, 1],
        [65, 3.5, 1],
        [64, 4.5, 1],
      ]),
      { instrument: "ebass", gate: 1 },
    );
    expect(notes.map((note) => note.velocity)).toEqual([85, 93, 100, 93, 85]);
  });

  test("accents notes on the beat", () => {
    const { notes } = phraseLine(
      makeNotes([
        [60, 0, 0.5],
        [60, 1, 0.5],
      ]),
      { instrument: "ebass", gate: 1 },
    );
    expect(notes.map((note) => note.velocity)).toEqual([105, 105]);
  });

  test("starts a new phrase after a rest of half a beat", () => {
    const { notes } = phraseLine(
      makeNotes([
        [60, 0.5, 0.5],
        [67, 1.5, 0.5],
        [60, 2.5, 0.5],
        [67, 3.5, 0.5],
      ]),
      { instrument: "ebass", gate: 1 },
    );
    expect(notes.map((note) => note.velocity)).toEqual([100, 100, 100, 100]);
  });

  test("connects new pitches, detaches repeats, and breathes at the end", () => {
    const { notes } = phraseLine(
      makeNotes([
        [60, 0.5, 1],
        [62, 1.5, 1],
        [62, 2.5, 1],
      ]),
      { instrument: "flute", gate: 1 },
    );
    expect(notes.map((note) => note.duration)).toEqual([1.04, 0.85, 0.9]);
  });

  test("reads written length before the voice's gate", () => {
    const { notes } = phraseLine(
      makeNotes([
        [60, 0.5, 0.5],
        [62, 1.5, 0.5],
      ]),
      { instrument: "ebass", gate: 0.5 },
    );
    expect(notes.map((note) => note.duration)).toEqual([1, 0.9]);
  });

  test("plays notes struck together as one event", () => {
    const { notes } = phraseLine(
      makeNotes([
        [60, 0.5, 1],
        [64, 0.5, 1],
        [62, 1.5, 1],
        [65, 1.5, 1],
      ]),
      { instrument: "trumpet", gate: 1 },
    );
    expect(notes.map((note) => [note.velocity, note.duration])).toEqual([
      [85, 1.04],
      [85, 1.04],
      [100, 0.9],
      [100, 0.9],
    ]);
  });

  test("swells and adds vibrato to long notes on sustained instruments only", () => {
    const line = makeNotes([[60, 0, 2]]);
    const flute = phraseLine(line, { instrument: "flute", gate: 1 });
    const expression = flute.controls.filter(
      (control) => control.number === 11,
    );
    const vibrato = flute.controls.filter((control) => control.number === 1);
    expect(expression[0]).toEqual({ time: 0, number: 11, value: 85 });
    // The swell peaks at 120 mid-note, sampled every eighth of a beat
    expect(
      Math.max(...expression.map((control) => control.value)),
    ).toBeGreaterThanOrEqual(115);
    expect(vibrato[0]).toEqual({ time: 0, number: 1, value: 0 });
    expect(Math.max(...vibrato.map((control) => control.value))).toBe(60);
    expect(vibrato.at(-1)).toEqual({ time: 1.8, number: 1, value: 0 });

    const bass = phraseLine(line, { instrument: "ebass", gate: 1 });
    expect(bass.controls).toEqual([]);
  });
});
