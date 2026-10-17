// Orchestral city pop for Toy MIDI. Writes project.json (SharedProject).
import { writeFileSync } from "node:fs";

const TEMPO = 112;
const BAR = 4; // beats per bar
const S = 0.25; // one 16th in beats

// ---------- pitch helpers ----------
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function pc(name) {
  let v = PC[name[0]];
  for (const c of name.slice(1)) v += c === "#" ? 1 : c === "b" ? -1 : 0;
  return (v + 12) % 12;
}
function midi(n) {
  const m = n.match(/^([A-G][b#]?)(-?\d)$/);
  if (!m) throw new Error("bad note " + n);
  const base = PC[m[1][0]] + (m[1][1] === "#" ? 1 : m[1][1] === "b" ? -1 : 0);
  return base + (Number(m[2]) + 1) * 12;
}

// ---------- chord chart (one entry per bar, space = split bar) ----------
const CHORUS_EB = ["Abmaj7", "G7b9", "Cm7", "Bbm7 Eb7"];
const CHORUS_E = ["Amaj7", "G#7b9", "C#m7", "Bm7 E7"];
const chart = [
  // Intro 0-7: the chorus hook as a teaser
  "Abmaj7", "G7b9", "Cm7", "Bbm7 Eb7", "Abmaj7", "G7b9", "Cm7 F7", "Fm7 Bb7sus4",
  // Verse 8-23
  "Ebmaj7", "Cm7", "Fm7", "Bb13", "Gm7", "C7b9", "Fm7", "Bb7sus4",
  "Ebmaj7", "Cm7", "Fm7", "Bb13", "Abmaj7", "Gm7", "Fm7 Gm7", "Abmaj7 Bb7sus4",
  // Pre-chorus 24-31
  "Abmaj7", "Bb/Ab", "Gm7", "Cm7", "Fm7", "Gm7 C7", "Abmaj7 Abm6", "Bb7sus4 Bb7b9",
  // Chorus 32-47
  ...CHORUS_EB, ...CHORUS_EB, ...CHORUS_EB, ...CHORUS_EB,
  // Interlude 48-55: brass soli, slides down a half step into E
  "Abmaj7", "Gm7", "Fm7", "Bb7sus4", "Abmaj7", "Gm7 C7", "F#m7 B7sus4", "Bm7 E7b9",
  // Last chorus in E 56-71
  ...CHORUS_E, ...CHORUS_E, ...CHORUS_E, ...CHORUS_E,
  // Turnaround 72-73, back to the intro in Eb
  "Amaj7", "Bbm7 Eb7",
];
const NBARS = chart.length; // 74

const QUAL = {
  maj7: [4, 7, 11, 14],
  m7: [3, 7, 10, 14],
  "7": [4, 7, 10, 14],
  "13": [4, 10, 14, 21],
  "7b9": [4, 7, 10, 13],
  "7sus4": [5, 7, 10, 14],
  m6: [3, 7, 9, 14],
  "": [0, 4, 7, 14],
};
function parseChord(sym) {
  const [main, slash] = sym.split("/");
  const m = main.match(/^([A-G][b#]?)(.*)$/);
  const root = pc(m[1]);
  const tones = QUAL[m[2]];
  if (!tones) throw new Error("quality " + sym);
  return { sym, root, bass: slash ? pc(slash) : root, tones: tones.map((t) => (root + t) % 12), fifth: (root + 7) % 12 };
}
// chords as timed events
const chords = [];
chart.forEach((bar, i) => {
  const parts = bar.split(" ");
  const len = BAR / parts.length;
  parts.forEach((p, j) => chords.push({ ...parseChord(p), start: i * BAR + j * len, dur: len, bar: i }));
});
const chordAt = (beat) => chords.findLast((c) => c.start <= beat + 1e-9);
const nextChord = (c) => chords[chords.indexOf(c) + 1] ?? chords[0];

// voice-leading voicer: pick one octave per tone inside [lo, hi], nearest to previous
function makeVoicer(lo, hi, count = 4) {
  let prev;
  return (chord) => {
    const tones = chord.tones.slice(0, count);
    const options = tones.map((t) => {
      const o = [];
      for (let p = lo; p <= hi; p++) if (p % 12 === t) o.push(p);
      return o;
    });
    let best, bestCost = Infinity;
    const rec = (i, acc) => {
      if (i === options.length) {
        const s = [...acc].sort((a, b) => a - b);
        if (s[s.length - 1] - s[0] > 14) return;
        for (let k = 1; k < s.length; k++) if (s[k] === s[k - 1]) return;
        const center = (lo + hi) / 2;
        const cost = prev
          ? s.reduce((a, p, k) => a + Math.abs(p - prev[k]), 0)
          : Math.abs(s.reduce((a, b) => a + b, 0) / s.length - center);
        if (cost < bestCost) (bestCost = cost), (best = s);
        return;
      }
      for (const p of options[i]) rec(i + 1, [...acc, p]);
    };
    rec(0, []);
    prev = best;
    return best;
  };
}
// put a pitch class in [lo, lo+11]
const inRange = (p, lo) => lo + ((((p - lo) % 12) + 12) % 12);

// ---------- tracks ----------
const tracks = {};
function track(name, program, gain, pan) {
  tracks[name] = { name, program, gain, pan, notes: [] };
  return tracks[name].notes;
}
const add = (arr, pitch, start, duration, velocity) => {
  arr.push({ pitch, start: +start.toFixed(4), duration: +duration.toFixed(4), velocity: Math.max(1, Math.min(127, Math.round(velocity))) });
};
// melody string: "r:2 Bb4:2 ..." durations in 16ths
function melody(arr, startBeat, str, vel, transpose = 0, accent = true) {
  let t = startBeat;
  for (const tok of str.trim().split(/\s+/)) {
    const [n, d] = tok.split(":");
    const dur = Number(d) * S;
    if (n !== "r") {
      const onBeat = Math.abs(t - Math.round(t)) < 1e-9;
      add(arr, midi(n) + transpose, t, dur * 0.95, vel + (accent && onBeat ? 4 : 0) + (dur >= 1 ? 3 : 0));
    }
    t += dur;
  }
  return t;
}
const bar = (i, pos16 = 0) => i * BAR + pos16 * S;

// sections
const SEC = { intro: [0, 8], verse: [8, 24], pre: [24, 32], chorus: [32, 48], inter: [48, 56], last: [56, 72], turn: [72, 74] };
const sectionOf = (b) => Object.entries(SEC).find(([, [a, z]]) => b >= a && b < z)[0];
const BUILDS = { 7: "mid", 15: "light", 23: "mid", 31: "big", 47: "mid", 55: "huge", 73: "big" };

// ---------- melodies ----------
const flute = track("Flute", 73, 0.85, 0.2);
const clarinet = track("Clarinet", 71, 0.75, -0.15);
const violins = track("Violins", 48, 1.0, -0.35);
const horns = track("Horns", 60, 0.5, -0.25);
const glock = track("Glockenspiel", 9, 1.5, 0.45);
const trumpet = track("Trumpet", 56, 1.0, 0.1);
const trombone = track("Trombone", 57, 0.5, 0.3);

const VERSE1 = `
  r:2 Bb4:2 Eb5:2 F5:2 G5:4 F5:2 D5:2
  Eb5:6 r:2 D5:2 Eb5:2 G5:2 Bb5:2
  Ab5:4 G5:2 F5:2 Eb5:2 C5:4 r:2
  r:2 D5:2 Eb5:2 F5:2 G5:6 r:2
  Bb5:4 G5:2 F5:2 D5:4 F5:2 G5:2
  E5:6 Db5:2 C5:2 Bb4:2 G4:4
  Ab4:2 C5:2 Eb5:2 G5:6 F5:2 Eb5:2
  F5:8 Eb5:2 C5:2 Bb4:4`;
const VERSE2 = `
  r:2 Bb4:2 Eb5:2 F5:2 G5:4 Bb5:2 G5:2
  D6:6 r:2 C6:2 Bb5:2 G5:2 Eb5:2
  F5:4 Eb5:2 C5:2 Eb5:2 Ab5:4 r:2
  G5:2 F5:2 D5:2 F5:2 G5:8
  r:2 C6:2 Bb5:2 G5:2 Eb5:6 r:2
  r:2 D6:2 C6:2 Bb5:2 F5:6 r:2
  Ab5:4 G5:2 F5:2 G5:4 Bb5:2 C6:2
  Eb6:8 r:8`;
melody(flute, bar(8), VERSE1, 82);
melody(flute, bar(16), VERSE2, 88);
melody(clarinet, bar(16), VERSE2, 70, -12);

const PRE = `
  C5:4 Bb4:2 C5:2 Eb5:8
  D5:4 C5:2 D5:2 F5:8
  G5:6 F5:2 D5:4 Bb4:4
  C5:4 D5:2 Eb5:2 G5:8
  Ab5:6 G5:2 F5:4 Eb5:4
  D5:4 F5:4 E5:4 G5:4
  G5:8 F5:4 Eb5:4
  F5:8 r:8`;
melody(clarinet, bar(24), PRE, 84);
melody(horns, bar(24), PRE, 112, -12);

// chorus hook, pickup on the last beat of the bar before
const CH_PICKUP = "Eb5:2 F5:2";
const CH_A = `
  G5:6 Ab5:2 G5:2 Eb5:2 C5:4
  B4:2 D5:2 F5:2 Ab5:6 G5:4
  Eb5:4 D5:2 Eb5:2 G5:4 Bb5:4
  Ab5:4 Db6:4 C6:2 Bb5:2 Eb5:2 F5:2`;
const CH_B = `
  G5:6 Ab5:2 G5:2 Eb5:2 C6:4
  B5:4 D6:2 B5:2 Ab5:4 G5:4
  Eb6:6 D6:2 C6:2 Bb5:2 G5:4
  F5:4 Ab5:4 G5:4 Eb5:2 F5:2`;
const CH_B_END = CH_B.replace("F5:4 Ab5:4 G5:4 Eb5:2 F5:2", "Db6:6 C6:2 Bb5:4 G5:4");
const CHORUS = CH_A + CH_B + CH_A + CH_B_END;

melody(violins, bar(31, 12), CH_PICKUP, 90);
melody(violins, bar(32), CHORUS, 100);
melody(flute, bar(31, 12), CH_PICKUP, 86);
melody(flute, bar(32), CHORUS, 94);
// last chorus in E: violins in octaves, flute on top, trumpet joins for the second half
melody(violins, bar(56), CHORUS, 108, 1);
melody(violins, bar(56), CHORUS, 96, -11);
melody(flute, bar(56), CHORUS, 100, 1);
melody(trumpet, bar(64), CH_A + CH_B_END, 90, 1);
melody(flute, bar(72), "G#5:16", 90);
melody(violins, bar(72), "G#5:14", 92);

// interlude brass soli (trumpet, trombone an octave down)
const SOLI = `
  r:2 Eb5:1 F5:1 G5:2 Bb5:2 r:2 C6:2 r:2 Bb5:2
  G5:4 F5:2 D5:2 r:4 Bb4:2 D5:2
  F5:2 Ab5:2 C6:2 Eb6:4 C6:2 Ab5:2 F5:2
  Ab5:6 F5:2 Eb5:4 r:4
  r:2 Eb5:1 F5:1 G5:2 Bb5:2 r:2 C6:2 r:2 Bb5:2
  G5:4 Bb5:2 D6:2 E6:4 C6:2 Bb5:2
  A5:4 C#6:2 A5:2 A5:4 F#5:2 E5:2
  D6:4 B5:2 A5:2 G#5:2 B5:2 D6:2 F6:2`;
melody(trumpet, bar(48), SOLI, 108);
melody(trombone, bar(48), SOLI, 90, -12);

// intro: glockenspiel teases the hook, flute answers in the second half
const INTRO_GLOCK = `
  r:4 G5:2 Ab5:2 G5:2 Eb5:2 C5:4
  r:4 B4:2 D5:2 F5:2 Ab5:6
  r:4 G5:2 Bb5:2 D6:8
  Db6:4 C6:4 Bb5:4 G5:4`;
melody(glock, bar(0), INTRO_GLOCK, 96, 12);
melody(flute, bar(4), INTRO_GLOCK.split("\n").slice(0, 4).join("\n"), 78);
// glock sparkle on the first bar of each cycle in the last chorus
for (const b of [56, 60, 64, 68]) melody(glock, bar(b), "G5:6 Ab5:2 G5:2 Eb5:2 C6:4", 96, 13);

// ---------- harmony & groove ----------
const lowStrings = track("Low Strings", 49, 0.42, 0.25);
const pizzChops = track("Pizzicato", 45, 0.6, 0.4);
const pizzBass = track("Pizz Bass", 45, 0.85, 0);
const contrabass = track("Contrabass", 43, 0.6, 0);
const brass = track("Brass Section", 61, 0.75, 0.15);
const harp = track("Harp", 46, 0.5, -0.5);
const timpani = track("Timpani", 47, 0.8, -0.1);
const runs = track("String Runs", 48, 1.0, -0.2);

const vLow = makeVoicer(50, 67);
const vViolinPad = makeVoicer(64, 81);
const vHorn = makeVoicer(53, 70);
const vBrass = makeVoicer(60, 77);
const vChop = makeVoicer(60, 74, 3);

const secVel = { intro: 62, verse: 70, pre: 80, chorus: 92, inter: 82, last: 100, turn: 92 };

for (const c of chords) {
  const sec = sectionOf(c.bar);
  const v = secVel[sec];
  const isBuild = BUILDS[c.bar] && c.start + c.dur === (c.bar + 1) * BAR;

  // low strings pad: always
  for (const p of vLow(c)) add(lowStrings, p, c.start, c.dur - 0.05, v - 10 + (sec === "pre" ? (c.bar - 24) * 2 : 0));

  // violins pad: intro, second verse half, pre-chorus
  const vp = vViolinPad(c);
  if (sec === "intro" || (sec === "verse" && c.bar >= 16) || sec === "pre")
    for (const p of vp) add(violins, p, c.start, c.dur - 0.05, v - 38 + (sec === "pre" ? (c.bar - 24) * 2 : 0));

  // horns: intro second half pad, chorus/interlude/last rhythmic pads with a push
  const hv = vHorn(c);
  if ((sec === "intro" && c.bar >= 4) || sec === "verse")
    for (const p of hv) add(horns, p, c.start, c.dur - 0.05, sec === "verse" ? 46 : 56);
  if (sec === "chorus" || sec === "inter" || sec === "last" || sec === "turn") {
    for (const p of hv) {
      add(horns, p, c.start, Math.min(c.dur, 2) - 0.1, v - 42);
      if (c.dur === 4) add(horns, p, c.start + 2.5, 1.4, v - 46);
    }
  }

  // contrabass sustains
  const root = inRange(c.bass, 28);
  if ((sec === "intro" && c.bar < 4) || sec === "pre" || sec === "chorus" || sec === "inter" || sec === "last" || sec === "turn")
    add(contrabass, root, c.start, c.dur - 0.05, v - 5);

  // brass stabs
  const bv = vBrass(c);
  const stab = (pos, dur, vel, ch = c) => {
    const voicing = ch === c ? bv : vBrass(ch);
    for (const p of voicing) add(brass, p, c.start + pos * S, dur * S, vel);
  };
  if (sec === "chorus" || sec === "last" || (sec === "intro" && c.bar >= 4)) {
    const cyc = (c.bar - (sec === "last" ? 56 : sec === "chorus" ? 32 : 4)) % 4;
    const bump = sec === "last" ? 8 : sec === "intro" ? -18 : 0;
    if (!isBuild) {
      if (c.dur === 4 && cyc !== 1) { stab(0, 2, 96 + bump); stab(10, 2, 88 + bump); }
      if (c.dur === 4 && cyc === 1) { stab(6, 2, 90 + bump); stab(12, 1, 80 + bump); }
      if (c.dur === 2) stab(0, 2, 92 + bump);
    }
  }
  if (sec === "inter" && c.dur === 4 && (c.bar === 48 || c.bar === 52)) stab(0, 3, 96);

  // pizzicato chops (the cutting-guitar part)
  const cv = vChop(c);
  const chopFull = [[2, 92], [5, 66], [6, 96], [10, 92], [13, 66], [14, 96]];
  const chopLight = [[2, 80], [6, 84], [10, 80], [14, 84]];
  const pattern =
    sec === "verse" || (sec === "intro" && c.bar >= 4) ? chopLight
    : sec === "pre" || sec === "chorus" || sec === "inter" || sec === "last" || sec === "turn" ? chopFull
    : null;
  if (pattern && !isBuild)
    for (const [pos, vel] of pattern) {
      const at = pos * S;
      if (at >= c.dur) continue;
      for (const p of cv) add(pizzChops, p, c.start + at, S * 0.9, vel + (sec === "last" ? 6 : 0) - (sec === "verse" ? 8 : 0));
    }

  // pizz bass: octave-popping 16th groove with a chromatic approach
  if (!isBuild && !(sec === "intro" && c.bar < 4)) {
    const r = inRange(c.bass, 31);
    const f = inRange(c.fifth, r);
    const nxt = inRange(nextChord(c).bass, 31);
    const approach = nxt > r ? nxt - 1 : nxt + 1;
    const light = sec === "verse" || sec === "intro";
    const half = [[0, r, 3, 112], [3, r, 1, 78], [6, r + 12, 2, 104]];
    const full = [...half, [8, r, 2, 108], [10, f, 1, 84], [11, r + 12, 1, 96], [12, r, 1, 80], [14, approach, 2, 100]];
    const lightFull = [[0, r, 3, 108], [6, r + 12, 2, 98], [8, r, 2, 100], [14, approach, 2, 92]];
    const pat = c.dur === 2 ? half : light ? lightFull : full;
    for (const [pos, p, d, vel] of pat) add(pizzBass, p, c.start + pos * S, d * S * 0.9, vel - (light ? 6 : 0));
  }

  // harp arpeggios: 16ths in the intro head and pre-chorus, 8ths in the verse
  const step = sec === "verse" ? 0.5 : S;
  if ((sec === "intro" && c.bar < 4) || sec === "verse" || sec === "pre") {
    const ladder = [inRange(c.root, 43), inRange(c.root, 43) + 7, ...vHornLadder(c)];
    const seq = [...ladder, ...ladder.slice(1, -1).reverse()];
    let k = 0;
    for (let t = 0; t < c.dur - 1e-9 && !(isBuild && t >= c.dur - 1); t += step, k++)
      add(harp, seq[k % seq.length], c.start + t, step * 2, (sec === "verse" ? 58 : 66) + (k % 4 === 0 ? 8 : 0));
  }
}
function vHornLadder(c) {
  const out = [];
  for (const t of c.tones) out.push(inRange(t, 55));
  for (const t of c.tones) out.push(inRange(t, 67));
  return [...new Set(out)].sort((a, b) => a - b);
}

// timpani: section downbeats
const timpRoot = (c) => inRange(c.bass, 41);
for (const b of [0, 8, 24, 32, 36, 40, 44, 48, 56, 60, 64, 68, 72]) {
  const c = chordAt(bar(b));
  add(timpani, timpRoot(c), bar(b), 1.5, b >= 56 ? 112 : b === 0 || b === 8 ? 90 : 104);
}
// chorus: timpani pushes the root on the & of 4 into each cycle
for (const b of [35, 39, 43, 59, 63, 67]) add(timpani, timpRoot(chordAt(bar(b + 1))), bar(b, 14), 0.4, 88);

// ---------- build-ups ----------
const SCALES = {
  Eb: [3, 5, 7, 8, 10, 0, 2], Ab: [8, 10, 0, 1, 3, 5, 7], A: [9, 11, 1, 2, 4, 6, 8],
};
function scaleRun(arr, start, len, key, from, vel0, vel1, step = S) {
  const pcs = new Set(SCALES[key]);
  const n = Math.round(len / step);
  let p = from;
  for (let k = 0; k < n; k++) {
    while (!pcs.has(((p % 12) + 12) % 12)) p++;
    add(arr, p, start + k * step, step * 0.95, vel0 + ((vel1 - vel0) * k) / Math.max(1, n - 1));
    p++;
  }
}
const BUILD_KEY = { 7: "Eb", 15: "Eb", 23: "Eb", 31: "Eb", 47: "Eb", 55: "A", 73: "Ab" };
for (const [bStr, size] of Object.entries(BUILDS)) {
  const b = Number(bStr);
  const key = BUILD_KEY[b];
  const end = bar(b + 1);
  const last = chordAt(end - 0.01);
  const landing = chordAt(end % (NBARS * BAR));

  // harp glissando over the last beat
  scaleRun(harp, end - 1, 1, key, 55, 60, 100, 1 / 16);
  if (size === "light") continue;

  // strings run: half bar for mid, whole bar otherwise
  const runLen = size === "mid" ? 2 : 4;
  scaleRun(runs, end - runLen, runLen, key, size === "mid" ? 62 : 55, 60, 112);

  // timpani roll on the dominant, crescendo
  const rollLen = size === "mid" ? 1 : size === "big" ? 2 : 4;
  for (let t = end - rollLen, k = 0, n = rollLen * 8; t < end - 1e-9; t += 0.125, k++)
    add(timpani, timpRoot(last), t, 0.12, 40 + (75 * k) / n);

  // bass pedals in 8ths on the dominant, rising
  const r = inRange(last.bass, 31);
  const pedalStart = size === "mid" ? end - 2 : end - 4;
  const lastBar = bar(b);
  // rest of the bar before the pedal keeps a plain root
  if (pedalStart > lastBar) add(pizzBass, inRange(chordAt(lastBar).bass, 31), lastBar, pedalStart - lastBar - 0.1, 100);
  for (let t = pedalStart, k = 0; t < end - 1e-9; t += 0.5, k++)
    add(pizzBass, r + (k % 2 ? 12 : 0), t, 0.4, 84 + k * 4);
  // pizz chops: straight 8ths crescendo
  for (let t = pedalStart, k = 0; t < end - 1e-9; t += 0.5, k++)
    for (const p of vChop(chordAt(t))) add(pizzChops, p, t, 0.2, 70 + k * 5);
  if (pedalStart > lastBar) for (const p of vChop(chordAt(lastBar))) add(pizzChops, p, lastBar, 0.3, 84);

  // brass: repeated 8th hits climbing in velocity, then a push into the downbeat
  if (size !== "mid") {
    for (let t = end - 2, k = 0; t < end - 0.5 - 1e-9; t += 0.5, k++)
      for (const p of vBrass(chordAt(t))) add(brass, p, t, 0.3, 66 + k * 12);
    for (const p of vBrass(landing)) add(brass, p, end - 0.5, b === 73 ? 1.5 : 2.5, 118);
  } else {
    for (const p of vBrass(last)) add(brass, p, end - 1, 0.9, 72);
  }
}

// ---------- project ----------
const order = ["Flute", "Clarinet", "Violins", "Horns", "Trumpet", "Trombone", "Brass Section", "Glockenspiel", "Harp", "Pizzicato", "Low Strings", "String Runs", "Pizz Bass", "Contrabass", "Timpani"];
const project = {
  title: "Night Cruise Overture",
  comment:
    "Orchestral city pop: no drum kit, so the groove comes from pizzicato basses popping octaves, pizzicato chops on the offbeats like a cutting guitar, and brass stabs pushing the & of 4. Chorus on the IVmaj7-III7-vim7-v7-I7 'Just the Two of Us' progression in Eb, last chorus up a half step in E, turnaround slides back to the top.",
  tempo: TEMPO,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { enabled: true, range: { startBeat: 0, endBeat: NBARS * BAR } },
  locators: [
    { beat: bar(0), label: "Intro" },
    { beat: bar(8), label: "Verse" },
    { beat: bar(24), label: "Pre-chorus" },
    { beat: bar(32), label: "Chorus" },
    { beat: bar(48), label: "Brass interlude" },
    { beat: bar(56), label: "Last chorus (E)" },
    { beat: bar(72), label: "Turnaround" },
  ],
  midiTracks: order.map((n) => {
    const t = tracks[n];
    t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
    return t;
  }),
};
writeFileSync("project.json", JSON.stringify(project));
console.log(order.map((n) => `${n}: ${tracks[n].notes.length}`).join("\n"));
console.log("bars", NBARS, "seconds", ((NBARS * BAR * 60) / TEMPO).toFixed(1));
