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

C repeats the 04 note because the 04 revision ran in the original subagent's continued context, which cannot be resumed. Each condition runs three times per batch. The typo "we are" in B is kept as the note was written.

### Batches

- **Batch 1, open.** The prompt said only to keep the harmony and tempo unless the note required otherwise, as in the 04 revision. Instruments, texture, and style were left open. Files: `a1-vague.scrim` to `c3-spelled.scrim`.
- **Batch 2, groove only.** The intended question was about the groove alone: can the groove be changed to feel like Mehldau's 7? Batch 1 did not isolate it, because the B runs rewrote the whole texture (see results). Batch 2 puts the scope into the note itself, in a musician's words, "keep everything, just the groove", with the prompt otherwise unchanged. A and B run three times each, and C is reused from batch 1 because its note and prompt would be identical. Files: `g-a1-vague.scrim` to `g-b3-ref.scrim`.

### Knowledge check

One fresh subagent, with no repository access and no composing task, is asked to describe the meter and rhythmic grouping of the reference. This separates not knowing the recording from knowing it but not applying it. Its answer is graded by Hiroshi's ear against the recording.

### Prompts

The exact prompts are in [prompts.md](prompts.md).

### Measurement

- **Measured:** onsets per voice within each bar, on a grid of 14 steps per bar, which is sixteenths of the original 7/8. This scale is relative to the bar, so it works even if a revision changes the written meter or tempo. The target is 0 4 8 11 (4+4+3+3). The original's last group subdivides evenly in eighths at 8 10 12. [onsets.ts](onsets.ts) prints the table.
- **Measured:** side effects, such as a changed meter, tempo, harmony, swing, or texture.
- **Recorded verbatim:** each subagent's reply and the interpretation in its comments.
- **By ear (Hiroshi):** the batch 2 revisions and batch 1's C runs are rendered with shuffled numeric names, listened to blind, and each is marked for whether it has the intended feel. The key is revealed afterwards.

## Raw output

- Scores: batch 1 `a1-vague.scrim` to `c3-spelled.scrim`, batch 2 `g-a1-vague.scrim` to `g-b3-ref.scrim`
- Replies: [replies.md](replies.md)
- Onset tables: [onsets.txt](onsets.txt)

## Batch 1 results

Measured from the scores, except where marked. All nine pass `check`. Three needed a fix first, each a 15-step bar.

- **C, spelled: 3 of 3 hit the target.** Keys and bass start on 0 4 8 11 in every bar, with nothing on 10 or 12. All three move the drums to kick on 0 and 8 and a snare on 11, so kick and snare alternate across the four pulses. Harmony, voicings, tempo, meter, and instruments are unchanged.
- **A, vague: 0 of 3.** All three read "lame" as stiff and static rather than as a wrong grouping. They add sixteenth hats, keys anticipating the bar line, busier sixteenth bass lines with ghost notes and approach notes, and drum bars that vary. a1 and a3 mark step 11 to split the last group 3+3, but the bass still plays through steps 10, 12, and 13. a2 swaps the string pad for a warm pad, and a3 adds light swing.
- **B, reference: 0 of 3, and all three rewrote the texture.** Each turned the loop into a swung acoustic piano trio: upright bass walking on every beat, a ride cymbal with a skip beat, hi-hat foot, piano comping and a right-hand line, no pad, and swing of 0.22 to 0.33. b2 rewrote it as 7/4 at quarter = 120, which doubles the bar length. b1 and b3 kept tempo 240 and treated each eighth as a walking quarter. Harmony and voicings are kept. The walking bass plays 0 2 4 6 8 10 12 and the hi-hat foot plays 2 6 10, which is 2+2+3 with the last group subdivided evenly. That is closer to the original 2 2 1 1 1 than to 2 2 1.5 1.5.
- **Knowledge check.** From memory, the model names Back at the Vanguard as the reference, calls it 7/4, and describes its grouping as 4+3 or 2+2+3 in quarters, with low to moderate confidence in the grouping. It never names a 4+4+3+3 split.

Inferred:

- The reference transferred genre and texture, not grouping. The model's stated knowledge of the recording matches what the B runs wrote, so this looks like a reading of the recording, not a failure to apply it. Whether that reading matches the recording is for Hiroshi's ear.
- An open prompt plus a style reference invites a full rewrite. So batch 1 cannot answer whether the groove alone moves toward Mehldau's 7, and batch 2 was added.

Batch 1 was rendered but not listened to, because the texture alone gives away the B runs.

## Batch 2 results

Measured from the scores, except where marked. All six pass `check`, and g-a1 needed a fix first for three 15-step bars.

- **A, vague: 0 of 3.** All three keep the voicings, instruments, harmony, and tempo, and rework the rhythm the same way as in batch 1: sixteenth hats, keys moved off the group starts onto offbeat sixteenths, syncopated sixteenth bass lines with ghost notes, drum bars that vary, and in two runs light swing (0.1). None places the bar on 4+4+3+3.
- **B, reference: 0 of 3, and the scope held.** All three keep the electric piano, string pad, electric bass, voicings, harmony, bar length, and tempo 240, and change only the rhythm. Each turns the groove into a swung walking feel: the bass walks on every beat (0 2 4 6 8 10 12), a new ride voice plays a skip-beat pattern, the hi-hat foot plays 2 6 10, the kick and snare drop the backbeat for ghost notes, and swing is 0.22 to 0.28. Because the tempo number stays 240, the walking pulse is 240 per beat, which g-b1 flagged as fast. As in batch 1, this is 2+2+3 with the last group subdivided evenly, not 2 2 1.5 1.5.

Inferred: with the scope set by the note, the B runs give the same groove as batch 1, without the instrument change. The reference consistently maps to a swung walking 2+2+3 in this model, which matches its knowledge check.

## Judgment

Pending the blind listen. The listening set is the six batch 2 runs and batch 1's three C runs, rendered as `.tmp/06-reference-feedback/01.wav` to `09.wav`. The key is in `key.txt` in the same directory, and batch 1's renders are in `batch1/`. The B runs remain recognizable by their ride cymbal and walking bass, so the blind comparison is mainly between A and C.

## Effect on claims

Pending.
