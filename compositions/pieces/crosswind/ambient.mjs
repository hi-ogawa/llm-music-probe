// Writes ambient.json: an ambient take on Crosswind with no melody, where the
// harmony, the pad's top voice, and the layers' movement across the field carry it.
import { writeFileSync } from "node:fs";

const BAR = 4;
const at = (bar, beat = 0) => (bar - 1) * BAR + beat;

// Note names to MIDI numbers, C4 = 60.
const NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const n = (name) => {
  const [, letter, accidental, octave] = name.match(/^([A-G])(b?)(\d)$/);
  return 12 * (Number(octave) + 1) + NAMES[letter] - (accidental ? 1 : 0);
};

// Form, in bars: A over a D pedal, B with moving roots, C climbing to the peak,
// and A′ thinning back into the loop.
const A = 1;
const B = 9;
const C = 21;
const A2 = 29;
const END = 37;

// Two-bar chords in D Dorian. Each pad voicing's top note moves by step, so the
// top voice is the piece's line: E D E G, then G E F E G A, then a climb from B4
// to E5, and back down to E4 for A′.
const chord = (root, pad) => ({ root: n(root), pad: pad.map(n) });
const HOME = [
  chord("D3", ["F3", "A3", "C4", "E4"]), // Dm9
  chord("D3", ["G3", "A3", "B3", "D4"]), // Gadd9/D
  chord("D3", ["F3", "A3", "C4", "E4"]), // Dm9
  chord("D3", ["A3", "C4", "E4", "G4"]), // Am7/D
];
const CHORDS = [
  ...HOME,
  chord("F2", ["A3", "C4", "E4", "G4"]), // Fmaj9
  chord("E2", ["G3", "C4", "D4", "E4"]), // Cadd9/E
  chord("D2", ["A3", "C4", "E4", "F4"]), // Dm9
  chord("A2", ["G3", "C4", "D4", "E4"]), // Am11
  chord("G2", ["A3", "B3", "D4", "G4"]), // Gadd9
  chord("E2", ["G3", "B3", "D4", "A4"]), // Em11
  chord("F2", ["A3", "C4", "E4", "B4"]), // Fmaj7♯11
  chord("C3", ["G3", "D4", "E4", "C5"]), // Cadd9
  chord("D3", ["A3", "E4", "F4", "D5"]), // Dm9
  chord("G2", ["A3", "D4", "G4", "E5"]), // G6/9
  ...HOME,
];
const chordAt = (bar) => CHORDS[Math.floor((bar - 1) / 2)];

const lowPass = (frequency) => ({
  bypass: false,
  bands: [{ id: "low-pass", type: "low-pass", frequency, gain: 1, q: 0.7, bypass: false }],
});

// Pad: two saws detuned ±8 cents and panned ±0.7, so the beating makes it wide,
// with a low-pass taking the saws' edge off.
const padEnvelope = { attack: 1.5, decay: 1.5, sustain: 0.85, release: 2.5 };
const padSynth = {
  layers: [
    { oscillator: { waveform: "sawtooth", octave: 0, detune: -8 }, gain: 0.5, pan: -0.7, amp: { envelope: padEnvelope } },
    { oscillator: { waveform: "sawtooth", octave: 0, detune: 8 }, gain: 0.5, pan: 0.7, amp: { envelope: padEnvelope } },
  ],
};

// Arp: each note strikes left on a short saw and blooms right on a triangle.
const arpSynth = {
  layers: [
    {
      oscillator: { waveform: "sawtooth", octave: 0, detune: 0 },
      gain: 2,
      pan: -0.6,
      amp: { envelope: { attack: 0.003, decay: 0.2, sustain: 0, release: 0.15 } },
    },
    {
      oscillator: { waveform: "triangle", octave: 0, detune: 0 },
      gain: 0.7,
      pan: 0.5,
      amp: { envelope: { attack: 0.08, decay: 0.5, sustain: 0.3, release: 0.6 } },
    },
  ],
};

// Bells: the opposite motion. A short triangle an octave up pings right, and the
// sine body rings on the left.
const bellSynth = {
  layers: [
    {
      oscillator: { waveform: "sine", octave: 0, detune: 0 },
      gain: 1.6,
      pan: -0.5,
      amp: { envelope: { attack: 0.002, decay: 2.5, sustain: 0, release: 2 } },
    },
    {
      oscillator: { waveform: "triangle", octave: 1, detune: 0 },
      gain: 1.4,
      pan: 0.6,
      amp: { envelope: { attack: 0.002, decay: 0.3, sustain: 0, release: 0.25 } },
    },
  ],
};

// Drone: a sine an octave below the written note with a soft triangle, both
// centered, swelling in slowly.
const droneEnvelope = { attack: 1.2, decay: 1, sustain: 0.9, release: 2 };
const droneSynth = {
  layers: [
    { oscillator: { waveform: "sine", octave: -1, detune: 0 }, gain: 0.9, pan: 0, amp: { envelope: droneEnvelope } },
    { oscillator: { waveform: "triangle", octave: 0, detune: 0 }, gain: 0.25, pan: 0, amp: { envelope: droneEnvelope } },
  ],
};

// Pad: each chord held for its two bars.
const padNotes = [];
for (let bar = A; bar < END; bar += 2) {
  for (const pitch of chordAt(bar).pad) padNotes.push({ pitch, start: at(bar), duration: 7.9, velocity: 72 });
}

// Drone: a D pedal through A and A′, the chord roots through B and C.
const droneNotes = [];
for (let bar = A; bar < END; bar += 2) {
  droneNotes.push({ pitch: chordAt(bar).root, start: at(bar), duration: 7.9, velocity: 80 });
}

// Arp: 8ths over the pad's tones an octave up, grouped 3+3+2, through B and C, up
// another octave in C.
const ARP_ORDER = [0, 1, 2, 0, 1, 2, 3, 2];
const arpNotes = [];
for (let bar = B; bar < A2; bar++) {
  const tones = chordAt(bar).pad.map((pitch) => pitch + (bar < C ? 12 : 24));
  ARP_ORDER.forEach((index, step) => {
    const accent = step === 0 || step === 3 || step === 6;
    arpNotes.push({ pitch: tones[index], start: at(bar, step / 2), duration: 0.45, velocity: accent ? 112 : 92 });
  });
}

// Bells: two sparse hits per chord, high in the chord's tones, in A, C, and A′.
const bellNotes = [];
for (let bar = A; bar < END; bar += 2) {
  if (bar >= B && bar < C) continue;
  const [, second, third, top] = chordAt(bar).pad.map((pitch) => pitch + 12);
  const index = (bar - 1) / 2;
  bellNotes.push({ pitch: top, start: at(bar, 1.5), duration: 2, velocity: 70 });
  bellNotes.push({ pitch: index % 2 === 0 ? third : second, start: at(bar + 1, 0.5), duration: 2, velocity: 60 });
}

// Expression. The pad breathes with each chord, louder toward C; the arp swells
// in through B; everything thins toward the loop point.
const levelAt = (beat) => {
  const bar = beat / BAR + 1;
  if (bar < B) return 0.7;
  if (bar < C) return 0.7 + (0.2 * (bar - B)) / (C - B);
  if (bar < A2) return 1;
  return 1 - (0.4 * (bar - A2)) / (END - A2);
};
const padExpression = [];
for (let beat = 0; beat <= at(END); beat++) {
  const breath = 0.8 + 0.2 * Math.sin((Math.PI * (beat % 8)) / 8);
  padExpression.push({ beat, value: Math.round(127 * levelAt(beat) * breath) });
}
const arpExpression = [];
for (let beat = at(B); beat <= at(A2); beat++) {
  const swell = Math.min(1, 0.5 + (0.5 * (beat - at(B))) / (at(C) - at(B)));
  arpExpression.push({ beat, value: Math.round(110 * swell) });
}

const synthTrack = (name, synth, gain, notes, extra = {}) => ({
  name,
  program: 0,
  synth,
  gain,
  pan: 0,
  muted: false,
  soloed: false,
  keySignature: { fifths: 0, mode: "minor" },
  notes,
  ...extra,
});

const project = {
  title: "Crosswind (ambient)",
  comment: [
    "# Crosswind (ambient)",
    "",
    "An ambient take on Crosswind with no melody, demoing per-layer synth pan. D Dorian, 70 BPM, 36 bars, looping.",
    "",
    "- **Pad:** two saws detuned ±8 cents and panned ±0.7, low-passed, breathing with CC 11. Its top voice is the line.",
    "- **Arp:** 8ths that strike left on a short saw and bloom right on a triangle, through B and C.",
    "- **Bells:** sparse high hits that ping right and ring left, in A, C, and A′.",
    "- **Drone:** a sine an octave down with a soft triangle, centered.",
    "",
    "Form: A over a D pedal (1–8), B with moving roots as the arp swells in (9–20), C climbing to the peak (21–28), A′ thinning into the loop (29–36).",
  ].join("\n"),
  tempo: 70,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 1,
  loop: { range: { startBeat: 0, endBeat: at(END) }, enabled: true },
  locators: [
    { beat: at(A), label: "A" },
    { beat: at(B), label: "B" },
    { beat: at(C), label: "C" },
    { beat: at(A2), label: "A′" },
  ],
  midiTracks: [
    synthTrack("Pad", padSynth, 1.5, padNotes, {
      eq: lowPass(2000),
      automation: [{ type: "controller", controller: 11, points: padExpression }],
    }),
    synthTrack("Arp", arpSynth, 2, arpNotes, {
      eq: lowPass(5000),
      automation: [{ type: "controller", controller: 11, points: arpExpression }],
    }),
    synthTrack("Bells", bellSynth, 1.5, bellNotes),
    synthTrack("Drone", droneSynth, 0.55, droneNotes),
  ],
};

writeFileSync(new URL("./ambient.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
