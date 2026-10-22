// Writes project.json, a Toy MIDI SharedProject: `node late-night-ii-v.mjs`
import { writeFileSync } from "node:fs";

let nextId = 0;
const n = (pitch, start, duration, velocity) => ({
  id: nextId++,
  pitch,
  start,
  duration,
  velocity: Math.max(1, Math.min(127, Math.round(velocity))),
});
// A controller holds its value until the next point, so a ramp is a staircase of quarter-beat steps
const ramp = (from, to, start, end) => {
  const points = [];
  for (let beat = start; beat < end - 1e-9; beat += 0.25)
    points.push({ beat, value: Math.round(from + ((to - from) * (beat - start)) / (end - start)) });
  return points;
};

// Rootless keys voicings, three-note string voicings, and the pitch classes a harmony note may use
const CHORDS = {
  Dm9: { bass: 38, third: 3, keys: [53, 57, 60, 64], strings: [57, 60, 64], tones: [2, 5, 9, 0, 4] },
  G13: { bass: 43, third: 4, keys: [53, 57, 59, 64], strings: [57, 59, 65], tones: [7, 11, 2, 5, 9, 4] },
  Cmaj9: { bass: 36, third: 4, keys: [52, 55, 59, 62], strings: [55, 59, 64], tones: [0, 4, 7, 11, 2] },
  Am9: { bass: 33, third: 3, keys: [55, 59, 60, 64], strings: [55, 60, 64], tones: [9, 0, 4, 7, 11] },
  Fmaj9: { bass: 41, third: 4, keys: [52, 55, 57, 60], strings: [57, 60, 64], tones: [5, 9, 0, 4, 7] },
  E7b9: { bass: 40, third: 4, keys: [56, 59, 62, 65], strings: [56, 62, 65], tones: [4, 8, 11, 2, 5] },
  Gm9: { bass: 43, third: 3, keys: [53, 57, 58, 62], strings: [58, 62, 65], tones: [7, 10, 2, 5, 9] },
  C13: { bass: 36, third: 4, keys: [52, 57, 58, 62], strings: [58, 62, 64], tones: [0, 4, 7, 10, 2, 9] },
  Bbmaj7s11: { bass: 34, third: 4, keys: [53, 57, 62, 64], strings: [57, 62, 64], tones: [10, 2, 5, 9, 4] },
  Em7: { bass: 40, third: 3, keys: [52, 55, 59, 62], strings: [55, 59, 62], tones: [4, 7, 11, 2] },
  A7b9: { bass: 45, third: 4, keys: [55, 58, 61, 64], strings: [55, 61, 64], tones: [9, 1, 4, 7, 10] },
};
const A_CHORDS = ["Dm9", "G13", "Cmaj9", "Am9", "Dm9", "G13", "Cmaj9", "Am9"].map((c) => [c, 4]);
const SECTIONS = [
  { name: "Intro", start: 0, chords: A_CHORDS.slice(0, 4) },
  { name: "A", start: 16, chords: A_CHORDS },
  {
    name: "B",
    start: 48,
    chords: [["Fmaj9", 4], ["E7b9", 4], ["Am9", 4], ["Gm9", 2], ["C13", 2], ["Fmaj9", 4], ["Bbmaj7s11", 4], ["Em7", 2], ["A7b9", 2], ["Dm9", 2], ["G13", 2]],
  },
  { name: "A'", start: 80, chords: A_CHORDS },
  // The outro turns around on A7b9, the dominant of the Dm9 the song loops back to
  { name: "Outro", start: 112, chords: [["Dm9", 4], ["G13", 4], ["Cmaj9", 4], ["A7b9", 4]] },
];
const END = 128;

// Flatten into one chord timeline, each chord knowing its section and the next root
const timeline = [];
for (const section of SECTIONS) {
  let beat = section.start;
  for (const [name, duration] of section.chords) {
    timeline.push({ section: section.name, name, ...CHORDS[name], start: beat, duration });
    beat += duration;
  }
}
timeline.forEach((chord, i) => {
  chord.nextRoot = (timeline[i + 1] ?? chord).bass;
  chord.isLast = timeline[i + 1]?.section !== chord.section;
});
const chordAt = (beat) => timeline.findLast((c) => c.start <= beat);
const barsOf = (section) =>
  [...Array(section === "Intro" || section === "Outro" ? 4 : 8).keys()].map((i) => SECTIONS.find((s) => s.name === section).start + i * 4);

// Vibes melody, per bar: [pitch, beat in bar, duration]
const MELODY_A = [
  [[76, 0.5, 0.5], [77, 1, 0.5], [81, 1.5, 1], [79, 2.5, 0.5], [77, 3, 1]],
  [[76, 0, 1.5], [74, 1.5, 0.5], [71, 2, 1], [74, 3, 1]],
  [[76, 0, 0.5], [79, 0.5, 0.5], [83, 1, 1.5], [81, 2.5, 0.5], [79, 3, 1]],
  [[76, 0, 3]],
  [[81, 0.5, 0.5], [84, 1, 1], [81, 2, 0.5], [79, 2.5, 0.5], [77, 3, 1]],
  [[76, 0, 0.5], [77, 0.5, 0.5], [79, 1, 1], [74, 2, 1], [71, 3, 1]],
  [[72, 0, 0.5], [74, 0.5, 0.5], [76, 1, 1], [79, 2, 0.5], [76, 2.5, 1.5]],
  [[74, 0, 0.5], [72, 0.5, 0.5], [71, 1, 0.5], [69, 2, 2]],
];
// B: long tones climbing to the top of the song in bars 5-6, then stepping down into A'
const MELODY_B = [
  [[81, 0, 2], [79, 2, 1], [76, 3, 1]],
  [[77, 0, 2], [74, 2, 1], [71, 3, 1]],
  [[72, 0, 1], [76, 1, 1], [83, 2, 2]],
  [[81, 0, 1.5], [82, 1.5, 0.5], [81, 2, 1], [79, 3, 1]],
  [[81, 0, 1], [84, 1, 1], [88, 2, 2]],
  [[86, 0, 2], [88, 2, 1], [86, 3, 1]],
  [[83, 0, 1], [79, 1, 1], [82, 2, 1], [79, 3, 1]],
  [[77, 0, 1], [76, 1, 1], [74, 2, 1], [71, 3, 1]],
];
const MELODY_OUTRO = [
  [[81, 0.5, 0.5], [79, 1, 0.5], [77, 1.5, 1], [76, 3, 1]],
  [[74, 0, 1.5], [77, 1.5, 0.5], [76, 2, 1], [74, 3, 1]],
  [[79, 0, 1], [76, 1, 2], [74, 3, 1]],
  [[76, 0, 1], [79, 1, 1], [82, 2, 1], [79, 3, 0.5], [73, 3.5, 0.5]],
];

const keys = [], bass = [], drums = [], vibes = [], strings = [], perc = [];

for (const c of timeline) {
  const s = c.start, d = c.duration;
  // Keys: held chords in the intro, the two-hit comp in A, dry offbeat stabs in B, a rolled turnaround chord
  if (c.section === "Intro") for (const p of c.keys) keys.push(n(p, s, d - 0.1, 58));
  else if (c.section === "B") {
    for (const p of c.keys) d === 4 ? keys.push(n(p, s + 1.5, 0.5, 70), n(p, s + 3, 0.75, 64)) : keys.push(n(p, s + 0.5, 1, 68));
  } else if (c.section === "Outro" && c.isLast) {
    for (const p of c.keys) keys.push(n(p, s, d - 0.1, 62));
    c.keys.forEach((p, i) => keys.push(n(p + 12, s + i * 0.25, d - 0.1 - i * 0.25, 50)));
  } else {
    const lift = c.section === "A'" ? 6 : c.section === "Outro" ? -6 : 0;
    for (const p of c.keys) keys.push(n(p, s, 1.5, 72 + lift), n(p, s + 2.5, 1.5, 64 + lift));
  }

  // Strings: sustain each chord, an octave up in B
  for (const p of c.strings) strings.push(n(c.section === "B" ? p + 12 : p, s, d, c.section === "B" ? 64 : 58));

  // Bass: two-feel in A, walking quarters in B, enters late in the intro
  const r = c.bass;
  if (c.section === "Intro") {
    if (c.start === 0) bass.push(n(r, s, 4, 66));
    if (c.name === "Cmaj9") bass.push(n(r, s, 4, 70));
    if (c.name === "Am9") bass.push(n(r, s, 3.5, 74), n(c.nextRoot - 1, s + 3.5, 0.5, 80));
  } else if (c.section === "B") {
    const down = c.nextRoot < r;
    const approach = down ? c.nextRoot + 1 : c.nextRoot - 1;
    // A half step or whole step down is too close to walk down to, so climb and drop in from below
    const walk = d === 2 ? [r, approach] : down && r - c.nextRoot <= 2 ? [r, r + c.third, r + 2, c.nextRoot - 1] : down ? [r, r - 2, r - 5, approach] : [r, r + c.third, r + 7, approach];
    walk.forEach((p, i) => bass.push(n(p, s + i, 0.9, i % 2 ? 82 : 96)));
  } else if (c.section === "Outro" && c.isLast) bass.push(n(r, s, 2, 90), n(r - 5, s + 2, 1, 80), n(r - 8, s + 3, 1, 84));
  else bass.push(n(r, s, 1.25, 100), n(r, s + 1.5, 0.5, 80), n(r + 7, s + 2, 1, 88), n(c.nextRoot - 1, s + 3.5, 0.5, 78));
}

// Vibes: melody plus a third or sixth below from the chord under each note
const placeMelody = (bars, start, velocity) =>
  bars.forEach((bar, i) =>
    bar.forEach(([p, at, d]) => {
      const beat = start + i * 4 + at;
      const tones = chordAt(beat).tones;
      const interval = [3, 4, 8, 9, 5, 7].find((k) => tones.includes((p - k + 120) % 12));
      vibes.push(n(p, beat, d, velocity), n(p - interval, beat, d, velocity - 16));
    }),
  );
// A soft landing on D for both the first play and the return from the outro's C#
placeMelody([[[74, 0, 4]]], 0, 72);
placeMelody(MELODY_A, 16, 92);
placeMelody(MELODY_B, 48, 94);
placeMelody(MELODY_A, 80, 96);
placeMelody(MELODY_OUTRO, 112, 88);

// Drums
const KICK = 36, SNARE = 38, STICK = 37, HAT = 42, PEDAL_HAT = 44, OPEN_HAT = 46, CRASH = 49, RIDE = 51;
const grooveA = (b, i, { full, last }) => {
  drums.push(n(KICK, b, 0.5, 110), n(KICK, b + 2.5, 0.5, 95), n(SNARE, b + 1, 0.5, 100), n(SNARE, b + 3, 0.5, 104));
  if (full || i % 2 === 1) drums.push(n(KICK, b + 1.75, 0.25, 80));
  for (let k = 0; k < 8; k++) {
    if (k === 7 && (last || (full && i % 2 === 1))) drums.push(n(OPEN_HAT, b + 3.5, 0.5, 85));
    else drums.push(n(HAT, b + k * 0.5, 0.25, k % 2 ? 55 : 80));
  }
};
drums.push(n(SNARE, 15, 0.25, 50), n(SNARE, 15.25, 0.25, 60), n(SNARE, 15.5, 0.25, 72), n(SNARE, 15.75, 0.25, 85));
barsOf("A").forEach((b, i) => grooveA(b, i, { full: false, last: i === 7 }));
drums.push(n(CRASH, 16, 2, 80), n(CRASH, 80, 2, 100));
barsOf("B").forEach((b, i) => {
  drums.push(n(KICK, b, 0.5, 95), n(PEDAL_HAT, b + 1, 0.25, 60), n(PEDAL_HAT, b + 3, 0.25, 60));
  if (i < 7) {
    drums.push(n(KICK, b + 2.5, 0.5, 85), n(STICK, b + 1, 0.25, 85), n(STICK, b + 3, 0.25, 85));
    for (const at of [0, 1, 1.5, 2, 3, 3.5]) drums.push(n(RIDE, b + at, 0.5, at % 1 ? 60 : 85));
  } else {
    drums.push(n(RIDE, b, 0.5, 85), n(RIDE, b + 1, 0.5, 85), n(STICK, b + 1, 0.25, 85));
    for (let k = 0; k < 8; k++) drums.push(n(SNARE, b + 2 + k * 0.25, 0.25, 50 + k * 7));
  }
});
barsOf("A'").forEach((b, i) => grooveA(b, i, { full: true, last: i === 7 }));
barsOf("Outro").slice(0, 2).forEach((b, i) => grooveA(b, i, { full: false, last: false }));
// Thin out to ride and side stick, then just a soft kick and hats, so the drumless intro follows on
drums.push(n(KICK, 120, 0.5, 85), n(STICK, 121, 0.25, 70), n(STICK, 123, 0.25, 70), n(KICK, 124, 0.5, 70));
for (const at of [0, 1, 1.5, 2, 3, 3.5]) drums.push(n(RIDE, 120 + at, 0.5, at % 1 ? 50 : 70));
for (let k = 0; k < 8; k++) drums.push(n(HAT, 124 + k * 0.5, 0.25, k % 2 ? 30 : 42));

// Percussion
const SHAKER = 82, MUTE_HI_CONGA = 62, OPEN_HI_CONGA = 63, LOW_CONGA = 64, TRIANGLE = 81, TAMBOURINE = 54;
const shaker16 = (b, scale = 1) => {
  for (let k = 0; k < 16; k++) perc.push(n(SHAKER, b + k * 0.25, 0.25, (k % 4 === 2 ? 72 : k % 2 ? 34 : 48) * scale));
};
const congas = (b, fill) => {
  perc.push(n(MUTE_HI_CONGA, b + 1, 0.25, 60), n(OPEN_HI_CONGA, b + 1.5, 0.5, 78), n(LOW_CONGA, b + 3, 0.5, 74), n(OPEN_HI_CONGA, b + 3.5, 0.5, 70));
  if (fill) perc.push(n(OPEN_HI_CONGA, b + 2.5, 0.25, 66), n(LOW_CONGA, b + 2.75, 0.25, 72), n(LOW_CONGA, b + 3.75, 0.25, 80));
};
perc.push(n(TRIANGLE, 0, 2, 60), n(TRIANGLE, 16, 2, 70), n(TRIANGLE, 80, 2, 75));
barsOf("Intro").slice(2).forEach((b) => shaker16(b, 0.6));
barsOf("A").forEach((b, i) => {
  shaker16(b);
  congas(b, i % 4 === 3);
});
barsOf("B").forEach((b) => {
  for (let k = 0; k < 8; k++) perc.push(n(SHAKER, b + k * 0.5, 0.5, k % 2 ? 65 : 40));
});
barsOf("A'").forEach((b, i) => {
  shaker16(b);
  congas(b, i % 4 === 3);
  perc.push(n(TAMBOURINE, b + 1, 0.25, 55), n(TAMBOURINE, b + 3, 0.25, 55));
});
barsOf("Outro").slice(0, 2).forEach((b, i) => {
  shaker16(b, 0.8);
  congas(b, i === 1);
});
for (let k = 0; k < 8; k++) perc.push(n(SHAKER, 120 + k * 0.5, 0.5, k % 2 ? 50 : 32));
// Shaker swells across the turnaround bar into the loop point
for (let k = 0; k < 16; k++) perc.push(n(SHAKER, 124 + k * 0.25, 0.25, 30 + k * 3));

// Flute: per section start, bar index -> [pitch, beat in bar, duration]. It fills the vibes'
// gaps and moves against them, so it stays out of their way rather than doubling them
const FLUTE_LINES = {
  0: {
    2: [[67, 2, 1], [71, 3, 1]],
    3: [[72, 0, 2], [71, 2, 0.5], [69, 2.5, 0.5], [67, 3, 1]],
  },
  16: {
    3: [[69, 1, 0.5], [71, 1.5, 0.5], [72, 2, 1], [67, 3, 1]],
    7: [[76, 2, 0.5], [74, 2.5, 0.5], [72, 3, 0.5], [71, 3.5, 0.5]],
  },
  48: {
    0: [[65, 0.5, 0.5], [69, 1, 0.5], [72, 1.5, 1.5], [69, 3, 1]],
    1: [[68, 0, 1.5], [64, 1.5, 0.5], [65, 2, 1], [68, 3, 1]],
    2: [[69, 0, 2], [67, 2, 1], [64, 3, 1]],
    3: [[65, 0, 1], [67, 1, 1], [64, 2, 1], [70, 3, 1]],
    4: [[69, 0, 2], [67, 2, 2]],
    5: [[65, 0, 2], [64, 2, 1], [62, 3, 1]],
    6: [[64, 0, 1], [67, 1, 1], [73, 2, 1], [76, 3, 1]],
    7: [[69, 0, 1], [72, 1, 1], [71, 2, 1], [74, 3, 1]],
  },
  80: {
    0: [[74, 0, 0.5], [69, 2, 2]],
    1: [[71, 0, 2], [67, 2, 1], [65, 3, 1]],
    2: [[64, 0, 2], [67, 2, 2]],
    3: [[69, 1, 0.5], [71, 1.5, 0.5], [72, 2, 0.5], [74, 2.5, 0.5], [79, 3, 0.5], [76, 3.5, 0.5]],
    4: [[65, 0, 2], [69, 2, 2]],
    5: [[71, 0, 2], [65, 2, 1], [67, 3, 1]],
    6: [[67, 0, 2], [74, 3, 0.5], [72, 3.5, 0.5]],
    7: [[72, 2, 0.5], [76, 2.5, 0.5], [74, 3, 0.5], [73, 3.5, 0.5]],
  },
  112: {
    0: [[65, 0, 4]],
    1: [[65, 0, 2], [71, 2, 2]],
    2: [[64, 0, 2], [67, 2, 2]],
    3: [[67, 0, 2], [70, 2, 1], [69, 3, 1]],
  },
};
const flute = Object.entries(FLUTE_LINES).flatMap(([start, bars]) =>
  Object.entries(bars).flatMap(([bar, line]) => line.map(([p, at, d]) => n(p, Number(start) + Number(bar) * 4 + at, d, 82))),
);
// Nudge a note that rubs against the vibes, or holds outside the chord, to the nearest chord
// tone that clears them, preferring below so the flute stays the lower voice
const sounding = (notes, start, end) => notes.filter((x) => x.start < end && start < x.start + x.duration);
for (const f of flute) {
  const end = f.start + f.duration;
  const vibesPitches = sounding(vibes, f.start, end).map((x) => x.pitch);
  // The bass counts only where the chord starts, since its walk passes through other notes
  const chordStart = sounding(strings, f.start, f.start + 0.01)[0]?.start ?? f.start;
  const tones = new Set([
    ...[strings, keys].flatMap((notes) => sounding(notes, f.start, f.start + 0.01).map((x) => x.pitch % 12)),
    ...sounding(bass, chordStart, chordStart + 0.01).map((x) => x.pitch % 12),
  ]);
  const clashes = (p) => vibesPitches.some((v) => Math.abs(v - p) <= 1);
  if (!clashes(f.pitch) && (f.duration < 1 || tones.has(f.pitch % 12))) continue;
  const to = [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5].map((k) => f.pitch + k).find((p) => p >= 62 && !clashes(p) && tones.has(p % 12));
  if (to !== undefined) f.pitch = to;
}

// Automation
const sustain = timeline
  .filter((c) => c.section !== "B")
  .flatMap((c) => [{ beat: c.start, value: 127 }, { beat: c.start + c.duration - 0.1, value: 0 }]);
const expression = timeline.flatMap((c) =>
  c.section === "Outro" && c.isLast
    ? ramp(70, 105, c.start, END)
    : [...ramp(60, 112, c.start, c.start + c.duration / 2), ...ramp(112, 80, c.start + c.duration / 2, c.start + c.duration)],
);
const vibrato = timeline.flatMap((c) => [...ramp(0, 50, c.start, c.start + c.duration * 0.75), { beat: c.start + c.duration - 0.25, value: 20 }]);
const vibesExpression = [{ beat: 0, value: 100 }, ...ramp(100, 120, 48, 64), ...ramp(120, 100, 72, 80), { beat: 80, value: 110 }, ...ramp(110, 90, 112, END)];
const controller = (number, points) => ({ type: "controller", controller: number, points });

const track = (name, preset, notes, mix, automation = []) => ({
  name,
  ...preset,
  notes: notes
    .slice()
    .sort((a, b) => a.start - b.start || a.pitch - b.pitch)
    .map(({ id, ...note }) => note),
  ...mix,
  automation,
});

const project = {
  title: "Late Night ii-V",
  comment: [
    "Lo-fi jazz in C at 88 BPM, 32 bars: Intro 4, A 8, B 8, A' 8, Outro 4.",
    "Intro: held EP chords and strings over the A changes, bass and shaker creep in, snare pickup.",
    "A: Dm9 G13 Cmaj9 Am9 twice. Two-hit EP comp with pedal, two-feel bass, hats and backbeat, congas, vibes melody in thirds and sixths.",
    "B (contrast): moves to F, Fmaj9 E7b9 Am9 Gm9-C13 Fmaj9 Bbmaj7#11 Em7-A7b9 Dm9-G13. Dry offbeat EP stabs, walking bass, ride and side stick, strings up an octave, eighth shaker only, long-tone melody peaking on E6, snare roll into A'.",
    "A': A again with more push: extra kicks, open hats, tambourine, crash, louder comp and vibes.",
    "Outro: Dm9 G13 Cmaj9, then an A7b9 turnaround: drums thin out, held rolled EP chord, strings and shaker swell, vibes climb to the b9 and step down to C#, which resolves to the D5 that opens the intro when the song loops.",
  ].join("\n"),
  tempo: 88,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { enabled: true, range: { startBeat: 0, endBeat: END } },
  locators: SECTIONS.map((s) => ({ beat: s.start, label: s.name })),
  midiTracks: [
    track("Keys", { program: 4 }, keys, { gain: 0.75, pan: -0.25 }, [controller(64, sustain)]),
    track("Bass", { program: 32 }, bass, { gain: 0.9, pan: 0 }),
    track("Drums", { program: 0, bank: 128 }, drums, { gain: 0.8, pan: 0 }),
    track("Vibes", { program: 11 }, vibes, { gain: 0.85, pan: 0.3 }, [controller(1, [{ beat: 0, value: 30 }]), controller(11, vibesExpression)]),
    track("Strings", { program: 48 }, strings, { gain: 0.5, pan: 0.1 }, [controller(11, expression), controller(1, vibrato)]),
    track("Percussion", { program: 0, bank: 128 }, perc, { gain: 0.6, pan: -0.35 }),
    track("Flute", { program: 73 }, flute, { gain: 0.6, pan: -0.3 }, [
      // Louder as its role grows from fills in A to a full second voice in A'
      controller(11, [{ beat: 0, value: 80 }, { beat: 16, value: 85 }, { beat: 48, value: 95 }, { beat: 80, value: 105 }, { beat: 112, value: 90 }]),
      controller(1, [{ beat: 0, value: 20 }]),
    ]),
  ],
};

writeFileSync(new URL("project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
