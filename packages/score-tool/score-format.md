# Score format

Reference for writing scores that our tool checks and renders. It is written to be handed to a model as is. The format is Scrimshaw-compatible, adapted from Scrimshaw Jukebox's composing prompt without its game-music framing.

Check a score with `pnpm cli check <score>`, and render it with `pnpm cli render <score> <out.wav>`. Rendering goes through General MIDI with the FluidR3 soundfont, so instruments sound like a General MIDI module, not like recordings.

## Layout

A score is plain text read from top to bottom, one statement per line, in this order:

1. Settings for the whole piece
2. `voice` lines, declaring each part and its instrument
3. `pattern` blocks: a `pattern` line followed by its music lines
4. `play` and `loop` lines: the arrangement, always last

A `#` at the start of a word begins a comment that runs to the end of the line. `F#4` is still a note, because its `#` is inside a word. Blank lines are ignored.

## Settings

```
title    The Name of the Piece
composer Your Name
about    One or two sentences about the piece.
tempo    100     # beats per minute, 20 to 400 (default 120)
beats    4       # beats per bar, 1 to 16 (default 4)
steps    4       # steps per beat, 1 to 12 (default 4)
swing    0.12    # delays every other step, 0 to 0.75 (default 0)
```

A step is the smallest unit of rhythm, and every bar holds exactly beats × steps steps:

- `beats 4` `steps 4`: 4/4 in sixteenths, 16 steps per bar
- `beats 4` `steps 2`: 4/4 in eighths, 8 steps per bar
- `beats 3` `steps 2`: 3/4 in eighths, 6 steps per bar
- `beats 2` `steps 3`: 6/8, 6 steps per bar, with the tempo counting dotted quarters
- `beats 4` `steps 3`: 12/8, 12 steps per bar
- `beats 7` `steps 2`: 7/8 written as seven eighth-note beats, with the tempo counting eighths

Swing only applies when steps per beat is even. It delays every other step by that fraction of a step: 0.1 to 0.15 is light, and 0.33 is close to a triplet shuffle.

## Voices

```
voice NAME INSTRUMENT key=value key=value ...
```

Names use letters, digits, and underscores, and each is declared once. Every voice used in a pattern must be declared.

Options:

- `vol=0.8`: level, 0 to 2 (default 0.8). It scales note velocity, so it also balances the mix
- `pan=-0.3`: stereo position, -1 left to 1 right (default 0). Drum voices share one channel and cannot be panned separately
- `oct=-1`: shift by whole octaves
- `trans=3`: shift by semitones
- `gate=0.5`: sound each note for this fraction of its written length, 0.05 to 1 (default 1)
- `center=A4`: the pitch that chord names are voiced around (default D4)

`rev`, `glide`, `bright`, `att`, and `rel` are accepted but have no effect on the rendered sound.

Melodic instruments:

- Mallets and bells: `steeldrum` `marimba` `vibes` `celesta` `glock` `xylophone` `musicbox` `bell`
- Keyboards: `piano` `organ` `pipe` (pipe organ) `harpsichord` `epiano` (electric piano)
- Strings: `strings` (string ensemble) `violin` `viola` `cello` `contrabass` `pizz` (pizzicato strings) `fiddle` `harp`
- Guitars and plucked: `guitar` (nylon acoustic) `eguitar` (clean electric) `distguitar` (distorted electric) `banjo`
- Basses: `upright` `ebass` (electric, fingered) `fretless` `synbass`
- Woodwinds: `flute` `clarinet` `oboe` `bassoon` `accordion` `altosax` `tenorsax` `barisax`
- Brass: `trumpet` `trombone` `brass` (brass section) `horn` (French horn) `tuba`
- Voices and pads: `choir` `voices` `pad`
- Percussion with pitch: `timpani`
- Synths: `chip` `sine` `square` `saw` `triangle`

Drum instruments, one sound per voice:

- Kit: `kick` `snare` `rim` `hat` `ohat` (open hi-hat) `ride` `crash` `clap`
- Hand percussion: `conga` `tumba` `bongo` `bongolo` `timbale` `bodhran` `shaker` `tamb` `clave` `block` `cowbell` `guiro` `tri`
- Toms and effects: `tomlo` `tommid` `tomhi` `gong` `thunder` `surf`

There is no drum kit instrument, so give each drum sound its own voice. A piece can have at most 15 voices that are not drums. A section, such as three trumpets, can be one voice playing note stacks.

## Patterns

```
pattern NAME
VOICE | bar | bar | bar | bar |
VOICE | bar | bar | bar | bar |
```

Pattern names use letters, digits, and underscores. A music line is a voice name, a `|`, then bars separated by `|`. The closing `|` is optional. A bar cannot be empty: write `_` for a silent bar.

- A voice can have several lines in one pattern, and they join end to end.
- Voices left out of a pattern are silent during it.
- A pattern lasts as long as its longest voice, so give every voice the same number of bars.
- `pattern B from A` starts as a copy of pattern A. A voice written in B replaces that voice's whole part from A, and other voices carry over.
- `mute NAME` inside a pattern silences that voice.
- A `tempo`, `beats`, `steps`, or `swing` line inside a pattern changes only that pattern. These can also go on the pattern line: `pattern slow tempo=80 swing=0`.

## Melodic bars

A melodic bar is a row of tokens separated by spaces. Each token takes a number of steps, and together they must add up to exactly beats × steps.

- Note: a letter A to G, an optional accidental (`#` `##` `b` `bb`), and an octave 0 to 8. `C4` is middle C and `A4` is 440 Hz. A note lasts one step.
- Each dash after a note adds a step: `D5---` lasts four steps.
- Rest: each `.` is one step of silence, and dashes after a dot add more: `.---` is four steps.
- A token of dashes on its own (`-` or `---`) keeps the previous note sounding for that many more steps. Use it to tie a note across a bar line.
- Notes struck together are joined with `+` and no spaces: `C4+E4+G4`. Dashes go at the end: `C4+E4+G4---`. This is how to write an exact voicing.
- A chord name in square brackets is voiced automatically in close position near the voice's `center`: `[Dm7]`, `[C/E]`. Dashes extend it: `[Dm7]---`. Use note stacks instead whenever the voicing matters.
- Dynamics: `!` after a note makes it louder and `?` softer, stackable: `D5!!`, `A2??`. They go after the note or after its dashes: `D5---!`.
- `~` before a note marks a slide, which is accepted but not rendered.

Symbols that fill a whole bar, alone between bar lines:

- `%` repeats the previous bar
- `_` is a silent bar
- `=` holds the note sounding at the end of the previous bar through this whole bar

Chord names are a root (A to G, optionally followed by `#` or `b`) and one of these suffixes, or no suffix for a major triad:

`m` `7` `m7` `maj7` `mmaj7` `6` `m6` `9` `m9` `maj9` `add9` `madd9` `sus2` `sus4` `7sus4` `dim` `dim7` `m7b5` `aug` `5` `7b9`

## Drum bars

A drum voice reads one character per step: `x` a hit, `X` an accented hit, `o` a quiet ghost note, and `.` nothing. Spaces are ignored, so group characters by beat: `x... ..x. x... ..x.`. `%` and `_` work in drum lines too. A drum bar needs exactly beats × steps characters, not counting spaces.

## Arrangement

```
play intro        # patterns played once, in order
loop A A2 B*2 A+2 # patterns that then repeat
```

- `B*2` plays a pattern twice.
- `A+5` or `A-2` transposes a pattern by semitones. Drums are not affected. Both combine: `A+2*2`.
- With no `play` or `loop` line, every pattern loops in the order written.
- When rendering, the loop plays once by default, and `--loops <n>` repeats it.

## Counting

A note, stack, or chord counts 1 plus its dashes. A rest counts its dots plus its dashes. A lone dash token counts its dashes. A drum bar counts its characters, ignoring spaces. At 16 steps per bar:

```
E5-- G5-- B5- A5 G5 F#5 E5 D5---     3+3+2+1+1+1+1+4 = 16
.- C4+E4+G4- .- C4+E4+G4- .-------   2+2+2+2+8 = 16
x... .... x... x.x.                  16 characters
```

## Minimal example

This shows syntax only, not a style:

```
title    Syntax Example
tempo    96
beats    4
steps    4

voice keys piano
voice bass upright
voice kick kick

pattern A
keys | C4+E4+G4------- D4+F4+A4------- | C4+E4+G4--------------- |
bass | C2------- D2------- | C2--------------- |
kick | x... .... x... .... | % |

loop A
```
