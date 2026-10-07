# 01-scrimshaw-breakdown

- Direction: baseline for all of [directions.md](../../docs/directions.md)
- Date: 2026-10-07
- Model ID: Claude Opus 5.5, as stated in the post
- Output format: Scrimshaw score format

## Question

How does Scrimshaw Jukebox encode musical ideas as text, and which musical vocabulary did the model actually write through it? Quality is taken as given, because it was judged by ear. The interest is in the encoding.

## Setup

Source: [tools.simonwillison.net/scrimshaw-jukebox](https://tools.simonwillison.net/scrimshaw-jukebox). The six scores and the composing prompt are copied verbatim into [source/](source/). The [shared conversation](https://claude.ai/share/1f721c20-2499-4d23-b368-3ab57146d956) is saved locally in `.tmp/simon-claude.txt`, which is not committed.

What the conversation shows about the process:

- The whole request was one prompt: design a simple text format, build a player, include example tracks, at "the quality of the original Secret of Monkey Island". Simon gave no musical direction, so every idiom below is the model's own choice.
- The model designed the format itself, in the same turn, before writing any music.
- It composed the tracks one after another in a single pass. The composing prompt on the page was written afterwards, as part of the page.
- There was a closed loop, but it was not about music. The model rendered offline in headless Chromium, calibrated instrument loudness, checked clipping and balance, and ran a "harmony audit" that flagged sustained lead notes a semitone away from other voices. That audit "caught and fixed a few typos". The model stated plainly: "I couldn't listen to any of it."
- A follow-up asked for "a space opera style dance track" as pasteable text. It returned Starlight Armada, also checked by parser, clash check, and render before handing it over.

## The format as an encoding

The format is close to notations that already exist as text in the world: chord charts, scientific pitch names, drum grids from tab and trackers. Each layer of a musical decision has its own word:

| Layer | How it is written | Example |
| --- | --- | --- |
| Form | named patterns, variation by copying, an arrangement line | `pattern A2 from A`, `play intro`, `loop A A2 B*2 A2+2` |
| Harmony | chord names, voiced automatically near `center` | `[Dm]`, `[A7sus4]`, `[C/E]` |
| Pitch | note name and octave, stacked with `+` | `D5`, `C4+E4+G4` |
| Rhythm | step grid, so duration is token length | `A4-- D5-- F5- E5` |
| Drums | one character per step | `x..x ..x. ..x. x...` |
| Expression | coarse accents, slides, gate, global swing | `D5!!`, `~A2`, `gate=0.45`, `swing 0.12` |
| Orchestration | instrument name and mix settings per voice | `voice pan steeldrum vol=1.15 pan=-0.15` |

What the format leaves out, which caps what this example can show:

- Voicing is mostly not the model's choice, because chord names are voiced by the renderer. Explicit voicings appear only where the model spelled notes out, mostly as arpeggios and broken chords in root position.
- The chord vocabulary stops at 7ths, 9ths, sus, and `7b9`. There is no 11, 13, or altered tension, so reharmonization and tension depth cannot show up here.
- Groove is a global swing amount plus three dynamic levels. There is no per-note timing.

The model designed this format itself, and it chose to stay close to existing notation. That choice is evidence too: the model knows which textual encoding its musical vocabulary lives in. The composing prompt on the page was written after the tracks, so it did not prime them.

## Vocabulary the model wrote

Read from the scores. These are named idioms, each placed where it belongs.

Harmony:

- Andalusian cadence `Dm C Bb A7` with the harmonic-minor C# in the melody (Moonlit Harbor)
- Lament bass `C Bb Ab G` under `Cm Gm/Bb Ab G`, then a Neapolitan `Db` before `G7` (Ghost Galleon)
- Borrowed minor iv, `Bbm` in F major, with `Db` in the oboe and harp (Lantern Waltz)
- Harmonic-minor dominants in minor keys: `A7`, `B7` with D#, `E` with G#
- Ascending melodic minor `D E F# G A Bb C` over the dominant in G minor (Duel on the Docks)
- `A7sus4` resolving to `A7`, and bridges that move to the relative major

Bass:

- Chromatic approach into the next root: `F2 F#2 | G2`, `C2 C#2 | D2`, `B1 Bb1 | A1` (Moonlit Harbor break)
- Leading-tone pickups: `A2 . E2 C#2- | D2`, `E3 . D3 G#2- | A1` (Jungle Path)
- Idiomatic patterns per style: root-fifth-octave calypso lines, one bass note per bar in the waltz, octave pizzicato at 152 bpm, a jig bass that falls to low E

Rhythm:

- Calypso offbeat skank `. . [Dm]- . . [Dm]-`
- Son clave 3-2 `x..x ..x. ..x. x...` (Jungle Path)
- 3+3+2 marimba ostinato `A4-- E5-- C5- A4-- E5-- D5-`
- Bodhran `Xox Xox` in 6/8, and timpani crescendo rolls written as `A2?? ... A2!!`

Orchestration and dramaturgy:

- Instrument choices that fit each scene: steel drum for the harbor, pipe organ, choir, and music box for the villain's ship, harpsichord and trumpet for the swordfight
- A "standoff" section that thins the texture to bassoon, pizzicato, and sparse xylophone
- Second passes that add a counter-line or an octave doubling by `from`, which is how game music varies a loop

The follow-up dance track (Starlight Armada, 128 bpm, A minor) switches vocabulary to the genre: an `Am F C G` loop, an offbeat pumping bass `. A2 A2 A2`, four-on-the-floor kick with clap on 2 and 4, a repeating triad arpeggio, a breakdown with a snare roll and riser into the drop, and a harmonic-minor `E` turnaround. It is more formulaic than the six game tracks, which fits the genre. It has not been judged by ear.

One mismatch between stated intent and notes: Lantern Waltz says "the oboe a third below", but the oboe line moves between thirds and fourths below the tune (`F4` under `A4`, then `C5` under `F5`). The idea is right, but the description is looser than the notes.

## Judgment

- By ear (Hiroshi): the tracks are musically legitimate.
- From reading the scores: the vocabulary is broad and placed correctly across harmony, bass, rhythm, orchestration, and form. These are named, textbook-and-practice idioms, which is consistent with vocabulary learned from text and symbolic notation.
- Inferred: the format works because it reuses notation conventions the model already knows as text. The harness contribution is choosing a format close to that existing vocabulary, plus a trivial synth.
- From the conversation: the loop that did exist was a pseudo-ear for execution errors (levels, clipping, semitone clashes from typos). The musical ideas were already in the first draft. This matches the split from the original discussion: creativity sits at the discrete idea level, and closing the loop is finishing work.

## Effect on claims

- "Harmony, melody, form, and instrumentation ideas are encoded in the text vocabulary" is strengthened, with concrete idioms across six styles.
- "An encodable text medium for musical intuition exists" and "end-to-end audio is not needed to present musical ideas" are supported.
- The format caps voicing, extended tension, and groove, so this example cannot show whether those layers have a medium. The depth probes in [directions.md](../../docs/directions.md) open them up: explicit voicings, extended chords, and per-note timing.

## Files

- [source/](source/): the six scores and the composing prompt, copied verbatim
- [analyze.py](analyze.py): a bar-count and chord-tone checker. It confirmed all bars add up, but it measures correctness rather than encoding, so it is not used in the judgment above
