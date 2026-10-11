# 08-dilla-role-fan-out

- Direction: Fan-out (the role-split form) and Beat making step 3, feel, in [directions.md](../../docs/directions.md)
- Date: 2026-10-11
- Model ID: claude-opus-5-5 for the orchestrating agent, in one Claude Code session that started on an unrelated question, and for three `general-purpose` subagents it launched in parallel
- Output format: JavaScript modules that return toy-midi tracks as plain data (pitch, start and duration in beats, velocity), bundled into one script run against toy-midi's recorder runtime through `webmcp-bridge execute-tool toy_midi_eval`, with no score file

## Question

Can a style named only by a producer, J Dilla, get out through toy-midi's numeric schema, including feel as per-note timing offsets? And when the song is split by role across subagents that never see each other's parts, do the parts still fit together? This was not a designed experiment. It came up as play right after [07](../07-live-toy-midi-tab/README.md), so it is a first data point.

Claims touched in [context.md](../../docs/context.md): none change status yet, because nothing was judged by ear. See the end of this file.

## Setup

The listener named the style ("j dilla inspired mini song") and nothing else. The agent first wrote an 8-bar sketch by itself. Then the listener asked for "longer multi section song with more parts/instruments variations. use subagents to explore idea".

The orchestrating agent read "explore" as a split by role, not as several variants to pick from. Before launching anything, it fixed the shared skeleton in [parts/spec.mjs](parts/spec.mjs): 88 bpm, six sections (intro, verse A, bridge B, breakdown, verse A2, outro, 36 bars), a one-line mood per section, and the chords with voicings and bass roots. Then three subagents each wrote one module against that spec: rhythm section, harmony, and melody. Each prompt translated "Dilla" into concrete targets, such as "snares laid back (about +0.03 to +0.06 beats)", "a long hit plus late stabs", and register bands. Each subagent checked its own output with node and never touched the page or the other parts. [parts/assemble.mjs](parts/assemble.mjs) bundled the modules into one page script.

Playback is toy-midi's in-browser General MIDI synth with its bundled soundfont, including its GS drum kits in bank 128. No input material was given, so nothing was transcribed. The style vocabulary is recalled, and the chord progression is the orchestrator's own.

Reproduce, which replaces every MIDI track and locator in the open project:

```sh
node parts/assemble.mjs ./rhythm.mjs ./harmony.mjs ./melody.mjs > code.js
webmcp-bridge execute-tool toy_midi_eval --arg code=- < code.js
```

## Raw output

- [session.md](session.md): prompts, the three subagent prompts, and the three subagent reports, verbatim
- [sketch.js](sketch.js): the single-agent 8-bar sketch, run as is
- [parts/](parts/): the shared spec and assembler written by the orchestrator, and `rhythm.mjs`, `harmony.mjs`, `melody.mjs` written by the subagents
- [project-state.json](project-state.json): the final project as read from the page, with every note

The scripts were run as written, then reformatted by `pnpm lint`, which also added braces to single-line `if` bodies in `rhythm.mjs` and `melody.mjs`. The reformatted modules produce a byte-identical page script.

## Judgment

The result is "Donut Shop (Dilla Sketch)": 36 bars, about 1:38, 13 tracks, 1,533 notes. It has four drum and percussion tracks across Standard, Brush, and TR-808 kits, two basses, Rhodes, strings, organ, flute hook, vibes, choir chops, and a synth voice swell. The A section loops | Bbmaj9 | Am11 | Dm9 | Gm9 C13 |, and the bridge goes through Gm9, C13sus, Fmaj9, Dbmaj7#11, Gm9, Am7, Bbmaj7, A7#9.

Process:

- **Measured:** form, chords, voicings, and roots were all decided by the orchestrator before the fan-out. The subagents only filled in roles. So this run says nothing about fan-out as exploration, where several variants are generated and one is picked.
- **Measured:** the Dilla idioms were named and turned into numbers by the orchestrator, in its subagent prompts. Examples are drunk kicks, late snares, near-straight hats, ghost notes, a chopped soul sample on Rhodes, vocal chops, and extended neo-soul chords. That makes the subagents' task easier than the style name alone, the same concern [directions.md](../../docs/directions.md#the-adjustment-loop) raises about spec-like prompts.
- **Measured:** the three parts combined without any validity problem. Every note is in range, and the page loaded and played them. Three subagents used 130k tokens in total and finished in 78 to 138 seconds, running in parallel.
- **Inferred:** every part is a generator with seeded randomness, not notes written directly. Humanization, the pattern choice per bar, and the bridge's development of the hook (snapped to each new chord's tones) are all procedures. By the line drawn in 07, the directly written layers are the orchestrator's chords and voicings and the melody agent's 16-beat hook phrase.

Instruction following:

- **Measured:** the 47 backbeat snares in the Standard kit land a median of +0.046 beats late, from +0.031 to +0.059. That is about 31 ms at 88 bpm, inside the +0.03 to +0.06 that was asked for. The number came from the prompt, so this shows feel is writable and carried through, not that the subagent chose it.
- **Measured:** the melody parts were asked to stay mostly in MIDI 67 to 90. The flute sits at 74 to 86, but the choir chops go down to 64, which overlaps the keys at 49 to 69. The melody agent flagged this itself.
- **Measured:** the harmony agent flagged that the Rhodes has fewer hits in verse A2 (90) than in verse A (102), even though verse A2 is meant as the peak. Its random pattern choice landed on sparser patterns, and the extra lift was left to the organ and ghost stabs.

Medium:

- **Measured:** drums and a chord chart got out here, through GM drum note numbers in bank 128 kits and chord names used as labels for hand-chosen voicings. 07 recorded both as ideas that did not get out. **Inferred:** the difference is at least partly the request, because a Dilla beat is drum-led. The `toy_midi_eval` description now lists the bank 128 drum kits. Whether it already did during 07 was not checked.
- **Measured:** each subagent wrote in a small notation it defined on the fly inside its module, an embedded DSL, and then wrote the song in it. In [rhythm.mjs](parts/rhythm.mjs), `kickT`, `snareT`, and `hatT` take a bar and a 16th index and return a time with that instrument's feel built in, such as `snareT = (bar, i) => bar + i / 4 + r(0.03, 0.06)`. A section then reads as usage, for example `brush.add(RIM, snareT(bar, 12), 0.2, 38)` for a rim click on beat 4. In [melody.mjs](parts/melody.mjs), the vocabulary is literal hook phrases (`HOOK_A`) plus operations such as `snapToChord`, which moves a pitch to the nearest tone of the chord under it.
- **Measured:** these vocabularies are rule-level, not literal. One usage line stands for a rule, and the implementation, often with a random draw, decides the exact note. The laid-back snare is one definition applied to every backbeat. The bridge's hook development is a transposition passed through `snapToChord`, so no one chose those notes one by one.
- **Inferred:** the listener's split matches this. The rhythm and harmony, judged grounded, are rule-level in a way that suits them, because a groove's feel is itself a systematic tendency. The melody, judged arbitrary, is where a rule stood in for note choices. See [notation.md](../../docs/notation.md#second-evidence-notations-the-agents-invent-2026-10-11).

Listening:

- **Judged by ear, later:** "rhythm, harmony looks desent grounded but melody feels arbitrary." Followed up in [09-top-layer-dialogue](../09-top-layer-dialogue/README.md).
- **Not judged by ear at first:** the listener's only response was "this is fun", which is about the activity, not a judgment of the music. Open questions for a listen: does the late snare and loose kick feel like Dilla or just sloppy; do the parts written without seeing each other fit, especially the flute against the choir chops and the bass against the kick across tracks; does verse A2 feel like the peak; and does the Dbmaj7#11 detour in the bridge work.

## Effect on claims

- No status changes, because the music has not been judged by ear.
- Fan-out: this is the first run of the role-split form. It shows the split is cheap to run and integrates mechanically when one agent fixes the skeleton first. Whether the result is better than one agent writing every part is untested. The single-agent [sketch.js](sketch.js) is a natural baseline for that comparison, though it is only 8 bars.
- Beat making step 3, feel: per-note timing offsets and velocities are writable in toy-midi's schema and survive to playback, measured on the snare. Whether they read as the intended feel needs a listen.
