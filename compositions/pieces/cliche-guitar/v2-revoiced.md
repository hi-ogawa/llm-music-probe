# Clichê, re-voiced bossa nylon guitar

A/B/C in Toy MIDI:

- Re-voiced: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv2-revoiced.json
- Strummed: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv1-strummed.json
- Original: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche%2Fcliche.json

Only the `Comping (nylon guitar)` track changed. It starts from the strummed version (gist `40bb09a52ec8b24e3f3c268a5cf1caa2`). Every chord keeps its pitch classes and every finger stroke keeps its time, direction, spread and velocities. The other tracks are untouched. `python3 revoice.py strummed.json project.json` reproduces it and prints the chord chart below.

## Choices

- **Thumb.** On beats 1 and 3, the thumb plays the root when the chord is new since the last thumb note, otherwise the fifth (the flat fifth on m7b5). It stays on strings 6–4, E2 to E3, and is a single pluck damped by the next thumb note.
- **Fingers.** They pluck 3–4 upper chord tones on the strings above the thumb, which may drop the fifth or a doubling. The stroke order follows the strings, so a downstroke runs low string to high string even where the voicing crosses. A 3-note stroke keeps the full roll spread of the 4-note original, and an upstroke drops the grazed bottom note.
- **Shapes.** A search over standard tuning picks one left-hand shape per chord, covering the thumb notes and fingers together. The shape fits in a 4-fret box (5 frets above fret 5) and uses at most 4 fingers, with the index barring the lowest fret and mini-barres on adjacent strings. It favors open strings, a top voice around C4–Bb4, smooth voice leading (Viterbi over the progression) and an alternating bass. A repeated chord reuses its first shape.
- **Dm cliché.** The D–C#–C–B line lands on the G string (frets 7–6–5–4) over open A and D in the thumb, with F and open E ringing above.
- **Lengths.** Strings ring until they are plucked again or the hand moves to the next chord. The beat-4 hit before the `&4` anticipation is still choked.
- **Tab.** Toy MIDI's `tabString` only goes up to 5 strings and its presets are bass tunings, so the notes carry no string annotation. The shapes are listed here instead.

## Shapes

Frets from low E to high E. Brackets mark thumb notes, `x` is unplayed.

| Chord | Shape | Fingers |
|---|---|---|
| Dm(add9) | `x (0) (0) 7 6 0` | D F E |
| Dm(maj7) | `x (0) (0) 6 6 0` | C# F E |
| Dm7 | `x (0) (0) 5 6 0` | C F E |
| Dm6 | `x (0) (0) 4 6 0` | B F E |
| Gm9 | `(3) x (0) 3 6 5` | Bb F A |
| C13 | `(3) (3) 0 3 5 5` | D Bb E A |
| Fmaj9 | `(1) (3) 2 2 x 3` | E A G |
| Em7b5(11) | `(0) x 5 3 3 5` | G Bb D A |
| Eb9(#11) | `x (6) 5 6 6 5` | G Db F A |
| Cm9 | `x (3) 0 3 4 3` | D Bb Eb G |
| F13 | `(1) x 0 2 4 3` | D A Eb G |
| Bbmaj9 | `(1) (1) 0 2 1 x` | D A C |
| Ebm9 | `x (6) 4 6 6 6` | Gb Db F Bb |
| Ab13 | `(4) x 3 3 1 2` | F Bb C Gb |
| Am7b5(11) | `x (0) 0 5 4 3` | D C Eb G |
| Ab9(#11) | `(4) x 0 5 7 6` | D C Gb Bb |
| Bbm9 | `(6) x 6 6 6 8` | Ab Db F C |
| Eb13 | `x (6) 5 6 6 8` | G Db F C |
| A7(b9,b13) | `x (0) 3 3 2 3` | F Bb Db G |
