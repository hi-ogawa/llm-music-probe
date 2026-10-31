# Pluck and Bloom

**Demo: [open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fpluck-and-bloom%2Fproject.json)**

A quick demo of the amp envelope on Toy MIDI's own synth, made for https://github.com/hi-ogawa/toy-midi/pull/1030, which gives each synth layer an envelope (attack, decay, sustain, release). Before it, every synth note had the same 5 ms fade in and out.

An 8-bar synthwave loop in D minor at 84 BPM, one chord per bar, with the loop range set so it repeats. A session composed it from a brief and Toy MIDI's agent docs, without checking it in the browser. The user then rearranged it by ear on the preview of [toy-midi#1048](https://github.com/hi-ogawa/toy-midi/pull/1048), which edits the envelopes on a graph.

| Track | Layers and envelopes | Part |
|---|---|---|
| Lead | square pluck (4 ms attack, 0.63 s decay, sustain 0) over a sine at sustain 0.68 with a 2.5 s release | slow melody |
| Pad | sine (1 s attack, sustain 0.7, 2.5 s release) | chords |
| Bass | sine sub (3 ms attack) and sawtooth (95 ms attack), low-passed at 7.75 kHz | 8th-note pulse with octave jumps |
| Arp | sine (5 ms attack, full sustain) and sawtooth (100 ms attack, sustain 0.59) | 16th-note arpeggio, accented 3+3+2 across each bar |
| Drums | GeneralUser GS TR-808 kit | kick and hats, with the snare from bar 5 |

- `pluck-and-bloom.mjs` writes `project.json`.
- The first version played the chords and the melody on one track, where every note plucked and then bloomed. On the four-note chords, the pluck made the close inner voicing sound crowded, so the chords moved to their own Pad track without the pluck, and the pluck stays on the melody.
- The slower attacks on the bass and arp saws came from the same listen. The sub and the arp's sine now carry each note's start, and the saws fill in behind them.
- The arp's 3+3+2 accents come from the notes' velocities.

## Toy MIDI doc gaps

- `public/llms/toy-midi.d.ts` isn't in the repository, so the session read it from the preview's `/llms/toy-midi.d.ts`. It seems to be generated at build time.
- The docs don't say how much headroom a synth track has, or whether anything limits it, when layers and long releases add up. The gains were kept low as a guess.
- The docs don't say whether striking a pitch again during its release cuts the tail or layers a new voice. The pad does this across chord changes.
- The TR-808 kit's note map isn't documented, so the drums assume General MIDI notes: 36 kick, 38 snare, 42 hat.
