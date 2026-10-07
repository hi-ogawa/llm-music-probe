# Notation

What makes musical intent encodable, and presentable by an LLM through a medium. Everything here is a working hypothesis, drawn from one example, Scrimshaw ([breakdown](../experiments/01-scrimshaw-breakdown/README.md)), and from reasoning about how agents work. None of it has been tested yet.

The central hypothesis is that exact syntax matters little, because a capable model can learn and use any reasonable format, and that what matters is whether the medium has room for an idea. If it does not, a probe can fail because the idea could not get out, not because it was missing.

## Scrimshaw's capabilities

What the format can write, from its spec ([composing prompt](../experiments/01-scrimshaw-breakdown/source/composing-prompt.md)), classified by the room test:

- **Core**: gives room for an idea that nothing else in the format can carry
- **Shorthand**: expressible another way in the same format, so it adds no room
- **Coarse**: gives room, but at low resolution
- **Missing**: no way to write it

| Area | Capability | Syntax | Class |
| --- | --- | --- | --- |
| Time | Meter: beats per bar 1 to 16, steps per beat 1 to 12, changeable per pattern | `beats 4` `steps 4`, `pattern X steps=3` | Core |
| Time | Duration on the step grid, rests, ties across bars | `D5---`, `.---`, lone `-` | Core |
| Time | Tempo, fixed per pattern | `tempo 100` | Core |
| Time | Swing, one value delaying every other step | `swing 0.12` | Coarse |
| Time | Tuplets off the grid, per-note timing offsets, tempo curves | none | Missing |
| Pitch | Note name with accidentals and octave, 12-tone equal temperament | `F#4`, `Bbb3` | Core |
| Pitch | Simultaneous notes, so explicit voicings | `C4+E4+G4` | Core |
| Pitch | Chord names voiced near a center, optional slash bass | `[Dm7]`, `[C/E]`, `center=A4` | Shorthand |
| Pitch | Voice-wide transposition | `oct=-1`, `trans=3` | Shorthand |
| Pitch | Slide into a note | `~A2`, `glide=0.1` | Coarse |
| Pitch | Bends, vibrato, microtones | none | Missing |
| Dynamics | Per-note accent or softening, stackable | `D5!!`, `A2??` | Coarse |
| Dynamics | Crescendo, hairpins, continuous velocity | none, approximated by stepping marks | Missing |
| Articulation | Note length as a fraction, per voice only | `gate=0.5` | Coarse |
| Articulation | Per-note staccato, legato, and instrument-specific marks such as tab, bowing, pedal | none | Missing |
| Drums | One sound per lane, hit, accent, or ghost per step | `x..X ..o.` | Core |
| Timbre | Instrument from a fixed list of about 60 | `voice lead flute` | Core |
| Timbre | Static level, pan, reverb, brightness, attack, release per voice | `vol=0.8 pan=-0.3 bright=1.5` | Coarse |
| Timbre | Parameter changes over time | none | Missing |
| Form | Patterns, copy-and-override, mute, repeat, transposed repeat, bar repeat, silent and held bars | `pattern A2 from A`, `B*2`, `A+2`, `%`, `_`, `=` | Shorthand |
| Form | Intro played once, then a loop | `play intro`, `loop A B` | Shorthand |
| Intent | Title, description, comments | `about ...`, `# ...` | Core |

Comments count as core because they are the only place to state why, and nothing else in the format carries it. Lyrics and vocals are missing entirely.

## Candidate principles

### Reuse notation that already exists as text

The model's musical vocabulary was learned from what people write down: chord symbols, note names with octaves, roman numerals, drum grids, tab, lead sheets, ABC tunes, tracker files. A notation close to those taps that vocabulary directly. Scrimshaw's model designed its own format and chose exactly this, which suggests the model knows where its vocabulary lives.

### Let the level of abstraction match the intent

An abstract symbol delegates the decision to the renderer. `[Dm]` says "D minor here" and leaves the voicing to a default. That is right when the voicing does not matter, and wrong when it is the idea. A notation should let the writer stay abstract or become concrete per spot, for example a chord name with an optional explicit realization. Scrimshaw allows both (`[Dm]` or `D3+F3+A3+C4`), but its six tracks mostly used names, which is why voicing was not shown.

### Make time visible and alignable

Writing duration as token length on a step grid makes rhythm countable and lets parts line up bar by bar, like a tracker or drum tab. The cost is counting errors, which were Scrimshaw's most common failure. That cost belongs to execution, so a validator in the loop handles it. It does not limit what ideas can be expressed.

### Express feel in words a musician would use, with numbers available

Expression can be named ("accent", "ghost note", "slide", "laid back", "swing") or numeric (velocity 0 to 127, a timing offset in milliseconds). Named marks match how musicians talk and how the vocabulary was learned. Numbers match how a DAW stores it. A useful notation probably accepts named marks and lets numbers be written where precision is the point. Scrimshaw only has named marks and one global swing value, which is the main reason groove could not show up.

### Keep the intent next to the notes

Scrimshaw's comments carry the model's reasons inline: "the standoff: both duellists circle, nobody blinks". That makes a score reviewable by a human, because the reader sees the what and the why together. It is also the closest thing to the "narrated music" data the original discussion said was scarce.

### Allow instrument-specific detail

Some intent only exists for one instrument. Tab carries string and fret, which encode playability and hand position. Other examples are bowing, breath marks, and pedaling. These should be optional layers on top of the shared notation.

## Rejected candidates

These looked like principles at first because Scrimshaw has them, but by our reasoning they fail the test of whether a feature gives the medium room for an idea it could not otherwise carry.

- **Give each layer of decision its own words.** The example was `pattern A2 from A` for "A with a counter-line". Only `from` is notation, and it means copy A's voices and let voices written in A2 replace or add parts. "With a counter-line" comes from a comment. So the functional part is copy-and-override, and it is rejected for the reason below.
- **Make repetition and variation first-class.** Copy-and-override, `%`, `*2`, and transposition add no room for any idea, because a flat note list expresses exactly the same music. What they do provide is cheap repetition and editing: write a variation without rewriting the whole part. But a modern agent already gets that from its harness. It copies blocks, transforms parts with scripts, and edits one passage surgically, the same way it iterates on one large HTML file for an image or animation. So the harness already covers what the feature offers, and the feature adds nothing to what the model can present.

## Open questions

- Should the model write in passes, from a chart to a realization, the way musicians often do, or in one notation that mixes levels?
  - Working hypothesis: writing order does not matter. A capable agent drafts, edits surgically, and rewrites with scripts, the same way it iterates on one large HTML file for an image or animation. Simon's transcript shows the same pattern: tracks written, checked, then edited in place. The order of writing is a workflow detail, not a property of the medium.
- One notation with optional layers, or separate notations per layer (a chart, a part, an expression track) that refer to each other?
- How much should a renderer decide by default, and how should a score say "this part is deliberate, do not change it"?
- Does intent survive translation between notations? If the same idea comes out well in several notations, the intuition sits above any one of them.
