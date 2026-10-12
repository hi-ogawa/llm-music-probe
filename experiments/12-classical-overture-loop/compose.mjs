import { writeFileSync } from "node:fs";
// "Overture in D minor" for Toy MIDI. Prints a /draft share link.
import { deflateRawSync } from "node:zlib";

const SITE = "https://fix-issue-827-toy-midi.hiro18181.workers.dev";
const BAR = 4;

const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function p(name) {
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
  if (!m) {
    throw new Error(name);
  }
  return (
    12 * (Number(m[3]) + 1) +
    PC[m[1]] +
    (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0)
  );
}
const D = {
  w: 4,
  "h.": 3,
  h: 2,
  "q.": 1.5,
  q: 1,
  "e.": 0.75,
  e: 0.5,
  s: 0.25,
  t: 1 / 3,
};

const tracks = {};
function track(key, name, program, opts = {}) {
  tracks[key] = { name, program, notes: [], gain: 1, pan: 0, ...opts };
}
function add(key, pitch, start, duration, velocity) {
  tracks[key].notes.push({
    pitch: typeof pitch === "string" ? p(pitch) : pitch,
    start: +start.toFixed(4),
    duration: +duration.toFixed(4),
    velocity: Math.max(1, Math.min(127, Math.round(velocity))),
  });
}
// Melody string like "D5:q A4:e r:e" from a start beat; returns the end beat.
function line(
  key,
  text,
  start,
  vel,
  { transpose = 0, legato = 0.95, accent = 0 } = {},
) {
  let t = start;
  for (const tok of text.trim().split(/\s+/)) {
    const [n, d] = tok.split(":");
    const dur = D[d] ?? Number(d);
    if (n !== "r") {
      const v = typeof vel === "function" ? vel(t) : vel;
      const onBeat = Math.abs(t - Math.round(t)) < 1e-6;
      add(key, p(n) + transpose, t, dur * legato, v + (onBeat ? accent : 0));
    }
    t += dur;
  }
  return t;
}
const ramp = (t0, t1, v0, v1) => (t) =>
  v0 + (v1 - v0) * Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
const bar = (n) => (n - 1) * BAR; // 1-based bar to beat

track("fl", "Flute", 73, { pan: -0.2, gain: 0.9 });
track("ob", "Oboe", 68, { pan: 0.15, gain: 0.85 });
track("hn", "Horns", 60, { pan: -0.35, gain: 0.85 });
track("tp", "Trumpets", 56, { pan: 0.3, gain: 0.7 });
track("tb", "Trombones", 57, { pan: 0.4, gain: 0.7 });
track("ti", "Timpani", 47, { pan: 0, gain: 0.9 });
track("cym", "Cymbals", 0, { bank: 128, gain: 0.6 });
track("hp", "Harp", 46, { pan: -0.4, gain: 0.8 });
track("v1", "Violins I", 48, { pan: -0.45, gain: 1 });
track("v2", "Violins II & Violas", 48, { pan: 0.2, gain: 0.75 });
track("pz", "Pizzicato", 45, { pan: 0.1, gain: 0.85 });
track("lo", "Cellos & Basses", 48, { pan: 0.45, gain: 0.9 });

// Harmony: per bar, list of [beatInBar, beats, bass, upper voicing]
const H = {};
function harm(n, ...chords) {
  H[n] = chords.map(([b, d, bass, upper]) => ({
    b,
    d,
    bass: p(bass),
    upper: upper.split(" ").map(p),
  }));
}
// A: D minor theme
harm(1, [0, 4, "D3", "F4 A4 D5"]);
harm(2, [0, 4, "Bb2", "G4 Bb4 D5"]);
harm(3, [0, 4, "A2", "G4 A4 C#5"]);
harm(4, [0, 4, "D3", "F4 A4 D5"]);
harm(5, [0, 4, "D3", "F4 A4 D5"]);
harm(6, [0, 4, "Bb2", "F4 Bb4 D5"]);
harm(7, [0, 2, "G2", "G4 Bb4 E5"], [2, 2, "A2", "G4 A4 C#5"]);
harm(8, [0, 4, "D3", "F4 A4 D5"]);
// Build 1: dominant of F
harm(9, [0, 4, "C3", "E4 G4 Bb4"]);
harm(10, [0, 4, "C3", "E4 G4 Bb4"]);
// B: F major tutti
harm(11, [0, 4, "F2", "F4 A4 C5"]);
harm(12, [0, 4, "E2", "E4 G4 C5"]);
harm(13, [0, 4, "D2", "F4 A4 D5"]);
harm(14, [0, 4, "Bb1", "F4 Bb4 D5"]);
harm(15, [0, 4, "C2", "F4 A4 C5"]);
harm(16, [0, 4, "C2", "E4 G4 C5"]);
harm(17, [0, 4, "F2", "F4 A4 C5"]);
harm(18, [0, 4, "F2", "Eb4 A4 C5"]);
// C: B-flat major, lyrical
harm(19, [0, 4, "Bb2", "F4 Bb4 D5"]);
harm(20, [0, 4, "G2", "G4 Bb4 D5"]);
harm(21, [0, 4, "Eb2", "G4 Bb4 Eb5"]);
harm(22, [0, 4, "F2", "F4 A4 C5"]);
harm(23, [0, 4, "D2", "F4 Bb4 D5"]);
harm(24, [0, 4, "Eb2", "G4 Bb4 Eb5"]);
harm(25, [0, 2, "C2", "G4 Bb4 Eb5"], [2, 2, "F2", "F4 A4 Eb5"]);
harm(26, [0, 4, "Bb2", "F4 Bb4 D5"]);
// Build 2: back to D minor
harm(27, [0, 4, "G2", "G4 Bb4 D5"]);
harm(28, [0, 4, "E2", "G4 Bb4 C#5"]);
harm(29, [0, 4, "A2", "G4 Bb4 C#5"]);
harm(30, [0, 4, "A2", "G4 A4 C#5"]);
// A': climax
for (let n = 31; n <= 38; n++) {
  H[n] = H[n - 30];
}
// Codetta, easing back into the loop
harm(39, [0, 4, "D3", "F4 A4 D5"]);
harm(40, [0, 2, "Bb2", "G4 Bb4 D5"], [2, 2, "A2", "G4 A4 C#5"]);

const TOTAL_BARS = 40;

// ---------- Section A (1-8): strings alone, piano ----------
const themeA = [
  "D5:q A4:e D5:e F5:q E5:e D5:e",
  "G5:q. F5:e E5:e F5:e G5:q",
  "A5:h G5:e F5:e E5:e C#5:e",
  "D5:h. A4:q",
  "F5:q. E5:e D5:q A5:q",
  "Bb5:q A5:e G5:e F5:q D5:q",
  "E5:q G5:q C#5:q. D5:e",
  "D5:h r:h",
].join(" ");
line("v1", themeA, bar(1), (t) => 72 + 6 * Math.sin((t / 16) * Math.PI), {
  accent: 4,
});

function eighthsChord(key, from, to, vel) {
  for (let n = from; n <= to; n++) {
    for (const c of H[n]) {
      for (let t = c.b; t < c.b + c.d - 1e-6; t += 0.5) {
        const i = Math.round(t * 2) % 2;
        const v = typeof vel === "function" ? vel(bar(n) + t) : vel;
        // Alberti-ish: low note on the beat, upper pair off the beat
        if (i === 0) {
          add(key, c.upper[0], bar(n) + t, 0.45, v);
        } else {
          for (const u of c.upper.slice(1)) {
            add(key, u, bar(n) + t, 0.45, v - 6);
          }
        }
      }
    }
  }
}
function bassQuarters(key, from, to, vel, octave = true) {
  for (let n = from; n <= to; n++) {
    for (const c of H[n]) {
      for (let t = c.b; t < c.b + c.d - 1e-6; t += 1) {
        const v = typeof vel === "function" ? vel(bar(n) + t) : vel;
        add(key, c.bass, bar(n) + t, 0.9, v + (t === 0 ? 6 : 0));
        if (octave) {
          add(key, c.bass - 12, bar(n) + t, 0.9, v - 10);
        }
      }
    }
  }
}
eighthsChord("v2", 1, 8, 54);
bassQuarters("lo", 1, 8, 62);
// Horns hold a soft pedal under the second phrase
for (let n = 5; n <= 8; n++) {
  add("hn", H[n][0].bass + 12, bar(n), 3.9, 48);
}

// ---------- Build 1 (9-10): C pedal, rising strings, timpani roll ----------
line(
  "v1",
  "C5:e D5:e E5:e F5:e G5:e A5:e Bb5:e C6:e",
  bar(9),
  ramp(bar(9), bar(11), 70, 100),
);
for (let t = bar(10); t < bar(11) - 1e-6; t += 0.25) {
  const v = ramp(bar(10), bar(11), 75, 115)(t);
  add("v1", t % 0.5 === 0 ? p("C6") : p("Bb5"), t, 0.24, v);
}
for (let t = bar(9); t < bar(11) - 1e-6; t += 0.25) {
  const v = ramp(bar(9), bar(11), 60, 115)(t);
  add("v2", t % 0.5 === 0 ? p("G4") : p("E5"), t, 0.24, v - 8);
  add("lo", p("C3"), t, 0.24, v - 5);
  add("lo", p("C2"), t, 0.24, v - 10);
  add("ti", p("C3"), t, 0.24, ramp(bar(9), bar(11), 35, 112)(t));
}
for (const [i, pitch] of ["E4", "G4", "C4"].entries()) {
  for (let q = 0; q < 8; q++) {
    const t = bar(9) + q;
    add(i < 2 ? "hn" : "tb", pitch, t, 0.98, ramp(bar(9), bar(11), 55, 108)(t));
  }
}
add("cym", 57, bar(10) + 3.5, 0.5, 70); // small pickup swell

// ---------- Section B (11-18): F major tutti fanfare ----------
const themeB = [
  "C5:q F5:q. F5:e A5:q",
  "G5:h E5:q C5:q",
  "D5:q. E5:e F5:q A5:q",
  "Bb5:h. A5:e G5:e",
  "A5:q C6:q A5:q F5:q",
  "G5:q. A5:e G5:q E5:q",
  "F5:h A4:q C5:q",
  "Eb5:h D5:e C5:e Bb4:e A4:e",
].join(" ");
const fB = (t) => 104 + 6 * Math.sin(((t - bar(11)) / 16) * Math.PI);
line("v1", themeB, bar(11), fB, { accent: 6 });
line("v1", themeB, bar(11), (t) => fB(t) - 15, { transpose: -12 });
line("tp", themeB, bar(11), (t) => fB(t) - 8, { legato: 0.85, accent: 8 });
line("fl", themeB, bar(11), (t) => fB(t) - 20, { transpose: 12 });
// Horns: sustained chord thirds/fifths
for (let n = 11; n <= 18; n++) {
  for (const c of H[n]) {
    add("hn", c.upper[0], bar(n) + c.b, c.d * 0.97, 92);
    add("hn", c.upper[1], bar(n) + c.b, c.d * 0.97, 88);
  }
}
// Driving strings: repeated eighths
for (let n = 11; n <= 18; n++) {
  for (const c of H[n]) {
    for (let t = c.b; t < c.b + c.d - 1e-6; t += 0.5) {
      const on = Math.abs(t - Math.round(t)) < 1e-6;
      for (const u of c.upper) {
        add("v2", u, bar(n) + t, 0.4, on ? 92 : 80);
      }
      add("lo", c.bass + 12, bar(n) + t, 0.4, on ? 98 : 84);
      add("lo", c.bass, bar(n) + t, 0.4, on ? 92 : 78);
    }
  }
}
// Trombones: half notes on the bass
for (let n = 11; n <= 18; n++) {
  for (const c of H[n]) {
    for (let t = c.b; t < c.b + c.d; t += 2) {
      add("tb", c.bass + 12, bar(n) + t, 1.9, 92);
    }
  }
}
// Timpani on F/C
for (let n = 11; n <= 18; n++) {
  const root = [11, 13, 14, 17, 18].includes(n) ? p("F2") : p("C3");
  add("ti", root, bar(n), 0.5, 108);
  add("ti", root, bar(n) + 2, 0.5, 92);
  if (n % 2 === 0) {
    for (let k = 0; k < 4; k++) {
      add("ti", root, bar(n) + 3 + k * 0.25, 0.24, 80 + k * 8);
    }
  }
}
add("cym", 49, bar(11), 2, 110);
add("cym", 49, bar(15), 2, 95);

// ---------- Section C (19-26): B-flat major, woodwinds over pizzicato & harp ----------
const themeC = [
  "F5:h D5:q F5:q",
  "G5:h. Bb5:q",
  "G5:h F5:q Eb5:q",
  "C5:h A4:q C5:q",
  "D5:h F5:q Bb5:q",
  "Bb5:q. G5:e Eb5:q G5:q",
  "F5:q Eb5:q D5:q C5:q",
  "Bb4:w",
].join(" ");
const mpC = (t) => 66 + 8 * Math.sin(((t - bar(19)) / 8) * Math.PI);
line("fl", themeC, bar(19), mpC, { legato: 0.98 });
// Oboe answers in the second phrase, a third below; in the first it echoes bar-end figures
line("ob", "r:h. Bb4:e C5:e D5:h. r:q Eb5:h D5:q C5:q A4:h F4:h", bar(19), 58, {
  legato: 0.98,
});
line(
  "ob",
  "Bb4:h D5:q F5:q G5:q. Eb5:e Bb4:q Eb5:q D5:q C5:q Bb4:q A4:q F4:w",
  bar(23),
  60,
  { legato: 0.98 },
);
// Pizzicato bass + chord on beats 2 and 4
for (let n = 19; n <= 26; n++) {
  for (const c of H[n]) {
    for (let t = c.b; t < c.b + c.d - 1e-6; t += 1) {
      if (t % 2 === 0) {
        add("pz", c.bass, bar(n) + t, 0.5, 70);
      } else {
        for (const u of c.upper.slice(0, 2)) {
          add("pz", u - 12, bar(n) + t, 0.4, 56);
        }
      }
    }
  }
}
// Harp: rolling arpeggios in eighths
for (let n = 19; n <= 26; n++) {
  for (const c of H[n]) {
    const arp = [
      c.bass + 12,
      c.upper[0],
      c.upper[1],
      c.upper[2],
      c.upper[1] + 12,
      c.upper[2],
      c.upper[1],
      c.upper[0],
    ];
    for (let k = 0; k < c.d * 2; k++) {
      add(
        "hp",
        arp[k % arp.length],
        bar(n) + c.b + k * 0.5,
        0.9,
        58 + (k === 0 ? 8 : 0),
      );
    }
  }
}
// Soft sustained strings underneath
for (let n = 19; n <= 26; n++) {
  for (const c of H[n]) {
    for (const u of c.upper) {
      add("v2", u - 12, bar(n) + c.b, c.d * 0.98, 42);
    }
  }
}
for (let n = 19; n <= 26; n++) {
  for (const c of H[n]) {
    add("lo", c.bass, bar(n) + c.b, c.d * 0.98, 46);
  }
}
add("hn", "F4", bar(25) + 2, 2, 50);
add("hn", "D4", bar(26), 4, 46);

// ---------- Build 2 (27-30): G minor -> C#dim7 -> A7(b9), crescendo ----------
const b2 = ramp(bar(27), bar(31), 62, 120);
line("v1", "G4:e A4:e Bb4:e C5:e D5:e E5:e F5:e G5:e", bar(27), b2);
line("v1", "Bb4:e C#5:e E5:e G5:e Bb5:e G5:e E5:e C#5:e", bar(28), b2);
for (let t = bar(29); t < bar(30) - 1e-6; t += 0.25) {
  add("v1", t % 0.5 === 0 ? p("A5") : p("Bb5"), t, 0.24, b2(t));
}
line(
  "v1",
  "A4:s Bb4:s C#5:s D5:s E5:s F5:s G5:s A5:s Bb5:s C#6:s D6:s E6:s C#6:q",
  bar(30),
  b2,
);
line(
  "fl",
  "r:w r:w A5:s Bb5:s A5:s Bb5:s A5:s Bb5:s A5:s Bb5:s A5:s Bb5:s A5:s Bb5:s A5:s Bb5:s A5:s Bb5:s E6:w",
  bar(27),
  b2,
);
for (let n = 27; n <= 30; n++) {
  for (const c of H[n]) {
    for (let t = 0; t < 4; t += 0.25) {
      const v = b2(bar(n) + t);
      add("v2", c.upper[(t * 4) % 3], bar(n) + t, 0.24, v - 10);
      if (t % 0.5 === 0) {
        add("lo", c.bass, bar(n) + t, 0.45, v - 4);
      }
      if (t % 0.5 === 0) {
        add("lo", c.bass - 12, bar(n) + t, 0.45, v - 12);
      }
    }
  }
}
for (let n = 27; n <= 30; n++) {
  for (let q = 0; q < 4; q++) {
    const t = bar(n) + q;
    const c = H[n][0];
    add("hn", c.upper[0], t, 0.98, b2(t) - 12);
    add("hn", c.upper[2] - 12, t, 0.98, b2(t) - 14);
    if (n >= 29) {
      add("tb", c.bass + 12, t, 0.98, b2(t) - 10);
    }
    if (n >= 29) {
      add("tp", c.upper[2], t, 0.98, b2(t) - 20);
    }
  }
}
add("ob", "C#5", bar(29), 8, 80);
for (let t = bar(29); t < bar(31) - 1e-6; t += 0.25) {
  add("ti", p("A2"), t, 0.24, ramp(bar(29), bar(31), 40, 120)(t));
}
add("cym", 57, bar(30), 4, 60); // suspended swell
add("cym", 57, bar(30) + 2, 2, 85);

// ---------- Section A' (31-38): the theme, tutti fortissimo ----------
const ff = (t) => 112 + 6 * Math.sin(((t - bar(31)) / 16) * Math.PI);
line("v1", themeA.replace("D5:h r:h", "D5:w"), bar(31), ff, { accent: 6 });
line("v1", themeA.replace("D5:h r:h", "D5:w"), bar(31), (t) => ff(t) - 14, {
  transpose: 12,
});
line("fl", themeA.replace("D5:h r:h", "D5:w"), bar(31), (t) => ff(t) - 22, {
  transpose: 12,
});
line("ob", themeA.replace("D5:h r:h", "D5:w"), bar(31), (t) => ff(t) - 30);
line("tp", themeA.replace("D5:h r:h", "D5:w"), bar(31), (t) => ff(t) - 14, {
  legato: 0.85,
  accent: 8,
});
for (let n = 31; n <= 38; n++) {
  for (const c of H[n]) {
    add("hn", c.upper[0], bar(n) + c.b, c.d * 0.97, 100);
    add("hn", c.upper[1], bar(n) + c.b, c.d * 0.97, 96);
    for (let t = c.b; t < c.b + c.d - 1e-6; t += 0.5) {
      const on = Math.abs(t - Math.round(t)) < 1e-6;
      for (const u of c.upper) {
        add("v2", u, bar(n) + t, 0.4, on ? 100 : 86);
      }
      add("lo", c.bass, bar(n) + t, 0.4, on ? 104 : 88);
      add("lo", c.bass - 12, bar(n) + t, 0.4, on ? 96 : 80);
    }
    for (let t = c.b; t < c.b + c.d; t += 2) {
      add("tb", c.bass, bar(n) + t, 1.9, 98);
      add("tb", c.upper[0] - 12, bar(n) + t, 1.9, 90);
    }
  }
}
for (let n = 31; n <= 38; n++) {
  const root = [33, 37].includes(n) ? p("A2") : p("D3");
  add("ti", root, bar(n), 0.5, 118);
  add("ti", root, bar(n) + 1.5, 0.3, 90);
  add("ti", root, bar(n) + 2, 0.5, 104);
  if (n === 37) {
    for (let k = 0; k < 8; k++) {
      add("ti", p("A2"), bar(n) + 2 + k * 0.25, 0.24, 90 + k * 4);
    }
  }
}
add("cym", 49, bar(31), 3, 122);
add("cym", 49, bar(35), 2, 100);
add("cym", 49, bar(38), 3, 118);

// ---------- Codetta (39-40): stab, then hushed turn back to the opening ----------
for (const k of ["v1", "v2", "hn", "tp", "tb"]) {
  for (const u of H[39][0].upper) {
    add(k, u, bar(39), 0.6, 112);
  }
}
add("lo", "D2", bar(39), 0.6, 115);
add("lo", "D3", bar(39), 0.6, 112);
add("ti", "D3", bar(39), 0.5, 120);
line("v1", "r:q A4:q Bb4:q C#5:q", bar(39), ramp(bar(39), bar(41), 62, 50));
line("v1", "D5:h C#5:h", bar(40), 52);
for (const c of H[40]) {
  for (const u of c.upper) {
    add("v2", u - 12, bar(40) + c.b, c.d * 0.98, 46);
  }
  add("lo", c.bass, bar(40) + c.b, c.d * 0.98, 52);
}
add("ti", "A2", bar(40) + 2, 0.4, 50);
line("ob", "r:h E5:h", bar(40), 48);

// ---------- Project ----------
const locators = [
  [1, "A · Theme"],
  [9, "Build"],
  [11, "B · Fanfare (F)"],
  [19, "C · Pastorale (B♭)"],
  [27, "Build"],
  [31, "A′ · Tutti"],
  [39, "Codetta"],
].map(([n, label]) => ({ beat: bar(n), label }));

const keyOf = (k) => ({ fifths: -1, mode: "minor" });
const order = [
  "fl",
  "ob",
  "hn",
  "tp",
  "tb",
  "ti",
  "cym",
  "hp",
  "v1",
  "v2",
  "pz",
  "lo",
];
const project = {
  title: "Overture in D minor",
  comment:
    "Classical-style overture. A (theme, strings) → build → B (fanfare in F) → C (pastorale in B♭) → build → A′ (tutti) → codetta that leads back to the top. Loops.",
  tempo: 112,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 0.8,
  loop: {
    enabled: true,
    range: { startBeat: 0, endBeat: bar(TOTAL_BARS + 1) },
  },
  locators,
  midiTracks: order.map((k) => {
    const t = tracks[k];
    t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
    return {
      name: t.name,
      program: t.program,
      ...(t.bank !== undefined ? { bank: t.bank } : {}),
      notes: t.notes,
      eq: { bypass: false, bands: [] },
      height: 120,
      viewMode: k === "v1" ? "editor" : "overview",
      gain: t.gain,
      pan: t.pan,
      muted: false,
      soloed: false,
      keySignature: keyOf(k),
    };
  }),
};

const json = JSON.stringify(project);
const payload = deflateRawSync(json).toString("base64url");
const url = `${SITE}/draft#p=${payload}`;
writeFileSync(new URL("./link.txt", import.meta.url), url + "\n");
console.error(
  `notes: ${project.midiTracks.reduce((s, t) => s + t.notes.length, 0)}, json ${json.length}B, url ${url.length} chars`,
);
