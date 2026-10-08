# 04-range-sweep

- Direction: Genre breadth and Fan-out in [directions.md](../../docs/directions.md)
- Date: 2026-10-08
- Model ID: claude-opus-5-5 for every cell, each in a fresh subagent
- Output format: our Scrimshaw-compatible score, rendered by our tool

## Question

Experiments 02 and 03 worked by ear in one genre, neo-soul loops in 4/4. What is the range of the model's musical intuition, both across styles and in depth? This sweep explores as broadly as the format allows: grooves across genres, melody and form, ensembles from solo piano to big band, and styles far from pop. A depth ladder asks for the same briefs at different levels of sophistication, and one open brief is repeated to separate real range from sampling variance.

## Design

Each cell is one brief handed to a fresh subagent. The subagent sees only the shared brief below, not this repository's docs or earlier experiments, so no cell inherits choices from 02 or 03.

Axes covered across the cells:

- Genre and style, from funk and K-pop to Bach-style counterpoint, minimalism, and film music
- Melody: none, a riff, a hook, or a full tune across a form
- Form: a 2-bar vamp up to a song in sections or a 32-bar AABA
- Ensemble: solo instrument, rhythm section, small band, chamber group, big band
- Meter: 4/4, 3/4, 7/8, and compound or swung feels (12/8)
- Tempo: from about 60 to 170 bpm
- Depth: asked to be as simple as possible, given no instruction, or asked to be as sophisticated as possible
- Brief: specified, or open "your own taste"

### Grooves

Loops with drums, bass, and one or two harmony parts.

| Cell | Brief                       | Form    | Meter | Tempo | Main thing to hear                                 |
| ---- | --------------------------- | ------- | ----- | ----- | -------------------------------------------------- |
| g01  | Funk, one-chord dorian vamp | 2 bars  | 4/4   | 100   | 16th syncopation and ghost notes in the bass       |
| g02  | Boom-bap hip-hop            | 4 bars  | 4/4   | 88    | Sample-like keys loop and a heavy, sparse bass     |
| g03  | Bossa nova                  | 8 bars  | 4/4   | 130   | Guitar comping pattern and root-fifth bass         |
| g04  | Jazz waltz                  | 8 bars  | 3/4   | 150   | Waltz comping and a two-feel bass line             |
| g05  | Blues shuffle               | 12 bars | 12/8  | 110   | Shuffle feel and a walking or boogie bass          |
| g06  | Reggae one-drop             | 4 bars  | 4/4   | 75    | Offbeat skank and a melodic bass that leaves space |
| g07  | Afrobeat                    | 4 bars  | 4/4   | 105   | Interlocking guitar and keys parts                 |
| g08  | K-pop chorus loop           | 8 bars  | 4/4   | 120   | Four-chord pop harmony and a driving synth bass    |
| g09  | House                       | 8 bars  | 4/4   | 124   | Organ bass, chord stabs, four-on-the-floor         |
| g10  | Fusion in odd meter         | 4 bars  | 7/8   | 120   | Phrasing in 2+2+3 and extended harmony             |
| g11  | Gospel ballad               | 8 bars  | 12/8  | 60    | Rich voicings and passing chords                   |
| g12  | Salsa                       | 8 bars  | 4/4   | 180   | Clave, tumbao bass, and piano montuno              |
| g13  | Drum and bass               | 8 bars  | 4/4   | 170   | Breakbeat drums and a half-time bass line          |
| g14  | Rock riff                   | 8 bars  | 4/4   | 120   | A guitar riff that locks with the bass and drums   |

### Melody and form

| Cell | Brief                                                         | Main thing to hear                                     |
| ---- | ------------------------------------------------------------- | ------------------------------------------------------ |
| m01  | Pop song chorus with a lead melody over a band                | A memorable hook, and how its phrasing fits the chords |
| m02  | Jazz head, 32-bar AABA, horn melody with a rhythm section     | A melody across a full form, and the bridge contrast   |
| m03  | A short song in sections: intro, verse, chorus, bridge, outro | Development, contrast, and transitions                 |
| m04  | Lullaby or children's song                                    | Whether simplicity is handled as well as complexity    |
| m05  | Blues with a call-and-response melody and fills               | Phrasing, space, and answering phrases                 |

### Ensembles and orchestration

| Cell | Brief                                                        | Main thing to hear                                         |
| ---- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| e01  | Solo piano, about 16 bars                                    | Melody and accompaniment in one instrument, no bass player |
| e02  | Soul or Motown band: drums, bass, guitar, keys, horn section | Interlocking parts and horn arranging                      |
| e03  | String quartet                                               | Not run: same brief as d04, see d04s, d04, d04d            |
| e04  | Big band shout chorus                                        | Section writing for saxes, trumpets, and trombones         |
| e05  | Four-part chorale for choir                                  | Voice leading under classical rules                        |

### Styles beyond pop

| Cell | Brief                                              | Main thing to hear                                   |
| ---- | -------------------------------------------------- | ---------------------------------------------------- |
| s01  | Two-voice invention in the style of Bach           | Imitation and counterpoint                           |
| s02  | Impressionist piano miniature                      | Color harmony, parallel chords, and pedal-like holds |
| s03  | Minimalist piece with phasing or additive patterns | Process and gradual change                           |
| s04  | Ambient piece                                      | Texture, space, and slow harmonic motion             |
| s05  | Film cue that builds tension to a climax           | Dramatic arc and orchestration over time             |

### Depth ladder

Each brief runs three times with one added instruction: "as simple as possible while still being good music", no instruction, or "as sophisticated as you can while staying musical". The signal is whether the depth actually changes with the request, in which layers (harmony, rhythm, voicing, texture), and whether the simple version is good rather than merely empty.

| Cells           | Brief                                                                                  | Main thing to hear                                    |
| --------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| d01s, d01, d01d | Bass line over fixed changes, 4 bars looped: `Am7 \| D7 \| Gmaj7 \| Cmaj7`, with drums | The bass alone, since harmony and form are fixed      |
| d02s, d02, d02d | Comping a jazz ballad over a standard-like 8-bar progression of its choice             | Voicings, reharmonization, and rhythmic placement     |
| d03s, d03, d03d | Pop chorus with a lead melody over a band                                              | Melody and harmony together, at pop's usual depth     |
| d04s, d04, d04d | String quartet, about 16 bars                                                          | Counterpoint and texture without drums or chord names |

### Open brief

| Cell | Brief                       | Main thing to hear                    |
| ---- | --------------------------- | ------------------------------------- |
| o01  | "Your own taste", first run | Range of choices with no constraints  |
| o02  | Same open brief, second run | Sampling variance against o01         |
| o03  | Same open brief, third run  | Sampling variance against o01 and o02 |

Length, tempo, and ensemble size are left to the model wherever the table does not set them.

## Limits of the medium

- There are no vocals, so melodies are played by instruments, and the chorale is sung by the General MIDI choir sound.
- A song can have at most 15 voices that are not percussion. A section such as a trumpet section can be one voice playing note stacks.
- The instrument set lacks several sounds these cells need, at least acoustic piano, clean and distorted electric guitar, saxophones, trombone, violin, viola, cello, and contrabass. They are added before the sweep, each mapped to its General MIDI program.

## Shared brief

Every subagent gets the same material:

1. A format reference for our score format, adapted from Scrimshaw's composing prompt. It drops the early-1990s game-music framing, lists the full instrument set, and states which options are parsed but not rendered.
2. Its cell's brief from the tables, in plain words.
3. Instructions to write explicit note stacks where voicing matters, to write its intent in comments, to save the score at a given path, and to run `pnpm cli check` until it passes. It is told that it cannot listen and that the output is rendered through General MIDI.

The exact prompts and the design choices behind them are in [prompts.md](prompts.md), and every subagent's final reply is in [replies.md](replies.md). The narration in every score comes from one line of the prompt, "Write your intent as comments in the score: what each part does and why", and its form was not seeded by any example.

## Procedure

1. Add the missing instruments to the tool.
2. Write the format reference in `docs/score-format.md`, so later experiments can reuse it.
3. Spawn one subagent per cell, each writing `<cell>-<slug>.scrim` in this directory. With 44 cells, run them in batches.
4. Render every score to `.tmp/04-range-sweep/`, looping short pieces to roughly a minute of audio.
5. Hiroshi listens, ideally without knowing which run produced which file for o01 to o03, or which depth produced which file in each ladder.

## Batch 1

The first batch tests the setup on six cells: the bass ladder (d01s, d01, d01d) and the three open-brief runs (o01, o02, o03).

- In the bass ladder, the tempo (92), pad, kick, snare, and hat are fixed in a base score handed to every run, and the subagent writes only the bass. Otherwise differences between bass lines could not be separated from differences in everything else.
- The open-brief runs get an identical prompt: "if nothing were specified and you were to show your own musical taste, what would you write?", with every choice left to the model.
- Each subagent is told to read only [score-format.md](../../docs/score-format.md), and not other docs or scores, so its choices stay independent.

### Batch 1 results

Read from the scores and the subagents' reports, not judged by ear:

- All six passed `check`. Three needed fixes first: o02 had one bar with 7 steps instead of 6, o03 had four, and o01 moved two dynamic marks before its first check.
- Bass ladder: d01s plays only roots, re-struck with the kick. d01 plays roots, fifths, and chord tones with a half-step approach into each next root. d01d adds ghost notes, 16th-note runs through 3rds and 7ths, a b9 over D7, and a hint of tritone substitution. Complexity rises with the request in rhythm and harmony.
- Open brief: all three runs chose a slow chamber nocturne with clarinet and cello, two in E-flat major and one in E minor, two of them titled "Late ..." and one "Lantern Hours". Two split the piano's left hand to imitate a sustain pedal, two end on a major 9 chord, and all three describe their taste as intimate chamber writing. With an identical open brief, sampling variance was small. The model has a strong default when unconstrained, and it differs from the neo-soul choices in 03, where the conversation's context shaped the pick.

## Waves A and B

The remaining 37 cells ran in two waves of fresh subagents with the same shared brief. e03 (string quartet) was not run. Its brief duplicated the depth ladder's d04, which asks for a 16-bar string quartet three times, and the d04 run with no depth instruction is effectively e03. The quartet results are in d04s, d04, and d04d. All 43 scores pass `check` and are rendered in `.tmp/04-range-sweep/`, with loop-only pieces repeated to about a minute. g14 and s05 clipped at the default gain and were rendered with `--gain 0.3`.

### Results

Read from the scores and the subagents' reports, not judged by ear:

- **Depth ladders change on paper in every brief.** Bass: roots only, then chord tones with approaches, then ghost notes, runs, and altered tones. Ballad comping: even the simple version keeps 9th and 13th voicings and simplifies the rhythm instead, while the deep version splits the hands, adds upper structures, tritone substitutions, and a diminished run. Pop chorus: triads and one hook cell, then a peaking hook, then IV-iii-ii-V with chromatic substitutions and a melody on color tones. Quartet: a diatonic hymn, then a lyrical minor piece with a Picardy ending, then a lament bass, Neapolitan, and German sixth.
- **Genre idioms are placed where they belong.** Examples: a one-drop with the kick on 3, a 2-3 son clave locking the salsa percussion and a tumbao bass that anticipates chords, guitar and organ in afrobeat interlocking so they never strike together, 7/8 accents on 2+2+3, Motown guitar on 2 and 4 with the snare on all four beats in the chorus, drop-2 horn voicings, and 4-way close big band sections.
- **Free choices converge on a default.** Whenever style or title was left open, the model drifted to the same imagery and genre. Titles include "Late Lamp" twice (o01 and d02), "Late Ferry", "Lantern Hours", "Lantern Street", and "Lanterns on the Water". Open briefs and the solo piano cell all chose a nocturne.
- **The model works around limits of the medium and says so.** Two cells wrote swing as 2+1 triplets because `swing` does nothing on a 3-step grid. s03 used Reich's discrete locked phase positions because continuous drift cannot be written on a grid. Several split the piano's left hand to imitate a sustain pedal.
- **Some subagents built their own tools.** s03 and e04 generated their scores with scripts. e05 wrote a script to check all 28 chords for parallel fifths and octaves and voice crossing, which is the computed pseudo-ear idea from the original discussion, unprompted.
- **Execution errors stayed execution errors.** 13 of 43 cells needed fixes before passing `check`, nearly all miscounted bars, and the validator caught every one. One was a parser bug: a `|` inside `about` text was read as a music line, which is now fixed. One subagent misdiagnosed its own error, blaming dynamic marks between dashes, which the parser counts correctly.

### Adjustment loop: g10 fusion

The first test of musician feedback driving a revision.

- **Feedback (by ear, Hiroshi):** "fusion 7/8 wants 2 2 1.5 + 1.5 like beat", meaning the last 3-eighth group should split into two dotted-eighth pulses.
- **Original (measured from the note events):** the original was written as 2+2+3 eighths, and its comments and report match its notes. Hat accents and keys land on the group starts 0, 4, and 8. Keys add a stab at 12, and the bass plays root, b7, and fifth on 8, 10, and 12, so most parts divide the 3-group into eighths. Only the kick splits it at 11, which the original described as keeping the 3-group from sounding like a third 2-group, not as a 1.5+1.5 feel. The feedback asked for a different feel, not a fix for a mismatch.
- **Revision:** the note was sent verbatim to the same subagent, without any analysis. It read the note the same way, identified which parts still divided the 3-group into eighths, and wrote [g10-fusion-7-8-rev1.scrim](g10-fusion-7-8-rev1.scrim). In bars 1 to 3, keys, bass, kick, and hat now all land on sixteenths 0, 4, 8, and 11, and the snare backbeat moved to 4 and 11. Harmony, voicings, and tempo are unchanged.
- **Pending:** whether the revision sounds like the feel Hiroshi meant.

## Judgment

By ear (Hiroshi), after listening to all renders:

- Rhythmic and harmonic intent feel complete and natural: harmony, voicing, groove, genre idioms, form, and arrangement. The model has good musical intuition in these layers.
- Melodic intent, in a general sense, is noticeably more awkward. This covers any line meant to be heard as a line: lead melodies, melodic bass lines, and melodic lines in the comping such as brass. They often sound not quite right.
- Vaguer melodic material sounds reasonable: piano figures, ambient textures, the chorale, and arpeggiated lines.
- The cause is hard to tell. It may be the notes, the default sounds, or the missing performance techniques a DAW user would apply to a line, such as shaping volume across a phrase.

This judgment was made on renders with a renderer flaw: loud voices, mostly lead and bass lines, played at a flat velocity of 127 with their accents clipped. The sweep was re-rendered with the fix, and [05-phrasing-pass](../05-phrasing-pass/README.md) describes it. The judgment of melodic lines may change on the new renders.

Expectations stated alongside the judgment, not yet tested:

- The convincing layers would get better programmed in a real DAW with better samples and sounds, because their weakness is the General MIDI rendering, not the writing.
- In a DAW, a human could polish the nuance and expression of one part by hand, and an agent could then adopt that nuance throughout the piece.
