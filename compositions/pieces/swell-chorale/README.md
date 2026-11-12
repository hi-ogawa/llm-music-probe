# Swell Chorale

**Demo: [open in Toy MIDI](https://fix-issue-1035-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fswell-chorale%2Fproject.json)**

A quick demo of CC11 expression and layers on Toy MIDI's own synth, made for https://github.com/hi-ogawa/toy-midi/pull/1037, which makes the synth honor CC7 volume and CC11 expression. Only that branch has it so far, so the demo link opens its preview. On a build without it, the Swell track plays at a steady level.

An 8-bar organ chorale loop in D major at 66 BPM, one chord per half note, with the loop range set so it repeats. Two 4-bar phrases: the first ends on A, the second on A7, which resolves into the opening D as the loop wraps.

Like an organ's divisions, each part has its own stop and place:

| Track | Layers | Low-pass | Part | Pan | Gain |
|---|---|---|---|---|---|
| Solo | sine at 1, triangle at 0.5 | 2.5 kHz | soprano melody | 0.3 right | +2 dB |
| Swell | sine at 1, square at 0.3 | 2 kHz | two inner voices | 0.3 left | −4.5 dB |
| Pedal | sine at 1, triangle at 0.5 | none | bass line | center | −2 dB |

- `swell-chorale.mjs` writes `project.json`.
- CC11 on the Swell track works like an organ's swell pedal, rising into each cadence and easing back to its opening value of 60 by the loop point, so the wrap has no jump. Automation holds each point's value until the next, so the curves have a point every 16th to keep the swells from sounding stepped.
- The Solo track has its own CC11 curve, between 102 and 127, which phrases the melody: it dips with the line's low A, leans into the high notes, holds full through each swell peak so the melody stays on top, and breathes out on the held C# at the half cadence. It ends on its opening value, like the Swell curve.
- The soprano moves in quarters and eighths with passing and neighbor tones. The inner voices hold common tones across chords instead of restriking them, as an organist ties them, and resolve a 4-3 suspension, D to C#, into each A chord.
- The gains were set from per-track loudness in a render, then by ear. The melody stays at least 3 dB over the Swell track at every beat, closest at the swell peaks, and the master is at −2 dB.
- The pans are small, because sustained tones panned hard sound disconnected. Copies of a part panned apart wouldn't add width, because every voice starts at the same phase and the synth has no detune.
- The Pedal has no automation. Like a real organ's pedal division, it sits outside the swell box, so it keeps a steady level under the swells.
- The low-passes in the track EQs soften each stop: 2 kHz on the Swell track takes the edge off the square's upper harmonics, and 2.5 kHz on the Solo track rounds off the triangle's, which sit where the ear is most sensitive.
- All three tracks keep General MIDI program 19, Church Organ, for `.mid` export.
