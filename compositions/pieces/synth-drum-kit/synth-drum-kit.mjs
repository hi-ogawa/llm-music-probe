// Writes project.json: a drum kit built on Toy MIDI's own synth, one track per
// voice, as a baseline toward the TR-808 kit in
// https://github.com/hi-ogawa/toy-midi/issues/1098. An 8-bar electro beat
// exercises every voice, with a bass and a pad for context.
// Run with `node synth-drum-kit.mjs`.
import { writeFileSync } from "node:fs";

const TEMPO = 108;
const BAR = 4;
const STEP = 0.25;
const BARS = 8;
const SECONDS_PER_BEAT = 60 / TEMPO;
const round = (x) => Math.round(x * 10000) / 10000;
const dbToGain = (db) => 10 ** (db / 20);
const midiToHz = (pitch) => 440 * 2 ** ((pitch - 69) / 12);

const envelope = (attack, decay, sustain, release) => ({ attack, decay, sustain, release });
const unfiltered = {
  cutoff: 20000,
  resonance: 0.7,
  keytrack: 0,
  envelope: { ...envelope(0.001, 0.1, 0, 0.1), amount: 0, velocity: 0 },
};
const lowPass = (cutoff, resonance = 0.7, env = { ...envelope(0.001, 0.1, 0, 0.1), amount: 0, velocity: 0 }) =>
  ({ cutoff, resonance, keytrack: 0, envelope: env });

// Drum voices play one fixed note, and each layer sits at its own frequency
// through detune, whatever that note is.
const DRUM_NOTE = 60;
function layerAt(frequency, { waveform = "sine", gain, pan = 0, filter = unfiltered, amp }) {
  return {
    oscillator: { waveform, octave: 0, detune: round(1200 * Math.log2(frequency / midiToHz(DRUM_NOTE))) },
    gain,
    pan,
    filter,
    amp: { envelope: amp },
  };
}
const noiseLayer = ({ gain, pan = 0, filter = unfiltered, amp }) =>
  ({ oscillator: { waveform: "noise" }, gain, pan, filter, amp: { envelope: amp } });

const highPass = (frequency, q = 0.7) => ({ type: "high-pass", frequency, gain: 1, q, bypass: false });
const peak = (frequency, gainDb, q) => ({ type: "peaking", frequency, gain: dbToGain(gainDb), q, bypass: false });
const eq = (...bands) => ({ bypass: false, bands });

// [bar, step, velocity] hits on one drum note
const drumNotes = (hits, duration = 0.1) =>
  hits.map(([bar, step, velocity]) => ({ pitch: DRUM_NOTE, start: round(bar * BAR + step * STEP), duration, velocity }));
const everyBar = (bars, steps) => bars.flatMap((bar) => steps.map(([step, velocity]) => [bar, step, velocity]));
const allBars = [...Array(BARS).keys()];

// Pitch-bend drops, one per hit, decaying exponentially from `depth`
// semitones to 0. The synth applies bend without smoothing, so the points sit
// about 2 ms apart to read as a glide.
function bendDrops(hits, { depth, timeConstant }) {
  const points = [{ beat: 0, semitones: 0 }];
  const push = (beat, semitones) => {
    if (points.at(-1).beat === beat) points.pop();
    points.push({ beat, semitones });
  };
  const step = 0.004;
  for (const [bar, s] of hits) {
    const start = bar * BAR + s * STEP;
    for (let t = 0; ; t += step) {
      const semitones = depth * Math.exp(-(t * SECONDS_PER_BEAT) / timeConstant);
      if (semitones < 0.05) {
        push(round(start + t), 0);
        break;
      }
      push(round(start + t), round(semitones));
    }
  }
  return { type: "pitch-bend", points };
}

const track = (name, { gain, reverbDb, layers, notes, eq: trackEq, automation, pan }) => ({
  name,
  program: 0,
  gain,
  ...(pan !== undefined && { pan }),
  reverbSend: reverbDb === undefined ? 0 : dbToGain(reverbDb),
  keySignature: { fifths: -4, mode: "minor" },
  synth: { layers },
  ...(trackEq && { eq: trackEq }),
  notes,
  ...(automation && { automation }),
});

// --- Kick -------------------------------------------------------------------------

// A low sine that decays to silence, a sine an octave up with a shorter decay
// for the knock, and a short filtered noise click for the beater. A pitch-bend
// drop on each hit stands in for the pitch envelope the synth doesn't have.
const KICK_A = [[0, 120], [10, 112]];
const KICK_B = [[0, 120], [6, 104], [10, 112], [13, 96]];
const kickHits = allBars.flatMap((bar) =>
  (bar % 2 === 0 || bar === BARS - 1 ? KICK_A : KICK_B).map(([step, velocity]) => [bar, step, velocity]));
const kick = track("Kick", {
  gain: 0.9,
  layers: [
    layerAt(48, { gain: 0.9, amp: envelope(0.001, 0.55, 0, 0.05) }),
    layerAt(96, { gain: 0.3, amp: envelope(0.001, 0.07, 0, 0.03) }),
    noiseLayer({ gain: 0.25, filter: lowPass(3000), amp: envelope(0.0005, 0.008, 0, 0.005) }),
  ],
  notes: drumNotes(kickHits, 0.5),
  automation: [bendDrops(kickHits, { depth: 7, timeConstant: 0.012 })],
});

// --- Snare ------------------------------------------------------------------------

// Two tuned tones for the body, and noise through a low-pass whose envelope
// opens it on the hit for the snappy. Velocity scales both the level and how
// far the noise opens, so ghost notes are darker as well as quieter.
const snareHits = [
  ...everyBar(allBars, [[4, 116], [12, 118]]),
  [1, 7, 44], [3, 9, 40], [3, 15, 52], [5, 7, 44], [7, 9, 40],
];
const snare = track("Snare", {
  gain: 0.75,
  reverbDb: -20,
  layers: [
    layerAt(185, { gain: 0.45, amp: envelope(0.001, 0.12, 0, 0.04) }),
    layerAt(330, { gain: 0.3, amp: envelope(0.001, 0.07, 0, 0.03) }),
    noiseLayer({
      gain: 0.5,
      filter: lowPass(1800, 1, { ...envelope(0.001, 0.09, 0.2, 0.05), amount: 2, velocity: 0.8 }),
      amp: envelope(0.001, 0.18, 0, 0.05),
    }),
  ],
  notes: drumNotes(snareHits, 0.15),
});

// --- Clap -------------------------------------------------------------------------

// Three noise bursts about 10 ms apart, then a longer one for the tail, as the
// 808 retriggers its clap envelope. Every note shares one amp envelope, so its
// release is short and each burst stops at its quick note-off, while the tail
// note lasts long enough to decay. A resonant low-pass and a track high-pass
// leave a band around 1 kHz, and the reverb send gives it room.
const BURST = 0.01 / SECONDS_PER_BEAT;
function clap(bar, step, velocity) {
  const start = bar * BAR + step * STEP;
  return [0, 1, 2, 3].map((i) => ({
    pitch: DRUM_NOTE,
    start: round(start + i * BURST),
    duration: i === 3 ? 0.3 : round(BURST * 0.7),
    velocity: i === 3 ? velocity : Math.round(velocity * 0.85),
  }));
}
const clapNotes = [
  ...allBars.flatMap((bar) => clap(bar, 12, 110)),
  ...clap(3, 14, 84), ...clap(7, 13, 80), ...clap(7, 14, 92), ...clap(7, 15, 104),
];
const clapTrack = track("Clap", {
  gain: 0.7,
  reverbDb: -14,
  layers: [
    noiseLayer({ gain: 0.7, filter: lowPass(1500, 3), amp: envelope(0.0005, 0.25, 0, 0.004) }),
  ],
  eq: eq(highPass(600)),
  notes: clapNotes,
});

// --- Hats, the 808 way ----------------------------------------------------------------

// Six square oscillators at the inharmonic frequencies commonly cited for the
// 808's cymbal and hats. Summed, they give a metallic tone with no clear
// pitch. The synth has no bandpass or highpass per layer, so the track EQ does
// the shaping: two high-passes for a steep slope and a peak near 8 kHz.
const HAT_FREQUENCIES = [205.3, 304.4, 369.6, 522.7, 540, 800];
const metalLayers = (amp) => HAT_FREQUENCIES.map((frequency, i) =>
  layerAt(frequency, { waveform: "square", gain: 0.25, pan: (i - 2.5) * 0.06, amp }));
const hatEq = eq(highPass(5500, 0.7), highPass(5500, 0.7), peak(8000, 6, 1.2));

const HAT_STEPS = [[0, 92], [1, 52], [2, 76], [3, 50], [4, 90], [5, 54], [6, 78], [7, 50],
  [8, 92], [9, 52], [10, 76], [11, 50], [12, 90], [13, 54], [15, 60]];
const OPEN_STEP = 14;
const squareHatBars = [0, 1, 2, 3];
const noiseHatBars = [4, 5, 6, 7];

const closedHats = track("Hats Closed (808)", {
  gain: 0.7,
  reverbDb: -30,
  layers: metalLayers(envelope(0.0005, 0.045, 0, 0.02)),
  eq: hatEq,
  notes: drumNotes(everyBar(squareHatBars, HAT_STEPS), 0.05),
});
// The open hat holds while its note does and stops on note-off, so a note that
// ends at the next closed hat chokes it, as the 808's shared circuit does.
const openHats = track("Hats Open (808)", {
  gain: 0.6,
  reverbDb: -26,
  layers: metalLayers(envelope(0.0005, 0.25, 0.35, 0.06)),
  eq: hatEq,
  notes: drumNotes(everyBar(squareHatBars, [[OPEN_STEP, 96]]), STEP),
});

// --- Hats from noise ----------------------------------------------------------------------

// The same pattern from short noise bursts through the same EQ, in bars 5-8,
// to compare with the square hats in bars 1-4.
const noiseHats = track("Hats (noise)", {
  gain: 0.6,
  reverbDb: -30,
  layers: [noiseLayer({ gain: 0.3, amp: envelope(0.0005, 0.04, 0, 0.02) })],
  eq: hatEq,
  notes: drumNotes(everyBar(noiseHatBars, HAT_STEPS), 0.05),
});
const noiseOpenHats = track("Hats Open (noise)", {
  gain: 0.5,
  reverbDb: -26,
  layers: [noiseLayer({ gain: 0.3, amp: envelope(0.0005, 0.25, 0.35, 0.06) })],
  eq: hatEq,
  notes: drumNotes(everyBar(noiseHatBars, [[OPEN_STEP, 96]]), STEP),
});

// --- Cowbell ------------------------------------------------------------------------------

// Two squares about a fifth apart through a resonant low-pass, with a track
// high-pass taking out the rumble below. The 808's cowbell drops fast and then
// rings, which one ADSR can't do, so each square plays twice: a loud copy with
// a short decay and a quiet one with a long decay.
const COWBELL_FREQUENCIES = [540, 800];
const cowbellFilter = lowPass(2400, 2.5);
const cowbell = track("Cowbell", {
  gain: 0.45,
  reverbDb: -24,
  layers: COWBELL_FREQUENCIES.flatMap((frequency) => [
    layerAt(frequency, { waveform: "square", gain: 0.3, filter: cowbellFilter, amp: envelope(0.0005, 0.05, 0, 0.03) }),
    layerAt(frequency, { waveform: "square", gain: 0.1, filter: cowbellFilter, amp: envelope(0.0005, 0.35, 0, 0.05) }),
  ]),
  eq: eq(highPass(350)),
  notes: drumNotes(everyBar([4, 5, 6, 7], [[0, 104], [3, 84], [6, 100], [10, 88], [13, 96]]), 0.1),
});

// --- Toms --------------------------------------------------------------------------------

// Tuned sines with fast decays, three pitches on one track, each with a small
// bend drop. Notes play the tuned pitch directly, so here the note matters.
const TOMS = { low: 41, mid: 46, high: 51 }; // F2, Bb2, Eb3
const tomHits = [
  [3, 12, TOMS.high, 104], [3, 13, TOMS.high, 92], [3, 14, TOMS.mid, 108], [3, 15, TOMS.low, 116],
  [7, 10, TOMS.high, 100], [7, 11, TOMS.high, 92], [7, 12, TOMS.mid, 104], [7, 13, TOMS.mid, 96],
  [7, 14, TOMS.low, 112], [7, 15, TOMS.low, 120],
];
const toms = track("Toms", {
  gain: 0.7,
  reverbDb: -20,
  layers: [
    { oscillator: { waveform: "sine", octave: 0, detune: 0 }, gain: 0.8, pan: 0, filter: unfiltered,
      amp: { envelope: envelope(0.001, 0.3, 0, 0.05) } },
    noiseLayer({ gain: 0.08, filter: lowPass(2500), amp: envelope(0.0005, 0.02, 0, 0.01) }),
  ],
  notes: tomHits.map(([bar, step, pitch, velocity]) => ({ pitch, start: round(bar * BAR + step * STEP), duration: 0.2, velocity })),
  automation: [bendDrops(tomHits, { depth: 2, timeConstant: 0.03 })],
});

// --- Rim shot ---------------------------------------------------------------------------

// Two very short tones, high and low, with a track high-pass so only the
// click and ring stay.
const rim = track("Rim", {
  gain: 0.5,
  reverbDb: -24,
  layers: [
    layerAt(1700, { waveform: "triangle", gain: 0.5, amp: envelope(0.0005, 0.02, 0, 0.01) }),
    layerAt(480, { waveform: "square", gain: 0.25, filter: lowPass(3000), amp: envelope(0.0005, 0.012, 0, 0.01) }),
  ],
  eq: eq(highPass(300)),
  notes: drumNotes(everyBar(allBars, [[3, 70], [11, 64]]), 0.05),
});

// --- Bass and pad, for context -----------------------------------------------------------

// Fm | Fm | Db | Eb, twice
const ROOTS = [29, 29, 37, 39];
const BASS_STEPS = [[0, 0, 112, 3], [3, 12, 88, 1], [6, 0, 104, 2], [10, 7, 96, 1], [12, 10, 92, 2], [14, 12, 100, 1]];
const bassNotes = allBars.flatMap((bar) => BASS_STEPS.map(([step, offset, velocity, length]) => ({
  pitch: ROOTS[bar % 4] + offset,
  start: round(bar * BAR + step * STEP),
  duration: round(length * STEP * 0.85),
  velocity,
})));
const bassFilter = { cutoff: 260, resonance: 2, keytrack: 0.5, envelope: { ...envelope(0.002, 0.2, 0.3, 0.08), amount: 2.2, velocity: 0.6 } };
const bass = track("Bass", {
  gain: 0.7,
  layers: [
    { oscillator: { waveform: "sawtooth", octave: 0, detune: 0 }, gain: 0.35, pan: 0, filter: bassFilter,
      amp: { envelope: envelope(0.002, 0.3, 0.8, 0.06) } },
    { oscillator: { waveform: "square", octave: -1, detune: 0 }, gain: 0.2, pan: 0, filter: bassFilter,
      amp: { envelope: envelope(0.002, 0.3, 0.8, 0.06) } },
  ],
  notes: bassNotes,
});

const PAD_CHORDS = [
  [53, 56, 60, 63, 67], // Fm9
  [53, 56, 60, 63, 67],
  [49, 53, 56, 60, 63], // Dbmaj9
  [51, 55, 58, 60, 65], // Eb6/9
];
const padFilter = { cutoff: 380, resonance: 1.4, keytrack: 0.5, envelope: { ...envelope(1.5, 3, 0.8, 1.2), amount: 2.5, velocity: 0 } };
const padAmp = { envelope: envelope(0.08, 0.5, 0.85, 1.0) };
const pad = track("Pad", {
  gain: 0.4,
  reverbDb: -10,
  layers: [
    { oscillator: { waveform: "sawtooth", octave: 0, detune: -9 }, gain: 0.2, pan: -0.45, filter: padFilter, amp: padAmp },
    { oscillator: { waveform: "sawtooth", octave: 0, detune: 9 }, gain: 0.2, pan: 0.45, filter: padFilter, amp: padAmp },
  ],
  notes: allBars.flatMap((bar) => PAD_CHORDS[bar % 4].map((pitch) => ({ pitch, start: bar * BAR, duration: 3.9, velocity: 80 }))),
});

// --- Project ------------------------------------------------------------------------------

const comment = `# Synth Drum Kit

A drum kit built on Toy MIDI's own synth, with one track per voice and no SoundFont drums. It's a testbed, a baseline to iterate on toward the TR-808 kit in toy-midi#1098. An 8-bar electro beat in F minor at 108 BPM exercises every voice, with a bass and a pad for context. Solo a track to hear one voice.

- **Kick:** a 48 Hz sine decaying over 0.55 s, a sine an octave up for the knock, and a noise click. A pitch-bend drop of 7 semitones on each hit stands in for a pitch envelope.
- **Snare:** tones at 185 and 330 Hz, and noise through a low-pass that opens on the hit.
- **Clap:** three noise bursts 10 ms apart and a tail, through a resonant low-pass and a track high-pass.
- **Hats (808), bars 1-4:** six squares at 205, 304, 370, 523, 540, and 800 Hz through a steep track high-pass and a peak near 8 kHz. Open hats are choked by their note ending.
- **Hats (noise), bars 5-8:** the same pattern from noise through the same EQ, for comparison.
- **Cowbell, bars 5-8:** squares at 540 and 800 Hz, each played twice, short and long, for a fast drop and a ringing tail.
- **Toms:** tuned sines with a small bend drop, in the fills of bars 4 and 8.
- **Rim:** two very short tones through a track high-pass.`;

const project = {
  title: "Synth Drum Kit",
  comment,
  tempo: TEMPO,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: BARS * BAR }, enabled: true },
  locators: [{ beat: 0, label: "808 hats" }, { beat: 16, label: "Noise hats, cowbell" }],
  midiTracks: [kick, snare, clapTrack, closedHats, openHats, noiseHats, noiseOpenHats, cowbell, toms, rim, bass, pad],
};

writeFileSync(new URL("project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
