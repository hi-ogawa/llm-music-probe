# Swell Chorale

**Demo: [open in Toy MIDI](https://fix-issue-1035-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fswell-chorale%2Fproject.json)**

A quick demo of CC11 expression and layers on Toy MIDI's own synth, made for https://github.com/hi-ogawa/toy-midi/pull/1037, which makes the synth honor CC7 volume and CC11 expression. Only that branch has it so far, so the demo link opens its preview. On a build without it, the Swell track plays at a steady level.

An 8-bar organ chorale loop in D major at 66 BPM, one chord per half note, with the loop range set so it repeats. Two 4-bar phrases: the first ends on A, the second on A7, which resolves into the opening D as the loop wraps.

Like an organ's divisions, each part has its own stop and place:

| Track | Layers | Part | Pan |
|---|---|---|---|
| Solo | sine at 1, triangle at 0.5 | soprano melody | 0.3 right |
| Swell | sine at 1, square at 0.3 | two inner voices | 0.3 left |
| Pedal | sine at 1, triangle at 0.5 | bass line | center |

- `swell-chorale.mjs` writes `project.json`.
- CC11 on the Swell track works like an organ's swell pedal, rising into each cadence and easing back to its opening value of 60 by the loop point, so the wrap has no jump. Automation holds each point's value until the next, so the curves have a point every 16th to keep the swells from sounding stepped.
- The soprano moves in quarters and eighths with passing and neighbor tones, at a steady level over the swells. The inner voices hold common tones across chords instead of restriking them, as an organist ties them, and resolve a 4-3 suspension, D to C#, into each A chord.
- The track gains come from per-track loudness in a render. The Swell track is at −4 dB, so its swells peak just under the melody, and the Pedal at −2 dB sits under both.
- The pans are small, because sustained tones panned hard sound disconnected. Copies of a part panned apart wouldn't add width, because every voice starts at the same phase and the synth has no detune.
- The Pedal has no automation. Like a real organ's pedal division, it sits outside the swell box, so it keeps a steady level under the swells.
- The Swell track's square layer goes through a gentle low-pass at 2.6 kHz in the track EQ, which takes the edge off its upper harmonics.
- All three tracks keep General MIDI program 19, Church Organ, for `.mid` export.
