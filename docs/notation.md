# Notation

What makes musical intent encodable, and presentable by an LLM through a medium. Everything here is a working hypothesis, drawn from one example, Scrimshaw ([breakdown](../experiments/01-scrimshaw-breakdown/README.md)), and from reasoning about how agents work. None of it has been tested yet.

The central hypothesis is that exact syntax matters little, because a capable model can learn and use any reasonable format, and that what matters is whether the medium has room for an idea. If it does not, a probe can fail because the idea could not get out, not because it was missing.

## Scrimshaw's capabilities

What the format can write, from its spec ([composing prompt](../experiments/01-scrimshaw-breakdown/source/composing-prompt.md)), classified by the room test:

- **Core**: gives room for an idea that nothing else in the format can carry
- **Shorthand**: expressible another way in the same format, so it adds no room
- **Coarse**: gives room, but at low resolution
- **Missing**: no way to write it

| Area         | Capability                                                                                     | Syntax                                           | Class     |
| ------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------- |
| Time         | Meter: beats per bar 1 to 16, steps per beat 1 to 12, changeable per pattern                   | `beats 4` `steps 4`, `pattern X steps=3`         | Core      |
| Time         | Duration on the step grid, rests, ties across bars                                             | `D5---`, `.---`, lone `-`                        | Core      |
| Time         | Tempo, fixed per pattern                                                                       | `tempo 100`                                      | Core      |
| Time         | Swing, one value delaying every other step                                                     | `swing 0.12`                                     | Coarse    |
| Time         | Tuplets off the grid, per-note timing offsets, tempo curves                                    | none                                             | Missing   |
| Pitch        | Note name with accidentals and octave, 12-tone equal temperament                               | `F#4`, `Bbb3`                                    | Core      |
| Pitch        | Simultaneous notes, so explicit voicings                                                       | `C4+E4+G4`                                       | Core      |
| Pitch        | Chord names voiced near a center, optional slash bass                                          | `[Dm7]`, `[C/E]`, `center=A4`                    | Shorthand |
| Pitch        | Voice-wide transposition                                                                       | `oct=-1`, `trans=3`                              | Shorthand |
| Pitch        | Slide into a note                                                                              | `~A2`, `glide=0.1`                               | Coarse    |
| Pitch        | Bends, vibrato, microtones                                                                     | none                                             | Missing   |
| Dynamics     | Per-note accent or softening, stackable                                                        | `D5!!`, `A2??`                                   | Coarse    |
| Dynamics     | Crescendo, hairpins, continuous velocity                                                       | none, approximated by stepping marks             | Missing   |
| Articulation | Note length as a fraction, per voice only                                                      | `gate=0.5`                                       | Coarse    |
| Articulation | Per-note staccato, legato, and instrument-specific marks such as tab, bowing, pedal            | none                                             | Missing   |
| Drums        | One sound per lane, hit, accent, or ghost per step                                             | `x..X ..o.`                                      | Core      |
| Timbre       | Instrument from a fixed list of about 60                                                       | `voice lead flute`                               | Core      |
| Timbre       | Static level, pan, reverb, brightness, attack, release per voice                               | `vol=0.8 pan=-0.3 bright=1.5`                    | Coarse    |
| Timbre       | Parameter changes over time                                                                    | none                                             | Missing   |
| Form         | Patterns, copy-and-override, mute, repeat, transposed repeat, bar repeat, silent and held bars | `pattern A2 from A`, `B*2`, `A+2`, `%`, `_`, `=` | Shorthand |
| Form         | Intro played once, then a loop                                                                 | `play intro`, `loop A B`                         | Shorthand |
| Intent       | Title, description, comments                                                                   | `about ...`, `# ...`                             | Core      |

Comments count as core because they are the only place to state why, and nothing else in the format carries it. Lyrics and vocals are missing entirely.

## What a richer medium would need

From the Coarse and Missing rows, the ideas Scrimshaw has no room for:

- Feel and groove: per-note timing offsets, tuplets, tempo curves
- Phrasing: continuous dynamics, per-note articulation
- Instrument idiom: tab, bowing, pedaling, bends, vibrato
- Sound over time: parameter changes such as a filter sweep
- Vocals and lyrics

## Candidate principles

### Reuse notation that already exists as text

The model's musical vocabulary was learned from what people write down: chord symbols, note names with octaves, roman numerals, drum grids, tab, lead sheets, ABC tunes, tracker files. A notation close to those taps that vocabulary directly. Scrimshaw's model designed its own format and chose exactly this, which suggests the model knows where its vocabulary lives. This is in tension with the central hypothesis that any reasonable format works, which is what makes it worth testing.

## Rejected candidates

These looked like principles at first, but they fail as independent principles. Either they add no room for an idea, or they restate the room test for one area, which the capability table already covers.

- **Give each layer of decision its own words.** The example was `pattern A2 from A` for "A with a counter-line". Only `from` is notation, and it means copy A's voices and let voices written in A2 replace or add parts. "With a counter-line" comes from a comment. So the functional part is copy-and-override, and it is rejected for the reason below.
- **Make repetition and variation first-class.** Copy-and-override, `%`, `*2`, and transposition add no room for any idea, because a flat note list expresses exactly the same music. What they do provide is cheap repetition and editing: write a variation without rewriting the whole part. But a modern agent already gets that from its harness. It copies blocks, transforms parts with scripts, and edits one passage surgically, the same way it iterates on one large HTML file for an image or animation. So the harness already covers what the feature offers, and the feature adds nothing to what the model can present.
- **Let the level of abstraction match the intent.** The point was that `[Dm]` hands the voicing to the renderer, while `D3+F3+A3+C4` keeps it. That is the room test applied to voicing. In the table, chord names are shorthand because explicit stacks carry the same thing, so choosing the abstraction level adds nothing beyond the table.
- **Make time visible and alignable.** The useful part is room for timing, which the Time rows cover. "Visible and alignable" is about how easy the format is to write, so it falls to the same harness argument as repetition and variation. A validator catches miscounted bars, and the model's composing prompt warned that a miscounted bar is "the most common mistake", though the transcript shows none in the final tracks.
- **Express feel in words a musician would use, with numbers available.** Room for feel is real, and it is the Coarse and Missing rows for swing, dynamics, and timing. Preferring named marks such as "laid back" over numbers is a syntax claim with no support.
- **Keep the intent next to the notes.** The Intent row covers this. The original argument was that a human can review the what and the why together, which is the human-facing angle, not whether the model can present an idea.
- **Allow instrument-specific detail.** Tab, bowing, and pedaling are the room test applied to instrument idiom, and the Missing rows cover them.

## Open questions

- Should the model write in passes, from a chart to a realization, the way musicians often do, or in one notation that mixes levels?
  - Working hypothesis: writing order does not matter. A capable agent drafts, edits surgically, and rewrites with scripts, the same way it iterates on one large HTML file for an image or animation. Simon's transcript shows the same pattern: tracks written, checked, then edited in place. The order of writing is a workflow detail, not a property of the medium.
- One notation with optional layers, or separate notations per layer (a chart, a part, an expression track) that refer to each other?
  - Working hypothesis: it does not matter for presenting ideas. Splitting into layers or files adds no room for any idea, because the same content fits in one notation, and an agent works across several files as easily as one. Like writing order, it is a workflow detail.
- How much should a renderer decide by default, and how should a score say "this part is deliberate, do not change it"?
  - Working hypothesis: a renderer default is exactly where room is lost, as with chord names voiced by Scrimshaw's renderer. Every decision that can carry intent should be writable explicitly, and defaults should apply only where the score says nothing. An explicit value is then deliberate by definition, so no separate mark is needed.
- Does intent survive translation between notations? If the same idea comes out well in several notations, the intuition sits above any one of them.
  - Moved: this asks about the model rather than the notation, and it is now the "Robustness across notations" direction in [directions.md](directions.md).
