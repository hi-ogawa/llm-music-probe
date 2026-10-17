// Two interlocking guitars over an E dorian vamp (Em9 | A13), written from the fretboard.
//
// Usage: node loop.mjs <out project.json> [--fsbs] [--reps N] [--lead A|B|C]
//
// - Left: cutting chords on the top three strings at the 7th fret. Em9 is 7-7-7 on
//   G-B-e (D F# B) and A13 drops the G string to fret 6 (C# F# B), the one-finger
//   move. Grids use X for an open accent, x for a muted chk, and . for an air stroke.
//   An accent on the last 16th anticipates the next bar's chord.
// - Right: a single-note 16th line on the A, D, and G strings with dead notes (x),
//   filling the gaps in the cutting part.
// - Finger bass and drums on GeneralUser for context.
//
// --lead picks the lead articulation test, all with a natural release:
//   A picked, B with hammer-ons and pull-offs (`art`), C with B plus vibrato on
//   held notes and a quarter-tone curl (`vib`, `curl`). The renderer turns these
//   into pitch bend. P and D move the dead notes to their own muted channel:
//   P is picked, and D phrases the articulation (see ARTS_D). H is D with
//   hammer-ons and pull-offs only, no bend or vibrato (see ARTS_H).
//   M resets to the cutting idea: the hand keeps moving in 16ths, and every 16th
//   is either a fretted note (choked like a cutting accent) or a muted ghost on
//   its own channel. Rests become ghosts, and there's no legato or bending.
//   HM is M plus H's hammer-ons and pull-offs.

import fs from "node:fs";

const args = process.argv.slice(2);
const output = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--reps");
const fsbs = args.includes("--fsbs");
const reps = Number(args[args.indexOf("--reps") + 1]) || 1;
const lead = args.includes("--lead") ? args[args.indexOf("--lead") + 1] : undefined;
const TEMPO = 104;
const ms = (x) => (x * TEMPO) / 60000; // milliseconds to beats

let seed = 5;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const jit = (amount) => (rnd() * 2 - 1) * amount;
const clampVel = (v) => Math.max(1, Math.min(127, Math.round(v)));

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (name) => {
  const [, l, acc, oct] = name.match(/^([A-G])(#?)(\d)$/);
  return 12 * (Number(oct) + 1) + NOTE[l] + (acc ? 1 : 0);
};

// --- left: cutting ---

const GRIPS = {
  Em9: { top: [62, 66, 71], under: 57 }, // G7 B7 e7, D string 7 under it for muted downstrokes
  A13: { top: [61, 66, 71], under: 57 },
};
const CUT = [
  ["Em9", "X.xX.xXx.xX.xXx."],
  ["A13", ".xXx.xX.xX.xXx.x"],
  ["Em9", "X.xX.xXx.xX.xX.X"],
  ["A13", ".xXx.xX.xXxXx.x."],
]; // [grip, grid]

// --- right: single-note line ---

// hammer-ons and pull-offs: [bar][16th] -> h or p, on the target note
const ARTS = [
  { 5: "h", 15: "h" }, // G3-A3 on the D string (5-7), B3-D4 on the G string (4-7)
  { 5: "h", 15: "p" }, // C#4-D4, D4-C#4
  { 5: "h", 15: "h" },
  { 5: "h", 10: "h", 15: "p" }, // C#4-D4, G3-A3, D4-B3
];
const CURL = { 1: 12 }; // bar 2's held E4

// D: picks on the notes the groove leans on, legato for the notes between them.
// Bar 1: E3 picked on the push, hammered through G3 and A3 into the snare, B3
// picked and hammered to D4 into the next downbeat, vibrato on the held A3.
// Bar 2: C#4 picked and hammered to D4, then D4 picked and bent to E4 (the 5th of
// A) on the snare, released back to D4 and pulled off to C#4: one pick, four pitches.
// Bar 4: two hammer-ons, then a pull-off from D4 to B3 that falls into the E3 downbeat.
const ARTS_D = [
  { 4: "h", 5: "h", 15: "h" },
  { 5: "h", 12: "b", 14: "r", 15: "p" },
  { 4: "h", 5: "h", 15: "h" },
  { 5: "h", 10: "h", 15: "p" },
];
const VIB_D = [{ 12: 30 }, {}, { 12: 30 }, {}];
// H: bar 2 picks E4 on the snare and pulls off to D4 and C#4 (G string 9-7-6).
const ARTS_H = [ARTS_D[0], { 5: "h", 14: "p", 15: "p" }, ARTS_D[2], ARTS_D[3]];

const LINE = [
  "E3 . x E3 G3 A3 . E3 x . G3 x A3 . B3 D4",
  "A3 . x A3 C#4 D4 . A3 x . C#4 x E4 . D4 C#4",
  "E3 . x E3 G3 A3 . E3 x . G3 x A3 . B3 D4",
  "A3 . x A3 C#4 D4 . A3 x G3 A3 x B3 x D4 B3",
].map((s) => s.split(" "));

// --- bass and drums ---

const BASS = [
  "E1 . . E2 . . E1 . E1 . D2 . E2 . B1 D2",
  "A1 . . A2 . . A1 . A1 . G2 . A2 . E2 G2",
  "E1 . . E2 . . E1 . E1 . D2 . E2 . B1 D2",
  "A1 . . A2 . . A1 . A1 . G1 . A1 B1 C#2 D#2",
].map((s) => s.split(" "));
const KICK = [0, 6, 8];
const SNARE = [4, 12];
const GHOST = [7, 9, 15];

const tracks = { open: [], muted: [], line: [], lineMuted: [], bass: [], drums: [] };
const deadSplit = ["P", "D", "H", "M", "HM"].includes(lead);
const ghostRests = lead === "M" || lead === "HM";

for (let rep = 0; rep < reps; rep++) {
  for (let bar = 0; bar < 4; bar++) {
    const b0 = (rep * 4 + bar) * 4;
    const [gripName, grid] = CUT[bar];

    [...grid].forEach((c, s) => {
      if (c === ".") return;
      const down = s % 2 === 0;
      const accent = c === "X";
      const grip = GRIPS[s === 15 ? CUT[(bar + 1) % 4][0] : gripName];
      let strings = accent ? grip.top : down ? [grip.under, ...grip.top] : grip.top.slice(-2);
      if (!down) strings = [...strings].reverse();
      const start = b0 + s / 4 + (down ? 0 : ms(5)) + ms(jit(4));
      const spread = ms(accent ? 16 : down ? 8 : 5) + ms(jit(3));
      const step = spread / (strings.length - 1);
      const vel = accent ? 92 : down ? 52 : 42;
      // the last accent of a bar rings for an 8th, the rest choke at a 16th
      const len = accent ? (grid.lastIndexOf("X") === s ? 0.5 : 0.2) : 0;

      strings.forEach((pitch, i) => {
        const t = start + i * step;
        const velocity = clampVel(vel + 4 - (8 * i) / (strings.length - 1) + jit(4));
        if (accent) tracks.open.push({ pitch, start: t, duration: Math.max(ms(30), start + len - t), velocity });
        else tracks.muted.push({ pitch, start: t, duration: ms(22 + jit(4)), velocity });
      });
    });

    let prev = midi(LINE[bar][0]);
    LINE[bar].forEach((tok, s) => {
      if (tok === "." && !ghostRests) return;
      const start = b0 + s / 4 + (s % 2 ? ms(5) : 0) + ms(jit(3));
      if (tok === "x" || tok === ".") {
        const velocity = clampVel((ghostRests ? (s % 2 ? 36 : 44) : 34) + jit(4));
        (deadSplit ? tracks.lineMuted : tracks.line).push({ pitch: prev, start, duration: ms(20), velocity });
        return;
      }
      prev = midi(tok);
      const next = LINE[bar][s + 1];
      const len = next === "." && !ghostRests ? 0.4 : 0.2;
      const note = { pitch: prev, start, duration: len, velocity: clampVel((s % 4 === 0 ? 84 : 72) + jit(5)) };
      if (lead === "B" || lead === "C") note.art = ARTS[bar][s];
      if (lead === "C" && len > 0.2 && !note.art) {
        if (CURL[bar] === s) note.curl = 50;
        else note.vib = 25;
      }
      if (lead === "D") {
        note.art = ARTS_D[bar][s];
        if (VIB_D[bar][s]) note.vib = VIB_D[bar][s];
      }
      if (lead === "H" || lead === "HM") note.art = ARTS_H[bar][s];
      if (!note.art) delete note.art;
      tracks.line.push(note);
    });

    BASS[bar].forEach((tok, s) => {
      if (tok === ".") return;
      const start = b0 + s / 4 + ms(jit(3));
      tracks.bass.push({ pitch: midi(tok), start, duration: 0.2, velocity: clampVel((s % 4 === 0 ? 100 : 86) + jit(5)) });
    });

    for (let s = 0; s < 16; s++) {
      const t = b0 + s / 4;
      tracks.drums.push({ pitch: 42, start: t + ms(jit(3)), duration: 0.1, velocity: clampVel((s % 2 ? 48 : 74) + jit(6)) });
      if (KICK.includes(s)) tracks.drums.push({ pitch: 36, start: t, duration: 0.2, velocity: 104 });
      if (SNARE.includes(s)) tracks.drums.push({ pitch: 38, start: t + ms(4), duration: 0.2, velocity: 102 });
      if (GHOST.includes(s)) tracks.drums.push({ pitch: 38, start: t + ms(jit(4)), duration: 0.1, velocity: clampVel(34 + jit(4)) });
    }
  }
}

const font = (release) => (fsbs ? { sf2: "/tmp/egtr/fsbs.sf2", program: 0, nrpn: { 38: release } } : {});
const g = fsbs ? 0.45 : 1; // FSBS samples run about 7 LU hotter
const track = (name, program, notes, gain, pan, extra = {}) => ({ name, program, notes, muted: false, soloed: false, gain, pan, ...extra });

const project = {
  title: "Interlock in E (guitar loop)",
  comment: "Two interlocking guitars, written from the fretboard. Left cuts Em9 (7-7-7 on G-B-e) and A13 (6-7-7), right plays a single-note 16th line with dead notes. 104 BPM.",
  tempo: TEMPO,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 0.9,
  locators: [],
  midiTracks: [
    track("Guitar L (cutting)", 27, tracks.open, 0.5 * g, -0.6, font(-1000)),
    track("Guitar L (muted)", fsbs ? 27 : 28, tracks.muted, 0.7 * g, -0.6, font(-2800)),
    track("Guitar R (line)", 27, tracks.line, (ghostRests ? 1.1 : 0.7) * g, 0.6, ghostRests ? font(-1000) : lead ? (fsbs ? { sf2: "/tmp/egtr/fsbs.sf2", program: 0 } : {}) : font(-1600)),
    ...(deadSplit ? [track("Guitar R (muted)", fsbs ? 27 : 28, tracks.lineMuted, (ghostRests ? 4.4 : 0.9) * g, 0.6, font(-2800))] : []),
    track("Bass (finger)", 33, tracks.bass, 0.85, 0),
    track("Drums", 0, tracks.drums, 0.7, 0, { bank: 128 }),
  ],
  loop: { enabled: true, range: { startBeat: 0, endBeat: 16 * reps } },
};
fs.writeFileSync(output, JSON.stringify(project));
console.log(Object.fromEntries(Object.entries(tracks).map(([k, v]) => [k, v.length])));
