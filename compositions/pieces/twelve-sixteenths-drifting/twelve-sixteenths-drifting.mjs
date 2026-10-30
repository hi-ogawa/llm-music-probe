import { writeFileSync } from "node:fs";

// Twelve Sixteenths, Drifting: a phase piece for two marimbas and vibraphone.
// See README.md for the cell, the form, and the parts.

function buildPhasePiece() {
  const TEMPO = 126;
  const BAR = 3; // 3/4, 12 sixteenths per bar
  const S = 0.25; // a 16th in beats

  // The cell: A4 E5 D5 B4 | E5 A4 F#5 D5 | B4 E5 D5 F#4
  const CELL = [69, 76, 74, 71, 76, 69, 78, 74, 71, 76, 74, 66];
  // Accents every third 16th (3+3+3+3) against the 4-16th quarter pulse.
  const VEL = [104, 70, 80, 98, 72, 82, 100, 70, 80, 96, 74, 84];

  // Sections in bars. offset = how many 16ths part B runs ahead of part A.
  const sections = [
    { label: "Cell alone (left)", bars: 4, offset: 0, b: false },
    { label: "Unison: right fades in", bars: 4, offset: 0, b: true },
  ];
  const stepBars = [6, 6, 6, 8, 8, 12, 8, 8, 6, 6, 6];
  stepBars.forEach((bars, i) => {
    const k = i + 1;
    let label = `Phase ${k}: +${k}/16`;
    if (k === 6) label += " (half cycle, peak)";
    sections.push({ label, bars, offset: k, b: true });
  });
  sections.push({ label: "Phase 12: back in unison", bars: 8, offset: 0, b: true });
  sections.push({ label: "Final stroke", bars: 2, offset: null, b: true });

  let bar = 0;
  for (const s of sections) {
    s.startBar = bar;
    bar += s.bars;
  }
  const totalBars = bar;
  const totalBeats = totalBars * BAR;

  const notesA = [];
  const notesB = [];
  for (const s of sections) {
    if (s.offset === null) continue;
    for (let b = 0; b < s.bars; b++) {
      for (let i = 0; i < 12; i++) {
        const start = (s.startBar + b) * BAR + i * S;
        notesA.push({ pitch: CELL[i], start, duration: S, velocity: VEL[i] });
        if (s.b) {
          const j = (i + s.offset) % 12;
          notesB.push({ pitch: CELL[j], start, duration: S, velocity: VEL[j] });
        }
      }
    }
  }
  const finalSection = sections[sections.length - 1];
  const endBeat = finalSection.startBar * BAR;
  notesA.push({ pitch: 69, start: endBeat, duration: 3, velocity: 96 });
  notesA.push({ pitch: 57, start: endBeat, duration: 3, velocity: 84 });
  notesB.push({ pitch: 76, start: endBeat, duration: 3, velocity: 92 });
  notesB.push({ pitch: 64, start: endBeat, duration: 3, velocity: 80 });

  // Global dynamic arc for the marimbas, as CC 11 targets at section starts.
  const sec = (label) => sections.find((s) => s.label.startsWith(label));
  const arc = [
    [0, 82],
    [sec("Phase 1").startBar * BAR, 88],
    [sec("Phase 6").startBar * BAR, 116],
    [sec("Phase 7").startBar * BAR, 116],
    [sec("Phase 11").startBar * BAR, 98],
    [sec("Phase 12").startBar * BAR, 102],
    [endBeat - 0.5, 72],
    [endBeat, 100],
    [totalBeats, 100],
  ];
  const arcAt = (beat) => {
    for (let i = 0; i < arc.length - 1; i++) {
      const [b0, v0] = arc[i];
      const [b1, v1] = arc[i + 1];
      if (beat >= b0 && beat <= b1) {
        return b1 === b0 ? v1 : v0 + ((v1 - v0) * (beat - b0)) / (b1 - b0);
      }
    }
    return arc[arc.length - 1][1];
  };
  // Each phase step breathes: a small dip as the shift lands, swelling back.
  const breathAt = (beat) => {
    const s = sections.find((x) => beat >= x.startBar * BAR && beat < (x.startBar + x.bars) * BAR);
    if (!s || s.offset === null || !s.label.startsWith("Phase")) return 0;
    const t = (beat - s.startBar * BAR) / (s.bars * BAR);
    return -10 * (1 - Math.sin(Math.PI * Math.min(1, t * 1.6)) ** 0.5) * (t < 0.62 ? 1 : 0.3);
  };
  const clamp = (v) => Math.max(0, Math.min(127, Math.round(v)));
  const ccA = [];
  const ccB = [];
  const unisonIn = sec("Unison").startBar * BAR;
  const unisonFull = sec("Phase 1").startBar * BAR;
  for (let beat = 0; beat < totalBeats; beat += 0.5) {
    const v = arcAt(beat) + breathAt(beat);
    ccA.push({ beat, value: clamp(v) });
    let vb = v;
    if (beat < unisonIn) vb = 0;
    else if (beat < unisonFull) vb = v * ((beat - unisonIn) / (unisonFull - unisonIn)) ** 1.5;
    ccB.push({ beat, value: clamp(vb) });
  }

  // Vibraphone: slow chords from the cell's own pitch set, struck every 4 bars.
  const vibeChords = {
    3: [[57, 64]],
    4: [[59, 66]],
    5: [[62, 69], [62, 66, 69]],
    6: [[62, 66, 71], [64, 69, 71], [62, 66, 71, 76]],
    7: [[59, 64, 69], [59, 66, 69]],
    8: [[57, 62, 66], [57, 64, 66]],
    9: [[57, 64]],
    10: [[59, 66]],
  };
  const vibePeak = { 3: 70, 4: 80, 5: 92, 6: 110, 7: 96, 8: 86, 9: 70, 10: 56 };
  const notesV = [];
  const ccV = [{ beat: 0, value: 0 }];
  for (const s of sections) {
    const k = s.label.startsWith("Phase") ? s.offset : -1;
    const chords = vibeChords[k];
    if (!chords) continue;
    const strokes = Math.ceil(s.bars / 4);
    for (let n = 0; n < strokes; n++) {
      const startBar = s.startBar + n * 4;
      const len = Math.min(4, s.startBar + s.bars - startBar) * BAR;
      const start = startBar * BAR;
      for (const pitch of chords[Math.min(n, chords.length - 1)]) {
        notesV.push({ pitch, start, duration: len, velocity: 58 });
      }
      // Reverse swell over each stroke, rising against the vibe's decay.
      const peak = vibePeak[k];
      for (let t = 0; t < len; t += 0.5) {
        const x = t / len;
        const v = peak * (0.45 + 0.55 * Math.sin(Math.PI * Math.min(1, x * 1.25)));
        ccV.push({ beat: start + t, value: clamp(v) });
      }
    }
  }
  // Last chord under the final stroke, and silence the vibe between entries.
  notesV.push(...[57, 64, 71].map((pitch) => ({ pitch, start: endBeat, duration: 6, velocity: 60 })));
  const lastVibe = sec("Phase 11").startBar * BAR;
  ccV.push({ beat: lastVibe, value: 0 }, { beat: endBeat, value: 88 });
  ccV.sort((a, b) => a.beat - b.beat);

  const locators = sections.map((s) => ({ beat: s.startBar * BAR, label: s.label }));

  const form = sections
    .map((s) => `| ${s.startBar + 1} | ${s.bars} | ${s.label} |`)
    .join("\n");
  const seconds = Math.round((totalBeats * 60) / TEMPO);
  const comment = `# Twelve Sixteenths, Drifting

A phase piece for two marimbas and vibraphone, about ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}.

## The cell

Twelve 16ths in 3/4: **A4 E5 D5 B4 | E5 A4 F#5 D5 | B4 E5 D5 F#4**. It uses only six pitches (F#, A, B, D, E, F#'), so it hangs between D major and B minor without settling. Accents fall on every third 16th (3+3+3+3), cutting across the quarter-note pulse, which gives each part a dotted-eighth lilt of its own.

## The process

Marimba I (hard left) plays the cell unchanged from the first bar to the last. Marimba II (hard right) fades in on it in unison, then jumps ahead by one 16th at each phase step, so in step *k* it plays the cell rotated to start on note *k+1*. The accents travel with the notes, so every step makes a new composite rhythm between the speakers. After eleven steps the twelfth shift brings it back to unison.

The shifts are abrupt rather than gradual, so each relationship can be heard as a pattern in its own right. Locators mark every step.

## Form

| Bar | Bars | Section |
|---|---|---|
${form}

Step lengths shape the arc: the first three steps move off quickly (6 bars), the middle ones settle (8 bars), the half cycle at +6/16, where the parts are furthest apart and the texture densest, holds for 12 bars, and the last three hurry home (6 bars).

## Dynamics and the third voice

CC 11 carries a single arc on both marimbas, rising from 82 to 116 at the half cycle and easing back for the return. Each phase step also dips slightly as the shift lands and swells back, so the joins breathe. Marimba II enters from silence over the unison bars.

The vibraphone enters at step 3 with slow open dyads and triads drawn from the cell's pitch set, struck every four bars and thickening toward the half cycle. Each stroke has a CC 11 swell that rises against the vibe's natural decay. It thins out and drops away before the return, so the unison is heard bare, and comes back only for the final stroke: A and E in the marimbas over an open A-E-B chord.

Tempo is ${TEMPO} BPM, quick enough that the patterns blur into resultant melodies but slow enough to hear each shift.`;

  return {
    title: "Twelve Sixteenths, Drifting",
    comment,
    tempo: TEMPO,
    timeSignature: { numerator: 3, denominator: 4 },
    masterGain: 1,
    locators,
    midiTracks: [
      {
        name: "Marimba I (steady)",
        program: 12,
        pan: -1,
        gain: 1.6,
        muted: false,
        soloed: false,
        viewMode: "editor",
        height: 160,
        notes: notesA,
        automation: [{ type: "controller", controller: 11, points: ccA }],
      },
      {
        name: "Marimba II (phasing)",
        program: 12,
        pan: 1,
        gain: 1.6,
        muted: false,
        soloed: false,
        viewMode: "editor",
        height: 160,
        notes: notesB,
        automation: [{ type: "controller", controller: 11, points: ccB }],
      },
      {
        name: "Vibraphone",
        program: 11,
        pan: 0,
        gain: 1.2,
        muted: false,
        soloed: false,
        viewMode: "editor",
        height: 120,
        notes: notesV,
        automation: [{ type: "controller", controller: 11, points: ccV }],
      },
    ],
  };
}

const project = buildPhasePiece();
writeFileSync(new URL("./project.json", import.meta.url), JSON.stringify(project, null, 2) + "\n");
