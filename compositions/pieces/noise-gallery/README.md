# Noise Gallery

A gallery of white-noise patches on Toy MIDI's synth, for the Noise waveform in [toy-midi#1096](https://github.com/hi-ogawa/toy-midi/pull/1096). It's in A minor at 120 BPM. Each part is 4 bars on its own track, named by a locator, so looping a part plays its patch alone. A GeneralUser GS TR-808 kit plays under every part except the noise drums.

Until #1096 merges, open it on the PR's preview: [open in Toy MIDI](https://fix-issue-1095-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fnoise-gallery%2Fcompositions%2Fpieces%2Fnoise-gallery%2Fproject.json)

- [`project.json`](project.json): the piece, a Toy MIDI `SharedProject`
- [`noise-gallery.mjs`](noise-gallery.mjs): writes `project.json`, with `node noise-gallery.mjs`

A session composed it from a brief and the preview's agent docs, without hearing it.

## Parts

| Bars | Track | Patch |
|---|---|---|
| 1–4 | Riser & Downlifter | One noise layer at Q 4 with a −5-octave filter envelope, a 2 s attack, and velocity depth 1. The riser is a 3-bar note at velocity 40, so the envelope only dips it about 1.6 octaves while CC74 opens it from about 240 Hz to about 11 kHz. The downlifter is a 1-bar note at velocity 127 from about 12 kHz, so the envelope sweeps it down 5 octaves into bar 5. CC11 swells the riser and fades the downlifter |
| 5–8 | Wind | Two noise layers at Q 7, cut at 600 Hz and 950 Hz and panned apart, on one held note. CC74 drifts through three overlapping slow waves, so gusts rise and fall over the 4 bars. It starts and ends at the same value, so the loop joins |
| 9–12 | Tuned Noise | One noise layer at Q 40 and keytrack 1, with the cutoff at middle C's 261.63 Hz, so the resonant peak lands on each note's pitch. A whistled melody from E5 to E6 |
| 13–16 | Breathy Lead | A triangle, with a noise layer at gain 0.12 whose filter opens 3.5 octaves on each attack and closes in about 0.1 s, then leaves a faint breath at sustain 0.1. Keytrack 1 keeps the breath's color with the note |
| 17–20 | Air Pad | Two saws detuned ±8 cents, with a noise layer at gain 0.06 under the same filter envelope, a 1.4 s attack and 3.5 octaves, so the air swells and settles with the chord. Am9, Fmaj7, Dm9, E7sus4 to E7 |
| 21–24 | Noise Drums | One patch, with pitch picking the drum through keytrack. The noise layer brightens half an octave per octave, and a triangle body darkens 4 octaves per octave, so it only sounds on the snare's low note. Closed hats at C7 are 20 ms notes, the open hat a 225 ms note on the same pitch, the shaker 16ths at C6, the snare at G3 a noise burst over the triangle at 196 Hz, and the clap at C5 three bursts 15 ms apart plus a 150 ms tail |

Only the lowpass exists, so the hats are open noise rather than a highpassed band. White noise's energy sits in the top octaves, so open noise already reads as a hat.

## Choices

- **Riser and downlifter share one patch.** The brief puts both on one track, but a negative filter envelope sweeps every note down, including the riser. Filter velocity depth 1 separates them: the soft riser gets about a third of the sweep, which CC74 outruns, and the hard downlifter gets all of it.
- **Velocity balance in part 1.** The docs don't say whether velocity scales a synth note's level, so the piece assumes it does and lowers the downlifter with CC11 to roughly match the riser. If velocity doesn't scale the level, the downlifter comes out a few dB under the riser's peak.
- **Drums on one patch.** The noise drums use pitch and keytrack to make every drum from one patch, so the part stays one track. Each drum's length comes from its note's length against one shared amp envelope with sustain 0.3.

## Toy MIDI doc gaps

- **CC74 on the synth.** The docs don't say that CC74 moves a synth layer's cutoff, or how far. The piece assumes 64 leaves the patch as written and 0 and 127 move it about 4 octaves down and up.
- **Velocity and level.** The docs say how velocity scales the filter envelope, but not whether it scales the amp.
- **Noise level.** The docs don't say how loud noise is next to a saw at the same gain. The piece assumes they're about equal by RMS, so the noise layers under the lead and pad are at gains of 0.12 and 0.06.
- **Resonant peak level.** The docs don't say how loud a high-Q lowpass rings on noise, or whether it clips. The tuned noise uses Q 40 at layer gain 0.5 and track gain 0.75 as a guess.
- **Envelope curves.** The docs don't say whether envelope segments are linear or exponential, which shapes how the riser and downlifter sweep.
