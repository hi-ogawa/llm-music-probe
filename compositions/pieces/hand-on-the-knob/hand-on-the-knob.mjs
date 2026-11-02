// Writes project.json: an acid house loop in A minor, 124 BPM, 16 bars,
// demoing the synth filter (toy-midi#1081) and CC74/CC71 (toy-midi#1085).
// Run with `node hand-on-the-knob.mjs`.
import { writeFileSync } from "node:fs";

const BAR = 4;
const STEP = 0.25;
const round = (x) => Math.round(x * 1000) / 1000;
const clamp = (x) => Math.max(0, Math.min(127, Math.round(x)));
const smoothstep = (t) => t * t * (3 - 2 * t);

// Harmony, one chord per bar, repeating every 4 bars: Am | Am | F | G
const ROOTS = [33, 33, 29, 31]; // A1 A1 F1 G1
const chordOfBar = (bar) => bar % 4;

// --- Acid bass ---------------------------------------------------------------

// [step, semitones above the bar's root, accent, length in steps]
// Octave (+12) and two-octave (+24) jumps show keytrack.
const BASS_PATTERNS = [
  // Am, first bar
  [[0, 0, 1, 1], [1, 0, 0, 1], [2, 12, 0, 1], [4, 0, 1, 1], [5, 3, 0, 1], [6, 12, 1, 1], [7, 0, 0, 1],
   [9, 0, 0, 1], [10, 15, 0, 1], [11, 12, 1, 1], [12, 0, 0, 2], [14, 10, 1, 1], [15, 12, 0, 1]],
  // Am, second bar
  [[0, 0, 1, 1], [2, 12, 0, 1], [3, 0, 0, 1], [4, 7, 1, 1], [6, 0, 0, 1], [7, 12, 0, 1], [8, 24, 1, 1],
   [9, 12, 0, 1], [10, 0, 0, 1], [11, 3, 1, 1], [12, 0, 0, 1], [13, 12, 0, 1], [14, 7, 1, 1], [15, 10, 0, 1]],
  // F
  [[0, 0, 1, 1], [1, 0, 0, 1], [2, 12, 0, 1], [4, 0, 1, 1], [5, 7, 0, 1], [6, 12, 1, 1], [7, 0, 0, 1],
   [9, 0, 0, 1], [10, 16, 0, 1], [11, 12, 1, 1], [12, 0, 0, 2], [14, 7, 1, 1], [15, 12, 0, 1]],
  // G, leading back to A
  [[0, 0, 1, 1], [2, 12, 0, 1], [3, 0, 0, 1], [4, 7, 1, 1], [6, 0, 0, 1], [7, 12, 0, 1], [8, 24, 1, 1],
   [9, 12, 0, 1], [10, 9, 0, 1], [11, 12, 1, 1], [12, 0, 0, 1], [13, 7, 0, 1], [14, 12, 1, 1], [15, 14, 0, 1]],
];

// Bars 13-16 add accents on the off-16ths that are otherwise plain, so the
// peak squelches harder.
const PEAK_EXTRA_ACCENTS = new Set([7, 13]);

const bassNotes = [];
for (let bar = 0; bar < 16; bar++) {
  const chord = chordOfBar(bar);
  for (const [step, offset, accent, length] of BASS_PATTERNS[chord]) {
    const accented = accent || (bar >= 12 && PEAK_EXTRA_ACCENTS.has(step));
    // Small deterministic variation so plain notes aren't all identical
    const humanize = ((bar * 7 + step * 5) % 9) - 4;
    bassNotes.push({
      pitch: ROOTS[chord] + offset,
      start: round(bar * BAR + step * STEP),
      duration: round(length * STEP - 0.06),
      velocity: accented ? 120 + (humanize % 4) : 78 + humanize,
    });
  }
}

// CC74 (cutoff) like a hand on a knob, sampled every 16th note.
function bassCutoff(beat) {
  if (beat < 12) return 30;
  if (beat < 16) return 30 + 6 * smoothstep((beat - 12) / 4);
  if (beat < 32) {
    // Opens over bars 5-8, backing off a little twice on the way up
    const t = (beat - 16) / 16;
    return 36 + 64 * smoothstep(t) + 6 * Math.sin(2 * Math.PI * t * 2) * (1 - t);
  }
  if (beat < 48) return 100 + 6 * Math.sin((2 * Math.PI * (beat - 32)) / 8);
  if (beat < 52) return 100 + 20 * smoothstep((beat - 48) / 4);
  if (beat < 56) return 120 + 3 * Math.sin((2 * Math.PI * (beat - 52)) / 2);
  if (beat < 62) return 120 - 90 * smoothstep((beat - 56) / 6);
  return 30;
}

// CC71 (resonance), neutral at 64, pushed in bars 9-14.
function resonanceCurve(peak) {
  return (beat) => {
    if (beat < 32) return 64;
    if (beat < 48) {
      const t = (beat - 32) / 16;
      return 64 + (peak - 4 - 64) * smoothstep(t) + 3 * Math.sin(2 * Math.PI * t * 4) * t;
    }
    if (beat < 56) return peak;
    if (beat < 62) return peak - (peak - 64) * smoothstep((beat - 56) / 6);
    return 64;
  };
}

function controllerAutomation(controller, curve) {
  const points = [];
  for (let beat = 0; beat <= 64; beat += STEP) {
    const value = clamp(curve(beat));
    if (points.length === 0 || points.at(-1).value !== value) {
      points.push({ beat: round(beat), value });
    }
  }
  return { type: "controller", controller, points };
}

const acidBass = {
  name: "Acid Bass",
  program: 0,
  gain: 0.75,
  keySignature: { fifths: 0, mode: "minor" },
  synth: {
    layers: [
      {
        oscillator: { waveform: "sawtooth" },
        gain: 0.55,
        filter: {
          cutoff: 700,
          resonance: 9,
          keytrack: 1,
          envelope: { attack: 0.002, decay: 0.16, sustain: 0, release: 0.08, amount: 4, velocity: 1 },
        },
        amp: { envelope: { attack: 0.002, decay: 0.3, sustain: 0.6, release: 0.05 } },
      },
    ],
  },
  notes: bassNotes,
  automation: [controllerAutomation(74, bassCutoff), controllerAutomation(71, resonanceCurve(110))],
};

// --- Pad ---------------------------------------------------------------------

const PAD_CHORDS = [
  [57, 60, 64, 67, 71], // Am9
  [57, 60, 64, 67, 71], // Am9, struck again so it brightens again
  [53, 57, 60, 64, 67], // Fmaj9
  [55, 59, 62, 64, 69], // G6/9
];

const padNotes = [];
for (let bar = 4; bar < 16; bar++) {
  for (const pitch of PAD_CHORDS[chordOfBar(bar)]) {
    padNotes.push({ pitch, start: bar * BAR, duration: 3.9, velocity: 84 });
  }
}

// The amp opens almost at once, so the pad is there and dark from the
// downbeat. The filter envelope's 1.7 s attack, about a bar at 124 BPM, does
// the brightening. The long decay lets the peak settle slowly instead of
// snapping back down.
const padFilter = {
  cutoff: 320,
  resonance: 1.6,
  keytrack: 0.5,
  envelope: { attack: 1.7, decay: 2.5, sustain: 0.75, release: 1.2, amount: 3.5, velocity: 0 },
};
const padAmp = { envelope: { attack: 0.06, decay: 0.5, sustain: 0.85, release: 1.0 } };
const unfiltered = {
  cutoff: 20000,
  resonance: 0.7,
  keytrack: 0,
  envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1, amount: 0, velocity: 0 },
};
const sheenAmp = { envelope: { attack: 0.13, decay: 0.3, sustain: 1, release: 1.0 } };

const pad = {
  name: "Pad",
  program: 0,
  gain: 0.5,
  keySignature: { fifths: 0, mode: "minor" },
  synth: {
    layers: [
      { oscillator: { waveform: "sawtooth", detune: -9 }, gain: 0.25, pan: -0.45, filter: padFilter, amp: padAmp },
      { oscillator: { waveform: "sawtooth", detune: 9 }, gain: 0.25, pan: 0.45, filter: padFilter, amp: padAmp },
      // Air that brightens with the saws. Noise has no pitch, so its cutoff
      // doesn't follow the note.
      {
        oscillator: { waveform: "noise" },
        gain: 0.1,
        filter: { ...padFilter, keytrack: 0 },
        amp: { envelope: { attack: 0.005, decay: 0.3, sustain: 1, release: 1.0 } },
      },
      // Sheen an octave up, outside the filter, so the top stays present while
      // the saws are still dark
      { oscillator: { waveform: "sine", octave: 1, detune: -8 }, gain: 0.16, pan: -1, filter: unfiltered, amp: sheenAmp },
      { oscillator: { waveform: "sine", octave: 1, detune: 8 }, gain: 0.16, pan: 1, filter: unfiltered, amp: sheenAmp },
    ],
  },
  notes: padNotes,
};

// --- Stab --------------------------------------------------------------------

const STAB_CHORDS = [
  [57, 60, 64, 67], // Am7
  [57, 60, 64, 67],
  [53, 57, 60, 64], // Fmaj7
  [55, 59, 62, 64], // G6
];

// [beat in bar, velocity]
const STAB_RHYTHMS = {
  x: [[0.5, 104], [1.75, 96], [2.5, 118], [3.5, 100]],
  y: [[0.5, 104], [1.5, 96], [2.25, 90], [3.0, 120], [3.75, 100]],
  peak: [[0.5, 112], [1.0, 88], [1.75, 102], [2.5, 124], [3.25, 98], [3.75, 114]],
};

const stabNotes = [];
for (let bar = 8; bar < 16; bar++) {
  const rhythm = bar >= 12 && bar < 15 ? STAB_RHYTHMS.peak : bar % 2 === 0 ? STAB_RHYTHMS.x : STAB_RHYTHMS.y;
  for (const [beat, velocity] of rhythm) {
    for (const pitch of STAB_CHORDS[chordOfBar(bar)]) {
      stabNotes.push({ pitch, start: bar * BAR + beat, duration: 0.22, velocity });
    }
  }
}

const stabAmp = { envelope: { attack: 0.002, decay: 0.35, sustain: 0, release: 0.15 } };

const stab = {
  name: "Stab",
  program: 0,
  gain: 0.55,
  keySignature: { fifths: 0, mode: "minor" },
  synth: {
    layers: [
      // Resonant swept top: a fast, deep filter envelope that velocity scales
      {
        oscillator: { waveform: "sawtooth", detune: 7 },
        gain: 0.22,
        pan: 0.2,
        filter: {
          cutoff: 500,
          resonance: 8,
          keytrack: 0.5,
          envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.1, amount: 4.5, velocity: 0.7 },
        },
        amp: stabAmp,
      },
      // Body: a square under a fixed, gentle low-pass with no envelope
      {
        oscillator: { waveform: "square", detune: -7 },
        gain: 0.1,
        pan: -0.2,
        filter: {
          cutoff: 1400,
          resonance: 0.7,
          keytrack: 0,
          envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1, amount: 0, velocity: 0 },
        },
        amp: stabAmp,
      },
      // Unfiltered sub, an octave down: the cutoff sits at the top of the
      // audible range and nothing moves it
      {
        oscillator: { waveform: "sine", octave: -1 },
        gain: 0.16,
        filter: {
          cutoff: 20000,
          resonance: 0.7,
          keytrack: 0,
          envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1, amount: 0, velocity: 0 },
        },
        amp: stabAmp,
      },
    ],
  },
  notes: stabNotes,
  automation: [controllerAutomation(71, resonanceCurve(104))],
};

// --- Drums (TR-808 kit) ------------------------------------------------------

const KICK = 36, RIM = 37, CLAP = 39, CLOSED_HAT = 42, OPEN_HAT = 46, CRASH = 49, RIDE = 51, TAMBOURINE = 54;

const drumNotes = [];
const hit = (pitch, start, velocity, duration = 0.2) =>
  drumNotes.push({ pitch, start: round(start), duration, velocity });

for (let bar = 0; bar < 16; bar++) {
  const b = bar * BAR;
  for (let beat = 0; beat < 4; beat++) hit(KICK, b + beat, beat === 0 ? 122 : 114);

  for (let step = 0; step < 16; step++) {
    const t = b + step * STEP;
    const position = step % 4; // 0 on the beat, 2 the offbeat 8th
    if (bar < 8) {
      hit(CLOSED_HAT, t, [64, 48, 92, 54][position]);
    } else if (position === 2) {
      hit(OPEN_HAT, t, 96, 0.22);
    } else if (position !== 0) {
      hit(CLOSED_HAT, t, position === 1 ? 52 : 66);
    }
  }

  if (bar >= 4) {
    hit(CLAP, b + 1, 104);
    hit(CLAP, b + 3, 108);
  }
  if (bar >= 8) {
    // Rim on a 3+3+2 feel across the bar
    for (const [beat, velocity] of [[0.75, 70], [1.5, 60], [2.25, 74], [3.25, 62]]) hit(RIM, b + beat, velocity);
  }
  if (bar >= 12) {
    for (let beat = 0; beat < 4; beat += 0.5) hit(RIDE, b + beat, beat % 1 === 0 ? 58 : 46);
    hit(TAMBOURINE, b + 1, 72);
    hit(TAMBOURINE, b + 3, 76);
  }
}
hit(CRASH, 8 * BAR, 100, 1);
hit(CRASH, 12 * BAR, 112, 1);
// Clap fills into the groove (bar 8) and into the loop wrap (bar 16)
for (const [beat, velocity] of [[3.25, 70], [3.5, 82], [3.75, 94]]) hit(CLAP, 7 * BAR + beat, velocity);
for (const [beat, velocity] of [[3.25, 64], [3.375, 72], [3.5, 80], [3.625, 88], [3.75, 98], [3.875, 108]]) {
  hit(CLAP, 15 * BAR + beat, velocity);
}
drumNotes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);

const drums = { name: "Drums", program: 25, bank: 128, gain: 0.85, notes: drumNotes };

// --- Project -----------------------------------------------------------------

const comment = `# Hand on the Knob

Acid house loop in A minor, 124 BPM, 16 bars, looped. A demo for the synth filter: a resonant low-pass with its own envelope on each layer, steered by CC74 (cutoff) and CC71 (resonance).

- **Bars 1-4, Closed:** the acid bass with CC74 at 30, kick and hats.
- **Bars 5-8, Opening:** CC74 opens the bass like a hand on a knob. The pad enters and brightens over each chord.
- **Bars 9-12, Groove:** open hats, rim, and the layered stab. CC71 pushes the resonance on the bass and the stab's top.
- **Bars 13-16, Peak:** extra bass accents and a denser stab, then CC74 and CC71 return to their bar-1 values so the loop joins.

Filter features by part:

- **Acid Bass:** sawtooth, Q 9, 0.16 s filter-envelope decay, 4-octave amount at full velocity depth, so accented notes (velocity about 120) sweep deeper than plain ones (about 78). Keytrack 1 makes the octave and two-octave jumps brighter.
- **Pad:** two detuned saws. The amp opens in 60 ms, and the brightening is the filter envelope's 1.7 s attack, settling over a 2.5 s decay. A quiet noise layer under the same filter envelope adds air, and two sines an octave up, outside the filter, add a stereo sheen.
- **Stab:** a resonant swept saw on top, a square under a fixed gentle low-pass, and an unfiltered sine sub an octave down.

The docs don't say how far CC74 and CC71 move a synth track's filter. This piece assumes 64 leaves the patch as written, with CC74 moving the cutoff by up to about 4 octaves either way and CC71 scaling the resonance up to about 4x either way.`;

const project = {
  title: "Hand on the Knob",
  comment,
  tempo: 124,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: 64 }, enabled: true },
  locators: [
    { beat: 0, label: "Closed" },
    { beat: 16, label: "Opening" },
    { beat: 32, label: "Groove" },
    { beat: 48, label: "Peak" },
  ],
  midiTracks: [acidBass, pad, stab, drums],
};

writeFileSync(new URL("project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
