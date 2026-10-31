// Writes project.json: a synthwave ballad in D minor demoing per-layer synth pan.
import { writeFileSync } from "node:fs";

const BAR = 4;
const at = (bar, beat = 0) => (bar - 1) * BAR + beat;

// Note names to MIDI numbers, C4 = 60.
const NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const n = (name) => {
  const [, letter, accidental, octave] = name.match(/^([A-G])(b?)(\d)$/);
  return 12 * (Number(octave) + 1) + NAMES[letter] - (accidental ? 1 : 0);
};

// Form, in bars: intro, verse, chorus, a break with the pad alone, the final
// chorus, and an outro.
const INTRO = 1;
const VERSE = 5;
const CHORUS = 13;
const BREAK = 21;
const FINAL = 25;
const OUTRO = 33;
const END = 37;

// One chord per bar.
const CHORDS = {
  Dm: { root: n("D3"), pad: ["D3", "F3", "A3", "D4"], arp: ["D4", "F4", "A4", "D5"] },
  Bb: { root: n("Bb2"), pad: ["D3", "F3", "Bb3", "D4"], arp: ["Bb3", "D4", "F4", "Bb4"] },
  F: { root: n("F3"), pad: ["C3", "F3", "A3", "C4"], arp: ["C4", "F4", "A4", "C5"] },
  C: { root: n("C3"), pad: ["C3", "E3", "G3", "C4"], arp: ["C4", "E4", "G4", "C5"] },
};
const VERSE_CHORDS = ["Dm", "Bb", "F", "C"];
const CHORUS_CHORDS = ["Bb", "C", "F", "Dm", "Bb", "C", "Dm", "Dm"];
const progression = [
  ...VERSE_CHORDS, // intro
  ...VERSE_CHORDS,
  ...VERSE_CHORDS, // verse
  ...CHORUS_CHORDS, // chorus
  "Bb",
  "C",
  "Dm",
  "Dm", // break
  ...CHORUS_CHORDS, // final chorus
  "Dm",
  "Bb",
  "F",
  "Dm", // outro
];
const chordAt = (bar) => CHORDS[progression[bar - 1]];

// Lead: two saws detuned and panned slightly apart, so the lead is thick but stays
// near the center.
const leadEnvelope = { attack: 0.03, decay: 0.5, sustain: 0.75, release: 0.35 };
const leadSynth = {
  layers: [
    { oscillator: { waveform: "sawtooth", octave: 0, detune: -6 }, gain: 0.6, pan: -0.2, amp: { envelope: leadEnvelope } },
    { oscillator: { waveform: "sawtooth", octave: 0, detune: 6 }, gain: 0.6, pan: 0.2, amp: { envelope: leadEnvelope } },
  ],
};

// Arp: each note strikes left on a short saw and blooms right on a triangle.
const arpSynth = {
  layers: [
    {
      oscillator: { waveform: "sawtooth", octave: 0, detune: 0 },
      gain: 2,
      pan: -0.6,
      amp: { envelope: { attack: 0.003, decay: 0.15, sustain: 0, release: 0.1 } },
    },
    {
      oscillator: { waveform: "triangle", octave: 0, detune: 0 },
      gain: 1.1,
      pan: 0.4,
      amp: { envelope: { attack: 0.06, decay: 0.3, sustain: 0.4, release: 0.25 } },
    },
  ],
};

// Pad: two saws detuned ±8 cents and panned ±0.7, so the beating makes it wide.
const padEnvelope = { attack: 0.8, decay: 1, sustain: 0.8, release: 1.5 };
const padSynth = {
  layers: [
    { oscillator: { waveform: "sawtooth", octave: 0, detune: -8 }, gain: 0.5, pan: -0.7, amp: { envelope: padEnvelope } },
    { oscillator: { waveform: "sawtooth", octave: 0, detune: 8 }, gain: 0.5, pan: 0.7, amp: { envelope: padEnvelope } },
  ],
};

// Bass: a sine an octave below the written note under a quiet saw, both centered.
const bassSynth = {
  layers: [
    {
      oscillator: { waveform: "sine", octave: -1, detune: 0 },
      gain: 0.9,
      pan: 0,
      amp: { envelope: { attack: 0.005, decay: 0.3, sustain: 0.7, release: 0.1 } },
    },
    {
      oscillator: { waveform: "sawtooth", octave: 0, detune: 0 },
      gain: 0.12,
      pan: 0,
      amp: { envelope: { attack: 0.005, decay: 0.2, sustain: 0.3, release: 0.08 } },
    },
  ],
};

// Melody as [bar offset, beat, note, beats].
// Verse: low and stepwise, a four-bar question ending open on E, then an answer
// that reaches D5 and settles toward the chorus.
const verse = [
  [0, 0, "A4", 2],
  [0, 2, "G4", 1],
  [0, 3, "A4", 1],
  [1, 0, "F4", 3],
  [1, 3, "D4", 1],
  [2, 0, "C5", 2],
  [2, 2, "A4", 1],
  [2, 3, "G4", 1],
  [3, 0, "E4", 4],
  [4, 0, "A4", 2],
  [4, 2, "G4", 1],
  [4, 3, "A4", 1],
  [5, 0, "D5", 3],
  [5, 3, "C5", 1],
  [6, 0, "A4", 1.5],
  [6, 1.5, "G4", 0.5],
  [6, 2, "F4", 2],
  [7, 0, "G4", 2],
  [7, 2, "E4", 2],
];
// Chorus: an octave up and soaring. The first half climbs to A5 and comes home to
// D5; the second climbs past it to C6 before falling to D5.
const chorus = [
  [0, 0, "D5", 1],
  [0, 1, "F5", 1],
  [0, 2, "G5", 2],
  [1, 0, "G5", 1],
  [1, 1, "A5", 1],
  [1, 2, "G5", 1],
  [1, 3, "E5", 1],
  [2, 0, "F5", 3],
  [2, 3, "C5", 1],
  [3, 0, "D5", 4],
  [4, 0, "D5", 1],
  [4, 1, "F5", 1],
  [4, 2, "G5", 2],
  [5, 0, "G5", 1],
  [5, 1, "A5", 1],
  [5, 2, "C6", 2],
  [6, 0, "A5", 2],
  [6, 2, "G5", 1],
  [6, 3, "F5", 1],
  [7, 0, "E5", 1],
  [7, 1, "D5", 3],
];

// Diatonic thirds below in D natural minor, for the final chorus's harmony.
const MINOR_PCS = [2, 4, 5, 7, 9, 10, 0];
const SCALE = [];
for (let pitch = 36; pitch <= 96; pitch++) if (MINOR_PCS.includes(pitch % 12)) SCALE.push(pitch);
const thirdBelow = (pitch) => SCALE[SCALE.indexOf(pitch) - 2];

const leadNotes = [];
const playMelody = (startBar, melody, { velocity, octaveBelow = false, harmony = false }) => {
  for (const [barOffset, beat, name, beats] of melody) {
    const pitch = n(name);
    const start = at(startBar + barOffset, beat);
    const duration = beats - 0.05;
    // Downbeats lean on the beat; the rest sit a little under.
    const accent = beat === 0 ? 8 : 0;
    leadNotes.push({ pitch, start, duration, velocity: velocity + accent });
    if (octaveBelow) leadNotes.push({ pitch: pitch - 12, start, duration, velocity: velocity - 14 });
    if (harmony) leadNotes.push({ pitch: thirdBelow(pitch), start, duration, velocity: velocity - 18 });
  }
};
playMelody(VERSE, verse, { velocity: 74 });
playMelody(CHORUS, chorus, { velocity: 84, octaveBelow: true });
playMelody(FINAL, chorus, { velocity: 88, octaveBelow: true, harmony: true });

// Arp: straight 8ths up and down the chord, everywhere but the break.
const ARP_ORDER = [0, 1, 2, 3, 2, 1, 2, 1];
const arpNotes = [];
for (let bar = INTRO; bar < END; bar++) {
  if (bar >= BREAK && bar < FINAL) continue;
  const tones = chordAt(bar).arp.map(n);
  ARP_ORDER.forEach((index, step) => {
    arpNotes.push({ pitch: tones[index], start: at(bar, step / 2), duration: 0.4, velocity: step % 2 === 0 ? 96 : 80 });
  });
}

// Pad: a held chord every bar, softer in the intro and verse.
const padNotes = [];
for (let bar = INTRO; bar < END; bar++) {
  const velocity = bar < CHORUS ? 60 : 72;
  for (const name of chordAt(bar).pad) {
    padNotes.push({ pitch: n(name), start: at(bar), duration: 3.95, velocity });
  }
}

// Bass: driving 8ths on the root from the verse, with an octave jump closing each
// chorus bar.
const bassNotes = [];
for (let bar = VERSE; bar < OUTRO; bar++) {
  if (bar >= BREAK && bar < FINAL) continue;
  const root = chordAt(bar).root;
  const inChorus = bar >= CHORUS;
  for (let step = 0; step < 8; step++) {
    const pitch = inChorus && step === 7 ? root + 12 : root;
    bassNotes.push({ pitch, start: at(bar, step / 2), duration: 0.4, velocity: step % 2 === 0 ? 84 : 70 });
  }
}
// The outro holds the roots.
for (let bar = OUTRO; bar < END; bar++) {
  bassNotes.push({ pitch: chordAt(bar).root, start: at(bar), duration: 3.9, velocity: 70 });
}

// Drums on GeneralUser GS's Electronic kit: hats in the intro's second half, a
// half-time verse, the full beat with a crash into each chorus, out for the break,
// and a last crash on the outro's downbeat.
const KICK = 36;
const SNARE = 38;
const CLOSED_HAT = 42;
const CRASH = 49;
const drumNotes = [];
const hit = (bar, beat, pitch, velocity) => drumNotes.push({ pitch, start: at(bar, beat), duration: 0.25, velocity });
for (let bar = INTRO; bar < OUTRO; bar++) {
  if (bar >= BREAK && bar < FINAL) continue;
  const inChorus = bar >= CHORUS;
  if (bar >= INTRO + 2) {
    for (let eighth = 0; eighth < 8; eighth++) hit(bar, eighth / 2, CLOSED_HAT, eighth % 2 === 0 ? 64 : 48);
  }
  if (bar < VERSE) continue;
  hit(bar, 0, KICK, 96);
  if (inChorus) {
    hit(bar, 1, SNARE, 96);
    hit(bar, 2, KICK, 90);
    hit(bar, 2.5, KICK, 72);
    hit(bar, 3, SNARE, 100);
  } else {
    hit(bar, 2, SNARE, 86);
  }
}
for (const bar of [CHORUS, FINAL, OUTRO]) hit(bar, 0, CRASH, 90);
hit(OUTRO, 0, KICK, 96);
// A snare fill into each chorus.
for (const bar of [CHORUS - 1, FINAL - 1]) {
  for (const beat of [3, 3.25, 3.5, 3.75]) hit(bar, beat, SNARE, 70 + beat * 6);
}

// Pad and arp expression: steady, then a fade over the outro.
const fade = [{ beat: 0, value: 100 }];
for (let beat = at(OUTRO); beat <= at(END); beat += 1) {
  fade.push({ beat, value: Math.round(100 * (1 - (beat - at(OUTRO)) / (at(END) - at(OUTRO)))) });
}

const synthTrack = (name, synth, gain, notes, extra = {}) => ({
  name,
  program: 0,
  synth,
  gain,
  pan: 0,
  muted: false,
  soloed: false,
  keySignature: { fifths: -1, mode: "minor" },
  notes,
  ...extra,
});

const project = {
  title: "Crosswind",
  comment: [
    "# Crosswind",
    "",
    "A synthwave ballad demoing per-layer synth pan. D minor, 86 BPM, 36 bars.",
    "",
    "- **Lead:** two saws detuned ±6 cents and panned ±0.2, doubled an octave down in the choruses.",
    "- **Arp:** 8th notes that strike left on a short saw and bloom right on a triangle.",
    "- **Pad:** two saws detuned ±8 cents and panned ±0.7.",
    "- **Bass:** a sine an octave down under a quiet saw, both centered.",
    "",
    "Form: intro (1–4), verse (5–12), chorus (13–20), break with the pad alone (21–24), final chorus with a harmony (25–32), outro fading with CC 11 (33–36).",
  ].join("\n"),
  tempo: 86,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 1,
  loop: { range: { startBeat: 0, endBeat: at(END) }, enabled: true },
  locators: [
    { beat: at(INTRO), label: "Intro" },
    { beat: at(VERSE), label: "Verse" },
    { beat: at(CHORUS), label: "Chorus" },
    { beat: at(BREAK), label: "Break" },
    { beat: at(FINAL), label: "Final chorus" },
    { beat: at(OUTRO), label: "Outro" },
  ],
  midiTracks: [
    synthTrack("Lead", leadSynth, 1.5, leadNotes),
    synthTrack("Arp", arpSynth, 2, arpNotes, {
      automation: [{ type: "controller", controller: 11, points: fade }],
    }),
    synthTrack("Pad", padSynth, 1.3, padNotes, {
      automation: [{ type: "controller", controller: 11, points: fade }],
    }),
    synthTrack("Bass", bassSynth, 1.1, bassNotes),
    {
      name: "Drums",
      program: 24,
      bank: 128,
      gain: 1.6,
      pan: 0,
      muted: false,
      soloed: false,
      keySignature: { fifths: -1, mode: "minor" },
      notes: drumNotes,
    },
  ],
};

writeFileSync(new URL("./project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
