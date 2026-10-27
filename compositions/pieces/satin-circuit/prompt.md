Compose a new piece to demo a custom synth against General MIDI, and open a draft PR in llm-music-probe. Hiroshi judges by ear later, so run through to the PR without stopping to ask.

Context: toy-midi #1005 (https://github.com/hi-ogawa/toy-midi/issues/1005). SoundFont presets proved too rigid to iterate, so toy-midi may get its own subtractive synth, but only if a demo shows it earns its place. No synth part in the catalog is better than "justifiable" so far, and the leads are the weakest.

Piece: early-80s boogie / synth-funk, 16–24 bars, where the synth parts carry the music: a filter-envelope synth bass (the star), a portamento lead, and a pad. Write the parts for a synth that responds, using accents in velocity, overlapping notes where glide should happen, and held notes for vibrato. Follow compositions/README.md for the composing session and the folder. Drums and other non-synth parts stay on General MIDI.

Demo:
1. The piece as a Toy MIDI project on General MIDI presets, playable as is.
2. An offline prototype synth (band-limited oscillators, TPT state-variable lowpass with resonance, keytrack, filter and amp envelopes, velocity to cutoff, delayed vibrato, mono glide, unison), with the non-synth tracks rendered through spessasynth_core and GeneralUser dry like the app. A starting point, untested and written for another piece, is a lead-demo render script from the synth study.
3. A render ladder on bass and lead, starting from General MIDI, with each step changing one thing and synth parts loudness-matched to their General MIDI versions. Show it on one page with each step playable in the mix and solo, shared as a gist and linked from the PR.

Keep the synth offline in the probe repo. Don't change toy-midi.
