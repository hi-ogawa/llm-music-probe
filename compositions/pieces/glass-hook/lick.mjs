// A Polyphia-style clean lick over a half-time trap groove in E minor, 90 BPM.
//
// Usage: node lick.mjs <out project.json> [--reps N]
//
// The lead is a melodic hook, written from the fretboard as [string, fret]:
// - Bars 1 and 3: a string-skipping arpeggio on G-B-e (hybrid picking), notes ringing
//   across strings, rising into a designed bend: B string 15 (D5) bent a whole step
//   to E5, released, and pulled off.
// - Bars 2 and 4: three-notes-per-string legato runs in sextuplets (one pick, two
//   pull-offs or hammer-ons per string), landing on chord tones. Bar 4 peaks on
//   e string 12 (E5) bent to F#5, the 5th of Bm7.
// Notes on different strings ring until that string plays again. Pitch bend is
// channel-wide, so any legato or bent note cuts the other ringing strings first,
// the way a player mutes them while bending.
// Toy MIDI plays GM 27 and ignores the articulations. Renders map the lead
// to a FlameStudios Telecaster font. v2 drops v1's muted ghosts.
import fs from "node:fs";

const args = process.argv.slice(2);
const output = args[0];
const reps = Number(args[args.indexOf("--reps") + 1]) || 2;
const TEMPO = 90;
const ms = (x) => (x * TEMPO) / 60000;
let seed = 11;
const jit = (a) => (((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1) * a;
const OPEN = { D: 50, G: 55, B: 59, e: 64 };
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (n) => {
  const [, l, acc, o] = n.match(/^([A-G])(#?)(\d)$/);
  return 12 * (Number(o) + 1) + NOTE[l] + (acc ? 1 : 0);
};

// [position in 16ths, string, fret, extra]. Sextuplets sit on 2/3-16th steps.
// extra: art (h, p, b, r), bend, vel.
const S = (beat, i) => beat * 4 + (i * 4) / 6; // i-th sextuplet of a beat
const ARP_C = [["G", 9], ["B", 8], ["e", 7], ["B", 8], ["G", 9], ["B", 8], ["e", 7]]; // E4 G4 B4 over Cmaj7
const ARP_E = [["G", 9], ["B", 7], ["e", 7], ["B", 7], ["G", 9], ["B", 7], ["e", 7]]; // E4 F#4 B4 over Em9
const hook = (arp) => [
  ...arp.map(([s, f], i) => [i, s, f, { vel: i % 4 === 0 ? 88 : 76 }]),
  [7, "e", 10, { vel: 84 }], // D5
  [8, "B", 15, { art: "b", bend: 2, vel: 92 }], // D5 bent to E5
  [10, "B", 15, { art: "r" }], // released to D5
  [11, "B", 12, { art: "p" }], // pulled off to B4
  [12, "G", 14, { vel: 80 }], // A4
  [13, "G", 12, { art: "p" }], // G4
  [14, "G", 11, { art: "p" }], // F#4
];
const LEAD = [
  hook(ARP_C), // Cmaj7
  [ // D6: a descending 3-notes-per-string run, then a short answer
    [S(0, 0), "e", 10, { vel: 90 }], [S(0, 1), "e", 8, { art: "p" }], [S(0, 2), "e", 7, { art: "p" }], // D5 C5 B4
    [S(0, 3), "B", 10, { vel: 82 }], [S(0, 4), "B", 8, { art: "p" }], [S(0, 5), "B", 7, { art: "p" }], // A4 G4 F#4
    [4, "G", 9, { vel: 80 }], [5, "G", 7, { art: "p" }], // E4 D4
    [6, "B", 7, { vel: 84 }], // F#4, rings
    [8, "B", 10, { vel: 86 }], [9, "B", 12, { art: "h" }], [10, "B", 10, { art: "p" }], // A4 B4 A4
    [12, "e", 10, { vel: 84 }], // D5, rings
    [15, "B", 8, { vel: 78 }], // G4 pickup
  ],
  hook(ARP_E), // Em9
  [ // Bm7: an ascending legato run into the peak bend
    [S(0, 0), "G", 11, { vel: 88 }], [S(0, 1), "G", 14, { art: "h" }], // F#4 A4
    [S(0, 2), "B", 12, { vel: 80 }], [S(0, 3), "B", 15, { art: "h" }], // B4 D5
    [S(0, 4), "e", 12, { vel: 84 }], [S(0, 5), "e", 14, { art: "h" }], // E5 F#5
    [4, "e", 12, { art: "b", bend: 2, vel: 94 }], // E5 bent to F#5
    [6, "e", 12, { art: "r" }], // released to E5
    [7, "e", 10, { art: "p" }], // D5
    [8, "B", 12, { vel: 84 }], // B4, rings
    [12, "G", 14, { vel: 80 }], [13, "G", 11, { art: "p" }], // A4 F#4
  ],
];
const PAD = [["C3", "G3", "B3", "E4"], ["D3", "A3", "B3", "F#4"], ["E3", "B3", "D4", "F#4"], ["B2", "F#3", "A3", "D4"]];
const ROOT = ["C2", "D2", "E2", "B1"];

const lead = [], pad = [], bass = [], drums = [];
for (let r = 0; r < reps; r++)
  for (let bar = 0; bar < 4; bar++) {
    const b0 = (r * 4 + bar) * 4;
    for (const [pos, string, fret, x] of LEAD[bar]) {
      const start = Math.max(0, b0 + pos / 4 + ms(jit(3))); // Toy MIDI skips notes before beat 0
      const pitch = OPEN[string] + fret;
      const n = { pitch: x.art === "b" ? pitch + x.bend : pitch, start, duration: 0, velocity: Math.round((x.vel ?? 70) + jit(3)), string };
      if (x.art) n.art = x.art;
      if (x.art === "b") Object.assign(n, { bend: x.bend, bendMs: 90 });
      if (x.art === "r") n.bendMs = 70;
      lead.push(n);
    }
    PAD[bar].forEach((name) => pad.push({ pitch: midi(name), start: b0, duration: 3.95, velocity: 50 }));
    // sub bass: root on 1, a push on the "a" of 2, root on 3
    [[0, 1.5], [1.75, 0.25], [2.5, 1.4]].forEach(([t, d]) => bass.push({ pitch: midi(ROOT[bar]), start: b0 + t, duration: d, velocity: 96 }));
    // half-time trap groove: kick 1 and the "and" of 2, clap on 3, 16th hats with 32nd rolls
    [0, 6, 11].forEach((s) => drums.push({ pitch: 36, start: b0 + s / 4, duration: 0.2, velocity: 104 }));
    drums.push({ pitch: 39, start: b0 + 2, duration: 0.2, velocity: 100 }, { pitch: 38, start: b0 + 2, duration: 0.2, velocity: 70 });
    for (let s = 0; s < 16; s++) {
      const roll = bar % 2 === 1 && s >= 12 ? 2 : 1;
      for (let k = 0; k < roll; k++)
        drums.push({ pitch: 42, start: b0 + s / 4 + k / 8, duration: 0.1, velocity: Math.round((s % 2 ? 50 : 70) - k * 10 + jit(5)) });
    }
  }

// Each note rings until its string plays again, or until any legato or bent note,
// which needs the other strings quiet. Legato notes themselves extend the picked note.
lead.forEach((n, i) => {
  let end = n.start + 2;
  for (const m of lead.slice(i + 1)) {
    if (m.string === n.string || m.art) {
      end = m.start;
      break;
    }
  }
  n.duration = end - n.start;
});
lead.forEach((n) => delete n.string);

const track = (name, program, notes, gain, pan, extra = {}) => ({ name, program, notes, muted: false, soloed: false, gain, pan, ...extra });
fs.writeFileSync(
  output,
  JSON.stringify({
    title: "Glass Hook v2 (clean lick test)",
    comment: "A Polyphia-style clean guitar hook over a half-time trap groove in E minor, 90 BPM: string-skipping arpeggios, sextuplet legato runs, and designed bends on the hook's peaks. Cmaj7 D6 Em9 Bm7. Toy MIDI plays the notes without the bends.",
    tempo: TEMPO,
    timeSignature: { numerator: 4, denominator: 4 },
    masterGain: 0.9,
    locators: [],
    midiTracks: [
      track("Lead guitar", 27, lead, 0.8, 0.1),
      track("Pad", 89, pad, 0.35, -0.1),
      track("Sub bass", 38, bass, 0.7, 0),
      track("Drums", 0, drums, 0.7, 0, { bank: 128 }),
    ],
    loop: { enabled: true, range: { startBeat: 0, endBeat: 16 * reps } },
  }),
);
console.log({ lead: lead.length });
