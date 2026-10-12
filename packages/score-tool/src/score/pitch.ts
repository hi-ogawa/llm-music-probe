const LETTERS: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const ACCIDENTALS: Record<string, number> = {
  "": 0,
  "#": 1,
  "##": 2,
  b: -1,
  bb: -2,
};

/** Parse a note name such as `C4`, `F#3`, or `Bbb2` into a MIDI pitch, where `C4` is 60 */
export function parsePitch(text: string): number | undefined {
  const match = text.match(/^([A-G])(##|#|bb|b)?([0-8])$/);
  if (!match) {
    return undefined;
  }
  const [, letter, accidental = "", octave] = match;
  return 12 * (Number(octave) + 1) + LETTERS[letter] + ACCIDENTALS[accidental];
}

/** Parse a chord root or bass such as `C`, `F#`, or `Bb` into a pitch class from 0 to 11 */
export function parsePitchClass(text: string): number | undefined {
  const match = text.match(/^([A-G])(#|b)?$/);
  if (!match) {
    return undefined;
  }
  const [, letter, accidental = ""] = match;
  return (LETTERS[letter] + ACCIDENTALS[accidental] + 12) % 12;
}
