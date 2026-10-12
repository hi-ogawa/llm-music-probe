import { parseChordSymbol, type ChordSymbol } from "./chord.ts";
import { parsePitch } from "./pitch.ts";

export type Sound =
  | { kind: "pitch"; pitch: number }
  | { kind: "chord"; chord: ChordSymbol };

/** One token of a bar, in order, each lasting `length` steps */
export type BarItem =
  | { kind: "strike"; length: number; level: number; sounds: Sound[] }
  | { kind: "hold"; length: number }
  | { kind: "rest"; length: number };

export type BarResult = { items: BarItem[] } | { error: string };

/**
 * Parse a melodic bar such as `D5-- [Dm]?- C4+E4+G4 . -`.
 * Each note, chord, or stack lasts one step plus one per dash, `!` and `?`
 * raise or lower its level, a run of dots and dashes is a rest, and a lone
 * run of dashes holds the previous note.
 */
export function parseMelodicBar(text: string): BarResult {
  const items: BarItem[] = [];
  for (const token of text.split(/\s+/)) {
    const item = parseMelodicToken(token);
    if (!item) {
      return { error: `cannot read "${token}"` };
    }
    items.push(item);
  }
  return { items };
}

const DRUM_LEVELS: Record<string, number> = { o: -2, x: 0, X: 2 };

/** Parse a drum bar such as `x... ..x. X.o.`, one character per step, ignoring spaces */
export function parseDrumBar(text: string): BarResult {
  const items: BarItem[] = [];
  for (const char of text.replaceAll(" ", "")) {
    if (char === ".") {
      items.push({ kind: "rest", length: 1 });
      continue;
    }
    const level = DRUM_LEVELS[char];
    if (level === undefined) {
      return { error: `cannot read "${char}" in a drum bar` };
    }
    items.push({ kind: "strike", length: 1, level, sounds: [] });
  }
  return { items };
}

function parseMelodicToken(token: string): BarItem | undefined {
  if (/^-+$/.test(token)) {
    return { kind: "hold", length: token.length };
  }
  if (/^\.+-*$/.test(token)) {
    return { kind: "rest", length: token.length };
  }
  const match = token.match(/^([^-!?]+)([-!?]*)$/);
  if (!match) {
    return undefined;
  }
  const [, body, marks] = match;
  const sounds: Sound[] = [];
  for (const part of body.split("+")) {
    const sound = parseSound(part);
    if (!sound) {
      return undefined;
    }
    sounds.push(sound);
  }
  return {
    kind: "strike",
    length: 1 + countChar(marks, "-"),
    level: countChar(marks, "!") - countChar(marks, "?"),
    sounds,
  };
}

function parseSound(text: string): Sound | undefined {
  if (text.startsWith("[") && text.endsWith("]")) {
    const chord = parseChordSymbol(text.slice(1, -1));
    return chord && { kind: "chord", chord };
  }
  // A leading `~` marks a slide, which is accepted but not rendered
  const pitch = parsePitch(text.replace(/^~/, ""));
  return pitch === undefined ? undefined : { kind: "pitch", pitch };
}

function countChar(text: string, char: string): number {
  return text.split(char).length - 1;
}
