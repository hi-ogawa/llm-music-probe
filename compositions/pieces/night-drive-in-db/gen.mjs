import { deflateRawSync } from "node:zlib";
import { writeFileSync } from "node:fs";

// ---------- helpers ----------
let seed = 7;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const hv = (v, spread = 6) => Math.max(1, Math.min(127, Math.round(v + (rand() - 0.5) * 2 * spread)));
const SWING = 0.03;
const swing = (t) => {
  const f = ((t % 0.5) + 0.5) % 0.5;
  return Math.abs(f - 0.25) < 1e-6 ? t + SWING : t;
};
const B = (bar, beat = 0) => (bar - 1) * 4 + beat; // bar is 1-based
const note = (pitch, start, duration, velocity, opts = {}) => ({
  pitch,
  start: +(opts.noSwing ? start : swing(start)).toFixed(4),
  duration: +duration.toFixed(4),
  velocity: hv(velocity, opts.spread ?? 6),
});

// ---------- harmony ----------
// qualities: maj7, m7, 7, 7b13
const SETS = {
  maj7: { A: [4, 7, 11, 14], B: [11, 14, 16, 19], brass: [4, 7, 11, 14], sev: 11 },
  m7: { A: [3, 7, 10, 14], B: [10, 14, 15, 19], brass: [3, 7, 10, 14], sev: 10 },
  "7": { A: [4, 9, 10, 14], B: [10, 14, 16, 21], brass: [4, 9, 10, 14], sev: 10 },
  "7b13": { A: [4, 8, 10, 15], B: [10, 15, 16, 20], brass: [4, 8, 10, 15], sev: 10 },
};
// degrees relative to tonic (semitones)
const IV = [5, "maj7"], III7 = [4, "7b13"], vi = [9, "m7"], v = [7, "m7"], I7 = [0, "7"];
const V7 = [7, "7"], iii = [4, "m7"], ii = [2, "m7"], Imaj = [0, "maj7"];

const chords = []; // {start, end, rootPc, q, section}
const add = (bar, beat, len, [deg, q], tonic, section) =>
  chords.push({ start: B(bar, beat), end: B(bar, beat) + len, rootPc: (tonic + deg) % 12, q, section, bar });

const Db = 1, D = 2;
// Verse: JTTOU x2
for (const base of [1, 5]) {
  add(base, 0, 4, IV, Db, "verse");
  add(base + 1, 0, 4, III7, Db, "verse");
  add(base + 2, 0, 4, vi, Db, "verse");
  add(base + 3, 0, 2, v, Db, "verse");
  add(base + 3, 2, 2, I7, Db, "verse");
}
// Chorus (royal road, accelerating harmonic rhythm)
function chorus(base, tonic, last) {
  add(base, 0, 4, IV, tonic, "chorus");
  add(base + 1, 0, 4, V7, tonic, "chorus");
  add(base + 2, 0, 4, iii, tonic, "chorus");
  add(base + 3, 0, 4, vi, tonic, "chorus");
  add(base + 4, 0, 2, IV, tonic, "chorus");
  add(base + 4, 2, 2, V7, tonic, "chorus");
  add(base + 5, 0, 2, iii, tonic, "chorus");
  add(base + 5, 2, 2, vi, tonic, "chorus");
  add(base + 6, 0, 1, ii, tonic, "chorus");
  add(base + 6, 1, 1, iii, tonic, "chorus");
  add(base + 6, 2, 1, IV, tonic, "chorus");
  add(base + 6, 3, 1, V7, tonic, "chorus");
  if (last) {
    add(base + 7, 0, 4, Imaj, tonic, "chorus");
  } else {
    add(base + 7, 0, 2, Imaj, tonic, "chorus");
    // pivot: v7–I7 of the new key (D): Am7–D7
    add(base + 7, 2, 1, v, D, "chorus");
    add(base + 7, 3, 1, I7, D, "chorus");
  }
}
chorus(9, Db, false);
chorus(17, D, true);
const chordAt = (t) => chords.find((c) => t >= c.start - 1e-6 && t < c.end - 1e-6);
// anticipation: a hit within 0.25 beat before a change takes the next chord
const chordAtAnt = (t) => chordAt(t + 0.25 + 1e-6) && chordAt(t + 0.25 + 1e-6) !== chordAt(t) && chordAt(t + 0.25 + 1e-6).start - t <= 0.25 + 1e-6 ? chordAt(t + 0.25 + 1e-6) : chordAt(t);

// ---------- Rhodes: rootless A/B with nearest-voice motion (guide tones) ----------
function rootless(c, prev) {
  const cands = [];
  for (const form of ["A", "B"]) {
    for (let base = 36; base < 72; base += 12) {
      const v = SETS[c.q][form].map((i) => base + c.rootPc + i);
      if (v[0] >= 50 && v[0] <= 62) cands.push({ form, v });
    }
  }
  if (!prev) return cands.reduce((a, b) => (Math.abs(a.v[0] - 55) <= Math.abs(b.v[0] - 55) ? a : b));
  const dist = (x) => x.v.reduce((s, p, i) => s + Math.abs(p - prev.v[i]), 0);
  return cands.reduce((a, b) => (dist(a) <= dist(b) ? a : b));
}
const voicings = new Map();
{
  let prev;
  for (const c of chords) voicings.set(c, (prev = rootless(c, prev)));
}
const rhodes = [];
for (const c of chords) {
  const voi = voicings.get(c).v;
  // push changes that land on beat 3 or the downbeat in the chorus by a 16th
  const onBeat3 = Math.abs((c.start % 4) - 2) < 1e-6;
  let t = c.start;
  if (onBeat3 || (c.section === "chorus" && c.start % 4 === 0 && c.start > B(9) && c.end - c.start >= 2)) t -= 0.25;
  if (c.bar === 24) t = c.start;
  const len = c.end - c.start;
  const dur = c.bar === 24 ? 4 : Math.min(len, 1.6) - 0.1 + (c.start - t);
  const vel = c.section === "verse" ? 72 : 82;
  for (const p of voi) rhodes.push(note(p, t, dur, vel, { spread: 4 }));
  // re-hit on the "and" of 3 in single-chord bars
  if (len === 4 && c.bar !== 24) for (const p of voi) rhodes.push(note(p, c.start + 2.5, 1.0, vel - 14, { spread: 4 }));
}

// ---------- Drums ----------
const K = 36, SN = 38, SS = 37, CL = 39, CH = 42, OH = 46, CR = 49, T_HI = 50, T_M = 48, T_LM = 47, T_L = 45;
const drums = [];
const fillBars = new Set([10, 12, 14, 18, 20, 22]); // slap fill on beats 3–4
function kickFor(bar) {
  if (bar === 24) return [0];
  if (bar === 15 || bar === 23) return [0, 1, 2, 3];
  if (bar === 16) return [0, 2, 3];
  if (bar <= 8) return bar === 8 ? [0, 1.75] : [0, 1.75, 2.5];
  const k = [0, 0.75, 1.75, 2.5];
  if (fillBars.has(bar)) k.push(3);
  return k;
}
const LAID_BACK = 0.025;
for (let bar = 1; bar <= 24; bar++) {
  const chorus = bar >= 9;
  for (const k of kickFor(bar)) drums.push(note(K, B(bar, k), 0.25, k === 0 ? 112 : 100));
  if (bar === 24) {
    drums.push(note(CR, B(bar), 3, 115), note(SN, B(bar), 0.5, 110, { noSwing: true }));
    continue;
  }
  if ([9, 13, 17, 21].includes(bar) || bar === 16) drums.push(note(CR, B(bar), 2, 110));
  // fill region
  const fillFrom = bar === 8 || bar === 16 ? 2 : 4;
  // hats: verse A 8ths + one ghost, verse B and chorus 16ths with an accent map
  for (let s = 0; s < 16; s++) {
    const t = s / 4;
    if (t >= fillFrom) break;
    if (bar === 16 && t < 2) continue; // crash carries it
    const sub = s % 4;
    if (bar <= 4 && sub === 1) continue;
    if (bar <= 4 && sub === 3 && s !== 3 && s !== 11) continue;
    const vel = [86, 36, 68, 44][sub];
    const open = chorus && s === 14;
    drums.push(note(open ? OH : CH, B(bar, t), open ? 0.5 : 0.2, vel, { spread: 5 }));
  }
  // backbeat, laid back
  for (const bb of [1, 3]) {
    if (bb >= fillFrom) continue;
    const t = B(bar, bb) + LAID_BACK;
    if (bar <= 4) drums.push(note(SS, t, 0.25, 92, { noSwing: true }));
    else {
      drums.push(note(SN, t, 0.25, chorus ? 108 : 98, { noSwing: true }));
      if (chorus) drums.push(note(CL, t, 0.25, 70, { noSwing: true }));
    }
  }
  // snare ghost notes
  if (bar >= 5) for (const g of [0.75, 2.25, 3.75]) if (g < fillFrom) drums.push(note(SN, B(bar, g), 0.1, 28, { spread: 4 }));
  // fills
  if (bar === 8) for (let s = 0; s < 8; s++) drums.push(note(SN, B(bar, 2 + s / 4), 0.2, 52 + s * 8));
  if (bar === 16) {
    const toms = [SN, SN, T_HI, T_HI, T_M, T_M, T_LM, T_L];
    toms.forEach((p, s) => drums.push(note(p, B(bar, 2 + s / 4), 0.2, 80 + s * 4)));
  }
  if (bar === 15 || bar === 23) for (const s of [3, 3.25, 3.5, 3.75]) drums.push(note(SN, B(bar, s), 0.2, 70 + (s - 3) * 60));
}

// ---------- Bass: finger line locked to the kick, slap fills in the chorus ----------
const bassPitch = (pc) => 28 + ((pc - 4 + 12) % 12);
const finger = [], slap = [];
for (let bar = 1; bar <= 24; bar++) {
  const chorus = bar >= 9;
  if (bar === 24) {
    finger.push(note(bassPitch(chordAt(B(24)).rootPc), B(24), 3.5, 110));
    continue;
  }
  const fillFrom = bar === 16 ? 2 : fillBars.has(bar) ? 3 : 4;
  let pos;
  if (bar === 15 || bar === 23) {
    pos = [[0, "R"], [0.5, "O"], [1, "R"], [1.5, "O"], [2, "R"], [2.5, "O"], [3, "R"], [3.5, "A"]];
  } else {
    pos = kickFor(bar).map((k) => [k, "R"]);
    if (chorus) pos.push([3, "O"], [3.5, "A"]);
    else pos.push([3, "F"], [3.5, "A"]);
  }
  pos = pos.filter(([t]) => t < fillFrom).sort((a, b) => a[0] - b[0]);
  const seen = new Set();
  pos = pos.filter(([t]) => (seen.has(t) ? false : seen.add(t)));
  pos.forEach(([t, kind], i) => {
    const abs = B(bar, t);
    const c = chordAtAnt(abs);
    const r = bassPitch(c.rootPc);
    const next = chordAt(B(bar + 1)) ?? c;
    const nextRoot = bassPitch(next.rootPc);
    let p = r;
    if (kind === "O") p = r + 12;
    if (kind === "F") p = r + 7;
    if (kind === "A") p = nextRoot === r ? r + 7 : nextRoot - 1;
    const nextT = i + 1 < pos.length ? pos[i + 1][0] : fillFrom;
    const cap = chorus ? 0.45 : 0.9;
    const dur = Math.max(0.15, Math.min(cap, nextT - t - 0.05));
    const ghostish = kind === "O" ? 72 : t % 1 === 0 ? 104 : 94;
    finger.push(note(p, abs, kind === "O" ? 0.2 : dur, ghostish));
  });
  // slap fill: thumb root, pop octave, dead-note thumb, pop 7th, per chord inside the window
  if (fillFrom < 4) {
    for (let t = fillFrom; t < 4; t += 1) {
      const c = chordAt(B(bar, t));
      const r = bassPitch(c.rootPc);
      slap.push(note(r, B(bar, t), 0.2, 112));
      slap.push(note(r + 12, B(bar, t + 0.25), 0.15, 104));
      slap.push(note(r, B(bar, t + 0.5), 0.1, 50));
      slap.push(note(r + SETS[c.q].sev, B(bar, t + 0.75), 0.2, 100));
    }
  }
}

// ---------- Guitar: clean cutting, upper three voices of the Rhodes voicing ----------
const guitar = [];
for (let bar = 1; bar <= 24; bar++) {
  if (bar === 24) {
    const v = voicings.get(chordAt(B(24))).v.slice(1).map((p) => (p < 62 ? p + 12 : p));
    v.forEach((p, i) => guitar.push(note(p, B(24) + i * 0.03, 2, 90, { noSwing: true })));
    continue;
  }
  const chorus = bar >= 9;
  const hits = chorus
    ? [...Array(16).keys()].map((s) => [s / 4, [55, 38, 92, 42][s % 4], s % 4 === 2 ? 0.18 : 0.08])
    : [[1, 82, 0.2], [1.75, 55, 0.12], [3, 82, 0.2], [3.5, 58, 0.12], [3.75, 40, 0.08]];
  for (const [t, vel, dur] of hits) {
    if (bar === 16 && t >= 2) continue;
    const c = chordAtAnt(B(bar, t));
    let v = voicings.get(c).v.slice(1);
    while (Math.min(...v) < 62) v = v.map((p) => p + 12);
    while (Math.min(...v) > 70) v = v.map((p) => p - 12);
    v.forEach((p, i) => guitar.push(note(p, B(bar, t) + i * 0.01, dur, vel, { spread: 5 })));
  }
}

// ---------- Brass: drop-2 stabs on chorus accents ----------
function drop2(c) {
  const close = SETS[c.q].brass.map((i) => {
    let p = c.rootPc + i;
    while (p < 68) p += 12;
    while (p >= 80) p -= 12;
    return p;
  }).sort((a, b) => a - b);
  close[close.length - 2] -= 12;
  return close.sort((a, b) => a - b);
}
const brass = [];
const STABS = [
  [0, 0, 0.35], [1, 2.5, 0.3], [1, 3.5, 0.3], [2, 0, 0.35], [3, 2.5, 0.3], [3, 3.5, 0.3],
  [4, 0, 0.35], [4, 2, 0.35], [5, 0, 0.35], [5, 2, 0.35],
  [6, 0, 0.3], [6, 1, 0.3], [6, 2, 0.3], [6, 3, 0.3], [7, 0, 1.5],
];
for (const base of [9, 17]) {
  for (const [ob, t, dur] of STABS) {
    const bar = base + ob;
    const abs = B(bar, t);
    const c = chordAtAnt(abs);
    for (const p of drop2(c)) brass.push(note(p, abs, bar === 24 ? 3 : dur, t === 3.5 ? 96 : 104, { spread: 4 }));
  }
}

// ---------- Lead (soprano sax): sentence-form phrases ----------
// [beatInBar, dur, pitch] per bar, in D♭
const N = { Db4: 61, Eb4: 63, F4: 65, Gb4: 66, G4: 67, A4: 69, Ab4: 68, Bb4: 70, C5: 72, Db5: 73, D5: 74, Eb5: 75, E5: 76, F5: 77, Fs5: 78, Gb5: 78, G5: 79, Gs5: 80, Ab5: 80, Bb5: 82 };
const verseMel = {
  1: [[0, 1, N.Ab4], [1, 0.5, N.Gb4], [1.5, 0.5, N.F4], [2, 1.5, N.Eb4]],
  2: [[0, 1, N.Ab4], [1, 0.5, N.Gb4], [1.5, 0.5, N.F4], [2, 1, N.Db4], [3, 0.5, N.F4], [3.5, 0.5, N.Ab4]],
  3: [[0, 1, N.C5], [1, 0.5, N.Bb4], [1.5, 0.5, N.Ab4], [2, 1.5, N.F4]],
  4: [[0, 1, N.Bb4], [1, 0.5, N.Ab4], [1.5, 0.5, N.Gb4], [2, 1.5, N.Eb4], [3.5, 0.5, N.F4]],
  5: [[0, 0.75, N.Ab4], [0.75, 0.25, N.Bb4], [1, 0.5, N.Ab4], [1.5, 0.5, N.F4], [2, 0.75, N.Ab4], [2.75, 0.25, N.Bb4], [3, 0.5, N.Ab4], [3.5, 0.5, N.F4]],
  6: [[0, 0.75, N.Ab4], [0.75, 0.25, N.A4], [1, 0.5, N.Ab4], [1.5, 0.5, N.F4], [2, 0.75, N.Db4], [2.75, 0.25, N.Eb4], [3, 0.5, N.F4], [3.5, 0.5, N.Ab4]],
  7: [[0, 1.5, N.C5], [1.5, 0.5, N.Db5], [2, 0.5, N.C5], [2.5, 0.5, N.Bb4], [3, 1, N.Ab4]],
  8: [[0, 1, N.Bb4], [2, 0.5, N.Bb4], [2.5, 0.5, N.Ab4], [3, 0.25, N.Ab4], [3.25, 0.25, N.Bb4], [3.5, 0.25, N.Db5], [3.75, 0.25, N.Eb5]],
};
const chorusMel = [
  [[0, 1.5, N.Ab5], [1.5, 0.5, N.F5], [2, 1, N.Eb5], [3, 0.5, N.Db5], [3.5, 0.5, N.Eb5]],
  [[0, 1.5, N.F5], [1.5, 0.5, N.Eb5], [2, 0.5, N.Gb5], [2.5, 0.5, N.F5], [3, 1, N.Eb5]],
  [[0, 1, N.Bb5], [1, 0.5, N.Ab5], [1.5, 0.5, N.F5], [2, 1, N.Eb5], [3, 0.5, N.C5], [3.5, 0.5, N.Eb5]],
  [[0, 1, N.F5], [1, 0.5, N.Eb5], [1.5, 0.5, N.Db5], [2, 1.5, N.C5], [3.5, 0.5, N.Db5]],
  [[0, 0.75, N.Ab5], [0.75, 0.25, N.Gb5], [1, 1, N.F5], [2, 0.75, N.Bb5], [2.75, 0.25, N.Ab5], [3, 1, N.Gb5]],
  [[0, 0.75, N.Bb5], [0.75, 0.25, N.Ab5], [1, 1, N.Eb5], [2, 0.75, N.C5], [2.75, 0.25, N.Db5], [3, 1, N.F5]],
  [[0, 0.5, N.F5], [0.5, 0.5, N.Gb5], [1, 0.5, N.Ab5], [1.5, 0.5, N.Bb5], [2, 0.5, N.Ab5], [2.5, 0.5, N.Bb5], [3, 0.5, N.Bb5], [3.5, 0.5, N.Ab5]],
];
const lead = [];
const strong = (t) => t === 0 || t === 2;
for (const [bar, ns] of Object.entries(verseMel))
  for (const [t, d, p] of ns) lead.push(note(p, B(+bar, t), d - 0.04, strong(t) ? 96 : 84));
for (const [base, tr] of [[9, 0], [17, 1]]) {
  chorusMel.forEach((ns, i) => {
    for (const [t, d, p] of ns) lead.push(note(p + tr, B(base + i, t), d - 0.04, strong(t) ? 104 : 92));
  });
}
// bar 16: cadence on D♭maj9 with 9 on top, then a chromatic pickup into D
lead.push(note(N.Eb5, B(16), 1.9, 100));
for (const [t, p] of [[3, 74], [3.25, 76], [3.5, 78], [3.75, 80]]) lead.push(note(p, B(16, t), 0.22, 88 + (t - 3) * 16));
// bar 24: end on 9 of Dmaj9
lead.push(note(76, B(24), 3.8, 100));

// ---------- Countermelody (strings), final chorus only ----------
const counterSpec = {
  17: [[0, 1.5, 71], [1.5, 0.5, 73], [2, 2, 74]],
  18: [[0, 2, 73], [2, 1, 71], [3, 1, 69]],
  19: [[0, 2, 69], [2, 1, 71], [3, 1, 73]],
  20: [[0, 2, 74], [2, 1, 73], [3, 1, 69]],
  21: [[0, 2, 71], [2, 2, 73]],
  22: [[0, 2, 69], [2, 2, 74]],
  23: [[0, 1, 74], [1, 1, 73], [2, 1, 71], [3, 1, 67]],
  24: [[0, 4, 66]],
};
const counter = [];
for (const [bar, ns] of Object.entries(counterSpec))
  for (const [t, d, p] of ns) counter.push(note(p, B(+bar, t), d - 0.05, 80, { spread: 3 }));

// ---------- project ----------
const track = (name, program, notes, mix, extra = {}) => ({
  name, program, notes, viewMode: "overview", height: 72, muted: false, soloed: false, ...mix, ...extra,
});
const key = { fifths: -5, mode: "major" };
const project = {
  title: "Toy city pop: Night Drive in D♭",
  comment: "Verse (JTTOU) 1–8, chorus (royal road) 9–16, final chorus +1 in D 17–24. 108 BPM, light 16th swing.",
  tempo: 108,
  timeSignature: { numerator: 4, denominator: 4 },
  masterGain: 0.9,
  locators: [{ beat: 0, label: "Verse" }, { beat: 32, label: "Chorus" }, { beat: 64, label: "Final chorus (+1)" }],
  midiTracks: [
    track("Lead (soprano sax)", 64, lead, { gain: 0.85, pan: 0 }, { keySignature: key }),
    track("Countermelody (strings)", 48, counter, { gain: 0.5, pan: -0.25 }, { keySignature: key }),
    track("Rhodes", 4, rhodes, { gain: 0.75, pan: -0.45 }, { keySignature: key }),
    track("Guitar (clean cutting)", 27, guitar, { gain: 0.45, pan: 0.5 }, { keySignature: key }),
    track("Brass (drop-2 stabs)", 61, brass, { gain: 0.55, pan: 0.2 }, { keySignature: key }),
    track("Bass (finger)", 33, finger, { gain: 0.9, pan: 0 }, { keySignature: key }),
    track("Bass (slap fills)", 36, slap, { gain: 0.8, pan: 0 }, { keySignature: key }),
    track("Drums", 0, drums, { gain: 0.85, pan: 0 }, { bank: 128 }),
  ],
};
const json = JSON.stringify(project);
const payload = deflateRawSync(json).toString("base64url");
const url = `https://toy-midi.hiro18181.workers.dev/draft#p=${payload}`;
writeFileSync("/tmp/citypop/project.json", JSON.stringify(project, null, 1));
writeFileSync("/tmp/citypop/url.txt", url);
console.log("notes:", project.midiTracks.map((t) => `${t.name}=${t.notes.length}`).join(", "));
console.log("json bytes:", json.length, "url chars:", url.length);
// voicing report
for (const c of chords) console.log(c.bar, c.start % 4, c.rootPc, c.q, voicings.get(c).form, voicings.get(c).v.join(","));
