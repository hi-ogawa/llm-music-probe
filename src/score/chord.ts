import { parsePitchClass } from "./pitch.ts";

/** Intervals above the root, in semitones, for each chord suffix */
const QUALITIES: Record<string, number[]> = {
  "": [0, 4, 7],
  m: [0, 3, 7],
  "7": [0, 4, 7, 10],
  m7: [0, 3, 7, 10],
  maj7: [0, 4, 7, 11],
  mmaj7: [0, 3, 7, 11],
  "6": [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  "9": [0, 4, 7, 10, 14],
  m9: [0, 3, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  "7sus4": [0, 5, 7, 10],
  dim: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10],
  aug: [0, 4, 8],
  "5": [0, 7],
  "7b9": [0, 4, 7, 10, 13],
};

export interface ChordSymbol {
  /** Pitch classes of the chord tones, root first */
  tones: number[];
  /** Pitch class of a slash bass */
  bass?: number;
}

/** Parse the inside of a chord name such as `Dm7`, `C/E`, or `Bbmaj7` */
export function parseChordSymbol(text: string): ChordSymbol | undefined {
  const match = text.match(/^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/);
  if (!match) {
    return undefined;
  }
  const [, rootText, suffix, bassText] = match;
  const root = parsePitchClass(rootText);
  const intervals = QUALITIES[suffix];
  if (root === undefined || !intervals) {
    return undefined;
  }
  const tones = intervals.map((interval) => (root + interval) % 12);
  if (bassText === undefined) {
    return { tones };
  }
  const bass = parsePitchClass(bassText);
  return bass === undefined ? undefined : { tones, bass };
}

/**
 * Voice a chord in close position around `center`.
 * Each chord tone takes the octave that puts it from 6 semitones below
 * `center` to 5 above, and a slash bass goes below the lowest chord tone.
 */
export function voiceChord(chord: ChordSymbol, center: number): number[] {
  const low = center - 6;
  const pitches = chord.tones
    .map((tone) => low + ((tone - low + 120) % 12))
    .sort((a, b) => a - b);
  if (chord.bass !== undefined) {
    const lowest = pitches[0];
    pitches.unshift(lowest - 12 + ((chord.bass - lowest + 120) % 12));
  }
  return pitches;
}
