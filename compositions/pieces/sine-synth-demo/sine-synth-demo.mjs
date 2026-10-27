// Writes project.json: a loop with the lead and bass on Toy MIDI's own sine synth.
import { writeFileSync } from "node:fs";

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (name) => 12 * (Number(name.slice(1)) + 1) + NOTE[name[0]];

// Fmaj9, Em7, Dm9, Cmaj9, two bars each.
const CHORDS = [
  { root: "F2", voicing: ["A3", "C4", "E4", "G4"] },
  { root: "E2", voicing: ["G3", "B3", "D4", "E4"] },
  { root: "D2", voicing: ["F3", "A3", "C4", "E4"] },
  { root: "C2", voicing: ["E3", "G3", "B3", "D4"] },
];

// [pitch, start beat, duration] over one 8-bar pass.
const LEAD = [
  ["E5", 0, 1.5], ["G5", 1.5, 0.5], ["A5", 2, 2], ["C6", 4, 1], ["A5", 5, 1], ["G5", 6, 2],
  ["B4", 8, 1.5], ["D5", 9.5, 0.5], ["E5", 10, 2], ["G5", 12, 1.5], ["E5", 13.5, 0.5], ["D5", 14, 2],
  ["F5", 16, 1.5], ["E5", 17.5, 0.5], ["D5", 18, 1], ["C5", 19, 1], ["A4", 20, 3], ["C5", 23, 1],
  ["B4", 24, 1.5], ["C5", 25.5, 0.5], ["E5", 26, 2], ["D5", 28, 4],
];

const PASSES = 2;
const PASS_BEATS = 32;
const lead = [];
const bass = [];
const keys = [];
const drums = [];
for (let pass = 0; pass < PASSES; pass++) {
  const offset = pass * PASS_BEATS;
  for (const [pitch, start, duration] of LEAD) {
    lead.push({ pitch: midi(pitch), start: offset + start, duration, velocity: 92 });
  }
  CHORDS.forEach(({ root, voicing }, i) => {
    const at = offset + i * 8;
    for (const [start, duration] of [[0, 3.5], [4, 1.5], [5.5, 0.5], [6, 2]]) {
      bass.push({ pitch: midi(root), start: at + start, duration, velocity: 100 });
    }
    for (const bar of [0, 4]) {
      for (const [start, duration, velocity] of [[0, 1.5, 62], [1.5, 2.5, 54]]) {
        for (const pitch of voicing) {
          keys.push({ pitch: midi(pitch), start: at + bar + start, duration, velocity });
        }
      }
    }
  });
  for (let beat = 0; beat < PASS_BEATS; beat += 0.5) {
    const inBar = beat % 4;
    drums.push({ pitch: 42, start: offset + beat, duration: 0.25, velocity: inBar % 1 ? 40 : 55 });
    if (inBar === 0 || inBar === 2.5) {
      drums.push({ pitch: 36, start: offset + beat, duration: 0.5, velocity: 80 });
    }
    if (inBar === 1 || inBar === 3) {
      drums.push({ pitch: 38, start: offset + beat, duration: 0.5, velocity: 60 });
    }
  }
}

const project = {
  title: "Sine Synth Demo",
  tempo: 84,
  timeSignature: { numerator: 4, denominator: 4 },
  midiTracks: [
    // Ocarina and Synth Bass 1 stand in for the sine synth in .mid export. A
    // held sine renders about 15 dB above the SoundFont parts, so the gains
    // pull the lead and bass back toward the keys.
    { name: "Sine Lead", program: 79, synth: {}, gain: 0.5, notes: lead },
    { name: "Sine Bass", program: 38, synth: {}, gain: 0.35, notes: bass },
    { name: "Keys", program: 4, notes: keys },
    { name: "Drums", bank: 128, program: 0, notes: drums },
  ],
};
writeFileSync(new URL("project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
