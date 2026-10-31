# Crosswind

[Demo](https://fix-issue-1058-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Flayer-pan-demo%2Fcompositions%2Fpieces%2Fcrosswind%2Fproject.json)

A demo of per-layer synth pan for [toy-midi#1062](https://github.com/hi-ogawa/toy-midi/pull/1062). It's a slow ambient-minimalist piece in D Dorian, 72 BPM, 32 bars of 4/4, where the stereo picture is what develops. Layer pan is fixed per patch, so the movement comes from layers with different envelopes panned apart, and the width from detuned layers panned apart.

[`crosswind.mjs`](crosswind.mjs) writes [`project.json`](project.json).

## Tracks

| Track            | Layers                                                                                                                                                         | Part                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Travelling pluck | sawtooth, octave 0, detune 0, pan −0.65, gain 0.36, A 0.005 D 0.2 S 0 R 0.15 s<br>triangle, octave 0, detune 0, pan +0.65, gain 0.8, A 0.4 D 0.6 S 0.85 R 2.0 s | Five-note motif and its variations, bars 1–24; track gain 2                                             |
| Pad              | sawtooth, octave 0, detune −8, pan −0.7, gain 0.5<br>sawtooth, octave 0, detune +8, pan +0.7, gain 0.5<br>both A 1.6 D 1.2 S 0.8 R 3.0 s                     | Chords every 2 bars from bar 9; CC 11 fades from 100 to 0 over the coda; track gain 1.9   |
| Bass             | sine, octave −1, pan 0, gain 0.9, A 0.06 D 0.4 S 0.9 R 0.8 s<br>triangle, octave 0, pan 0, gain 0.2, A 0.08 D 0.6 S 0.5 R 0.6 s                               | Whole notes on chord roots, bars 1–24; track gain 1.8                                      |

## Form

| Bars  | Section | What happens                                                                                     |
| ----- | ------- | ------------------------------------------------------------------------------------------------ |
| 1–8   | A       | Pluck and bass only. The call over Dm9, then a settled variant over Fmaj7, with rests between     |
| 9–16  | B       | The pad enters and the field opens. The call in a tighter rhythm, so blooms overlap and smear, then a variant leaping to A5 |
| 17–24 | A′      | The call, a two-note echo over B♭maj7, the call's inversion over Fmaj7, and its opening left hanging on E |
| 25–32 | Coda    | Pad alone, Dm9 → B♭maj7 → Fmaj7 → Dm9, fading out with CC 11                                     |

The loop range covers the whole piece, and locators mark the sections.

## Notes

- **Motif.** The call is A4 D5 E5 B4 C5: up a fourth, up a step, down to the Dorian B, then leaning up to C, so it stays open. The settled variant ends C5 A4 instead. The A′ answer inverts it from G5 (G5 D5 C5 F5 E5) and lands on the major seventh of Fmaj7. Each note sits about 1.5 beats from the next, so a strike on the left has time to bloom on the right before the next one.
- **Pluck.** The sawtooth carries the attack and dies in about 0.2 s; the triangle swells over 0.4 s and releases over 2 s, so tails drift right and overlap. The triangle gets the higher gain because it's quieter than a sawtooth at the same gain.
- **Pad.** Every pair panned apart differs, here by ±8 cents, so the pair doesn't sum back to center. Pans stay at ±0.7 to avoid the side boost near ±1. Voicings keep the lowest pad note at E3 or F3, above the bass, and move by step where they can: Dm9 F A C E, B♭maj7 F B♭ D A, Fmaj7 E A C F, C/E E G C E.
- **Bass.** Both layers sit at pan 0 to anchor the center. Written at D3, B♭2, F3, E3, so the sine sounds an octave lower.
- **Levels.** The first version set levels by role without a listen, and a render showed the pad buried (alone in the coda, about 25 dB under the other sections, so the width barely opened at bar 9) and the mix peaking at −19.8 dBFS. The pad is now about 14 dB louder relative to the rest, and everything is about 12 dB louder. A render of this version peaks at −6.9 dBFS. The side-to-mid ratio, a rough measure of width, rises from 0.25 in A to 0.36 in B, and the pad alone opens the coda about 7 dB under the A sections before fading. The right side stays about 2 dB louder than the left wherever the pluck plays. No drums.

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
- Whether playback continues past the loop's end so the last pad release can ring, or the loop cuts it off.
