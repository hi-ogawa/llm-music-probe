// Bend test v1: a slow 4-bar ballad lead in A minor, with and without bends.
// Written as pitches over chords, not from the fretboard (see the README).
//
// Usage: node bend-v1.mjs <out dir> [--reps N]
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const outDir = args[0];
const reps = Number(args[args.indexOf("--reps") + 1]) || 2;
const TEMPO = 76;
const ms = (x) => (x * TEMPO) / 60000;
let seed = 7;
const jit = (a) => (((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1) * a;
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (n) => {
  const [, l, acc, o] = n.match(/^([A-G])(#?)(\d)$/);
  return 12 * (Number(o) + 1) + NOTE[l] + (acc ? 1 : 0);
};

// [beat in bar, pitch, beats, art]. b: bent up a whole step to this pitch. r: released to this pitch.
const LEAD = [
  [[0, "C5", 1], [1, "A4", 0.5], [1.5, "C5", 0.5], [2, "E5", 2, "b"]], // Am7: D5 bent to E5
  [[0, "D5", 1, "r"], [1, "C5", 0.5], [1.5, "A4", 1.5], [3, "G4", 0.5], [3.5, "A4", 0.5]], // Fmaj7
  [[0, "A4", 0.5], [0.5, "C5", 0.5], [1, "D5", 1], [2, "A4", 2, "b"]], // Dm7: G4 bent to A4
  [[0, "B4", 2, "b"], [2, "A4", 1, "r"], [3, "G#4", 1]], // E7: A4 bent to B4, released, then G#4
];
const CHORDS = [["A3", "C4", "E4", "G4"], ["A3", "C4", "E4", "F4"], ["A3", "C4", "D4", "F4"], ["G#3", "B3", "D4", "E4"]];
const ROOTS = [["A1", "E2"], ["F1", "C2"], ["D2", "A1"], ["E1", "B1"]];

function build(withBends) {
  const lead = [], keys = [], bass = [], drums = [];
  for (let r = 0; r < reps; r++)
    for (let bar = 0; bar < 4; bar++) {
      const b0 = (r * 4 + bar) * 4;
      for (const [beat, name, len, art] of LEAD[bar]) {
        const n = { pitch: midi(name), start: b0 + beat + ms(jit(6)), duration: len, velocity: Math.round((beat % 1 ? 76 : 86) + jit(4)) };
        if (withBends && art) Object.assign(n, { art, bendMs: art === "b" ? 140 : 110 });
        lead.push(n);
      }
      CHORDS[bar].forEach((name, i) => keys.push({ pitch: midi(name), start: b0 + i * ms(8), duration: 3.9, velocity: 58 }));
      ROOTS[bar].forEach((name, i) => bass.push({ pitch: midi(name), start: b0 + i * 2 + ms(jit(4)), duration: 1.9, velocity: 88 }));
      for (let s = 0; s < 8; s++) {
        drums.push({ pitch: 42, start: b0 + s / 2 + ms(jit(4)), duration: 0.2, velocity: Math.round((s % 2 ? 40 : 56) + jit(5)) });
        if (s === 0 || s === 5) drums.push({ pitch: 36, start: b0 + s / 2, duration: 0.3, velocity: 92 });
        if (s === 2 || s === 6) drums.push({ pitch: 37, start: b0 + s / 2, duration: 0.3, velocity: 78 });
      }
    }
  const track = (name, program, notes, gain, pan, extra = {}) => ({ name, program, notes, muted: false, soloed: false, gain, pan, ...extra });
  return {
    title: `Bend test v1 (${withBends ? "with bends" : "picked"})`,
    comment: "Slow 4-bar ballad lead in A minor (Am7 Fmaj7 Dm7 E7), 76 BPM. Same pitches with and without whole-step bends and releases. Toy MIDI plays the notes without the bends.",
    tempo: TEMPO,
    timeSignature: { numerator: 4, denominator: 4 },
    masterGain: 0.9,
    locators: [],
    midiTracks: [
      track("Lead guitar", 27, lead, 0.8, 0.15),
      track("Electric piano", 4, keys, 0.55, -0.2),
      track("Bass (finger)", 33, bass, 0.5, 0),
      track("Drums", 0, drums, 0.6, 0, { bank: 128 }),
    ],
    loop: { enabled: true, range: { startBeat: 0, endBeat: 16 * reps } },
  };
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "with.json"), JSON.stringify(build(true)));
fs.writeFileSync(path.join(outDir, "without.json"), JSON.stringify(build(false)));
