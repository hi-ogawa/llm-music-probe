# Crosswind

[Demo](https://fix-issue-1058-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Flayer-pan-demo%2Fcompositions%2Fpieces%2Fcrosswind%2Fproject.json)

A demo of per-layer synth pan for [toy-midi#1062](https://github.com/hi-ogawa/toy-midi/pull/1062). It's a slow downtempo piece in D Dorian, 72 BPM, 32 bars of 4/4, where the stereo picture is what develops. Layer pan is fixed per patch, so the movement comes from layers with different envelopes panned apart, and the width from detuned layers panned apart.

[`crosswind.mjs`](crosswind.mjs) writes [`project.json`](project.json).

## Tracks

| Track            | Layers                                                                                                                                                         | Part                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Travelling pluck | sawtooth, octave 0, detune 0, pan −0.65, gain 0.36, A 0.005 D 0.2 S 0 R 0.15 s<br>triangle, octave 0, detune 0, pan +0.65, gain 0.8, A 0.4 D 0.6 S 0.85 R 2.0 s | Five-note motif and its variations, bars 1–24; track gain 2                                             |
| Pad              | sawtooth, octave 0, detune −8, pan −0.7, gain 0.5<br>sawtooth, octave 0, detune +8, pan +0.7, gain 0.5<br>both A 1.6 D 1.2 S 0.8 R 3.0 s                     | Chords every 2 bars from bar 9; CC 11 fades from 100 to 0 over the coda; track gain 1.9   |
| Keys             | sine, octave 0, pan 0, gain 0.7, A 0.004 D 1.2 S 0.35 R 0.4 s<br>triangle, octave +1, pan 0, gain 0.15, A 0.002 D 0.35 S 0.05 R 0.3 s | Comps the chords from bar 1 in the pad's voicings: hits on 1, the "and" of 2, and a short stab on 4, then off-beat hits in each chord's second bar, through bar 24; track gain 1.5 |
| Answer           | sine, octave 0, pan −0.45, gain 0.8, A 0.02 D 0.5 S 0.55 R 0.9 s<br>triangle, octave +1, pan −0.2, gain 0.12, A 0.01 D 0.3 S 0.2 R 0.6 s | Replies in the motif's empty bars, then harmonizes it in A′; track gain 2 |
| Bass             | sine, octave −1, pan 0, gain 0.9, A 0.06 D 0.4 S 0.9 R 0.8 s<br>triangle, octave 0, pan 0, gain 0.2, A 0.08 D 0.6 S 0.5 R 0.6 s | Half notes on roots in bars 1–4, then root, a push on the "and" of 2, the fifth, and a step into the next chord, bars 5–24; track gain 1.1 |
| Drums            | GeneralUser GS TR-808 kit, bank 128, program 25 | Maracas in 16ths from bar 1, kick and rim on 2 and 4 from bar 5, hats and a soft clap on 4 from bar 9, out for the coda; track gain 1.4 |

## Form

| Bars  | Section | What happens                                                                                     |
| ----- | ------- | ------------------------------------------------------------------------------------------------ |
| 1–8   | A       | The keys comp the chords. The call over Dm9, answered over B♭maj7, then a settled variant over Fmaj7, answered over C/E. The drums build from a lone shaker, and the bass starts moving at bar 5 |
| 9–16  | B       | The pad enters and the field opens, with the full groove. The call in a tighter rhythm, so blooms overlap and smear, a busier answer, then a variant leaping to A5 and a descending answer into A′ |
| 17–24 | A′      | The call harmonized a third below, a two-note echo over B♭maj7, the call's inversion over Fmaj7 harmonized a sixth below, and its opening left hanging on E |
| 25–32 | Coda    | Pad alone with the drums gone, Dm9 → B♭maj7 → Fmaj7 → Dm9, fading out with CC 11                  |

The loop range covers the whole piece, and locators mark the sections.

## Notes

- **Motif.** The call is A4 D5 E5 B4 C5: up a fourth, up a step, down to the Dorian B, then leaning up to C, so it stays open. The settled variant ends C5 A4 instead. The A′ answer inverts it from G5 (G5 D5 C5 F5 E5) and lands on the major seventh of Fmaj7. Each note sits about 1.5 beats from the next, so a strike on the left has time to bloom on the right before the next one.
- **Pluck.** The sawtooth carries the attack and dies in about 0.2 s; the triangle swells over 0.4 s and releases over 2 s, so tails drift right and overlap. The triangle gets the higher gain because it's quieter than a sawtooth at the same gain.
- **Pad.** Every pair panned apart differs, here by ±8 cents, so the pair doesn't sum back to center. Pans stay at ±0.7 to avoid the side boost near ±1. Voicings keep the lowest pad note at E3 or F3, above the bass, and move by step where they can: Dm9 F A C E, B♭maj7 F B♭ D A, Fmaj7 E A C F, C/E E G C E.
- **Keys.** A single-note melody over a bass couldn't hold A by itself, with nothing playing the harmony until the pad, so the keys comp the chords from bar 1. The patch is an electric piano sketched on the own synth: a struck sine body that decays to a low sustain, plus a short triangle an octave up for the tine. It sits at the center, below the melody, so A stays narrow and the pad still opens the field at bar 9.
- **Answer.** It fills the bars the motif leaves empty, so the two trade phrases, and joins it in A′ as a harmony line. It leans left because the pluck leans right overall: its sustained bloom is about 11 dB louder than its short strike, so the answer, replying from where the strike was, balances the mix.
- **Bass.** Both layers sit at pan 0 to anchor the center. Written at D3, B♭2, F3, E3, so the sine sounds an octave lower. The approach notes step into the next root: C into B♭, E into F, D into E, and C♯ into D.
- **Drums.** A downtempo groove on the TR-808 kit, kept centered and sparse, so the synth layers carry all the width. A listen found the Standard kit's acoustic tone off for the piece. The kick lands on 1 and the "and" of 3, with a ghost before 2 from bar 9, and a rim rather than a snare keeps the backbeat soft.
- **Levels.** Set from renders with Toy MIDI's `render-audio`, each track also rendered alone. The first version, with no answer or drums, had the pad buried about 25 dB under the rest and the mix peaking at −19.8 dBFS. In this version, B's RMS by track is about −28 dB for the pluck, pad and bass, about −30 dB for the keys, about −31 dB for the answer, and about −32 dB for the drums. The mix peaks at −5.0 dBFS and leans about 1.5 dB right. The side-to-mid ratio, a rough measure of width, rises from 0.31 in A to 0.41 in B.

## Toy MIDI doc gaps

- How loud a layer is at a given `gain`, by waveform, and how layers sum, so there's no reference for safe gains when several layers and long releases overlap.
- Whether note velocity scales the synth's output, and by what curve.
- Whether CC 11 (expression) and CC 7 (volume) act on the own synth. The piece's coda fade relies on CC 11.
- The pan law: the docs give the range of `pan` but not that a hard-panned layer gets louder on its side, nor how layer pan combines with track pan.
- Defaults when `gain`, `pan`, `octave`, `detune`, or `amp` are left out of a serialized layer.
- Whether `program` means anything when `synth` is set, since `SharedMidiTrack` still requires it.
- Whether the own synth has a voice limit, which matters with 3 s pad releases.
- How to spell a modal key: `keySignature.mode` is only `"major"` or `"minor"`, so D Dorian is set as `{ fifths: 0, mode: "minor" }`, which reads as A minor.
- What range layer `gain` is meant to take, and whether it can go above 1. This piece keeps layers at or below 1 and uses track gains up to 2 (+6 dB, the mixer's top) to reach a usable level.
- The TR-808 kit's note map, so the drums assume General MIDI: 36 kick, 37 rim, 39 clap, 42 closed hat, 70 maracas.
- Whether playback continues past the loop's end so the last pad release can ring, or the loop cuts it off.
