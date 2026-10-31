# Aftertouch

A slow cinematic synth loop in the spirit of Vangelis, composed as the demo for [toy-midi#1052](https://github.com/hi-ogawa/toy-midi/issues/1052), which makes Toy MIDI's own synth honor CC1 as vibrato depth. It was implemented in [toy-midi#1055](https://github.com/hi-ogawa/toy-midi/pull/1055), so until that merges, open the piece on the PR's preview:

https://fix-issue-1052-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fcc1-vibrato-demo%2Fcompositions%2Fpieces%2Faftertouch%2Fproject.json

The title comes from the CS-80, whose players brought vibrato in by pressing into held keys.

## Brief

> Compose a demo for toy-midi#1052, which makes Toy MIDI's own synth honor CC1 as vibrato depth. Every pitched part uses the own synth.
>
> Write a slow cinematic synth piece in the spirit of Vangelis, a loop of about 16 bars with an A and a B phrase. A is spacious: a lead over sustained chords. B rises in register and density toward one climax note, then settles so the loop wraps back into A.
>
> The lead plays the vibrato the way a CS-80 player does with their hand:
> - Short notes stay straight. Long notes start straight, and CC1 brings the vibrato in partway through.
> - The depth follows the phrase. It's light in A, deepest on the climax note in B, and back at 0 between phrases.
> - Pair CC1 with CC11, so a held note swells as its vibrato blooms.
>
> A GM-style render sounds thin, so write the accompaniment dense for the genre, such as a second chordal layer under the pad and layered slow-attack voices, and use envelopes and layers to give each part its own character.

Hiroshi also asked for the full mix toolset: per-layer waveform and gain, track pan for a wide stereo image, and track EQ.

## The piece

C minor, 62 bpm, 16 bars, all seven tracks on the own synth. [`generate.mjs`](generate.mjs) writes [`project.json`](project.json).

- **A (bars 1-8):** Cm9, Abmaj7#11, Eb/Bb, Bbsus4-Bb, Cm9, Abmaj7#11, Fm9, Gsus4-G. The lead sits around G4-Eb5 over the pads, with sparse bells.
- **B (bars 9-16):** Abmaj9, Bb(add9), Cm7, Bbsus4-Bb7 climb to the climax Bb5 over Eb at bar 13, held 6 beats into Dbmaj7. Fm9/Ab and G7 settle back into A. Density rises with the register: the bells run in eighths, the strings enter at bar 10, the bass doubles at the octave, and the pads swell with CC11.

### Lead vibrato

Notes of a beat or less stay straight. A longer note starts straight, and after a beat (halfway for a 2-beat note), CC1 and CC11 rise together on a smoothstep over 70% of the rest of the note, then both reset at the note-off. CC1 peaks by phrase: 40-55 in A, 60-85 rising through B, 127 on the climax, then 70, 45, and 35 as it settles. It's 0 at every rest and at the loop point.

### Sound and mix

| Track | Layers | Pan | EQ |
| --- | --- | --- | --- |
| Lead (CS-80 brass) | sawtooth + square + sine body, quick attack | center | HP 140, LP 4 kHz, +3 dB at 1.4 kHz |
| Close pad | sawtooth (1.6 s attack) + triangle (0.9 s) | -0.45 | HP 220, LP 1.6 kHz to darken it |
| Open low pad | triangle + slow square | +0.3 | HP 90 to clear the bass, LP 1 kHz, dip at 300 Hz |
| Strings (B) | sawtooth (2.6 s attack) + triangle, an octave over the close pad | +0.65 | HP 350, LP 3.2 kHz |
| Bass | sine + triangle, 0.25 s swell, sub octave under the climax | center | HP 28, LP 380 |
| Bells | sine + triangle plucks, no sustain | +0.5 | HP 500 |
| Bells echo | the bells a dotted eighth later | -0.55 | HP 500, LP 2.4 kHz, darker like a delay return |

## Checks

I rendered the project on the preview with `runtime.renderMix()` in headless Chromium, using the two scripts here.

[`vibrato.mjs`](vibrato.mjs) tracks the lone lead's pitch by autocorrelation in 30 ms windows:

| Where | CC1 | Measured |
| --- | --- | --- |
| A, C5 before the bloom (beat 2.2-3) | 0 | ±1 cent |
| A, C5 bloomed (beat 4.8-6) | 40 | -16 to +15 cents |
| Climax Bb5 before the bloom (beat 48.2-49) | 0 | 0 cents |
| Climax Bb5 bloomed (beat 52.5-54) | 127 | -47 to +46 cents |
| Short D5 (beat 36) | 0 | -1 to +5 cents |

That matches #1052's mapping of 0 to 50 cents across CC1. The climax note's RMS also rises 2.8 dB through its swell, so the own synth honors CC11 too.

[`levels.mjs`](levels.mjs) measures each track alone, as in experiment 13's level check. The first balance had the bass 11 dB over the lead in RMS and the strings and bells nearly silent, so I lowered the bass, raised the strings and bells, and boosted every layer by 3 for headroom. The mix now peaks at 0.38, and the lead sits at least 4 dB over each pad and the strings in every section.

## Toy MIDI doc gaps

- **CC1 on the own synth.** Neither `/llms.txt` nor the type declarations say that the own synth reads CC1, or what it does: the 0-50 cent depth, the LFO rate, or that each voice's LFO starts at its note-on. I took the mapping from #1052 and the 5.5 Hz rate from the description of #1055.
- **CC11 and velocity on the own synth.** The docs don't say whether either changes the synth's level. CC11 measurably does, and I didn't test velocity.
- **Own synth level.** A layer's `gain` is documented as a linear multiplier with no range or level reference. At gain 1, a seven-track mix peaked at 0.16, so I scaled every layer by 3 without knowing the intended range.
- **Pitch bend on the own synth.** The docs don't say whether the own synth honors pitch bend. A small fixed bend on a doubled pad would have given a detuned chorus, so I left it out rather than guess.
