# Clichê, full guitar shapes with bossa comping texture

A/B in Toy MIDI:

- Full shapes + texture: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv5-full-shapes-texture.json
- Full shapes: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv4-full-shapes.json
- Strummed: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv1-strummed.json
- Original: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche%2Fcliche.json

This version starts from the full-shape one (gist `6175c1e7f2fd273d48db544b27b67b2e`). The shapes, stroke times, directions, spread and velocity taper are unchanged, and there is no thumb line. Each stroke gets a role, and the chucks move to a new `Comping (muted guitar)` track (GM 28) placed right after the nylon one, with the same pan (-0.4) and gain (0.6). The other tracks are untouched. `python3 texture.py fullshapes.json project.json` reproduces it (seeded RNG) and imports the shape table from `shapes.py`.

## Choices

- **Roles.** Over the 2-bar cell `1 &2 &3 &4 | 2 3 4 &4`, beat 1, `&2`, `&4`, beat 2 and the final `&4` are accents. `&3` and beats 3 and 4 of bar 2 are in-between strokes. A stroke that starts a new shape is always an accent. The upstroke into Bbm9 also matches Eb13, which shares its top three strings, so it is assigned to the shape the following strokes settle on. Over the song this comes out as 87 accents, 26 light strokes and 15 chucks.
- **Accents.** Velocity is ×1.08. Lengths follow the full-shape version, so a string rings until it is struck again or the shape changes, and the low strings that an upstroke skips keep sounding under it. They are cut at the next light stroke or chuck, which is when the left hand lets go, and are randomly shortened by up to 12%.
- **Light strokes.** These stay on nylon but play only the top 2–3 strings of the stroke, always fewer than the stroke had. Velocity is ×0.60–0.72 and the length is 0.16–0.30 beat.
- **Chucks.** An in-between stroke becomes a chuck with probability 35% on `&3`, 30% on beat 3 and 70% on beat 4 before the push. A chuck plays the stroke's strings on the muted guitar with a tight 6–12 ms roll, velocity 30–44 tapering by 3 per string, and a length of 0.05–0.09 beat.
- **Variation.** Each bar gets a velocity drift from a random walk (SD 2.5, clipped to ±6), plus ±4 per stroke. Together with the random chuck choice and the length jitter, this means no two of the 32 bars are identical.
