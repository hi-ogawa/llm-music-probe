// Harmony parts: chopped-soul Rhodes keys, string bed (bridge, breakdown), organ layer (verseA2).
import { TEMPO, TOTAL_BEATS, timeline } from "./spec.mjs";

// Deterministic PRNG (mulberry32)
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STRUM = (0.01 * TEMPO) / 60; // ~10 ms per voice, in beats
const MAX_PITCH = 72;

// Chop patterns: [offset, duration, velocity scale, voicing] where voicing is "full" or "top" (top 3 voices).
// 4-beat chords, main chop: long hit plus late stabs.
const VERSE4 = [
  [
    [0, 2.3, 1, "full"],
    [2.75, 0.4, 0.78, "top"],
    [3.5, 0.4, 0.7, "top"],
  ],
  [
    [0, 1.4, 1, "full"],
    [1.75, 0.35, 0.72, "top"],
    [2.5, 1.3, 0.86, "full"],
  ],
  [
    [0, 2.9, 1, "full"],
    [3.25, 0.55, 0.76, "top"],
  ],
  [
    [0, 1.0, 1, "full"],
    [1.5, 0.4, 0.74, "top"],
    [2.75, 1.1, 0.84, "full"],
  ],
  [
    [0, 2.4, 1, "full"],
    [2.5, 0.3, 0.6, "top"],
    [3.0, 0.3, 0.72, "top"],
    [3.75, 0.2, 0.55, "top"],
  ],
];
const VERSE2 = [
  [
    [0, 1.2, 1, "full"],
    [1.5, 0.4, 0.76, "top"],
  ],
  [[0, 1.85, 1, "full"]],
  [
    [0, 0.7, 1, "full"],
    [0.75, 1.0, 0.8, "full"],
  ],
  [
    [0, 1.0, 1, "full"],
    [1.25, 0.3, 0.7, "top"],
    [1.75, 0.2, 0.6, "top"],
  ],
];
// Bridge: shorter, syncopated chops; "next" anticipates the following chord.
const BRIDGE4 = [
  [
    [0, 0.8, 1, "full"],
    [1.5, 0.45, 0.8, "top"],
    [2.25, 0.6, 0.85, "full"],
    [3.5, 0.4, 0.82, "next"],
  ],
  [
    [0, 0.45, 1, "full"],
    [0.75, 0.4, 0.72, "top"],
    [2.5, 0.4, 0.85, "full"],
    [3.0, 0.7, 0.7, "top"],
  ],
  [
    [0, 1.2, 1, "full"],
    [2.0, 0.35, 0.78, "top"],
    [2.75, 0.5, 0.82, "full"],
    [3.5, 0.4, 0.8, "next"],
  ],
  [
    [0, 0.6, 1, "full"],
    [1.0, 0.35, 0.7, "top"],
    [1.75, 1.0, 0.85, "full"],
    [3.25, 0.5, 0.72, "top"],
  ],
];
// Intro: sparse, like the sample heard alone.
const INTRO4 = [
  [[0, 3.6, 1, "full"]],
  [
    [0, 2.6, 1, "full"],
    [3.25, 0.5, 0.7, "top"],
  ],
];
const INTRO2 = [
  [[0, 1.85, 1, "full"]],
  [
    [0, 1.2, 1, "full"],
    [1.5, 0.35, 0.7, "top"],
  ],
];

// Revoicing: keep chord identity, add colour within the register below MIDI 72.
function revoice(chord, rnd, section) {
  let t = [...chord.tones];
  // Occasionally drop the top voice an octave for a darker, inverted colour (only when it stays above the 2nd voice).
  if (section === "verseA2" && rnd() < 0.25 && t[3] - 12 > t[0]) {
    t = [...t.slice(0, 3), t[3] - 12].sort((a, b) => a - b);
  }
  // Occasionally add a colour note on top when there is room below the lead register.
  if ((section === "verseA2" || section === "bridgeB") && rnd() < 0.3) {
    const extra = { Bbmaj9: 69, Am11: 67, Dm9: 69, Gm9: 65, Fmaj9: 60 }[
      chord.name
    ];
    if (extra && extra > t[t.length - 1] && extra <= MAX_PITCH) {
      t.push(extra);
    }
  }
  return t.filter((p) => p <= MAX_PITCH);
}

function humanize(rnd, amt = 0.025) {
  return (rnd() * 2 - 1) * amt;
}

function clampVel(v) {
  return Math.max(1, Math.min(127, Math.round(v)));
}

// Push a strummed chord hit.
function hit(
  notes,
  rnd,
  pitches,
  start,
  dur,
  vel,
  { up = false, end = TOTAL_BEATS } = {},
) {
  const order = up ? [...pitches].reverse() : pitches;
  const base = start + humanize(rnd);
  order.forEach((p, i) => {
    let s = Math.max(0, base + i * STRUM + humanize(rnd, 0.004));
    let d = dur - i * STRUM * 0.5;
    if (s + d > end) {
      d = end - s;
    }
    if (d <= 0.02 || s >= TOTAL_BEATS) {
      return;
    }
    const topBoost = p === Math.max(...pitches) ? 6 : 0;
    notes.push({
      pitch: p,
      start: s,
      duration: d,
      velocity: clampVel(vel + topBoost + humanize(rnd, 6)),
    });
  });
}

function keys(tl, rnd) {
  const notes = [];
  for (const sec of tl) {
    const chords = sec.chords;
    let anticipated = false;
    let lastPat = -1;
    chords.forEach((c, ci) => {
      const next = chords[ci + 1] ?? tl[tl.indexOf(sec) + 1]?.chords[0];
      const voicing = revoice(c, rnd, sec.name);
      const top = voicing.slice(-3);
      const chordEnd = Math.min(c.start + c.length, sec.end);
      const progress = (c.start - sec.start) / (sec.end - sec.start);
      let pats, velBase;
      switch (sec.name) {
        case "intro":
          pats = c.length >= 4 ? INTRO4 : INTRO2;
          velBase = 46 + progress * 14;
          break;
        case "verseA":
          pats = c.length >= 4 ? VERSE4 : VERSE2;
          velBase = 80;
          break;
        case "bridgeB":
          pats = BRIDGE4;
          velBase = 74 + progress * 12;
          break;
        case "verseA2":
          pats = c.length >= 4 ? VERSE4 : VERSE2;
          velBase = 86;
          break;
        default:
          pats = null;
      }

      if (sec.name === "breakdown") {
        // Space: one long tone per chord, with a quiet late echo of the top voices on the long chord.
        const ring = c.length >= 8 ? 5.5 : c.length - 0.1;
        hit(notes, rnd, voicing, c.start, ring, 60, { end: chordEnd });
        if (c.length >= 8) {
          hit(notes, rnd, top, c.start + 6.5, 1.4, 42, { end: chordEnd });
        }
        return;
      }
      if (sec.name === "outro") {
        const isLast = ci === chords.length - 1;
        const v = 64 - progress * 18;
        if (isLast) {
          // Last chord rings to the very end.
          hit(notes, rnd, voicing, c.start, TOTAL_BEATS - c.start, v);
        } else {
          hit(notes, rnd, voicing, c.start, 2.6, v, { end: chordEnd });
          if (ci === 0) {
            hit(notes, rnd, top, c.start + 3.25, 0.5, v * 0.7, {
              end: chordEnd,
            });
          }
        }
        return;
      }

      // Pick a pattern different from the previous one to avoid identical bar-to-bar repetition.
      let pi = Math.floor(rnd() * pats.length);
      if (pats.length > 1 && pi === lastPat) {
        pi = (pi + 1) % pats.length;
      }
      lastPat = pi;
      let pat = pats[pi];
      // verseA2 variation: add a ghost stab occasionally.
      if (sec.name === "verseA2" && c.length >= 4 && rnd() < 0.45) {
        const free = [1.25, 2.25, 3.75].filter((o) =>
          pat.every(([po, pd]) => o < po - 0.1 || o > po + pd + 0.05),
        );
        if (free.length) {
          pat = [
            ...pat,
            [free[Math.floor(rnd() * free.length)], 0.22, 0.5, "top"],
          ].sort((a, b) => a[0] - b[0]);
        }
      }
      pat.forEach(([off, dur, vs, kind], k) => {
        if (anticipated && off === 0) {
          // Chord already pushed in on the previous "and of 4": let it breathe, re-hit softly on the "and".
          off = 0.5;
          dur = Math.max(0.3, dur - 0.5);
          vs *= 0.8;
          kind = "top";
        }
        // Dilla drag: late stabs sit a little behind the grid.
        const drag = off > 0 && off % 1 !== 0 ? 0.02 : 0;
        const nextOff = pat[k + 1]?.[0] ?? c.length;
        let pitches = kind === "top" ? top : voicing;
        let end = c.start + nextOff - 0.06;
        if (kind === "next") {
          if (!next || next.start >= sec.end) {
            return;
          }
          pitches = next.tones.filter((p) => p <= MAX_PITCH);
          end = c.start + c.length - 0.08;
        }
        end = Math.min(end, kind === "next" ? end : chordEnd - 0.04);
        hit(
          notes,
          rnd,
          pitches,
          c.start + off + drag,
          Math.min(dur, end - (c.start + off + drag)),
          velBase * vs,
          {
            up: kind === "top" && rnd() < 0.35,
          },
        );
      });
      anticipated =
        pat.some(([, , , kind]) => kind === "next") &&
        next &&
        next.start < sec.end;
    });
  }
  return notes;
}

// String bed: bridge lift and breakdown long tones.
function strings(tl, rnd) {
  const notes = [];
  for (const sec of tl) {
    if (sec.name !== "bridgeB" && sec.name !== "breakdown") {
      continue;
    }
    sec.chords.forEach((c) => {
      const progress = (c.start - sec.start) / (sec.end - sec.start);
      const end = Math.min(c.start + c.length, sec.end);
      // Upper three tones, top kept at or below 69 so the lead has room.
      let v = c.tones.slice(1).filter((p) => p <= 69);
      let vel;
      if (sec.name === "bridgeB") {
        vel = 48 + progress * 26;
      } else {
        v = v.slice(-2);
        vel = 52 - progress * 10;
      } // breakdown: thinner, two voices
      v.forEach((p, i) => {
        const s = Math.max(0, c.start + 0.02 + i * STRUM + humanize(rnd, 0.01));
        notes.push({
          pitch: p,
          start: s,
          duration: end - s - 0.05,
          velocity: clampVel(vel + humanize(rnd, 4)),
        });
      });
    });
  }
  return notes;
}

// Organ: soft sustained low-mid layer under the returning chop in verseA2.
function organ(tl, rnd) {
  const notes = [];
  const sec = tl.find((s) => s.name === "verseA2");
  sec.chords.forEach((c) => {
    const progress = (c.start - sec.start) / (sec.end - sec.start);
    const end = Math.min(c.start + c.length, sec.end);
    const v = c.tones.slice(0, 3);
    // Re-articulate halfway through long chords on the second half of the section for movement.
    const splits = c.length >= 4 && progress >= 0.5 ? [0, 2.5] : [0];
    splits.forEach((off, k) => {
      const segEnd = k + 1 < splits.length ? c.start + splits[k + 1] : end;
      v.forEach((p) => {
        const s = Math.max(
          sec.start,
          c.start + off + Math.abs(humanize(rnd, 0.015)),
        );
        notes.push({
          pitch: p,
          start: s,
          duration: segEnd - s - 0.06,
          velocity: clampVel(50 + progress * 12 + humanize(rnd, 4)),
        });
      });
    });
  });
  return notes;
}

export function parts() {
  const tl = timeline();
  const rnd = mulberry32(0xd111a);
  const tidy = (notes) =>
    notes
      .map((n) => ({
        pitch: n.pitch,
        start: Math.max(0, +n.start.toFixed(4)),
        duration: +Math.min(
          n.duration,
          TOTAL_BEATS - Math.max(0, n.start),
        ).toFixed(4),
        velocity: n.velocity,
      }))
      .filter((n) => n.duration > 0 && n.start < TOTAL_BEATS)
      .sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  return [
    {
      name: "Rhodes Keys",
      bank: 0,
      program: 4,
      gain: 0.8,
      notes: tidy(keys(tl, rnd)),
    },
    {
      name: "String Bed",
      bank: 0,
      program: 49,
      gain: 0.45,
      notes: tidy(strings(tl, rnd)),
    },
    {
      name: "Organ Layer",
      bank: 0,
      program: 16,
      gain: 0.3,
      notes: tidy(organ(tl, rnd)),
    },
  ];
}
