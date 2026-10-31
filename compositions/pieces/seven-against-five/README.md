# Seven Against Five

A djent and prog-metal piece in 7/4 at 132 BPM, in drop E and E minor with a Phrygian F. It runs 49 bars, about 2:36. Toy MIDI's examples had rock at crunch and high gain but no metal, so this piece pushes the high-gain amp, the Telecaster's Muted preset and automation further. Two double-tracked rhythm guitars play palm-muted chugs that are grouped against the 7/4 bar, and the kick and bass hit with every chug. A lead guitar uses pitch-bend bends, vibrato and a dive. A clean break on the neck pickup with no amp comes before the heavy riff returns.

## Files

- [`project.json`](project.json): the project as a Toy MIDI `SharedProject`
- [`seven-against-five.mjs`](seven-against-five.mjs): the generator. `node seven-against-five.mjs` writes `project.json` next to it.

## How it was made

The piece was briefed from a brainstorm session that asked for an original djent piece in 5/4 or 7/4, with two high-gain rhythm guitars, a lead with bends, bass, drums and a clean break. The composing session read Toy MIDI's `/llms.txt` and its type declarations, and nothing else from Toy MIDI. It wrote the generator first. Then it ran the same function in the built-in browser on `/draft` and built the project through `window.toyMidi.runtime`, with `addMidiTrack`, `setMidiTrackNotes`, `setMidiTrackAutomation`, `setTrackAmp`, `setTrackEq`, `setTrackPan`, `addLocator` and `setComment`.

The session checked the piece without hearing it. An offline render with `renderMix` had no clipping and no NaN samples. Peaks were around -5 dB in the heavy sections, and the average level there was around -25 dB. The master gain was then raised from 0.8 to 1.0. Live playback ran with an empty console, and a share link of the project opened in the app with every track, locator and the comment. Nobody has listened to the piece yet, so the balance between the parts is untested.

## Form

The drums count every bar as 2+2+3 quarter notes, with hats on each quarter and the snare on beats 3 and 7 in the riffs. The guitars divide the same 28 sixteenths in other ways, which is where the tension comes from.

| Bars | Section | What happens |
|---|---|---|
| 1-4 | Intro | Riff A on the left guitar alone for two bars. Then the right guitar, bass and drums come in, with floor toms on the snare beats and a snare roll into bar 5. |
| 5-12 | Riff A | Sixteenths grouped `3+3+2 \| 3+3+2 \| 3+3+2 \| 4`. Three tresillos of muted low-E chugs, then a one-beat open chord stab. The stab moves F5, G5, F5, then C5 to B5 across each 4-bar phrase. |
| 13-20 | Riff B (5 over 7) | A 5-sixteenth cell (chug, chug, rest, chug, rest) repeats against the bar. 5 doesn't divide 28, so the cell lands somewhere new in each bar while the snare stays put. It resets every 4 bars with a C5 to B5 stab. Ride bell in the first phrase, china in the second. |
| 21-28 | Lead chorus | Open E5, C5, G5 and D5 chords on the group heads (beats 1, 3 and 5), the snare on the second pulse of each group (beats 2, 4 and 6), and a two-sixteenth chug pickup on beat 7. The lead plays an 8-bar melody over it. The last bar rings out. |
| 29-36 | Clean break | Neck pickup with no amp. Arpeggios on Em9, Cmaj9, Gmaj7 and Dsus2, with eighths grouped 3+2+2 \| 3+2+2. Volume swells, soft bass and a light kit with a cross-stick enter in bar 31. A tom build in bar 36 leads back in. |
| 37-40 | Riff A return | One phrase of Riff A. |
| 41-44 | Breakdown | Eighths grouped `3+3+3+3+2`, a half-time snare, and a china cymbal on every hit. Bar 44 drops the last stab for a snare pickup. |
| 45-49 | Outro | The second half of the lead melody over the chorus chords, then one ringing E5 chord with the lead bending up to E. |

## The parts

- **Rhythm guitars.** There are four tracks on `flamestudios-telecaster-bridge`, all through the `high-gain` amp with the cabinet on. Each side has a Muted track (program 1) for the chugs and a Standard track (program 0) for the open power chords, because a track has one preset. Left and right are panned to -0.85 and 0.85. Each side gets its own small timing and velocity drift from a seeded random number generator, so the two sides sound like two takes and not one track copied.
- **Lead.** The bridge pickup through `high-gain`, panned slightly right. Every bend, vibrato and dive is pitch-bend automation. Points hold their value until the next point, so a bend is four steps over half a beat, and the vibrato is a 0.3-semitone sine sampled every 1/12 beat. One note bends up a whole step and then releases, and the last chorus note dives 2 semitones.
- **Clean guitars.** Two tracks on `flamestudios-telecaster-neck` with no amp. One plays the arpeggios on the left. The other plays the upper chord tones an octave up on the right, with CC 11 ramping from 0 to 100 over 2.5 beats and back down in each bar, so the chords swell in like a volume pedal.
- **Bass.** General MIDI picked bass (program 34) an octave under the chugs, through the `crunch` amp with the cabinet off for grit.
- **Drums.** The Power kit (bank 128, program 16). The kick doubles every chug and stab, so the guitars, bass and kick hit as one instrument.

**CC 11 tail muting.** The type docs warn that the amp's drive makes each note's release tail loud enough to smear into the next note. So every amped track has CC 11 at 127 while a note sounds and at 0 from 0.03 beats after its note-off until the next note-on. The lead uses 0.08 beats. The generator builds this automation from the notes, so the gate always follows the riff.

**EQ.**

- Rhythm guitars: high-pass at 95 Hz, a cut at 320 Hz, and a low-pass at 8.5 kHz. The left side is lifted at 1.3 kHz and the right at 2.6 kHz, so the two takes sit apart.
- Bass: a lift at 85 Hz, a cut at 650 Hz where the guitars sit, and a low-pass at 2.8 kHz.
- Lead: high-pass at 220 Hz, a cut at 450 Hz, and a lift at 1.9 kHz, so it sits above the rhythm guitars.
- Drums: a cut at 420 Hz for boxiness and a lift at 4.5 kHz for attack.

## Toy MIDI doc gaps

- **Range of the Telecaster SoundFonts.** The docs don't say which notes are sampled. The session wrote the piece in drop D, assuming notes below the lowest sample would only sound unnatural. A listen found the chugs silent, and the SoundFont files map only keys 40-84 (E2-C6) on both presets, so nothing below E2 plays at all. The generator now moves every pitched track up a whole step to drop E, which puts the lowest chug on E2.
- **Amp output level.** The docs don't say how loud the amp output is compared with the dry track, so the track gains were set by role. A render showed safe peaks, but the balance between the amped and clean parts is a guess.
- **Ramps in automation.** Points hold their value until the next point, and there is no way to ask for a linear ramp. Bends, vibrato and swells use dense points, and it isn't clear whether steps of 1/12 beat sound smooth or make audible zipper noise.
- **Power kit note map.** The docs list the drum kits by program but not their notes. The piece assumes the General MIDI drum map, including china at 52 and ride bell at 53.
- **Cabinet off.** The docs say what `cabinet` controls but not how `crunch` sounds without it, which the bass relies on.
- **`renderMix` timing.** A render of 2.6 minutes took over 45 seconds in a hidden browser pane, so a call that awaits it hits a tool timeout. The docs don't mention how long a render takes, so a caller can't plan for it, for example by starting it and checking back.
