# Hard rock riff

A demo piece for A/B renders of an amp sim on Toy MIDI's clean Telecaster, for https://github.com/hi-ogawa/toy-midi/issues/934. Where [quiet-loud guitar](../quiet-loud-in-e/prompt.md) covers the range from clean to high gain, this one stays at crunch, the gain where full chords with thirds still ring clearly, and adds a lead with bends, where distortion's sustain is most audible. Blues-based hard rock is built on exactly that pairing.

Run on 2026-10-18, and the piece is in this folder. The composing session got only the prompt below, as [experiments/README.md](../../experiments/README.md) says, so the purpose above stays out of it.

## Prompt

> compose a ~24-bar blues-based hard rock piece in Toy MIDI built around one guitar riff, and save the project file. Follow https://toy-midi.hiro18181.workers.dev/llms.txt. Use technique names from the cheatsheet https://gist.github.com/hi-ogawa-agent/ebb143c64417ed58b4e9971e4f838e4c (composition-landscape.md).
>
> The guitars will go through an amp sim in an offline render, so Toy MIDI plays them clean for now. Write the rhythm guitars for crunch and the lead for a higher gain. Keep each gain level on its own guitar tracks, named by gain, so the render can drive each track at one setting. Use the bundled Telecaster bridge SoundFont for the guitars, its Standard preset for open strokes and Muted for muted strokes, in standard tuning.
>
> Elements:
>
> - Form: around 125 BPM with straight 8ths. The riff alone, then the band in on it, then a section over a contrasting chord pattern, a lead break, and the riff again before the loop.
> - Hook: an instrumental riff hook in open position, mixing single notes, double stops, and open chords, with riff bass doubling it.
> - Harmony: Mixolydian and double-plagal cadences (♭VII–IV–I) around a key with open low strings, such as A or E. Full open chords with thirds are fine at this gain.
> - Guitar writing: real chord shapes, with open against muted strokes carrying the rhythm rather than velocity steps. A second rhythm guitar playing open chords against the riff, panned away from it.
> - Lead: pentatonic and blues-scale hooks, with bends and vibrato written as pitch-bend automation on the longer notes. Bring the lead in after stop-time and breaks, with band hits followed by space.
> - Rhythm section: a rock kit on a straight backbeat, with the kick under the riff's accents.
> - Mix: check that the riff and the lead stay audible against the drums in every section, and say how you checked.
>
> Loop the whole piece, so the end leads back into the start. Leave out optional track fields such as height and viewMode, so their defaults apply. Before writing notes, write a short bar-by-bar plan with each section's gain. After, give a checklist mapping each technique to bars where it appears. Save the project JSON next to a README.md with the plan and the checklist.

## Renders to compare

Each in the loop and with the guitars soloed:

1. The guitar parts on General MIDI's Overdriven and Distortion Guitar (programs 29 and 30), the baseline an amp sim has to beat.
2. The Telecaster bridge through the amp sim at each track's gain, which shows whether full chords stay clear at crunch and whether the bends sing.
3. The FlameStudios Les Paul bridge (from the `soundfonts-1` release) through the same settings. A Les Paul is the classic guitar for this style, so this is the stronger test of #934's question about bundling a humbucker.
