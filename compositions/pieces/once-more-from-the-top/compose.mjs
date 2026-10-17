import { deflateRawSync, inflateRawSync } from "node:zlib";
import { writeFileSync } from "node:fs";

// ---------- helpers ----------
const PC = { C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11 };
const P = (s) => { const m = /^([A-G][#b]?)(-?\d)$/.exec(s); return PC[m[1]] + 12 * (Number(m[2]) + 1); };
const bar = (b) => (b - 1) * 4; // bar b (1-based) -> start beat
const QUAL = {
  maj: { tones: [0, 4, 7], rh: [0, 4, 7, 14] },
  maj7: { tones: [0, 4, 7, 11], rh: [4, 7, 11, 14] },
  m7: { tones: [0, 3, 7, 10], rh: [3, 7, 10, 17] },
  7: { tones: [0, 4, 7, 10], rh: [4, 7, 10, 14] },
  "7n": { tones: [0, 4, 7, 10], rh: [0, 4, 7, 10] }, // dominant without 9 (V/vi)
  "7sus4": { tones: [0, 5, 7, 10], rh: [5, 7, 10, 14] },
};
// chord: [symbol root, quality, beats, slashBass?]
const ch = (root, q, len, bass) => ({ root: PC[root], q, len, bass: bass ? PC[bass] : undefined });
const transposeChord = (c, k) => ({ ...c, root: (c.root + k) % 12, bass: c.bass === undefined ? undefined : (c.bass + k) % 12 });

// ---------- harmony ----------
const chorusD = [
  [ch("G", "maj7", 2), ch("A", "7", 2)],
  [ch("F#", "m7", 2), ch("B", "m7", 2)],
  [ch("E", "m7", 2), ch("A", "7", 2)],
  [ch("D", "maj", 2), ch("D", "7", 2)],
  [ch("G", "maj7", 2), ch("A", "7", 2)],
  [ch("F#", "7n", 2), ch("B", "m7", 2)],
  [ch("E", "m7", 2), ch("A", "7sus4", 1), ch("A", "7", 1)],
];
const bars = []; // bars[i] = { section, chords }
const push = (section, chords) => bars.push({ section, chords });
// Intro: hook-first (chorus bars 1-3) + turnaround
push("intro", chorusD[0]); push("intro", chorusD[1]); push("intro", chorusD[2]);
push("intro", [ch("G", "maj7", 2), ch("A", "7sus4", 1), ch("A", "7", 1)]);
// Verse: one chord per bar
push("verse", [ch("D", "maj", 4)]);
push("verse", [ch("A", "maj", 4, "C#")]);
push("verse", [ch("B", "m7", 4)]);
push("verse", [ch("G", "maj7", 4)]);
push("verse", [ch("E", "m7", 4)]);
push("verse", [ch("F#", "m7", 4)]);
push("verse", [ch("G", "maj7", 4)]);
push("verse", [ch("A", "7sus4", 2), ch("A", "7", 2)]);
// Pre-chorus: two per bar, then one per beat
push("pre", [ch("E", "m7", 2), ch("A", "7", 2)]);
push("pre", [ch("F#", "m7", 2), ch("B", "7", 2)]);
push("pre", [ch("G", "maj7", 2), ch("F#", "7n", 2)]);
push("pre", [ch("B", "m7", 1), ch("E", "7", 1), ch("A", "7sus4", 1), ch("A", "7", 1)]);
// Chorus in D, last bar pivots on B7 (V/ii in D = V in E)
for (const c of chorusD) push("chorus", c);
push("chorus", [ch("D", "maj", 2), ch("B", "7", 2)]);
// Final chorus in E (+2), last bar turns back via D7 (V/IV of D) to the intro's Gmaj7
for (const c of chorusD) push("final", c.map((x) => transposeChord(x, 2)));
push("final", [ch("E", "maj", 2), ch("D", "7", 2)]);
if (bars.length !== 32) throw new Error("bars " + bars.length);

const segments = []; // flattened chord segments with absolute start
bars.forEach((b, i) => { let t = bar(i + 1); for (const c of b.chords) { segments.push({ ...c, start: t, barIndex: i + 1, section: b.section }); t += c.len; } });

// ---------- melody ----------
const notes = { lead: [], counter: [], piano: [], arp: [], strings: [], bass: [], drums: [] };
const add = (track, pitch, start, duration, velocity) => notes[track].push({ pitch, start, duration, velocity: Math.max(1, Math.min(127, Math.round(velocity))) });
const phrase = (track, b, list, vel, k = 0) => { for (const [n, s, d] of list) add(track, P(n) + k, bar(b) + s, d, vel); };

const leadChorus = [
  [["F#5", 0, 1], ["E5", 1, 0.5], ["F#5", 1.5, 1], ["A5", 2.5, 1.5]],
  [["E5", 0, 1], ["D5", 1, 0.5], ["E5", 1.5, 1], ["F#5", 2.5, 1.5]],
  [["D5", 0, 1], ["B4", 1, 0.5], ["D5", 1.5, 1], ["E5", 2.5, 1], ["F#5", 3.5, 2.5]],
  [["A4", 2.5, 0.5], ["D5", 3, 0.5], ["E5", 3.5, 0.5]],
  [["F#5", 0, 1], ["E5", 1, 0.5], ["F#5", 1.5, 1], ["B5", 2.5, 1], ["A5", 3.5, 0.5]],
  [["A#5", 0, 1.5], ["B5", 1.5, 0.5], ["D6", 2, 1.5], ["C#6", 3.5, 0.5]],
  [["B5", 0, 1], ["A5", 1, 0.5], ["G5", 1.5, 0.5], ["F#5", 2, 1], ["E5", 3, 0.5], ["D5", 3.5, 2.5]],
];
// intro hook (chorus bars 1-3)
for (let i = 0; i < 3; i++) phrase("lead", 1 + i, leadChorus[i], 92);
// verse: low register, off-beat starts, sequence in bars 9-10
const verse = [
  [["F#4", 0.5, 0.5], ["A4", 1, 0.5], ["B4", 1.5, 1], ["A4", 2.5, 1.5]],
  [["E4", 0.5, 0.5], ["F#4", 1, 0.5], ["A4", 1.5, 1], ["E4", 2.5, 1.5]],
  [["D4", 0.5, 0.5], ["F#4", 1, 0.5], ["A4", 1.5, 1], ["F#4", 2.5, 1]],
  [["D4", 1.5, 0.5], ["E4", 2, 0.5], ["F#4", 2.5, 1.5]],
  [["G4", 0.5, 0.5], ["B4", 1, 0.5], ["D5", 1.5, 1], ["B4", 2.5, 1.5]],
  [["A4", 0.5, 0.5], ["C#5", 1, 0.5], ["E5", 1.5, 1], ["C#5", 2.5, 1.5]],
  [["B4", 0.5, 0.5], ["A4", 1, 0.5], ["G4", 1.5, 0.5], ["F#4", 2, 1], ["E4", 3, 1]],
  [["D4", 0, 2], ["C#4", 2, 1], ["E4", 3, 0.5], ["F#4", 3.5, 0.5]],
];
verse.forEach((p, i) => phrase("lead", 5 + i, p, 80));
// pre-chorus: two-beat motif, bar 14 = bar 13 up a step
const pre = [
  [["G4", 0, 0.5], ["A4", 0.5, 0.5], ["B4", 1, 1], ["A4", 2, 0.5], ["B4", 2.5, 0.5], ["C#5", 3, 1]],
  [["A4", 0, 0.5], ["B4", 0.5, 0.5], ["C#5", 1, 1], ["B4", 2, 0.5], ["C#5", 2.5, 0.5], ["D#5", 3, 1]],
  [["B4", 0, 0.5], ["D5", 0.5, 0.5], ["F#5", 1, 1], ["E5", 2, 0.5], ["C#5", 2.5, 0.5], ["A#4", 3, 1]],
  [["B4", 0, 1], ["D5", 1, 1], ["D5", 2, 1], ["C#5", 3, 0.5], ["E5", 3.5, 0.5]],
];
pre.forEach((p, i) => phrase("lead", 13 + i, p, 86 + i * 4));
// chorus 1 (D) and final chorus (E)
leadChorus.forEach((p, i) => phrase("lead", 17 + i, p, 102));
phrase("lead", 24, [["D#5", 2.5, 0.5], ["E5", 3, 0.5], ["F#5", 3.5, 0.5]], 104);
leadChorus.forEach((p, i) => phrase("lead", 25 + i, p, 112, 2));
phrase("lead", 32, [["A4", 2.5, 0.5], ["D5", 3, 0.5], ["E5", 3.5, 0.5]], 100); // pickup back into the D hook

// countermelody (final chorus only)
const counter = [
  [["C#5", 0, 2], ["D#5", 2, 2]],
  [["B4", 0, 2], ["E5", 2, 1], ["D#5", 3, 1]],
  [["C#5", 0, 2], ["A4", 2, 2]],
  [["G#4", 0, 2], ["D5", 2, 2]],
  [["C#5", 0, 1], ["E5", 1, 1], ["D#5", 2, 1], ["F#5", 3, 1]],
  [["C5", 0, 2], ["C#5", 2, 2]],
  [["A4", 0, 2], ["E5", 2, 1], ["D#5", 3, 1]],
  [["G#4", 0, 2], ["F#4", 2, 1], ["A4", 3, 1]],
];
counter.forEach((p, i) => phrase("counter", 25 + i, p, 88));

// ---------- bass: melodic counter-line ----------
const bassChorus = [
  [["G2", 0, 1.5], ["B2", 1.5, 0.5], ["A2", 2, 0.5], ["C#3", 2.5, 0.5], ["E3", 3, 0.5], ["C#3", 3.5, 0.5]],
  [["F#2", 0, 1.5], ["A2", 1.5, 0.5], ["B2", 2, 1], ["A2", 3, 0.5], ["F#2", 3.5, 0.5]],
  [["E2", 0, 1.5], ["G2", 1.5, 0.5], ["A2", 2, 1], ["B2", 3, 0.5], ["C#3", 3.5, 0.5]],
  [["D3", 0, 1.5], ["A2", 1.5, 0.5], ["C3", 2, 2]],
  [["B2", 0, 1.5], ["G2", 1.5, 0.5], ["A2", 2, 1], ["C#3", 3, 0.5], ["A2", 3.5, 0.5]],
  [["A#2", 0, 1.5], ["F#2", 1.5, 0.5], ["B2", 2, 1], ["A2", 3, 1]],
  [["G2", 0, 1], ["E2", 1, 1], ["A2", 2, 1], ["A2", 3, 0.5], ["D2", 3.5, 2.5]],
];
for (let i = 0; i < 3; i++) phrase("bass", 1 + i, bassChorus[i], 92);
phrase("bass", 4, [["G2", 0, 2], ["A2", 2, 1], ["E2", 3, 0.5], ["C#2", 3.5, 0.5]], 92);
const bassVerse = [
  [["D2", 0, 2], ["F#2", 2, 0.5], ["A2", 2.5, 0.5], ["G2", 3, 0.5], ["E2", 3.5, 0.5]],
  [["C#2", 0, 2], ["E2", 2, 0.5], ["A2", 2.5, 0.5], ["B2", 3, 0.5], ["C#3", 3.5, 0.5]],
  [["B2", 0, 2], ["A2", 2, 1], ["F#2", 3, 0.5], ["A2", 3.5, 0.5]],
  [["G2", 0, 2], ["B2", 2, 0.5], ["A2", 2.5, 0.5], ["G2", 3, 0.5], ["F#2", 3.5, 0.5]],
  [["E2", 0, 2], ["G2", 2, 0.5], ["B2", 2.5, 0.5], ["D3", 3, 1]],
  [["C#3", 0, 1], ["A2", 1, 0.5], ["F#2", 1.5, 1.5], ["E2", 3, 0.5], ["F#2", 3.5, 0.5]],
  [["G2", 0, 1.5], ["A2", 1.5, 0.5], ["B2", 2, 1], ["D3", 3, 0.5], ["B2", 3.5, 0.5]],
  [["A2", 0, 2], ["G2", 2, 1], ["F#2", 3, 1]],
];
bassVerse.forEach((p, i) => phrase("bass", 5 + i, p, 84));
// pre-chorus: driving root 8ths, last 8th of each chord approaches the next root
const preSegs = segments.filter((s) => s.section === "pre");
const nextRootAfterPre = P("G2");
preSegs.forEach((s, i) => {
  const root = 40 + ((s.root - 4 + 12) % 12); // E2..D#3
  const next = i + 1 < preSegs.length ? 40 + ((preSegs[i + 1].root - 4 + 12) % 12) : nextRootAfterPre;
  for (let t = 0; t < s.len; t += 0.5) {
    const last = t + 0.5 >= s.len;
    const pitch = last ? next + (next > root ? -1 : 1) : root;
    add("bass", pitch, s.start + t, 0.45, 88 + (s.barIndex - 13) * 5 + (t % 1 === 0 ? 6 : 0));
  }
});
bassChorus.forEach((p, i) => phrase("bass", 17 + i, p, 102));
phrase("bass", 24, [["B2", 2, 1], ["D#3", 3, 0.5], ["B2", 3.5, 0.5]], 102);
bassChorus.forEach((p, i) => phrase("bass", 25 + i, p, 110, 2));
phrase("bass", 32, [["D3", 2, 1], ["C3", 3, 0.5], ["A2", 3.5, 0.5]], 106);

// ---------- piano: pop power voicing ----------
const voiceRH = (s, lo = 60, hi = 84) => {
  const iv = QUAL[s.q].rh.map((x) => (s.root + x) % 12);
  let best;
  for (let r = 0; r < iv.length; r++) {
    const rot = [...iv.slice(r), ...iv.slice(0, r)];
    const out = [];
    let p = lo + ((rot[0] - lo) % 12 + 12) % 12;
    out.push(p);
    for (const pc of rot.slice(1)) { p = p + 1 + ((pc - p - 1) % 12 + 12) % 12; out.push(p); }
    if (out.at(-1) > hi) continue;
    const center = out.reduce((a, b) => a + b) / out.length;
    if (!best || Math.abs(center - 70) < best.score) best = { out, score: Math.abs(center - 70) };
  }
  return best.out;
};
const lhRoot = (pc) => 43 + ((pc - 7 + 12) % 12); // G2..F#3
const vel = { intro: 84, verse: 66, pre: 78, chorus: 96, final: 106 };
for (const s of segments) {
  const v = vel[s.section] + (s.section === "pre" ? (s.barIndex - 13) * 5 : 0);
  if (s.bass !== undefined) { const b = lhRoot(s.bass); add("piano", b, s.start, s.len, v); add("piano", b + 12, s.start, s.len, v - 6); }
  else { const r = lhRoot(s.root); for (const x of [0, 7, 12]) add("piano", r + x, s.start, s.len, v - (x ? 6 : 0)); }
  const lh = s.bass !== undefined ? [lhRoot(s.bass), lhRoot(s.bass) + 12] : [0, 7, 12].map((x) => lhRoot(s.root) + x);
  const rh = voiceRH(s).filter((p) => !lh.includes(p));
  const hit = (t, d, dv = 0) => rh.forEach((p) => add("piano", p, s.start + t, d, v - 4 + dv));
  if (s.section === "verse") { if (s.len === 4) { hit(0, 1.5); hit(1.5, 2.5, -8); } else hit(0, s.len); }
  else if (s.section === "pre") { for (let t = 0; t < s.len; t += 0.5) hit(t, 0.4, t % 1 === 0 ? 4 : -6); }
  else { if (s.len >= 2) { hit(0, 1.5); hit(1.5, s.len - 1.5, -6); } else hit(0, s.len); }
}

// ---------- strings: spread voicings ----------
for (const s of segments) {
  if (s.section === "intro" || (s.section === "verse" && s.barIndex < 9)) continue;
  const q = QUAL[s.q].tones;
  const r = 48 + ((s.root) % 12); // C3..B3
  const third = q[1], top = q[3] ?? q[2];
  const voicing = [r, r + 12 + third, r + 12 + top];
  if (s.section === "chorus" || s.section === "final") voicing.push(r + 24 + third);
  const v = { verse: 52, pre: 64 + (s.barIndex - 13) * 6, chorus: 80, final: 90 }[s.section];
  voicing.forEach((p) => add("strings", p, s.start, s.len, v));
}

// ---------- arpeggio ----------
const arpTones = (s) => {
  const pcs = QUAL[s.q].tones.map((x) => (s.root + x) % 12);
  const out = [];
  for (let p = 62; p <= 79; p++) if (pcs.includes(p % 12)) out.push(p);
  return [...out, ...out.slice(1, -1).reverse()]; // up-down
};
for (const s of segments) {
  if (s.section === "verse") continue;
  const step = s.section === "final" ? 0.25 : 0.5;
  const tones = arpTones(s);
  const v = { intro: 70, pre: 66 + (s.barIndex - 13) * 5, chorus: 76, final: 80 }[s.section];
  let i = Math.round((s.start % 4) / step);
  for (let t = 0; t < s.len; t += step, i++) add("arp", tones[i % tones.length], s.start + t, step * 0.9, v + (i % 2 ? -8 : 0));
}

// ---------- drums ----------
const K = 36, S = 38, SS = 37, CH = 42, OH = 46, CR = 49, LT = 45, MT = 47, HT = 50, FT = 43;
const d = (p, t, v, len = 0.25) => add("drums", p, t, len, v);
for (let b = 1; b <= 32; b++) {
  const t0 = bar(b), sec = bars[b - 1].section;
  if (sec === "intro") {
    if (b === 1) d(CR, t0, 110);
    [0, 2].forEach((x) => d(K, t0 + x, 100)); [1, 3].forEach((x) => { if (!(b === 4 && x === 3)) d(S, t0 + x, 92); });
    for (let x = 0; x < 4; x += 0.5) d(CH, t0 + x, x % 1 ? 58 : 74);
    if (b === 4) { for (let x = 3; x < 4; x += 0.25) d(S, t0 + x, 70 + (x - 3) * 80); }
  } else if (sec === "verse") {
    [0, 2.5].forEach((x) => d(K, t0 + x, 88)); [1, 3].forEach((x) => d(SS, t0 + x, 76));
    for (let x = 0; x < 4; x += 1) d(CH, t0 + x, 60);
    if (b === 5) d(CR, t0, 84);
    if (b === 12) { [[HT, 3], [MT, 3.25], [LT, 3.5], [FT, 3.75]].forEach(([p, x]) => d(p, t0 + x, 90)); }
  } else if (sec === "pre") {
    for (let x = 0; x < 4; x++) d(K, t0 + x, 96);
    for (let x = 0; x < 4; x += 0.5) d(CH, t0 + x, x % 1 ? 62 : 78);
    if (b <= 14) [1, 3].forEach((x) => d(S, t0 + x, 96));
    // build roll: quarters -> 8ths -> 16ths -> 32nds
    if (b === 15) { [0, 1].forEach((x) => d(S, t0 + x, 84)); for (let x = 2; x < 4; x += 0.5) d(S, t0 + x, 86 + x * 3); }
    if (b === 16) { for (let x = 0; x < 3; x += 0.25) d(S, t0 + x, 88 + x * 8); for (let x = 3; x < 4; x += 0.125) d(S, t0 + x, 116 + (x - 3) * 10, 0.1); }
  } else {
    const hard = sec === "final";
    if (b === 17 || b === 21 || b === 25 || b === 29) d(CR, t0, 118);
    [0, 1.5, 2, 3.5].forEach((x) => d(K, t0 + x, hard ? 112 : 104));
    [1, 3].forEach((x) => d(S, t0 + x, hard ? 116 : 108));
    if (hard) for (let x = 0; x < 4; x += 0.25) d(CH, t0 + x, x % 0.5 ? 56 : x % 1 ? 70 : 84);
    else for (let x = 0; x < 4; x += 0.5) d(x % 1 ? OH : CH, t0 + x, x % 1 ? 72 : 84);
    if (b === 24 || b === 32) {
      // fill on beats 3-4, into the key change (24) or back to the hook (32)
      notes.drums = notes.drums.filter((n) => !(n.start >= t0 + 2 && n.start < t0 + 4 && n.pitch !== K));
      [[S, 2], [S, 2.25], [HT, 2.5], [HT, 2.75], [MT, 3], [MT, 3.25], [LT, 3.5], [FT, 3.75]].forEach(([p, x]) => d(p, t0 + x, 96 + (x - 2) * 12));
    }
  }
}

// ---------- project ----------
const key = { fifths: 2, mode: "major" };
const project = {
  title: "Once More, From the Top",
  comment: "32 bars, D major -> E major final chorus, loops back to the hook-first intro via D7 (V/IV).",
  tempo: 152,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: 128 }, enabled: true },
  locators: [
    { beat: bar(1), label: "Intro (hook)" },
    { beat: bar(5), label: "Verse" },
    { beat: bar(13), label: "Pre-chorus" },
    { beat: bar(17), label: "Chorus" },
    { beat: bar(25), label: "Final chorus (E)" },
  ],
  midiTracks: [
    { name: "Lead", program: 81, gain: 0.8, pan: 0, keySignature: key, notes: notes.lead },
    { name: "Countermelody (violin)", program: 40, gain: 0.7, pan: -0.5, keySignature: key, notes: notes.counter },
    { name: "Piano (power voicing)", program: 0, gain: 0.7, pan: -0.3, keySignature: key, notes: notes.piano },
    { name: "Strings (spread)", program: 48, gain: 0.6, pan: 0.3, keySignature: key, notes: notes.strings },
    { name: "Arp", program: 80, gain: 0.4, pan: 0.55, keySignature: key, notes: notes.arp },
    { name: "Bass", program: 33, gain: 0.9, pan: 0, keySignature: key, tabAnnotationEnabled: false, notes: notes.bass },
    { name: "Drums", program: 0, bank: 128, gain: 0.8, pan: 0, notes: notes.drums },
  ],
};

// sanity checks
for (const t of project.midiTracks) {
  for (const n of t.notes) if (n.start < 0 || n.start + n.duration > 128.001 || n.pitch < 0 || n.pitch > 127) throw new Error(`${t.name} out of range ${JSON.stringify(n)}`);
  console.log(t.name.padEnd(24), t.notes.length, "notes");
}
const payload = deflateRawSync(JSON.stringify(project)).toString("base64url");
const roundTrip = JSON.parse(inflateRawSync(Buffer.from(payload, "base64url")).toString());
if (roundTrip.midiTracks.length !== 7) throw new Error("round trip");
const link = "https://toy-midi.hiro18181.workers.dev/draft#p=" + payload;
writeFileSync(new URL("./link.txt", import.meta.url), link);
writeFileSync(new URL("./project.json", import.meta.url), JSON.stringify(project, null, 2));
console.log("link length", link.length);
