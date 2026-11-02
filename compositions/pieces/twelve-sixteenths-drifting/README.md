# Twelve Sixteenths, Drifting

A minimalist phase piece for two marimbas and a vibraphone, in the manner of Steve Reich's phasing works but built on its own cell. Two marimbas, panned hard left and right, play one 12-note cell. The left part never changes. The right part jumps one 16th ahead at each phase step, so every step makes a new composite rhythm, until the twelfth step brings the parts back into unison. It runs 98 bars at 126 BPM in 3/4, about 2:20.

**[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Ftwelve-sixteenths-drifting%2Fproject.json)**

## Files

- `project.json`: the project as a Toy MIDI `SharedProject`.
- `twelve-sixteenths-drifting.mjs`: the generator. `node twelve-sixteenths-drifting.mjs` writes `project.json` next to it.

## How it was made

The piece was briefed from a brainstorm about filling gaps in Toy MIDI's examples, which had no minimalist or phasing piece. The brief asked for two marimbas on one 12-note cell, one part shifting a 16th ahead every few bars, a soft third voice, CC 11 swells for an arc, and a locator at each phase step.

The session read Toy MIDI's `/llms.txt` and type declarations, wrote the generator as a plain function, and ran it in the built-in browser on the `/draft` page, where it built the song through `window.toyMidi.runtime` (`setTempo`, `addMidiTrack`, `setMidiTrackNotes`, `setMidiTrackAutomation`, `setTrackPan`, `addLocator`, `setComment`). It checked the result by playing from four points and by rendering the mix with `renderMix`, which showed the dynamic arc and the right part entering on its own channel. The first render peaked at only 0.14, so the track gains were raised by about 7 dB to a peak of 0.32. The same function, run in Node, produces `project.json`, and its notes match the ones in the page.

Nobody has listened to it yet.

## Form

| Bars | Section | What happens |
|---|---|---|
| 1–4 | Cell alone | Marimba I plays the cell on the left. |
| 5–8 | Unison | Marimba II fades in on the right from silence, in unison. |
| 9–26 | Phases 1–3 | Marimba II is 1, 2, then 3 sixteenths ahead, 6 bars each, so the parts move apart quickly. The vibraphone enters at phase 3. |
| 27–42 | Phases 4–5 | 8 bars each. The dynamics keep rising and the vibraphone chords thicken. |
| 43–54 | Phase 6 | The half cycle, 6 sixteenths apart, held for 12 bars. It is the loudest and densest point. |
| 55–70 | Phases 7–8 | 8 bars each. The dynamics ease back. |
| 71–88 | Phases 9–11 | 6 bars each, hurrying home. The vibraphone thins out and stops before phase 11. |
| 89–96 | Phase 12 | Back in unison, with no vibraphone, fading from CC 11 102 to 72 before the last stroke. |
| 97–98 | Final stroke | A and E in the marimbas over an open A–E–B vibraphone chord. |

## The parts

- **The cell.** Twelve 16ths: A4 E5 D5 B4, E5 A4 F♯5 D5, B4 E5 D5 F♯4. It uses only six pitches, so it hangs between D major and B minor without settling on either. Accents fall on every third 16th (3+3+3+3), which cuts across the quarter-note beat and gives each part a dotted-eighth lilt.
- **Marimba I (steady), hard left.** Plays the cell unchanged from the first bar to the last.
- **Marimba II (phasing), hard right.** Plays the cell rotated ahead by one more 16th at each step, so in step *k* it starts on note *k*+1. The accents move with the notes, so the accent patterns of the two parts drift against each other. The shifts are abrupt rather than gradual, so each step can be heard as a pattern of its own.
- **Vibraphone, center.** Enters at phase 3 with slow, open dyads and triads drawn from the cell's pitch set. It strikes every four bars, grows to four-note chords at the half cycle, and drops out before the return, so the unison is heard bare. It comes back only for the final chord.
- **Dynamics.** CC 11 on both marimbas carries one arc, from 82 at the start up to 116 at the half cycle and back down. Each phase step also dips a little as the shift lands and swells back, so the joins breathe. Each vibraphone stroke has its own CC 11 swell, which rises while the note decays.
- **Step lengths.** The steps are not all the same length, because the arc comes from them as much as from the dynamics: 6 bars moving away, 8 bars in the middle, 12 bars at the half cycle, and 6 bars on the way home.

## Toy MIDI doc gaps

- **Expected levels.** The docs give the gain range but not how loud a GeneralUser preset plays at unity gain and full velocity. With gains of 0.8 and CC 11 around 100, the mix peaked at 0.14, which is about −17 dBFS. It took a render to find that out.
- **The CC 11 default.** The docs don't say what value CC 11 holds before a track's first automation point. The piece starts every CC 11 sequence at beat 0, so it doesn't depend on the answer.
- **Preset decay.** The docs don't say how long a preset rings, or whether a long vibraphone note sustains or decays on its own. The vibraphone notes are 12 beats long, and the CC 11 swells assume the sound decays under them.
- **An empty `/draft` page.** The docs describe `/draft` with a payload but not without one. Opened bare, it has an empty project with one audio track, which the session removed so the result matches a `SharedProject`, which has no audio tracks.
