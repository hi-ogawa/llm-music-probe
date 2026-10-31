# Drawbars and Drift

**Demo: [open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fdrawbars-and-drift%2Fproject.json)**

A quick demo of octave and detune on Toy MIDI's own synth, made for https://github.com/hi-ogawa/toy-midi/pull/1067, which gives each synth layer's oscillator an octave and a detune in cents. Until that PR is merged, the deployed app plays every layer at the note's pitch, so listen on the [PR's preview](https://fix-issue-1060-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fdrawbars-and-drift%2Fproject.json).

A 12-bar blues shuffle in F at 92 BPM, played twice with the loop range set so it repeats. The first chorus is organ, bass, and drums, and the lead joins in the second.

| Track | Layers | Part |
|---|---|---|
| Organ | sines at octaves -1, 0, and +1, like 16', 8', and 4' drawbars, and a sine at +2 that decays in 0.18 s, like a Hammond's percussion | shuffle comping, with vibrato swelling on CC1 over the held chords in bars 9 and 10 |
| Bass | a square and a sine sub at octave -1 | walking quarter notes |
| Lead | two saws detuned -9 and +9 cents | AAB blues phrases in the second chorus, with CC1 vibrato on the long notes and bends up to the blue notes |
| Drums | GeneralUser GS Standard kit | shuffled hats, with an extra kick in the second chorus |

- `drawbars-and-drift.mjs` writes `project.json`.
- The organ shows octave as building one timbre out of layers, and the bass shows it as the textbook sub oscillator. The lead shows detune: its two saws beat against each other a few times a second.
- The session that implemented toy-midi#1067 composed this, so unlike other pieces here it worked from Toy MIDI's source rather than only its agent docs, and it read Pluck and Bloom's script for the project file's shape.
- Track levels were set from per-track renders of the PR's preview with `toy-midi render-audio`, so the organ, bass, and drums sit near -32.5 dBFS RMS and the lead sits on top of them in the second chorus. Nobody had listened to it at that point.

## Toy MIDI doc gaps

- The Standard kit's note map isn't documented, so the drums assume General MIDI notes: 36 kick, 38 snare, 42 hat.
