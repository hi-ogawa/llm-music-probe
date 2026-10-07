# Notation

What makes musical intent encodable, and presentable by an LLM through a medium. The exact syntax does not matter much: a capable model learns any reasonable variant from a short spec, as Scrimshaw's composing prompt shows. This note is about the properties that let the model present the idea it has, across variants. When a medium lacks them, a probe can fail because the idea could not get out, not because it was missing. Scrimshaw ([breakdown](../experiments/01-scrimshaw-breakdown/README.md)) is the main example so far.

## Principles

### Reuse notation that already exists as text

The model's musical vocabulary was learned from what people write down: chord symbols, note names with octaves, roman numerals, drum grids, tab, lead sheets, ABC tunes, tracker files. A notation close to those taps that vocabulary directly. Scrimshaw's model designed its own format and chose exactly this, which suggests the model knows where its vocabulary lives.

### Give each layer of decision its own words

Musicians decide in layers: form, harmony, line, rhythm, expression, orchestration. When each layer has its own construct, the model can state an idea at the layer where it lives. "A2 is A with a counter-line" is one line of form, not a rewrite of every note. Scrimshaw does this with `pattern A2 from A`, chord names, note tokens, drum lanes, accent marks, and voice declarations.

### Let the level of abstraction match the intent

An abstract symbol delegates the decision to the renderer. `[Dm]` says "D minor here" and leaves the voicing to a default. That is right when the voicing does not matter, and wrong when it is the idea. A notation should let the writer stay abstract or become concrete per spot, for example a chord name with an optional explicit realization. Scrimshaw allows both (`[Dm]` or `D3+F3+A3+C4`), but its six tracks mostly used names, which is why voicing was not shown.

### Make time visible and alignable

Writing duration as token length on a step grid makes rhythm countable and lets parts line up bar by bar, like a tracker or drum tab. The cost is counting errors, which were Scrimshaw's most common failure. That cost belongs to execution, so a validator in the loop handles it. It does not limit what ideas can be expressed.

### Make repetition and variation first-class

Music is mostly repetition with variation. Constructs for repeat, copy-and-modify, and transposition keep scores short and mirror how musicians think about form. Scrimshaw has `%`, `from`, `*2`, and `+2`.

### Express feel in words a musician would use, with numbers available

Expression can be named ("accent", "ghost note", "slide", "laid back", "swing") or numeric (velocity 0 to 127, a timing offset in milliseconds). Named marks match how musicians talk and how the vocabulary was learned. Numbers match how a DAW stores it. A useful notation probably accepts named marks and lets numbers be written where precision is the point. Scrimshaw only has named marks and one global swing value, which is the main reason groove could not show up.

### Keep the intent next to the notes

Scrimshaw's comments carry the model's reasons inline: "the standoff: both duellists circle, nobody blinks". That makes a score reviewable by a human, because the reader sees the what and the why together. It is also the closest thing to the "narrated music" data the original discussion said was scarce.

### Allow instrument-specific detail

Some intent only exists for one instrument. Tab carries string and fret, which encode playability and hand position. Other examples are bowing, breath marks, and pedaling. These should be optional layers on top of the shared notation.

## Open questions

- Should the model write in passes, from a chart to a realization, the way musicians often do, or in one notation that mixes levels?
- One notation with optional layers, or separate notations per layer (a chart, a part, an expression track) that refer to each other?
- How much should a renderer decide by default, and how should a score say "this part is deliberate, do not change it"?
- Does intent survive translation between notations? If the same idea comes out well in several notations, the intuition sits above any one of them.
