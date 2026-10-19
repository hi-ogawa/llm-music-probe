# St. Denis-inspired soul jazz, handed off

A soul-jazz piece from Hiroshi's brief, inspired by Roy Hargrove's "Strasbourg / St. Denis". This run hands the brief to a fresh composing agent, and a separate session composes the same brief directly, so the two pieces can be compared. The brief is passed on verbatim, with only a first line saying where to save and which Toy MIDI docs to follow, and without a level check.

Run on 2026-10-19 with `claude-opus-5-5` as a fresh subagent, and the piece is in this folder. The composing agent got only the prompt below, as [experiments/README.md](../../../experiments/README.md) says, and worked in a scratch directory outside this repository. It didn't listen to the result, so its checks cover only pitch ranges and colliding notes.

## Prompt

> Compose a piece in Toy MIDI and save the project file. Follow https://toy-midi.hiro18181.workers.dev/llms.txt. Work only in /tmp/st-denis-compose: save the project JSON there, with any scripts you used and a README.md describing the piece.
>
> Compose a piece inspired by Roy Hargrove's "Strasbourg / St. Denis" (*Earfood*, 2008). Keep its character: a short, bluesy, catchy riff head that keeps returning, over a soul-jazz groove that sits between swing and straight feel.
>
> - **Bass carries the tune.** Write a defining bass figure, not a generic walking line. Someone should be able to recognize the piece from the bass alone.
> - **Form:** intro on the groove, then the riff head, then a solo section where the groove loosens and the harmony opens up, then back to the riff head and a tight ending. The head should feel like snapping back into place.
> - **Contrast:** the solo section breathes against the riff's punch. Use dynamics, density, and comping rhythm, not just a key change.
> - **Arrangement depth:** choose the instruments yourself, and feel free to go beyond a small combo. Horn backgrounds behind the solo, organ or keys pads, percussion layers, and counter-lines are all fine. Every added part should support the groove and the riff, not compete with them. Keep comping sparse and rhythmic.
