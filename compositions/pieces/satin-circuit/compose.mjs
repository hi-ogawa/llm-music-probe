// Writes project.json for Satin Circuit, an early-80s boogie in G minor at 114 BPM.
// Parts are written bar by bar as tokens `pos:note:len:vel`, with positions and lengths in
// sixteenths. A trailing `~` holds the note past the next note's start, which a mono synth
// plays as a glide without retriggering.
// Run: node compose.mjs
import { writeFileSync } from "node:fs";

const SLIDE_OVERLAP = 0.125; // beats a `~` note overlaps the next, about 66 ms at 114 BPM
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const midi = (name) => {
  const [, l, acc, oct] = name.match(/^([A-G])(b|#)?(-?\d)$/);
  return 12 * (Number(oct) + 1) + PC[l] + (acc === "#" ? 1 : acc === "b" ? -1 : 0);
};

// bars: array of token strings, one per bar, starting at `fromBar` (1-based)
function part(bars, fromBar = 1) {
  const raw = [];
  bars.forEach((bar, i) => {
    if (!bar) return;
    for (const tok of bar.trim().split(/\s+/)) {
      const slide = tok.endsWith("~");
      const [pos, note, len, vel] = tok.replace("~", "").split(":");
      const start = (fromBar - 1 + i) * 4 + Number(pos) / 4;
      raw.push({ pitch: midi(note), start, duration: Number(len) / 4, velocity: Number(vel), slide });
    }
  });
  raw.sort((a, b) => a.start - b.start);
  return raw.map((n, i) => {
    const next = raw.slice(i + 1).find((m) => m.start > n.start);
    const duration = n.slide && next ? next.start - n.start + SLIDE_OVERLAP : n.duration;
    return { pitch: n.pitch, start: n.start, duration, velocity: n.velocity };
  });
}

// ---------- bass: the filter-envelope synth bass, accents at 110+, ghosts at 60-70 ----------
const bGm = "0:G1:2:120 3:G2:1:92 6:G1:1:64 7:F2:1:96 8:G2:2:114 10:D2:1:78 11:F2:1:84~ 12:G2:1:106 14:Bb1:1:80 15:B1:1:88~";
const bC9 = "0:C2:2:120 3:C3:1:92 6:C2:1:64 7:Bb2:1:96 8:C3:2:114 10:G2:1:78 11:Bb2:1:84~ 12:C3:1:106 13:Bb2:1:70 14:A1:1:80 15:F#1:1:86~";
const bGm2 = "0:G1:2:120 3:G2:1:92 6:G1:1:64 7:F2:1:96 8:G2:1:110 9:F2:1:72 10:D2:1:80 11:C2:1:76 12:Bb1:2:104 14:C2:1:82 15:D2:1:90~";
const bEbF = "0:Eb2:2:120 3:Eb3:1:90 6:Eb2:1:66 7:D3:1:94 8:F2:2:116 11:F3:1:92 12:Eb3:1:84 13:C3:1:74 14:A2:1:86 15:G2:1:96~";
const bGmB = "0:G1:2:120 2:G1:1:70 3:G2:1:96 5:G2:1:68 6:F2:1:90 7:D2:1:80 8:G2:2:116 10:F2:1:82 11:D2:1:84~ 12:F2:1:104 13:G2:1:90 14:Bb1:1:86 15:B1:1:96~";
const bEbFtoB = "0:Eb2:2:120 3:Eb3:1:90 6:Eb2:1:66 7:D3:1:94 8:F2:2:116 11:F3:1:92 12:Eb3:1:84 13:C3:1:74 14:F2:1:86 15:E2:1:92~";
const bEbFend = "0:Eb2:2:120 3:Eb3:1:90 6:Eb2:1:66 7:D3:1:94 8:F2:2:116 11:F3:1:92 12:Eb3:1:84 13:C3:1:74 14:A1:1:90 15:F#1:1:100~";
// B: longer notes so the filter envelope has room, octave pushes that slide down
const bB1 = "0:Eb2:3:122 4:Eb2:1:70 6:Bb2:1:88 7:Eb3:2:110~ 9:D3:1:84 10:Bb2:2:96 12:Eb2:1:104 14:E2:1:80 15:C#2:1:90~";
const bB2 = "0:D2:3:122 4:D2:1:70 6:A2:1:88 7:D3:2:110~ 9:C3:1:84 10:A2:2:96 12:D2:1:104 14:C2:1:82 15:B1:1:90~";
const bB3 = "0:C2:3:122 4:C2:1:70 6:G2:1:88 7:C3:2:110~ 9:Bb2:1:84 10:G2:2:96 12:C2:1:104 14:Eb2:1:84 15:C#2:1:92~";
const bB4 = "0:D2:2:124 2:D3:1:100 3:D2:1:72 4:C3:1:96 6:D2:1:72 7:A2:1:90 8:D3:2:116 10:C3:1:88 11:A2:1:84 12:F#2:1:100 13:F2:1:96 14:D3:1:100 15:G2:1:112~";
const bass = part([
  bGm, bC9, bGm2, bEbF, // intro
  bGm, bC9, bGm2, bEbF, bGmB, bC9, bGm2, bEbFtoB, // A
  bB1, bB2, bB3, bB4, // B
  bGm, bC9, bGm2, bEbFend, // A'
  "0:G1:12:124", // end
]);

// ---------- lead: portamento lead, `~` for slides, long notes for vibrato ----------
const L1 = "2:D5:1:96~ 3:F5:3:112 6:G5:2:100 8:F5:1:88 9:D5:1:84~ 10:F5:6:110";
const L2 = "2:E5:1:96~ 3:G5:1:100~ 4:A5:4:118 8:G5:1:92 9:F5:1:86~ 10:E5:2:96~ 12:D5:4:104";
const L3 = "0:Bb4:2:100~ 2:C5:1:90~ 3:D5:3:112 6:F5:1:94 7:D5:1:84~ 8:C5:2:96 10:Bb4:1:86~ 11:A4:1:84~ 12:G4:4:106";
const L4 = "2:G4:1:90 3:Bb4:1:96 4:D5:2:110 6:C5:1:90 7:D5:1:94~ 8:F5:4:114 12:Eb5:4:106";
const L5 = "2:D5:1:98~ 3:F5:3:114 6:G5:2:102 8:Bb5:1:110~ 9:A5:1:96~ 10:G5:6:112";
const L6 = "2:E5:1:96~ 3:G5:1:102~ 4:A5:2:116~ 6:C6:4:122 10:Bb5:1:98~ 11:A5:1:94~ 12:G5:4:108";
const L7 = "0:F5:1:100 1:G5:1:92 2:F5:1:88~ 3:D5:2:104 5:C5:1:86 6:D5:2:100~ 8:F5:1:96~ 9:G5:3:112 12:F5:1:88 13:D5:1:84 14:C5:1:88~ 15:Bb4:1:86";
const L8 = "0:C5:2:96~ 2:D5:2:104 4:Bb4:1:90~ 5:C5:1:92 6:D5:2:106~ 8:F5:2:112~ 10:G5:10:120";
const B1 = "6:F5:1:94~ 7:G5:1:100~ 8:Bb5:8:116~";
const B2 = "0:A5:6:112~ 6:G5:1:94~ 7:F5:1:92 8:A5:1:100~ 9:C6:7:118~";
const B3 = "0:Bb5:4:110~ 4:G5:4:104 8:Eb5:1:94~ 9:F5:1:96~ 10:G5:6:114";
const B4 = "0:F#5:3:112 3:A5:1:98 4:C6:4:120~ 8:Bb5:2:104~ 10:A5:2:98 12:F5:1:110~ 13:F#5:1:104 14:A5:2:100";
const L4end = "2:G4:1:90 3:Bb4:1:96 4:D5:2:110 6:C5:1:90 7:D5:1:94~ 8:F5:4:114 12:Bb5:2:108~ 14:A5:2:110~";
const lead = part([L1, L2, L3, L4, L5, L6, L7, L8, B1, B2, B3, B4, L1, L2, L3, L4end, "0:G5:14:116"], 5);

// ---------- pad: rootless voicings, C9 and F13 pushed ahead of the beat ----------
const CH = {
  Gm9: ["Bb3", "D4", "F4", "A4"],
  C9: ["Bb3", "D4", "E4", "G4"],
  Eb9: ["Bb3", "D4", "F4", "G4"],
  F13: ["A3", "D4", "Eb4", "G4"],
  Dm9: ["A3", "C4", "E4", "F4"],
  Cm9: ["Bb3", "D4", "Eb4", "G4"],
  D7s9: ["F#3", "C4", "F4", "A4"],
  GmEnd: ["Bb3", "D4", "F4", "A4", "D5"],
};
const aChanges = [["Gm9", 0], ["C9", 3.5], ["Gm9", 8], ["Eb9", 12], ["F13", 13.5]]; // beats into a 4-bar loop
const bChanges = [["Eb9", 0], ["Dm9", 4], ["Cm9", 8], ["D7s9", 12]];
const padChords = [];
const loop = (changes, bar, vel) => changes.forEach(([c, b]) => padChords.push({ c, start: (bar - 1) * 4 + b, vel }));
loop(aChanges, 1, 70);
loop(aChanges, 5, 82);
loop(aChanges, 9, 86);
loop(bChanges, 13, 98);
loop(aChanges, 17, 88);
padChords.push({ c: "GmEnd", start: 80, vel: 100 });
const pad = padChords.flatMap(({ c, start, vel }, i) => {
  const end = padChords[i + 1]?.start ?? 84;
  return CH[c].map((n, j) => ({ pitch: midi(n), start, duration: end - start - 0.05, velocity: vel - j * 2 }));
});

// ---------- drums: Standard kit, 16th hats, clap on the snare ----------
const drums = [];
const hit = (bar, pos, pitch, velocity) => drums.push({ pitch, start: (bar - 1) * 4 + pos / 4, duration: 0.25, velocity });
const HAT = [92, 52, 74, 58];
for (let bar = 1; bar <= 20; bar++) {
  const fill = [4, 12, 16, 20].includes(bar);
  const openHat = bar % 2 === 0 && !fill;
  hit(bar, 0, 36, 118);
  hit(bar, 8, 36, 110);
  if (bar % 2 === 1) hit(bar, 11, 36, 86);
  if (bar % 4 === 2) hit(bar, 14, 36, 78);
  hit(bar, 4, 38, 112);
  hit(bar, 4, 39, 92);
  if (!fill) { hit(bar, 12, 38, 112); hit(bar, 12, 39, 92); }
  for (let p = 0; p < 16; p++) {
    if (fill && p >= 12) continue;
    if (openHat && p === 14) { hit(bar, 14, 46, 84); continue; }
    hit(bar, p, 42, HAT[p % 4]);
  }
  if (fill) [[12, 38, 108], [13, 38, 84], [14, 48, 104], [15, 45, 110]].forEach(([p, n, v]) => hit(bar, p, n, v));
  if (fill && bar !== 20) hit(bar, 15, 39, 96);
}
for (const bar of [5, 13, 17, 21]) hit(bar, 0, 49, 110);
hit(21, 0, 36, 120);

// ---------- General MIDI controls where the synth versions get the same ----------
// SpessaSynth's portamento (CC 65 on, CC 5 time) glides every note-on from the previous key while it's on,
// so CC 65 opens just around each slide's landing note. CC 5 sets milliseconds per semitone, not a total time.
// CC 74 shifts the preset's cutoff for the whole channel, so it's set before each note from its velocity.
const EPS = 1 / 96;
function gmControls(notes, { portaTime, cutoffPerVelocity }) {
  const porta = [{ beat: 0, value: 0 }];
  notes.forEach((n, i) => {
    const prev = notes[i - 1];
    if (prev && prev.start + prev.duration > n.start) porta.push({ beat: n.start - EPS, value: 127 }, { beat: n.start + EPS, value: 0 });
  });
  const cutoff = notes.map((n) => ({ beat: Math.max(0, n.start - EPS), value: Math.max(0, Math.min(127, Math.round(64 + (n.velocity - 96) * cutoffPerVelocity))) }));
  cutoff[0].beat = 0;
  return [
    { type: "controller", controller: 5, points: [{ beat: 0, value: portaTime }] },
    { type: "controller", controller: 65, points: porta },
    { type: "controller", controller: 74, points: cutoff },
  ];
}

const comment = `# Satin Circuit

Early-80s boogie in G minor, 114 BPM, written to demo a custom synth against General MIDI ([toy-midi#1005](https://github.com/hi-ogawa/toy-midi/issues/1005)). The synth parts carry it.

- **Synth bass** is the star: octave-jumping sixteenths with accents (velocity 110+) and ghost notes (60-70), so a filter that follows velocity barks on the accents. Notes that overlap the next one are slides.
- **Lead** is a portamento lead: overlapping notes are where a mono synth should glide, and the long notes are where vibrato should come in.
- **Pad** holds rootless voicings, with C9 and F13 pushed an eighth ahead.

Form: intro (1-4), A (5-12), B (13-16, Ebmaj9 Dm9 Cm9 D7#9 with long lead notes), A' (17-20), last chord (21).

On General MIDI, the bass and lead get portamento (CC 65 and CC 5) on the overlapping notes, and CC 74 raises the cutoff on accents and lowers it on ghosts. The previous note still sounds for the overlap, because a track can't switch the channel to mono.`;

const track = (o) => ({ viewMode: "editor", height: 160, pan: 0, muted: false, soloed: false, keySignature: { fifths: -2, mode: "minor" }, ...o });
const project = {
  title: "Satin Circuit",
  comment,
  tempo: 114,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { enabled: false, range: { startBeat: 0, endBeat: 84 } },
  locators: [
    { beat: 0, label: "Intro" },
    { beat: 16, label: "A" },
    { beat: 48, label: "B" },
    { beat: 64, label: "A'" },
    { beat: 80, label: "End" },
  ],
  midiTracks: [
    track({ name: "Lead", program: 81, gain: 0.6, pan: 0.1, notes: lead, automation: gmControls(lead, { portaTime: 48, cutoffPerVelocity: 0.15 }) }),
    track({ name: "Synth Bass", program: 38, gain: 0.8, notes: bass, automation: gmControls(bass, { portaTime: 32, cutoffPerVelocity: 0.25 }) }),
    track({ name: "Pad", program: 90, gain: 0.4, pan: -0.1, notes: pad }),
    track({ name: "Drums", program: 0, bank: 128, gain: 0.7, notes: drums }),
  ],
};
writeFileSync(new URL("./project.json", import.meta.url), JSON.stringify(project, null, 1) + "\n");
console.log("notes:", project.midiTracks.map((t) => `${t.name} ${t.notes.length}`).join(", "));
