# Clichê, full guitar shapes with accents and light strokes

A/B in Toy MIDI:

- Full shapes + light strokes: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv6-light-strokes.json
- Full shapes + texture with chucks (has the dead-air gaps): https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv5-full-shapes-texture.json
- Full shapes: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv4-full-shapes.json
- Strummed: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv1-strummed.json
- Original: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche%2Fcliche.json

This version starts from the full-shape one (gist `6175c1e7f2fd273d48db544b27b67b2e`). It replaces the texture pass with chucks (gist `6ff0ec99b53121e8e74f5d5c457441d2`), which cut the ringing chord at every in-between stroke and left 0.7–1 beat of dead air after `&3` and after beat 3 of the second bar. The chucks and the muted guitar track are gone. Shapes, stroke times, directions, spread and velocity taper are unchanged, as are the other tracks. `python3 light.py fullshapes.json project.json` reproduces it (seeded RNG) and imports the shape table from `shapes.py`.

## Choices

- **Roles.** Over the 2-bar cell `1 &2 &3 &4 | 2 3 4 &4`, beat 1, `&2`, `&4`, beat 2 and the final `&4` are accents, and so is any stroke that starts a new shape. `&3` and beats 3 and 4 of bar 2 are light strokes. Over the song this comes out as 87 accents and 41 light strokes.
- **Accents.** Velocity is ×1.08. Each string rings until it is struck again or the shape changes.
- **Light strokes.** These play only the top 2–3 strings of the stroke, at velocity ×0.60–0.72. They re-strike only those strings, so the lower strings of the shape keep ringing from the last accent. Their own notes stop at the next stroke, so they sit as a lighter layer on top rather than replacing the chord.
- **Variation.** Each bar gets a velocity drift from a random walk (SD 2.5, clipped to ±6), plus ±4 per stroke. Notes are shortened at random by up to 12%, capped at 0.06 beat so that no gap is audible. No two of the 32 bars are identical, and the guitar never goes silent for more than 0.1 beat.
