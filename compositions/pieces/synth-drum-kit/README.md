# Synth Drum Kit

A drum kit built on Toy MIDI's own synth, with one track per voice and no SoundFont drums. It isn't a composition. It's a testbed and a baseline to iterate on toward the TR-808 kit in [toy-midi#1098](https://github.com/hi-ogawa/toy-midi/issues/1098). An 8-bar electro beat in F minor at 108 BPM exercises every voice, with a bass and a pad only for context. Solo a track to hear one voice.

**[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fsynth-drum-kit%2Fproject.json)**

[`synth-drum-kit.mjs`](synth-drum-kit.mjs) writes [`project.json`](project.json). Unlike a composing session, the session that built it read Toy MIDI's synth source where the agent docs were vague, such as how pitch bend and detune are applied, because the goal is engineering the voices rather than testing the docs.

## Building blocks

- **Fixed-frequency layers.** Every drum voice plays one note, and each layer reaches its own frequency through `detune`, which has no limit. That's how one track holds six square oscillators at inharmonic frequencies.
- **Track EQ as the highpass.** The synth's layers only have a low-pass. Each voice is its own track, so the track EQ's high-pass and peaking bands shape the whole voice, which is what a highpass on the voice would do.
- **Pitch bend as the pitch envelope.** The synth has no pitch envelope, so the kick and toms get a pitch-bend drop on each hit, decaying exponentially. The synth applies bend without smoothing, so the points sit about 2 ms apart.
- **Layers as a two-stage envelope.** An ADSR decays once. A voice that drops fast and then rings, such as the cowbell, plays each oscillator twice, once loud with a short decay and once quiet with a long one.
- **Note length as a choke.** The open hats sustain while their note holds and stop on note-off, so ending the note at the next closed hat chokes it, as the 808's shared hat circuit does.

## Voices

The 808 descriptions are rough, from #1098 and commonly cited figures, and none of the voices has been tuned by ear yet.

| Voice | How it's built | 808 element it approximates | Missing | Next to try |
|---|---|---|---|---|
| Kick | 48 Hz sine decaying over 0.55 s, a 96 Hz sine with a 70 ms decay for the knock, and an 8 ms noise click through a 3 kHz low-pass. A 7-semitone bend drop with a 12 ms time constant on each hit | a resonator pinged by a pulse, with a short pitch drop | a pitch envelope, which would replace the bend lane and let the kick share a track with other notes | tune the base to the key, try a longer decay for the boomy 808 kick, and adjust the drop's depth and speed by ear |
| Snare | tones at 185 and 330 Hz with 120 and 70 ms decays, and noise through a 1.8 kHz low-pass that opens 2 octaves on the hit, scaled by velocity | two tuned resonators plus high-passed noise for the snappy | a highpass on the noise layer only, since a track high-pass would also cut the tones | tune the tones, and balance tone against noise |
| Clap | three noise bursts 10 ms apart and a tail note, through a 1.5 kHz low-pass at Q 3 and a 600 Hz track high-pass, with reverb | a noise burst retriggered a few times, then a tail, through a bandpass | a bandpass, approximated here by the resonant low-pass and the track high-pass | the burst spacing and count, and the tail length |
| Hats (808) | six squares at 205.3, 304.4, 369.6, 522.7, 540, and 800 Hz through two 5.5 kHz track high-passes and a +6 dB peak at 8 kHz. Closed decays in 45 ms, open sustains until its note ends | six square oscillators through a bandpass and a highpass, not noise | a bandpass per layer, approximated by the track EQ | the EQ's frequencies, and checking the six frequencies against the references in #1098 |
| Hats (noise) | the same pattern from noise through the same EQ, in bars 5–8 | the common non-808 way to make hats | — | comparing against the square hats is the point of this track |
| Cowbell | squares at 540 and 800 Hz through a 2.4 kHz low-pass at Q 2.5 and a 350 Hz track high-pass, each played twice, short and long | two square oscillators through a bandpass, with a fast drop and a ringing tail | a bandpass | the balance of the short and long copies |
| Toms | tuned sines at F2, B♭2, and E♭3 with 0.3 s decays, a faint noise click, and a 2-semitone bend drop | the kick's resonator tuned higher | a pitch envelope | tuning to the key, and the drop's depth |
| Rim | a 1.7 kHz triangle and a 480 Hz square, both under 20 ms, through a 300 Hz track high-pass | two short resonators through a highpass | — | the two frequencies and decays |

Levels between voices are set by guess. A listen will likely find some voices too loud or buried, especially the hats, where a steep high-pass leaves only the squares' upper harmonics.

## Toy MIDI doc gaps

Facts this kit relies on that the agent docs don't state, found in the synth source:

- **How far CC74 and CC71 move the filter:** ±4 octaves (4800 cents) of cutoff and ±12.5 dB of Q from 64, as SpessaSynth routes them.
- **The pitch-bend range and smoothing:** ±12 semitones, applied without smoothing, so a glide needs dense points.
- **The range of `detune`:** unlimited cents, so a layer can sit at any fixed frequency.
- **That a sine layer starts at phase 0:** so a sine kick starts at a zero crossing without a click of its own, and the click is a separate layer.
