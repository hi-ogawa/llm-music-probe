// Writes project.json: a listening lab for metallic drum sounds, comparing the
// 808's six square oscillators with noise through identical filters, toward
// the TR-808 kit in https://github.com/hi-ogawa/toy-midi/issues/1098.
// Run with `node hat-lab.mjs`.
import { writeFileSync } from "node:fs";

const TEMPO = 120;
const BAR = 4;
const PART = 4 * BAR;
const SAMPLE_RATE = 48000;
const round = (x) => Math.round(x * 10000) / 10000;
const dbToGain = (db) => 10 ** (db / 20);
const midiToHz = (pitch) => 440 * 2 ** ((pitch - 69) / 12);

// The six frequencies commonly cited for the 808's cymbal and hat oscillators
const SQUARE_FREQUENCIES = [205.3, 304.4, 369.6, 522.7, 540, 800];
const NOTE = 60;

// --- Filters ---------------------------------------------------------------------

// A band is the layer's low-pass and the track's two high-passes and peak, the
// same for both sources in a pair.
const BANDS = {
  low: { label: "3 kHz", lowPass: 4000, highPass: 2500, peak: 3200 },
  mid: { label: "7 kHz", lowPass: 8100, highPass: 5500, peak: 8000 },
  high: { label: "11 kHz", lowPass: 13000, highPass: 9000, peak: 11000 },
  cymbal: { label: "cymbal", lowPass: 11000, highPass: 3000, peak: 7000 },
};
const LOW_PASS_Q = 1.2;
const PEAK_DB = 6;

// The track EQ's biquads, mirrored here to match levels between sources
function biquad(type, frequency, q, gain = 1) {
  const omega = (2 * Math.PI * frequency) / SAMPLE_RATE;
  const cos = Math.cos(omega);
  const alpha = Math.sin(omega) / (2 * q);
  if (type === "peaking") {
    const amplitude = Math.sqrt(gain);
    const a0 = 1 + alpha / amplitude;
    return { b0: (1 + alpha * amplitude) / a0, b1: (-2 * cos) / a0, b2: (1 - alpha * amplitude) / a0, a1: (-2 * cos) / a0, a2: (1 - alpha / amplitude) / a0 };
  }
  const a0 = 1 + alpha;
  const edge = type === "high-pass" ? (1 + cos) / 2 : (1 - cos) / 2;
  const b1 = ((type === "high-pass" ? -2 : 2) * edge) / a0;
  return { b0: edge / a0, b1, b2: edge / a0, a1: (-2 * cos) / a0, a2: (1 - alpha) / a0 };
}
function powerResponse({ b0, b1, b2, a1, a2 }, frequency) {
  const w = (2 * Math.PI * frequency) / SAMPLE_RATE;
  const nr = b0 + b1 * Math.cos(w) + b2 * Math.cos(2 * w), ni = -b1 * Math.sin(w) - b2 * Math.sin(2 * w);
  const dr = 1 + a1 * Math.cos(w) + a2 * Math.cos(2 * w), di = -a1 * Math.sin(w) - a2 * Math.sin(2 * w);
  return (nr * nr + ni * ni) / (dr * dr + di * di);
}
const bandFilters = (band) => [
  biquad("low-pass", band.lowPass, LOW_PASS_Q),
  biquad("high-pass", band.highPass, 0.7),
  biquad("high-pass", band.highPass, 0.7),
  biquad("peaking", band.peak, 1.2, dbToGain(PEAK_DB)),
];
const bandPower = (filters, frequency) => filters.reduce((p, f) => p * powerResponse(f, frequency), 1);

// Power each source passes through a band at unit gain. A square's odd
// harmonics have amplitude 4 / (πn), and uniform noise in [-1, 1) has power
// 1/3 spread evenly up to Nyquist.
function squaresPower(filters, transpose = 0) {
  let power = 0;
  for (const base of SQUARE_FREQUENCIES) {
    const f0 = base * 2 ** (transpose / 12);
    for (let n = 1; n * f0 < SAMPLE_RATE / 2; n += 2) {
      power += ((4 / (Math.PI * n)) ** 2 / 2) * bandPower(filters, n * f0);
    }
  }
  return power;
}
function noisePower(filters) {
  const nyquist = SAMPLE_RATE / 2;
  const steps = 4000;
  let sum = 0;
  for (let i = 0; i < steps; i++) sum += bandPower(filters, ((i + 0.5) / steps) * nyquist);
  return (1 / 3) * (sum / steps);
}

// --- Patches ---------------------------------------------------------------------

const envelope = (attack, decay, sustain, release) => ({ attack, decay, sustain, release });
const NOISE_GAIN = 0.3;

function patchFor(band, decay) {
  const filters = bandFilters(band);
  // Each square's gain makes the six together pass the same power as the noise.
  const squareGain = NOISE_GAIN * Math.sqrt(noisePower(filters) / squaresPower(filters));
  const filter = {
    cutoff: band.lowPass,
    resonance: LOW_PASS_Q,
    keytrack: 0,
    envelope: { ...envelope(0.001, 0.1, 0, 0.1), amount: 0, velocity: 0 },
  };
  // Release and decay both fall toward 0 at the same rate, so a note-off
  // continues the same curve, and the hit decays fully however short its note.
  const amp = { envelope: envelope(0.0005, decay, 0, decay) };
  const eq = {
    bypass: false,
    bands: [
      { type: "high-pass", frequency: band.highPass, gain: 1, q: 0.7, bypass: false },
      { type: "high-pass", frequency: band.highPass, gain: 1, q: 0.7, bypass: false },
      { type: "peaking", frequency: band.peak, gain: dbToGain(PEAK_DB), q: 1.2, bypass: false },
    ],
  };
  const squares = SQUARE_FREQUENCIES.map((frequency, i) => ({
    oscillator: { waveform: "square", octave: 0, detune: round(1200 * Math.log2(frequency / midiToHz(NOTE))) },
    gain: round(squareGain),
    pan: round((i - 2.5) * 0.06),
    filter,
    amp,
  }));
  const noise = [{ oscillator: { waveform: "noise", octave: 0, detune: 0 }, gain: NOISE_GAIN, pan: 0, filter, amp }];
  return { squares, noise, eq };
}

// --- Parts ---------------------------------------------------------------------

const tracks = [];
const locators = [];
let partIndex = 0;

const track = (name, layers, eq, notes) =>
  tracks.push({ name, program: 0, gain: 0.8, synth: { layers }, eq, notes });
const hit = (beat, pitch = NOTE, velocity = 100, duration = 0.1) =>
  ({ pitch, start: round(beat), duration, velocity });

// Squares and noise take turns, through the same band and envelope. Short
// decays alternate half bars of repeated hits, and long ones alternate bars.
function pair(label, band, decay) {
  const start = partIndex++ * PART;
  locators.push({ beat: start, label });
  const { squares, noise, eq } = patchFor(band, decay);
  const interval = decay <= 0.05 ? 0.5 : decay <= 0.2 ? 1 : decay <= 0.6 ? 2 : 4;
  const squareNotes = [];
  const noiseNotes = [];
  const turn = Math.max(2, interval);
  for (let beat = 0; beat < PART; beat += interval) {
    const isSquare = Math.floor(beat / turn) % 2 === 0;
    (isSquare ? squareNotes : noiseNotes).push(hit(start + beat, NOTE, beat % turn === 0 ? 104 : 88));
  }
  track(`${label} · squares`, squares, eq, squareNotes);
  track(`${label} · noise`, noise, eq, noiseNotes);
}

// 1. Decay ladder, through the 808 hat band
for (const decay of [0.04, 0.15, 0.5, 2]) {
  pair(`Decay ${decay < 1 ? `${decay * 1000} ms` : `${decay} s`}`, BANDS.mid, decay);
}

// 2. Band ladder, at an open-hat-like decay. The 7 kHz step is the decay
// ladder's 150 ms part.
for (const band of [BANDS.low, BANDS.high]) pair(`Band ${band.label}`, band, 0.15);

// 3. Retuning: the squares follow the note, so playing another note moves all
// six frequencies together. Each bar plays the reference twice and then a
// transposed pair, at 500 ms so each hit rings long enough to hear its color.
{
  const start = partIndex++ * PART;
  locators.push({ beat: start, label: "Retune squares" });
  const { squares, eq } = patchFor(BANDS.mid, 0.5);
  const notes = [-12, -5, 5, 12].flatMap((transpose, bar) => [
    hit(start + bar * BAR, NOTE, 100), hit(start + bar * BAR + 1, NOTE, 100),
    hit(start + bar * BAR + 2, NOTE + transpose, 100), hit(start + bar * BAR + 3, NOTE + transpose, 100),
  ]);
  track("Retune · squares", squares, eq, notes);
}

// 4. Cymbal: a long decay through a wider band
pair("Cymbal", BANDS.cymbal, 2);

const end = partIndex * PART;
const comment = `# Hat Lab

A listening lab, not a beat. It compares the 808's six square oscillators (205.3, 304.4, 369.6, 522.7, 540, and 800 Hz) with noise, through the same low-pass, track high-passes, and peak in each pair, with levels matched by computing each source's power through the band. Each part takes turns, squares first, then noise.

1. **Decay ladder:** 40 ms, 150 ms, 500 ms, and 2 s through the 808 hat band around 7 kHz, to find where the sources stop sounding the same.
2. **Band ladder:** 150 ms through bands around 3 kHz and 11 kHz, to hear where the squares' partials show through.
3. **Retune squares:** the squares at 500 ms, with each bar playing the reference and then the six moved together by −12, −5, +5, and +12 semitones. Noise has nothing to retune.
4. **Cymbal:** a 2 s decay through a wider band from 3 kHz.

Plan: https://github.com/hi-ogawa/toy-midi/issues/1098`;

const project = {
  title: "Hat Lab",
  comment,
  tempo: TEMPO,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: end }, enabled: true },
  locators,
  midiTracks: tracks,
};

writeFileSync(new URL("project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
