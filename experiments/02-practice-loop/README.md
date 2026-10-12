# 02-practice-loop

- Direction: Genre breadth (neo-soul keys and bass) and Depth (voicing, bass) in [directions.md](../../docs/directions.md)
- Date: 2026-10-08
- Model ID: claude-opus-5-5, in a Claude Code session with the research context of this repository
- Output format: Scrimshaw-compatible score, rendered by our tool

## Question

Given a loose practice-loop brief, does the model write harmony, voicings, and a bass line that sound idiomatic for funk, neo-soul, or hip-hop? This is outside Scrimshaw's game-music genres, and the voicings are explicit note stacks, so voicing choices are the model's own rather than the renderer's.

## Setup

The brief, from Hiroshi's messages, summarized:

- A practice loop of 4 bars and 4 chords in A minor at 90 bpm on a 16th grid
- The root changes every 2 bars, and the chord changes every bar
- Funk, neo-soul, or hip-hop, any of them
- Keys mostly long notes for harmony, one chord per bar to show the change, with rhythm choices such as syncopation across bar lines left to the model's taste
- A bass line included, for testing

The model asked clarifying questions before writing, about how chords and roots relate, whether to include bass, feel, voicings, and loop length. It wrote the score in one pass, checked it with `pnpm cli check`, and read back the note events to confirm the intended ties and pickups. It could not listen. The only change after writing was a correction to one comment.

Rendering: `pnpm cli render loop.scrim .tmp/practice-loop.wav --loops 8`, through General MIDI Electric Piano 1 and Electric Bass (finger).

## Raw output

[loop.scrim](loop.scrim). Its comments carry the model's stated intent.

## Judgment

Pending a listen.
