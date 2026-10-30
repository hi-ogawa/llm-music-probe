// Writes project.json, a Toy MIDI SharedProject, next to this script.
//
// Each voice is written as space-separated tokens `<pitch>:<duration>`, with
// `r` for a rest. Durations: s = sixteenth, e = eighth, e. = dotted eighth,
// q = quarter, q. = dotted quarter, h = half, h. = dotted half, w = whole, or a
// number of beats. A trailing `~` ties the note into the next one of the same
// pitch. `@<beat>` asserts the running position, so a miscounted bar fails.
import { writeFileSync } from "node:fs";

const soprano = `
@0 r:w r:w
@8 A4:q D5:q F5:e. E5:s D5:e C5:e B4:s C5:s D5:s B4:s C5:s D5:s E5:s C5:s B4:e A4:e G#4:e B4:e
@16 A4:e C5:e D5:s E5:s F5:s D5:s E5:s F5:s G5:s E5:s C#5:q
@20 D5:q F5:e E5:e D5:q Bb4:e A4:e C#5:q D5:q G4:e Bb4:e A4:e G4:e
@28 F4:e A4:e D5:e F5:e~ F5:h E5:q C5:e E5:e~ E5:h D5:q Bb4:q C5:q Bb4:q
@40 A4:e C5:e F5:q. E5:e D5:e E5:e C5:h D5:q E5:q
@48 F5:q C5:q D5:e. E5:s F5:q G5:q D5:q Eb5:e. D5:s C5:e Bb4:e C5:q Eb5:q D5:q C5:q
@60 Bb4:h C5:q Eb5:h D5:q C5:q D5:q
@68 D5:q Eb5:h D5:h C5:h Bb4:h A4:h G4:q
@80 F4:e A4:e D5:e F5:e D5:q Bb4:e A4:e C#5:q D5:q Bb4:e D5:e E5:e C#5:e
@88 D5:q A5:q Bb5:e. A5:s G5:e F5:e E5:s F5:s G5:s E5:s F5:s G5:s A5:s F5:s E5:e D5:e C#5:e E5:e
@96 D5:q E5:s F5:s G5:s E5:s F5:q E5:e G5:e
@100 F5:q. E5:e D5:q Bb4:e A4:e C#5:q D5:q E5:e F5:e E5:e C#5:e
@108 D5:h E5:q F#5:w
@115
`;

const alto = `
@0 D4:q A4:q Bb4:e. A4:s G4:e F4:e E4:s F4:s G4:s E4:s F4:s G4:s A4:s F4:s E4:e D4:e C#4:e E4:e
@8 D4:q F4:e G4:e A4:q F4:e E4:e G#4:q A4:q D4:e F4:e E4:e D4:e
@16 C4:e E4:e F4:q G4:q A4:e G4:e
@20 F4:h. D4:q G4:q F4:e D4:e E4:e F4:e E4:e C#4:e
@28 D4:q F4:s G4:s A4:s F4:s Bb4:q G4:s A4:s Bb4:s G4:s C4:q E4:s F4:s G4:s E4:s A4:q F4:s G4:s A4:s F4:s F4:q D4:s E4:s F4:s D4:s E4:q G4:q
@40 F4:q C5:q D5:e. C5:s Bb4:e A4:e G4:s A4:s Bb4:s G4:s A4:s Bb4:s C5:s A4:s G4:e F4:e E4:e G4:e
@48 F4:q~ F4:s G4:s A4:s F4:s D4:q~ D4:s E4:s F4:s D4:s G4:q~ G4:s A4:s Bb4:s G4:s Eb4:q~ Eb4:s F4:s G4:s F4:s A4:q C5:e Bb4:e A4:q F#4:q
@60 G4:q Bb4:e A4:e G4:q Eb4:e D4:e F#4:q G4:q C4:e Eb4:e D4:e C4:e
@68 Bb3:e D4:e G4:e Bb4:e A4:q~ A4:s G4:s F4:s A4:s G4:q~ G4:s F4:s Eb4:s G4:s F4:q~ F4:s Eb4:s D4:s F4:s Eb4:q~ Eb4:s D4:s C4:s Eb4:s D4:q C#4:e E4:e
@80 D4:q r:h D4:q A4:q Bb4:e. A4:s G4:e F4:e E4:s F4:s G4:s E4:s F4:s G4:s A4:s F4:s E4:e D4:e C#4:e E4:e D4:q
@92 E4:e G4:e F4:q Bb4:q A4:e G4:e F4:q E4:q D4:q E4:e C#4:e
@100 D4:q A4:q Bb4:e. A4:s G4:e F4:e E4:s F4:s G4:s E4:s F4:s G4:s A4:s F4:s E4:e D4:e C#4:e E4:e
@108 D4:e F4:e Bb4:q A4:q~ A4:w
@115
`;

const bass = `
@0 r:w r:w r:w r:w r:w
@20 D3:q A3:q Bb3:e. A3:s G3:e F3:e E3:s F3:s G3:s E3:s F3:s G3:s A3:s F3:s E3:e D3:e C#3:e E3:e
@28 D3:q A2:q G2:q D3:q C3:q G2:q F2:q C3:q Bb2:q D3:q C3:h
@40 F3:q A3:e G3:e F3:q D3:e C3:e E3:q F3:q Bb2:e D3:e C3:e Bb2:e
@48 A2:q F2:q Bb2:q D3:q Bb2:q G2:q C3:q Eb3:q C3:q A2:q D3:q r:q
@60 G2:q D3:q Eb3:e. D3:s C3:e Bb2:e A2:s Bb2:s C3:s A2:s Bb2:s C3:s D3:s Bb2:s A2:e G2:e F#2:e A2:e
@68 G2:q Eb3:q F3:h Eb3:h D3:h C3:h Bb2:q A2:q
@80 D3:q A3:q Bb3:e. A3:s G3:e F3:e E3:s F3:s G3:s E3:s F3:s G3:s A3:s F3:s E3:e D3:e C#3:e E3:e
@88 D3:e F3:e A2:h D3:q A2:q D3:q G2:q A2:q
@96 D3:q A2:h. D2:15
@115
`;

const DURATIONS = { s: 0.25, e: 0.5, "e.": 0.75, q: 1, "q.": 1.5, h: 2, "h.": 3, w: 4 };
const PITCH_CLASSES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

function parsePitch(name) {
  const [, letter, accidental, octave] = name.match(/^([A-G])(#|b)?(\d)$/);
  return PITCH_CLASSES[letter] + (accidental === "#" ? 1 : accidental === "b" ? -1 : 0) + 12 * (Number(octave) + 1);
}

function parseVoice(source) {
  const notes = [];
  let time = 0;
  let tied = false;
  for (const token of source.trim().split(/\s+/)) {
    if (token.startsWith("@")) {
      if (Math.abs(time - Number(token.slice(1))) > 1e-9) throw new Error(`at ${token}, position is ${time}`);
      continue;
    }
    const [name, rawDuration] = token.split(":");
    const duration = DURATIONS[rawDuration.replace("~", "")] ?? Number(rawDuration.replace("~", ""));
    if (name !== "r") {
      const pitch = parsePitch(name);
      const last = notes.at(-1);
      if (tied && last?.pitch === pitch) last.duration += duration;
      else notes.push({ pitch, start: time, duration, velocity: 90 });
    }
    tied = rawDuration.endsWith("~");
    time += duration;
  }
  return notes;
}

const comment = `# Fugue in D minor, a 3

An original three-voice fugue for organ, in the style of a Baroque keyboard fugue.

**Instrument.** Church organ (GM 19) on every voice rather than harpsichord: an organ sustains, so the tied suspensions in the episodes and the 15-beat tonic pedal at the end really hold, and the bass voice can act as a pedal part.

**Subject** (alto, bars 1-2): a leap from tonic to dominant (D-A), a dotted neighbour figure (Bb-A) falling to F, then a rising sixteenth "turn" figure (E-F-G-E, F-G-A-F) that cadences through the leading tone (E-D-C#-E-D). The leap gives an easy head for entries, and the turn figure is the material for the episodes.

**Answer** (soprano, bars 3-4): tonal, in A minor. The opening D-A is answered A-D, not A-E, to keep the tonic, and the rest is a real transposition up a fifth.

**Countersubject** (alto against the answer): eighths and quarters, moving when the subject holds and holding when it runs in sixteenths. It is invertible at the octave, mostly in thirds and sixths, so it returns above the subject (bars 6-7, 16-17, 26-27) and below it in the bass (bars 11-12).

## Form and key plan

| Bars | Section | Key |
|---|---|---|
| 1-2 | Exposition: subject in alto | D minor |
| 3-4 | Answer in soprano, countersubject in alto | A minor |
| 5 | Codetta on the turn figure | back to D minor |
| 6-7 | Subject in bass, countersubject in soprano | D minor |
| 8-10 | Episode 1: descending-fifths sequence. The alto has the turn figure, the soprano a chain of prepared sevenths | D minor to F major |
| 11-12 | Middle entry in the relative major: subject in alto, countersubject in bass | F major |
| 13-15 | Episode 2: rising sequence on the subject's head, with the turn figure in the alto | F major to G minor |
| 16-17 | Middle entry: subject in bass, countersubject in alto | G minor |
| 18-20 | Episode 3: 7-6 suspension chain over a stepwise bass, with the turn figure inverted in the alto | G minor to the dominant of D |
| 21-24 | Stretto: bass (bar 21), alto on the last beat of bar 21 at the octave above, soprano (bar 23) | D minor |
| 25 | Short dominant pedal (A) with a cadential 6/4 | D minor |
| 26-29 | Final entry in alto over a tonic pedal (D), countersubject in soprano. It closes iv-V over the pedal onto a D major chord (Picardy third) | D minor to D major |

The counterpoint was checked with a script for parallel fifths and octaves, voice crossing and awkward leaps. None remain. The only hidden fifths are inside the sequence of episode 2, and the dissonances on the beat are prepared suspensions, chord sevenths or pedal-point clashes.
`;

const voices = [
  { name: "Soprano", pan: -0.3, source: soprano },
  { name: "Alto", pan: 0.3, source: alto },
  { name: "Bass (pedal)", pan: 0, source: bass },
];

const project = {
  title: "Fugue in D minor",
  comment,
  tempo: 54,
  timeSignature: { numerator: 4, denominator: 4 },
  locators: [
    [0, "Exposition: subject (alto)"],
    [8, "Answer (soprano) + countersubject"],
    [16, "Codetta"],
    [20, "Subject (bass)"],
    [28, "Episode 1"],
    [40, "Middle entry, F major"],
    [48, "Episode 2"],
    [60, "Middle entry, G minor"],
    [68, "Episode 3"],
    [80, "Stretto"],
    [96, "Dominant pedal"],
    [100, "Final entry over tonic pedal"],
  ].map(([beat, label]) => ({ beat, label })),
  // Church organ (GM 19) sustains, so suspensions and the pedal points hold.
  midiTracks: voices.map(({ name, pan, source }) => ({
    name,
    program: 19,
    gain: 1,
    pan,
    muted: false,
    soloed: false,
    height: 160,
    viewMode: "editor",
    keySignature: { fifths: -1, mode: "minor" },
    notes: parseVoice(source),
  })),
};

writeFileSync(new URL("project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
