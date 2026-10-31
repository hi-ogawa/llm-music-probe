# Lowrider Whistle

**Demo: [open in Toy MIDI](https://fix-issue-1036-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Flowrider-whistle%2Fproject.json)**

A quick demo of pitch bend on Toy MIDI's own synth, made for https://github.com/hi-ogawa/toy-midi/pull/1039, which makes the synth honor pitch bend. Only that branch has it so far, so the demo link opens its preview. On a build without it, the synth tracks play unbent.

An 8-bar G-funk loop in C minor at 92 BPM, on Cm9, F9, Abmaj7 to G7, and Cm9 to G7b9, with the loop range set so it repeats. A session composed it from a brief and Toy MIDI's agent docs, without checking it in the browser, and the user then listened to it on the preview.

| Track | Sound | Part |
|---|---|---|
| Whistle Lead | own synth, sine, easing in over 40 ms | a sliding "whistle" lead that scoops up into its long notes, slides down at phrase ends, and dives a full octave as the fill in bar 7 |
| Tape Pad | own synth, triangle with a little sawtooth, swelling in over 0.4 s and fading over 0.9 s | held chords that sag a semitone and recover over the F9 in bar 4, like a warped tape |
| Synth Bass | own synth, sine with a little sawtooth, plucked down to a held body | syncopated roots and octaves with chromatic approaches |
| Drums | GeneralUser GS TR-808 kit | kick and snare-clap backbeat with eighth-note hats |

- `lowrider-whistle.mjs` writes `project.json`.
- A bend point takes effect at once, with no glide to the next, so every slide is written as a point every 64th note.
- Bend belongs to the whole track, so it also moves notes that start while it's held, and notes still fading out after their note-off. The lead returns its bend to zero a quarter beat after each slide's note-off, once its 0.12 s release has faded, and before the next note. That's why it has a track to itself. The pad uses the same behavior on purpose: one bend moves every note of the held chord, and the lead rests in bar 4 so the sag stands out.

## Toy MIDI doc gaps

- `public/llms/toy-midi.d.ts` isn't in the repository, so the session read it from the preview's `/llms/toy-midi.d.ts`. It seems to be generated at build time.
- The docs don't say whether a note starting on the same beat as a bend point uses the new value. Where a scoop follows a gap, its starting bend is set a 32nd of a beat early.
- The docs don't say whether a note's release tail keeps following the bend after note-off. It does, so the lead's resets wait out its release.
- The docs say nothing about how loud the own synth is next to SoundFont presets, so the track gains started as guesses. The synth bass was then rendered against the GM Synth Bass 1 it replaced, and its gain raised to match.
