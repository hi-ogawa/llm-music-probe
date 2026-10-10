// Shared song spec. Tempo 88, 4/4, beats are quarter notes, 4 beats per bar.
export const TEMPO = 88;
// Chord: name, bar offset within section, length in beats, chord tones (MIDI, low to high, no bass), bass root (MIDI)
const A = [
  ["Bbmaj9", 4, [50, 57, 60, 65], 34],
  ["Am11", 4, [55, 60, 62, 64], 33],
  ["Dm9", 4, [53, 57, 60, 64], 38],
  ["Gm9", 2, [53, 57, 58, 62], 31],
  ["C13", 2, [52, 58, 62, 69], 36],
];
const B = [
  ["Gm9", 4, [53, 57, 58, 62], 31],
  ["C13sus", 4, [53, 58, 62, 69], 36],
  ["Fmaj9", 4, [52, 55, 57, 64], 41],
  ["Dbmaj7#11", 4, [53, 55, 60, 65], 37],
  ["Gm9", 4, [53, 57, 58, 62], 31],
  ["Am7", 4, [52, 55, 60, 64], 33],
  ["Bbmaj7", 4, [50, 53, 57, 62], 34],
  ["A7#9", 4, [49, 55, 60, 67], 33],
];
const BREAK = [
  ["Dm9", 8, [53, 57, 60, 64], 38],
  ["Bbmaj9", 4, [50, 57, 60, 65], 34],
  ["C13sus", 4, [53, 58, 62, 69], 36],
];
const OUTRO = [
  ["Bbmaj9", 4, [50, 57, 60, 65], 34],
  ["Am11", 4, [55, 60, 62, 64], 33],
  ["Dm9", 8, [53, 57, 60, 64], 38],
];
// Sections in order: name, bars, chords (chord list repeats to fill the bars)
export const SECTIONS = [
  {
    name: "intro",
    bars: 4,
    chords: A,
    mood: "keys only, dusty and sparse, like a sample before the beat drops",
  },
  {
    name: "verseA",
    bars: 8,
    chords: A,
    mood: "full beat drops, the main loop",
  },
  {
    name: "bridgeB",
    bars: 8,
    chords: B,
    mood: "lift, new harmony, more movement and color",
  },
  {
    name: "breakdown",
    bars: 4,
    chords: BREAK,
    mood: "drums mostly out or filtered, space, tension",
  },
  {
    name: "verseA2",
    bars: 8,
    chords: A,
    mood: "main loop returns with extra layers, the peak",
  },
  {
    name: "outro",
    bars: 4,
    chords: OUTRO,
    mood: "thin out and fade, last chord rings",
  },
];
// Timeline helper: each section with absolute start beat and expanded chord list with absolute start beats
export function timeline() {
  let beat = 0;
  return SECTIONS.map((s) => {
    const start = beat,
      len = s.bars * 4,
      chords = [];
    for (let t = 0; t < len;) {
      for (const [name, l, tones, root] of s.chords) {
        if (t >= len) {
          break;
        }
        chords.push({ name, start: start + t, length: l, tones, root });
        t += l;
      }
    }
    beat += len;
    return { ...s, start, end: beat, chords };
  });
}
export const TOTAL_BEATS = SECTIONS.reduce((a, s) => a + s.bars * 4, 0); // 144
