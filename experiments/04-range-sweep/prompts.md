# Prompts

The exact prompts sent to the subagents in this sweep. Every cell ran in a fresh `general-purpose` subagent on claude-opus-5-5, with no other context.

## Design choices behind the prompts

- **Independence.** Each subagent may read only `docs/score-format.md`, so no cell sees earlier experiments, other cells, or Scrimshaw's scores. The format reference's only comments are one-line syntax notes, so it gives no model of narration or style.
- **Narration is requested, its form is not.** The line "Write your intent as comments in the score: what each part does and why" is the only reason the scores carry narration. No example of a plan header or comment style was given, so the form of the comments is the model's own.
- **Honesty about the medium.** Every prompt says the model cannot listen and that output is rendered through General MIDI.
- **Validation in the loop.** Every prompt requires `pnpm cli check` to pass, which catches miscounted bars as execution errors.
- **Depth as one added sentence.** Depth ladder cells differ from their default cell only by one instruction sentence, so any difference in depth comes from that sentence.
- **Fixed context where only one part is under test.** The bass ladder hands over a base score with tempo, pad, and drums fixed, and the subagent writes only the bass.

## Template

Every cell except the bass ladder used this template, with `{task}`, `{depth}`, and `{file}` filled in. The `{depth}` paragraph is omitted for cells without a depth instruction.

```
You are composing music as text for a research experiment. Work in the repository at /home/hiroshi/code/personal/llm-music-probe.

Read only docs/score-format.md, which describes the score format. Do not read any other docs, experiments, or scores in the repository, so your choices stay independent.

Task: {task}

Instruction for this cell: {depth}

Save the score as experiments/04-range-sweep/{file}. Write your intent as comments in the score: what each part does and why. You cannot listen to the result. It is rendered through General MIDI.

When done, run `pnpm cli check experiments/04-range-sweep/{file}` from the repository root and fix any reported problems until it prints nothing and exits 0. Do not commit.

Reply with the final check result and three to five sentences describing what you wrote and why.
```

Batch 1's open-brief cells used absolute paths for the format reference and the score, with otherwise the same wording.

## Depth sentences

- Simple: "make it as simple as possible while still being good music."
- Deep: "make it as sophisticated as you can while staying musical."

The bass ladder phrased them as "make the bass line as simple as possible while still being good music" and "make the bass line as sophisticated as you can while staying musical".

## Tasks

| Cell            | `{task}`                                                                                                                                                                                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| d02s, d02, d02d | write keyboard comping for a jazz ballad over an 8-bar progression of your choice, in the style of a jazz standard. You may add bass and light drums, but the comping is the focus. Choose key, tempo, and instruments. Write explicit note stacks for every voicing.                                                                          |
| d03s, d03, d03d | write a pop song chorus of about 8 bars, with a lead melody played by an instrument over a band (drums, bass, and harmony). Choose key, tempo, and instruments.                                                                                                                                                                                |
| d04s, d04, d04d | write a string quartet piece of about 16 bars for two violins, viola, and cello. Choose key, tempo, and meter.                                                                                                                                                                                                                                 |
| g01             | write a 2-bar funk loop on a one-chord dorian vamp, in 4/4 at about 100 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge the 16th-note syncopation and ghost notes in the bass. Write explicit note stacks wherever voicing matters.                                                                          |
| g02             | write a 4-bar boom-bap hip-hop loop in 4/4 at about 88 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge a sample-like keys loop and a heavy, sparse bass. Write explicit note stacks wherever voicing matters.                                                                                                |
| g03             | write an 8-bar bossa nova loop in 4/4 at about 130 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge the guitar comping pattern and the root-fifth bass. Write explicit note stacks wherever voicing matters.                                                                                                  |
| g04             | write an 8-bar jazz waltz loop in 3/4 at about 150 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge the waltz comping and a two-feel bass line. Write explicit note stacks wherever voicing matters.                                                                                                          |
| g05             | write a 12-bar blues shuffle with a 12/8 feel at about 110 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge the shuffle feel and a walking or boogie bass. Write explicit note stacks wherever voicing matters.                                                                                               |
| g06             | write a 4-bar reggae one-drop loop in 4/4 at about 75 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge the offbeat skank and a melodic bass that leaves space. Write explicit note stacks wherever voicing matters.                                                                                           |
| g07             | write a 4-bar afrobeat loop in 4/4 at about 105 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge interlocking guitar and keys parts. Write explicit note stacks wherever voicing matters.                                                                                                                     |
| g08             | write an 8-bar K-pop chorus loop in 4/4 at about 120 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge the four-chord pop harmony and a driving synth bass. Write explicit note stacks wherever voicing matters.                                                                                               |
| g09             | write an 8-bar house loop in 4/4 at about 124 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge the organ bass, chord stabs, and four-on-the-floor drums. Write explicit note stacks wherever voicing matters.                                                                                                 |
| g10             | write a 4-bar fusion loop in 7/8 at about 120 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge phrasing in 2+2+3 and extended harmony. Write explicit note stacks wherever voicing matters.                                                                                                                   |
| g11             | write an 8-bar gospel ballad loop with a 12/8 feel at about 60 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge rich voicings and passing chords. Write explicit note stacks wherever voicing matters.                                                                                                        |
| g12             | write an 8-bar salsa loop in 4/4 at about 180 bpm, with percussion, bass, and one or two harmony parts. A listener will mainly judge the clave, the tumbao bass, and the piano montuno. Write explicit note stacks wherever voicing matters.                                                                                                   |
| g13             | write an 8-bar drum and bass loop in 4/4 at about 170 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge the breakbeat drums and a half-time bass line. Write explicit note stacks wherever voicing matters.                                                                                                    |
| g14             | write an 8-bar rock loop in 4/4 at about 120 bpm, with drums, bass, and one or two guitar or harmony parts. A listener will mainly judge a guitar riff that locks with the bass and drums. Write explicit note stacks wherever voicing matters.                                                                                                |
| m01             | write a pop song chorus with a lead melody played by an instrument over a band. Choose key, tempo, length, and instruments. A listener will mainly judge whether the hook is memorable and how its phrasing fits the chords. Write explicit note stacks wherever voicing matters.                                                              |
| m02             | write a jazz head, an original 32-bar AABA tune with a horn melody over a rhythm section. Choose key, tempo, and instruments. A listener will mainly judge the melody across the full form and the contrast of the bridge. Write explicit note stacks wherever voicing matters.                                                                |
| m03             | write a short song in sections: intro, verse, chorus, bridge, and outro, with a lead melody played by an instrument. Choose style, key, tempo, and instruments. A listener will mainly judge development, contrast between sections, and the transitions. Write explicit note stacks wherever voicing matters.                                 |
| m04             | write a lullaby or children's song with a melody played by an instrument and a simple accompaniment. Choose key, tempo, length, and instruments. A listener will mainly judge whether simplicity is handled as well as complexity would be.                                                                                                    |
| m05             | write a blues with a call-and-response melody: a lead instrument states phrases and another instrument answers with fills, over a rhythm section. Choose key, tempo, length, and instruments. A listener will mainly judge phrasing, use of space, and how the answering phrases respond. Write explicit note stacks wherever voicing matters. |
| e01             | write a piece for solo piano of about 16 bars. Choose style, key, tempo, and meter. You may split the piano into several voices for clarity, but use only the piano instrument. A listener will mainly judge how melody and accompaniment work together in one instrument without a bass player. Write explicit note stacks for every chord.   |
| e02             | write a soul or Motown-style band piece for drums, bass, guitar, keys, and a horn section. Choose key, tempo, and length. A listener will mainly judge how the parts interlock and the horn arranging. Write explicit note stacks wherever voicing matters, including the horn section.                                                        |
| e04             | write a big band shout chorus with saxophone, trumpet, and trombone sections over a rhythm section. Choose key, tempo, and length. A listener will mainly judge the section writing: voicings within each section and how the sections play against each other. Write explicit note stacks for the section voicings.                           |
| e05             | write a four-part chorale for choir, with soprano, alto, tenor, and bass as separate voices using the choir instrument. Choose key, tempo, and length. A listener will mainly judge the voice leading under classical rules.                                                                                                                   |
| s01             | write an original two-voice invention in the style of Bach, for harpsichord or piano with each hand as its own voice. Choose key, tempo, meter, and length. A listener will mainly judge imitation and counterpoint.                                                                                                                           |
| s02             | write an impressionist piano miniature. Choose key or mode, tempo, meter, and length. You may split the piano into several voices for clarity, but use only the piano instrument. A listener will mainly judge color harmony, parallel chords, and held, pedal-like sonorities. Write explicit note stacks for every chord.                    |
| s03             | write a minimalist piece built on phasing or additive patterns, in the spirit of Steve Reich or Philip Glass. Choose instruments, key, tempo, meter, and length. A listener will mainly judge the process and how gradual change unfolds.                                                                                                      |
| s04             | write an ambient piece. Choose instruments, key or mode, tempo, meter, and length. A listener will mainly judge texture, space, and slow harmonic motion. Write explicit note stacks wherever voicing matters.                                                                                                                                 |
| s05             | write a film cue that builds tension to a climax. Choose the scene it scores, instruments, key, tempo, meter, and length. A listener will mainly judge the dramatic arc and how the orchestration changes over time. Write explicit note stacks wherever voicing matters.                                                                      |
| o01, o02, o03   | if nothing were specified and you were to show your own musical taste, what would you write? Choose everything: style, form, length, meter, tempo, key, and ensemble. Write explicit note stacks wherever voicing matters.                                                                                                                     |

## Bass ladder

d01s, d01, and d01d used a different task, because they write one part into a fixed score:

```
Task: write a bass line over fixed changes. Create /home/hiroshi/code/personal/llm-music-probe/experiments/04-range-sweep/{file} containing exactly the base score below, and add a `voice bass ...` declaration and the bass part for pattern A (4 bars). Do not change the tempo, the other voices, or their parts. You choose the bass instrument (a bass instrument from the list), its options, and every note.
```

The base score:

```
title    Fixed Changes
tempo    92
beats    4
steps    4

voice pad   epiano vol=0.5 center=E4
voice kick  kick
voice snare snare
voice hat   hat vol=0.4

pattern A
pad   | [Am7]--------------- | [D7]--------------- | [Gmaj7]--------------- | [Cmaj7]--------------- |
kick  | x... ..x. x... .... | % | % | % |
snare | .... x... .... x... | % | % | % |
hat   | x.x. x.x. x.x. x.x. | % | % | % |

loop A
```

## Revision of g10

Sent to the subagent that wrote g10, continuing its context:

```
Listener feedback on your 7/8 fusion loop, from a musician who listened to the render, verbatim: "fusion 7/8 wants 2 2 1.5 + 1.5 like beat".

Revise the piece to answer that note. Write the revision to experiments/04-range-sweep/g10-fusion-7-8-rev1.scrim and leave the original file unchanged. Keep the same harmony and tempo unless the note requires otherwise. Explain in comments what you changed and why. Read only docs/score-format.md and your own original score.

Run `pnpm cli check experiments/04-range-sweep/g10-fusion-7-8-rev1.scrim` until it prints nothing and exits 0. Do not commit.

Reply with the final check result and three to five sentences on how you interpreted the note and what you changed.
```
