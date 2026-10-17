import { deflateRawSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const PC = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11, "E#": 5 };
const p = (s) => { const m = s.match(/^([A-G][#b]?)(-?\d)$/); return PC[m[1]] + 12 * (Number(m[2]) + 1); };
const at = (bar, beat = 0) => (bar - 1) * 4 + beat;

const tracks = {};
function track(name, program, pan, gain, extra = {}) {
  tracks[name] = { name, program, pan, gain, muted: false, soloed: false, notes: [], viewMode: "overview", height: 72, keySignature: { fifths: -1, mode: "minor" }, ...extra };
}
const add = (t, pitch, start, duration, velocity) =>
  tracks[t].notes.push({ pitch: typeof pitch === "string" ? p(pitch) : pitch, start, duration, velocity: Math.max(1, Math.min(127, Math.round(velocity))) });
// line: [[pitch, dur], ...] starting at bar, pitch null = rest
function line(t, bar, items, vel, transpose = 0) {
  let b = at(bar);
  for (const [pi, d, v] of items) {
    if (pi) add(t, p(pi) + transpose, b, d * 0.95, v ?? vel);
    b += d;
  }
}

// --- tracks (pan = seating plan) ---
track("Violins I", 40, -0.45, 0.8);
track("Violins II (16ths)", 40, -0.3, 0.6);
track("Violas (ostinato)", 41, 0.2, 0.8);
track("Cellos", 42, 0.35, 0.75);
track("Contrabass", 43, 0.15, 0.85);
track("Strings pad (divisi)", 48, -0.1, 0.55);
track("Tremolo strings", 44, -0.2, 0.5);
track("Pizzicato", 45, 0.3, 0.6);
track("Flute", 73, -0.15, 0.7);
track("Oboe", 68, 0.1, 0.6);
track("Clarinet", 71, 0.05, 0.7);
track("Horns", 60, -0.3, 0.8);
track("Trumpets", 56, 0.2, 0.65);
track("Trombones", 57, 0.35, 0.65);
track("Tuba", 58, 0.25, 0.6);
track("Timpani", 47, -0.05, 0.75);
track("Percussion", 48, 0, 0.7, { bank: 128 });

// --- harmony per bar ---
const CH = {
  Dm: ["D", 0], D: ["D", 1], Bb: ["Bb", 1], Bbm: ["Bb", 0], Gm: ["G", 0], A: ["A", 1],
  "F#": ["F#", 1], Gb: ["Gb", 1], Ebm: ["Eb", 0],
};
const harmony = [
  "Dm","Dm","Dm","Dm",
  "Dm","Dm","Bb","Bb","Gm","Gm","A","A",
  "D","D","F#","F#","D","D","Bb","Bb",
  "Bb","Bb","Bbm","Bbm","Gb","Gb","Ebm","Ebm",
  "D","D","Bb","Bb","Gm","Gm","A","A",
  "Dm","Dm","Bb","A",
];
// root pitch in [lo, lo+11]
const rootIn = (name, lo) => { const pc = PC[CH[name][0]]; return lo + ((pc - lo) % 12 + 12) % 12; };
const triad = (name, lo) => { const r = rootIn(name, lo); return [r, r + (CH[name][1] ? 4 : 3), r + 7]; };

// energy (0-1) per bar drives velocities
const energy = (bar) =>
  bar <= 4 ? 0.25 : bar <= 12 ? 0.35 + (bar - 5) * 0.015 : bar <= 20 ? 0.5 + (bar - 13) * 0.01 :
  bar <= 28 ? 0.6 + (bar - 21) * 0.045 : bar <= 36 ? 0.95 : 0.4 - (bar - 37) * 0.05;

for (let bar = 1; bar <= 40; bar++) {
  const h = harmony[bar - 1];
  const e = energy(bar);
  // Violas: 3+3+2 ostinato, root / fifth-below / third
  const r = rootIn(h, 57), [, third] = triad(h, 57), low = r - 5;
  const cyc = [r, low, third];
  for (let i = 0; i < 8; i++) {
    const accent = i === 0 || i === 3 || i === 6;
    let pitch = cyc[i % 3];
    if (bar === 40 && i === 7) pitch = p("C#4"); // leading tone into bar 1
    add("Violas (ostinato)", pitch, at(bar, i * 0.5), 0.45, (accent ? 55 : 35) + e * 60);
    // Cellos: octave doubling from bar 9 through 36
    if (bar >= 9 && bar <= 36) add("Cellos", pitch - 12, at(bar, i * 0.5), 0.45, (accent ? 55 : 38) + e * 55);
  }
  // Violins II: 16th ostinato bars 25-36, crescendo
  if (bar >= 25 && bar <= 36) {
    const [a, b, c] = triad(h, 64);
    const pat = [c, a, b, a];
    for (let i = 0; i < 16; i++) add("Violins II (16ths)", pat[i % 4], at(bar, i * 0.25), 0.22, 45 + e * 60 + (i % 4 === 0 ? 10 : 0));
  }
  // Strings pad (divisi), sustained
  if ((bar >= 5 && bar <= 20) || bar >= 29) {
    const v = triad(h, 55).concat([rootIn(h, 62) + 12]);
    for (const n of v) add("Strings pad (divisi)", n, at(bar), 3.9, 30 + e * 55);
  }
  // Tremolo strings, high, bars 23-28 crescendo
  if (bar >= 23 && bar <= 28) for (const n of triad(h, 67)) add("Tremolo strings", n, at(bar), 3.95, 40 + (bar - 23) * 12);
  // Pizzicato bars 13-20 on beats
  if (bar >= 13 && bar <= 20) {
    const [a, , c] = triad(h, 50);
    [a, c, a + 12, c].forEach((n, i) => add("Pizzicato", n, at(bar, i), 0.5, 70));
  }
  // Contrabass: pedal D (1-12, 37-40), pedal Bb (21-26), Eb (27-28), roots elsewhere
  const bassPitch =
    bar <= 12 || bar >= 37 ? p("D2") : bar >= 21 && bar <= 26 ? p("Bb1") : bar <= 28 && bar >= 27 ? p("Eb2") : rootIn(h, 33);
  add("Contrabass", bassPitch, at(bar), 3.95, 50 + e * 50);
  if (bar >= 29 && bar <= 36) add("Contrabass", bassPitch + 12, at(bar), 3.95, 90);
  // Trombones: chord halves bars 21-28 (crescendo)
  if (bar >= 21 && bar <= 28) for (const n of triad(h, 50)) { add("Trombones", n, at(bar), 1.9, 45 + e * 50); add("Trombones", n, at(bar, 2), 1.9, 50 + e * 50); }
  // Timpani: 3+3+2 cell on pedal/root
  const timp = (name) => rootIn(name, 41);
  if (bar >= 21 && bar <= 26) [0, 1.5, 3].forEach((b) => add("Timpani", p("Bb2"), at(bar, b), 0.4, 50 + e * 50));
  if (bar >= 27 && bar <= 28) for (let i = 0; i < 16; i++) add("Timpani", p("Bb2"), at(bar, i * 0.25), 0.22, 55 + ((bar - 27) * 16 + i) * 2);
  if (bar >= 29 && bar <= 36) [0, 1.5, 3].forEach((b, i) => add("Timpani", timp(h), at(bar, b), 0.4, i === 0 ? 115 : 95));
}

// --- Theme (contour: arch D4 -> G5 peak at bar 9 -> A4), horn bars 5-12 ---
const themeMinor = [
  ["D4",1.5],["A4",1.5],["Bb4",1],
  ["A4",2],["G4",1],["F4",1],
  ["F4",1.5],["D5",1.5],["C5",1],
  ["Bb4",2],["D5",1],["F5",1],
  ["G5",3],["F5",1],
  ["D5",1.5],["Bb4",1.5],["G4",1],
  ["A4",1.5],["C#5",1.5],["E5",1],
  ["A4",4],
];
line("Horns", 5, themeMinor, 78);

// --- B: inversion in flute, clarinet an octave below; oboe unison from 17; horn glue ---
const inv = [
  ["A5",1.5],["D5",1.5],["C#5",1], ["D5",2],["E5",1],["F#5",1],
  ["C#6",1.5],["F#5",1.5],["E#5",1], ["F#5",2],["G#5",1],["A#5",1],
  ["A5",1.5],["D5",1.5],["C#5",1], ["D5",2],["E5",1],["F#5",1],
  ["F5",1.5],["Bb4",1.5],["A4",1], ["Bb4",2],["C5",1],["D5",1],
];
line("Flute", 13, inv, 80);
line("Clarinet", 13, inv, 72, -12);
line("Oboe", 17, inv.slice(12), 72);
const glue = [["A3","D4"],["A#3","C#4"],["A3","D4"],["Bb3","D4"]];
glue.forEach((pair, i) => pair.forEach((n) => add("Horns", n, at(13 + i * 2), 7.9, 62)));

// --- C: fragmented head motif in horns, sequenced, rising ---
const frag = [["Bb3","F4","Gb4"],["Bb3","F4","Gb4"],["Gb3","Db4","D4"],["Eb4","Bb4","B4"]];
frag.forEach((m, i) => {
  const bar = 21 + i * 2, v = 70 + i * 10;
  line("Horns", bar, [[m[0],1.5],[m[1],1.5],[m[2],1]], v);
  add("Horns", m[1], at(bar + 1), 3.9, v);
});

// --- Climax: theme in D major; violins + flute unison, horns + trumpets an octave below ---
const themeMajor = [
  ["D5",1.5],["A5",1.5],["B5",1],
  ["A5",2],["G5",1],["F#5",1],
  ["F5",1.5],["D6",1.5],["C6",1],
  ["Bb5",2],["D6",1],["F6",1],
  ["G6",3],["F6",1],
  ["D6",1.5],["Bb5",1.5],["G5",1],
  ["A5",1.5],["C#6",1.5],["E6",1],
  ["C#6",2],["A5",2],
];
line("Violins I", 29, themeMajor, 108);
line("Flute", 29, themeMajor, 100);
line("Horns", 29, themeMajor, 105, -12);
line("Trumpets", 29, themeMajor, 98, -12);
// Augmentation of the head motif (3+3+2 beats) in trombones, tuba an octave below
const aug = [["D3","A3","Bb3"],["Bb2","F3","Gb3"],["G2","D3","Eb3"],["A2","E3","F3"]];
aug.forEach((m, i) => {
  const items = [[m[0],3],[m[1],3],[m[2],2]];
  line("Trombones", 29 + i * 2, items, 100);
  line("Tuba", 29 + i * 2, items, 95, -12);
});
// Tuba enters at 27 on the pedal
add("Tuba", p("Eb2"), at(27), 7.9, 70);

// --- Outro: clarinet fragments, back to intro texture ---
line("Clarinet", 37, [["D4",1.5],["A4",1.5],["Bb4",1],["A4",4]], 60);
line("Clarinet", 39, [["D4",1.5],["F4",1.5],["E4",1],["C#4",3],[null,1]], 48);

// --- Percussion (GS Orchestra kit) ---
for (let bar = 27; bar <= 28; bar++)
  for (let i = 0; i < 16; i++) add("Percussion", 38, at(bar, i * 0.25), 0.2, 30 + ((bar - 27) * 16 + i) * 2.8);
for (const bar of [29, 31, 33, 35]) add("Percussion", 36, at(bar), 1, 120);
add("Percussion", 57, at(29), 4, 115);
add("Percussion", 49, at(33), 4, 105);
add("Percussion", 57, at(35), 4, 100);
add("Percussion", 36, at(36, 2), 1, 110);

const project = {
  title: "Film cue: Tide Engine (loop)",
  comment: "~40-bar orchestral cue in D minor. 3+3+2 ostinato identity, D pedal, chromatic mediants (D-F#, D-Bb), neo-Riemannian chain Bb-P-Bbm-L-Gb-R-Ebm-S-D. Loops bar 40 -> bar 1.",
  tempo: 96,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 0.8,
  loop: { enabled: true, range: { startBeat: 0, endBeat: 160 } },
  locators: [
    { beat: at(1), label: "Intro" }, { beat: at(5), label: "A theme" }, { beat: at(13), label: "B mediants" },
    { beat: at(21), label: "C build" }, { beat: at(29), label: "Climax" }, { beat: at(37), label: "Outro / loop" },
  ],
  midiTracks: Object.values(tracks),
};

const payload = deflateRawSync(JSON.stringify(project)).toString("base64url");
const url = `https://toy-midi.hiro18181.workers.dev/draft#p=${payload}`;
writeFileSync("/tmp/film-cue/project.json", JSON.stringify(project, null, 2));
writeFileSync("/tmp/film-cue/link.txt", url + "\n");
console.log("tracks", project.midiTracks.length, "notes", project.midiTracks.reduce((s, t) => s + t.notes.length, 0), "url length", url.length);
