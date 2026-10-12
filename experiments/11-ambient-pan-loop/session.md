# Session log

Every listener prompt in order, verbatim, with every script the agent ran that wrote to the project. All of them ran in the page through `webmcp-bridge execute-tool toy_midi_eval`. Read-only checks, playback, and bridge setup are left out, because they wrote nothing. The repository's formatter has re-wrapped the scripts, without changing the code.

## 1. Composing

Prompt: "serve webmcp-bridge cli. compose some ambiental music, 3/4, 16 bars loop. use pan effectively on https://fix-issue-736-toy-midi.hiro18181.workers.dev/recorder/1d58315b-0609-4f21-bcc6-85ebae5b1a3a"

The agent started the bridge, read the page's tool description, found an empty 4/4 project at 120 bpm with one audio track, and wrote the whole piece in one script.

```js
const id = () => crypto.randomUUID();
const N = (pitch, start, duration, velocity) => ({
  id: id(),
  pitch,
  start,
  duration,
  velocity,
});
const bar = (n) => (n - 1) * 3; // beat index of bar n (1-based), 3/4

runtime.setTitle("Slow Tide (3/4 ambient loop)");
runtime.setTempo(66);
runtime.setTimeSignature({ numerator: 3, denominator: 4 });

// 8 chords, 2 bars (6 beats) each — D major, lydian-leaning
// D  F# G  A  B  C# E = 62 66 67 69 71 73 64
const chords = [
  { root: 38, voicing: [62, 66, 69, 73] }, // Dmaj7
  { root: 43, voicing: [62, 66, 67, 71, 74] }, // Gmaj9 (D F# G B D)
  { root: 47, voicing: [62, 66, 69, 71] }, // Bm7
  { root: 40, voicing: [62, 64, 67, 71, 66] }, // Em9
  { root: 42, voicing: [61, 66, 69, 74] }, // Dmaj7/F#
  { root: 43, voicing: [62, 66, 67, 71] }, // Gmaj7
  { root: 40, voicing: [62, 64, 67, 71] }, // Em7
  { root: 45, voicing: [64, 69, 71, 73] }, // A(add9)  -> back to D
];

// --- Pad (center) ---
const padNotes = [];
chords.forEach((c, i) => {
  const start = i * 6;
  c.voicing.forEach((p, j) =>
    padNotes.push(N(p, start + j * 0.08, 6 - j * 0.08, 58)),
  );
});

// --- Low drone (center, one octave lower, slight swell overlap) ---
const droneNotes = chords.map((c, i) => N(c.root, i * 6, 6.2, 54));

// --- Electric piano melody (left) ---
const mel = [
  [69, bar(1) + 1, 2],
  [66, bar(2) + 1, 2],
  [71, bar(3) + 1, 2],
  [69, bar(4) + 1, 1.5],
  [66, bar(5), 3],
  [64, bar(6) + 1, 2],
  [62, bar(7), 3],
  [64, bar(8) + 1, 1],
  [66, bar(8) + 2, 1],
  [73, bar(9) + 1, 2],
  [69, bar(10) + 1, 2],
  [71, bar(11), 3],
  [74, bar(12) + 1, 2],
  [71, bar(13), 2],
  [67, bar(14) + 1, 2],
  [64, bar(15), 3],
  [61, bar(16), 3],
];
const epNotes = mel.map(([p, s, d], i) => N(p, s, d, 68 + (i % 3) * 5));

// --- Music box answers (right), in the melody's gaps, high octave ---
const mb = [
  [86, bar(2), 1],
  [90, bar(4) + 2.5, 1],
  [81, bar(6), 1.5],
  [86, bar(8), 1],
  [88, bar(10), 1],
  [90, bar(12), 1],
  [83, bar(14), 1.5],
  [85, bar(16) + 1.5, 0.5],
  [88, bar(16) + 2, 1],
];
const mbNotes = mb.map(([p, s, d]) => N(p, s, d, 52));

// --- Crystal twinkles, ping-pong hard L / hard R, alternating bars ---
const twinkleL = [],
  twinkleR = [];
for (let b = 1; b <= 16; b++) {
  const chord = chords[Math.floor((b - 1) / 2)];
  const tones = chord.voicing.map((p) => p + 24);
  const p = tones[(b * 3) % tones.length];
  if (b % 2 === 1) twinkleL.push(N(p, bar(b) + 2.5, 0.5, 42));
  else twinkleR.push(N(p, bar(b) + 1.5, 0.5, 42));
}

const tracks = [
  { name: "Pad (center)", program: 88, pan: 0.0, gain: 0.55, notes: padNotes },
  {
    name: "Drone (center)",
    program: 89,
    pan: 0.0,
    gain: 0.6,
    notes: droneNotes,
  },
  { name: "E.Piano (L)", program: 4, pan: -0.45, gain: 0.8, notes: epNotes },
  { name: "Music box (R)", program: 10, pan: 0.6, gain: 0.7, notes: mbNotes },
  {
    name: "Crystal (hard L)",
    program: 98,
    pan: -0.95,
    gain: 0.5,
    notes: twinkleL,
  },
  {
    name: "Crystal (hard R)",
    program: 98,
    pan: 0.95,
    gain: 0.5,
    notes: twinkleR,
  },
];

const made = [];
for (const t of tracks) {
  const tid = await runtime.addMidiTrack({ bank: 0, program: t.program });
  runtime.setTrackName({ id: tid, name: t.name });
  runtime.setTrackPan(tid, t.pan);
  runtime.setTrackMix(tid, { gain: t.gain });
  runtime.setMidiTrackSettings(tid, {
    keySignature: { fifths: 2, mode: "major" },
    viewMode: "overview",
  });
  runtime.setMidiTrackNotes(tid, t.notes);
  made.push({ id: tid, name: t.name, notes: t.notes.length });
}

runtime.setLoop({ range: { startBeat: 0, endBeat: 48 }, enabled: true });
runtime.setMetronomeEnabled(false);
runtime.setComment(
  `Slow Tide — ambient loop, 3/4, 16 bars (48 beats) at 66 bpm, D major (lydian-leaning).
Harmony: 8 chords x 2 bars: Dmaj7 | Gmaj9 | Bm7 | Em9 | Dmaj7/F# | Gmaj7 | Em7 | A(add9) -> loops to D.
Stereo plan:
- Pad + low drone sit center as the bed.
- Electric piano melody at -0.45 (left), sparse, mostly entering on beat 2 to float over the bar.
- Music box answers at +0.6 (right) in the melody's gaps, two octaves up, so L/R hold a quiet conversation.
- Two crystal tracks hard-panned (-0.95 / +0.95) ping-pong: odd bars tick on the left at beat 3.5, even bars on the right at beat 2.5.
Loop 0-48 beats enabled. Metronome off.`,
);

const s = runtime.store.get();
return { tempo: s.tempo, ts: s.timeSignature, loop: s.loop, tracks: made };
```

## 2. Playback

Prompt: "play loop"

Playback only. The first attempt, right after composing, had timed out because the page's audio context was still suspended; this one started.

## 3. Compact tracks

Prompt: "minimize track height. can also remove initial audio track"

```js
const s = runtime.store.get();
const before = s.midiTracks.map((t) => t.height);
for (const t of s.audioTracks) runtime.removeAudioTrack(t.id);
// Probe the minimum: try a tiny value and read back what the runtime clamps to.
for (const t of s.midiTracks) runtime.setTrackHeight(t.id, 1);
const after = runtime.store.get();
return {
  heightsBefore: before,
  heightsAfter: after.midiTracks.map((t) => t.height),
  audioTracks: after.audioTracks.length,
  trackOrder: after.trackOrder.length,
  isPlaying: after.isPlaying,
};
```

## 4. Percussion brainstorm

Prompt: "how about some slight percusion idea? brainstorm first."

No script. The agent proposed five ideas and recommended the first with the fourth:

1. Brushed heartbeat: Brush kit, a tap on beat 1 of every other bar, a shaker ghosting beat 3 on the bars between, tap slightly left and shaker slightly right.
2. Kalimba as rhythm: root and fifth of the current chord on beats 2 and 3, panned right beside the music box.
3. Ping-pong woodblock: one hit per bar alternating hard left and hard right in the opposite pattern to the crystal twinkles, only in bars 9 to 16.
4. Distant cymbal wash: a reverse cymbal every 4 bars at the chord change, on two tracks at -0.7 and +0.7 taking turns.
5. 808 sub-pulse: a kick on beat 1 at velocity 30, center.

## 5. All five ideas as audition tracks

Prompt: "try a all together and we can switch muting or combining some to audition later"

```js
const id = () => crypto.randomUUID();
const N = (pitch, start, duration, velocity) => ({
  id: id(),
  pitch,
  start,
  duration,
  velocity,
});
const bar = (n) => (n - 1) * 3;
const roots = [38, 43, 47, 40, 42, 43, 40, 45]; // per 2-bar chord
const rootAt = (b) => roots[Math.floor((b - 1) / 2)];

// 1. Brushed heartbeat: brush tap on beat 1 of odd bars (L), shaker on beat 3 of even bars (R)
const brushTap = [],
  shaker = [];
for (let b = 1; b <= 16; b++) {
  if (b % 2 === 1) brushTap.push(N(38, bar(b), 0.5, 46));
  else {
    shaker.push(N(70, bar(b) + 2, 0.5, 40));
    shaker.push(N(70, bar(b) + 2.5, 0.25, 28));
  }
}

// 2. Kalimba ostinato: root + fifth on beats 2 and 3, octave 5
const kalimba = [];
for (let b = 1; b <= 16; b++) {
  const r = rootAt(b) + 24;
  kalimba.push(N(r, bar(b) + 1, 0.6, 50));
  kalimba.push(N(r + 7, bar(b) + 2, 0.6, 44));
}

// 3. Ping-pong woodblock, bars 9-16 only, opposite to the crystals (R on odd, L on even), beat 2
const woodL = [],
  woodR = [];
for (let b = 9; b <= 16; b++) {
  const n = N(72, bar(b) + 1, 0.3, 46);
  (b % 2 === 1 ? woodR : woodL).push(n);
}

// 4. Reverse cymbal wash swelling into every 4th bar, alternating sides.
//    Starts 3 beats early so it peaks at the chord change; bar 1's swell wraps from bar 16.
const washL = [N(60, bar(16), 3, 42), N(60, bar(9) - 3, 3, 42)];
const washR = [N(60, bar(5) - 3, 3, 42), N(60, bar(13) - 3, 3, 42)];

// 5. 808 sub-pulse, beat 1 every bar, barely there
const sub = [];
for (let b = 1; b <= 16; b++) sub.push(N(36, bar(b), 0.5, 30));

const tracks = [
  {
    name: "1 Brush tap (L)",
    bank: 128,
    program: 40,
    pan: -0.25,
    gain: 0.7,
    notes: brushTap,
  },
  {
    name: "1 Shaker (R)",
    bank: 128,
    program: 40,
    pan: 0.2,
    gain: 0.6,
    notes: shaker,
  },
  {
    name: "2 Kalimba (R)",
    bank: 0,
    program: 108,
    pan: 0.35,
    gain: 0.55,
    notes: kalimba,
  },
  {
    name: "3 Wood (hard L)",
    bank: 0,
    program: 115,
    pan: -0.9,
    gain: 0.5,
    notes: woodL,
  },
  {
    name: "3 Wood (hard R)",
    bank: 0,
    program: 115,
    pan: 0.9,
    gain: 0.5,
    notes: woodR,
  },
  {
    name: "4 Wash (L)",
    bank: 0,
    program: 119,
    pan: -0.7,
    gain: 0.45,
    notes: washL,
  },
  {
    name: "4 Wash (R)",
    bank: 0,
    program: 119,
    pan: 0.7,
    gain: 0.45,
    notes: washR,
  },
  {
    name: "5 808 sub (center)",
    bank: 128,
    program: 25,
    pan: 0,
    gain: 0.6,
    notes: sub,
  },
];

const made = [];
for (const t of tracks) {
  const tid = await runtime.addMidiTrack({ bank: t.bank, program: t.program });
  runtime.setTrackName({ id: tid, name: t.name });
  runtime.setTrackPan(tid, t.pan);
  runtime.setTrackMix(tid, { gain: t.gain });
  runtime.setTrackHeight(tid, 1);
  runtime.setMidiTrackSettings(tid, {
    viewMode: "overview",
    keySignature: { fifths: 2, mode: "major" },
  });
  runtime.setMidiTrackNotes(tid, t.notes);
  made.push({ name: t.name, notes: t.notes.length });
}

const s = runtime.store.get();
runtime.setComment(
  s.comment +
    `

Percussion audition tracks (numbered by idea, mute/combine freely):
1 Brush tap (L, beat 1 odd bars) + Shaker (R, beat 3 even bars) = brushed heartbeat
2 Kalimba (R) root+fifth ostinato on beats 2 and 3
3 Woodblock ping-pong, bars 9-16, R on odd / L on even (opposite to the crystals)
4 Reverse-cymbal wash swelling into bars 1/9 (L) and 5/13 (R)
5 808 kick on beat 1, velocity 30, center`,
);

const after = runtime.store.get();
return {
  made,
  totalTracks: after.midiTracks.length,
  isPlaying: after.isPlaying,
  heights: [...new Set(after.midiTracks.map((t) => t.height))],
};
```

## 6. First mute set

Prompt: "go ahead switch"

The agent read this as its own suggestion from the previous reply, muting ideas 2 and 5 to hear the brushed heartbeat, the woodblock ping-pong and the wash together.

```js
const s = runtime.store.get();
for (const t of s.midiTracks) {
  const mute = /^(2|5) /.test(t.name);
  runtime.setTrackMix(t.id, { muted: mute });
}
return runtime.store
  .get()
  .midiTracks.filter((t) => /^\d /.test(t.name))
  .map((t) => ({ name: t.name, muted: t.muted }));
```

## 7. Side topic

Prompt: "side topic, on toy-midi, ui looks like this [screenshot] i didn't have complicated tracks now myself, but agent are doing cool stuff, but maybe visually it's a little hard to see what is what. what daw feature may benefit organized view for human?"

The listener forked the session for this. The agent ranked track colors, pan and instrument name in the header, dimmed muted lanes, a shared pitch scale, per-track comments, locators and folders, then re-ranked them against the toy-midi source, and filed the first as [toy-midi#821](https://github.com/hi-ogawa/toy-midi/issues/821).
