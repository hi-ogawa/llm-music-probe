# Supersaw Horizon

A 48-bar trance piece in A minor at 138 BPM, played on Toy MIDI's own synth. It demos the per-layer `octave` and `detune` fields from [toy-midi#1067](https://github.com/hi-ogawa/toy-midi/pull/1067), with detune as the star. Every melodic part is a stack of saws spread a few cents apart, so the beating between them is the genre's wide supersaw sound.

- **Project file:** [`project.json`](project.json), written by [`generate.mjs`](generate.mjs) (`node generate.mjs`)
- **Listen on the PR preview:** [`/draft?src=…`](https://fix-issue-1060-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fsupersaw-horizon%2Fcompositions%2Fpieces%2Fsupersaw-horizon%2Fproject.json). The deployed app doesn't have `octave` and `detune` yet, so it plays every layer at the note's pitch.

## Arrangement

The harmony is i–VI–III–VII (Am–F–C–G), two bars per chord, so each 8-bar section is one cycle. Drop 2 swaps the last G for E major, the harmonic minor V.

| Bars  | Section   | What plays                                                                                                        |
| ----- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| 1–8   | Intro     | Kick and off-beat hats, a rolling bass on an A pedal. Clap and 16th hats join at bar 5.                           |
| 9–16  | Build     | The progression arrives in the bass. The pluck arp fades up, the pad swells in from bar 13, and a snare roll tightens to 16ths. |
| 17–24 | Breakdown | Drums and bass drop out. The pad and the lead carry the whole hook alone, with vibrato on the long notes.         |
| 25–28 | Riser     | The lead repeats the call over Am–F, louder each bar. The uplifter sweeps up two octaves under a snare roll from quarters to 32nds. Everything cuts on the last half beat. |
| 29–36 | Drop 1    | Full level: the hook on the lead, the arp, the bass, the pad, and the full kit.                                   |
| 37–44 | Drop 2    | The arp turns its pattern around, and the hook's answer turns to E major, ending on a held G# that bends up into A. |
| 45–48 | Outro     | The lead lands on that A and fades. The kit thins to the kick.                                                    |

## The hook

The lead melody is an 8-bar call and answer.

- **Call** (Am, F): climbs the A minor triad to A5 and falls to a held E5, then answers itself a step lower over F, falling to a held A4.
- **Answer** (C, G): the same rhythm from G4 up to the peak, a held C6, then down through B5–A5–G5 over G, leaving E5 hanging so the call's A follows.
- **Drop 2's answer** (C, E): the same climb to C6, then down the E major triad to a held G#5, which pitch bend raises a semitone into the outro's A5.

## Tracks

All melodic tracks use Toy MIDI's synth. Layer gains in `generate.mjs` are relative within each patch and scaled by `LAYER_SCALE`, since the synth renders quietly at gains near 0.1.

| Track     | Layers                                                                                     | Part                                                                            |
| --------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Lead      | 4 saws at −14, −5, +6, +15 cents. A saw at `octave: 1`, +8 cents, for air. A sine at `octave: -1` for body. | The hook, from the breakdown on. CC1 vibrato fades in on every note of two beats or more. CC11 sets its level per section, and pitch bend carries drop 2's G# into A. |
| Pad L     | 3 saws at −19, −7, +11 cents. A triangle at `octave: -1`, −7 cents.                         | Sustained chords from bar 13, panned left. CC11 swells it in.                   |
| Pad R     | 3 saws at −11, +7, +19 cents. A triangle at `octave: -1`, +7 cents.                         | The same chords, panned right. The mirrored detune makes the two sides beat differently, so the pad is wide. |
| Pluck Arp | 2 saws at ±7 cents, decaying to nothing. A square at `octave: 1` with a shorter decay for the click. | 16th notes through each chord's tones in the build and drops, with a reversed pattern in drop 2. CC11 fades it up through the build. |
| Bass      | A saw at pitch for bite, and a sine at `octave: -1` as the sub.                             | The rolling off-beat bass: three 16ths after each kick, flipping up an octave at chord changes in the drops. Low-passed at 900 Hz. |
| Uplifter  | 4 saws at −35, −12, +13, +34 cents, and a saw at `octave: 1`, +21 cents: the widest stack in the piece. | An A3–E4 fifth held through the riser, bent from −12 to +12 semitones on a curve while CC11 rises. |
| Drums     | GeneralUser GS Electronic kit (bank 128, program 24).                                       | Four-on-the-floor kick, clap on 2 and 4, off-beat hats, crashes on section starts, and snare rolls into the build's end, the riser, and drop 2. |

The synth has no filter, so each track uses the track EQ instead: high-passes to keep the saws out of the bass, and low-passes to soften the pads and the arp.

## How it demos the feature

- **Detune** is the sound of every melodic part, at different widths: ±7 cents on the pluck for a tight shimmer, about ±15 on the lead, about ±19 on the pads, and ±35 on the uplifter for a wash. Uneven spacings, such as −14, −5, +6, +15, keep the layers from beating in lockstep.
- **Stereo width from detune** comes from two pad tracks with mirrored detune sets panned apart, since a patch's layers sum to one mono voice.
- **`octave`** adds the bass's sub, the lead's air and body, the pads' body, and the arp's click, each as one more layer rather than as doubled notes.
- **Without the PR**, every layer plays at the note's pitch: the stacks collapse to one thick saw, the bass loses its sub, and the lead loses its top octave.

## Level check

Rendered with the CLI from `toy-midi-issue-1060-layer-octave-detune` against the PR preview, then measured with ffmpeg's `ebur128` (integrated LUFS), the mix and each track soloed. The mix peaks at −4.3 dBTP, so nothing clips.

| Track           | Breakdown (17–24) | Riser (25–28) | Drops (29–44) |
| --------------- | ----------------- | ------------- | ------------- |
| Mix             | −24.7             | −20.6         | −18.1         |
| Lead            | **−26.5**         | **−24.4**     | **−21.6**     |
| Pad L / Pad R   | −32.0 each        | −31.9 each    | −33.6 each    |
| Pluck Arp       |                   |               | −30.2         |
| Bass            |                   |               | −25.6         |
| Uplifter        |                   | −27.2         |               |
| Drums           | −37.0 (crash)     | −24.6         | −23.5         |

The lead is the loudest track in every section it plays. The two pads together sit about 3 dB louder than one alone, so 2.5 dB under the lead in the breakdown.

## Toy MIDI doc gaps

- **The synth's output level.** The docs give `gain` as a linear multiplier but not how loud a layer at gain 1 is. With layer gains around 0.1, which seemed safe for 4–6 stacked saws, the synth tracks rendered about 10 dB under the GeneralUser GS drums, so every patch needed scaling up by 4.
- **Velocity on the synth.** The docs don't say whether the synth responds to note velocity. The piece sets per-section level with CC11 so it doesn't depend on it.
- **CC7 and CC11 curves.** The docs don't say how CC11 maps to gain. Raising the pad's CC11 from 88 to 105 raised its level by about 3.1 dB, which fits a squared curve (3.1 dB) rather than a linear one (1.5 dB).
- **CC1 vibrato.** `toy-midi.d.ts` lists CC1 only as "modulation". The vibrato's depth (0–50 cents) and rate (5.5 Hz) came from the brief, not the docs.
- **Oscillator phase.** The docs don't say whether layers start in phase. Detuned saws that start in phase sum to a sharp peak on each note-on before they drift apart, which matters for stacked gains and for the attack's sound.
- **Pitch bend and `octave` layers.** The docs don't say that pitch bend moves every layer by the same semitones, or that it applies to every held note on the track. The uplifter's two-note fifth and the lead's bend assume both.
- **Stereo.** The docs don't say that a patch is mono. The piece assumes it, since layers have no pan, and splits the pad across two tracks for width.
- **No filter or EQ automation.** Automation covers only controllers and pitch bend, so trance's filter sweeps aren't possible. The build swells the arp and pad with CC11 instead.
