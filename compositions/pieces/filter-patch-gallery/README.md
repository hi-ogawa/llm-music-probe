# Filter Patch Gallery

A gallery of patches for Toy MIDI's synth filter, in E minor at 110 BPM. It isn't a song. Each track is one patch playing a 4-bar pattern in its own part of the timeline, named by a locator, over a shared TR-808 drum track whose style suits each part. Loop a part to hear one patch alone. Each patch is also a candidate for the starting patches in [toy-midi#1017](https://github.com/hi-ogawa/toy-midi/issues/1017). The plan is [toy-midi#1093](https://github.com/hi-ogawa/toy-midi/issues/1093).

**[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Ffilter-patch-gallery%2Fproject.json)**

A session composed it from the plan and Toy MIDI's agent docs, https://toy-midi.hiro18181.workers.dev/llms.txt, without checking it in the browser. [`filter-patch-gallery.mjs`](filter-patch-gallery.mjs) writes [`project.json`](project.json).

## Parts

| Part | Track | Patch | Pattern | Drums |
|---|---|---|---|---|
| 1 | Env Filter Bass Up | saw and a sine sub, cutoff 180 Hz, Q 6, envelope +4.5 octaves with 0.35 s decay, full velocity depth | funk 16ths over Em7 and A7, velocities from 64 to 122 | funk |
| 2 | Env Filter Bass Down | the same layers with the cutoff at 3.5 kHz and the envelope at −4.5 octaves | the same line | funk |
| 3 | Moog Bass | saw and a square an octave down, cutoff 220 Hz, Q 1.2, envelope +2.5 octaves, half velocity depth | 8th-based line over Em, C, D, B7 | rock |
| 4 | Brass | two saws detuned ±6 cents, cutoff 400 Hz, a 120 ms filter attack, envelope +3 octaves | held chords mixed with short hits | rock |
| 5 | Pluck Arp | saw, cutoff 300 Hz, Q 3, keytrack 1, 0.18 s decay to sustain 0 | 16th arpeggio across two octaves, accented 3+3+2 | house |
| 6 | Wah Comp | saw and square, cutoff 700 Hz, Q 7, no filter envelope | rootless Em9 and A9 scratched in 16ths, CC74 rocking once per 8th, then a slow sweep under a held chord | funk |
| 7a | Swell Pad | two saws detuned ±8 cents, cutoff 250 Hz, a 2.5 s filter attack, envelope +3.5 octaves | Em9 and Cmaj9, two bars each | sparse |
| 7b | Darkening Pad | the same with the cutoff at 4 kHz and the envelope at −3.5 octaves | Am9 and B7sus4, two bars each | sparse |
| 8 | Acid Line | saw, cutoff 700 Hz, Q 9, keytrack 1, 0.16 s decay, envelope +4 octaves, full velocity depth | 16th acid riff, CC71 rising to 112 and back | house |

Parts 1 and 2 play the same line, so the only difference is the sweep's direction. A negative amount on a high cutoff makes each note dive dark and open again through the decay, which sounds like a wah pedal rocked from heel to toe. Parts 7a and 7b do the same for a pad.

The plan leaves out sounds that need features toy-midi#1017 hasn't added yet, such as a bandpass "wow", an LFO wobble, glide, a pitch envelope, and noise.

## Toy MIDI doc gaps

- **How far CC74 and CC71 move a synth track's filter.** The agent docs don't mention either controller. toy-midi#1017 says 64 plays the patch as written, which the piece follows, but nothing says how many octaves CC74's range spans or how CC71 scales Q. The wah comp swings CC74 from 20 to 112 and assumes that's a wide pedal sweep.
- **Whether a stepped controller change is smoothed.** Automation values hold until the next point. The wah's sweeps use a point every 64th note, about 34 ms at 110 BPM, and assume steps that close together don't click or zipper.
- **The filter envelope in its release.** The cutoff formula suggests the envelope falls back to 0 after a note-off, so a negative amount's tail opens back up to the patch cutoff. The darkening pad relies on that, but the docs don't describe the release.
- **What an omitted `filter` means.** `filter` is optional on a serialized layer, but the docs don't say what it defaults to, so the sub layers set a 20 kHz cutoff with no envelope.
- **A useful range for `resonance`.** It's given as "the low-pass's Q, as on the track EQ", without a range or the point where it rings. The patches use Q 0.7 to 9.
