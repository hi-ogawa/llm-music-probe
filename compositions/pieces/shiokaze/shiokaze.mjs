// "Shiokaze": a pitch bend, CC1, and CC64 expression demo for Toy MIDI, 16 bars of 4/4 at 116 BPM in F major.
//
// Usage: node shiokaze.mjs <out dir>
// Writes v1-plain.json (no automation, Rhodes notes lengthened instead of pedalled) and
// v2-expression.json (pitch bend and CC1 on the alto sax, pitch bend on the fretless bass,
// CC64 on the Rhodes). Both versions have the same notes and velocities.
//
// Form (bars):
// 1-4   A. Bbmaj7 C9 Am7 Dm9 (the royal road). The sax scoops into each phrase, holds E5 with
//       delayed vibrato, and falls off the end of bar 4. The Rhodes comps dry, short stabs.
// 5-8   A'. Gm9 C9 Fmaj9 A7. A doit off bar 6, and a long C#5 with vibrato over A7.
// 9-12  B. Bbmaj7 A7 Dm9 Cm7 F7 (Just the Two of Us). The sax climbs to G5 with a wide
//       vibrato and a long fall, the Rhodes opens into pedalled broken chords.
// 13-16 Ending. Bbmaj7 Am7 D9 Gm9 C9sus4 Fmaj9. A last fall, then a held A4 with vibrato over a
//       pedalled Fmaj9.
// The fretless bass slides between roots at seven chord changes.
import fs from "node:fs";
import path from "node:path";

const [outDir] = process.argv.slice(2);
const BAR = 4;
const END = 16 * BAR;
const TAIL = END + 3; // the last chord rings out

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const m = (n) => {
  const [, l, acc, o] = n.match(/^([A-G])([#b]?)(\d)$/);
  return 12 * (Number(o) + 1) + NOTE[l] + (acc === "#" ? 1 : acc === "b" ? -1 : 0);
};
const smooth = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const easeIn = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x);
const easeOut = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - (1 - x) ** 2);
const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

// --- harmony: [start beat, beats, bass root, Rhodes voicing (low to high)] ---

const CHORDS = [
  [0, 4, "Bb1", ["Bb2", "A3", "C4", "D4", "F4"]], // Bbmaj9
  [4, 4, "C2", ["C3", "Bb3", "D4", "E4", "G4"]], // C9
  [8, 4, "A1", ["A2", "G3", "C4", "E4", "G4"]], // Am7
  [12, 4, "D2", ["D3", "C4", "E4", "F4", "A4"]], // Dm9
  [16, 4, "G1", ["G2", "F3", "A3", "Bb3", "D4"]], // Gm9
  [20, 4, "C2", ["C3", "Bb3", "D4", "E4", "G4"]], // C9
  [24, 4, "F2", ["F2", "E3", "G3", "A3", "C4"]], // Fmaj9
  [28, 4, "A1", ["A2", "G3", "C#4", "F4", "A4"]], // A7(b13)
  [32, 4, "Bb1", ["Bb2", "A3", "C4", "D4", "F4"]], // Bbmaj9
  [36, 4, "A1", ["A2", "G3", "C#4", "F4", "A4"]], // A7(b13)
  [40, 4, "D2", ["D3", "C4", "E4", "F4", "A4"]], // Dm9
  [44, 2, "C2", ["C3", "Bb3", "Eb4", "G4"]], // Cm7
  [46, 2, "F1", ["F2", "Eb3", "A3", "D4"]], // F13
  [48, 4, "Bb1", ["Bb2", "A3", "C4", "D4", "F4"]], // Bbmaj9
  [52, 2, "A1", ["A2", "G3", "C4", "E4"]], // Am7
  [54, 2, "D2", ["D3", "C4", "E4", "F#4"]], // D9
  [56, 2, "G1", ["G2", "F3", "A3", "Bb3", "D4"]], // Gm9
  [58, 2, "C2", ["C3", "Bb3", "D4", "F4", "G4"]], // C9sus4
  [60, TAIL - 60, "F1", ["F2", "C3", "E3", "G3", "A3", "C4", "E4"]], // Fmaj9
];

// --- alto sax: [start beat, pitch, beats, velocity, marks] ---
// Marks: scoop (phrase start), fall or doit (phrase end). Long notes get delayed vibrato.

const SAX_LINE = [
  // bars 1-2: up into a long E5
  [0.5, "A4", 0.5, 88, "scoop"], [1, "C5", 0.5, 82], [1.5, "D5", 1, 90], [2.5, "C5", 0.5, 78],
  [3, "D5", 0.5, 84], [3.5, "E5", 2.4, 96],
  // bars 3-4: the answer, falling off A4
  [7.5, "C5", 0.5, 86, "scoop"], [8, "E5", 1, 92], [9, "D5", 0.5, 82], [9.5, "C5", 0.5, 80],
  [10, "A4", 1, 86], [11, "G4", 0.5, 78], [11.5, "A4", 1.9, 90, "fall"],
  // bars 5-6: a doit off C5
  [15.5, "F4", 0.5, 84, "scoop"], [16, "Bb4", 1.5, 92], [17.5, "A4", 0.5, 80], [18, "G4", 0.5, 80],
  [18.5, "F4", 0.5, 78], [19, "G4", 1, 86], [20.5, "Bb4", 0.5, 82], [21, "A4", 0.5, 80],
  [21.5, "G4", 0.5, 80], [22, "C5", 1, 94, "doit"],
  // bars 7-8: a long C#5 over A7
  [24.5, "A4", 0.5, 86, "scoop"], [25, "C5", 0.5, 84], [25.5, "E5", 0.5, 88], [26, "F5", 1, 92],
  [27, "E5", 0.5, 84], [27.5, "C#5", 3.4, 96],
  // bars 9-10: the climax, G5 over A7 with a long fall
  [31.5, "D5", 0.5, 92, "scoop"], [32, "F5", 1.5, 102], [33.5, "E5", 0.5, 90], [34, "D5", 0.5, 88],
  [34.5, "F5", 0.5, 94], [35, "G5", 3, 106, "fall"],
  // bars 11-12: descending, then a doit off F5
  [40.5, "F5", 0.5, 94, "scoop"], [41, "E5", 0.5, 86], [41.5, "D5", 0.5, 86], [42, "C5", 0.5, 84],
  [42.5, "A4", 1, 88], [44, "Bb4", 0.5, 84], [44.5, "C5", 0.5, 86], [45, "Eb5", 1, 94],
  [46, "D5", 0.5, 86], [46.5, "F5", 1, 96, "doit"],
  // bars 13-14: a held D5, then a fall off C5 over D9
  [48.5, "D5", 0.5, 90, "scoop"], [49, "F5", 0.5, 92], [49.5, "E5", 1, 90], [50.5, "D5", 0.5, 84],
  [51, "C5", 0.5, 82], [51.5, "D5", 2, 92], [54, "C5", 0.5, 82], [54.5, "A4", 0.5, 80],
  [55, "C5", 0.9, 88, "fall"],
  // bars 15-16: home to a long A4
  [56.5, "Bb4", 0.5, 86, "scoop"], [57, "A4", 0.5, 82], [57.5, "G4", 0.5, 80], [58, "D5", 0.5, 86],
  [58.5, "C5", 0.5, 84], [59, "Bb4", 0.5, 82], [59.5, "G4", 0.5, 82], [60, "A4", 4, 90],
];
const sax = SAX_LINE.map(([start, n, duration, velocity, mark]) => ({ pitch: m(n), start, duration, velocity, mark }));

// --- fretless bass: a pattern per chord, with a glide into the next root at marked changes ---

const SLIDE_INTO = new Set([4, 8, 16, 24, 40, 48, 60]); // chord start beats the bass slides into
const nearest = (pitch, target) => {
  let p = pitch;
  while (p - target > 6) p -= 12;
  while (target - p > 6) p += 12;
  return p;
};
const bass = [];
for (let i = 0; i < CHORDS.length; i++) {
  const [start, beats, rootName] = CHORDS[i];
  const root = m(rootName);
  const next = CHORDS[i + 1];
  const nextRoot = next && m(next[2]);
  const slide = next && SLIDE_INTO.has(next[0]);
  const note = (offset, pitch, duration, velocity, glideTo) =>
    bass.push({ pitch, start: start + offset, duration, velocity, glideTo });
  if (!next) {
    note(0, root, 3.5, 98);
    continue;
  }
  if (beats === 4) {
    note(0, root, 1.5, 98);
    note(1.5, root, 0.5, 76);
    note(2, root + 7, 0.5, 86);
    if (slide) {
      note(2.5, root, 1.5, 90, nextRoot);
    } else {
      note(2.5, root + 12, 0.5, 84);
      note(3, root + 7, 0.5, 80);
      note(3.5, nearest(nextRoot - 1, root + 7), 0.5, 82); // chromatic approach from below
    }
  } else if (slide) {
    note(0, root, 1, 96);
    note(1, root, 1, 88, nextRoot);
  } else {
    note(0, root, 1.5, 96);
    note(1.5, nearest(nextRoot - 1, root), 0.5, 80);
  }
}

// --- Rhodes: dry stabs in bars 1-8, pedalled broken chords from bar 9 ---

const PEDAL_FROM = 32;
const rhodes = []; // written as the hands play them; v1 lengthens the pedalled ones
for (const [start, beats, , voicing] of CHORDS) {
  const lh = voicing.slice(0, 2);
  const rh = voicing.slice(2);
  const hit = (offset, pitches, duration, velocity) =>
    pitches.forEach((n, k) =>
      rhodes.push({ pitch: m(n), start: start + offset, duration, velocity: velocity - k, chordEnd: start + beats }),
    );
  if (start < PEDAL_FROM) {
    // city pop comping: the chord on 1, pushes on the and of 2 and of 4
    hit(0, voicing, 0.4, 78);
    hit(1.5, rh, 0.2, 70);
    hit(2.75, rh, 0.2, 62);
    hit(3.5, rh, 0.3, 72);
  } else if (start === 60) {
    // a slow roll up the last chord
    voicing.forEach((n, k) => hit(k * 0.18, [n], 0.5, 76 - k * 2));
  } else if (beats === 4) {
    hit(0, lh, 0.5, 78);
    hit(0.5, [rh[0]], 0.4, 66);
    hit(1, [rh[1]], 0.4, 68);
    hit(1.5, [rh[2]], 0.4, 70);
    hit(2.5, rh, 0.4, 72);
    hit(3.5, [rh.at(-1)], 0.4, 64);
  } else {
    hit(0, lh, 0.5, 76);
    hit(0.5, [rh[0]], 0.4, 66);
    hit(1, rh.slice(1), 0.4, 70);
  }
}
// what an agent writes without a pedal: each note held for a while, cut at the chord change
const LENGTHEN = 1.5;
const rhodesPlain = rhodes.map((n) =>
  n.start < PEDAL_FROM
    ? n
    : { ...n, duration: n.chordEnd === TAIL ? TAIL - n.start : Math.min(n.start + LENGTHEN, n.chordEnd) - n.start },
);

// --- clean guitar: muted chops on 2 and 4 with a 16th pickup, no expression ---

const guitar = [];
for (const [start, beats, , voicing] of CHORDS) {
  if (start >= 60) continue; // the last chord rings
  const top = voicing.slice(-3).map((n) => m(n));
  for (let b = 0; b < beats; b += 2) {
    top.forEach((pitch, k) => {
      guitar.push({ pitch, start: start + b + 0.75, duration: 0.12, velocity: 52 - k });
      guitar.push({ pitch, start: start + b + 1, duration: 0.2, velocity: 72 - k });
    });
  }
}

// --- drums (Standard kit): 16th hats, kick and snare, a fill into bar 9 ---

const K = 36, S = 38, HH = 42, OH = 46, CR = 49, TL = 45, TM = 47;
const drums = [];
const hit = (beat, pitch, velocity, duration = 0.25) => drums.push({ pitch, start: beat, duration, velocity });
for (let bar = 0; bar < 16; bar++) {
  const b0 = bar * BAR;
  const fill = bar === 7;
  const last = bar === 15;
  for (let s = 0; s < 16; s++) {
    const beat = b0 + s / 4;
    if (fill && s >= 12) continue;
    if (last && s >= 4) break;
    if (s === 14 && bar % 2 === 1 && !fill) hit(beat, OH, 70, 0.5);
    else if (!(s === 15 && bar % 2 === 1)) hit(beat, HH, s % 4 === 0 ? 74 : s % 2 === 0 ? 62 : 46);
  }
  if (last) {
    hit(b0, K, 100);
    hit(b0, CR, 92, 2);
    continue;
  }
  [0, 1.75, 2.5].forEach((o) => hit(b0 + o, K, o === 0 ? 100 : 88));
  [1, 3].forEach((o) => hit(b0 + o, S, 92));
  if (fill) [3, 3.25, 3.5, 3.75].forEach((o, k) => hit(b0 + o, [S, S, TM, TL][k], 80 + k * 4));
  if (bar === 0 || bar === 8 || bar === 12) hit(b0, CR, bar === 8 ? 100 : 84, 2);
}

// --- automation ---

const STEP = 0.125; // 1/32 note
const FINE = 0.0625; // scoops are short, so sample them finer

// sax pitch bend: scoops, falls, doits; 0 elsewhere
const saxBend = [];
const bend = (beat, semitones) => saxBend.push({ beat: round(beat), semitones: round(semitones, 3) });
sax.forEach((n, i) => {
  const end = n.start + n.duration;
  const nextStart = sax[i + 1]?.start ?? end + 1;
  if (n.mark === "scoop") {
    const depth = n.pitch >= m("D5") ? 1.5 : 1.2;
    for (let t = 0; t <= 0.25 + 1e-9; t += FINE) bend(n.start + t, -depth * (1 - easeOut(t / 0.25)));
  }
  if (n.mark === "fall" || n.mark === "doit") {
    const fall = n.mark === "fall";
    const length = fall ? (n.duration >= 2 ? 0.75 : 0.5) : 0.375;
    const depth = fall ? (n.duration >= 2 ? -6 : -4) : 3;
    const from = end - length;
    bend(from, 0);
    for (let t = FINE; t <= length + 1e-9; t += FINE) bend(from + t, depth * easeIn(t / length));
    bend(Math.min(nextStart, end + 0.25), 0);
  }
});

// sax vibrato on CC1: 0 for the attack, easing up over a beat, back to 0 before the next note
const saxMod = [{ beat: 0, value: 0 }];
for (const n of sax) {
  if (n.duration < 1.9) continue;
  const end = n.start + n.duration;
  const tailOut = n.mark === "fall" ? 0.75 : 0.25; // let the fall speak without vibrato on top
  const delay = 0.6;
  const depth = n.pitch >= m("G5") ? 76 : 64; // the sample wobbles about ±10 cents on its own, so 48 barely reads
  const pts = [];
  for (let t = 0; n.start + t <= end + 1e-9; t += 0.25) {
    const beat = n.start + t;
    const up = smooth((t - delay) / 1.0);
    const down = 1 - smooth((beat - (end - tailOut - 0.25)) / 0.25);
    pts.push({ beat: round(beat), value: Math.round(depth * up * Math.max(0, down)) });
  }
  pts.push({ beat: round(end), value: 0 });
  saxMod.push(...pts);
}
const dedupe = (points, key) =>
  points.filter((p, i) => i === 0 || p[key] !== points[i - 1][key] || i === points.length - 1);

// bass pitch bend: glides, the held note bends to the next root over its last half beat
const bassBend = [];
for (const n of bass) {
  if (n.glideTo === undefined) continue;
  const end = n.start + n.duration;
  const interval = n.glideTo - n.pitch;
  const length = 0.5;
  for (let t = 0; t <= length + 1e-9; t += FINE) {
    bassBend.push({ beat: round(end - length + t), semitones: round(interval * smooth(t / length), 3) });
  }
  bassBend.pop(); // the next note starts at `end`, where the bend returns to 0
  bassBend.push({ beat: round(end), semitones: 0 });
}

// Rhodes pedal from bar 9: re-pedal a 16th after each chord change
const pedal = [{ beat: 0, value: 0 }];
for (const [start] of CHORDS) {
  if (start < PEDAL_FROM) continue;
  if (start > PEDAL_FROM) pedal.push({ beat: start, value: 0 });
  pedal.push({ beat: start + 0.25, value: 127 });
}
pedal.push({ beat: TAIL, value: 0 });

// --- project ---

const strip = (notes) => notes.map(({ pitch, start, duration, velocity }) => ({ pitch, start, duration: round(duration), velocity }));
const track = (name, program, gain, pan, notes, extra = {}) => ({
  name,
  program,
  notes: strip(notes),
  muted: false,
  soloed: false,
  gain,
  pan,
  ...extra,
});

const project = (version, shaped) => ({
  title: `Shiokaze ${version}`,
  comment:
    "A pitch bend, CC1, and CC64 demo in 1980s city pop style, 16 bars at 116 BPM in F major. The alto sax " +
    "scoops into phrases, falls and doits off phrase ends, and has delayed vibrato on long notes. The fretless " +
    "bass slides between roots. The Rhodes comps dry in bars 1-8 and pedals broken chords from bar 9. " +
    (shaped
      ? "This is the shaped version, with pitch bend and CC1 on the sax, pitch bend on the bass, and CC64 on the Rhodes."
      : "This is the plain version, with the same notes and no automation. Instead of the pedal, the Rhodes notes from bar 9 are lengthened."),
  tempo: 116,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 1,
  locators: [
    { id: "a", beat: 0, label: "A" },
    { id: "a2", beat: 16, label: "A'" },
    { id: "b", beat: 32, label: "B (pedal)" },
    { id: "ending", beat: 48, label: "Ending" },
  ],
  midiTracks: [
    track("Alto Sax", 65, 0.85, 0.1, sax, shaped
      ? { automation: [
          { type: "pitch-bend", points: saxBend },
          { type: "controller", controller: 1, points: dedupe(saxMod, "value") },
        ] }
      : {}),
    track("Fretless Bass", 35, 0.68, 0, bass, shaped ? { automation: [{ type: "pitch-bend", points: bassBend }] } : {}),
    track("Rhodes", 4, 0.7, -0.25, shaped ? rhodes : rhodesPlain, shaped
      ? { automation: [{ type: "controller", controller: 64, points: pedal }] }
      : {}),
    track("Guitar", 27, 0.55, 0.4, guitar),
    track("Drums", 0, 0.68, 0, drums, { bank: 128 }),
  ],
  loop: { enabled: false, range: { startBeat: 0, endBeat: END } },
});

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "v1-plain.json"), JSON.stringify(project("v1 (plain)", false), null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "v2-expression.json"), JSON.stringify(project("v2 (expression)", true), null, 2) + "\n");
