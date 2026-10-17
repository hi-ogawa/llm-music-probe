# Tidepool

A calm ambient loop for Toy MIDI. 70 BPM, 4/4, 52 bars (about 2:58), with the loop range set to the whole piece so bar 52 flows straight back into bar 1.

Open it:

- v2 (latest): https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffeb08355e303b9f8ff5187699f275129%2Fraw%2Ftidepool-v2.json
- v1: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffeb08355e303b9f8ff5187699f275129%2Fraw%2Ftidepool.json

## v2: strings split by register

v1 played every string voicing from one track (String Ensemble 2, pan −0.15), so the C swell got louder without getting wider. v2 keeps the same notes and splits each voicing across sections:

| Track | Preset | Pan | Gain | Voices |
| --- | --- | --- | --- | --- |
| High Strings | 48 String Ensemble 1 | −0.45 | 0.45 | top two voices (8 velocity softer in B, so B stays dark) |
| Inner Strings | 49 String Ensemble 2 | 0 | 0.45 | middle voices |
| Cellos | 42 Cello | +0.40 | 0.35 | bottom voice in B, bottom two in C |
| Horns | 60 French Horn | +0.15 | 0.40 | double the inner voices in bars 33–42, velocity 44→56→44 |

As the C voicings open toward bar 37, the top notes spread left and the cellos right, and the horns add warmth in the middle. The top string voices, which sit closest to the melody's register, are now panned away from the piano (+0.1), which reduces masking. The piano gain went from 1.8 to 2.0. Measured in mono, the melody sits level with or above the whole C bed (three string parts, horns, harp, and bass) in each two-bar span, except at the last held note before the return.

The rest of this README describes v1, and everything in it still applies to v2 except the string track.

## Sections

Each section has its own instrument colors, and the percussion density follows the arc, from almost nothing in A to 16th-note shaker and congas in C.

| Bars | Section | Harmony | Texture |
| --- | --- | --- | --- |
| 1–12 | A (home) | D Lydian over a D3 pedal, two-bar chords: Dmaj9, Gmaj7#11/D, Dmaj9, E/D, Gmaj7#11/D, Bm(add9)/D | Warm pad, sparse piano fragments around A4–F#5, and high music-box sparkles two octaves up (G#6 over E/D for the Lydian color). A muted triangle every two bars from bar 5. No bass. |
| 13–28 | B (darker, lower) | B Aeolian, four-bar chords: Bm9, Gmaj9, Em11, Dmaj9/A | Pad out. Slow strings low (B2–F#4), fretless long notes falling B A G F# E F# A, a kalimba ostinato in 3+3+2 on chord tones, and a high vibraphone motif answering in the gaps. Shaker 8ths (right), a soft surdo pulse on beats 1 and the "and" of 3, and a cabasa every other bar (left). |
| 29–44 | C (lift) | F major, reached by a chromatic-mediant slip from D/A (F#→F, C#→C over a held A), two-bar chords: Fmaj9, C/E, Dm9, Bbmaj9, Fmaj9/A, Gm9, C9sus4, Bbmaj7#11 | Strings open to a seven-note A2–E5 spread at bar 37, then narrow. Harp rolls 8th-note arpeggios below the melody's register. The slow piano melody (C5–C6, peaking on C6 at bar 37) is the one foreground line. The fretless walks F E D Bb A G C Bb. Shaker 16ths build toward bar 37 and ease off, with soft congas and an open triangle on each chord change. |
| 45–52 | A' (return) | Dmaj9, E/D, Gmaj7#11/D, A9sus4/D | A thinned out, with a softer pad, three piano fragments, the music box, and one vibraphone callback. The shaker fades out by bar 49, and the bass's single soft D drops out early, so the loop returns to a dry bar 1. |

A bell tree sweeps in two beats before each section, including the loop point, so the seam sounds like another section change.

The Bbmaj7#11 at the end of C shares D, A, and E with Dmaj9, so the move back home is also a mediant step (Bb→D). The final A9sus4/D moves to Dmaj9 at bar 1 with every voice going by step.

## Instruments

| Track | Preset | Gain | Pan | Sections |
| --- | --- | --- | --- | --- |
| Piano | 0 Acoustic Grand | 1.8 | +0.10 | A, C, A' |
| Music Box | 10 Music Box | 1.6 | +0.45 | A, A' |
| Vibraphone | 11 Vibraphone | 0.7 | +0.35 | B, A' |
| Kalimba | 108 Kalimba | 1.0 | −0.40 | B |
| Harp | 46 Orchestral Harp | 0.7 | +0.30 | C |
| Warm Pad | 89 Pad 2 (warm) | 0.5 | 0 | A, A' |
| Strings | 49 String Ensemble 2 | 0.45 | −0.15 | B, C |
| Fretless | 35 Fretless Bass | 0.9 | 0 | B, C, A' |
| Shaker | GS Standard kit (bank 128): shaker | 1.5 | +0.50 | B, C, A' |
| Hand Perc | GS Standard kit (bank 128): surdo, congas, cabasa, triangles, bell tree | 0.9 | −0.35 | all |

## Choices worth knowing

- **No reverb or chorus sends.** The `SharedProject` format has per-track gain, pan, and EQ, but no effect sends or CC data, so reverb is whatever the synth applies by default.
- **Mix checked by render.** I rendered each track with fluidsynth and GeneralUser GS (the bank toy-midi ships) and measured integrated loudness per section with ffmpeg's `ebur128`. At unity gain the pad sat 9 dB over the A piano and the strings 9 dB over the C melody. The gains above fix that, and the C melody now sits about 1–3 dB above the combined strings, harp, and bass bed in each two-bar span, except where its last held note fades into the return. Percussion sits about 10–12 dB under the foreground, so it reads as texture. SpessaSynth in the browser may differ slightly from fluidsynth.
- **Percussion is humanized.** The shaker and hand percussion have small seeded timing and velocity variations, plus accent patterns (offbeat 8ths in B, a 16th accent cycle in C), so they don't sound like a grid.
- **Common tones are tied** in the pad and strings, so a held D pedal or a shared chord tone sustains instead of re-attacking at each chord change.
- **Swells are written as velocity.** The format has no expression control, so the C strings rise from velocity 60 to 72 across the first five chords and fall back, while the voicings widen and narrow.
