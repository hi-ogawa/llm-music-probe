import { DRUM_INSTRUMENTS, MELODIC_INSTRUMENTS } from "./instruments.ts";
import { parsePitch } from "./pitch.ts";

export interface Timing {
  /** Beats per minute */
  tempo: number;
  /** Beats per bar */
  beats: number;
  /** Steps per beat */
  steps: number;
  /** Delay of every other step, as a fraction of a step */
  swing: number;
}

export interface Score {
  meta: { title?: string; composer?: string; about?: string };
  timing: Timing;
  voices: Map<string, Voice>;
  patterns: Map<string, Pattern>;
  play: Cue[];
  loop: Cue[];
}

export interface Voice {
  name: string;
  instrument: string;
  drum: boolean;
  /** Level, 0 to 2 */
  vol: number;
  /** Stereo position, -1 left to 1 right */
  pan: number;
  /** Shift in semitones, combining `oct` and `trans` */
  transpose: number;
  /** Fraction of each note's written length that sounds */
  gate: number;
  /** MIDI pitch that chord names are voiced around */
  center: number;
}

export interface Pattern {
  name: string;
  /** Overrides of the score timing for this pattern */
  timing: Partial<Timing>;
  /** Bars per voice, in order */
  parts: Map<string, Bar[]>;
}

export interface Bar {
  line: number;
  text: string;
}

export interface Cue {
  pattern: string;
  transpose: number;
  repeat: number;
}

export interface Diagnostic {
  line: number;
  message: string;
}

const DEFAULT_TIMING: Timing = { tempo: 120, beats: 4, steps: 4, swing: 0 };

const TIMING_RANGES: Record<keyof Timing, [number, number]> = {
  tempo: [20, 400],
  beats: [1, 16],
  steps: [1, 12],
  swing: [0, 0.75],
};

/** Voice options that are accepted but not rendered */
const IGNORED_VOICE_OPTIONS = ["rev", "glide", "bright", "att", "rel"];

/**
 * Parse a score into settings, voices, patterns, and the arrangement.
 * Bars are kept as text, because reading them depends on the timing of the
 * pattern they are played in.
 */
export function parseScore(text: string): {
  score: Score;
  diagnostics: Diagnostic[];
} {
  const score: Score = {
    meta: {},
    timing: { ...DEFAULT_TIMING },
    voices: new Map(),
    patterns: new Map(),
    play: [],
    loop: [],
  };
  const diagnostics: Diagnostic[] = [];
  let pattern: Pattern | undefined;
  // Voices written in the current pattern, which replace a copied part
  let written = new Set<string>();

  text.split("\n").forEach((raw, index) => {
    const line = index + 1;
    const content = raw.replace(/(^|\s)#.*$/, "").trim();
    if (!content) {
      return;
    }
    const report = (message: string) => diagnostics.push({ line, message });

    if (content.includes("|")) {
      if (!pattern) {
        report("music line outside a pattern");
        return;
      }
      const separator = content.indexOf("|");
      const name = content.slice(0, separator).trim();
      if (!score.voices.has(name)) {
        report(`voice "${name}" is not declared`);
        return;
      }
      const texts = content
        .slice(separator + 1)
        .split("|")
        .map((bar) => bar.trim());
      if (texts.at(-1) === "") {
        texts.pop();
      }
      if (texts.includes("")) {
        report("empty bar, write _ for a silent bar");
        return;
      }
      if (!written.has(name)) {
        written.add(name);
        pattern.parts.set(name, []);
      }
      pattern.parts.get(name)!.push(...texts.map((text) => ({ line, text })));
      return;
    }

    const [keyword, ...args] = content.split(/\s+/);
    switch (keyword) {
      case "title":
      case "composer":
      case "about": {
        score.meta[keyword] = content.slice(keyword.length).trim();
        break;
      }
      case "tempo":
      case "beats":
      case "steps":
      case "swing": {
        const value = parseTimingValue(keyword, args[0]);
        if (typeof value === "string") {
          report(value);
          break;
        }
        (pattern ? pattern.timing : score.timing)[keyword] = value;
        break;
      }
      case "reverb": {
        // Accepted but not rendered
        break;
      }
      case "voice": {
        const voice = parseVoice(args);
        if (typeof voice === "string") {
          report(voice);
          break;
        }
        if (score.voices.has(voice.name)) {
          report(`voice "${voice.name}" is already declared`);
          break;
        }
        score.voices.set(voice.name, voice);
        break;
      }
      case "pattern": {
        const parsed = parsePattern(args, score.patterns);
        if (typeof parsed === "string") {
          report(parsed);
          pattern = undefined;
          break;
        }
        pattern = parsed;
        written = new Set();
        score.patterns.set(pattern.name, pattern);
        break;
      }
      case "mute": {
        if (!pattern) {
          report("mute outside a pattern");
          break;
        }
        if (!score.voices.has(args[0])) {
          report(`voice "${args[0]}" is not declared`);
          break;
        }
        pattern.parts.delete(args[0]);
        break;
      }
      case "play":
      case "loop": {
        pattern = undefined;
        for (const arg of args) {
          const cue = parseCue(arg);
          if (!cue) {
            report(`cannot read "${arg}" in ${keyword}`);
            continue;
          }
          if (!score.patterns.has(cue.pattern)) {
            report(`unknown pattern "${cue.pattern}" in ${keyword}`);
            continue;
          }
          score[keyword].push(cue);
        }
        break;
      }
      default: {
        report(`unknown statement "${keyword}"`);
      }
    }
  });

  return { score, diagnostics };
}

function parseVoice(args: string[]): Voice | string {
  const [name, instrument, ...options] = args;
  if (!name || !/^\w+$/.test(name)) {
    return "voice needs a name of letters, digits, and underscores";
  }
  const drum = DRUM_INSTRUMENTS.includes(instrument);
  if (!drum && !MELODIC_INSTRUMENTS.includes(instrument)) {
    return `unknown instrument "${instrument}"`;
  }
  const voice: Voice = {
    name,
    instrument,
    drum,
    vol: 0.8,
    pan: 0,
    transpose: 0,
    gate: 1,
    center: 62, // D4
  };
  for (const option of options) {
    const [key, valueText = ""] = option.split("=");
    if (IGNORED_VOICE_OPTIONS.includes(key)) {
      continue;
    }
    if (key === "center") {
      const center = parsePitch(valueText);
      if (center === undefined) {
        return `cannot read center "${valueText}"`;
      }
      voice.center = center;
      continue;
    }
    const value = Number(valueText);
    if (valueText === "" || Number.isNaN(value)) {
      return `cannot read voice option "${option}"`;
    }
    switch (key) {
      case "vol": {
        voice.vol = value;
        break;
      }
      case "pan": {
        voice.pan = value;
        break;
      }
      case "oct": {
        voice.transpose += 12 * value;
        break;
      }
      case "trans": {
        voice.transpose += value;
        break;
      }
      case "gate": {
        voice.gate = value;
        break;
      }
      default: {
        return `unknown voice option "${key}"`;
      }
    }
  }
  return voice;
}

function parsePattern(
  args: string[],
  patterns: Map<string, Pattern>,
): Pattern | string {
  const [name, ...rest] = args;
  if (!name || !/^\w+$/.test(name)) {
    return "pattern needs a name of letters, digits, and underscores";
  }
  const pattern: Pattern = { name, timing: {}, parts: new Map() };
  if (rest[0] === "from") {
    const base = patterns.get(rest[1]);
    if (!base) {
      return `pattern "${rest[1]}" is not defined before "${name}"`;
    }
    pattern.timing = { ...base.timing };
    for (const [voice, bars] of base.parts) {
      pattern.parts.set(voice, [...bars]);
    }
    rest.splice(0, 2);
  }
  for (const option of rest) {
    const [key, valueText] = option.split("=");
    if (!(key in TIMING_RANGES)) {
      return `unknown pattern option "${key}"`;
    }
    const value = parseTimingValue(key as keyof Timing, valueText);
    if (typeof value === "string") {
      return value;
    }
    pattern.timing[key as keyof Timing] = value;
  }
  return pattern;
}

function parseTimingValue(
  key: keyof Timing,
  text: string | undefined,
): number | string {
  const value = Number(text);
  const [min, max] = TIMING_RANGES[key];
  const integer = key === "beats" || key === "steps";
  if (
    text === undefined ||
    Number.isNaN(value) ||
    value < min ||
    value > max ||
    (integer && !Number.isInteger(value))
  ) {
    return `${key} must be ${integer ? "a whole number " : ""}from ${min} to ${max}`;
  }
  return value;
}

/** Parse an arrangement entry such as `A`, `B*2`, `A+5`, or `A+2*2` */
function parseCue(text: string): Cue | undefined {
  const match = text.match(/^(\w+)([+-]\d+)?(?:\*(\d+))?$/);
  if (!match) {
    return undefined;
  }
  const [, pattern, transpose = "0", repeat = "1"] = match;
  return { pattern, transpose: Number(transpose), repeat: Number(repeat) };
}
