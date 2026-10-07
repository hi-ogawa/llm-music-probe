# 04-width-sweep

- Direction: Genre breadth and Fan-out in [directions.md](../../docs/directions.md)
- Date: 2026-10-08
- Model ID: claude-opus-5-5 for every cell, each in a fresh subagent
- Output format: our Scrimshaw-compatible score, rendered by our tool

## Question

Experiments 02 and 03 worked by ear in one genre, neo-soul in 4/4. How wide does that go? This sweep covers genre, form length, meter, and tempo, and repeats one brief to separate real range from sampling variance.

## Design

Each cell is one brief handed to a fresh subagent. The subagent sees only the shared brief below, not this repository's docs or earlier experiments, so no cell inherits choices from 02 or 03.

Axes covered across the cells:

- Genre: funk, boom-bap, bossa nova, jazz waltz, blues shuffle, reggae, afrobeat, K-pop, house, fusion, gospel
- Form length: 2-bar vamp, 4 bars, 8 bars, 12-bar blues
- Meter: 4/4, 3/4, 7/8, and swung or compound feels (12/8)
- Tempo: from about 60 to 150 bpm
- Brief: specified genre, or open "your own taste"

| Cell | Genre and feel               | Form           | Meter | Tempo | Main thing to hear                                 |
| ---- | ---------------------------- | -------------- | ----- | ----- | -------------------------------------------------- |
| 01   | Funk, one-chord dorian vamp  | 2 bars         | 4/4   | 100   | 16th syncopation and ghost notes in the bass       |
| 02   | Boom-bap hip-hop             | 4 bars         | 4/4   | 88    | Sample-like keys loop and a heavy, sparse bass     |
| 03   | Bossa nova                   | 8 bars         | 4/4   | 130   | Guitar comping pattern and root-fifth bass         |
| 04   | Jazz waltz                   | 8 bars         | 3/4   | 150   | Waltz comping and a two-feel bass line             |
| 05   | Blues shuffle                | 12 bars        | 12/8  | 110   | Shuffle feel and a walking or boogie bass          |
| 06   | Reggae one-drop              | 4 bars         | 4/4   | 75    | Offbeat skank and a melodic bass that leaves space |
| 07   | Afrobeat                     | 4 bars         | 4/4   | 105   | Interlocking guitar and keys parts                 |
| 08   | K-pop chorus loop            | 8 bars         | 4/4   | 120   | Four-chord pop harmony and a driving synth bass    |
| 09   | House                        | 8 bars         | 4/4   | 124   | Organ bass, chord stabs, four-on-the-floor         |
| 10   | Fusion in odd meter          | 4 bars         | 7/8   | 120   | Phrasing in 2+2+3 and extended harmony             |
| 11   | Gospel ballad                | 8 bars         | 12/8  | 60    | Rich voicings and passing chords                   |
| 12a  | Open brief: "your own taste" | Model's choice | —     | —     | Range of choices with no constraints               |
| 12b  | Same open brief, second run  | Model's choice | —     | —     | Sampling variance against 12a                      |
| 12c  | Same open brief, third run   | Model's choice | —     | —     | Sampling variance against 12a and 12b              |

Every cell stays at practice-loop scale: drums, bass, and one or two harmony or lead parts.

## Shared brief

Every subagent gets the same material:

1. A format reference for our score format, adapted from Scrimshaw's composing prompt. It drops the early-1990s game-music framing, adds the `epiano` and `ebass` instruments, and states which options are parsed but not rendered.
2. Its cell's brief from the table, in plain words.
3. Instructions to write explicit note stacks where voicing matters, to write its intent in comments, to save the score at a given path, and to run `pnpm cli check` until it passes. It is told that it cannot listen and that the output is rendered through General MIDI.

The format reference needs writing before the sweep runs.

## Procedure

1. Write the format reference.
2. Spawn one subagent per cell, in parallel, each writing `<cell>-<slug>.scrim` in this directory.
3. Render every score to `.tmp/04-width-sweep/` with a loop count that gives roughly a minute of audio.
4. Hiroshi listens, ideally without knowing which brief produced which file for 12a to 12c.

## Judgment

Pending the sweep.
