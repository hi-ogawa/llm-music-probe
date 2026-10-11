# 09-top-layer-dialogue

- Direction: Fan-out and The adjustment loop in [directions.md](../../docs/directions.md), continuing [08-dilla-role-fan-out](../08-dilla-role-fan-out/README.md)
- Date: 2026-10-11
- Model ID: claude-opus-5-5 for the orchestrating agent and for every subagent (`general-purpose`), in one Claude Code session that continued from 08
- Output format: hand-written text, either a bar, beat and note-name line format or edit commands over a fixed base, converted mechanically to toy-midi tracks and loaded through `webmcp-bridge execute-tool toy_midi_eval`

## Question

After 08, Hiroshi judged the rhythm and harmony grounded and the melody arbitrary. This run follows that judgment through four steps, each prompted by the listener as it went, not designed in advance:

1. Does the top layer improve if one agent writes it by hand, while seeing what the other parts play?
2. If two producer agents keep talking about the top layer, with rhythm and harmony locked, what variation comes out?
3. Given per-track pan and a project comment, new in toy-midi, do the producers use pan as arrangement?
4. How does a listener's note in a musician's words land?

Claims touched in [context.md](../../docs/context.md): melodic intent, room in the medium, and a new row on whether known arrangement moves get applied without a prompt.

## Setup

Everything sits on 08's song, with its drums, bass, Rhodes, strings and organ unchanged throughout. Playback is toy-midi's in-browser General MIDI synth. Every note in this run was written by hand in a text format. Scripts only converted, checked or summarized it, and no script generated, transposed or randomized notes.

1. **Melody rewrite.** [melody-rewrite/context.md](melody-rewrite/context.md) is a bar-by-bar map of where 08's kick, snare, bass and Rhodes hits fall, generated from 08's project state. One fresh subagent wrote a new top layer against it in [melody-rewrite/melody.txt](melody-rewrite/melody.txt). It was not shown 08's melody.
2. **Producer dialogue.** Two subagents, Producer A and Producer B, took turns editing [dialogue/arrangement.txt](dialogue/arrangement.txt), a list of commands applied to [dialogue/base.json](dialogue/base.json), which is 08 with the step 1 top layer. [dialogue/build.mjs](dialogue/build.mjs) applies the commands, rejects any on the locked tracks, and writes a bar-by-bar summary the producers read in place of listening. Each turn appended a message to [dialogue/conversation.md](dialogue/conversation.md). Nobody else was in the loop. A first attempt left every part open, which the listener had not meant. It was stopped in turn 2 and kept in [dialogue/aborted-open-scope/](dialogue/aborted-open-scope/).
3. **Mix round.** toy-midi added per-track pan and a project `comment`. The build gained a `pan` command allowed on every track and wrote `comment.md` into the project. Fresh agents in the same two roles read the history from conversation.md, because the earlier agents could not be resumed after a session restart.
4. **Listener note.** The listener's note was passed word for word to a fresh agent in the Producer A role, with only one constraint added: keep the melody notes.

### Notation

Unlike 08, where each subagent wrote in a JavaScript vocabulary it defined itself, every part here was written in an external text notation. The orchestrating agent designed it during the run, and a script parses it. It is literal: one line is one note, as a bar, a position counted in 16ths with an optional offset in beats, a note name with octave, a length, and a velocity.

```
track Flute 73 0.75
5 1&+0.06 C5 1/4 78
5 1a+0.05 D5 1/4 80
5 2&+0.07 F5 3/4 84
```

For the dialogue it gained edit commands over the base song (`edit`, `clear <track> <bars>`, `drop`, `set`, `pan`) and drum names such as `kick` and `ohat`, documented in [dialogue/FORMAT.md](dialogue/FORMAT.md). `summary.md` runs the other way: build.mjs renders the song bar by bar in the same vocabulary, and the producers read it in place of listening.

Reproduce a turn by copying `dialogue/turns/<turn>.arrangement.txt` to `dialogue/arrangement.txt` and running `node dialogue/build.mjs`, which writes `summary.md`, `full.json`, and page scripts next to it. Turns 1-4 ran before `build.mjs` had `pan` and the comment export, and the current version applies their files unchanged.

## Raw output

- [session.md](session.md): every listener prompt and every subagent prompt, verbatim
- [melody-rewrite/](melody-rewrite/): the context map, its generator, the converter, and the subagent's melody
- [dialogue/conversation.md](dialogue/conversation.md): the producers' seven messages, verbatim as they wrote them
- [dialogue/turns/](dialogue/turns/): arrangement.txt after each turn, and comment.md after turns 5-7. Turn 4 made no edits
- [dialogue/comment.md](dialogue/comment.md): the final project comment
- [project-state.json](project-state.json): the final page, including the listener's own edits, with every note, gain and pan

## Judgment

### 1. Melody rewrite

- **Measured:** the subagent wrote 119 notes on flute, muted trumpet and vibes. Its hook (C5 D5 F5, then E5 D5 C5 A4) places each note after a Rhodes hit and next to the backbeat, as it described, which was checked against the map for the first statement only.
- **Judged by the listener, by looking more than by ear:** "it looks like this iteration didn't explore much than existing." It is a flute hook with horn answers again, like 08's.

### 2. Producer dialogue

- **Measured:** the producers agreed the top layer was finished after four turns, and turn 4 made no edits. Across the four turns they added no tracks and changed no instruments or melodic material. The flute went from 79 to 66 notes and the vibes from 18 to 10. The trumpet was unchanged. The Voice Swell went from 32 retriggered 16ths to 6 held notes.
- **Measured:** the edits were subtractions and fixes. They emptied one bridge bar (17), softened a re-entry, gave the vibes the hook alone for two bars instead of doubling the flute, and moved a pad note that sat a semitone under the flute's C to C# resolution.
- **Inferred:** the critique was real. The retriggered choir and the semitone rub would both have sounded wrong. When B corrected A, A conceded with the reason ("I read the start positions and didn't check where the notes end"). Producer B already called the track "close to done" in turn 2.
- **Measured:** in the first attempt, with every part open, Producer A spent turn 1 on the verse drum feel and on removing a doubled bass, not on the top layer.
- **Inferred:** two agents of the same model, starting from a draft, behave as a critique and editing loop, not a source of variation. Same taste, an existing draft to anchor on, and a setup that rewards agreement all push toward convergence. Starting from an empty top layer would separate the draft's anchoring from the model's default, and was not run.

### 3. Mix round

- **Measured:** both producers used pan for the call and answer they had built, the flute and vibes at -0.4 against the muted trumpet at +0.45, with pulse and root in the center. B's one change moved the hand percussion to the hook side, -0.25, arguing about how the stereo picture shifts on every answer, not about balance. Neither changed a note.
- **Measured:** B corrected a factual error in A's draft comment, which said the breakdown had no strings when the strings do play there.
- **Judged by ear:** "pan feels like a cheap musical depth technique and i like it."
- **Inferred:** pan was used in the first turn after the field existed, and for arrangement reasons. Before it, the only mix control was gain, and no stereo idea got out.

### 4. Listener note

- **Measured:** the producer added a second flute (42 notes) under every full hook statement and a second muted trumpet (20 notes) under every answer. It also turned the vibes' notes in bars 25-26 into two- and three-note shapes, with the melody note on top. No melody note changed. Every harmony note starts with a lead note and sits 3 to 5 semitones below it, with fourths where a third would clash with the Rhodes, and never at or above the lead.
- **Measured:** it left some spots single on purpose: the quiet teases, the pickups, the bar 20 bend where a parallel voice would smear it, and the outro, which thins out.
- **Judged by ear:** "sounds better."
- **Judged by ear, by editing:** the listener then raised the flute about 1 dB, lowered the second flute about 2 dB, and moved it from -0.3, just inside the lead, to +0.29, across the stereo field. That overrules the producer's reason, "the section fuses around the lead".
- **Inferred, from the listener's remark:** "these are also mostly classic quick arrangement cheatsheet so llm could figure out on its own." The producers had these moves. They applied them fluently once named, with chord-aware intervals and reasoned exceptions. But four autonomous turns never proposed one, and pan came up only when the agent was told about the feature. This is the same shape as [07](../07-live-toy-midi-tab/README.md), where the bass box shape was known but applied only after a bassist asked. What is missing is not knowledge or execution but reaching for the standard move unprompted.

### Notation

- **Measured:** going from 08 to this run changed three things together. The notation went from rule-level to literal, from numbers to note names and counted 16ths, and from one each subagent defined to one the orchestrator defined. Whether the notes were chosen one by one changed with the first of these.
- **Judged by the listener, by looking:** the literal rewrite "didn't explore much". So the literal notation, in which every note is chosen, did not by itself fix what felt arbitrary. One run cannot say which of the three changes mattered, if any.
- **Inferred:** the producers' messages talk in the summary's vocabulary, note names and counted beats such as "The trumpet's C5-A4 starts on 2& and the A4 ends at about 3e", so the notation also shaped how they discussed the track, not only how they wrote it.

## Effect on claims

- New row in [context.md](../../docs/context.md): standard arrangement moves are known and executed well when named, but not reached for in an autonomous loop. Supported in one run, with 07 as the same pattern for fingering. The next test is the same producer dialogue from turn 4's state, with an instruction to go through routine arranging moves before calling it done.
- Melodic intent: 08's judgment, an arbitrary melody over grounded rhythm and harmony, adds to the existing "not supported" row. The rewritten melody was not judged on its own by ear, only as "didn't explore much". The stacked version sounded better, but that is arrangement around the melody, not the melody's notes.
- Room in the medium: pan is a second data point after 07. The intent was already in the parts, and it got out as soon as the field existed.
- Fan-out: a role split (08) and a two-agent dialogue (here) both converged. Neither produced variation, which leaves the exploration form, several independent drafts judged by ear, as the untested one.
