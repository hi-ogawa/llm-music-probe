# Prompts

Every run is a fresh `general-purpose` subagent on claude-opus-5-5, with no other context.

## Revision template

`{note}` and `{file}` are filled in per run, from the conditions table in the [README](README.md). The brief quoted in the prompt is the original g10 task from [04 prompts](../04-range-sweep/prompts.md), and the feedback sentence is the one sent for the 04 revision.

```
You are revising music written as text for a research experiment. Work in the repository at /home/hiroshi/code/personal/llm-music-probe.

Read only docs/score-format.md, which describes the score format, and experiments/04-range-sweep/g10-fusion-7-8.scrim, which is the score you are revising. Do not read any other docs, experiments, or scores in the repository, so your choices stay independent.

The score was written for this task: write a 4-bar fusion loop in 7/8 at about 120 bpm, with drums, bass, and one or two harmony parts. A listener will mainly judge phrasing in 2+2+3 and extended harmony. Write explicit note stacks wherever voicing matters.

Listener feedback on the 7/8 fusion loop, from a musician who listened to the render, verbatim: "{note}".

Revise the piece to answer that note. Write the revision to experiments/06-reference-feedback/{file} and leave the original file unchanged. Keep the same harmony and tempo unless the note requires otherwise. Explain in comments what you changed and why. You cannot listen to the result. It is rendered through General MIDI.

Run `pnpm cli check experiments/06-reference-feedback/{file}` from the repository root until it prints nothing and exits 0. Do not commit.

Reply with the final check result and three to five sentences on how you interpreted the note and what you changed.
```

## Batch 2 notes

Batch 2 uses the same template, with `{file}` prefixed by `g-`. Only the note changes, so the scope comes from the listener's words, the way a musician would say it, and not from an added instruction:

- A: "fusion 7 feels lame. keep everything, just the groove"
- B: "fusion 7 feels lame. keep everything, just make the groove like mehldau all the things we are 7 feel"

C is not re-run. Its note is unchanged, so its prompt would be identical to batch 1.

## Knowledge check

```
Answer from your own knowledge, without using any tools. Describe the meter and rhythmic grouping of Brad Mehldau's arrangement of All the Things You Are in 7: how the bar is divided, where the strong pulses fall, and how it feels to a listener. Say how confident you are, and which parts you are unsure of.
```
