import { writeFileSync } from "node:fs";

// D major, one chord per half note, as [bass, upper voices]. Each phrase is 4
// bars: the first ends on A, the second on A7, which resolves into the opening
// D as the loop wraps.
const chords = [
  // D, A/C#, Bm, F#m/A, G, D/F#, Em7, A
  [50, [57, 62, 66]], [49, [57, 61, 64]], [47, [59, 62, 66]], [45, [57, 61, 66]],
  [43, [59, 62, 67]], [42, [57, 62, 66]], [40, [59, 62, 67]], [45, [57, 61, 64]],
  // D, G, Bm, Em, G/B, D/A, Em7, A7
  [50, [57, 62, 66]], [43, [59, 62, 67]], [47, [59, 62, 66]], [40, [59, 64, 67]],
  [47, [59, 62, 67]], [45, [57, 62, 66]], [40, [59, 62, 67]], [45, [61, 64, 67]],
];
const manual = chords.flatMap(([, upper], i) =>
  upper.map((pitch) => ({ pitch, start: i * 2, duration: 2, velocity: 100 })));
const pedal = chords.map(([bass], i) => ({ pitch: bass, start: i * 2, duration: 2, velocity: 100 }));

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

const project = {
  title: "Swell Chorale",
  comment: [
    "An 8-bar organ chorale loop for Toy MIDI's own synth, in D major at 66 BPM.",
    "",
    "- **Manual**: a sine with a quiet square (gain 0.3) for a reedy organ tone, through a gentle low-pass. CC11 expression works like a swell pedal, opening into each cadence and settling back to its opening level by the loop point.",
    "- **Pedal**: a sine with a triangle (gain 0.5). Like a real organ's pedal division, it sits outside the swell box, so it keeps a steady level while the manual swells.",
    "- The second phrase ends on A7, which resolves into the opening D as the loop wraps.",
  ].join("\n"),
  tempo: 66,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: 32 }, enabled: true },
  midiTracks: [
    {
      name: "Manual",
      program: 19,
      synth: {
        layers: [
          { oscillator: { waveform: "sine" }, gain: 1 },
          { oscillator: { waveform: "square" }, gain: 0.3 },
        ],
      },
      eq: { bypass: false, bands: [{ type: "low-pass", frequency: 2573, q: 0.707, gain: 1, bypass: false }] },
      automation: [{ type: "controller", controller: 11, points: expression }],
      notes: manual,
    },
    {
      name: "Pedal",
      program: 19,
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
