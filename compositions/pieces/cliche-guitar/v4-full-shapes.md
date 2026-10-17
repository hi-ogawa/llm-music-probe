# Clichê, full guitar chord shapes on the nylon guitar

A/B in Toy MIDI:

- Full shapes: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv4-full-shapes.json
- Strummed: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv1-strummed.json
- Original: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche%2Fcliche.json

This tests whether keyboard-style close voicing is what makes the comping sound like a Rhodes. It starts from the strummed version (gist `40bb09a52ec8b24e3f3c268a5cf1caa2`). Each chord hit's pitches are replaced by the full guitar shape, strummed as one stroke across the strings. There is no separate thumb line and no mute or texture pass. Only `Comping (nylon guitar)` changed. `python3 shapes.py strummed.json project.json` reproduces it.

## Choices

- **Shapes.** These are the shapes from the re-voicing search (gist `375801d436784457d2f8f9eeb4093381`), now played as whole chords, where that version had split them into a thumb line plus 3–4 close finger notes. Each one spans 18–29 semitones, against about 14 for the original keyboard voicings.
- **Downstrokes.** These play every sounding string of the shape, low to high, which is 5–6 strings. The first strings keep the strummed stroke's offsets and velocities. Extra strings continue at the stroke's average string-to-string speed, and the velocity keeps dropping by 4 per string. The stroke times, directions and timing jitter are the strummed pass's.
- **Upstrokes.** These play the top strings, high to low. A stroke takes 3 strings where the strummed pass had grazed the bottom note, and 4 otherwise, with the same velocities and offsets.
- **Lengths.** A string rings until it is struck again or the hand moves to the next shape. A low string that an upstroke skips keeps ringing from the last downstroke. This replaces the strummed pass's choke on beat 4.

## Shapes

Frets from low E to high E, `x` is unplayed.

| Chord | Shape | Span |
|---|---|---|
| Dm(add9) | `x 0 0 7 6 0` | 20 |
| Dm(maj7) | `x 0 0 6 6 0` | 20 |
| Dm7 | `x 0 0 5 6 0` | 20 |
| Dm6 | `x 0 0 4 6 0` | 20 |
| Gm9 | `3 x 0 3 6 5` | 26 |
| C13 | `3 3 0 3 5 5` | 26 |
| Fmaj9 | `1 3 2 2 x 3` | 26 |
| Em7b5(11) | `0 x 5 3 3 5` | 29 |
| Eb9(#11) | `x 6 5 6 6 5` | 18 |
| Cm9 | `x 3 0 3 4 3` | 19 |
| F13 | `1 x 0 2 4 3` | 26 |
| Bbmaj9 | `1 1 0 2 1 x` | 19 |
| Ebm9 | `x 6 4 6 6 6` | 19 |
| Ab13 | `4 x 3 3 1 2` | 22 |
| Am7b5(11) | `x 0 0 5 4 3` | 22 |
| Ab9(#11) | `4 x 0 5 7 6` | 26 |
| Bbm9 | `6 x 6 6 6 8` | 26 |
| Eb13 | `x 6 5 6 6 8` | 21 |
| A7(b9,b13) | `x 0 3 3 2 3` | 22 |
