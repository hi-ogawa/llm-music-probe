# Four Shapes

**Demo: [open in Toy MIDI's toy-midi#1023 preview](https://synth-layers-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Ffour-shapes-layers%2Fcompositions%2Fpieces%2Ffour-shapes%2Fproject.json)**

A quick demo of the oscillator waveforms in Toy MIDI's own synth, for https://github.com/hi-ogawa/toy-midi/pull/1023, which stores the synth patch's waveform in a list of layers, on top of https://github.com/hi-ogawa/toy-midi/pull/1014, which adds the waveform and a Synth panel to set it. The layers are only on that PR's branch, so the link opens the branch preview.

A 4-bar loop in A minor at 110 BPM, Am, F, C, and G one bar each, with the loop range set so it repeats. Every track plays on the synth, each with a different waveform:

| Track | Waveform | Part |
|---|---|---|
| Lead (saw) | sawtooth | quarter-note melody |
| Arp (sine) | sine | 16th-note arpeggio on the chord tones |
| Pad (triangle) | triangle | whole-note triads |
| Bass (square) | square | 8th-note roots |

To compare waveforms on one part, open a track's Synth panel from its actions menu and switch the waveform while the loop plays.

- `four-shapes.mjs` writes `project.json`.
- Each edged waveform goes through a low-pass in its track EQ, because its upper harmonics sound harsh unfiltered. The saw lead is cut at 2 kHz and the square bass at 600 Hz, each with two bands that make a 24 dB/octave slope. The triangle pad has a gentler single band at 2.5 kHz, and the sine arp has none. Open a track's EQ and bypass it to hear the raw waveform.
- The track gains come from an estimate, not a listen. The script sums each note's harmonics for its waveform, passes them through the track's low-pass, weights them by the A-weighting curve, and scales by the synth's level, which is a 0.2 peak, linear in velocity. It then sets gains so the lead sits on top, the bass 1 dB under it, the pad 4 dB under, and the arp 5 dB under, cutting rather than boosting. A-weighting cuts low frequencies harder than the ear does at normal listening levels, so if the bass sounds thin, raise it first.
- Each track keeps a General MIDI program for `.mid` export: 81 Lead 2 (sawtooth), 80 Lead 1 (square), 89 Pad 2 (warm), and 38 Synth Bass 1.
