# Crosswind

[Demo](https://fix-issue-1058-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Flayer-pan-demo%2Fcompositions%2Fpieces%2Fcrosswind%2Fproject.json)

A demo of per-layer synth pan for [toy-midi#1062](https://github.com/hi-ogawa/toy-midi/pull/1062). It's a synthwave ballad in D minor, 86 BPM, 36 bars of 4/4. Every synth part is built on Toy MIDI's own synth, and each one uses layer pan differently: the lead keeps two detuned saws close to the center, the arp strikes on one side and blooms on the other, and the pad spreads two detuned saws wide.

[`crosswind.mjs`](crosswind.mjs) writes [`project.json`](project.json).

## Tracks

| Track | Layers | Part |
| ----- | ------ | ---- |
| Lead  | sawtooth, detune −6, pan −0.2, gain 0.6<br>sawtooth, detune +6, pan +0.2, gain 0.6<br>both A 0.03 D 0.5 S 0.75 R 0.35 s | The melody from bar 5. Doubled an octave below in the choruses, with a third below added in the final chorus; track gain 1.5 |
| Arp   | sawtooth, pan −0.6, gain 2, A 0.003 D 0.15 S 0 R 0.1 s<br>triangle, pan +0.4, gain 1.1, A 0.06 D 0.3 S 0.4 R 0.25 s | Straight 8ths up and down the chord tones, everywhere but the break; CC 11 fades it over the outro; track gain 2 |
| Pad   | sawtooth, detune −8, pan −0.7, gain 0.5<br>sawtooth, detune +8, pan +0.7, gain 0.5<br>both A 0.8 D 1 S 0.8 R 1.5 s | A held chord every bar, softer before the chorus; CC 11 fades it over the outro; track gain 1.3 |
| Bass  | sine, octave −1, pan 0, gain 0.9, A 0.005 D 0.3 S 0.7 R 0.1 s<br>sawtooth, pan 0, gain 0.12, A 0.005 D 0.2 S 0.3 R 0.08 s | Driving 8ths on the root from bar 5, with an octave jump closing each chorus bar; held roots in the outro; track gain 1.1 |
| Drums | GeneralUser GS Electronic kit, bank 128, program 24 | Hats from bar 3, a half-time beat in the verse, the full beat with a crash and a snare fill into each chorus, out for the break; track gain 1.6 |

## Form

| Bars  | Section      | Chords               | What happens |
| ----- | ------------ | -------------------- | ------------ |
| 1–4   | Intro        | Dm B♭ F C            | Arp and pad alone, hats from bar 3 |
| 5–12  | Verse        | Dm B♭ F C, twice     | The lead enters low and stepwise, over the bass and a half-time beat |
| 13–20 | Chorus       | B♭ C F Dm B♭ C Dm Dm | The lead jumps an octave and climbs to A5, then to C6, doubled an octave below, over the full beat |
| 21–24 | Break        | B♭ C Dm Dm           | The pad alone, at its widest |
| 25–32 | Final chorus | as the chorus        | The chorus again, with a harmony a third below |
| 33–36 | Outro        | Dm B♭ F Dm           | Held bass roots under the arp and pad, both fading out with CC 11 |

The loop range covers the whole piece, and locators mark the sections.

## Notes

- **Direction.** Earlier takes were ambient and downtempo, built on a single-note melody traded between two voices over a bass. Listens found that a single line over a bass couldn't hold the piece, that the call and response didn't work, and that the vibe was too contemporary and abstract. A synthwave ballad gives the synth patches an idiom they belong to: a sung lead over an arp, a pad, and a driving bass.
- **Melody.** The verse sits low and moves by step, a four-bar phrase ending open on E, answered by one that reaches D5. The chorus jumps an octave and climbs, to A5 in its first half and past it to C6 in the second, before falling home to D5. The octave doubling thickens the chorus, and the harmony in the final chorus follows the D minor scale a third below.
- **Lead.** The two saws differ by ±6 cents so they don't fuse into one, and sit at only ±0.2 so the lead stays a center voice.
- **Arp.** Each note strikes left on a short saw and then blooms right on a triangle, so every note moves across the field. The bloom outlasts the strike, so with the triangle at pan +0.6 the arp leaned about 5.6 dB right. The saw got the higher gain and the triangle a narrower pan, which leaves it about 2.5 dB right.
- **Pad.** Two saws ±8 cents apart and panned ±0.7, so the beating keeps them from summing back to center. Pans stay at ±0.7 to avoid the side boost near ±1. The voicings keep the pad between C3 and D4, under the arp and the lead.
- **Bass.** Both layers sit at pan 0 to anchor the center. The sine sounds an octave below the written note, and the quiet saw gives it an edge that reads on small speakers.
- **Drums.** The Electronic kit suits the genre, where an earlier take found the Standard kit's acoustic tone off. The drums stay centered, so the synth layers carry all the width.
- **Levels.** Set from renders with Toy MIDI's `render-audio`, with each track also rendered alone. By track, the lead is about −27.6 dB RMS in the verse and −22.9 dB in the chorus, the arp −29.4 dB, the pad −29 to −31 dB, the bass −29 dB, and the drums −29 to −32 dB. The mix peaks at −3.1 dBFS. The side-to-mid ratio, a rough measure of width, is about 0.5 to 0.6 in the intro and break, and about 0.3 with the full band.

## Toy MIDI doc gaps

- How loud a layer is at a given `gain`, by waveform, and how layers sum, so there's no reference for safe gains when several layers and releases overlap.
- Whether note velocity scales the synth's output, and by what curve.
- Whether CC 11 (expression) and CC 7 (volume) act on the own synth. The outro fade relies on CC 11.
- The pan law: the docs give the range of `pan` but not that a hard-panned layer gets louder on its side, nor how layer pan combines with track pan.
- Defaults when `gain`, `pan`, `octave`, `detune`, or `amp` are left out of a serialized layer.
- Whether `program` means anything when `synth` is set, since `SharedMidiTrack` still requires it.
- What range layer and track `gain` take. The mixer's fader tops out at +6 dB (gain 2), but a project file can set more and `render-audio` plays it, so this piece keeps track gains at or below 2 and raises layer gains instead.
- The Electronic kit's note map, so the drums assume General MIDI: 36 kick, 38 snare, 42 closed hat, 49 crash.
- Whether playback continues past the loop's end so the last pad release can ring, or the loop cuts it off.
