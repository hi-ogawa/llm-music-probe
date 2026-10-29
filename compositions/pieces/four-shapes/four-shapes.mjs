import { writeFileSync } from "node:fs";
// Am F C G, one bar each.
const chords = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]];
const roots = [45, 41, 48, 43];
const melody = [76, 72, 69, 72, 77, 72, 69, 72, 76, 79, 76, 72, 74, 71, 67, 71];
const pad = chords.flatMap((chord, bar) =>
  chord.map((pitch) => ({ pitch, start: bar * 4, duration: 4, velocity: 70 })));
const bass = roots.flatMap((pitch, bar) =>
  Array.from({ length: 8 }, (_, i) => ({ pitch, start: bar * 4 + i / 2, duration: 0.45, velocity: i % 2 ? 80 : 100 })));
const lead = melody.map((pitch, i) => ({ pitch, start: i, duration: 0.9, velocity: 90 }));
const arp = chords.flatMap((chord, bar) =>
  Array.from({ length: 16 }, (_, i) => ({ pitch: chord[i % 3] + 12, start: bar * 4 + i / 4, duration: 0.2, velocity: 60 })));

// Low-pass bands that tame the edged waveforms' upper harmonics. Two bands
// with these Qs make a 24 dB/octave Butterworth slope when they share a
// frequency.
const BUTTERWORTH_4_QS = [0.541, 1.307];
function createLowPass(frequencies, qs) {
  return qs.map((q, i) => ({ type: "low-pass", frequency: frequencies[i], q, gain: 1, bypass: false }));
}

// Gains in dB, set by ear.
const tracks = [
  { name: "Lead (saw)", program: 81, waveform: "sawtooth", notes: lead, gainDb: -5.6, lowPass: createLowPass([1900, 2292], BUTTERWORTH_4_QS) },
  { name: "Arp (sine)", program: 80, waveform: "sine", notes: arp, gainDb: -4.9, lowPass: [] },
  { name: "Pad (triangle)", program: 89, waveform: "triangle", notes: pad, gainDb: -5.3, lowPass: createLowPass([4041], [0.707]) },
  { name: "Bass (square)", program: 38, waveform: "square", notes: bass, gainDb: -6, lowPass: createLowPass([600, 600], BUTTERWORTH_4_QS) },
];
const project = {
  title: "Four Shapes",
  tempo: 110,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: 16 }, enabled: true },
  midiTracks: tracks.map(({ name, program, waveform, notes, gainDb, lowPass }) => ({
    name,
    program,
    synth: { layers: [{ oscillator: { waveform } }] },
    gain: 10 ** (gainDb / 20),
    ...(lowPass.length > 0 && { eq: { bypass: false, bands: lowPass } }),
    notes,
  })),
};
writeFileSync(new URL("project.json", import.meta.url), `${JSON.stringify(project, null, 2)}\n`);
