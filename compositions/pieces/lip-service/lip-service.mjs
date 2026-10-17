// "Lip Service": a pitch-bend and CC1 demo for Toy MIDI, a jump blues in B♭, 24 bars (two choruses)
// of swung 4/4 at 168 BPM.
//
// Usage: node lip-service.mjs <out dir>
// Writes v1-plain.json (no automation) and v2-expression.json (pitch bend on trumpet and saxes,
// CC1 terminal vibrato on the trumpet's last note). Both versions have the same notes and velocities.
//
// Form (bars):
// 1-12  Head. Trumpet riffs in bars 1, 3, 5, 7, 9 with scoops into the riff, a fall or a shake on
//       each riff's long note, and the alto, tenor, and bari section answering in bars 2, 4, 6, 8
//       with falls and doits. Bar 11 is a full-band turnaround hit that falls off together.
// 13-24 Trumpet solo over sax pads: an opening shake, a blue-note lip bend, a high B♭ with a long
//       fall, dense scooped 8ths, a second shake, and a scooped high B♭ held over the stop-time
//       ending with delayed CC1 vibrato until the final band hit, where the saxes fall off.
import fs from "node:fs";
import path from "node:path";

const [outDir] = process.argv.slice(2);
const BAR = 4;
const SWING = 0.64; // the swung 8th lands at 0.64 of the beat, a little lighter than triplet at this tempo
const END = 24 * BAR;

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const m = (n) => {
  const [, l, acc, o] = n.match(/^([A-G])([b#]?)(\d)$/);
  return 12 * (Number(o) + 1) + NOTE[l] + (acc === "#" ? 1 : acc === "b" ? -1 : 0);
};
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x)); // smoothstep
const easeIn = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x); // a fall or doit speeds up as it leaves
const clamp = (v) => Math.max(0, Math.min(127, Math.round(v)));
// a swung 8th position in a bar: k = 0..7
const at = (bar, k) => (bar - 1) * BAR + Math.floor(k / 2) + (k % 2 ? SWING : 0);

// --- harmony ---

// one or two chords per bar: [bar, beat offset, beats, symbol]
const CHORUS = [
  ["Bb7"], ["Bb7"], ["Bb7"], ["Bb7"],
  ["Eb7"], ["Eb7", "Edim7"], ["Bb7"], ["G7"],
  ["Cm7"], ["F7"], ["Bb7", "G7"], ["Cm7", "F7"],
];
const CHORDS = [...CHORUS, ...CHORUS].flatMap((syms, i) =>
  syms.map((sym, j) => ({ bar: i + 1, start: i * BAR + j * (BAR / syms.length), beats: BAR / syms.length, sym })),
);
const chordAt = (beat) => CHORDS.find((c) => beat >= c.start && beat < c.start + c.beats);

const ROOT = { Bb7: "Bb1", Eb7: "Eb2", Edim7: "E2", G7: "G1", Cm7: "C2", F7: "F1" };
// bass walking tones above the root, in semitones
const WALK = { Bb7: [0, 4, 7, 10], Eb7: [0, 4, 7, 10], Edim7: [0, 3, 6, 9], G7: [0, 4, 7, 10], Cm7: [0, 3, 7, 10], F7: [0, 4, 7, 10] };
// sax section voicings: [alto, tenor, bari]
const SAX = {
  Bb7: ["Ab4", "D4", "Bb2"],
  Eb7: ["G4", "Db4", "Eb3"],
  Edim7: ["G4", "Db4", "E3"],
  G7: ["F4", "B3", "G2"],
  Cm7: ["G4", "Eb4", "C3"],
  F7: ["A4", "Eb4", "F2"],
  Bb6: ["G4", "D4", "Bb2"],
};
// piano shells, third and seventh with a color tone on top
const PIANO = {
  Bb7: ["Ab3", "D4", "G4"],
  Eb7: ["G3", "Db4", "F4"],
  Edim7: ["G3", "Db4", "E4"],
  G7: ["F3", "B3", "E4"],
  Cm7: ["Eb3", "Bb3", "D4"],
  F7: ["Eb3", "A3", "D4"],
  Bb6: ["F3", "G3", "D4"],
};

// --- trumpet: [bar, k, pitch, beats, velocity, effects] ---
//
// effects: scoop (semitones below), fall, doit, shake, bend (lip bend up to the next note), vib

const T = [
  // bar 1
  [1, 0, "Bb4", 0.45, 96], [1, 1, "D5", 0.34, 100, { scoop: 1.5 }], [1, 2, "F5", 0.45, 104],
  [1, 3, "D5", 0.34, 96], [1, 4, "F5", 1.5, 110, { fall: 5 }],
  // bar 3
  [3, 0, "Bb4", 0.45, 96], [3, 1, "D5", 0.34, 100, { scoop: 1.5 }], [3, 2, "F5", 0.45, 104],
  [3, 3, "G5", 0.34, 102], [3, 4, "F5", 1.6, 112, { shake: true }],
  // bar 5, over Eb7
  [5, 0, "Bb4", 0.45, 96], [5, 1, "Db5", 0.34, 100, { scoop: 1.5 }], [5, 2, "Eb5", 0.45, 104],
  [5, 3, "Db5", 0.34, 96], [5, 4, "G5", 1.5, 112, { scoop: 2, fall: 6 }],
  // bar 7
  [7, 0, "Bb4", 0.45, 96], [7, 1, "D5", 0.34, 100, { scoop: 1.5 }], [7, 2, "F5", 0.45, 104],
  [7, 3, "D5", 0.34, 96], [7, 4, "F5", 1.5, 110, { fall: 5 }],
  // bars 9-10, Cm7 F7
  [9, 0, "C5", 0.45, 98], [9, 1, "Eb5", 0.34, 102, { scoop: 1.5 }], [9, 2, "G5", 0.45, 106],
  [9, 3, "Eb5", 0.34, 98], [9, 4, "G5", 1.0, 108], [9, 6, "Eb5", 0.45, 100], [9, 7, "C5", 0.3, 96],
  [10, 0, "F5", 0.45, 104, { scoop: 1 }], [10, 1, "Eb5", 0.34, 98], [10, 2, "C5", 0.45, 98],
  [10, 3, "A4", 0.34, 94], [10, 4, "C5", 1.5, 106, { doit: 4 }],
  // bars 11-12, turnaround hits with the section, then a run into the solo
  [11, 0, "D5", 0.4, 112], [11, 3, "D5", 0.3, 106], [11, 4, "F5", 1.4, 116, { fall: 6 }],
  [12, 0, "Eb5", 0.4, 110], [12, 4, "C5", 0.45, 96], [12, 5, "D5", 0.34, 100],
  [12, 6, "Eb5", 0.45, 104], [12, 7, "E5", 0.34, 106],
  // bar 13, the solo opens on a scooped, shaken F5
  [13, 0, "F5", 3.3, 116, { scoop: 2, shake: true }], [13, 7, "D5", 0.3, 98],
  // bar 14, Eb7: down the blues scale, falling off the Db
  [14, 0, "Eb5", 0.45, 104], [14, 1, "Db5", 0.34, 98], [14, 2, "C5", 0.45, 100], [14, 3, "Bb4", 0.34, 94],
  [14, 4, "G4", 0.45, 98], [14, 5, "Bb4", 0.34, 96], [14, 6, "Db5", 0.95, 106, { fall: 4 }],
  // bar 15: a lip bend from the blue third up to the major third
  [15, 1, "F4", 0.3, 90], [15, 2, "Bb4", 0.45, 96], [15, 3, "Db5", 1.25, 106, { bend: 1 }],
  [15, 6, "Bb4", 0.45, 96], [15, 7, "G4", 0.3, 90],
  // bar 16: climb to the top
  [16, 0, "Bb4", 1.3, 100, { scoop: 1.5 }], [16, 4, "F5", 0.45, 104], [16, 5, "F5", 0.34, 100],
  [16, 6, "Ab5", 0.45, 108], [16, 7, "A5", 0.34, 108],
  // bar 17, Eb7: high Bb with a long fall
  [17, 0, "Bb5", 2.5, 120, { scoop: 2, fall: 7, fallBeats: 1.1 }], [17, 6, "Db5", 0.45, 100], [17, 7, "Eb5", 0.34, 100],
  // bar 18, Eb7 to Edim7
  [18, 0, "Db5", 0.45, 102], [18, 1, "Bb4", 0.34, 96], [18, 2, "G4", 0.45, 96], [18, 3, "Bb4", 0.34, 96],
  [18, 4, "Db5", 0.45, 102], [18, 5, "E5", 0.34, 104], [18, 6, "G5", 0.95, 110, { doit: 4 }],
  // bar 19: dense scooped 8ths
  [19, 0, "F5", 0.45, 110, { scoop: 1.5 }], [19, 1, "D5", 0.34, 98], [19, 2, "F5", 0.45, 108, { scoop: 1.5 }],
  [19, 3, "D5", 0.34, 98], [19, 4, "F5", 0.45, 108, { scoop: 1.5 }], [19, 5, "D5", 0.34, 98],
  [19, 6, "Bb4", 0.45, 100], [19, 7, "G4", 0.34, 94],
  // bar 20, G7
  [20, 0, "B4", 0.95, 104, { scoop: 2 }], [20, 3, "D5", 0.3, 98], [20, 4, "F5", 1.5, 112, { fall: 5 }],
  // bar 21, Cm7: the second shake
  [21, 0, "G5", 2.9, 116, { scoop: 1.5, shake: true }], [21, 7, "F5", 0.3, 100],
  // bar 22, F7: run up to the last note
  [22, 0, "Eb5", 0.45, 104], [22, 1, "C5", 0.34, 98], [22, 2, "A4", 0.45, 98], [22, 3, "C5", 0.34, 100],
  [22, 4, "F5", 0.45, 106], [22, 5, "G5", 0.34, 108], [22, 6, "A5", 0.45, 110],
  // bars 23-24: scooped high Bb held to the final hit, with delayed vibrato
  [23, 0, "Bb5", 7.1, 118, { scoop: 2, vib: true }],
];
const trumpet = T.map(([bar, k, n, beats, velocity, fx = {}]) => ({ pitch: m(n), start: at(bar, k), duration: beats, velocity, fx }));

// --- sax section: answers in the head, pads in the solo, hits at the turnaround and the end ---
//
// [chord, start, beats, velocity, effects per voice]

const S = [];
const answer = (bar, fx) => {
  const sym = chordAt((bar - 1) * BAR).sym;
  S.push([sym, at(bar, 1), 0.3, 96], [sym, at(bar, 2), 0.3, 100], [sym, at(bar, 5), 1.2, 108, fx]);
};
answer(2, { doit: 4 });
answer(4, { fall: 5 });
S.push(["Eb7", at(6, 1), 0.3, 96], ["Eb7", at(6, 2), 0.3, 100], ["Edim7", at(6, 5), 1.2, 108, { doit: 3 }]);
answer(8, { fall: 5 });
S.push(["F7", at(10, 1), 0.3, 90], ["F7", at(10, 5), 0.3, 92]);
// turnaround hits with the trumpet
S.push(["Bb7", at(11, 0), 0.4, 108], ["Bb7", at(11, 3), 0.3, 102], ["G7", at(11, 4), 1.4, 112, { fall: 6 }]);
S.push(["Cm7", at(12, 0), 0.4, 106], ["F7", at(12, 4), 1.9, 88]);
// soft pads under the solo, one per chord
for (const c of CHORDS.filter((c) => c.bar >= 13 && c.bar <= 22)) S.push([c.sym, c.start + 0.02, c.beats - 0.1, 66]);
// the stop-time ending: a hit on bar 23, then the final hit falls off
S.push(["Bb7", at(23, 0), 0.4, 108], ["Bb6", at(24, 6), 0.9, 112, { fall: 5, fallBeats: 0.6 }]);

const saxVoice = (i) =>
  S.map(([sym, start, duration, velocity, fx = {}]) => ({ pitch: m(SAX[sym][i]), start, duration, velocity, fx }));
const saxes = [0, 1, 2].map(saxVoice);

// --- piano: Charleston comping, no pedal ---

const piano = [];
for (const c of CHORDS) {
  if (c.bar >= 23) continue;
  const hits = c.beats === 4 ? [[0, 0.32, 74], [1 + SWING, 0.3, 68], [2, 0.32, 70], [3 + SWING, 0.3, 66]] : [[0, 0.32, 74], [1 + SWING, 0.3, 68]];
  for (const [off, dur, vel] of hits) for (const n of PIANO[c.sym]) piano.push({ pitch: m(n), start: c.start + off, duration: dur, velocity: vel });
}
for (const [beat, sym] of [[at(23, 0), "Bb7"], [at(24, 6), "Bb6"]])
  for (const n of PIANO[sym]) piano.push({ pitch: m(n), start: beat, duration: sym === "Bb6" ? 1 : 0.4, velocity: 92 });

// --- bass: walking quarters, chromatic approach into each chord ---

const bass = [];
CHORDS.forEach((c, i) => {
  if (c.bar >= 23) return;
  const next = CHORDS[i + 1];
  const root = m(ROOT[c.sym]);
  const nextRoot = m(ROOT[next.sym]);
  const walk = WALK[c.sym];
  const up = c.bar % 2 === 1;
  const tones =
    c.beats === 4
      ? up
        ? [root, root + walk[1], root + walk[2], nextRoot - 1]
        : [root + 12, root + walk[3], root + walk[2], nextRoot + 1]
      : [root, nextRoot + (up ? -1 : 1)];
  tones.forEach((pitch, j) => bass.push({ pitch, start: c.start + j, duration: 0.9, velocity: j === 0 ? 96 : 86 }));
});
bass.push({ pitch: m("Bb1"), start: at(23, 0), duration: 0.5, velocity: 100 });
bass.push({ pitch: m("Bb1"), start: at(24, 6), duration: 1, velocity: 104 });

// --- drums: ride shuffle, backbeat, feathered kick, fills into each chorus, cymbal roll on the ending ---

const KICK = 36, SNARE = 38, PEDAL_HAT = 44, RIDE = 51, CRASH = 49;
const drums = [];
const hit = (pitch, start, velocity, duration = 0.25) => drums.push({ pitch, start, duration, velocity });
for (let bar = 1; bar <= 22; bar++) {
  const b = (bar - 1) * BAR;
  for (let beat = 0; beat < 4; beat++) {
    hit(RIDE, b + beat, beat % 2 ? 92 : 80);
    hit(RIDE, b + beat + SWING, 62);
    hit(KICK, b + beat, beat % 2 ? 50 : 62);
    if (beat % 2) {
      hit(SNARE, b + beat, 96);
      hit(PEDAL_HAT, b + beat, 70);
    } else hit(SNARE, b + beat + SWING, 34); // ghost
  }
}
hit(CRASH, 0, 104, 2);
hit(CRASH, at(13, 0), 112, 2);
// triplet fills on beats 3-4 of bars 12 and 22
for (const bar of [12, 22])
  for (let i = 0; i < 6; i++) hit(SNARE, (bar - 1) * BAR + 2 + i / 3, 70 + i * 7);
// ending: crash and kick on bar 23, a ride roll that grows into the final hit
hit(CRASH, at(23, 0), 114, 2);
hit(KICK, at(23, 0), 100);
for (let t = at(23, 1); t < at(24, 6) - 0.01; t += 1 / 6) hit(RIDE, t, clamp(44 + 56 * ((t - at(23, 1)) / (at(24, 6) - at(23, 1)))), 0.2);
hit(CRASH, at(24, 6), 120, 3);
hit(KICK, at(24, 6), 110);
hit(SNARE, at(24, 6), 110);

// --- pitch bend and CC1 from the note effects ---

const SHAKE_HZ = 7;
const TEMPO = 168;
const shakeCycle = (60 / TEMPO) * SHAKE_HZ; // cycles per beat, about 2.5

// the bend of one note at a beat inside it, in semitones
const noteBend = (note, beat) => {
  const { start, duration, fx } = note;
  const t = beat - start;
  const end = start + duration;
  let s = 0;
  if (fx.scoop) {
    const len = fx.scoop > 1.5 ? 0.3 : 0.22; // a big scoop takes a little longer to land
    s -= fx.scoop * (1 - ease(t / len));
  }
  if (fx.bend) s += fx.bend * ease((t - 0.15) / (duration * 0.5));
  if (fx.shake) {
    // alternate the written note and about a whole step above, dwelling at each end,
    // fading in after the attack and out before the note ends
    const from = 0.3;
    const until = duration - 0.25;
    const depth = ease((t - from) / 0.35) * (1 - ease((t - until) / 0.2));
    const wave = Math.sin(2 * Math.PI * shakeCycle * (t - from) - Math.PI / 2);
    s += depth * (1 + Math.sign(wave) * Math.abs(wave) ** 0.6);
  }
  if (fx.fall) {
    const len = fx.fallBeats ?? Math.min(0.7, duration * 0.45);
    s -= fx.fall * easeIn((beat - (end - len)) / len);
  }
  if (fx.doit) {
    const len = Math.min(0.5, duration * 0.4);
    s += fx.doit * easeIn((beat - (end - len)) / len);
  }
  return s;
};

const STEP = 1 / 32; // finer than the 1/32-note rule, because the player steps between points and a shake needs it
const bendCurve = (notes) => {
  const points = [];
  let last = 0;
  const push = (beat, semitones) => {
    const v = Math.round(semitones * 100) / 100;
    if (v !== last) points.push({ beat: Math.round(beat * 10000) / 10000, semitones: v });
    last = v;
  };
  const sorted = [...notes].sort((a, b) => a.start - b.start);
  sorted.forEach((note, i) => {
    const { fx } = note;
    if (!fx.scoop && !fx.fall && !fx.doit && !fx.shake && !fx.bend) return;
    const next = sorted[i + 1];
    const end = note.start + note.duration;
    for (let beat = note.start; beat < end - 1e-9; beat += STEP) push(beat, noteBend(note, beat));
    push(end - 1e-6, noteBend(note, end));
    // return to 0 after the release, or when the next note starts if that's sooner
    push(Math.min(end + 0.12, next ? next.start : end + 0.12), 0);
  });
  return points;
};

const vibCurve = (notes) => {
  const note = notes.find((n) => n.fx.vib);
  const points = [{ beat: 0, value: 0 }];
  let last = 0;
  const end = note.start + note.duration;
  for (let beat = note.start; beat <= end; beat += 0.125) {
    // still for a beat and a half, then ease in over about two beats, deepening slightly toward the cutoff
    const t = beat - note.start;
    const value = clamp(52 * ease((t - 1.5) / 2) + 10 * ease((t - 4) / 3));
    if (value !== last) points.push({ beat, value });
    last = value;
  }
  points.push({ beat: end + 0.25, value: 0 });
  return points;
};

// --- project ---

const track = (name, program, gain, pan, notes, extra = {}) => ({
  name,
  program,
  ...extra,
  notes: notes.map(({ pitch, start, duration, velocity }) => ({
    pitch,
    start: Math.round(start * 10000) / 10000,
    duration: Math.round(duration * 10000) / 10000,
    velocity,
  })),
  muted: false,
  soloed: false,
  gain,
  pan,
});

const project = (version, shaped) => {
  const bend = (notes) => (shaped ? { automation: [{ type: "pitch-bend", points: bendCurve(notes) }] } : {});
  return {
    title: `Lip Service ${version}`,
    comment:
      "A pitch-bend and CC1 demo, a 24-bar jump blues in Bb at 168 BPM, swung. Bars 1-12 are the head: " +
      "trumpet riffs with scoops, falls, and a shake, answered by a sax section that falls and doits together. " +
      "Bars 13-24 are a trumpet solo with shakes, a blue-note lip bend, a long fall off a high Bb, and a held " +
      "high Bb with delayed vibrato over the stop-time ending. " +
      (shaped
        ? "This is the expressive version, with pitch bend on the trumpet and saxes and CC1 on the trumpet's last note."
        : "This is the plain version, with the same notes and velocities and no automation."),
    tempo: TEMPO,
    timeSignature: { numerator: 4, denominator: 4 },
    masterGain: 1,
    locators: [
      { id: "head", beat: 0, label: "Head" },
      { id: "turnaround", beat: at(11, 0), label: "Turnaround" },
      { id: "solo", beat: at(13, 0), label: "Trumpet solo" },
      { id: "ending", beat: at(23, 0), label: "Ending" },
    ],
    midiTracks: [
      {
        ...track("Trumpet", 56, 0.8, 0.05, trumpet),
        ...(shaped ? { automation: [{ type: "pitch-bend", points: bendCurve(trumpet) }, { type: "controller", controller: 1, points: vibCurve(trumpet) }] } : {}),
      },
      { ...track("Alto Sax", 65, 0.62, -0.25, saxes[0]), ...bend(saxes[0]) },
      { ...track("Tenor Sax", 66, 0.68, -0.4, saxes[1]), ...bend(saxes[1]) },
      { ...track("Bari Sax", 67, 0.68, -0.55, saxes[2]), ...bend(saxes[2]) },
      track("Piano", 0, 0.45, 0.4, piano),
      track("Bass", 32, 0.62, 0, bass),
      track("Drums", 0, 0.6, 0.2, drums, { bank: 128 }),
    ],
    loop: { enabled: false, range: { startBeat: 0, endBeat: END } },
  };
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "v1-plain.json"), JSON.stringify(project("v1 (plain)", false), null, 2) + "\n");
fs.writeFileSync(path.join(outDir, "v2-expression.json"), JSON.stringify(project("v2 (expression)", true), null, 2) + "\n");
