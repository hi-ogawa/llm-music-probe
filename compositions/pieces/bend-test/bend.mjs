// Bend test: a slow 4-bar ballad lead in A minor, with and without bends.
//
// Usage: node bend.mjs <out dir> [--reps N]
//
// The lead is written from the A minor pentatonic box at the 5th fret, on the
// G, B, and e strings, as [string, fret]. Both files share everything except the
// bends: the same picks, hammer-ons and pull-offs, and note endings. v3 drops v2's
// muted ghosts and vibrato.
// - with.json: three bends. B string 8 (G4) up a whole step to A4, G string 7 (D4)
//   up a whole step to E4, and B string 8 (G4) up a half step to G#4, the major 3rd
//   of E7. Two of them release back down without a new pick.
// - without.json: the same pitches, picked straight (A4, E4, G#4 fretted), and the
//   releases picked.
// The line is monophonic, so every note lasts until the next one, as a player's
// fretting hand moves from note to note. Notes before a rest ring their written length.
// The lead is GM 27 and the ghosts GM 28 for Toy MIDI. Renders map them to the
// Telecaster neck's Standard and Muted presets.
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const outDir = args[0];
const reps = Number(args[args.indexOf("--reps") + 1]) || 2;
const TEMPO = 76;
const ms = (x) => (x * TEMPO) / 60000;
let seed = 7;
const jit = (a) => (((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1) * a;
const OPEN = { G: 55, B: 59, e: 64 };
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (n) => {
  const [, l, acc, o] = n.match(/^([A-G])(#?)(\d)$/);
  return 12 * (Number(o) + 1) + NOTE[l] + (acc ? 1 : 0);
};

// [beat, string, fret, extra]. extra: art (h, p, b, r), bend (semitones), vel, end (ring
// length when a rest follows), vib (cents), ghost (a muted stroke on that string).
const LEAD = [
  [ // Am7
    [0, "B", 8, { art: "b", bend: 2, vel: 88 }], // G4 bent to A4
    [1.5, "B", 8, { art: "r" }], // released to G4
    [2, "B", 5, { vel: 74 }], // E4
    [2.5, "G", 7, { vel: 78 }], // D4
    [3, "G", 5, { art: "p", end: 0.75 }], // pulled off to C4
  ],
  [ // Fmaj7
    [0.5, "G", 5, { vel: 76 }], // C4
    [1, "G", 7, { art: "h" }], // hammered to D4
    [1.5, "B", 5, { vel: 72 }], // E4
    [2, "B", 8, { vel: 82 }], // G4
    [2.5, "B", 5, { art: "p", end: 1.25 }], // pulled off to E4, held
  ],
  [ // Dm7
    [0, "e", 5, { vel: 84 }], // A4
    [1, "e", 8, { vel: 78 }], // C5
    [1.5, "e", 5, { art: "p" }], // pulled off to A4
    [2, "G", 7, { art: "b", bend: 2, vel: 90 }], // D4 bent to E4, the 9th of Dm7
  ],
  [ // E7
    [0, "G", 7, { art: "r" }], // released to D4
    [0.5, "G", 5, { art: "p" }], // pulled off to C4
    [1, "B", 8, { art: "b", bend: 1, vel: 86 }], // G4 bent a half step to G#4
    [3, "B", 5, { vel: 70, end: 0.75 }], // E4
  ],
];
const CHORDS = [["A3", "C4", "E4", "G4"], ["A3", "C4", "E4", "F4"], ["A3", "C4", "D4", "F4"], ["G#3", "B3", "D4", "E4"]];
const ROOTS = [["A1", "E2"], ["F1", "C2"], ["D2", "A1"], ["E1", "B1"]];

function build(withBends) {
  const lead = [], ghosts = [], keys = [], bass = [], drums = [];
  for (let r = 0; r < reps; r++)
    for (let bar = 0; bar < 4; bar++) {
      const b0 = (r * 4 + bar) * 4;
      for (const [beat, string, fret, x] of LEAD[bar]) {
        const start = b0 + beat + ms(8 + jit(6)); // laid back, as in a ballad
        let pitch = OPEN[string] + fret;
        if (x.ghost) {
          ghosts.push({ pitch, start, duration: ms(25), velocity: Math.round(52 + jit(4)) });
          continue;
        }
        const n = { pitch, start, duration: 0, velocity: Math.round((x.vel ?? 70) + jit(4)), end: x.end };
        if (x.art === "b") {
          if (withBends) Object.assign(n, { pitch: pitch + x.bend, art: "b", bend: x.bend, bendMs: x.bend === 2 ? 140 : 100 });
          else n.pitch = pitch + x.bend; // fretted at the bent pitch
        } else if (x.art === "r") {
          if (withBends) n.art = "r", n.bendMs = 120;
        } else if (x.art) n.art = x.art;
        if (x.vib) Object.assign(n, { vib: x.vib, vibDelayMs: 280 });
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
  // each note lasts until the next one, or its ring length before a rest
  lead.forEach((n, i) => {
    const next = lead[i + 1];
    n.duration = n.end ?? (next ? next.start - n.start : 2);
    delete n.end;
    if (n.vib && n.art === "r") delete n.vib;
  });
  const track = (name, program, notes, gain, pan, extra = {}) => ({ name, program, notes, muted: false, soloed: false, gain, pan, ...extra });
  return {
    title: `Bend test v3 (${withBends ? "with bends" : "picked"})`,
    comment: "Slow 4-bar ballad lead in A minor (Am7 Fmaj7 Dm7 E7), 76 BPM, from the 5th-fret pentatonic box. Same notes with and without bends. Toy MIDI plays the notes without the bends.",
    tempo: TEMPO,
    timeSignature: { numerator: 4, denominator: 4 },
    masterGain: 0.9,
    locators: [],
    midiTracks: [
      track("Lead guitar", 27, lead, 0.8, 0.15),
      track("Lead guitar (muted)", 28, ghosts, 1.1, 0.15),
      track("Electric piano", 4, keys, 0.55, -0.2),
      track("Bass (finger)", 33, bass, 0.5, 0),
      track("Drums", 0, drums, 0.6, 0, { bank: 128 }),
    ].filter((t) => t.notes.length),
    loop: { enabled: true, range: { startBeat: 0, endBeat: 16 * reps } },
  };
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "with.json"), JSON.stringify(build(true)));
fs.writeFileSync(path.join(outDir, "without.json"), JSON.stringify(build(false)));
