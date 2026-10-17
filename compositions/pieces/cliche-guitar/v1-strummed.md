# Clichê, strum-programmed nylon guitar

A/B in Toy MIDI:

- Strummed: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv1-strummed.json
- Original: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche%2Fcliche.json

Only the `Comping (nylon guitar)` track changed, and only its note starts, lengths and velocities. Pitches, voicings, the rhythm grid and the other tracks are untouched. `python3 strum.py cliche.json project.json` reproduces it (seeded RNG).

## Choices

- **Direction.** On-beat hits are downstrokes (low to high), offbeat hits are upstrokes (high to low). The 2-bar cell `1 &2 &3 &4 | 2 3 4 &4` comes out as `D U U U | D D D U`.
- **Spread.** Downstrokes take 18–40 ms first-to-last string, upstrokes take 10–24 ms. The string-to-string gaps within a stroke are uneven (±40%), so it is not a linear ramp.
- **Velocity.** Each stroke starts from the original average and drops about 4 per string along the stroke. Upstrokes are scaled to 82%. The bar downbeat gets +6. On 60% of upstrokes the lowest string is barely grazed (velocity 16–24), so they effectively catch only the top 3 notes. The note is kept so the voicing stays intact.
- **Length.** Each string rings until the next stroke reaches that string, then stops 0.01 beat early. The exception is the beat-4 hit right before the `&4` anticipation, which is choked at about 0.28 beat (left-hand release) to leave air before the push.
- **Timing.** Each stroke gets Gaussian jitter with an SD of 4 ms, clipped to ±8 ms.
