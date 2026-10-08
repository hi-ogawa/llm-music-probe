# 06-reference-feedback

- Direction: The adjustment loop in [directions.md](../../docs/directions.md)
- Date: 2026-10-09
- Model ID: claude-opus-5-5 for every run, each in a fresh subagent
- Output format: our Scrimshaw-compatible score, rendered by our tool

## Question

In [04-range-sweep](../04-range-sweep/README.md#adjustment-loop-g10-fusion), the g10 fusion loop in 7 sounded like 2 2 1 1 1. One plain-language note, "fusion 7/8 wants 2 2 1.5 + 1.5 like beat", produced a revision with the intended feel. That note spelled out the grouping. Would the revision also have come out right if the note had only named a reference, the way a musician talks after listening, without seeing the score?

The note under test is "fusion 7 feels lame. make it like mehldau all the things we are 7 feel?". It works only if the model knows how Brad Mehldau's 7 arrangement of All the Things You Are feels, and also turns that into note placements. The explicit note skipped the first step.

This is a probe of the interface between a listener and a score. Feedback given by ear refers to sound, and the score's notation labels, such as the time signature and the grouping named in comments, are not sound. Whether Mehldau's version is written in 7/4 or 7/8 does not matter to the listener, because the same grouping at the same pulse is the same music. The part of the score that corresponds to what is heard is the onsets. g10 already showed the two coming apart: its comments said 2+2+3, while its onsets subdivided the last group evenly and it was heard as 2 2 1 1 1.

Material: the reference is a famous recording, so this tests recall on purpose, unlike the preference for unmemorized material elsewhere. The question is whether a named reference carries the same information as an explicit description.

Claims affected in [context.md](../../docs/context.md): the adjustment loop, and the inference that the model treats notation labels as if they were the sound.

## Setup

### Conditions

Each run is a fresh subagent that reads only `docs/score-format.md` and the original [g10-fusion-7-8.scrim](../04-range-sweep/g10-fusion-7-8.scrim), and gets the original g10 brief and one listener note. Only the note differs:

| Condition  | Note, verbatim                                                            | What it isolates                                               |
| ---------- | ------------------------------------------------------------------------- | -------------------------------------------------------------- |
| A, vague   | "fusion 7 feels lame"                                                     | Whether dissatisfaction alone moves the groove the right way   |
| B, ref     | "fusion 7 feels lame. make it like mehldau all the things we are 7 feel?" | Whether the named reference carries the grouping               |
| C, spelled | "fusion 7/8 wants 2 2 1.5 + 1.5 like beat"                                | Control: the 04 note, in the same fresh-agent setup as A and B |

C repeats the 04 note because the 04 revision ran in the original subagent's continued context, which cannot be resumed. Each condition runs three times, so nine revisions in all. The typo "we are" in B is kept as the note was written.

### Knowledge check

One fresh subagent, with no repository access and no composing task, is asked to describe the meter and rhythmic grouping of the reference. This separates not knowing the recording from knowing it but not applying it. Its answer is graded by Hiroshi's ear against the recording.

### Prompts

The exact prompts are in [prompts.md](prompts.md).

### Measurement

- **Measured:** onsets per voice within each bar, on a grid of 14 steps per bar, which is sixteenths of the original 7/8. This scale is relative to the bar, so it works even if a revision changes the written meter or tempo. The target is 0 4 8 11 (4+4+3+3). The original's last group subdivides evenly in eighths at 8 10 12. [onsets.ts](onsets.ts) prints the table.
- **Measured:** side effects, such as a changed meter, tempo, harmony, swing, or texture.
- **Recorded verbatim:** each subagent's reply and the interpretation in its comments.
- **By ear (Hiroshi):** the nine revisions are rendered with shuffled numeric names, listened to blind, and each is marked for whether it has the intended feel. The key is revealed afterwards.

## Raw output

- Scores: `a1-vague.scrim` to `c3-spelled.scrim` in this directory
- Replies: [replies.md](replies.md)
- Onset tables: [onsets.txt](onsets.txt)

## Judgment

Pending.

## Effect on claims

Pending.
