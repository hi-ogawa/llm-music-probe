# Hat Lab

A listening lab for metallic drum sounds, not a beat. It asks when the TR-808's six square oscillators sound different from plain noise, to decide which source each hat and cymbal voice in the [Synth Drum Kit](../synth-drum-kit/) should use, toward the 808 kit in [toy-midi#1098](https://github.com/hi-ogawa/toy-midi/issues/1098).

**[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fhat-lab%2Fproject.json)**

[`hat-lab.mjs`](hat-lab.mjs) writes [`project.json`](project.json).

## Why

Through the 808's hat band around 7 kHz, a short noise hat already sounds close to the six squares. Six squares at unrelated frequencies put dozens of odd harmonics into the band at irregular spacings, which the ear hears as noise, and a 40 ms hit is too short to resolve partials a few tens of hertz apart. So the squares should only stand out in longer sounds, in lower bands where their partials thin out, or when retuned. This lab tests each of those.

## Setup

Each pair plays squares, then noise, through the same layer low-pass (Q 1.2), two track high-passes, and a +6 dB track peak, with the same envelope. The squares sit at the frequencies commonly cited for the 808's cymbal and hats, 205.3, 304.4, 369.6, 522.7, 540, and 800 Hz.

- **Matched levels.** The script computes the power each source passes through the band, from the square waves' odd harmonics and the noise's flat spectrum, using the same biquad formulas as the track EQ. It then sets the squares' gain so both pass the same power, so loudness doesn't decide the comparison.
- **Hits that decay fully.** Each hit's release equals its decay, so a note-off continues the same curve and every hit rings out however short its note.

## Parts

Each part is 4 bars, named by a locator, with squares and noise on separate tracks.

| Part | Decay | Band | What it tests |
|---|---|---|---|
| Decay 40 ms | 40 ms | 5.5–8.1 kHz | a closed hat, where the sources should match |
| Decay 150 ms | 150 ms | 5.5–8.1 kHz | an open hat |
| Decay 500 ms | 500 ms | 5.5–8.1 kHz | a long open hat |
| Decay 2 s | 2 s | 5.5–8.1 kHz | a ride or crash length |
| Band 3 kHz | 150 ms | 2.5–4 kHz | a lower band, where fewer partials fall and they should show as clang |
| Band 11 kHz | 150 ms | 9–13 kHz | a higher band |
| Retune squares | 500 ms | 5.5–8.1 kHz | the six moved together by −12, −5, +5, and +12 semitones, each after two hits at the reference. Noise has nothing to retune |
| Cymbal | 2 s | 3–11 kHz | a cymbal, where the squares should clearly differ |

Nobody has listened yet, so the expectations in the last column are predictions to check.
