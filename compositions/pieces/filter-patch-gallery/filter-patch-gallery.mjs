// Writes project.json: a gallery of synth filter patches, one track per
// patch, each playing a 4-bar pattern in its own part of the timeline over a
// shared drum track. Plan: https://github.com/hi-ogawa/toy-midi/issues/1093
// Run with `node filter-patch-gallery.mjs`.
import { writeFileSync } from "node:fs";

const BAR = 4;
const PART = 4 * BAR;
const round = (x) => Math.round(x * 10000) / 10000;
const clamp = (x) => Math.max(0, Math.min(127, Math.round(x)));
const smoothstep = (t) => t * t * (3 - 2 * t);

const envelope = (attack, decay, sustain, release) => ({ attack, decay, sustain, release });
const openFilter = {
  cutoff: 20000,
  resonance: 0.7,
  keytrack: 0,
  envelope: { ...envelope(0.001, 0.1, 0, 0.1), amount: 0, velocity: 0 },
};
const layer = ({ waveform, octave = 0, detune = 0, gain, pan = 0, filter = openFilter, amp }) => ({
  oscillator: { waveform, octave, detune },
  gain,
  pan,
  filter,
  amp: { envelope: amp },
});
const synthTrack = (name, gain, layers, notes, automation) => ({
  name,
  program: 0,
  gain,
  keySignature: { fifths: 1, mode: "minor" },
  synth: { layers },
  notes: notes.map((n) => ({ ...n, start: round(n.start), duration: round(n.duration) })),
  ...(automation && { automation }),
});

// [step, pitch, velocity, length in 16ths], one bar
function stepNotes(pattern, barStart, gate = 0.8) {
  return pattern.map(([step, pitch, velocity, length = 1]) => ({
    pitch,
    start: barStart + step * 0.25,
    duration: length * 0.25 * gate,
    velocity,
  }));
}
const chordNotes = (pitches, start, duration, velocity) =>
  pitches.map((pitch) => ({ pitch, start, duration, velocity }));

// Samples `curve(beat)` every `step` beats over [start, end), keeping only
// changes. Values hold until the next point, so fine steps read as a sweep.
function sampleController(curve, start, end, step) {
  const points = [];
  for (let beat = start; beat < end; beat += step) {
    const value = clamp(curve(beat));
    if (points.length === 0 || points.at(-1).value !== value) points.push({ beat: round(beat), value });
  }
  return points;
}

const parts = [];
const part = (label) => {
  const start = parts.length * PART;
  parts.push({ label, start });
  return start;
};

// --- 1 and 2. Envelope filter bass, up and down ---------------------------------

// A funk line over Em7 | A7, with a wide velocity spread so the filter's
// velocity depth plays the dynamics.
const FUNK_EM = [[0, 28, 122, 2], [3, 40, 64], [4, 38, 88], [6, 40, 118], [7, 43, 72], [8, 28, 108, 2],
  [10, 31, 80], [11, 33, 96], [12, 35, 104], [14, 38, 120], [15, 40, 70]];
const FUNK_A7 = [[0, 33, 122, 2], [3, 45, 64], [4, 43, 88], [6, 45, 120], [7, 40, 72], [8, 33, 108, 2],
  [10, 37, 82], [11, 38, 96], [12, 40, 102], [13, 43, 76], [14, 42, 118], [15, 39, 90]];
const funkLine = (start) => [FUNK_EM, FUNK_A7, FUNK_EM, FUNK_A7].flatMap((p, bar) => stepNotes(p, start + bar * BAR));

const funkBassAmp = envelope(0.003, 0.4, 0.7, 0.08);
const subLayer = (amp) => layer({ waveform: "sine", octave: -1, gain: 0.22, amp });

const envUpStart = part("1 Env filter bass up");
const envUp = synthTrack("Env Filter Bass Up", 0.8, [
  layer({
    waveform: "sawtooth",
    gain: 0.45,
    amp: funkBassAmp,
    filter: {
      cutoff: 180,
      resonance: 6,
      keytrack: 0.5,
      envelope: { ...envelope(0.01, 0.35, 0.15, 0.1), amount: 4.5, velocity: 1 },
    },
  }),
  subLayer(funkBassAmp),
], funkLine(envUpStart));

// The same line with the cutoff set high and the envelope pulling it down, so
// each note dives dark and opens again through the decay.
const envDownStart = part("2 Env filter bass down");
const envDown = synthTrack("Env Filter Bass Down", 0.8, [
  layer({
    waveform: "sawtooth",
    gain: 0.45,
    amp: funkBassAmp,
    filter: {
      cutoff: 3500,
      resonance: 6,
      keytrack: 0.3,
      envelope: { ...envelope(0.005, 0.3, 0.35, 0.1), amount: -4.5, velocity: 1 },
    },
  }),
  subLayer(funkBassAmp),
], funkLine(envDownStart));

// --- 3. Moog-style bass ----------------------------------------------------------

const MOOG_BARS = [
  [[0, 28, 104, 3], [3, 28, 84], [4, 40, 96, 2], [6, 28, 90, 2], [8, 31, 100, 3], [11, 33, 86], [12, 35, 98, 4]], // Em
  [[0, 36, 104, 3], [3, 36, 84], [4, 48, 96, 2], [6, 36, 90, 2], [8, 43, 100, 2], [10, 40, 88, 2], [12, 36, 98, 4]], // C
  [[0, 38, 104, 3], [3, 38, 84], [4, 50, 96, 2], [6, 38, 90, 2], [8, 45, 100, 3], [11, 42, 86], [12, 38, 98, 4]], // D
  [[0, 35, 104, 3], [3, 35, 84], [4, 47, 96, 2], [6, 35, 90, 2], [8, 39, 100, 2], [10, 42, 92, 2], [12, 45, 96, 2], [14, 39, 100, 2]], // B7
];
const moogStart = part("3 Moog bass");
const moogAmp = envelope(0.003, 0.5, 0.8, 0.1);
const moogFilter = {
  cutoff: 220,
  resonance: 1.2,
  keytrack: 0.6,
  envelope: { ...envelope(0.005, 0.25, 0.3, 0.1), amount: 2.5, velocity: 0.5 },
};
const moog = synthTrack("Moog Bass", 0.8, [
  layer({ waveform: "sawtooth", gain: 0.4, amp: moogAmp, filter: moogFilter }),
  layer({ waveform: "square", octave: -1, gain: 0.25, amp: moogAmp, filter: moogFilter }),
], MOOG_BARS.flatMap((p, bar) => stepNotes(p, moogStart + bar * BAR, 0.92)));

// --- 4. Brass ------------------------------------------------------------------

// Held chords open into the "bwah" over the filter attack, while short hits end
// before the filter gets there, so they stay darker.
const brassStart = part("4 Brass");
const EM7 = [52, 55, 59, 62, 64], CMAJ7 = [48, 55, 59, 64, 67], AM7 = [57, 60, 64, 67], D6 = [54, 57, 62, 66, 69];
const brassNotes = [
  ...chordNotes(EM7, 0, 1.4, 112), ...chordNotes(EM7, 1.75, 0.2, 84), ...chordNotes(EM7, 2.5, 1.3, 120),
  ...chordNotes(CMAJ7, 4, 2.8, 104), ...chordNotes(CMAJ7, 7.5, 0.2, 92),
  ...chordNotes(AM7, 8, 1.4, 116), ...chordNotes(AM7, 9.75, 0.2, 80), ...chordNotes(D6, 10.5, 1.3, 110),
  ...chordNotes(EM7, 12, 0.2, 96), ...chordNotes(EM7, 12.5, 0.2, 88), ...chordNotes(EM7, 13, 2.8, 126),
].map((n) => ({ ...n, start: brassStart + n.start }));
const brassAmp = envelope(0.02, 0.3, 0.9, 0.25);
const brassFilter = {
  cutoff: 400,
  resonance: 1.5,
  keytrack: 0.6,
  envelope: { ...envelope(0.12, 0.6, 0.5, 0.3), amount: 3, velocity: 0.9 },
};
const brass = synthTrack("Brass", 0.6, [
  layer({ waveform: "sawtooth", detune: -6, gain: 0.2, pan: -0.3, amp: brassAmp, filter: brassFilter }),
  layer({ waveform: "sawtooth", detune: 6, gain: 0.2, pan: 0.3, amp: brassAmp, filter: brassFilter }),
], brassNotes);

// --- 5. Pluck arp --------------------------------------------------------------

// Two octaves up and back per bar, accented 3+3+2+3+3+2, so keytrack keeps the
// top as bright as the bottom.
const ARP_CHORDS = [[52, 55, 59, 62, 66], [48, 52, 55, 59, 62], [45, 48, 52, 55, 59], [47, 52, 54, 57, 59]];
const ACCENT_STEPS = new Set([0, 3, 6, 8, 11, 14]);
const pluckStart = part("5 Pluck arp");
const pluckNotes = ARP_CHORDS.flatMap((chord, bar) => {
  const up = [...chord, ...chord.map((p) => p + 12)]; // 10 notes
  const sequence = [...up, ...up.slice(1, 7).reverse()]; // 16 steps, up and partly back
  return sequence.map((pitch, step) => ({
    pitch,
    start: pluckStart + bar * BAR + step * 0.25,
    duration: 0.2,
    velocity: ACCENT_STEPS.has(step) ? 118 : 72 + ((step * 5) % 11),
  }));
});
const pluck = synthTrack("Pluck Arp", 0.6, [
  layer({
    waveform: "sawtooth",
    gain: 0.35,
    amp: envelope(0.001, 0.35, 0.2, 0.15),
    filter: {
      cutoff: 300,
      resonance: 3,
      keytrack: 1,
      envelope: { ...envelope(0.001, 0.18, 0, 0.1), amount: 4, velocity: 0.6 },
    },
  }),
], pluckNotes);

// --- 6. Wah comp ---------------------------------------------------------------

// Rootless Em9 and A9 scratched in 16ths. The filter envelope is off, and CC74
// is the foot on the pedal.
const EM9 = [55, 59, 62, 66], A9 = [55, 59, 61, 64];
const COMP_BAR = [[0, 112], [1, 48], [2, 96], [3, 48], [5, 50], [6, 118], [7, 52], [8, 100], [9, 46],
  [10, 92], [11, 50], [13, 48], [14, 116], [15, 54]];
const wahStart = part("6 Wah comp");
const wahNotes = [EM9, A9, EM9].flatMap((chord, bar) =>
  COMP_BAR.flatMap(([step, velocity]) =>
    chordNotes(chord, wahStart + bar * BAR + step * 0.25, velocity > 80 ? 0.16 : 0.08, velocity)),
);
// The last bar holds A9 under a slow sweep from heel to toe.
wahNotes.push(...chordNotes(A9, wahStart + 3 * BAR, 0.16, 114), ...chordNotes(A9, wahStart + 3 * BAR + 0.5, 3.3, 108));

function wahPedal(beat) {
  const t = beat - wahStart;
  if (t < 0) return 64;
  // Rocking once per 8th, heel on the 8th and toe on the 16th after it
  if (t < 3 * BAR) return 66 - 46 * Math.cos(2 * Math.PI * t * 2);
  if (t < 3 * BAR + 0.5) return 20;
  return 20 + 100 * smoothstep(Math.min(1, (t - 3 * BAR - 0.5) / 3));
}
const wahFilter = {
  cutoff: 700,
  resonance: 7,
  keytrack: 0,
  envelope: { ...envelope(0.001, 0.1, 0, 0.1), amount: 0, velocity: 0 },
};
const wahAmp = envelope(0.002, 0.15, 0.6, 0.06);
const wah = synthTrack("Wah Comp", 0.55, [
  layer({ waveform: "sawtooth", detune: -5, gain: 0.18, pan: -0.25, amp: wahAmp, filter: wahFilter }),
  layer({ waveform: "square", detune: 5, gain: 0.12, pan: 0.25, amp: wahAmp, filter: wahFilter }),
], wahNotes, [{
  type: "controller",
  controller: 74,
  points: [{ beat: 0, value: 64 }, ...sampleController(wahPedal, wahStart, wahStart + PART, 0.0625)],
}]);

// --- 7. Swell pad and darkening pad ----------------------------------------------

const padAmp = envelope(0.05, 0.5, 0.9, 1.4);
const padLayers = (filter) => [
  layer({ waveform: "sawtooth", detune: -8, gain: 0.17, pan: -0.45, amp: padAmp, filter }),
  layer({ waveform: "sawtooth", detune: 8, gain: 0.17, pan: 0.45, amp: padAmp, filter }),
];

const swellStart = part("7a Swell pad");
const swell = synthTrack("Swell Pad", 0.55, padLayers({
  cutoff: 250,
  resonance: 2,
  keytrack: 0.4,
  envelope: { ...envelope(2.5, 1, 0.8, 1.5), amount: 3.5, velocity: 0 },
}), [
  ...chordNotes([52, 55, 59, 62, 66], swellStart, 7.8, 90), // Em9
  ...chordNotes([48, 55, 59, 62, 64], swellStart + 8, 7.8, 90), // Cmaj9
]);

// Starts open and closes over the attack. Its release lets the envelope fall
// back toward 0, so each tail brightens again as it fades.
const darkenStart = part("7b Darkening pad");
const darken = synthTrack("Darkening Pad", 0.55, padLayers({
  cutoff: 4000,
  resonance: 2,
  keytrack: 0.4,
  envelope: { ...envelope(2.5, 1, 0.8, 1.5), amount: -3.5, velocity: 0 },
}), [
  ...chordNotes([57, 60, 64, 67, 71], darkenStart, 7.8, 90), // Am9
  ...chordNotes([59, 64, 66, 69, 73], darkenStart + 8, 7.8, 90), // B7sus4 with the 9th
]);

// --- 8. Acid line ----------------------------------------------------------------

const ACID_BARS = [
  [[0, 28, 122], [1, 28, 76], [2, 40, 80], [4, 28, 120], [5, 31, 78], [6, 40, 122], [7, 28, 74],
   [9, 28, 80], [10, 43, 78], [11, 40, 120], [12, 28, 76, 2], [14, 38, 122], [15, 40, 78]],
  [[0, 28, 122], [2, 40, 78], [3, 28, 76], [4, 35, 120], [6, 28, 80], [7, 40, 76], [8, 52, 124],
   [9, 40, 78], [10, 28, 74], [11, 31, 120], [12, 28, 78], [13, 40, 76], [14, 35, 122], [15, 38, 80]],
];
const acidStart = part("8 Acid line");
const acid = synthTrack("Acid Line", 0.7, [
  layer({
    waveform: "sawtooth",
    gain: 0.5,
    amp: envelope(0.002, 0.3, 0.6, 0.05),
    filter: {
      cutoff: 700,
      resonance: 9,
      keytrack: 1,
      envelope: { ...envelope(0.002, 0.16, 0, 0.08), amount: 4, velocity: 1 },
    },
  }),
], [0, 1, 0, 1].flatMap((i, bar) => stepNotes(ACID_BARS[i], acidStart + bar * BAR, 0.76)), [{
  type: "controller",
  controller: 71,
  // Up to 112 over three bars and back by the last beat, so the loop wraps at 64
  points: sampleController((beat) => {
    const t = (beat - acidStart) / BAR;
    if (t < 0) return 64;
    if (t < 3) return 64 + 48 * smoothstep(t / 3);
    return 112 - 48 * smoothstep(Math.min(1, (t - 3) / 0.75));
  }, 0, acidStart + PART, 0.25),
}]);

// --- Drums (TR-808 kit) ----------------------------------------------------------

const KICK = 36, RIM = 37, SNARE = 38, CLAP = 39, CLOSED_HAT = 42, OPEN_HAT = 46, CRASH = 49, RIDE = 51, SHAKER = 70;
const drumNotes = [];
const hit = (pitch, start, velocity, duration = 0.2) => drumNotes.push({ pitch, start: round(start), duration, velocity });

const DRUM_STYLES = {
  // Syncopated kick, backbeat, ghost snares, and accented 16th hats
  funk(b) {
    for (const [beat, v] of [[0, 120], [0.75, 92], [2.5, 112], [3.25, 88]]) hit(KICK, b + beat, v);
    hit(SNARE, b + 1, 118);
    hit(SNARE, b + 3, 120);
    for (const [beat, v] of [[1.75, 42], [2.25, 38], [3.75, 44]]) hit(SNARE, b + beat, v);
    for (let s = 0; s < 16; s++) hit(s === 14 ? OPEN_HAT : CLOSED_HAT, b + s * 0.25, s % 2 === 0 ? 86 : 50);
  },
  // Straight 8ths with a backbeat
  rock(b) {
    for (const beat of [0, 2, 2.5]) hit(KICK, b + beat, 116);
    hit(SNARE, b + 1, 116);
    hit(SNARE, b + 3, 118);
    for (let s = 0; s < 8; s++) hit(CLOSED_HAT, b + s * 0.5, s % 2 === 0 ? 88 : 62);
  },
  // Four on the floor with offbeat open hats and a clap
  house(b) {
    for (let beat = 0; beat < 4; beat++) {
      hit(KICK, b + beat, 116);
      hit(OPEN_HAT, b + beat + 0.5, 84);
      hit(CLOSED_HAT, b + beat + 0.25, 48);
      hit(CLOSED_HAT, b + beat + 0.75, 56);
    }
    hit(CLAP, b + 1, 104);
    hit(CLAP, b + 3, 106);
  },
  // Kick and ride only, so the pads stay in front
  sparse(b) {
    hit(KICK, b, 96);
    hit(KICK, b + 2.5, 80);
    for (let beat = 0; beat < 4; beat += 0.5) hit(beat % 1 === 0 ? RIDE : SHAKER, b + beat, beat % 1 === 0 ? 56 : 40);
    hit(RIM, b + 3, 58);
  },
};
const PART_STYLES = ["funk", "funk", "rock", "rock", "house", "funk", "sparse", "sparse", "house"];

parts.forEach(({ start }, index) => {
  hit(CRASH, start, 72, 1);
  for (let bar = 0; bar < 4; bar++) DRUM_STYLES[PART_STYLES[index]](start + bar * BAR);
});
drumNotes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
const drums = { name: "Drums", program: 25, bank: 128, gain: 0.8, notes: drumNotes };

// --- Project ---------------------------------------------------------------------

const end = parts.length * PART;
const comment = `# Filter Patch Gallery

A gallery of patches for Toy MIDI's synth filter, in E minor at 110 BPM. Each track is one patch playing a 4-bar pattern in its own part of the timeline, named by a locator, over a shared TR-808 drum track. Loop a part to hear one patch alone. Plan: https://github.com/hi-ogawa/toy-midi/issues/1093

1. **Env Filter Bass Up:** a resonant low-pass (Q 6) whose envelope sweeps 4.5 octaves up at full velocity depth, on a funk line with a wide velocity spread. An envelope filter pedal, like a Mu-Tron.
2. **Env Filter Bass Down:** the same line with the cutoff at 3.5 kHz and the envelope pulling it 4.5 octaves down, so each note dives dark and opens through the decay, like a wah pedal rocked from heel to toe.
3. **Moog Bass:** saw with a square an octave down, low cutoff, low resonance, and a moderate envelope. Round instead of squelchy.
4. **Brass:** two detuned saws with a 120 ms filter attack. Held chords open into a "bwah", while short hits end before the filter gets there.
5. **Pluck Arp:** short filter decay to sustain 0 with keytrack 1 on a two-octave arpeggio, so the top stays as bright as the bottom. Accents sweep deeper.
6. **Wah Comp:** a resonant patch with the filter envelope off. CC74 rocks heel to toe on every 8th, then sweeps open slowly under a held chord.
7. **Swell Pad and Darkening Pad:** the same pad with a 2.5 s filter attack, positive and then negative. The darkening pad's tails brighten again as they release.
8. **Acid Line:** Q 9, short decay, deep velocity, and keytrack, with CC71 pushing the resonance up and back.

CC74 and CC71 follow toy-midi#1017's rule that 64 plays the patch as written. How far they move the filter isn't documented.`;

const project = {
  title: "Filter Patch Gallery",
  comment,
  tempo: 110,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: end }, enabled: true },
  locators: parts.map(({ label, start }) => ({ beat: start, label })),
  midiTracks: [envUp, envDown, moog, brass, pluck, wah, swell, darken, acid, drums],
};

writeFileSync(new URL("project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
