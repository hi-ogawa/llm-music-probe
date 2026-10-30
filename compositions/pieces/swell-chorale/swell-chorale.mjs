import { writeFileSync } from "node:fs";

// D major, one chord per half note. Each phrase is 4 bars: the first ends on
// A, the second on A7, which resolves into the opening D as the loop wraps.
// Phrase 1: D, A/C#, Bm, F#m/A, G, D/F#, Em7, A
// Phrase 2: D, G, Bm, Em, G/B, D/A, Em7, A7
const bass = [50, 49, 47, 45, 43, 42, 40, 45, 50, 43, 47, 40, 47, 45, 40, 45];

// Voice lines as [pitch, beats]. The soprano moves in quarters and eighths
// with passing and neighbor tones. The inner voices hold common tones across
// chords and resolve a 4-3 suspension, D to C#, into each A chord.
const soprano = [
  [78, 1], [76, 1], [76, 1], [73, 1], [74, 1], [76, 0.5], [74, 0.5], [73, 1],
  [69, 1], [71, 1], [74, 1], [78, 1], [76, 0.5], [74, 0.5], [74, 1], [71, 1], [73, 2],
  [74, 1], [78, 1], [79, 1.5], [78, 0.5], [74, 1], [78, 1], [79, 1], [76, 1],
  [74, 1], [79, 0.5], [78, 0.5], [78, 1], [76, 0.5], [74, 0.5], [76, 1], [74, 1], [73, 1], [76, 1],
];
const alto = [
  [62, 2], [64, 2], [66, 2], [66, 2], [67, 2], [62, 2], [67, 2], [64, 2],
  [62, 2], [62, 2], [62, 2], [64, 2], [67, 2], [66, 2], [67, 2], [67, 2],
];
const tenor = [
  [57, 2], [57, 2], [59, 2], [61, 2], [62, 2], [57, 2], [62, 2], [62, 1], [61, 1],
  [57, 2], [59, 2], [59, 2], [59, 2], [62, 2], [62, 2], [62, 2], [62, 1], [61, 1],
];

// Repeated pitches in a line become one held note, the way an organist ties
// common tones instead of restriking them.
function createLine(line, velocity) {
  const notes = [];
  let start = 0;
  for (const [pitch, duration] of line) {
    const previous = notes.at(-1);
    if (previous?.pitch === pitch && previous.start + previous.duration === start) {
      previous.duration += duration;
    } else {
      notes.push({ pitch, start, duration, velocity });
    }
    start += duration;
  }
  return notes;
}
const solo = createLine(soprano, 100);
const swell = [...createLine(alto, 100), ...createLine(tenor, 100)];
const pedal = createLine(bass.map((pitch) => [pitch, 2]), 100);

// Automation holds each point's value until the next, so a point every 16th
// keeps a swell from sounding stepped.
function createRamps(segments) {
  return segments.flatMap(([startBeat, startValue, endBeat, endValue]) =>
    Array.from({ length: (endBeat - startBeat) * 4 }, (_, i) => ({
      beat: startBeat + i / 4,
      value: Math.round(startValue + ((endValue - startValue) * i) / ((endBeat - startBeat) * 4)),
    })));
}
// The swell pedal opens into each cadence and settles back to the opening
// level by the loop point.
const expression = createRamps([
  [0, 60, 12, 127], [12, 127, 14, 127], [14, 127, 16, 85],
  [16, 85, 26, 127], [26, 127, 28, 127], [28, 127, 32, 60],
]);

// Track gains in dB, set from per-track loudness in a render: the swell's
// peak sits just under the steady melody, and the pedal under both.
const fromDb = (db) => 10 ** (db / 20);

const project = {
  title: "Swell Chorale",
  comment: [
    "An 8-bar organ chorale loop for Toy MIDI's own synth, in D major at 66 BPM. Like an organ's divisions, each part has its own stop and place.",
    "",
    "- **Solo**: the soprano melody on a flute-like stop, a sine with a triangle (gain 0.5), a little right of center at a steady level.",
    "- **Swell**: two inner voices that hold common tones and suspend into each A chord, on a reedy stop, a sine with a quiet square (gain 0.3) through a gentle low-pass, a little left of center. CC11 expression works like a swell pedal, opening into each cadence and settling back to its opening level by the loop point.",
    "- **Pedal**: the bass line on a sine with a triangle (gain 0.5), centered. Like a real organ's pedal division, it sits outside the swell box, so it keeps a steady level.",
    "- The second phrase ends on A7, which resolves into the opening D as the loop wraps.",
  ].join("\n"),
  tempo: 66,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: 32 }, enabled: true },
  midiTracks: [
    {
      name: "Solo",
      program: 19,
      pan: 0.3,
      synth: {
        layers: [
          { oscillator: { waveform: "sine" }, gain: 1 },
          { oscillator: { waveform: "triangle" }, gain: 0.5 },
        ],
      },
      notes: solo,
    },
    {
      name: "Swell",
      program: 19,
      pan: -0.3,
      gain: fromDb(-4),
      synth: {
        layers: [
          { oscillator: { waveform: "sine" }, gain: 1 },
          { oscillator: { waveform: "square" }, gain: 0.3 },
        ],
      },
      eq: { bypass: false, bands: [{ type: "low-pass", frequency: 2573, q: 0.707, gain: 1, bypass: false }] },
      automation: [{ type: "controller", controller: 11, points: expression }],
      notes: swell,
    },
    {
      name: "Pedal",
      program: 19,
      gain: fromDb(-2),
      synth: {
        layers: [
          { oscillator: { waveform: "sine" }, gain: 1 },
          { oscillator: { waveform: "triangle" }, gain: 0.5 },
        ],
      },
      notes: pedal,
    },
  ],
};
writeFileSync(new URL("project.json", import.meta.url), `${JSON.stringify(project, null, 2)}\n`);
