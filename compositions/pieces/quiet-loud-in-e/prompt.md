# Quiet-loud guitar

A demo piece for A/B renders of an amp sim on Toy MIDI's clean Telecaster, for https://github.com/hi-ogawa/toy-midi/issues/934. The quiet-loud form plays the same riff clean in the verse and distorted in the chorus, so one piece tests the drive across its range on the same notes. Hard rock or metal would test only one end, and [hard rock riff](../open-e-mixolydian/prompt.md) covers crunch and a lead with bends.

Run on 2026-10-18, and the piece is in this folder. The composing session got only the prompt below, as [experiments/README.md](../../experiments/README.md) says, so the purpose above stays out of it.

## Prompt

> compose a ~24-bar rock piece in Toy MIDI built on quiet-loud dynamics, and save the project file. Follow https://toy-midi.hiro18181.workers.dev/llms.txt. Use technique names from the cheatsheet https://gist.github.com/hi-ogawa-agent/ebb143c64417ed58b4e9971e4f838e4c (composition-landscape.md).
>
> The guitars will go through an amp sim in an offline render, so Toy MIDI plays them clean for now. Write every guitar part for the gain it gets: clean, crunch, or high gain. Keep each gain level on its own guitar tracks, named by gain, so the render can drive each track at one setting. Use the bundled Telecaster bridge SoundFont for the guitars, its Standard preset for open strokes and Muted for palm mutes, in standard tuning.
>
> Elements:
>
> - Form: around 120 BPM. An intro riff at crunch, a verse with the same riff clean, a palm-muted pre-chorus that builds, a chorus on open power chords at high gain, and a short lead break over the chorus chords before the loop. Fills and build rolls into the chorus, with a drum dropout just before its downbeat.
> - Harmony: power chords (root, fifth, octave) at high gain. Fuller chords with thirds only in the clean and crunch sections, where distortion doesn't muddy them. A key with open low strings, such as E or A.
> - Guitar writing: guitar idioms in real chord shapes held in one position, with open against palm-muted strokes carrying the rhythm rather than velocity steps. Stereo width from double-tracking the chorus rhythm guitar on two tracks panned hard left and right, with slightly different timing.
> - Lead: a short single-note line with one or two bends written as pitch-bend automation, on notes long enough for the sustain to show.
> - Rhythm section: a rock kit with the kick locked to the palm mutes, and a root pulse bass under the chorus.
> - Mix: check that the guitars stay audible against the drums in every section, and say how you checked.
>
> Loop the whole piece, so the end leads back into the start. Leave out optional track fields such as height and viewMode, so their defaults apply. Before writing notes, write a short bar-by-bar plan with each section's gain. After, give a checklist mapping each technique to bars where it appears. Save the project JSON next to a README.md with the plan and the checklist.

## Renders

Toy MIDI's amp sim prototype renders this piece, with the comparisons and what was heard in its README: https://github.com/hi-ogawa/toy-midi/tree/main/tools/amp-sim (added in https://github.com/hi-ogawa/toy-midi/pull/963).
