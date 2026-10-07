# Notation

What makes musical intent encodable, and presentable by an LLM through a medium. The exact syntax does not matter much: a capable model learns any reasonable variant from a short spec, as Scrimshaw's composing prompt shows. When a medium lacks room for an idea, a probe can fail because the idea could not get out, not because it was missing. Scrimshaw ([breakdown](../experiments/01-scrimshaw-breakdown/README.md)) is the main example so far.

## Principle

### The medium needs room for the idea

If a medium has no way to write something, the model cannot present it, even if it has the intuition. Scrimshaw's six tracks used chord names voiced by the renderer, so voicing had no way out, and one global swing value left no way to write groove.

## Observations from Scrimshaw's design

These describe how one format, designed by the model for its own build, was laid out. They are untested as requirements.

- It stays close to notation that already exists as text: chord symbols, note names with octaves, drum grids. This may tap learned vocabulary directly, or it may just be convenient.
- Each layer of decision has its own construct: `pattern A2 from A` for form, chord names for harmony, note tokens, drum lanes, accent marks, voice declarations.
- Time is a step grid where duration is token length, so parts align bar by bar. Its most common failure was miscounted bars, which a validator caught.
- Repetition and variation are first-class: `%`, `from`, `*2`, `+2`.
- Expression is named marks only (accent, ghost, slide) plus one global swing value.
- Comments carry the model's intent next to the notes: "the standoff: both duellists circle, nobody blinks".
- Chord names and explicit note stacks can both be written, so abstraction can be chosen per spot, but the tracks mostly used names.

## Open questions

- Should the model write in passes, from a chart to a realization, the way musicians often do, or in one notation that mixes levels?
  - Working hypothesis: writing order does not matter. A capable agent drafts, edits surgically, and rewrites with scripts, the same way it iterates on one large HTML file for an image or animation. Simon's transcript shows the same pattern: tracks written, checked, then edited in place. The order of writing is a workflow detail, not a property of the medium.
- One notation with optional layers, or separate notations per layer (a chart, a part, an expression track) that refer to each other?
- How much should a renderer decide by default, and how should a score say "this part is deliberate, do not change it"?
- Does intent survive translation between notations? If the same idea comes out well in several notations, the intuition sits above any one of them.
