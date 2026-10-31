# Pluck and Bloom

**Demo: [open in Toy MIDI](https://fix-issue-1017-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fpluck-and-bloom%2Fproject.json)**

A quick demo of the amp envelope on Toy MIDI's own synth, made for https://github.com/hi-ogawa/toy-midi/pull/1030, which gives each synth layer an envelope (attack, decay, sustain, release) and a velocity depth. Only that branch has them so far, so the demo link opens its preview. Before it, every synth note had the same 5 ms fade in and out.

An 8-bar synthwave loop in D minor at 84 BPM, one chord per bar, with the loop range set so it repeats. A session composed it from a brief and Toy MIDI's agent docs, without checking it in the browser, and the user then listened to it on the preview.

| Track | Layers and envelopes | Part |
|---|---|---|
| Pluck & Bloom | square pluck (1 ms attack, 0.25 s decay, sustain 0) and sine bloom (1 s attack, 2.5 s release) | chords and a slow melody |
| Bass | sawtooth (0.25 s decay to sustain 0.45) and sine sub | 8th-note pulse with octave jumps |
| Arp | sawtooth (0.14 s decay to sustain 0.15) | 16th-note arpeggio, accented 3+3+2 across each bar |
| Drums | GeneralUser GS TR-808 kit | kick and hats, with the snare from bar 5 |

- `pluck-and-bloom.mjs` writes `project.json`.
- The centerpiece is one track whose two layers have different envelopes, so each note pings and then blooms into a pad, which only per-layer envelopes can do. Listen to the long melody notes, and to the pad tails overlapping across chord changes.
- The arp's short decay makes each note tick, and its 3+3+2 accents come from the notes' velocities.

## Toy MIDI doc gaps

- `public/llms/toy-midi.d.ts` isn't in the repository, so the session read it from the preview's `/llms/toy-midi.d.ts`. It seems to be generated at build time.
- The docs don't say how much headroom a synth track has, or whether anything limits it, when layers and long releases add up. The gains were kept low as a guess.
- The docs don't say whether striking a pitch again during its release cuts the tail or layers a new voice. The pad does this across chord changes.
- The TR-808 kit's note map isn't documented, so the drums assume General MIDI notes: 36 kick, 38 snare, 42 hat.
