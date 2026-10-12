import { deflateRawSync } from "node:zlib";
const site = "https://fix-issue-822-llms-txt-toy-midi.hiro18181.workers.dev";
const eq = { bypass: false, bands: [] };
const track = (id, name, program, bank, gain, notes) => ({
  id,
  name,
  program,
  bank,
  gain,
  height: 160,
  muted: false,
  soloed: false,
  eq,
  notes,
});
let n = 0;
const note = (pitch, start, duration, velocity = 100) => ({
  id: `n${n++}`,
  pitch,
  start,
  duration,
  velocity,
});
const BARS = 4;

// Drums, GM map on the TR-808 kit. 16th grid, swung slightly.
const drums = [];
const swing = (s) => (s % 2 === 1 ? s * 0.25 + 0.06 : s * 0.25);
const kick = [
  [0, 3, 7, 10],
  [0, 3, 7, 10, 14],
  [0, 3, 7, 10],
  [0, 6, 7, 10, 13],
];
for (let b = 0; b < BARS; b++) {
  const o = b * 4;
  for (const s of kick[b]) {
    drums.push(note(36, o + swing(s), 0.25, s === 0 ? 120 : 105));
  }
  drums.push(note(38, o + 1, 0.25, 115), note(39, o + 1, 0.25, 80));
  drums.push(note(38, o + 3, 0.25, 118), note(39, o + 3, 0.25, 85));
  if (b === 3) {
    drums.push(note(38, o + swing(15), 0.25, 70));
  }
  for (let s = 0; s < 16; s += 2) {
    drums.push(
      note(
        s === 14 && b % 2 === 1 ? 46 : 42,
        o + swing(s),
        0.25,
        s % 4 === 0 ? 90 : 65,
      ),
    );
  }
  if (b === 1 || b === 3) {
    drums.push(
      note(42, o + swing(11), 0.25, 50),
      note(42, o + swing(13), 0.25, 55),
    );
  }
}

// Rhodes chords: Am9, Fmaj7, Dm9, E7#9
const chords = [
  [57, 60, 64, 67, 71],
  [53, 57, 60, 64, 67],
  [50, 57, 60, 64, 65],
  [52, 56, 62, 67],
];
const keys = [];
chords.forEach((c, b) => {
  for (const p of c) {
    keys.push(note(p, b * 4, 2.4, 72), note(p, b * 4 + 2.75, 1.2, 60));
  }
});

// Bass following the roots.
const roots = [33, 29, 26, 28];
const bass = [];
roots.forEach((r, b) => {
  const o = b * 4;
  bass.push(
    note(r, o, 1.4, 110),
    note(r, o + 1.75, 0.5, 95),
    note(r + 12, o + 2.5, 0.4, 85),
    note(r, o + 3, 0.75, 100),
  );
});

const project = {
  title: "Hip Hop Loop",
  comment:
    "4-bar boom-bap loop, 88 BPM, A minor.\nDrums: TR-808 kit, kick/snare/clap on 2 and 4, swung 8th hats, open hat and ghost snare fills on bars 2 and 4.\nBass: Synth Bass 1 on the chord roots with octave pops.\nRhodes: Am9 - Fmaj7 - Dm9 - E7#9, held then re-struck on the and of 3.",
  audioTracks: [],
  midiTracks: [
    track("drums", "Drums (808)", 25, 128, 1, drums),
    track("bass", "Bass", 38, 0, 0.9, bass),
    track("keys", "Rhodes", 4, 0, 0.6, keys),
  ],
  trackOrder: ["drums", "bass", "keys"],
  tempo: 88,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: BARS * 4 }, enabled: true },
};
const url = `${site}/draft#p=${deflateRawSync(JSON.stringify(project)).toString("base64url")}`;
console.log(url);
console.error("length", url.length);
