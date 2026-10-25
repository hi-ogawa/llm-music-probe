# Reverb sends

Toy MIDI's shared plate reverb ([toy-midi#987](https://github.com/hi-ogawa/toy-midi/issues/987)) gives every track a send that starts off, so each piece in the catalog still plays dry. This adds a reverb version of the seven pieces that [toy-midi#934](https://github.com/hi-ogawa/toy-midi/issues/934) picked to A/B reverb on, spread across genres, with only each track's `reverbSend` changed. Each version sits next to the piece's current file, named with a `-reverb` suffix.

`node add-reverb-sends.mjs` writes them all from the current files.

## Levels

A track's send comes from its General MIDI family, at [toy-midi#869](https://github.com/hi-ogawa/toy-midi/issues/869)'s measured levels for the synth's built-in reverb, raised 8 dB. That raise is the lower of the two that sounded good on Clichê in toy-midi#934's A/B, where #869's own levels couldn't be told from dry.

| Family | #869 | Send |
| --- | --- | --- |
| Pads and synth leads | −16 dB | −8 dB |
| Choir and pipes, such as flute, with brass and reeds by analogy | −24 dB | −16 dB |
| Everything else, such as piano, guitar, strings, harp, and drum kits | −30 dB | −22 dB |
| Bass | | off |

The bass stays dry to keep the low end clear. The orchestral contrabass, timpani, and tuba follow their families instead, because an orchestra plays in one hall.

These are starting points and not tuned by ear. #869's numbers are the synth's reverb return relative to dry, and toy-midi#934's A/B used fluidsynth's Dattorro, so they carry over to Toy MIDI's plate only as far as its return gain matches, which toy-midi#987 leaves for calibration.
