# Notation

What makes musical intent encodable, and presentable by an LLM through a medium. Everything here is a working hypothesis, drawn from one example, Scrimshaw ([breakdown](../experiments/01-scrimshaw-breakdown/README.md)), and from reasoning about how agents work. None of it had been tested until [07-live-toy-midi-tab](../experiments/07-live-toy-midi-tab/README.md), which gives the central hypothesis its first data point, below, and 08 and 09 add a second on notations the agents invent.

The central hypothesis is that exact syntax matters little, because a capable model can learn and use any reasonable format, and that what matters is whether the medium has room for an idea. If it does not, a probe can fail because the idea could not get out, not because it was missing.

A renderer default is where room is lost most easily, as with chord names voiced by Scrimshaw's renderer. So every decision that can carry intent should be writable explicitly, with defaults applying only where the score says nothing. An explicit value is then deliberate by definition, and no separate "do not change this" mark is needed.

Whether intent survives translation between notations is a question about the model rather than the notation, so it lives in [directions.md](directions.md) as "Robustness across notations".

## First evidence: writing into a schema (2026-10-10)

In [07-live-toy-midi-tab](../experiments/07-live-toy-midi-tab/README.md), the agent composed straight into toy-midi's project model, which is not a notation: MIDI numbers, beats as decimals, and one object per note. It wrote no score. What it wrote instead, in the script ([session.md](../experiments/07-live-toy-midi-tab/session.md)), had four layers, each symbolic to a different degree:

- **Chart and form:** chord names per bar in arrays, the second pass as an array spread, and the ending as an override. This is the only layer that looks like a notation.
- **Voicings:** MIDI numbers in a table keyed by chord name. The name is a label, not parsed, so the voicing was chosen without any chord-symbol rule.
- **Melody:** `[beat, length, MIDI pitch]` triples, with no note names anywhere.
- **Bass:** a rule over the chart's roots, as root, root, fifth, octave, and an approach from below. It is the most abstract layer, because it states the idea itself.

Measured: there was almost no step converting a notation into the schema, because the agent wrote the schema's numbers directly. Where it abstracted, it did so as code, not as a text notation.

This supports the central hypothesis. Syntax mattered little, because the agent was fluent in a raw numeric schema it had never used. Room decided what got out: tab had a field and was written, while drums and pan had none and were not. Intent such as the chord chart and the reasons behind choices existed in the script, but the project has no place to keep it, which is the Intent row's core room missing. The harness covered repetition and variation, as the rejected candidates below argue.

It does not show that intent survives as well as in a score, because the piece was not judged by ear. That comparison, the same brief written as a score and into the schema, belongs to "Robustness across notations" in [directions.md](directions.md).

What counts as intuition here is not symbols against numbers. The tab passes were not intuition because a procedure the agent wrote stood between the intent and the output, first a search and then a recalled rule run as code. By that criterion the layers of the piece split differently from how they look:

| Layer             | Written as                                 | Kind                               |
| ----------------- | ------------------------------------------ | ---------------------------------- |
| Chord progression | Chord names, generated directly            | Direct, in symbols                 |
| Voicings          | MIDI numbers per chord, generated directly | Direct, in numbers                 |
| Melody            | MIDI numbers per note, with no rule        | Direct, in numbers                 |
| Bass              | A rule over the chart                      | Procedure, like the final tab pass |
| Tab               | A search, then a recalled rule             | Procedure                          |

So the raw numbers are not evidence against intuition. The melody and voicings are the direct kind, and the bass and tab are where a procedure stood in.

Measured from [project-state.json](../experiments/07-live-toy-midi-tab/project-state.json): every voicing holds exactly its chord's pitch classes, and every melody note is in D major. The only notes outside the key are the bass's chromatic approaches, which its rule intends. The one error was in register, the bass an octave high, not in pitch class.

Inferred: this fits the reading that the model's pitch knowledge sits above any one encoding and projects into note names, chord symbols, or MIDI numbers alike, the way a musician's knowledge projects onto staff, fretboard, solfège, and ear. The projection into numbers was clean for pitch class and slipped only on octave, which is a +12 offset in numbers but explicit in a note name such as G2. The agent's own account of whether it converted names to numbers or worked in numbers is not evidence about the mechanism, so this stays an inference until the robustness probe tests it.

Two nuances:

- **Scripting gives room, but also a way around it.** The tab first went through a generic fingering search instead of the bassist's box shape the model knew. Once written as a rule, the named rule came through. So a schema plus scripting can carry an idea, or replace it with a generic algorithm. Both are still solvers, though. Tab exists in training data as ASCII tab, not as a string field on note objects, so whatever fingering intuition the model absorbed from reading tab would come out in that text form, which the schema does not offer. This is the candidate principle below, reuse notation that already exists as text, applied to tab.
- **Inferred, weak: raw numbers may cost legibility.** The bass was written an octave higher than the agent would have chosen, and the slip sits in `ROOT.Gmaj7 = 43`, where a note name such as G2 would have shown the register. One run cannot separate this from carelessness. It bears on the candidate principle below, reuse notation that already exists as text.

## Second evidence: notations the agents invent (2026-10-11)

[08-dilla-role-fan-out](../experiments/08-dilla-role-fan-out/README.md) and [09-top-layer-dialogue](../experiments/09-top-layer-dialogue/README.md) suggest a correction to the 07 reading above. "Where it abstracted, it did so as code, not as a text notation" draws the wrong line. An agent that abstracts in code is defining a notation: a vocabulary of helpers, written on the fly, and then the music written in that vocabulary. It is an embedded DSL, and its implementation sits in the same script.

In 08, the rhythm subagent defined `snareT = (bar, i) => bar + i / 4 + r(0.03, 0.06)`, with `kickT` and `hatT` alongside, and then wrote sections as usage, such as `brush.add(RIM, snareT(bar, 12), 0.2, 38)`. The melody subagent defined literal hook phrases and a `snapToChord` operation. In 09, the orchestrating agent designed an external text notation with its own parser, one line per note, such as `5 2&+0.07 F5 3/4 84`.

The distinction that matters is not code against text, or numbers against names. It is the level of the vocabulary:

- **Rule-level:** a primitive stands for a rule, and its implementation decides the note, often with a random draw. `snareT(bar, 12)` means "the snare on beat 4, laid back", and the exact time is drawn from a range. This is the same thing 07's table calls a procedure, such as its bass rule.
- **Literal:** one statement is one note. Feel is written out per note, for example as an offset.

What reached the ear:

- **Judged by ear:** in 08, the rhythm and harmony felt grounded, and the melody felt arbitrary.
- **Inferred:** rule-level fits groove, because a feel such as "snares lay back about 30 ms" is a systematic tendency, so writing it once as a definition loses nothing. It does not fit melody, because each note of a line is a choice, and a rule such as snapping a transposed phrase to the next chord makes notes no one chose. This refines the 07 criterion. A procedure between intent and output is not always a loss of intent, because for some layers the rule is the intent.
- **Judged by the listener, by looking:** the literal rewrite in 09 "didn't explore much". Moving to a literal notation did not by itself make the melody less arbitrary. 08 to 09 also changed numbers to note names and the notation's author, so one run cannot separate these.
- **Inferred:** the notation also shapes the discussion. 09's producers read a bar-by-bar summary in the same vocabulary and argued in it, as in "The trumpet's C5-A4 starts on 2& and the A4 ends at about 3e".

### Groove against humanize

08's timing helpers rebuild two DAW features that are usually separate. In general DAW practice, not checked against sources here:

| DAW feature                                                                     | What it does                                         | In 08's helpers                                                          |
| ------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| Groove template or swing quantize, such as MPC swing or Ableton's groove pool   | A systematic offset, the same push or drag each time | Odd 16ths pushed 0.05 to 0.085 beats late, snares always behind the beat |
| Humanize or randomize, such as Logic's Humanize transform or Cubase's randomize | Random scatter around the grid                       | The `r(-0.008, 0.008)` jitter on hats, and kicks drawn early or late     |

`snareT = (bar, i) => bar + i / 4 + r(0.03, 0.06)` is both in one expression: a mean drag of +0.045 beats, which is the groove, and ±0.015 of scatter, which is the humanize.

- **Measured:** the systematic offsets came from the prompt, which asked for snares "about +0.03 to +0.06 beats" late. The jitter amounts were the subagent's own.
- **Inferred, from producer lore rather than evidence here:** Dilla's feel is usually credited to playing an MPC with quantize off, so the drift came from his hands, and such deviations are systematic and correlated with the music. Pure random humanize has a reputation for not sounding human, because players do not scatter at random. If so, the feel in 08 rests on the systematic part, and the jitter is closer to the generic DAW function producers often find unconvincing. Not tested by ear: the same drums with the jitter removed would separate them.
- **Inferred:** the [DAW practice section](#performance-techniques-from-daw-practice) below frames a performance gap as closed either by notation the model writes or by an automatic pass at export. The agents took a third route. They wrote the pass themselves, inside the notation, and tuned it per part and per instrument.

This does not revive the rejected candidate "let the level of abstraction match the intent", which was about room. A rule-level and a literal notation can write the same notes, so neither adds room. The level decides where each note gets chosen: by the writer, or by a rule's implementation. That bears on what a probe can call intuition.

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

## Performance techniques from DAW practice

How a DAW user makes a programmed line sound played, compared with what our format can write and what our General MIDI render through fluidsynth can play. From general knowledge of DAW practice and the SoundFont default modulators, not checked against sources. Every technique here can be rendered by the current setup, so each gap is in the format, not in General MIDI. A gap can be closed by adding notation the model writes, or by an automatic pass at export, the way a DAW's humanize and legato functions work. In 08 the agents also wrote such a pass themselves, as part of their own notation, described in [groove against humanize](#groove-against-humanize).

| Technique                                                    | Why it matters                                                                                                                        | Our format                                         | Renderable                                                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Velocity shaped across a phrase, never identical repeats     | Flat velocities sound mechanical                                                                                                      | Coarse: `!` and `?`, three levels, written by hand | Yes                                                                                         |
| Expression swells (CC11) and dynamics on held notes          | Velocity shapes only the attack, so a held wind, brass, or string note without CC sounds static                                       | None                                               | Yes, CC11 is a default modulator                                                            |
| Legato overlap or detached length, per note                  | Connected versus separated lines, and breath gaps for winds                                                                           | One `gate` per voice                               | Partly. Overlap connects the sound, but General MIDI patches have no true legato transition |
| Vibrato through the mod wheel (CC1)                          | Life on long notes, often with delayed onset                                                                                          | None                                               | Yes, CC1 drives vibrato by default                                                          |
| Pitch bend for scoops, falls, and slides                     | Idiom for sax, guitar, and bass                                                                                                       | `~` parsed, not rendered                           | Yes, with the bend range set by RPN 0                                                       |
| Sustain pedal (CC64)                                         | Piano resonance. Several sweep scores split the piano's left hand into voices to fake it                                              | None                                               | Yes                                                                                         |
| Micro-timing: pushing, laying back, small humanizing offsets | Feel per part. 08's agents wrote it as systematic offsets plus random jitter, see [groove against humanize](#groove-against-humanize) | One `swing` value per pattern                      | Yes                                                                                         |
| Articulation switching: staccato, marcato, legato patches    | Realism in sample libraries                                                                                                           | None                                               | Barely. General MIDI only has separate programs, such as `pizz` versus `strings`            |

Hypothesis from the range sweep judgment: lines meant to be heard as lines sound awkward while harmony-driven figures sound reasonable, because sustained lines depend on the first three rows and short, attack-driven figures do not.

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
- **Write in passes, from a chart to a realization, the way musicians often do.** Writing order does not matter. A capable agent drafts, edits surgically, and rewrites with scripts, the same way it iterates on one large HTML file for an image or animation. Simon's transcript shows the same pattern: tracks written, checked, then edited in place. The order of writing is a workflow detail, not a property of the medium.
- **Split the notation into separate layers that refer to each other, such as a chart, a part, and an expression track.** Splitting adds no room for any idea, because the same content fits in one notation, and an agent works across several files as easily as one. Like writing order, it is a workflow detail.
