// Generates project.json for "Open E Mixolydian" — a 24-bar blues-based hard rock loop.
// 125 BPM, 4/4, straight 8ths. Beats are quarter notes; one 8th slot = 0.5 beat.
import { writeFileSync } from "node:fs";

const BAR = 4;
const S = (bar, slot) => (bar - 1) * BAR + slot * 0.5; // bar is 1-based, slot is 8th 0..7

// --- Guitar shapes, standard tuning (E2 A2 D3 G3 B3 E4 = 40 45 50 55 59 64), low string first ---
const SHAPES = {
  E: [40, 47, 52, 56, 59, 64], // 022100
  A: [45, 52, 57, 61, 64], // x02220
  D: [50, 57, 62, 66], // xx0232
  G: [43, 47, 50, 55, 59, 67], // 320003
};
// Muted chk: fretting hand relaxes on the lower four strings of the grip
const MUTE = { E: SHAPES.E.slice(0, 4), A: SHAPES.A.slice(0, 4), D: SHAPES.D.slice(0, 3), G: SHAPES.G.slice(0, 4) };
// Open-position double stops (root + fifth)
const DYAD = { E: [40, 47], A: [45, 52], D: [50, 57], G: [43, 50] };

let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const jitter = (amt) => (rand() - 0.5) * 2 * amt;

const STRING_GAP = 0.016; // ~8 ms per string at 125 BPM
function down(notes, start, pitches, dur, vel) {
  pitches.forEach((p, i) =>
    notes.push(n(p, start + i * STRING_GAP + Math.abs(jitter(0.004)), dur - i * STRING_GAP, vel - i * 2)),
  );
}
function up(notes, start, pitches, dur, vel) {
  const top = pitches.slice(-3).reverse(); // upstrokes catch the top three strings, high to low
  top.forEach((p, i) => notes.push(n(p, start + i * 0.012 + Math.abs(jitter(0.003)), dur - i * 0.012, vel - i * 3)));
}
function chk(notes, start, pitches, vel = 92) {
  pitches.forEach((p, i) => notes.push(n(p, start + i * 0.01, 0.14, vel - i * 2)));
}
const n = (pitch, start, duration, velocity) => ({
  pitch,
  start: +start.toFixed(4),
  duration: +Math.max(0.05, duration).toFixed(4),
  velocity: Math.max(1, Math.min(127, Math.round(velocity))),
});

// ---------------- Riff guitar (Crunch L): open + muted ----------------
const riffOpen = [];
const riffMute = [];

// Riff bar A (E): E chord | chug | G | A | chk | D/A dyad | chug
function riffBarA(bar) {
  down(riffOpen, S(bar, 0), SHAPES.E, 0.9, 112);
  riffMute.push(n(40, S(bar, 2), 0.3, 100));
  riffOpen.push(n(43, S(bar, 3), 0.45, 110)); // G, blue third, accented push
  riffOpen.push(n(45, S(bar, 4), 0.45, 104)); // open A string
  chk(riffMute, S(bar, 5), MUTE.E, 90);
  down(riffOpen, S(bar, 6), [50, 57], 0.48, 108); // D/A double stop (open D + G string 2nd fret)
  riffMute.push(n(40, S(bar, 7), 0.3, 104));
}
// Riff bar B (D–A–E): D chord | chk | . | A chord (anticipation) | chk | E | G | G#
function riffBarB(bar, { walk = false, stop = false } = {}) {
  down(riffOpen, S(bar, 0), SHAPES.D, 0.9, 112);
  chk(riffMute, S(bar, 1) + 0.5, MUTE.D, 86); // chk on beat 2
  down(riffOpen, S(bar, 3), SHAPES.A, stop ? 1.0 : 0.48, 114);
  if (walk) {
    // blues-scale walk up into the next downbeat: G A A# B
    [43, 45, 46, 47].forEach((p, i) => riffOpen.push(n(p, S(bar, 4 + i), 0.45, 104 + i * 3)));
    return;
  }
  if (!stop) chk(riffMute, S(bar, 5) - 0.5, MUTE.A, 88); // chk on beat 3
  riffOpen.push(n(40, S(bar, 5), 0.45, 106));
  riffOpen.push(n(43, S(bar, 6), 0.45, 108));
  riffOpen.push(n(44, S(bar, 7), 0.48, 112)); // G -> G# pulls into the E chord
}
function riffSection(startBar, { lastStop = false } = {}) {
  riffBarA(startBar);
  riffBarB(startBar + 1);
  riffBarA(startBar + 2);
  if (lastStop) riffBarB(startBar + 3, { stop: true });
  else riffBarB(startBar + 3, { walk: true });
}

// ---------------- Rhythm guitar 2 (Crunch R): open chords ----------------
const rhyOpen = [];
const rhyMute = [];
// One bar of the backbeat pattern: O . X o | O . X o (X = muted chk on 2 and 4)
function rhyBar(bar, c1, c2 = c1, { split = 4 } = {}) {
  const ch = (slot) => (slot < split ? c1 : c2);
  down(rhyOpen, S(bar, 0), SHAPES[ch(0)], 0.95, 100);
  chk(rhyMute, S(bar, 2), MUTE[ch(2)], 84);
  if (split === 3) {
    down(rhyOpen, S(bar, 3), SHAPES[c2], 0.95, 104); // follow the riff's A anticipation
  } else {
    up(rhyOpen, S(bar, 3), SHAPES[ch(3)], 0.48, 86);
    down(rhyOpen, S(bar, 4), SHAPES[ch(4)], 0.95, 98);
  }
  chk(rhyMute, S(bar, 6), MUTE[ch(6)], 84);
  up(rhyOpen, S(bar, 7), SHAPES[ch(7)], 0.48, 86);
}
// Contrast pattern: ring-out chords on a 3+3+2 open accent, one chk on beat 4
function rhyWide(bar, c1, c2 = c1) {
  if (c1 === c2) {
    down(rhyOpen, S(bar, 0), SHAPES[c1], 1.45, 104);
    down(rhyOpen, S(bar, 3), SHAPES[c1], 1.45, 100);
  } else {
    down(rhyOpen, S(bar, 0), SHAPES[c1], 0.95, 104);
    chk(rhyMute, S(bar, 2), MUTE[c1], 84);
    up(rhyOpen, S(bar, 3), SHAPES[c1], 0.48, 88);
    down(rhyOpen, S(bar, 4), SHAPES[c2], 0.95, 102);
  }
  chk(rhyMute, S(bar, 6), MUTE[c2], 86);
  up(rhyOpen, S(bar, 7), SHAPES[c2], 0.48, 88);
}

// ---------------- Bass (riff bass, doubles the riff an octave down) ----------------
const bass = [];
const b = (p, bar, slot, d = 0.42, v = 100) => bass.push(n(p, S(bar, slot), d, v));
function bassRiffA(bar) {
  b(28, bar, 0, 0.9, 110);
  b(28, bar, 2, 0.3, 92);
  b(31, bar, 3, 0.45, 106);
  b(33, bar, 4, 0.45, 100);
  b(33, bar, 5, 0.3, 90);
  b(38, bar, 6, 0.45, 104);
  b(28, bar, 7, 0.3, 100);
}
function bassRiffB(bar, { walk = false, stop = false } = {}) {
  b(38, bar, 0, 0.9, 110);
  b(38, bar, 2, 0.3, 90);
  b(33, bar, 3, stop ? 0.9 : 0.9, 110);
  if (stop) return;
  if (walk) return [31, 33, 34, 35].forEach((p, i) => b(p, bar, 4 + i, 0.45, 102 + i * 3));
  b(28, bar, 5, 0.45, 104);
  b(31, bar, 6, 0.45, 104);
  b(32, bar, 7, 0.45, 108);
}
function bassRoots(bar, r1, r2 = r1, split = 4) {
  for (let s = 0; s < 8; s++) {
    const r = s < split ? r1 : r2;
    const octave = s === 3 || s === 7; // octave pop on the offbeat pushes
    b(octave ? r + 12 : r, bar, s, 0.42, s % 2 === 0 ? 104 : 90);
  }
}

// ---------------- Drums (Power kit, bank 128 program 16) ----------------
const drums = [];
const K = 36, SN = 38, HH = 42, PH = 44, OH = 46, CR = 49, RD = 51, TH = 48, TM = 45, TF = 41;
const d = (p, t, v = 100, dur = 0.25) => drums.push(n(p, t, dur, v));
function beatBar(bar, kicks, { hat = HH, crash = false, openLast = false } = {}) {
  for (let s = 0; s < 8; s++) {
    const t = S(bar, s);
    if (s === 7 && openLast) d(OH, t, 90);
    else d(hat, t, s % 2 === 0 ? 92 : 68);
  }
  d(SN, S(bar, 2), 112);
  d(SN, S(bar, 6), 114);
  kicks.forEach((s) => d(K, S(bar, s), s === 0 ? 118 : 106));
  if (crash) d(CR, S(bar, 0), 110, 1);
}
function fill16(bar, fromBeat, pitches) {
  pitches.forEach((p, i) => d(p, (bar - 1) * 4 + fromBeat + i * 0.25, 96 + i * 3));
}
// Kicks follow the riff's accents: A = E chord, G push, &4 chug; B = D chord, A anticipation, low E
const KICK_A = [0, 3, 7];
const KICK_B = [0, 3, 5];

// ---------------- Lead (High Gain) with pitch-bend automation ----------------
const lead = [];
const bendPoints = [{ beat: 0, semitones: 0 }];
const L = (p, bar, beat, dur, v = 104) => lead.push(n(p, (bar - 1) * 4 + beat, dur, v));
// Bend: rise to `amount` over `rise` beats, hold, optional vibrato, release before the note ends
function bend(bar, beat, dur, amount, { rise = 0.25, vib = 0, release = false } = {}) {
  const t0 = (bar - 1) * 4 + beat;
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    const x = i / steps;
    bendPoints.push({ beat: t0 + rise * x, semitones: amount * (1 - (1 - x) ** 2) });
  }
  const holdEnd = release ? t0 + dur * 0.6 : t0 + dur;
  if (vib) vibrato(t0 + rise + 0.1, holdEnd, amount, vib);
  if (release) {
    for (let i = 1; i <= steps; i++) {
      const x = i / steps;
      bendPoints.push({ beat: holdEnd + 0.25 * x, semitones: amount * (1 - x) });
    }
  }
  bendPoints.push({ beat: t0 + dur - 0.005, semitones: 0 });
}
// Vibrato as pitch-bend: ~5.2 Hz (2.5 cycles per beat at 125 BPM), depth in semitones
function vibrato(from, to, center, depth) {
  const rate = 2.5;
  for (let t = from; t < to - 0.02; t += 1 / (rate * 8)) {
    bendPoints.push({ beat: t, semitones: center + depth * Math.sin(2 * Math.PI * rate * (t - from)) });
  }
  bendPoints.push({ beat: to - 0.01, semitones: center });
}
function vibNote(p, bar, beat, dur, depth = 0.25, v = 104) {
  L(p, bar, beat, dur, v);
  const t0 = (bar - 1) * 4 + beat;
  vibrato(t0 + 0.25, t0 + dur, 0, depth);
  bendPoints.push({ beat: t0 + dur - 0.005, semitones: 0 });
}

// ===================== Arrangement =====================
// Bars 1–4: riff alone (Crunch L only)
riffSection(1);
fill16(4, 3, [SN, SN, TM, TF]); // pickup fill into the band entry

// Bars 5–8: band in on the riff
riffSection(5);
for (const bar of [5, 7]) {
  rhyBar(bar, "E");
  bassRiffA(bar);
  beatBar(bar, KICK_A, { crash: bar === 5 });
}
rhyBar(6, "D", "A", { split: 3 });
bassRiffB(6);
beatBar(6, KICK_B);
rhyBar(8, "D", "A", { split: 3 });
bassRiffB(8, { walk: true });
beatBar(8, [0, 3], { openLast: true });

// Bars 9–12: contrast section over bVII–IV–I (D | A | E | G A)
const contrast = [["D"], ["A"], ["E"], ["G", "A"]];
contrast.forEach(([c1, c2], i) => {
  const bar = 9 + i;
  rhyWide(bar, c1, c2 ?? c1);
  // riff guitar: open double stops on a 3+3+2 accent, muted chugs between
  for (let s = 0; s < 8; s++) {
    const c = s < 4 || !c2 ? c1 : c2;
    const root = DYAD[c][0];
    if (s === 0 || s === 3 || s === 6) down(riffOpen, S(bar, s), DYAD[c], s === 6 ? 0.45 : 0.9, 110);
    else riffMute.push(n(root, S(bar, s), 0.3, s % 2 ? 90 : 98));
  }
  const root = { D: 38, A: 33, E: 28, G: 31 };
  bassRoots(bar, root[c1], root[c2 ?? c1]);
  for (let s = 0; s < 8; s++) d(RD, S(bar, s), s % 2 === 0 ? 96 : 76);
  d(SN, S(bar, 2), 114);
  d(SN, S(bar, 6), 116);
  [0, 3, 4].forEach((s) => d(K, S(bar, s), s === 0 ? 118 : 106));
  if (i === 0) d(CR, S(bar, 0), 112, 1);
});
fill16(12, 3, [SN, SN, SN, SN]);

// Bars 13–16: stop-time — band hits, then space for the lead
function bandHit(bar, slot, chord, dur) {
  down(rhyOpen, S(bar, slot), SHAPES[chord], dur, 112);
  down(riffOpen, S(bar, slot), SHAPES[chord], dur, 114);
  const root = { D: 38, A: 33, E: 28, G: 31 }[chord];
  b(root, bar, slot, dur - 0.1, 114);
  d(K, S(bar, slot), 120);
  d(CR, S(bar, slot), 112, 1);
}
bandHit(13, 0, "E", 1.4);
bandHit(14, 0, "D", 0.8);
bandHit(14, 3, "A", 1.2);
bandHit(15, 0, "E", 1.4);
bandHit(16, 0, "D", 0.8);
for (const bar of [13, 14, 15]) [1, 2, 3].forEach((beat) => d(PH, (bar - 1) * 4 + beat, 70)); // pedal hat keeps time
d(PH, 15 * 4 + 1, 70);
// band back in on beat 3 of bar 16: walk A A# B into the lead break
[45, 45, 46, 47].forEach((p, i) => riffOpen.push(n(p, S(16, 4 + i), 0.45, 106 + i * 3)));
[33, 33, 34, 35].forEach((p, i) => b(p, 16, 4 + i, 0.42, 104 + i * 3));
down(rhyOpen, S(16, 4), SHAPES.A, 0.95, 104);
chk(rhyMute, S(16, 6), MUTE.A, 86);
up(rhyOpen, S(16, 7), SHAPES.A, 0.48, 90);
d(K, S(16, 4), 110);
fill16(16, 2.5, [SN, SN, TH, TM, TM, TF]);

// Lead in the stop-time gaps (E minor pentatonic / blues around the 12th fret)
L(69, 13, 1.0, 1.5, 108); bend(13, 1.0, 1.5, 2, { vib: 0.2 }); // A bent up to B, vibrato
L(69, 13, 2.5, 0.5); L(67, 13, 3.0, 0.5); L(64, 13, 3.5, 0.5);
L(76, 14, 1.0, 0.5); L(74, 14, 1.5, 0.5); L(71, 14, 2.0, 0.5); L(69, 14, 2.5, 0.5);
vibNote(71, 14, 3.0, 1.0, 0.25);
L(76, 15, 0.5, 0.5);
L(79, 15, 1.0, 1.0, 110); bend(15, 1.0, 1.0, 2, { release: true }); // G bend to A and release
L(76, 15, 2.0, 0.5); L(74, 15, 2.5, 0.5);
vibNote(76, 15, 3.0, 1.0, 0.3);
L(71, 16, 0.5, 0.5); L(70, 16, 1.0, 0.5); L(69, 16, 1.5, 0.5); // B Bb A — the blue note
L(67, 16, 2.0, 0.5); bend(16, 2.0, 0.5, 0.5, { rise: 0.2 }); // quarter-tone curl on the minor third
L(64, 16, 2.5, 0.5); L(67, 16, 3.0, 0.5); L(68, 16, 3.5, 0.5);

// Bars 17–20: lead break over E | D A | E | G A
const breakChords = [["E"], ["D", "A"], ["E"], ["G", "A"]];
breakChords.forEach(([c1, c2], i) => {
  const bar = 17 + i;
  rhyBar(bar, c1, c2 ?? c1);
  // riff guitar steps back: muted chugs with one open dyad per half bar
  for (let s = 0; s < 8; s++) {
    const c = s < 4 || !c2 ? c1 : c2;
    if (s === 0 || s === 4) down(riffOpen, S(bar, s), DYAD[c], 0.45, 104);
    else riffMute.push(n(DYAD[c][0], S(bar, s), 0.28, s % 2 ? 84 : 94));
  }
  const root = { D: 38, A: 33, E: 28, G: 31 };
  bassRoots(bar, root[c1], root[c2 ?? c1]);
  beatBar(bar, [0, 3, 4], { crash: i === 0, openLast: i === 3 });
});
fill16(20, 3, [SN, TH, TM, TF]);

L(74, 17, 0, 2.0, 112); bend(17, 0, 2.0, 2, { rise: 0.33, vib: 0.25 }); // D bent to E, held
L(74, 17, 2.5, 0.5); L(71, 17, 3.0, 0.5); L(74, 17, 3.5, 0.5);
L(76, 18, 0, 0.5); L(79, 18, 0.5, 0.5); L(76, 18, 1.0, 0.5); L(74, 18, 1.5, 0.5);
vibNote(73, 18, 2.0, 1.0, 0.25); // C# over the A chord: Mixolydian major color
L(71, 18, 3.0, 0.5); L(69, 18, 3.5, 0.5);
L(79, 19, 0, 1.5, 114); bend(19, 0, 1.5, 2, { rise: 0.33, release: true }); // G to A, release
L(76, 19, 2.0, 0.5); L(79, 19, 2.5, 0.5); L(76, 19, 3.0, 0.5); L(74, 19, 3.5, 0.5);
L(76, 20, 0, 0.5); L(74, 20, 0.5, 0.5); L(71, 20, 1.0, 0.5); L(67, 20, 1.5, 0.5);
L(69, 20, 2.0, 0.5); L(71, 20, 2.5, 0.5);
vibNote(76, 20, 3.0, 1.0, 0.35);

// Bars 21–24: the riff again, bar 24 cuts the band after the A hit so the riff guitar alone leads back to bar 1
riffSection(21, { lastStop: true });
for (const bar of [21, 23]) {
  rhyBar(bar, "E");
  bassRiffA(bar);
  beatBar(bar, KICK_A, { crash: bar === 21 });
}
rhyBar(22, "D", "A", { split: 3 });
bassRiffB(22);
beatBar(22, KICK_B);
// bar 24: hits on 1 and &2, then the band drops out
down(rhyOpen, S(24, 0), SHAPES.D, 0.9, 108);
chk(rhyMute, S(24, 2), MUTE.D, 86);
down(rhyOpen, S(24, 3), SHAPES.A, 1.0, 112);
bassRiffB(24, { stop: true });
[0, 3].forEach((s) => {
  d(K, S(24, s), 120);
  d(CR, S(24, s), 112, 1);
});
d(SN, S(24, 2), 110);

// ---------------- Project ----------------
bendPoints.sort((a, b) => a.beat - b.beat);
const seen = new Set();
const drumsUnique = drums.filter((x) => {
  const key = `${x.pitch}@${x.start}`;
  return seen.has(key) ? false : (seen.add(key), true);
});
const round = (pts) => pts.map((p) => ({ beat: +p.beat.toFixed(4), semitones: +p.semitones.toFixed(3) }));
const sortNotes = (ns) => ns.sort((a, b) => a.start - b.start || a.pitch - b.pitch);

const TELE = "flamestudios-telecaster-bridge";
const project = {
  title: "Open E Mixolydian",
  comment:
    "24-bar blues-based hard rock loop at 125 BPM. Crunch tracks are the rhythm guitars, High Gain is the lead; amp sim is applied offline per gain.",
  tempo: 125,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: 96 }, enabled: true },
  locators: [
    { beat: 0, label: "Riff alone" },
    { beat: 16, label: "Band in" },
    { beat: 32, label: "bVII–IV–I section" },
    { beat: 48, label: "Stop-time + lead" },
    { beat: 64, label: "Lead break" },
    { beat: 80, label: "Riff again" },
  ],
  masterGain: 0.8,
  midiTracks: [
    { name: "Crunch L Riff (open)", soundfont: TELE, program: 0, gain: 0.9, pan: -0.55, notes: sortNotes(riffOpen) },
    { name: "Crunch L Riff (muted)", soundfont: TELE, program: 1, gain: 0.85, pan: -0.55, notes: sortNotes(riffMute) },
    { name: "Crunch R Chords (open)", soundfont: TELE, program: 0, gain: 0.6, pan: 0.6, notes: sortNotes(rhyOpen) },
    { name: "Crunch R Chords (muted)", soundfont: TELE, program: 1, gain: 0.6, pan: 0.6, notes: sortNotes(rhyMute) },
    {
      name: "High Gain Lead",
      soundfont: TELE,
      program: 0,
      gain: 1.6,
      pan: 0.1,
      notes: sortNotes(lead),
      automation: [{ type: "pitch-bend", points: round(bendPoints) }],
    },
    { name: "Bass", program: 34, gain: 0.8, pan: 0, notes: sortNotes(bass) },
    { name: "Drums", program: 16, bank: 128, gain: 0.65, pan: 0, notes: sortNotes(drumsUnique) },
  ],
};
writeFileSync(new URL("./project.json", import.meta.url), JSON.stringify(project, null, 1));
console.log(project.midiTracks.map((t) => `${t.name}: ${t.notes.length} notes`).join("\n"));
