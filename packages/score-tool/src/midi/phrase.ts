/** A note as it will be played, with times in beats from the song start */
export interface PlayedNote {
  pitch: number;
  start: number;
  duration: number;
  /** MIDI velocity, 1 to 127 */
  velocity: number;
}

/** A MIDI control change at a time in beats, with a value from 0 to 127 */
export interface ControlChange {
  time: number;
  number: number;
  value: number;
}

/** Instruments whose notes keep sounding under the player's control, so swells and vibrato apply */
const SUSTAINED_INSTRUMENTS = new Set([
  "flute",
  "clarinet",
  "oboe",
  "bassoon",
  "accordion",
  "altosax",
  "tenorsax",
  "barisax",
  "trumpet",
  "trombone",
  "brass",
  "horn",
  "tuba",
  "violin",
  "viola",
  "cello",
  "contrabass",
  "strings",
  "fiddle",
  "choir",
  "voices",
  "pad",
]);

const EXPRESSION = 11;
const MODULATION = 1;

/** A rest of at least this many beats ends a phrase */
const PHRASE_BREAK = 0.5;
/** How far a connected note overlaps the next one, in beats, on sustained instruments */
const LEGATO_OVERLAP = 0.04;
/** Notes held at least this long, in beats, get an expression swell */
const SWELL_LENGTH = 1;
/** Notes held at least this long, in beats, get delayed vibrato */
const VIBRATO_LENGTH = 1.5;
/** Spacing of control points on a ramp, in beats */
const RAMP_STEP = 0.125;
const EPSILON = 1e-6;

/** Notes struck together, played as one gesture */
interface PhraseEvent {
  start: number;
  /** Written length in beats, before the voice's gate */
  written: number;
  /** Highest pitch, which carries the line */
  top: number;
  notes: PlayedNote[];
}

/**
 * Play a line the way a performer might, without changing its notes.
 * Notes struck together form one event, and a rest of half a beat or more
 * ends a phrase. Within a phrase, velocity rises toward the highest event
 * and falls after it, with a light accent on beats. Events written back to
 * back connect: a new pitch overlaps slightly on sustained instruments, a
 * repeated pitch is detached, and the last event is shortened for a breath.
 * Sustained instruments also get an expression swell and delayed vibrato on
 * long notes.
 */
export function phraseLine(
  notes: PlayedNote[],
  options: { instrument: string; gate: number },
): { notes: PlayedNote[]; controls: ControlChange[] } {
  const sustained = SUSTAINED_INSTRUMENTS.has(options.instrument);
  const played: PlayedNote[] = [];
  const controls: ControlChange[] = [];
  for (const phrase of splitPhrases(groupEvents(notes, options.gate))) {
    const peak = phrase.reduce(
      (best, event, i) => (event.top > phrase[best].top ? i : best),
      0,
    );
    phrase.forEach((event, i) => {
      const next = phrase.at(i + 1);
      const duration = getPlayedDuration(event, next, sustained);
      const scale = getContour(i, peak, phrase.length) * getAccent(event.start);
      for (const note of event.notes) {
        played.push({
          ...note,
          duration,
          velocity: Math.min(
            127,
            Math.max(1, Math.round(note.velocity * scale)),
          ),
        });
      }
      if (sustained) {
        const end = Math.min(event.start + duration, next?.start ?? Infinity);
        controls.push(...shapeExpression(event.start, end, event.written));
        controls.push(...shapeVibrato(event.start, end, event.written));
      }
    });
  }
  return { notes: played, controls };
}

function groupEvents(notes: PlayedNote[], gate: number): PhraseEvent[] {
  const events: PhraseEvent[] = [];
  for (const note of notes.toSorted((a, b) => a.start - b.start)) {
    const last = events.at(-1);
    if (last && Math.abs(last.start - note.start) < EPSILON) {
      last.notes.push(note);
      last.top = Math.max(last.top, note.pitch);
      last.written = Math.max(last.written, note.duration / gate);
      continue;
    }
    events.push({
      start: note.start,
      written: note.duration / gate,
      top: note.pitch,
      notes: [note],
    });
  }
  return events;
}

function splitPhrases(events: PhraseEvent[]): PhraseEvent[][] {
  const phrases: PhraseEvent[][] = [];
  events.forEach((event, i) => {
    const previous = events[i - 1];
    const rest = previous
      ? event.start - (previous.start + previous.written)
      : Infinity;
    if (rest >= PHRASE_BREAK - EPSILON) {
      phrases.push([]);
    }
    phrases.at(-1)!.push(event);
  });
  return phrases;
}

/** Velocity scale: 0.85 at the phrase ends, rising to 1 at the peak */
function getContour(index: number, peak: number, length: number): number {
  if (index <= peak) {
    return peak === 0 ? 1 : 0.85 + (0.15 * index) / peak;
  }
  return 1 - (0.15 * (index - peak)) / (length - 1 - peak);
}

function getAccent(start: number): number {
  return Math.abs(start - Math.round(start)) < EPSILON ? 1.05 : 1;
}

function getPlayedDuration(
  event: PhraseEvent,
  next: PhraseEvent | undefined,
  sustained: boolean,
): number {
  if (!next) {
    return event.written * 0.9;
  }
  const touching = next.start - (event.start + event.written) < EPSILON;
  if (!touching) {
    return event.written;
  }
  const span = next.start - event.start;
  if (next.top === event.top) {
    return span * 0.85;
  }
  return span + (sustained ? LEGATO_OVERLAP : 0);
}

/** Expression: long notes swell from 85 to 120 by their middle and ease to 100, short notes sit at 110 */
function shapeExpression(
  start: number,
  end: number,
  written: number,
): ControlChange[] {
  if (written < SWELL_LENGTH) {
    return [{ time: start, number: EXPRESSION, value: 110 }];
  }
  return rampControl(start, end, EXPRESSION, (t) =>
    t < 0.5 ? 85 + 70 * t : 120 - 50 * (t - 0.5),
  );
}

/** Vibrato: none for the first 40% of a long note, then rising to 60 by 80% */
function shapeVibrato(
  start: number,
  end: number,
  written: number,
): ControlChange[] {
  if (written < VIBRATO_LENGTH) {
    return [];
  }
  return [
    ...rampControl(start, end, MODULATION, (t) =>
      t < 0.4 ? 0 : Math.min(60, (60 * (t - 0.4)) / 0.4),
    ),
    { time: end, number: MODULATION, value: 0 },
  ];
}

/** Sample `shape`, a function of the fraction of the note elapsed, from `start` up to `end` */
function rampControl(
  start: number,
  end: number,
  number: number,
  shape: (t: number) => number,
): ControlChange[] {
  const controls: ControlChange[] = [];
  for (let time = start; time < end - EPSILON; time += RAMP_STEP) {
    const value = Math.round(shape((time - start) / (end - start)));
    if (controls.at(-1)?.value !== value) {
      controls.push({ time, number, value });
    }
  }
  return controls;
}
