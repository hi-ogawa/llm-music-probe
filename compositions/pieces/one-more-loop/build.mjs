import { writeFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";

const BARS = 68;
// F minor French-house loop: Fm9 | Dbmaj9 | Bbm9 | Csus -> C7b9
const prog = [
  { root: 41, low: 29, voice: [56, 60, 63, 67], voice2: null },
  { root: 37, low: 25, voice: [56, 60, 63, 65], voice2: null },
  { root: 46, low: 34, voice: [56, 60, 61, 65], voice2: null },
  { root: 36, low: 24, voice: [58, 60, 65, 67], voice2: [58, 61, 64, 67] },
];
const chordAt = (bar, beat = 0) => {
  const c = prog[bar % 4];
  return beat >= 2 && c.voice2 ? c.voice2 : c.voice;
};

const tracks = {};
const T = (name, program, opts = {}) => (tracks[name] = { name, program, notes: [], ...opts });
const add = (name, pitch, start, duration, velocity) =>
  tracks[name].notes.push({ pitch, start, duration, velocity: Math.max(1, Math.min(127, Math.round(velocity))) });

T("Brass Hook", 61, { gain: 1.0, pan: 0.1 });
T("Flute", 73, { gain: 0.7, pan: -0.25 });
T("Horns", 60, { gain: 0.7, pan: -0.15 });
T("Violins (hi-hat)", 40, { gain: 0.55, pan: -0.4 });
T("Strings (chops)", 48, { gain: 0.4, pan: 0.25 });
T("Strings (pad)", 49, { gain: 0.45, pan: 0 });
T("Harp", 46, { gain: 0.6, pan: 0.45 });
T("Cello", 42, { gain: 0.75, pan: 0.3 });
T("Pizz Bass", 45, { gain: 0.95, pan: 0.05 });
T("Contrabass", 43, { gain: 0.5, pan: 0.2 });
T("Timpani (kick)", 47, { gain: 0.85, pan: 0 });
T("Orchestra Hit (clap)", 55, { gain: 0.4, pan: 0 });

// --- pattern writers -------------------------------------------------------
const pizz = (bar, vel) => {
  const c = prog[bar % 4];
  for (let b = 0; b < 4; b++) {
    add("Pizz Bass", c.root, bar * 4 + b, 0.4, vel);
    add("Pizz Bass", c.root + 12, bar * 4 + b + 0.5, 0.35, vel - 12);
  }
};
const ostinato = (bar, vel) => {
  const order = [0, 2, 1, 2, 3, 2, 1, 2, 0, 2, 1, 2, 3, 2, 1, 2];
  for (let i = 0; i < 16; i++) {
    const v = chordAt(bar, i / 4).map((p) => p + 12);
    const accent = i % 4 === 2 ? 1.0 : i % 4 === 0 ? 0.8 : 0.6;
    add("Violins (hi-hat)", v[order[i]], bar * 4 + i / 4, 0.2, vel * accent);
  }
};
const chops = (bar, vel, transpose = 0) => {
  for (const s of [2, 5, 6, 10, 13, 14]) {
    for (const p of chordAt(bar, s / 4)) add("Strings (chops)", p + transpose, bar * 4 + s / 4, 0.2, vel);
  }
};
const pad = (bar, vel) => {
  const c = prog[bar % 4];
  if (c.voice2) {
    for (const p of c.voice) add("Strings (pad)", p, bar * 4, 2, vel);
    for (const p of c.voice2) add("Strings (pad)", p, bar * 4 + 2, 2, vel);
  } else for (const p of c.voice) add("Strings (pad)", p, bar * 4, 4, vel);
};
const kick = (bar, vel, every = 1) => {
  const p = prog[bar % 4].root;
  for (let b = 0; b < 4; b += every) add("Timpani (kick)", p, bar * 4 + b, 0.5, b === 0 ? vel : vel * 0.8);
};
const clap = (bar, vel) => {
  const p = prog[bar % 4].root + 24;
  for (const b of [1, 3]) add("Orchestra Hit (clap)", p, bar * 4 + b, 0.25, vel);
};
const contrabass = (bar, vel) => add("Contrabass", prog[bar % 4].low + 12, bar * 4, 4, vel);

// The hook: a 4-bar syncopated brass riff, one bar per chord
const hook = [
  [[72, 0, 0.5], [72, 0.75, 0.5], [75, 1.5, 0.75], [72, 2.5, 0.5], [68, 3, 0.5], [70, 3.5, 0.5]],
  [[72, 0, 0.5], [72, 0.75, 0.5], [75, 1.5, 0.75], [77, 2.5, 1.5]],
  [[73, 0, 0.5], [73, 0.75, 0.5], [77, 1.5, 0.75], [73, 2.5, 0.5], [72, 3, 0.5], [70, 3.5, 0.5]],
  [[72, 0, 1], [67, 1.5, 0.5], [70, 2, 0.5], [72, 2.5, 0.5], [76, 3, 1]],
];
const playHook = (track, bar, vel, transpose = 0, legato = false, only = null) => {
  const ph = hook[bar % 4];
  ph.forEach(([p, s, d], i) => {
    if (only && !only.includes(i)) return;
    const dur = legato ? (i + 1 < ph.length ? ph[i + 1][1] - s : 4 - s) : d;
    add(track, p + transpose, bar * 4 + s, dur, i === 0 ? vel : vel - 8);
  });
};
// Flute countermelody, long tones over the hook
const counter = [[[79, 0, 4]], [[80, 0, 4]], [[77, 0, 4]], [[76, 0, 2], [79, 2, 2]]];
const playCounter = (bar, vel) => counter[bar % 4].forEach(([p, s, d]) => add("Flute", p, bar * 4 + s, d, vel));

const harp = (bar, vel) => {
  const c = prog[bar % 4];
  for (let i = 0; i < 8; i++) {
    const v = chordAt(bar, i / 2).map((p) => p + 12);
    const seq = [c.root + 12, v[0], v[1], v[2], v[3], v[2], v[1], v[0]];
    add("Harp", seq[i], bar * 4 + i / 2, 1, vel);
  }
};

// Build-up: accelerating timpani, rising string tremolo, brass swell, then a half-beat hole
const builds = [];
const buildUp = (fromBar, bars, { brass = true } = {}) => {
  const start = fromBar * 4, len = bars * 4, end = start + len;
  builds.push(end);
  // timpani on the dominant, quarters -> 8ths -> 16ths -> 16th triplets
  const steps = bars === 2 ? [0.5, 0.25] : [1, 0.5, 0.25, 1 / 6];
  steps.forEach((step, i) => {
    for (let t = start + i * 4; t < start + (i + 1) * 4 - 1e-9; t += step) {
      const prog01 = (t - start) / len;
      add("Timpani (kick)", 36, t, step, 55 + 65 * prog01);
    }
  });
  // violin tremolo climbing the F minor scale
  const scale = [60, 62, 63, 65, 67, 68, 70, 72, 74, 75, 77, 79, 80, 82, 84];
  const n = len * 4;
  for (let i = 0; i < n; i++) {
    const p = scale[Math.floor((i / n) * scale.length)];
    add("Violins (hi-hat)", p, start + i / 4, 0.25, 45 + 80 * (i / n));
  }
  // cellos climb in long tones underneath
  const cel = [48, 49, 51, 52, 53, 55, 56, 58];
  const per = len / cel.length;
  if (bars > 2) cel.forEach((p, i) => add("Cello", p, start + i * per, per, 60 + 50 * (i / cel.length)));
  // pizz pedal on C in 8ths
  for (let t = start; t < end; t += 0.5) add("Pizz Bass", (t * 2) % 2 ? 48 : 36, t, 0.35, 60 + 50 * ((t - start) / len));
  // brass swell on C7 in repeated 8ths over the last two bars
  if (brass)
    for (let t = end - 8; t < end; t += 0.5)
      for (const p of [58, 64, 67, 72]) add("Horns", p - 12, t, 0.4, 50 + 70 * ((t - end + 8) / 8));
};

// --- arrangement -------------------------------------------------------------
// Intro (0-7): the "filter" opens as voices enter and velocities rise
for (let b = 0; b < 6; b++) {
  pizz(b, 55 + b * 6);
  if (b >= 2) ostinato(b, 40 + (b - 2) * 8);
  if (b >= 4) { chops(b, 45 + (b - 4) * 10, -12); kick(b, 60, 4); }
}
buildUp(6, 2, { brass: false });
for (let b = 6; b < 8; b++) chops(b, 70, -12);

// Groove (8-23): four-on-the-floor timpani, horns preview the hook
for (let b = 8; b < 22; b++) {
  pizz(b, 92); ostinato(b, 75); chops(b, 72); kick(b, 80);
  if (b >= 12) contrabass(b, 60);
  if (b >= 16) playHook("Horns", b, 72, -12, false, [0, 1, 2]);
}
buildUp(22, 2);
for (let b = 22; b < 24; b++) chops(b, 80);

// Chorus 1 (24-39)
for (let b = 24; b < 40; b++) {
  pizz(b, 100); ostinato(b, 82); chops(b, 78); kick(b, 95); clap(b, 90); pad(b, 55); contrabass(b, 70);
  playHook("Brass Hook", b, 112);
}

// Breakdown (40-47): no rhythm section, the hook sung legato by the cellos
for (let b = 40; b < 48; b++) {
  pad(b, 72); harp(b, b < 44 ? 60 : 72);
  playHook("Cello", b, 85, -12, true);
  if (b >= 44) playCounter(b, 65);
}
// Breakdown build (48-51)
buildUp(48, 4);
for (let b = 48; b < 50; b++) pad(b, 70);

// Chorus 2 (52-67): everything, plus the flute countermelody and horns under the hook
for (let b = 52; b < BARS; b++) {
  pizz(b, 104); ostinato(b, 86); chops(b, 80); kick(b, 100); clap(b, 95); pad(b, 62); contrabass(b, 75);
  playHook("Brass Hook", b, 118);
  playHook("Horns", b, 85, -12);
  playCounter(b, 85);
}
// Last bar: a flute run tumbles back into the intro
tracks["Flute"].notes = tracks["Flute"].notes.filter((n) => !(n.start === 67 * 4 + 2));
add("Flute", 79, 67 * 4 + 2, 1, 85);
for (const [p, s] of [[84, 3], [79, 3.25], [76, 3.5], [72, 3.75]]) add("Flute", p, 67 * 4 + s, 0.25, 90);

// The hole before each drop: cut everything in the last half beat of a build
for (const end of builds) {
  for (const t of Object.values(tracks)) {
    t.notes = t.notes.filter((n) => !(n.start >= end - 0.5 && n.start < end));
    for (const n of t.notes) if (n.start < end - 0.5 && n.start + n.duration > end - 0.5) n.duration = end - 0.5 - n.start;
  }
}

const keySignature = { fifths: -4, mode: "minor" };
const project = {
  title: "Orchestral Daft Punk: One More Loop",
  comment:
    "French-house loop (Fm9 - Dbmaj9 - Bbm9 - C7) played by an orchestra with no drum kit. Timpani = kick, orchestra hit = clap, violin spiccato = hi-hats, staccato strings = guitar chops, pizzicato octaves = disco bass. Velocity ramps stand in for filter sweeps.",
  tempo: 122,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { enabled: true, range: { startBeat: 0, endBeat: BARS * 4 } },
  locators: [
    { beat: 0, label: "Intro (filter opens)" },
    { beat: 24, label: "Build" },
    { beat: 32, label: "Groove" },
    { beat: 88, label: "Build" },
    { beat: 96, label: "Chorus" },
    { beat: 160, label: "Breakdown" },
    { beat: 192, label: "Build" },
    { beat: 208, label: "Chorus 2" },
  ],
  midiTracks: Object.values(tracks).map((t) => ({ ...t, keySignature, notes: t.notes.sort((a, b) => a.start - b.start) })),
};
writeFileSync("project.json", JSON.stringify(project));
const payload = deflateRawSync(JSON.stringify(project)).toString("base64url");
writeFileSync("link.txt", `https://toy-midi.hiro18181.workers.dev/draft#p=${payload}`);
console.log(Object.values(tracks).map((t) => `${t.name}: ${t.notes.length}`).join("\n"));
console.log("link length", payload.length);
