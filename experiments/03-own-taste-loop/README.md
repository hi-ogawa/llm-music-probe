# 03-own-taste-loop

- Direction: Depth (voicing, bass) and Genre breadth (neo-soul keys and bass) in [directions.md](../../docs/directions.md)
- Date: 2026-10-08
- Model ID: claude-opus-5-5, in a Claude Code session with the research context of this repository
- Output format: Scrimshaw-compatible score, rendered by our tool

## Question

With no constraints except "a practice loop, not too long or too big", what does the model choose when asked to show its own musical taste? Compared with [02-practice-loop](../02-practice-loop/README.md), every choice of key, tempo, harmony, voicing, and groove is the model's.

## Setup

Hiroshi's prompt: "so if I specify nothing, and if you would prove your own musical taste for extreme, what would you give me? let's say it's still in the realm of practice loop so not too long or too big orchestration."

The model wrote the score in one pass, ran `pnpm cli check`, and read back the keys and bass note events. One change came from that read-back: the `Db13` in bar 8 lasted only an 8th, so it was lengthened to a beat. The model could not listen.

Rendering: `pnpm cli render night-line.scrim .tmp/night-line.wav --loops 4`, through General MIDI Electric Piano 1 and Electric Bass (finger).

## Raw output

[night-line.scrim](night-line.scrim). Its comments carry the model's stated intent.

## Judgment

Pending a listen.

Noted while writing, before listening (inferred, not judged by ear): most bass bars share one rhythmic template, root, ghost note, two 8ths, and a two-note approach, so the line may sound formulaic over 8 bars. Bars 4 and 8 break it.
