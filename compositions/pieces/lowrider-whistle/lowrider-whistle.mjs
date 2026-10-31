import { writeFileSync } from "node:fs";

const STEP = 1 / 16; // bend resolution in beats (a 64th note)
const LOOP_BEATS = 32;

// --- Lead: lone sine whistle -------------------------------------------------
// [start, duration, pitch, gesture?]
// gestures: { scoop: semis } rises from below into the note,
//           { fall: [startOffset, semis] } slides down over the note's tail,
//           { dive: [startOffset, length] } drops a full octave.
const leadSpec = [
  // Bars 1-2, Cm9
  [0.5, 0.5, 79],
  [1.0, 0.5, 82],
  [1.5, 2.5, 84, { scoop: -2 }],
  [4.75, 0.25, 87],
  [5.0, 0.5, 86],
  [5.5, 2.0, 84, { scoop: -1, fall: [1.0, -3] }],
  // Bars 3-4, F9 (the lead drops out for the pad's tape wobble)
  [8.5, 0.5, 81],
  [9.0, 0.5, 84],
  [9.5, 2.5, 87, { scoop: -2 }],
  [12.5, 0.5, 86],
  [13.0, 1.0, 84, { fall: [0.5, -3] }],
  // Bars 5-6, Abmaj7 | G7
  [16.5, 0.5, 84],
  [17.0, 0.5, 87],
  [17.5, 2.0, 91, { scoop: -2 }],
  [20.0, 0.5, 89],
  [20.5, 0.5, 86],
  [21.0, 2.0, 83, { scoop: -1, fall: [1.25, -2] }],
  // Bars 7-8, Cm9 | G7b9: the octave dive fill, then a turnaround
  [24.5, 3.0, 91, { scoop: -2, dive: [1.0, 1.5] }],
  [28.5, 0.5, 86],
  [29.0, 0.5, 89],
  [29.5, 0.25, 87],
  [29.75, 0.25, 86],
  [30.0, 1.5, 83, { scoop: -1, fall: [1.0, -2] }],
];

const leadNotes = leadSpec.map(([start, duration, pitch]) => ({
  pitch,
  start,
  duration,
  velocity: 100,
}));

// Bend points keyed by beat, so a later write at the same beat wins.
const leadBend = new Map([[0, 0]]);
const setBend = (beat, semitones) =>
  leadBend.set(round(beat), round(semitones));

leadSpec.forEach(([start, duration, , gesture = {}], i) => {
  const end = start + duration;
  const prevEnd = i > 0 ? leadSpec[i - 1][0] + leadSpec[i - 1][1] : 0;
  if (gesture.scoop) {
    // Arm the scoop just before the note when there is a gap, so the note
    // already starts low whatever order simultaneous events take.
    const armAt = start - prevEnd >= 1 / 16 ? start - 1 / 32 : start;
    setBend(armAt, gesture.scoop);
    const length = 0.375;
    for (let t = STEP; t < length; t += STEP) {
      const x = t / length;
      // Ease out: rise fast, settle gently into the pitch.
      setBend(start + t, gesture.scoop * (1 - x) ** 2);
    }
    setBend(start + length, 0);
  }
  if (gesture.fall) {
    const [offset, target] = gesture.fall;
    const from = start + offset;
    const length = end - from;
    for (let t = STEP; t <= length + 1e-9; t += STEP) {
      const x = t / length;
      // Ease in: start slowly, fall away faster at the end.
      setBend(from + t, target * x * x);
    }
  }
  if (gesture.dive) {
    const [offset, length] = gesture.dive;
    const from = start + offset;
    for (let t = STEP; t <= length + 1e-9; t += STEP) {
      const x = t / length;
      // Smoothstep from 0 down to -12 and hold there.
      setBend(from + t, -12 * x * x * (3 - 2 * x));
    }
  }
  // Return to zero at the note-off, before the next note can start.
  if (gesture.fall || gesture.dive) setBend(end, 0);
});

// --- Pads: sustained chords with one tape wobble --------------------------------
const chords = [
  // [startBeat, bars, pitches]
  [0, 2, [60, 63, 67, 70, 74]], // Cm9
  [8, 2, [57, 63, 67, 72]], // F9, rootless
  [16, 1, [56, 60, 63, 67]], // Abmaj7
  [20, 1, [59, 62, 65, 67]], // G7
  [24, 1, [60, 63, 67, 70, 74]], // Cm9
  [28, 1, [59, 62, 65, 68]], // G7b9
];
const padNotes = chords.flatMap(([start, bars, pitches]) =>
  pitches.map((pitch) => ({
    pitch,
    start,
    duration: bars * 4,
    velocity: 72,
  })),
);

// One wobble per loop over the held F9: sag a semitone, hang, and recover.
const padBend = [{ beat: 0, semitones: 0 }];
const wobbleDown = [13.5, 14.5];
const wobbleUp = [14.875, 15.75];
for (let t = wobbleDown[0]; t <= wobbleDown[1] + 1e-9; t += STEP) {
  const x = (t - wobbleDown[0]) / (wobbleDown[1] - wobbleDown[0]);
  padBend.push({ beat: round(t), semitones: round(-x * x * (3 - 2 * x)) });
}
for (let t = wobbleUp[0]; t <= wobbleUp[1] + 1e-9; t += STEP) {
  const x = (t - wobbleUp[0]) / (wobbleUp[1] - wobbleUp[0]);
  padBend.push({ beat: round(t), semitones: round(-1 + x * x * (3 - 2 * x)) });
}

// --- Bass: GM Synth Bass 1 ---------------------------------------------------------
const bassSpec = [
  // Cm9
  [0, 1.25, 36], [1.5, 0.25, 36], [1.75, 0.75, 48], [2.5, 0.5, 46], [3, 0.75, 43], [3.75, 0.25, 39],
  [4, 1.5, 36], [5.75, 0.25, 36], [6, 1, 43], [7, 0.5, 46], [7.5, 0.5, 40],
  // F9
  [8, 1.25, 41], [9.5, 0.25, 41], [9.75, 0.75, 53], [10.5, 0.5, 51], [11, 0.75, 48], [11.75, 0.25, 45],
  [12, 1.5, 41], [13.75, 0.25, 41], [14, 1, 48], [15, 0.5, 51], [15.5, 0.5, 43],
  // Abmaj7 | G7
  [16, 1.25, 44], [17.5, 0.25, 44], [17.75, 0.75, 56], [18.5, 0.5, 51], [19, 1, 48],
  [20, 1.25, 43], [21.5, 0.25, 43], [21.75, 0.75, 55], [22.5, 0.5, 53], [23, 0.5, 50], [23.5, 0.5, 47],
  // Cm9 | G7b9
  [24, 1.5, 36], [25.75, 0.25, 36], [26, 1, 48], [27, 0.5, 46], [27.5, 0.5, 43],
  [28, 1.25, 43], [29.5, 0.25, 43], [29.75, 0.75, 55], [30.5, 0.5, 53], [31, 0.5, 50], [31.5, 0.5, 47],
];
const bassNotes = bassSpec.map(([start, duration, pitch]) => ({
  pitch,
  start,
  duration,
  velocity: duration <= 0.25 ? 84 : 104,
}));

// --- Drums: TR-808 kit ---------------------------------------------------------------
const KICK = 36, SNARE = 38, CLAP = 39, CLOSED_HAT = 42, OPEN_HAT = 46;
const drumNotes = [];
const hit = (pitch, start, velocity) =>
  drumNotes.push({ pitch, start, duration: 0.25, velocity });
const kickPatterns = [
  [0, 1.5, 2.75],
  [0, 0.75, 1.5, 2.5, 3.25],
];
for (let bar = 0; bar < 8; bar++) {
  const b = bar * 4;
  for (const k of kickPatterns[bar % 2]) hit(KICK, b + k, 110);
  for (const s of [1, 3]) {
    hit(SNARE, b + s, 104);
    hit(CLAP, b + s, 80);
  }
  for (let i = 0; i < 8; i++) {
    if (bar % 2 === 1 && i === 7) continue; // open hat takes this slot
    hit(CLOSED_HAT, b + i * 0.5, i % 2 === 0 ? 82 : 58);
  }
  if (bar % 2 === 1) hit(OPEN_HAT, b + 3.5, 76);
  else hit(CLOSED_HAT, b + 3.75, 50);
}
// Snare pickup into the loop's restart
for (const s of [31.5, 31.75]) hit(SNARE, s, 70);
drumNotes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);

// --- Project -------------------------------------------------------------------------
const comment = `# Lowrider Whistle

A laid-back G-funk loop in C minor at 92 BPM that shows Toy MIDI's own synth following pitch bend.

- **Whistle Lead**: a lone sine on the own synth. It scoops up into its long notes, slides down at phrase ends, and dives a full octave as the fill in bar 7. The bend returns to zero before each next note, which is why the lead has a track to itself.
- **Tape Pad**: triangle with a little sawtooth on the own synth, holding the chords Cm9, F9, Abmaj7, G7, Cm9, G7b9. Once per loop, over the held F9 in bar 4, the whole chord sags a semitone and recovers like a warped tape, since a bend moves every note on the track at once.
- **Synth Bass**: GM Synth Bass 1, syncopated root and octave lines with chromatic approaches.
- **Drums**: GeneralUser GS TR-808 kit, kick and snare-clap backbeat with eighth-note hats.

Bends are stepped, so every slide is written as a point every 64th note.`;

const project = {
  title: "Lowrider Whistle",
  comment,
  tempo: 92,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: LOOP_BEATS }, enabled: true },
  midiTracks: [
    {
      name: "Whistle Lead",
      program: 0,
      synth: { layers: [{ oscillator: { waveform: "sine" }, gain: 0.8 }] },
      gain: 0.8,
      pan: 0.1,
      notes: leadNotes,
      automation: [
        {
          type: "pitch-bend",
          points: [...leadBend]
            .sort((a, b) => a[0] - b[0])
            .map(([beat, semitones]) => ({ beat, semitones })),
        },
      ],
    },
    {
      name: "Tape Pad",
      program: 0,
      synth: {
        layers: [
          { oscillator: { waveform: "triangle" }, gain: 0.6 },
          { oscillator: { waveform: "sawtooth" }, gain: 0.12 },
        ],
      },
      gain: 0.3,
      pan: -0.15,
      notes: padNotes,
      automation: [{ type: "pitch-bend", points: padBend }],
    },
    {
      name: "Synth Bass",
      program: 38,
      gain: 0.75,
      notes: bassNotes,
    },
    {
      name: "Drums",
      program: 25,
      bank: 128,
      gain: 0.8,
      notes: drumNotes,
    },
  ],
};

function round(x) {
  return Math.round(x * 10000) / 10000 + 0; // + 0 turns -0 into 0
}

writeFileSync(new URL("project.json", import.meta.url), `${JSON.stringify(project, null, 2)}\n`);
