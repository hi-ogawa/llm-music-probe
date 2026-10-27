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

// Estimate each track's loudness from its waveform's harmonics, A-weighted,
// and the synth's level (0.2 peak, linear in velocity).
const PEAK = 0.2;
const harmonics = {
  sine: (n) => (n === 1 ? 1 : 0),
  square: (n) => (n % 2 ? 4 / Math.PI / n : 0),
  sawtooth: (n) => 2 / Math.PI / n,
  triangle: (n) => (n % 2 ? 8 / Math.PI ** 2 / n ** 2 : 0),
};
function aWeightGain(f) {
  const f2 = f * f;
  const ra = (12194 ** 2 * f2 * f2) /
    ((f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2));
  return ra * 10 ** (2 / 20);
}
function measureLoudnessDb(waveform, notes, beats) {
  let energy = 0;
  for (const note of notes) {
    const f0 = 440 * 2 ** ((note.pitch - 69) / 12);
    const amplitude = PEAK * (note.velocity / 127);
    for (let n = 1; n * f0 < 20000; n++) {
      const a = amplitude * harmonics[waveform](n) * aWeightGain(n * f0);
      energy += (a * a / 2) * note.duration;
    }
  }
  return 10 * Math.log10(energy / beats);
}

// Relative loudness each part should sit at, in dB.
const tracks = [
  { name: "Lead (saw)", program: 81, waveform: "sawtooth", notes: lead, target: 0 },
  { name: "Arp (sine)", program: 80, waveform: "sine", notes: arp, target: -5 },
  { name: "Pad (triangle)", program: 89, waveform: "triangle", notes: pad, target: -4 },
  { name: "Bass (square)", program: 38, waveform: "square", notes: bass, target: -1 },
];
const loudness = tracks.map((t) => measureLoudnessDb(t.waveform, t.notes, 16));
const offsets = tracks.map((t, i) => t.target - loudness[i]);
// Cut rather than boost, so the track that needs the most gain sits at unity.
const shift = -Math.max(...offsets);
const project = {
  title: "Four Shapes",
  tempo: 110,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: 16 }, enabled: true },
  midiTracks: tracks.map(({ name, program, waveform, notes }, i) => ({
    name,
    program,
    synth: { waveform },
    gain: 10 ** ((offsets[i] + shift) / 20),
    notes,
  })),
};
writeFileSync(new URL("project.json", import.meta.url), `${JSON.stringify(project, null, 2)}\n`);
