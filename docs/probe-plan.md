# Probe plan

The working hypothesis is that musical intuition is already encoded in the text vocabulary, and that remaining gaps come from how expressive the output format and tooling are. The plan is built to separate those two causes. If a failure disappears when the format gets richer, it was tooling. If it persists with a rich format, or shows up even with no output format at all, it is in the encoding.

## P0. Reproduce the baseline

Reproduce the Scrimshaw Jukebox setup with a renderer under our control, so that every later probe shares the same pipeline.

- Read the shared conversation and the tool source to learn the text format and the prompt.
- Pick an output format to standardize on. Candidates are the Scrimshaw format, ABC notation, or a small JSON note list that renders to MIDI.
- Done when one prompt produces a track that renders and plays locally.

## P1. Encoding without output

Ask text-only questions with no rendering, so tooling is removed entirely.

- Voicing discrimination: given two voicings of the same chord as note lists, which is muddier, brighter, or more open, and why. Include borderline cases near low-interval limits, such as a close 3rd around C2 compared with the same notes an octave up.
- Reharm fit: given a melody and two candidate reharms, which fits better and why.
- Analysis: explain what a bass line does against the harmony (approach notes, pedal points, where tension comes from) on material the model cannot have memorized, such as original or personally transcribed lines.

Rule-based knowledge should pass the easy cases, so the borderline cases are the signal.

## P2. Genre transfer

Repeat the P0 setup outside pastiche-friendly genres, for example a K-pop bass line from a chord chart, or neo-soul keys voicings. This tells whether the intuition is general or depends on genres with a strong symbolic tradition.

## P3. Constrained edits

Give a melody and a plain progression and ask for a reharm that keeps every melody note as a chord tone or an available tension. Check validity mechanically, then judge the valid ones by ear. This separates "broke a rule" from "valid but bland".

## P4. Expressiveness ladder

This is the direct test of the working hypothesis. Run the same task in three formats:

1. Chord symbols and section structure only
2. Full notes with pitch and duration
3. Notes plus velocity, micro-timing, and articulation

If quality keeps rising with the format, the limit was tooling. If it plateaus early, the limit is in the encoding. The groove layer (playing behind the beat, ghost notes) only becomes expressible at level 3, so this is where it gets tested.

## P5. Blind A/B

Render model output and human references the same way and rate them blind. Past the basics, taste is the only meaningful metric. Bass lines are the best target, because that is where the judge's ear is most reliable.

## Order

P0 first, because everything else reuses it. Then P1 and P2, which are cheap and tell whether the depth is there at all. P4 is the most informative for the thesis and doubles as a design question for an application: how expressive a format to give the model. P3 and P5 refine the judgment of quality.
