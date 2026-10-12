# 07-live-toy-midi-tab

- Direction: Instrument idiom under Depth, and The adjustment loop, in [directions.md](../../docs/directions.md)
- Date: 2026-10-10
- Model ID: claude-opus-5-5, in one Claude Code session that started on unrelated work, not a fresh subagent
- Output format: JavaScript run against toy-midi's recorder runtime in the open page, through the WebMCP eval tool ([toy-midi #737](https://github.com/hi-ogawa/toy-midi/pull/737)) and `webmcp-bridge`, with no score file

## Question

Bass tab was listed as an untested probe: do the model's string and fret choices make sense for playability and hand position? This session was the first dogfood of toy-midi's agent interface, and tab came up there unplanned, so it is a first data point rather than a designed experiment. It also gives two more data points for the adjustment loop, from notes a bassist gave after looking at the result.

Claims affected in [context.md](../../docs/context.md): a new row for instrument idiom, and the adjustment loop.

## Setup

The agent composed into an empty toy-midi project from "just created empty new project. can you compose something?", with no style, key, or instrument given. It chose the piece itself, so nothing was recalled from a recording. It then wrote tab for its own bass part through toy-midi's per-note `tabString`, on the track's default 5-string tuning. Playback is toy-midi's in-browser General MIDI synth with its bundled soundfont, not our fluidsynth render.

The listener's notes are verbatim in [session.md](session.md). Each was written as a bassist would say it to a collaborator, without naming a fix.

## Raw output

- [session.md](session.md): prompts verbatim, the composing and final tab scripts verbatim, the intermediate tab passes described with their output verbatim
- [project-state.json](project-state.json): the final project as read from the page, with every note and tab string

## Judgment

The piece is "Sunset Drive", 16 bars of city pop in D major at 96 bpm: | Gmaj7 | A7 | F#m7 | Bm7 | Em7 | A7 | Dmaj7 | A7sus4 A7 |, played twice, with electric piano, fingered bass, flute lead, and a pad on the second pass. The bass plays root, root, fifth, octave, and a chromatic approach from below in every bar.

Composition:

- **Measured:** the bass was first written with roots from D2 to B2 and octave notes up to B3. The listener flagged it ("isn't bass octave high? intended?"). The agent had not chosen the octave on purpose, and its first explanation overstated the problem by calling the whole part high, when only the octave notes sat high. Dropped an octave, the line runs from C#1 to B2.
- **Not judged by ear:** the listener played the piece in toy-midi but gave no judgment of how it sounds, so this run says nothing about the composition's quality.

Tab, in four passes:

- **Measured:** the agent never wrote a fingering directly at first. It wrote a generic search and ran it three times with different costs. Greedy nearest-fret drifted up to fret 19. A whole-line search with an open-string discount gave bar 1 as G0 G0 D12 G12. A hand-position search gave the same bar 1 and still reached fret 16.
- **Measured:** after the octave drop the same search stayed within fret 4, but used open strings in place of the box shape in bars 1, 7, and 15, such as B3 B3 A0 D0.
- **Measured:** after "isn't tab awkward? or you don't have much intuition?", the agent named the root, fifth, octave box shape, wrote it as a rule, and every bar became the same moving hand shape within fret 5. The listener replied "very cool nontheless."
- **Inferred:** the model knew the box shape as a named rule, because it named it and applied it correctly as soon as it was asked. What failed first was the default approach. It routed the problem through a generic optimizer, whose costs encoded "few frets and little movement" instead of the shape a bassist would use.
- **Revised in review:** this was first written up as the idiom being in the model's vocabulary all along. Hiroshi pointed out that recalling a named rule and running it as code is still a heuristic solver. Intuition in the probe's sense would be fret sequences absorbed from reading tab, which would come out as tab written directly as text, without a rule or a script in between. This run never asked for that, so every pass, including the final one, was a solver, and fingering intuition beyond named rules is untested.
- **Inferred:** two of the remaining awkward spots are in the notes, not the fingering. In bars 4 and 6 the approach from below lands below E1, so the hand jumps from the G string to the B string. The agent pointed this out and proposed approaching from above, which was not tried.

Medium:

- **Measured:** the agent wrote toy-midi's numeric schema directly, with chord names only as labels for hand-chosen voicings, the melody as MIDI numbers, and the bass as a rule over the chart. The analysis is in [notation.md](../../docs/notation.md#first-evidence-writing-into-a-schema-2026-10-10).
- **Measured:** every voicing holds exactly its chord's pitch classes, and every melody note is in D major. The only notes outside the key are the bass's intended chromatic approaches. The one error was register, not pitch class.
- **Inferred:** the melody and voicings were generated directly as numbers, with no procedure between intent and output, unlike the bass and every tab pass. So the composition's direct layers count as the intrinsic kind despite the numeric form, which fits the reading that the knowledge sits above any one encoding.

Adjustment loop:

- **Measured:** both listener notes were questions, not instructions. Each time the agent explained the cause, proposed a change, and waited for confirmation before rewriting the register. For the tab note it rewrote directly.
- **Judged by the listener, not by ear:** the final tab was accepted.

## Effect on claims

- New rows in [context.md](../../docs/context.md): a named fingering rule is known but was not applied by default, from one run on own material, and fingering intuition encoded in tab as text is open.
- Adjustment loop: two more notes in a musician's words each produced a revision that followed the intent, adding to [06-reference-feedback](../06-reference-feedback/README.md).
- [notation.md](../../docs/notation.md): first data point for the central hypothesis that syntax matters little and room decides what gets out, with two nuances: scripting can route around an idea, and raw numbers may cost legibility.
- For [toy-midi-playback.md](../../docs/toy-midi-playback.md): step 2, letting an agent put music into the open toy-midi, works through the WebMCP bridge without any import, and the agent can also play, seek, and loop.
