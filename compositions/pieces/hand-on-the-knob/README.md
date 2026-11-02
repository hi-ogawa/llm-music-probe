# Hand on the Knob

An acid house loop in A minor at 124 BPM, 16 bars, looped. It demos Toy MIDI's synth filter: a resonant low-pass with its own envelope on each synth layer ([toy-midi#1081](https://github.com/hi-ogawa/toy-midi/pull/1081)), with CC74 steering the cutoff and CC71 the resonance ([toy-midi#1085](https://github.com/hi-ogawa/toy-midi/pull/1085)).

**[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fhand-on-the-knob%2Fproject.json)**

A session composed it from the brief below and the agent docs on the filter's preview, https://fix-issue-1084-toy-midi.hiro18181.workers.dev/llms.txt, without checking it in the browser. [`hand-on-the-knob.mjs`](hand-on-the-knob.mjs) writes [`project.json`](project.json).

## Brief

An acid house loop, A minor, 124 BPM, 16 bars, looped.

- Bars 1–4: acid bass with its cutoff nearly closed by CC74, kick and hats.
- Bars 5–8: CC74 opens the bass's filter like a hand on a knob. A pad enters and gets brighter over each chord.
- Bars 9–12: full groove, a layered stab enters, CC71 pushes the resonance.
- Bars 13–16: peak, then CC74 and CC71 return to their bar-1 values so the loop joins.

Each filter feature shows in a part: the acid bass squelches, accents sweep deeper through velocity depth, and octave jumps show keytrack. The pad brightens through a slow filter-envelope attack. The stab layers different filters. Write it full, with drums from a kit of the composer's choice.

## The piece

Harmony repeats every 4 bars, Am | Am | F | G, with the bass riff moving to each root.

After a listen, Hiroshi reworked the Pad by ear in Toy MIDI. The session's 0.8 s filter decay made each chord's brightness peak and snap back down, so he lengthened it to 2.5 s, added the noise and sine layers, and set reverb sends of −12 dB on the Pad, −22 dB on the Stab, and −30 dB on the Drums, with the bass dry. The script reproduces his version, with his knob values rounded and the added layers' 5 ms amp release raised to 1 s to match the saws, so the air and sheen don't cut off at each chord change.

| Track | Patch | Part |
|---|---|---|
| Acid Bass | sawtooth, cutoff 700 Hz, Q 9, keytrack 1, filter envelope 0.16 s decay to sustain 0 with a 4-octave amount at full velocity depth | 16th-note riff from bar 1, accents at velocity about 120 over plain notes at about 78, with jumps of one and two octaves |
| Pad | two saws detuned ±9 cents and panned apart, cutoff 320 Hz, filter envelope with a 1.7 s attack, a 2.5 s decay, and a 3.5-octave amount, amp attack 60 ms. A quiet noise layer under the same filter envelope adds air, and two sines an octave up, detuned ±8 cents, panned hard apart, and outside the filter, add a sheen | Am9, Am9, Fmaj9, G6/9, one per bar from bar 5 |
| Stab | resonant swept saw (Q 8, 0.22 s decay, 4.5 octaves), a square under a fixed 1.4 kHz low-pass, and a sine sub an octave down with the cutoff at 20 kHz | offbeat chord stabs from bar 9, denser in bars 13–15 |
| Drums | GeneralUser GS TR-808 kit | four on the floor with 16th hats, then clap from bar 5, open hats on the offbeats and a rim from bar 9, and ride and tambourine in the peak |

Controllers:

- **CC74 on the bass:** 30 through bar 3, creeping up in bar 4, then rising unevenly to 100 over bars 5–8. It rides around 100 in bars 9–12, peaks near 120 in bars 13–14, and closes back to 30 by beat 62.
- **CC71 on the bass and the stab:** 64 through bar 8, then rising over bars 9–12 to 110 on the bass and 104 on the stab. It holds through bars 13–14 and returns to 64 by beat 62.

Both controllers reach their bar-1 values two beats before the loop end, so the tails ringing across the wrap don't jump.

## Toy MIDI doc gaps

- **How far CC74 and CC71 move a synth track's filter.** The type declarations document the filter's cutoff formula but don't mention either controller. The piece assumes 64 leaves the patch as written, CC74 scales every layer's cutoff by up to about 4 octaves either way, and CC71 scales every layer's Q by up to about 4× either way. Under a narrower range, bars 1–4 would be less closed and the opening smaller. Under a reading where CC74 sets an absolute cutoff, the bass's patch cutoff would stop mattering.
- **Whether CC74 and CC71 reach every layer.** The stab's sub relies on its 20 kHz cutoff to stay unfiltered when CC71 rises. The docs don't say whether the controllers apply to every layer, or whether a layer can opt out.
- **A useful range for `resonance`.** The docs give it as "the low-pass's Q, as on the track EQ", without a range or the point where it starts to ring or self-oscillate. The bass uses Q 9 and the stab Q 8, chosen as clearly resonant without being extreme.
- **What an omitted `filter` means.** `filter` is optional on a serialized layer, but the docs don't say what it defaults to. The unfiltered layers set a cutoff of 20 kHz with no envelope amount, rather than relying on the default.
- **No glide.** An acid line usually slides between some notes, and the docs show no portamento or legato mode for the synth. The riff leaves slides out rather than faking them with pitch bend.
