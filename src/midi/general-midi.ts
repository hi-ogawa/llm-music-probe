/**
 * How each score instrument sounds in General MIDI.
 * Program numbers are 0-based. Where General MIDI has no match, the nearest
 * sound is used and noted.
 */
export type GeneralMidiSound =
  | { kind: "program"; program: number }
  | { kind: "percussion"; note: number }
  /** A drum lane played as one pitch on a melodic program, held for `length` beats */
  | { kind: "effect"; program: number; pitch: number; length: number };

export const GENERAL_MIDI_SOUNDS: Record<string, GeneralMidiSound> = {
  steeldrum: { kind: "program", program: 114 }, // Steel Drums
  marimba: { kind: "program", program: 12 }, // Marimba
  vibes: { kind: "program", program: 11 }, // Vibraphone
  celesta: { kind: "program", program: 8 }, // Celesta
  glock: { kind: "program", program: 9 }, // Glockenspiel
  xylophone: { kind: "program", program: 13 }, // Xylophone
  musicbox: { kind: "program", program: 10 }, // Music Box
  bell: { kind: "program", program: 14 }, // Tubular Bells
  organ: { kind: "program", program: 16 }, // Drawbar Organ
  pipe: { kind: "program", program: 19 }, // Church Organ
  harpsichord: { kind: "program", program: 6 }, // Harpsichord
  strings: { kind: "program", program: 48 }, // String Ensemble 1
  pizz: { kind: "program", program: 45 }, // Pizzicato Strings
  fiddle: { kind: "program", program: 110 }, // Fiddle
  harp: { kind: "program", program: 46 }, // Orchestral Harp
  guitar: { kind: "program", program: 24 }, // Acoustic Guitar (nylon)
  banjo: { kind: "program", program: 105 }, // Banjo
  upright: { kind: "program", program: 32 }, // Acoustic Bass
  flute: { kind: "program", program: 73 }, // Flute
  clarinet: { kind: "program", program: 71 }, // Clarinet
  oboe: { kind: "program", program: 68 }, // Oboe
  bassoon: { kind: "program", program: 70 }, // Bassoon
  accordion: { kind: "program", program: 21 }, // Accordion
  trumpet: { kind: "program", program: 56 }, // Trumpet
  brass: { kind: "program", program: 61 }, // Brass Section
  horn: { kind: "program", program: 60 }, // French Horn
  tuba: { kind: "program", program: 58 }, // Tuba
  choir: { kind: "program", program: 52 }, // Choir Aahs
  voices: { kind: "program", program: 53 }, // Voice Oohs
  pad: { kind: "program", program: 89 }, // Pad 2 (warm)
  fretless: { kind: "program", program: 35 }, // Fretless Bass
  synbass: { kind: "program", program: 38 }, // Synth Bass 1
  timpani: { kind: "program", program: 47 }, // Timpani
  chip: { kind: "program", program: 80 }, // Lead 1 (square)
  sine: { kind: "program", program: 79 }, // Ocarina, nearest to a sine
  square: { kind: "program", program: 80 }, // Lead 1 (square)
  saw: { kind: "program", program: 81 }, // Lead 2 (sawtooth)
  triangle: { kind: "program", program: 74 }, // Recorder, nearest to a triangle
  kick: { kind: "percussion", note: 36 }, // Bass Drum 1
  snare: { kind: "percussion", note: 38 }, // Acoustic Snare
  rim: { kind: "percussion", note: 37 }, // Side Stick
  hat: { kind: "percussion", note: 42 }, // Closed Hi-Hat
  ohat: { kind: "percussion", note: 46 }, // Open Hi-Hat
  ride: { kind: "percussion", note: 51 }, // Ride Cymbal 1
  crash: { kind: "percussion", note: 49 }, // Crash Cymbal 1
  clap: { kind: "percussion", note: 39 }, // Hand Clap
  conga: { kind: "percussion", note: 63 }, // Open Hi Conga
  tumba: { kind: "percussion", note: 64 }, // Low Conga
  bongo: { kind: "percussion", note: 60 }, // Hi Bongo
  bongolo: { kind: "percussion", note: 61 }, // Low Bongo
  timbale: { kind: "percussion", note: 65 }, // High Timbale
  bodhran: { kind: "percussion", note: 41 }, // Low Floor Tom, nearest to a frame drum
  shaker: { kind: "percussion", note: 70 }, // Maracas
  tamb: { kind: "percussion", note: 54 }, // Tambourine
  clave: { kind: "percussion", note: 75 }, // Claves
  block: { kind: "percussion", note: 76 }, // Hi Wood Block
  cowbell: { kind: "percussion", note: 56 }, // Cowbell
  guiro: { kind: "percussion", note: 73 }, // Short Guiro
  tri: { kind: "percussion", note: 81 }, // Open Triangle
  tomlo: { kind: "percussion", note: 45 }, // Low Tom
  tommid: { kind: "percussion", note: 47 }, // Low-Mid Tom
  tomhi: { kind: "percussion", note: 50 }, // High Tom
  gong: { kind: "percussion", note: 52 }, // Chinese Cymbal, nearest to a gong
  thunder: { kind: "effect", program: 122, pitch: 36, length: 8 }, // Seashore played low, nearest to thunder
  surf: { kind: "effect", program: 122, pitch: 60, length: 8 }, // Seashore
};
