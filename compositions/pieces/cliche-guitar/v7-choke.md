# Clichê, full guitar shapes with a choked beat 4 before each push

A/B in Toy MIDI:

- Full shapes + beat-4 choke: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv7-choke.json
- Full shapes: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv4-full-shapes.json
- Strummed: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche-guitar%2Fv1-strummed.json
- Original: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fcliche%2Fcliche.json

This version starts from the full-shape one (gist `6175c1e7f2fd273d48db544b27b67b2e`) and changes one thing. The downstroke on beat 4 of every second bar sits an 8th before the `&4` anticipation into the next bar, and it is now choked after about a 16th (0.20–0.28 beat). The left hand lets go, so the push gets a short breath instead of ringing straight into it. Everything else rings as in the full-shape version. Pitches, stroke times, velocities and the other tracks are unchanged. `python3 choke.py fullshapes.json project.json` reproduces it (seeded RNG).

This replaces the texture passes (accents, light strokes and chucks). Their in-between treatment either left dead air after strokes followed by a full beat, or came out close to the original once everything rang. The short-stroke feel belongs only where two strokes are an 8th apart at the bar boundary, which is 16 places in the song (beats 7, 15, 23, …, 127).
