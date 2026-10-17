// Glass Hook as a looping demo in E minor, 90 BPM, half-time trap feel.
//
// Usage: node demo.mjs <out project.json>
//
// Form (bars): Intro 4 | A 8 | B 8 | A' 8, looped whole.
// - Intro: Rhodes arpeggiates the A chords alone over 8th hats, a snare build into A.
// - A: the v2 hook twice over the trap groove, sub bass, Rhodes stabs locked to the bass,
//   and vibraphone shimmer above the guitar.
// - B: Am9 Bm7 Cmaj7 D6 | Am9 Bm7 Cmaj7 B7. A calmer, 8th-paced guitar melody that reuses
//   the hook's two designed bends (B15 D5 to E5, e12 E5 to F#5) and adds G14 A4 to B4.
//   Drums thin to 8th hats and a soft shaker, a tom fill closes it. The Rhodes breaks the
//   chords in a 3+3+2 16th phrase on the first pass and holds half notes on the second.
//   On the last bar (B7) the bass climbs the chord in quarters with a crescendo into A'.
//   On the second pass, guitar 2 harmonizes the held notes a diatonic third below as an inner
//   voice, bending with the melody by whatever interval keeps it in key.
// - A': A again with a crash on the downbeat.
//   Guitar 2 is a separately played take on its own track (pitch bend is channel-wide), about
//   14 ms late with its own jitter, panned away from the lead. It doubles the chordal hook bars
//   in unison and harmonizes the even-bar runs a diatonic third below, so the lead stays on top.
// A' back to the Intro is a dovetail: in A's last bar the band falls away (one kick, the bass
// holds the root, the intro's hats and rim) and the Rhodes already starts the intro arpeggio,
// so the loop continues a running figure.
// The lead is written from the fretboard as [string, fret]. Notes ring until their string
// replays, and any legato or bent note cuts the other strings (pitch bend is channel-wide).
// Toy MIDI plays GM programs and ignores the bends. Renders map the lead to a FlameStudios font.
import fs from "node:fs";

const output = process.argv[2];
const TEMPO = 90;
const ms = (x) => (x * TEMPO) / 60000;
const rng = (seed) => (a) => (((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1) * a;
const jit = rng(11);
const jit2 = rng(29); // the double's own hands, so the lead's timing stays as in v3
const jit3 = rng(47); // the harmony's own hands, so the double stays as in v4
const jit4 = rng(53); // the A' run harmony's own hands, so the unison bars stay as in v4
const jitD = rng(61); // drums and keys have their own streams, so backing changes leave the guitars alone
const jitK = rng(67);
const OPEN = { D: 50, G: 55, B: 59, e: 64 };
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (n) => {
  const [, l, acc, o] = n.match(/^([A-G])(#?)(\d)$/);
  return 12 * (Number(o) + 1) + NOTE[l] + (acc ? 1 : 0);
};

// --- lead: [position in 16ths, string, fret, extra]; extra: art (h, p, b, r), bend, vel ---

const S = (beat, i) => beat * 4 + (i * 4) / 6; // i-th sextuplet of a beat
const ARP_C = [["G", 9], ["B", 8], ["e", 7], ["B", 8], ["G", 9], ["B", 8], ["e", 7]];
const ARP_E = [["G", 9], ["B", 7], ["e", 7], ["B", 7], ["G", 9], ["B", 7], ["e", 7]];
const hook = (arp) => [
  ...arp.map(([s, f], i) => [i, s, f, { vel: i % 4 === 0 ? 88 : 76 }]),
  [7, "e", 10, { vel: 84 }],
  [8, "B", 15, { art: "b", bend: 2, vel: 92 }],
  [10, "B", 15, { art: "r" }],
  [11, "B", 12, { art: "p" }],
  [12, "G", 14, { vel: 80 }],
  [13, "G", 12, { art: "p" }],
  [14, "G", 11, { art: "p" }],
];
const HOOK = [
  hook(ARP_C),
  [
    [S(0, 0), "e", 10, { vel: 90 }], [S(0, 1), "e", 8, { art: "p" }], [S(0, 2), "e", 7, { art: "p" }],
    [S(0, 3), "B", 10, { vel: 82 }], [S(0, 4), "B", 8, { art: "p" }], [S(0, 5), "B", 7, { art: "p" }],
    [4, "G", 9, { vel: 80 }], [5, "G", 7, { art: "p" }],
    [6, "B", 7, { vel: 84 }],
    [8, "B", 10, { vel: 86 }], [9, "B", 12, { art: "h" }], [10, "B", 10, { art: "p" }],
    [12, "e", 10, { vel: 84 }],
    [15, "B", 8, { vel: 78 }],
  ],
  hook(ARP_E),
  [
    [S(0, 0), "G", 11, { vel: 88 }], [S(0, 1), "G", 14, { art: "h" }],
    [S(0, 2), "B", 12, { vel: 80 }], [S(0, 3), "B", 15, { art: "h" }],
    [S(0, 4), "e", 12, { vel: 84 }], [S(0, 5), "e", 14, { art: "h" }],
    [4, "e", 12, { art: "b", bend: 2, vel: 94 }],
    [6, "e", 12, { art: "r" }],
    [7, "e", 10, { art: "p" }],
    [8, "B", 12, { vel: 84 }],
    [12, "G", 14, { vel: 80 }], [13, "G", 11, { art: "p" }],
  ],
];
// B melody: mostly 8ths, falling from E5 and climbing back through the hook's bends.
const B_AM = [
  [0, "e", 12, { vel: 90 }], [3, "e", 10, { art: "p" }], // E5 D5
  [4, "B", 13, { vel: 80 }], [6, "B", 12, { art: "p" }], // C5 B4
  [8, "G", 14, { vel: 82 }], // A4, rings
  [12, "B", 12, { vel: 76 }], [14, "B", 13, { art: "h" }], // B4 C5
];
const B_BM = [
  [0, "B", 15, { art: "b", bend: 2, vel: 92 }], [3, "B", 15, { art: "r" }], // D5 bent to E5, released
  [4, "B", 12, { art: "p" }], // B4
  [6, "G", 14, { vel: 80 }], // A4
  [8, "e", 14, { vel: 88 }], [11, "e", 12, { art: "p" }], // F#5 E5
  [12, "B", 15, { vel: 82 }], // D5, rings
];
const B_C = [
  [0, "e", 15, { vel: 92 }], [2, "e", 14, { art: "p" }], [3, "e", 12, { art: "p" }], // G5 F#5 E5
  [4, "B", 13, { vel: 80 }], [6, "B", 12, { art: "p" }], // C5 B4
  [8, "G", 12, { vel: 78 }], // G4, rings
  [10, "B", 12, { vel: 80 }], // B4, rings
  [12, "e", 12, { vel: 86 }], // E5, rings
];
const B_D = [
  [0, "G", 14, { art: "b", bend: 2, vel: 90 }], [3, "G", 14, { art: "r" }], [4, "G", 12, { art: "p" }], // A4 bent to B4, A4, G4
  [6, "B", 15, { vel: 84 }], // D5, rings
  [8, "e", 14, { vel: 88 }], [12, "e", 12, { art: "p" }], // F#5 E5
];
const B_B7 = [
  [0, "e", 14, { vel: 90 }], [2, "e", 11, { art: "p" }], // F#5 D#5
  [4, "B", 12, { vel: 82 }], // B4, rings
  [6, "G", 14, { vel: 80 }], // A4, rings
  [8, "e", 12, { art: "b", bend: 2, vel: 94 }], [11, "e", 12, { art: "r" }], [12, "e", 11, { art: "p" }], // E5 bent to F#5, E5, D#5
];
// Guitar 2 in B's second pass: a third below the melody's held notes (melody in comments),
// so the lead stays the top voice.
const H_AM = [
  [0, "B", 13, { vel: 82 }], // C5 under E5
  [8, "G", 11, { vel: 76 }], // F#4 under A4
  [14, "G", 14, { vel: 78 }], // A4 under C5
];
const H_BM = [
  [0, "B", 12, { art: "b", bend: 1, vel: 86 }], [3, "B", 12, { art: "r" }], [4, "B", 8, { art: "p" }], // B4 bent a half step to C5, B4, G4 under D5-E5, D5, B4
  [8, "B", 15, { vel: 82 }], [11, "B", 13, { art: "p" }], // D5 C5 under F#5 E5
  [12, "B", 12, { vel: 78 }], // B4 under D5
];
const H_C = [
  [0, "e", 12, { vel: 86 }], [2, "e", 10, { art: "p" }], [3, "e", 8, { art: "p" }], // E5 D5 C5 under G5 F#5 E5
  [12, "B", 13, { vel: 78 }], // C5 under E5
];
const H_B7 = [
  [0, "e", 11, { vel: 84 }], [2, "e", 7, { art: "p" }], // D#5 B4 under F#5 D#5
  [4, "G", 11, { vel: 78 }], // F#4 under B4 (a fourth, the chord's 5th)
  [8, "B", 12, { art: "b", bend: 2, vel: 88 }], [11, "B", 12, { art: "r" }], // B4 bent to C#5 (the 9th), B4 under E5-F#5, E5
  [12, "G", 11, { vel: 76 }], // F#4 under D#5
];
// Guitar 2 in A's even bars: the runs a diatonic third below (lead in comments).
const H_RUN_D = [
  [S(0, 0), "B", 12, { vel: 86 }], [S(0, 1), "B", 10, { art: "p" }], [S(0, 2), "B", 8, { art: "p" }], // B4 A4 G4 under D5 C5 B4
  [S(0, 3), "G", 11, { vel: 78 }], [S(0, 4), "G", 9, { art: "p" }], [S(0, 5), "G", 7, { art: "p" }], // F#4 E4 D4 under A4 G4 F#4
  [4, "D", 10, { vel: 76 }], [5, "D", 9, { art: "p" }], // C4 B3 under E4 D4
  [6, "G", 7, { vel: 80 }], // D4 under F#4
  [8, "G", 11, { vel: 82 }], [9, "G", 12, { art: "h" }], [10, "G", 11, { art: "p" }], // F#4 G4 F#4 under A4 B4 A4
  [12, "B", 12, { vel: 80 }], // B4 under D5
  [15, "G", 9, { vel: 74 }], // E4 under G4
];
const H_RUN_B = [
  [S(0, 0), "D", 12, { vel: 84 }], [S(0, 1), "D", 16, { art: "h" }], // D4 F#4 under F#4 A4
  [S(0, 2), "G", 12, { vel: 76 }], [S(0, 3), "G", 16, { art: "h" }], // G4 B4 under B4 D5
  [S(0, 4), "B", 13, { vel: 80 }], [S(0, 5), "B", 15, { art: "h" }], // C5 D5 under E5 F#5
  [4, "B", 13, { art: "b", bend: 2, vel: 90 }], // C5 bent to D5 under E5 bent to F#5
  [6, "B", 13, { art: "r" }], // C5 under E5
  [7, "B", 12, { art: "p" }], // B4 under D5
  [8, "G", 12, { vel: 80 }], // G4 under B4
  [12, "D", 16, { vel: 76 }], [13, "D", 12, { art: "p" }], // F#4 D4 under A4 F#4
];

// --- harmony ---

const CH = {
  Cmaj7: { root: "C2", rh: ["E3", "G3", "B3", "D4"], pad: ["C3", "G3", "B3", "E4"], vib: ["B5", "G5"] },
  D6: { root: "D2", rh: ["F#3", "A3", "B3", "D4"], pad: ["D3", "A3", "B3", "F#4"], vib: ["A5", "F#5"] },
  Em9: { root: "E2", rh: ["F#3", "G3", "B3", "D4"], pad: ["E3", "B3", "D4", "F#4"], vib: ["F#5", "D5"] },
  Bm7: { root: "B1", rh: ["D3", "F#3", "A3", "B3"], pad: ["B2", "F#3", "A3", "D4"], vib: ["D6", "A5"] },
  Am9: { root: "A1", rh: ["C3", "E3", "G3", "B3"], pad: ["A2", "E3", "G3", "C4"], vib: ["B5", "E5"] },
  B7: { root: "B1", rh: ["D#3", "F#3", "A3", "B3"], pad: ["B2", "F#3", "A3", "D#4"], vib: ["F#5", "D#5"] },
};
const A_CHORDS = ["Cmaj7", "D6", "Em9", "Bm7"];
const BARS = [
  ...A_CHORDS.map((c) => ({ sec: "intro", c })),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ sec: "A", c: A_CHORDS[i % 4], lead: HOOK[i % 4] })),
  ...[
    ["Am9", B_AM], ["Bm7", B_BM], ["Cmaj7", B_C], ["D6", B_D],
    ["Am9", B_AM], ["Bm7", B_BM], ["Cmaj7", B_C], ["B7", B_B7],
  ].map(([c, lead], i) => ({ sec: "B", c, lead, harm: [H_AM, H_BM, H_C, H_B7][i - 4] })),
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ sec: "A2", c: A_CHORDS[i % 4], lead: HOOK[i % 4], run: [, H_RUN_D, , H_RUN_B][i % 4] })),
];

const lead = [], gtr2 = [], keys = [], pad = [], vibes = [], bass = [], drums = [];
const hit = (pitch, start, velocity, duration = 0.2) => drums.push({ pitch, start, duration, velocity: Math.round(velocity + jitD(4)) });

BARS.forEach(({ sec, c, lead: line, harm, run }, bar) => {
  const b0 = bar * 4;
  const ch = CH[c];
  const first = bar === 0 || BARS[bar - 1].sec !== sec; // first bar of a section
  const last = bar === BARS.length - 1 || BARS[bar + 1].sec !== sec;
  const n = BARS.filter((x, i) => i < bar && x.sec === sec).length; // bar index within the section
  const tail = sec === "A2" && last; // the intro's texture starts here, under the hook's last bar
  const climb = sec === "B" && last; // the bass climbs the B7 into A' (a pre-chorus build)

  // The double also varies its bend times. The lead keeps v3's fixed ones and random stream.
  const play = (part, out, j, lateMs, dVel, bendJit = 0) => {
    for (const [pos, string, fret, x] of part ?? []) {
      const start = Math.max(0, b0 + pos / 4 + ms(lateMs + j(3)));
      const pitch = OPEN[string] + fret;
      const note = { pitch: x.art === "b" ? pitch + x.bend : pitch, start, duration: 0, velocity: Math.round((x.vel ?? 70) + dVel + j(3)), string };
      if (x.art) note.art = x.art;
      if (x.art === "b") Object.assign(note, { bend: x.bend, bendMs: 90 + (bendJit && j(bendJit)) });
      if (x.art === "r") note.bendMs = 70 + (bendJit && j(bendJit));
      out.push(note);
    }
  };
  play(line, lead, jit, 0, 0);
  if (sec === "A2" && !run) play(line, gtr2, jit2, 14, -4, 10);
  play(run, gtr2, jit4, 14, -4, 10);
  play(harm, gtr2, jit3, 0, 0, 10);

  ch.pad.forEach((p) => pad.push({ pitch: midi(p), start: b0, duration: 3.95, velocity: sec === "B" ? 56 : 48 }));

  // Rhodes: 8th arpeggio in the intro, stabs locked to the bass in A, in B a broken-chord
  // phrase (3+3+2 16ths per half bar, notes left ringing) on the first pass, then half notes
  const rh = ch.rh.map(midi);
  if (sec === "intro" || tail) {
    [0, 1, 2, 3, 2, 1, 2, 3].forEach((k, i) =>
      keys.push({ pitch: rh[k], start: Math.max(0, b0 + i / 2 + ms(jitK(4))), duration: 0.9, velocity: Math.round((i % 2 ? 50 : 60) + jitK(3)) }),
    );
  } else if (sec === "B" && n < 4) {
    [[0, 0, 62], [3, 2, 52], [6, 3, 56], [8, 1, 58], [11, 3, 50], [14, 2, 54]].forEach(([s16, k, v]) =>
      keys.push({ pitch: rh[k], start: b0 + s16 / 4 + ms(jitK(4)), duration: 1.6 - (s16 % 8) / 8, velocity: Math.round(v + jitK(3)) }),
    );
  } else if (sec === "B") {
    [0, 2].forEach((t) => rh.forEach((p, k) => keys.push({ pitch: p, start: b0 + t + ms(k * 6), duration: 1.9, velocity: t ? 50 : 58 })));
  } else {
    [[0, 1.4, 60], [1.75, 0.2, 48], [2.5, 1.3, 54]].forEach(([t, d, v]) =>
      rh.forEach((p, k) => keys.push({ pitch: p, start: b0 + t + ms(k * 5), duration: d, velocity: v })),
    );
  }

  // vibraphone shimmer above the guitar in both A sections
  if (sec === "A" || sec === "A2") ch.vib.forEach((p, k) => vibes.push({ pitch: midi(p), start: b0 + k * 2, duration: 1.8, velocity: 54 }));

  // sub bass: root on 1, a push on the "a" of 2, root on 3 (not in the intro)
  const root = midi(ch.root);
  if (climb) [0, 4, 7, 10].forEach((iv, i) => bass.push({ pitch: root + iv, start: b0 + i, duration: 0.95, velocity: 92 + i * 5 }));
  else if (sec !== "intro")
    (tail ? [[0, 3.9]] : [[0, 1.5], [1.75, 0.25], [2.5, 1.4]]).forEach(([t, d]) => bass.push({ pitch: root, start: b0 + t, duration: d, velocity: 96 }));

  // drums
  if (first && sec !== "intro") hit(49, b0, 96, 1);
  if (tail) hit(36, b0, 100);
  if (sec === "intro" || tail) {
    for (let e = 0; e < 8; e++) hit(42, b0 + e / 2, e % 2 ? 40 : 55, 0.1);
    hit(37, b0 + 2, 60);
    if (sec === "intro" && last) for (let s = 8; s < 16; s++) hit(38, b0 + s / 4, 40 + (s - 8) * 8, 0.1); // snare build into A
  } else if (sec === "B") {
    [0, 6].forEach((s) => hit(36, b0 + s / 4, 100));
    hit(39, b0 + 2, 96);
    for (let e = 0; e < 8; e++) hit(42, b0 + e / 2, e % 2 ? 46 : 62, 0.1);
    for (let s = 0; s < 16; s++) hit(70, b0 + s / 4, s % 2 ? 32 : 44, 0.1);
    if (last) [[10, 50], [11, 50], [12, 47], [13, 47], [14, 45], [15, 45]].forEach(([s, p]) => hit(p, b0 + s / 4, 70 + s * 2)); // tom fill
  } else {
    [0, 6, 11].forEach((s) => hit(36, b0 + s / 4, 104));
    hit(39, b0 + 2, 100);
    hit(38, b0 + 2, 70);
    if (n % 2 === 1) hit(46, b0 + 3.5, 58, 0.4); // open hat into the next bar
    for (let s = 0; s < 16; s++) {
      if (n % 2 === 1 && s === 14) continue;
      const roll = n % 2 === 1 && s >= 12 ? 2 : 1;
      for (let k = 0; k < roll; k++) hit(42, b0 + s / 4 + k / 8, (s % 2 ? 50 : 70) - k * 10, 0.1);
    }
  }
});

// Each guitar note rings until its string plays again, or until any legato or bent note.
for (const part of [lead, gtr2]) {
  part.forEach((n, i) => {
    let end = n.start + 2;
    for (const m of part.slice(i + 1)) {
      if (m.string === n.string || m.art) {
        end = Math.min(end, m.start);
        break;
      }
    }
    n.duration = end - n.start;
  });
  part.forEach((n) => delete n.string);
}

const track = (name, program, notes, gain, pan, extra = {}) => ({ name, program, notes, muted: false, soloed: false, gain, pan, ...extra });
const beats = BARS.length * 4;
fs.writeFileSync(
  output,
  JSON.stringify({
    title: "Glass Hook v12 (bass climb into A')",
    comment: "Glass Hook grown into a looping demo in E minor, 90 BPM: Intro (Rhodes alone), A (the hook over the trap groove, with vibraphone above), B (Am9 Bm7 Cmaj7 D6 | Am9 Bm7 Cmaj7 B7, a calmer guitar melody with the same designed bends, harmonized a third below on the second pass), A' (a second guitar doubles the hook's arpeggio bars and harmonizes its runs a third below). Toy MIDI plays the notes without the bends.",
    tempo: TEMPO,
    timeSignature: { numerator: 4, denominator: 4 },
    masterGain: 0.9,
    locators: [
      { id: "intro", beat: 0, label: "Intro" },
      { id: "a", beat: 16, label: "A" },
      { id: "b", beat: 48, label: "B" },
      { id: "a2", beat: 80, label: "A'" },
    ],
    midiTracks: [
      track("Lead guitar", 27, lead, 0.8, -0.2),
      track("Guitar 2", 27, gtr2, 0.48, 0.4),
      track("Rhodes", 4, keys, 0.8, -0.25),
      track("Vibraphone", 11, vibes, 0.55, -0.4),
      track("Pad", 89, pad, 0.3, -0.1),
      track("Sub bass", 38, bass, 0.7, 0),
      track("Drums", 0, drums, 0.7, 0, { bank: 128 }),
    ],
    loop: { enabled: true, range: { startBeat: 0, endBeat: beats } },
  }),
);
console.log({ bars: BARS.length, lead: lead.length, gtr2: gtr2.length });
