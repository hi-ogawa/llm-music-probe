import {
  parseDrumBar,
  parseMelodicBar,
  type BarItem,
  type Sound,
} from "./bar.ts";
import { voiceChord } from "./chord.ts";
import type {
  Bar,
  Cue,
  Diagnostic,
  Pattern,
  Score,
  Timing,
  Voice,
} from "./parse.ts";

export interface Note {
  voice: string;
  /** Start in beats from the beginning of the song */
  start: number;
  /** Sounding length in beats, after gate */
  duration: number;
  /** Dynamic level: 0 is normal, each `!` adds 1, and each `?` subtracts 1 */
  level: number;
  /** MIDI pitch, absent for drum hits */
  pitch?: number;
}

export interface Song {
  meta: Score["meta"];
  voices: Voice[];
  /** Tempo changes, with `start` in beats */
  tempos: { start: number; bpm: number }[];
  /** Meter changes, with `start` in beats */
  meters: { start: number; beats: number }[];
  notes: Note[];
  /** Length in beats */
  length: number;
}

/** A struck note, chord, or stack, in steps from the pattern start, with ties merged */
interface Segment {
  start: number;
  end: number;
  level: number;
  sounds: Sound[];
}

interface CompiledPattern {
  timing: Timing;
  /** Length in steps */
  length: number;
  parts: Map<string, Segment[]>;
}

/**
 * Expand a parsed score into the notes of one performance: the `play`
 * section once, then the `loop` section `loops` times.
 * Each pattern is read once, so a bar error is reported once however often
 * the pattern plays.
 */
export function expandScore(
  score: Score,
  options: { loops: number },
): { song: Song; diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  const compiled = new Map<string, CompiledPattern>();
  for (const pattern of score.patterns.values()) {
    compiled.set(pattern.name, compilePattern(pattern, score, diagnostics));
  }

  const song: Song = {
    meta: score.meta,
    voices: [...score.voices.values()],
    tempos: [],
    meters: [],
    notes: [],
    length: 0,
  };
  for (const cue of arrangeCues(score, options.loops)) {
    const pattern = compiled.get(cue.pattern)!;
    for (let i = 0; i < cue.repeat; i++) {
      playPattern(song, pattern, cue.transpose, score.voices);
    }
  }
  return { song, diagnostics };
}

function compilePattern(
  pattern: Pattern,
  score: Score,
  diagnostics: Diagnostic[],
): CompiledPattern {
  const timing = { ...score.timing, ...pattern.timing };
  const barSteps = timing.beats * timing.steps;
  const parts = new Map<string, Segment[]>();
  let bars = 0;
  for (const [name, partBars] of pattern.parts) {
    const voice = score.voices.get(name)!;
    parts.set(name, compilePart(partBars, voice, barSteps, diagnostics));
    bars = Math.max(bars, partBars.length);
  }
  return { timing, length: bars * barSteps, parts };
}

function compilePart(
  bars: Bar[],
  voice: Voice,
  barSteps: number,
  diagnostics: Diagnostic[],
): Segment[] {
  const segments: Segment[] = [];
  let previous: BarItem[] = [{ kind: "rest", length: barSteps }];
  bars.forEach((bar, index) => {
    const items = readBar(bar, previous, { voice, barSteps, diagnostics });
    previous = items;
    let step = index * barSteps;
    for (const item of items) {
      switch (item.kind) {
        case "strike": {
          segments.push({
            start: step,
            end: step + item.length,
            level: item.level,
            sounds: item.sounds,
          });
          break;
        }
        case "hold": {
          const last = segments.at(-1);
          if (last?.end === step) {
            last.end += item.length;
          } else {
            diagnostics.push({
              line: bar.line,
              message: `${voice.name} holds a note in bar ${index + 1}, but nothing is sounding`,
            });
          }
          break;
        }
        case "rest": {
          break;
        }
      }
      step += item.length;
    }
  });
  return segments;
}

/**
 * Read one bar into items. A bar that cannot be read, or whose steps do not
 * add up, is reported and played as a rest, so later bars keep their place.
 */
function readBar(
  bar: Bar,
  previous: BarItem[],
  context: { voice: Voice; barSteps: number; diagnostics: Diagnostic[] },
): BarItem[] {
  const { voice, barSteps, diagnostics } = context;
  const rest: BarItem[] = [{ kind: "rest", length: barSteps }];
  switch (bar.text) {
    case "%": {
      return previous;
    }
    case "_": {
      return rest;
    }
    case "=": {
      return [{ kind: "hold", length: barSteps }];
    }
  }
  const result = voice.drum
    ? parseDrumBar(bar.text)
    : parseMelodicBar(bar.text);
  if ("error" in result) {
    diagnostics.push({
      line: bar.line,
      message: `${voice.name}: ${result.error}`,
    });
    return rest;
  }
  const length = result.items.reduce((sum, item) => sum + item.length, 0);
  if (length !== barSteps) {
    diagnostics.push({
      line: bar.line,
      message: `${voice.name}: bar "${bar.text}" has ${length} steps, expected ${barSteps}`,
    });
    return rest;
  }
  return result.items;
}

/** List the cues of one performance. With no `play` or `loop`, every pattern loops in written order. */
function arrangeCues(score: Score, loops: number): Cue[] {
  const loop =
    score.play.length === 0 && score.loop.length === 0
      ? [...score.patterns.keys()].map((pattern) => ({
          pattern,
          transpose: 0,
          repeat: 1,
        }))
      : score.loop;
  return [...score.play, ...Array.from({ length: loops }, () => loop).flat()];
}

function playPattern(
  song: Song,
  pattern: CompiledPattern,
  transpose: number,
  voices: Map<string, Voice>,
): void {
  const { timing } = pattern;
  const offset = song.length;
  if (song.tempos.at(-1)?.bpm !== timing.tempo) {
    song.tempos.push({ start: offset, bpm: timing.tempo });
  }
  if (song.meters.at(-1)?.beats !== timing.beats) {
    song.meters.push({ start: offset, beats: timing.beats });
  }
  for (const [name, segments] of pattern.parts) {
    const voice = voices.get(name)!;
    for (const segment of segments) {
      const start = offset + placeStep(segment.start, timing);
      const end = offset + placeStep(segment.end, timing);
      const note = {
        voice: name,
        start,
        duration: (end - start) * voice.gate,
        level: segment.level,
      };
      if (voice.drum) {
        // Drums are not transposed
        song.notes.push(note);
        continue;
      }
      for (const pitch of resolvePitches(segment.sounds, voice.center)) {
        song.notes.push({
          ...note,
          pitch: pitch + voice.transpose + transpose,
        });
      }
    }
  }
  song.length = offset + pattern.length / timing.steps;
}

/** Position of a step in beats. When steps per beat is even, swing delays every other step. */
function placeStep(step: number, timing: Timing): number {
  const swung = timing.steps % 2 === 0 && step % 2 === 1;
  return (step + (swung ? timing.swing : 0)) / timing.steps;
}

function resolvePitches(sounds: Sound[], center: number): number[] {
  return sounds.flatMap((sound) =>
    sound.kind === "pitch" ? [sound.pitch] : voiceChord(sound.chord, center),
  );
}
