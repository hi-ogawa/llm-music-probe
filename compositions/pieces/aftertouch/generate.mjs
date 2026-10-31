// Writes project.json, a Toy MIDI SharedProject. Run with `node generate.mjs`.
import { writeFileSync } from "node:fs";

const BAR = 4;
const LENGTH = 16 * BAR;

// Harmony, one entry per bar. A bar with `split` changes chord at beat 2.
// `low` is the open voicing under the pad, `high` the close voicing under the lead.
const bars = [
  // A
  { name: "Cm9", bass: 36, low: [48, 55, 63], high: [60, 62, 67] },
  { name: "Abmaj7#11", bass: 44, low: [44, 51, 55], high: [60, 63, 67] },
  { name: "Eb/Bb", bass: 46, low: [46, 51, 55], high: [58, 62, 67] },
  { name: "Bbsus4 Bb", bass: 46, low: [46, 51, 53], high: [58, 63, 65], split: { low: [46, 50, 53], high: [58, 62, 65] } },
  { name: "Cm9", bass: 36, low: [48, 55, 58], high: [62, 63, 67] },
  { name: "Abmaj7#11", bass: 44, low: [44, 51, 55], high: [60, 62, 67] },
  { name: "Fm9", bass: 41, low: [41, 48, 56], high: [60, 63, 67] },
  { name: "Gsus4 G", bass: 43, low: [43, 50, 55], high: [60, 62, 67], split: { low: [43, 50, 55], high: [59, 62, 67] } },
  // B
  { name: "Abmaj9", bass: 44, low: [44, 51, 55], high: [60, 63, 70] },
  { name: "Bb(add9)", bass: 46, low: [46, 53, 58], high: [60, 62, 65] },
  { name: "Cm7", bass: 36, low: [48, 55, 58], high: [63, 67, 70] },
  { name: "Bbsus4 Bb7", bass: 46, low: [46, 51, 53], high: [63, 65, 70], split: { low: [46, 50, 53], high: [62, 65, 68] } },
  { name: "Eb (climax)", bass: 39, low: [51, 58, 63], high: [67, 70, 75] },
  { name: "Dbmaj7", bass: 37, low: [49, 56, 60], high: [65, 68, 72] },
  { name: "Fm9/Ab", bass: 44, low: [44, 48, 53], high: [60, 63, 67] },
  { name: "Gsus4 G7", bass: 43, low: [43, 50, 55], high: [60, 62, 67], split: { low: [43, 50, 55], high: [59, 62, 65] } },
];

// Lead: [pitch, start beat, duration]. `depth` is the CC1 peak each long note
// blooms to, following the phrase: light in A, 127 on the climax, back down.
const lead = [
  // A, phrase 1
  [67, 1, 0.5], [70, 1.5, 0.5], [72, 2, 4, 40],
  [75, 6.5, 0.5], [74, 7, 1],
  [70, 8, 3.5, 45], [72, 11.5, 0.5],
  [75, 12, 1], [74, 13, 3, 50],
  // A, phrase 2
  [67, 17, 0.5], [70, 17.5, 0.5], [74, 18, 2, 45], [75, 20, 3, 55], [74, 23, 1],
  [72, 24, 1], [68, 25, 1], [67, 26, 2, 45],
  [72, 28, 2, 40], [71, 30, 2, 50],
  // B, rising
  [72, 32, 0.5], [75, 32.5, 0.5], [79, 33, 1.5, 60], [77, 34.5, 0.5], [75, 35, 1],
  [74, 36, 0.5], [77, 36.5, 0.5], [77, 37, 2, 70], [79, 39, 0.5], [80, 39.5, 0.5],
  [79, 40, 1.5, 75], [77, 41.5, 0.5], [75, 42, 0.5], [77, 42.5, 0.5], [79, 43, 1],
  [80, 44, 1.5, 85], [79, 45.5, 0.5], [77, 46, 1], [79, 47, 0.5], [80, 47.5, 0.5],
  // climax, then settle
  [82, 48, 6, 127],
  [80, 54, 1], [77, 55, 1],
  [75, 56, 3, 70], [72, 59, 1],
  [74, 60, 2, 45], [71, 62, 2, 35],
];

const velocityAt = (start) => (start < 32 ? 84 : start < 48 ? 96 : start < 56 ? 112 : 88);
// CC11 that short notes and the start of long notes sit at
const baseExpressionAt = (start) => (start < 32 ? 92 : start < 48 ? 100 : start < 56 ? 108 : 96);

function leadAutomation() {
  const mod = [{ beat: 0, value: 0 }];
  const expr = [{ beat: 0, value: baseExpressionAt(0) }];
  const STEP = 0.125;
  for (const [, start, duration, depth] of lead) {
    const base = baseExpressionAt(start);
    expr.push({ beat: start, value: base });
    if (!depth) {
      mod.push({ beat: start, value: 0 });
      continue;
    }
    // Straight for the first beat (half of a 2-beat note), then the vibrato
    // and the swell come in together over most of what is left.
    const onset = start + Math.min(1, duration / 2);
    const bloomEnd = onset + (start + duration - onset) * 0.7;
    const swell = Math.min(127, base + 6 + Math.round(depth / 6));
    mod.push({ beat: start, value: 0 });
    for (let b = onset; b <= bloomEnd + 1e-9; b += STEP) {
      const t = (b - onset) / (bloomEnd - onset);
      const shape = t * t * (3 - 2 * t);
      mod.push({ beat: b, value: Math.round(depth * shape) });
      expr.push({ beat: b, value: Math.round(base + (swell - base) * shape) });
    }
    // The note-off, or the next note-on, resets both.
    mod.push({ beat: start + duration, value: 0 });
    expr.push({ beat: start + duration, value: base });
  }
  return [
    { type: "controller", controller: 1, points: dedupe(mod) },
    { type: "controller", controller: 11, points: dedupe(expr) },
  ];
}

// Keep the last point per beat, sorted, and drop points that repeat a value.
function dedupe(points) {
  const byBeat = new Map();
  for (const p of points) byBeat.set(Math.round(p.beat * 1000) / 1000, p.value);
  const out = [];
  for (const [beat, value] of [...byBeat].sort((a, b) => a[0] - b[0])) {
    if (out.length && out.at(-1).value === value) continue;
    out.push({ beat, value });
  }
  return out;
}

function chordNotes(key, { transpose = 0, velocity = 70, from = 0, to = 16 } = {}) {
  const notes = [];
  bars.forEach((bar, i) => {
    if (i < from || i >= to) return;
    const start = i * BAR;
    if (bar.split) {
      for (const pitch of bar[key]) {
        const held = bar.split[key].includes(pitch);
        notes.push({ pitch: pitch + transpose, start, duration: held ? BAR : 2, velocity });
      }
      for (const pitch of bar.split[key]) {
        if (!bar[key].includes(pitch)) notes.push({ pitch: pitch + transpose, start: start + 2, duration: 2, velocity });
      }
    } else {
      for (const pitch of bar[key]) notes.push({ pitch: pitch + transpose, start, duration: BAR, velocity });
    }
  });
  return notes;
}

function bassNotes() {
  const notes = [];
  bars.forEach((bar, i) => {
    const start = i * BAR;
    const velocity = i < 8 ? 80 : i === 12 ? 110 : 92;
    notes.push({ pitch: bar.bass, start, duration: BAR, velocity });
    // B thickens with the upper octave from Cm7 through the climax
    if (i >= 10 && i <= 13) notes.push({ pitch: bar.bass + 12, start: start + 0.5, duration: BAR - 0.5, velocity: velocity - 20 });
    // a sub boom under the climax
    if (i === 12) notes.push({ pitch: bar.bass - 12, start, duration: BAR * 2, velocity: 110 });
  });
  return notes;
}

// Bells: sparse in A, a running eighth-note arpeggio in B, thinning out after the climax.
function bellNotes() {
  const notes = [];
  bars.forEach((bar, i) => {
    const start = i * BAR;
    const tones = [...bar.high].sort((a, b) => a - b).map((p) => p + 12);
    const top = tones[2];
    if (i < 8) {
      if (i % 2 === 1) {
        notes.push({ pitch: top + 12, start: start + 2, duration: 1, velocity: 60 });
        notes.push({ pitch: tones[1] + 12, start: start + 3, duration: 1, velocity: 50 });
      }
      return;
    }
    const pattern = [0, 1, 2, 1, 0, 2, 1, 2].map((k) => tones[k]);
    const step = i <= 12 ? 0.5 : i === 13 ? 1 : 2;
    for (let b = 0, k = 0; b < BAR; b += step, k++) {
      const half = bar.split && b >= 2;
      const ts = half ? [...bar.split.high].sort((x, y) => x - y).map((p) => p + 12) : tones;
      const pitch = step === 0.5 ? (half ? ts[[0, 1, 2, 1][k % 4]] : pattern[k]) : ts[2 - (k % 2)];
      notes.push({ pitch, start: start + b, duration: step, velocity: 55 + Math.min(i - 8, 4) * 6 });
    }
  });
  return notes;
}

// The echo track replays the bells a dotted eighth later, panned opposite and darker.
function echoNotes(source) {
  return source
    .map((n) => ({ ...n, start: n.start + 0.75, velocity: Math.round(n.velocity * 0.8) }))
    .map((n) => (n.start >= LENGTH ? { ...n, start: n.start - LENGTH } : n))
    .sort((a, b) => a.start - b.start);
}

// The synth renders quietly at unity, so every layer is boosted by the same
// factor, and track gains set the balance.
const LAYER_BOOST = 3;
const layer = (waveform, gain, attack, decay, sustain, release) => ({
  oscillator: { waveform },
  gain: +(gain * LAYER_BOOST).toFixed(3),
  amp: { envelope: { attack, decay, sustain, release } },
});
const band = (type, frequency, q = 0.7, gain = 1) => ({ type, frequency, gain, q, bypass: false });
const eq = (...bands) => ({ bypass: false, bands });

// Pads swell through B with CC11 and ease back for the loop.
const padExpression = {
  type: "controller",
  controller: 11,
  points: dedupe(
    Array.from({ length: LENGTH / 0.5 }, (_, k) => {
      const beat = k * 0.5;
      let value = 96;
      if (beat >= 32 && beat < 48) value = 96 + ((beat - 32) / 16) * 31;
      else if (beat >= 48 && beat < 52) value = 127;
      else if (beat >= 52) value = 127 - ((beat - 52) / 12) * 31;
      return { beat, value: Math.round(value) };
    }),
  ),
};

const track = (name, { synth, notes, gain, pan, eqBands, automation, height = 160 }) => ({
  name,
  program: 0,
  synth: { layers: synth },
  notes: notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch),
  gain,
  pan,
  muted: false,
  soloed: false,
  eq: eq(...eqBands),
  ...(automation ? { automation } : {}),
  viewMode: "editor",
  height,
});

const bells = bellNotes();

const project = {
  title: "Aftertouch",
  comment: `A slow cinematic synth loop in the spirit of Vangelis, written as a demo for [toy-midi#1052](https://github.com/hi-ogawa/toy-midi/issues/1052): the own synth honoring CC1 as vibrato depth. Every part plays on Toy MIDI's own synth.

**Form.** C minor, 62 bpm, 16 bars. A (bars 1-8) is spacious: the lead over sustained Cm9, Abmaj7#11, Eb/Bb, Bbsus4, Fm9, Gsus4. B (bars 9-16) climbs in register and density, with bells running in eighths, strings entering, and the bass doubling at the octave, to the climax Bb5 over Eb at bar 13, then settles through Dbmaj7 and Fm9 to G7, which wraps back into A.

**Lead vibrato, played like a CS-80.** Short notes stay straight. A long note starts straight, and after a beat (or halfway, for a 2-beat note) CC1 brings the vibrato in while CC11 swells with it, so the note blooms. CC1 returns to 0 at every note-off and between phrases. The depth follows the phrase: about 40-55 in A, 60-85 rising through B, 127 (the full 50 cents) on the climax note, then 70, 45, 35 as it settles.

**Mix.** The lead is centered, sawtooth and square over a sine body, low-passed at 4 kHz with a presence bump. The close pad sits left and is low-passed at 1.6 kHz to stay dark under the lead. The open low pad sits right, high-passed at 90 Hz to leave the bottom to the bass. The B strings are wider right. The bells are right, and their echo track replays them a dotted eighth later on the left, darker, for a stereo delay. The bass is sine and triangle, low-passed so it stays a floor.`,
  locators: [
    { beat: 0, label: "A" },
    { beat: 32, label: "B" },
    { beat: 48, label: "Climax" },
  ],
  masterGain: 1,
  loop: { range: { startBeat: 0, endBeat: LENGTH }, enabled: true },
  tempo: 62,
  timeSignature: { numerator: 4, denominator: 4 },
  midiTracks: [
    track("Lead (CS-80 brass)", {
      synth: [
        layer("sawtooth", 0.45, 0.06, 0.5, 0.75, 0.45),
        layer("square", 0.18, 0.12, 0.6, 0.6, 0.4),
        layer("sine", 0.35, 0.03, 0.3, 0.9, 0.5),
      ],
      notes: lead.map(([pitch, start, duration]) => ({ pitch, start, duration, velocity: velocityAt(start) })),
      gain: 0.9,
      pan: 0,
      eqBands: [band("high-pass", 140), band("low-pass", 4000), band("peaking", 1400, 1, 1.4)],
      automation: leadAutomation(),
      height: 220,
    }),
    track("Close pad", {
      synth: [layer("sawtooth", 0.25, 1.6, 1.5, 0.85, 2.8), layer("triangle", 0.35, 0.9, 1, 0.9, 2.5)],
      notes: chordNotes("high", { velocity: 72 }),
      gain: 0.5,
      pan: -0.45,
      eqBands: [band("high-pass", 220), band("low-pass", 1600)],
      automation: [padExpression],
    }),
    track("Open low pad", {
      synth: [layer("triangle", 0.5, 1.1, 1, 0.9, 2.5), layer("square", 0.12, 2.2, 1.5, 0.8, 3)],
      notes: chordNotes("low", { velocity: 72 }),
      gain: 0.24,
      pan: 0.3,
      eqBands: [band("high-pass", 90), band("low-pass", 1000), band("peaking", 300, 1, 0.8)],
      automation: [padExpression],
    }),
    track("Strings (B)", {
      synth: [layer("sawtooth", 0.25, 2.6, 2, 0.9, 3.2), layer("triangle", 0.25, 1.6, 2, 0.9, 3)],
      notes: chordNotes("high", { transpose: 12, velocity: 70, from: 9, to: 15 }),
      gain: 0.7,
      pan: 0.65,
      eqBands: [band("high-pass", 350), band("low-pass", 3200)],
      automation: [padExpression],
    }),
    track("Bass", {
      synth: [layer("sine", 0.8, 0.25, 1, 1, 1.2), layer("triangle", 0.3, 0.4, 1, 0.9, 1.2)],
      notes: bassNotes(),
      gain: 0.2,
      pan: 0,
      eqBands: [band("high-pass", 28), band("low-pass", 380)],
    }),
    track("Bells", {
      synth: [layer("sine", 0.5, 0.002, 1.6, 0, 1.6), layer("triangle", 0.2, 0.002, 0.4, 0, 0.6)],
      notes: bells,
      gain: 0.4,
      pan: 0.5,
      eqBands: [band("high-pass", 500)],
    }),
    track("Bells echo", {
      synth: [layer("sine", 0.5, 0.002, 1.6, 0, 1.6), layer("triangle", 0.2, 0.002, 0.4, 0, 0.6)],
      notes: echoNotes(bells),
      gain: 0.23,
      pan: -0.55,
      eqBands: [band("high-pass", 500), band("low-pass", 2400)],
    }),
  ],
};

writeFileSync(new URL("project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
