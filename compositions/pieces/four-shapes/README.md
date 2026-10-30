# Four Shapes

**Demo: [open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Ffour-shapes%2Fproject.json)**

A quick demo of the oscillator waveforms in Toy MIDI's own synth, made for https://github.com/hi-ogawa/toy-midi/pull/1014, which adds the waveform and a Synth panel to set it, and updated for https://github.com/hi-ogawa/toy-midi/pull/1023, which stores the waveform in a list of layers.

A 4-bar loop in A minor at 110 BPM, Am, F, C, and G one bar each, with the loop range set so it repeats. Every track plays on the synth, each with a different waveform:

| Track | Waveform | Part |
|---|---|---|
| Lead (saw) | sawtooth | quarter-note melody |
| Arp (sine) | sine | 16th-note arpeggio on the chord tones |
| Pad (triangle) | triangle | whole-note triads |
| Bass (square) | square | 8th-note roots |

To compare waveforms on one part, open a track's Synth panel from its actions menu and switch the waveform while the loop plays.

- `four-shapes.mjs` writes `project.json`.
- Each edged waveform goes through a low-pass in its track EQ, because its upper harmonics sound harsh unfiltered. The square bass is cut at 600 Hz with two bands that make a 24 dB/octave slope. The saw lead has the same two bands spread to 1.9 and 2.3 kHz, the triangle pad a gentler single band at 4 kHz, and the sine arp none. Open a track's EQ and bypass it to hear the raw waveform.
- The track gains were set by ear, between −4.9 and −6 dB, with the arp highest and the bass lowest.
- Each track keeps a General MIDI program for `.mid` export: 81 Lead 2 (sawtooth), 80 Lead 1 (square), 89 Pad 2 (warm), and 38 Synth Bass 1.
