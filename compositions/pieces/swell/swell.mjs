// "Swell": a CC11 expression demo for Toy MIDI, 16 bars of 4/4 at 66 BPM, D major turning to B minor.
//
// Usage: node swell.mjs <out dir> [flat CC11 per track as JSON]
// Writes v1-flat.json (each track's CC11 held at one value) and v2-expression.json (shaped CC11).
// Both versions have the same notes and velocities.
//
// Form (bars):
// 1-4   Note-level shaping. Solo cello over harp arpeggios and a string pad, D Bm G A.
//       The cello swells into its long notes and tapers at the two phrase ends, the pad breathes
//       with a hairpin on each chord. The harp is plucked and has no CC11.
// 5-8   Phrase crescendo. Horns join, the bass climbs B C# D E F# under Bm F#/C# Bm/D Em F#7,
//       the cello climbs to C#5. Strings and horns crescendo across the four bars, and a timpani
//       roll on F# (written as 32nds) crescendos into bar 9.
// 9-12  Long diminuendo. Forte arrival on G (VI of B minor, back to D major), then the line
//       descends through D/F# Em7 A7sus4 A7 while the ensemble falls away.
// 13-16 Fade to silence. A held D major chord fades out completely.
import fs from "node:fs";
import path from "node:path";

const [outDir, flatArg] = process.argv.slice(2);
const FLAT = {
  Cello: 102,
  Strings: 94,
  Horns: 115,
  Timpani: 104,
  ...(flatArg ? JSON.parse(flatArg) : {}),
};
const BAR = 4;
const END = 16 * BAR;

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const m = (n) => {
  const [, l, acc, o] = n.match(/^([A-G])(#?)(\d)$/);
  return 12 * (Number(o) + 1) + NOTE[l] + (acc ? 1 : 0);
};
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)); // smoothstep
const lerp = (a, b, x) => a + (b - a) * x;
const clamp = (v) => Math.max(0, Math.min(127, Math.round(v)));

// --- cello: [pitch, beats, velocity], phrase ends marked ---

const CELLO_LINE = [
  // bars 1-4
  ["F#3", 1, 78], ["A3", 3, 84],
  ["D4", 1.5, 82], ["C#4", 0.5, 74], ["B3", 2, 76, "end"],
  ["G3", 1, 78], ["B3", 3, 84],
  ["E4", 1.5, 84], ["D4", 0.5, 74], ["C#4", 2, 76, "end"],
  // bars 5-8
  ["D4", 1, 80], ["E4", 1, 80], ["F#4", 2, 84],
  ["E4", 1, 82], ["C#4", 1, 80], ["F#4", 2, 86],
  ["F#4", 1, 86], ["A4", 1, 88], ["B4", 2, 92],
  ["G4", 1, 90], ["B4", 1, 92], ["A#4", 1, 94], ["C#5", 1, 98],
  // bars 9-12
  ["D5", 2, 108], ["B4", 1, 92], ["A4", 1, 88],
  ["A4", 2, 86], ["F#4", 1, 80], ["E4", 1, 78],
  ["D4", 2, 78], ["B3", 1, 74], ["G3", 1, 72],
  ["G3", 1, 72], ["E3", 1, 70], ["C#3", 2, 72],
  // bars 13-16
  ["D3", 16, 72, "end"],
];
const cello = [];
{
  let beat = 0;
  for (const [n, dur, velocity, mark] of CELLO_LINE) {
    // legato: each note overlaps the next slightly so the line doesn't gap
    cello.push({ pitch: m(n), start: beat, duration: dur + (mark ? -0.05 : 0.02), velocity, mark });
    beat += dur;
  }
}

// --- harmony: [bar, beat offset, beats, pad voicing, horn voicing] ---

const CHORDS = [
  [1, 0, 4, ["D2", "A2", "F#4", "A4", "D5"]],
  [2, 0, 4, ["B1", "F#2", "F#4", "B4", "D5"]],
  [3, 0, 4, ["G2", "D3", "G4", "B4", "D5"]],
  [4, 0, 4, ["A2", "E3", "E4", "A4", "C#5"]],
  [5, 0, 4, ["B1", "B2", "F#3", "B3", "D4"], ["F#3", "B3"]],
  [6, 0, 4, ["C#2", "C#3", "F#3", "A#3", "C#4"], ["F#3", "A#3"]],
  [7, 0, 4, ["D2", "D3", "F#3", "B3", "D4"], ["F#3", "D4"]],
  [8, 0, 2, ["E2", "E3", "G3", "B3", "E4"], ["G3", "B3"]],
  [8, 2, 2, ["F#2", "F#3", "A#3", "C#4", "E4"], ["A#3", "E4"]],
  [9, 0, 4, ["G1", "G2", "G3", "B3", "D4", "G4"], ["G3", "B3", "D4"]],
  [10, 0, 4, ["F#2", "F#3", "A3", "D4", "F#4"], ["A3", "D4"]],
  [11, 0, 4, ["E2", "E3", "G3", "B3", "D4"], ["G3", "B3"]],
  [12, 0, 2, ["A1", "A2", "E3", "A3", "D4"], ["A3", "D4"]],
  [12, 2, 2, ["A1", "A2", "E3", "G3", "C#4"], ["G3", "C#4"]],
  [13, 0, 16, ["D2", "A2", "F#3", "A3", "D4", "A4"]],
];
const at = (bar, off) => (bar - 1) * BAR + off;

const strings = CHORDS.flatMap(([bar, off, dur, pad]) =>
  pad.map((n, i) => ({ pitch: m(n), start: at(bar, off), duration: dur + 0.02, velocity: i === 0 ? 74 : 68 })),
);
const horns = CHORDS.filter((c) => c[4]).flatMap(([bar, off, dur, , horn]) =>
  horn.map((n) => ({ pitch: m(n), start: at(bar, off), duration: dur + 0.02, velocity: bar === 9 ? 92 : 76 })),
);

// --- harp: 8th arpeggios up through the chord, velocity follows the dynamics ---

const harpVelocity = (beat) => {
  if (beat < 16) return 62;
  if (beat < 32) return lerp(60, 92, (beat - 16) / 16);
  if (beat < 48) return lerp(96, 52, (beat - 32) / 16);
  return 46;
};
const harp = [];
for (const [bar, off, dur, pad] of CHORDS) {
  const pcs = [...new Set(pad.slice(1).map((n) => m(n) % 12))];
  const tones = [];
  for (let p = m(pad[0]) + 12; tones.length < 12; p++) if (pcs.includes(p % 12)) tones.push(p);
  if (bar === 13) {
    // a soft rolled chord, then the harp lets it ring
    tones.slice(0, 7).forEach((pitch, i) =>
      harp.push({ pitch, start: at(bar, 0) + i * 0.08, duration: 6, velocity: 50 - i }),
    );
    continue;
  }
  const descending = bar >= 9; // the line falls from the arrival on
  const steps = dur * 2;
  for (let i = 0; i < steps; i++) {
    const k = i < 6 ? i : 12 - i; // up six, back down
    const idx = descending ? Math.max(0, 6 - k) : k;
    const start = at(bar, off) + i * 0.5;
    const accent = i % 4 === 0 ? 8 : 0;
    harp.push({ pitch: tones[idx + 1], start, duration: 1.5, velocity: clamp(harpVelocity(start) + accent) });
  }
}

// --- timpani: F# roll across bar 8 in 32nds, G stroke on the downbeat of bar 9 ---

const timpani = [];
for (let i = 0; i < 32; i++) {
  timpani.push({ pitch: m("F#2"), start: at(8, 0) + i * 0.125, duration: 0.125, velocity: 72 + (i % 2 ? -4 : 0) });
}
timpani.push({ pitch: m("G2"), start: at(9, 0), duration: 2, velocity: 112 });

// --- CC11 shapes, as functions of the beat, sampled every 16th ---

const phase = (beat, a, b) => ease((beat - a) / (b - a));

// the dynamic level of a section, shared by the sustained parts
const section = (beat, { quiet, start = quiet, loud, floor }) => {
  if (beat < 16) return quiet;
  if (beat < 32) return lerp(start, loud, phase(beat, 16, 32));
  if (beat < 48) return lerp(127, floor, phase(beat, 32, 46));
  return lerp(floor, 0, ease((beat - 48) / 15.5) ** 0.8);
};

const celloShape = (beat) => {
  const base = section(beat, { quiet: 92, start: 76, loud: 124, floor: 78 });
  const note = cello.find((n) => beat >= n.start && beat < n.start + n.duration) ?? null;
  if (!note || note.duration < 1.5 || beat >= 48) return base;
  // swell into long notes, peak around 60%, then taper at phrase ends or settle back
  const x = (beat - note.start) / note.duration;
  const depth = beat < 16 ? 1 : 0.4;
  const rise = x < 0.6 ? lerp(-26, 14, ease(x / 0.6)) : lerp(14, note.mark ? -40 : 0, ease((x - 0.6) / 0.4));
  return base + depth * rise;
};

const stringsShape = (beat) => {
  if (beat < 16) {
    // hairpin on each chord
    const x = (beat % 4) / 4;
    return 58 + 40 * Math.sin(Math.PI * x) ** 1.5;
  }
  return section(beat, { quiet: 62, start: 50, loud: 124, floor: 66 });
};

const hornsShape = (beat) => {
  if (beat < 16) return 42;
  if (beat < 32) return lerp(42, 125, phase(beat, 16, 32));
  return lerp(127, 48, phase(beat, 32, 47));
};

const timpaniShape = (beat) => {
  if (beat < 28) return 44;
  if (beat < 32) return lerp(44, 127, ease((beat - 28) / 4) ** 1.4); // accelerating crescendo
  return 127;
};

const curve = (shape, from = 0, to = END) => {
  const points = [];
  let last;
  for (let beat = from; beat <= to; beat += 0.25) {
    const value = clamp(shape(beat));
    if (value !== last) points.push({ beat, value });
    last = value;
  }
  return points;
};
const cc11 = (points) => [{ type: "controller", controller: 11, points }];
const flat = (value) => cc11([{ beat: 0, value }]);

// --- project ---

const track = (name, program, gain, pan, notes) => ({
  name,
  program,
  notes: notes.map(({ pitch, start, duration, velocity }) => ({ pitch, start, duration, velocity })),
  muted: false,
  soloed: false,
  gain,
  pan,
});

const project = (version, shaped) => ({
  title: `Swell ${version}`,
  comment:
    "A CC11 expression demo, 16 bars at 66 BPM, D major turning to B minor. Bars 1-4 shape single notes " +
    "(cello swells and tapers, pad hairpins), bars 5-8 crescendo strings and horns into a timpani roll, " +
    "bars 9-12 fall away from a forte arrival on G, bars 13-16 fade a held D chord to silence. " +
    (shaped
      ? "This is the shaped version, with CC11 on cello, strings, horns, and timpani."
      : "This is the flat version, with the same notes and each track's CC11 held at one value."),
  tempo: 66,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 1,
  locators: [
    { id: "shaping", beat: 0, label: "Note shaping" },
    { id: "crescendo", beat: 16, label: "Crescendo" },
    { id: "diminuendo", beat: 32, label: "Diminuendo" },
    { id: "fade", beat: 48, label: "Fade" },
  ],
  midiTracks: [
    { ...track("Cello", 42, 0.85, 0.3, cello), automation: shaped ? cc11(curve(celloShape)) : flat(FLAT.Cello) },
    { ...track("Strings", 48, 0.95, -0.05, strings), automation: shaped ? cc11(curve(stringsShape)) : flat(FLAT.Strings) },
    { ...track("Horns", 60, 0.6, -0.3, horns), automation: shaped ? cc11(curve(hornsShape, 0, 48)) : flat(FLAT.Horns) },
    track("Harp", 46, 0.42, -0.45, harp),
    { ...track("Timpani", 47, 0.7, 0.1, timpani), automation: shaped ? cc11(curve(timpaniShape, 0, 40)) : flat(FLAT.Timpani) },
  ],
  loop: { enabled: true, range: { startBeat: 0, endBeat: END } },
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "v1-flat.json"), JSON.stringify(project("v1 (flat)", false), null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "v2-expression.json"), JSON.stringify(project("v2 (expression)", true), null, 2) + "\n");
