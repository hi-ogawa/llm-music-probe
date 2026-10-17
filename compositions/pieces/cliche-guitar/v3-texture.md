# Clichê, bossa comping texture on the nylon guitar

A/B in Toy MIDI:

- Comping texture: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv3-texture.json
- Re-voiced: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv2-revoiced.json
- Strummed: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv1-strummed.json
- Original: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche%2Fcliche.json

This version starts from the re-voiced one (gist `375801d436784457d2f8f9eeb4093381`). Pitches, voicings, stroke times, the thumb bass and the other tracks are unchanged. The finger strokes get a role, and the chucks move to a new `Comping (muted guitar)` track (GM 28) placed right after the nylon one, with the same pan (-0.4) and gain (0.6). `python3 nuance.py revoiced.json project.json` reproduces it (seeded RNG).

## Choices

- **Roles.** Over the 2-bar cell `1 &2 &3 &4 | 2 3 4 &4`, beat 1, `&2`, `&4`, beat 2 and the final `&4` are accents. `&3` and beats 3 and 4 of bar 2 are in-between strokes. A stroke that brings a new chord is always an accent. Over the song this comes out as 87 accents, 20 light strokes and 21 chucks.
- **Accents.** Velocity is ×1.08 and every string rings until the next finger stroke of any kind, because the left hand moves or lets go for it. Lengths are randomly shortened by up to 12%.
- **Light strokes.** These stay on nylon but play only the top 2–3 strings, always fewer than the full voicing. Velocity is ×0.60–0.72 and the length is 0.16–0.30 beat, which is the left hand releasing pressure.
- **Chucks.** An in-between stroke becomes a chuck with probability 35% on `&3`, 30% on beat 3 and 70% on beat 4 before the push. A chuck plays the whole voicing on the muted guitar with a tight 6–12 ms roll, velocity 30–44 tapering by 3 per string, and a length of 0.05–0.09 beat.
- **Variation.** Each bar gets a velocity drift from a random walk (SD 2.5, clipped to ±6), plus ±4 per stroke. Together with the random chuck choice and the length jitter, this means no two of the 32 bars are identical. The stroke spread and timing jitter from the strummed pass carry through.
