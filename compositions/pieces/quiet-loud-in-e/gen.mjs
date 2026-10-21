// Generates quiet-loud.json, a 24-bar quiet-loud rock loop in E for Toy MIDI.
import { writeFileSync } from "node:fs";

const bar = (b) => (b - 1) * 4; // beat where bar b (1-based) starts
const slot = (b, s) => bar(b) + s * 0.5; // eighth-note slot s (0-7) in bar b

// Deterministic PRNG so the R take's humanization is reproducible
let seed = 18181;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;

// Open-position shapes as [pitch, string]. String 6 (low E) has no tabString
// value in the format, and tab falls back to the only string that can play it.
const SHAPES = {
  // full chords with thirds, for clean and crunch
  E: [[40, 6], [47, 5], [52, 4], [56, 3], [59, 2], [64, 1]],
  D: [[50, 4], [57, 3], [62, 2], [66, 1]],
  A: [[45, 5], [52, 4], [57, 3], [61, 2], [64, 1]],
  G: [[43, 6], [47, 5], [50, 4], [55, 3], [59, 2], [67, 1]],
  C: [[48, 5], [52, 4], [55, 3], [60, 2], [64, 1]],
  // power chords (root, fifth, octave), for high gain
  E5: [[40, 6], [47, 5], [52, 4]],
  C5: [[48, 5], [55, 4], [60, 3]],
  G5: [[43, 6], [50, 5], [55, 4]],
  D5: [[50, 4], [57, 3], [62, 2]],
};
// palm-muted chugs on the low strings of the same shapes
const MUTES = {
  E: [[40, 6], [47, 5]],
  D: [[50, 4], [57, 3]],
  A: [[45, 5], [52, 4]],
  G: [[43, 6], [50, 5]],
  C: [[48, 5], [52, 4]],
};

const note = (pitch, string, start, duration, velocity = 100) => ({
  pitch,
  start: +start.toFixed(4),
  duration: +duration.toFixed(4),
  velocity,
  ...(string <= 5 ? { tabString: string } : {}),
});

// Downstroke strum: low string first, each string a few ms later
function strum(shape, start, duration, { stagger = 0.012, velocity = 100, jitter = 0 } = {}) {
  return shape.map(([p, s], i) => {
    const t = start + i * stagger + jitter;
    return note(p, s, t, duration - i * stagger, velocity);
  });
}

// --- Riff (intro at crunch, verse clean): chug chug STAB . chug chug STAB .
// Bar types: "E" = E chord bar, "DA" = D then A, "DGA" = bar 4/8 variation.
function riffBar(b, kind, open, mute) {
  const chug = (shape, s) => mute.push(...strum(MUTES[shape], slot(b, s), 0.4, { stagger: 0.008 }));
  if (kind === "E") {
    chug("E", 0); chug("E", 1); open.push(...strum(SHAPES.E, slot(b, 2), 0.95));
    chug("E", 4); chug("E", 5); open.push(...strum(SHAPES.E, slot(b, 6), 0.95));
  } else if (kind === "DA") {
    chug("D", 0); chug("D", 1); open.push(...strum(SHAPES.D, slot(b, 2), 0.95));
    chug("A", 4); chug("A", 5); open.push(...strum(SHAPES.A, slot(b, 6), 0.95));
  } else {
    chug("D", 0); chug("D", 1); open.push(...strum(SHAPES.D, slot(b, 2), 0.95));
    chug("G", 4); chug("G", 5); open.push(...strum(SHAPES.G, slot(b, 6), 0.45));
    open.push(...strum(SHAPES.A, slot(b, 7), 0.5));
  }
}
const RIFF = ["E", "DA", "E", "DGA"];

const crunch = [], crunchMute = [], clean = [], cleanMute = [];
RIFF.forEach((k, i) => riffBar(1 + i, k, crunch, crunchMute));
RIFF.forEach((k, i) => riffBar(5 + i, k, clean, cleanMute));

// --- Pre-chorus (crunch): palm-muted eighths that build, open stabs at the ends
for (let s = 0; s < 8; s++) crunchMute.push(...strum(MUTES.A, slot(9, s), 0.4, { stagger: 0.008 }));
for (let s = 0; s < 6; s++) crunchMute.push(...strum(MUTES.A, slot(10, s), 0.4, { stagger: 0.008 }));
crunch.push(...strum(SHAPES.A, slot(10, 6), 0.95));
for (let s = 0; s < 6; s++) crunchMute.push(...strum(MUTES.C, slot(11, s), 0.4, { stagger: 0.008 }));
crunch.push(...strum(SHAPES.C, slot(11, 6), 0.95));
for (let s = 0; s < 4; s++) crunchMute.push(...strum(MUTES.D, slot(12, s), 0.4, { stagger: 0.008 }));
crunch.push(...strum(SHAPES.D, slot(12, 4), 1.95)); // rings through the drum dropout

// --- Chorus and lead break (high gain): open power chords, double-tracked.
// L is tight to the grid; R drifts a few ms and strums looser.
const CHORDS = ["E5", "C5", "G5", "D5"];
const hgL = [], hgR = [];
// The lead break thins to sustained, syncopated hits so the lead has room.
const EIGHTHS = [0, 1, 2, 3, 4, 5, 6, 7].map((s) => [s, 0.46]);
const BREAK_HITS = [[0, 1.45], [3, 0.45], [4, 1.45], [7, 0.45]];
for (let b = 13; b <= 24; b++) {
  const shape = SHAPES[CHORDS[(b - 13) % 4]];
  for (const [s, dur] of b <= 20 ? EIGHTHS : BREAK_HITS) {
    hgL.push(...strum(shape, slot(b, s), dur, { stagger: 0.01 }));
    const jitter = 0.012 + rand() * 0.012; // about 0 to 12 ms late at 120 BPM
    hgR.push(...strum(shape, slot(b, s), dur, { stagger: 0.016, jitter, velocity: 97 + Math.round(rand() * 3) }));
  }
}

// --- Lead break: E minor pentatonic, 12th to 15th frets
const lead = [];
const L = (b, beat, pitch, string, dur) => lead.push(note(pitch, string, bar(b) + beat, dur, 112));
L(21, 0, 76, 1, 1); L(21, 1, 74, 2, 0.5); L(21, 1.5, 71, 2, 0.5); L(21, 2, 74, 2, 2); // D bent to E
L(22, 0, 67, 3, 0.5); L(22, 0.5, 69, 3, 0.5); L(22, 1, 71, 2, 1.5); L(22, 2.5, 64, 4, 0.5); L(22, 3, 67, 3, 1);
L(23, 0, 74, 2, 1); L(23, 1, 71, 2, 0.5); L(23, 1.5, 69, 3, 0.5); L(23, 2, 69, 3, 2); // A bent to B
L(24, 0, 74, 2, 1); L(24, 1, 71, 2, 0.5); L(24, 1.5, 69, 3, 0.5); L(24, 2, 67, 3, 0.5); L(24, 2.5, 64, 4, 1.5);

// Pitch bend: ramp up a whole step over half a beat, hold, release at the note end
function bend(start, end) {
  const pts = [];
  for (let i = 0; i <= 8; i++) pts.push({ beat: start + 0.25 + i * 0.0625, semitones: +(2 * Math.sin((i / 8) * Math.PI / 2)).toFixed(3) });
  pts.push({ beat: end, semitones: 0 });
  return pts;
}
const leadBend = [{ beat: 0, semitones: 0 }, ...bend(bar(21) + 2, bar(22)), ...bend(bar(23) + 2, bar(24))];

// --- Bass (picked bass), 4-string tab E1 A1 D2 G2
const bass = [];
const BS = { E: [28, 4], D: [38, 3], A: [33, 3], G: [31, 4], C: [36, 3] }; // [pitch, string]
const B = (r, start, dur, v = 100) => bass.push(note(BS[r][0], BS[r][1], start, dur, v));
// intro: double the riff roots
const riffRoots = { E: ["E", "E"], DA: ["D", "A"], DGA: ["D", "G"] };
RIFF.forEach((k, i) => {
  const b = 1 + i, [r1, r2] = riffRoots[k];
  B(r1, slot(b, 0), 0.4); B(r1, slot(b, 1), 0.4); B(r1, slot(b, 2), 0.95);
  B(r2, slot(b, 4), 0.4); B(r2, slot(b, 5), 0.4);
  if (k === "DGA") { B("G", slot(b, 6), 0.45); B("A", slot(b, 7), 0.45); } else B(r2, slot(b, 6), 0.95);
});
// verse: held roots
RIFF.forEach((k, i) => {
  const b = 5 + i, [r1, r2] = riffRoots[k];
  if (k === "E") B("E", bar(b), 3.9, 90);
  else { B(r1, bar(b), 1.9, 90); B(r2, bar(b) + 2, k === "DGA" ? 1.4 : 1.9, 90); if (k === "DGA") B("A", slot(b, 7), 0.45, 90); }
});
// pre-chorus: eighths with the chugs, rising A -> C -> D
for (let s = 0; s < 8; s++) B("A", slot(9, s), 0.4);
for (let s = 0; s < 6; s++) B("A", slot(10, s), 0.4);
B("A", slot(10, 6), 0.95);
for (let s = 0; s < 6; s++) B("C", slot(11, s), 0.4);
B("C", slot(11, 6), 0.95);
for (let s = 0; s < 4; s++) B("D", slot(12, s), 0.4);
B("D", slot(12, 4), 1.9);
// chorus and lead break: root pulse
const chorusRoots = ["E", "C", "G", "D"];
for (let b = 13; b <= 24; b++) for (let s = 0; s < 8; s++) B(chorusRoots[(b - 13) % 4], slot(b, s), 0.42);

// --- Drums (GeneralUser GS Power kit)
const KICK = 36, SNARE = 38, STICK = 37, HAT = 42, OHAT = 46, CRASH = 49, CRASH2 = 57, RIDE = 51;
const TOM_HI = 48, TOM_MID = 45, TOM_FLOOR = 41;
const drums = [];
const D = (p, start, v = 100, dur = 0.25) => drums.push({ pitch: p, start: +start.toFixed(4), duration: dur, velocity: v });

// intro: rock beat, kick on the chugs
for (let b = 1; b <= 4; b++) {
  for (let s = 0; s < 8; s++) D(HAT, slot(b, s), s % 2 ? 70 : 90);
  for (const s of [0, 1, 4, 5]) D(KICK, slot(b, s), s % 4 ? 95 : 110);
  D(SNARE, slot(b, 2), 110);
  if (b < 4) D(SNARE, slot(b, 6), 110);
}
D(CRASH, bar(1), 110, 1);
D(SNARE, slot(4, 6), 110); D(TOM_FLOOR, slot(4, 7), 105); // pushes with the G A stabs
// verse: quiet kit, cross-stick, kick still on the chugs
for (let b = 5; b <= 8; b++) {
  for (let s = 0; s < 8; s++) D(HAT, slot(b, s), s % 2 ? 45 : 60);
  for (const s of [0, 1, 4, 5]) D(KICK, slot(b, s), s % 4 ? 70 : 85);
  D(STICK, slot(b, 2), 85);
  if (b < 8) D(STICK, slot(b, 6), 85);
}
D(TOM_HI, slot(8, 6), 70); D(TOM_MID, slot(8, 7), 75); // small pickup into the pre-chorus
// pre-chorus: open hat quarters, kick on chugs, snare build roll
for (let b = 9; b <= 10; b++) {
  for (let s = 0; s < 8; s += 2) D(OHAT, slot(b, s), 80, 0.5);
  for (const s of b === 9 ? [0, 1, 3, 4, 5, 7] : [0, 1, 3, 4, 5]) D(KICK, slot(b, s), 100);
  D(SNARE, slot(b, 2), 105); D(SNARE, slot(b, 6), 108);
}
D(CRASH2, slot(10, 6), 95, 1); // with the open A stab
for (let s = 0; s < 8; s++) D(SNARE, slot(11, s), 70 + s * 4); // eighths
for (const s of [0, 2, 4]) D(KICK, slot(11, s), 100);
D(CRASH2, slot(11, 6), 95, 1);
for (let i = 0; i < 8; i++) D(SNARE, bar(12) + i * 0.25, 78 + i * 2); // sixteenths, beats 1-2
for (let i = 0; i < 8; i++) D(SNARE, bar(12) + 2 + i * 0.125, 86 + i * 2); // thirty-seconds, beat 3
for (const s of [0, 2, 4]) D(KICK, slot(12, s), 105);
// beat 4 of bar 12: drum dropout, only the open D chord rings
// chorus: crash-ride eighths, heavy backbeat
for (let b = 13; b <= 20; b++) {
  for (let s = 0; s < 8; s++) D(s % 2 ? HAT : CRASH2, slot(b, s), s % 2 ? 70 : 85, 0.5);
  for (const s of [0, 1, 3, 4, 5]) D(KICK, slot(b, s), s === 0 ? 115 : 100);
  D(SNARE, slot(b, 2), 118);
  if (b !== 16 && b !== 20) D(SNARE, slot(b, 6), 118);
}
for (const b of [13, 17]) D(CRASH, bar(b), 120, 2);
[TOM_HI, TOM_HI, TOM_MID, TOM_FLOOR].forEach((t, i) => D(t, bar(16) + 3 + i * 0.25, 105 + i * 3)); // into 17
for (let i = 0; i < 4; i++) D(SNARE, bar(20) + 3 + i * 0.25, 100 + i * 5); // into the lead break
// lead break: ride replaces the crash wash so the lead has room
for (let b = 21; b <= 24; b++) {
  for (let s = 0; s < 8; s++) D(RIDE, slot(b, s), s % 2 ? 70 : 90, 0.5);
  for (const s of [0, 1, 3, 4, 5]) D(KICK, slot(b, s), s === 0 ? 110 : 95);
  D(SNARE, slot(b, 2), 115);
  if (b < 24) D(SNARE, slot(b, 6), 115);
}
D(CRASH, bar(21), 115, 2);
[TOM_HI, TOM_HI, TOM_MID, TOM_MID, TOM_FLOOR, TOM_FLOOR, KICK, TOM_FLOOR].forEach((t, i) =>
  D(t, bar(24) + 2 + i * 0.25, 100 + i * 3)); // rolls back into bar 1

// --- Project
const GUITAR_TAB = [64, 59, 55, 50, 45, 40];
const E_MINOR = { fifths: 1, mode: "minor" };
const tele = (name, program, notes, extra = {}) => ({
  name, soundfont: "flamestudios-telecaster-bridge", program, notes,
  tabAnnotationEnabled: true, tabOpenStringPitches: GUITAR_TAB, keySignature: E_MINOR,
  ...extra,
});

export const MIX = {
  "Clean": { gain: 1.0, pan: -0.3 },
  "Clean Mute": { gain: 1.7, pan: -0.3 },
  "Crunch": { gain: 0.9, pan: -0.3 },
  "Crunch Mute": { gain: 1.6, pan: -0.3 },
  "High Gain L": { gain: 0.8, pan: -1 },
  "High Gain R": { gain: 0.8, pan: 1 },
  "High Gain Lead": { gain: 2.0, pan: 0.15 },
  "Bass": { gain: 0.8, pan: 0 },
  "Drums": { gain: 0.6, pan: 0 },
};
const mix = (name) => MIX[name];

const project = {
  title: "Quiet-Loud in E",
  comment:
    "24-bar quiet-loud rock loop at 120 BPM. Guitars are written for an offline amp-sim render, one gain per track: Clean (bars 5-8), Crunch (1-4, 9-12), High Gain (13-24). Muted tracks use the Telecaster Muted preset for palm mutes.",
  tempo: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: 96 }, enabled: true },
  locators: [
    { beat: bar(1), label: "Intro (crunch)" },
    { beat: bar(5), label: "Verse (clean)" },
    { beat: bar(9), label: "Pre-chorus (crunch, muted)" },
    { beat: bar(13), label: "Chorus (high gain)" },
    { beat: bar(21), label: "Lead break (high gain)" },
  ],
  midiTracks: [
    tele("Clean", 0, clean, mix("Clean")),
    tele("Clean Mute", 1, cleanMute, mix("Clean Mute")),
    tele("Crunch", 0, crunch, mix("Crunch")),
    tele("Crunch Mute", 1, crunchMute, mix("Crunch Mute")),
    tele("High Gain L", 0, hgL, mix("High Gain L")),
    tele("High Gain R", 0, hgR, mix("High Gain R")),
    tele("High Gain Lead", 0, lead, { ...mix("High Gain Lead"), automation: [{ type: "pitch-bend", points: leadBend }] }),
    { name: "Bass", program: 34, notes: bass, tabAnnotationEnabled: true, tabOpenStringPitches: [43, 38, 33, 28], keySignature: E_MINOR, ...mix("Bass") },
    { name: "Drums", program: 16, bank: 128, notes: drums, ...mix("Drums") },
  ],
};
for (const t of project.midiTracks) t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);

writeFileSync(new URL("./quiet-loud.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
console.log(project.midiTracks.map((t) => `${t.name}: ${t.notes.length}`).join("\n"));
