// Melody and ear candy: flute hook, vibraphone counter/harmony, choir chop stabs, synth-voice swells.
import { timeline, TOTAL_BEATS } from "./spec.mjs";

// Seeded PRNG (mulberry32)
function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SCALE = [2, 4, 5, 7, 9, 10, 0]; // D minor / F major pitch classes
const TL = timeline();
const ALL_CHORDS = TL.flatMap((s) => s.chords);
const sec = (name) => TL.find((s) => s.name === name);
const chordAt = (beat) =>
  ALL_CHORDS.find((c) => beat >= c.start && beat < c.start + c.length) ??
  ALL_CHORDS.at(-1);

// Snap a pitch to the nearest chord tone (any octave) of the chord sounding at `beat`.
function snapToChord(pitch, beat) {
  const pcs = chordAt(beat).tones.map((t) => t % 12);
  for (let d = 0; d < 12; d++) {
    for (const p of [pitch - d, pitch + d]) {
      if (pcs.includes(((p % 12) + 12) % 12)) {
        return p;
      }
    }
  }
  return pitch;
}
// Diatonic step(s) below within D minor, used for a harmony a third under the hook.
function diatonicBelow(pitch, steps) {
  let p = pitch,
    n = 0;
  while (n < steps) {
    p--;
    if (SCALE.includes(((p % 12) + 12) % 12)) {
      n++;
    }
  }
  return p;
}

// The hook: a 16-beat phrase over the A loop (Bbmaj9 | Am11 | Dm9 | Gm9 C13).
// Call half sits on bar 1 and bar 3, the choir chops answer on bars 2 and 4.
const HOOK_A = [
  // [beat offset, pitch, duration]
  [0.5, 77, 0.5],
  [1, 81, 0.75],
  [2, 79, 0.5],
  [2.5, 77, 1.25],
];
const HOOK_B = [
  [8.5, 77, 0.5],
  [9, 81, 0.5],
  [9.5, 84, 0.75],
  [10.5, 81, 0.5],
  [11, 76, 1.5],
];
const HOOK_B_ALT = [
  // variation used on the second pass, reaching up to D6
  [8.5, 77, 0.5],
  [9, 81, 0.5],
  [9.5, 84, 0.5],
  [10, 86, 0.75],
  [10.75, 84, 0.25],
  [11, 81, 1.75],
];

export function parts() {
  const r = rng(880144);
  const jit = (a) => (r() * 2 - 1) * a;
  const lay = () => 0.05 + r() * 0.05; // laid back, behind the beat
  const vel = (v) => Math.max(1, Math.min(127, Math.round(v)));
  const tracks = {
    hook: { name: "Flute Hook", bank: 0, program: 73, gain: 0.8, notes: [] },
    vibes: {
      name: "Vibes Counter",
      bank: 0,
      program: 11,
      gain: 0.7,
      notes: [],
    },
    chops: { name: "Choir Chops", bank: 0, program: 52, gain: 0.6, notes: [] },
    swell: { name: "Voice Swell", bank: 0, program: 54, gain: 0.5, notes: [] },
  };
  const add = (tr, pitch, start, duration, velocity) => {
    let s = Math.max(0, start);
    if (s >= TOTAL_BEATS) {
      return;
    }
    const d = Math.max(0.05, Math.min(duration, TOTAL_BEATS - s));
    tracks[tr].notes.push({
      pitch: Math.round(pitch),
      start: +s.toFixed(4),
      duration: +d.toFixed(4),
      velocity: vel(velocity),
    });
  };
  const phrase = (tr, notes, base, v, { harm = false, velFn = null } = {}) => {
    for (const [o, p, d] of notes) {
      const t = base + o + lay();
      const vv = (velFn ? velFn(base + o) : v) + jit(6);
      add(tr, p, t, d * 0.95, vv);
      if (harm) {
        add(
          "vibes",
          snapToChord(diatonicBelow(p, 2), base + o),
          t + 0.02,
          d * 0.9,
          vv - 14,
        );
      }
    }
  };
  // Chop stab: chord tones lifted an octave, short and slightly late, like a sliced vocal sample.
  const chop = (beat, v, len = 0.3, topOnly = false) => {
    const c = chordAt(beat);
    const voicing = c.tones.map((t) => t + 12).filter((p) => p >= 64);
    const ps = topOnly ? [voicing.at(-1)] : voicing;
    const t = beat + 0.03 + r() * 0.04;
    for (const p of ps) {
      add("chops", p, t, len, v + jit(5));
    }
  };
  const chopAnswer = (bar, v, busy = false) => {
    // bar = absolute beat of an answering bar
    chop(bar + 0.75, v, 0.35);
    chop(bar + 1.5, v - 12, 0.25, true);
    if (busy) {
      chop(bar + 2.25, v - 6, 0.25);
    }
    chop(bar + 3.5, v - 18, 0.2, true);
  };
  // Reverse swell: repeated chord tone with rising velocity into a downbeat.
  const swell = (endBeat, beats, from, to) => {
    const steps = beats * 4;
    const p = snapToChord(81, endBeat - 0.01);
    for (let i = 0; i < steps; i++) {
      const t = endBeat - beats + i * 0.25;
      add("swell", p, t, 0.26, from + ((to - from) * i) / (steps - 1));
    }
  };

  // Intro (0-16): keys only. A teaser of the hook's first gesture and one chop, nothing else.
  const intro = sec("intro").start;
  phrase("hook", HOOK_A.slice(0, 2), intro + 8, 50);
  chop(intro + 13.5, 45, 0.5, true);
  swell(sec("verseA").start, 2, 15, 70);

  // verseA (16-48): hook introduced. Pass 1 call half only, pass 2 full hook. Chops answer.
  const vA = sec("verseA").start;
  phrase("hook", HOOK_A, vA, 84);
  chopAnswer(vA + 4, 78);
  chopAnswer(vA + 12, 74);
  phrase("hook", HOOK_A, vA + 16, 88);
  chopAnswer(vA + 20, 80);
  phrase("hook", HOOK_B, vA + 16, 86);
  chop(vA + 28.75, 76);
  chop(vA + 30.5, 72, 0.25, true);
  // vibes counter: a single answering line under the second-half hook
  for (const [o, p, d] of [
    [13, 74, 1],
    [14.5, 72, 1.5],
  ]) {
    add("vibes", p, vA + 16 + o + lay(), d, 62 + jit(5));
  }

  // bridgeB (48-80): develop the hook rhythm and contour, re-snapped to the new chords, rising each pass.
  const bB = sec("bridgeB").start;
  const contour = [
    [0.5, 0, 0.5],
    [1, 4, 0.75],
    [2, 2, 0.5],
    [2.5, 0, 1.25],
  ];
  [74, 77, 77, 81].forEach((root, i) => {
    const base = bB + i * 8;
    const motif = contour.map(([o, iv, d]) => [
      o,
      snapToChord(root + iv, base + o),
      d,
    ]);
    phrase("hook", motif, base, 82 + i * 3);
    // vibes echo of the motif tail an octave-ish below, half a bar later
    const tail = motif.slice(-2);
    for (const [o, p, d] of tail) {
      add(
        "vibes",
        snapToChord(p - 5, base + o + 1.5),
        base + o + 1.5 + lay(),
        d,
        58 + jit(5),
      );
    }
    chopAnswer(base + 4, 74 + i * 2, i >= 2);
  });
  swell(sec("breakdown").start, 2, 20, 80);

  // breakdown (80-96): space. Two lonely chops, a vibes ghost of the hook, swell into the peak.
  const bd = sec("breakdown").start;
  chop(bd + 0.75, 70, 0.6, true);
  chop(bd + 6.5, 55, 0.4, true);
  for (const [o, p, d] of [
    [8.5, 77, 0.5],
    [9, 81, 0.75],
    [10, 79, 2],
  ]) {
    add("vibes", p, bd + o + lay(), d, 55 + jit(4));
  }
  swell(sec("verseA2").start, 4, 10, 100);

  // verseA2 (96-128): the peak. Full hook twice, harmonized a third below on vibes, busier chops.
  const vA2 = sec("verseA2").start;
  for (let pass = 0; pass < 2; pass++) {
    const base = vA2 + pass * 16;
    phrase("hook", HOOK_A, base, 92, { harm: true });
    chopAnswer(base + 4, 86, true);
    phrase("hook", pass ? HOOK_B_ALT : HOOK_B, base, 94, { harm: true });
    chopAnswer(base + 12, 82, true);
  }

  // outro (128-144): hook drifts out with falling velocity, last note rings.
  const ot = sec("outro").start;
  const fade = (b) => 80 - ((b - ot) / 16) * 60;
  phrase("hook", HOOK_A, ot, 0, { velFn: fade });
  chop(ot + 4.75, 55, 0.4);
  chop(ot + 6.5, 45, 0.3, true);
  phrase(
    "hook",
    [
      [8.5, 77, 0.5],
      [9, 81, 0.5],
      [9.5, 84, 0.75],
      [10.5, 81, 0.5],
      [11, 76, 4.8],
    ],
    ot,
    0,
    { velFn: fade },
  );
  chop(ot + 13.5, 25, 0.8, true);

  return Object.values(tracks).map((t) => ({
    ...t,
    notes: t.notes.sort((a, b) => a.start - b.start),
  }));
}
