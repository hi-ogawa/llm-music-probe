# Tool plan

Our own small, readable tool for turning a text score into sound, so experiments run on code we understand and can change. It is written from scratch, not ported from Scrimshaw Jukebox.

## Goal

Text score → note events → MIDI file → WAV.

- The note events are the core. Once a score is a list of events, everything else is plumbing, and new notation ideas from the Coarse and Missing rows in [notation.md](notation.md) become new fields on an event.
- MIDI export makes the output open in a DAW or toy-midi, so the model's output can be opened, edited, and played in real tools.
- Rendering uses `fluidsynth` with the FluidR3 General MIDI soundfont, both already installed. There is no synth code of our own. Timbre is plainer than Scrimshaw's, which is fine because timbre is not what we study.

## Non-goals

- A browser player, editor, or visual UI
- Matching Scrimshaw's sound
- A final notation design. The syntax starts Scrimshaw-compatible and is expected to change.

## Pipeline

1. **Parse.** Read settings, voices, patterns, and the arrangement. Report errors with line numbers, especially bars whose step count is wrong.
2. **Expand.** Resolve shorthand into plain events: `from`, `mute`, `%`, `_`, `=`, `*n`, `+n`, chord names, and per-pattern settings. Play the `play` section once, then the `loop` section a configurable number of times.
3. **Events.** Each note event has voice, start and duration in beats, MIDI pitch, and a dynamic level. Tempo and meter changes are kept as separate lists in beats, so the bar grid survives into MIDI. Velocity is decided at MIDI export.
4. **MIDI.** One track and channel per voice, with a General MIDI program from an instrument map. Drum voices go to channel 10 with General MIDI percussion note numbers. Tempo is written as tempo events.
5. **Render.** Run `fluidsynth` on the MIDI file to produce a WAV.

## Syntax scope for the first milestone

The six Scrimshaw tracks are the test fixtures, so the first milestone covers what they use.

| Feature                                                    | Handling                                                                                                                                                                                               |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `title`, `composer`, `about`, comments                     | Kept as metadata                                                                                                                                                                                       |
| `tempo`, `beats`, `steps`, `swing`, global and per pattern | Implemented. Swing delays every other step by a fraction of a step                                                                                                                                     |
| Notes, rests, ties, `+` stacks                             | Implemented                                                                                                                                                                                            |
| Chord names and slash bass                                 | Voiced near `center` with a simple close-position rule, written down in the code                                                                                                                       |
| `!` and `?`                                                | Fixed velocity steps from a base level                                                                                                                                                                 |
| `gate`                                                     | Shortens note duration                                                                                                                                                                                 |
| `vol`, `pan`                                               | MIDI channel volume and pan                                                                                                                                                                            |
| `oct`, `trans`                                             | Implemented                                                                                                                                                                                            |
| `~` slide, `glide`                                         | Parsed and ignored at first. General MIDI can express them as pitch bend with the bend range set through RPN 0, which `fluidsynth` renders, so this is a gap in our export rather than in General MIDI |
| `rev`, `reverb`                                            | Parsed and ignored at first. General MIDI can express them as the CC91 reverb send, and `fluidsynth` has reverb built in                                                                               |
| `bright`, `att`, `rel`                                     | Parsed and ignored. Their MIDI controllers (CC74, CC73, CC72) are not among the SoundFont default modulators, so most soundfonts ignore them                                                           |
| Drum lanes `x X o .`                                       | Three velocity levels                                                                                                                                                                                  |
| Instruments                                                | Mapped to the nearest General MIDI program or percussion note                                                                                                                                          |

## Stack

- TypeScript on Node, matching toy-midi and other repositories
- `vitest` for tests
- MIDI writing by a small library such as `midi-file`, or a hand-written Standard MIDI File writer if that stays short
- A CLI: `render <score> -o <out.wav>`, with options for loop count and writing the `.mid` or the event JSON alongside

## Tests

- All six tracks parse with no errors.
- A deliberately miscounted bar reports the right line and step count.
- Small hand-written scores check expansion: `from`, `%`, `*n`, `+n`, swing, ties across bars, and chord voicing.

## Milestones

1. Parser and expansion to events, with tests on the six tracks
2. MIDI export, checked by opening a track in a DAW or toy-midi
3. WAV render through `fluidsynth`, checked by ear on all six tracks

## Decisions made in the first version

- Velocity is 90 at level 0, plus 18 per `!` and minus 18 per `?`, scaled by `vol` relative to its default of 0.8, and clamped to 1 to 127. Drum `o`, `x`, and `X` are levels -2, 0, and 2.
- Chord names are voiced in close position, with each tone placed from 6 semitones below `center` to 5 above, and a slash bass below the lowest tone.
- The loop plays once by default, and `--loops` changes it.
- Drum voices share MIDI channel 10, so they have no pan of their own.
- `thunder` and `surf` play General MIDI Seashore, held for 8 beats, because General MIDI has no thunder or surf.
- fluidsynth renders at gain 0.5, which peaks between about 0.4 and 0.7 on the six Scrimshaw tracks.
