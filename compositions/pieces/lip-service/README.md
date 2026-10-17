# Lip Service

A pitch-bend and CC1 test for Toy MIDI's `automation` sequences (https://github.com/hi-ogawa/toy-midi/issues/804), written as a jump blues: 24 bars (two 12-bar choruses) in B♭, swung 4/4 at 168 BPM. Trumpet lead, an alto, tenor, and bari sax section, piano comping without pedal, walking acoustic bass, and a shuffle on the Standard kit. The two versions have the same notes and velocities. The only difference is the automation.

- `v2-expression.json`: pitch bend on the trumpet and on each sax, and CC1 on the trumpet's last note.
- `v1-plain.json`: no automation.
- `lip-service.mjs`: the generator. `node lip-service.mjs <dir>` writes both files.

Toy MIDI doesn't play `automation` yet, so listen to the offline renders (`tools/render/render.ts` on `fix/issue-863`, GeneralUser GS, fluidsynth).

## Sections

| Bars | Harmony | What the expression does |
|---|---|---|
| 1, 3, 5, 7 | B♭7, E♭7 | Trumpet riffs. A 1.5-semitone scoop into the second note of each riff, then a 5-6 semitone fall off the long note (bars 1, 5, 7) or a shake (bar 3). The bar 5 G5 is also scooped from 2 below |
| 2, 4, 6, 8 | B♭7, E♭7 to E°7, G7 | The sax section answers with two short hits and a long chord that ends in a doit (bars 2, 6) or a fall (bars 4, 8). Each sax is its own track, so the three voices bend together as separate lines |
| 9-10 | Cm7 F7 | A scooped riff up to G5, a scooped F5, and a 4-semitone doit off the C5 |
| 11-12 | B♭7 G7, Cm7 F7 | Turnaround hits with trumpet and saxes together, and the whole horn line falls 6 semitones off the G7. Then a straight chromatic run into the solo |
| 13 | B♭7 | The solo opens on a scooped F5 with a shake for three beats |
| 14-16 | E♭7, B♭7 | A fall off a D♭5, then a lip bend from D♭5 up to D5 (the blue third to the major third), then a climb |
| 17-18 | E♭7, E♭7 to E°7 | A scooped high B♭5 with a 7-semitone fall over its last beat, then a doit off G5 |
| 19-20 | B♭7, G7 | The density test: three scooped F5s in one bar of swung 8ths, then a scooped B4 and a fall off F5 |
| 21-22 | Cm7, F7 | A second shake on G5, then a straight run up to A5 |
| 23-24 | B♭ | Stop-time ending. A scooped high B♭5 is held for seven beats over a ride-cymbal roll. CC1 stays at 0 for a beat and a half, eases to about 52 over two beats, and deepens toward about 62 at the cutoff. On the final hit the saxes fall off |

## Expression per track

| Track | Program | Expression |
|---|---|---|
| Trumpet | 56 | Pitch bend: scoops, falls, doits, two shakes, one lip bend. CC1: terminal vibrato on the last note |
| Alto Sax, Tenor Sax, Bari Sax | 65, 66, 67 | Pitch bend: falls and doits on the answers, the turnaround, and the final hit. The solo pads have no bends |
| Piano | 0 | None (no pedal in either version) |
| Bass | 32 | None |
| Drums | bank 128, program 0 | None |

Notes on the curves:

- Points come every 1/32 beat, finer than the 1/32-note rule, because the player steps from point to point rather than interpolating. At 168 BPM a 1/32 note is 45 ms, which would make a two-semitone scoop audibly stepped and a 7 Hz shake impossible.
- The shake alternates the written note and about a whole step above at about 7 Hz (2.5 cycles a beat), dwells a little at each end, fades in after the attack, and fades out before the note ends.
- Falls and doits accelerate away from the note (ease-in) and end as the note ends. The bend returns to 0 about 1/8 beat after the release, or at the next note if that comes sooner.

## Loudness match

| Track | v1 LUFS | v2 LUFS |
|---|---|---|
| Mix | -24.9 | -24.9 |
| Trumpet | -28.9 | -28.9 |
| Alto Sax | -34.9 | -34.9 |
| Tenor Sax | -34.5 | -34.5 |
| Bari Sax | -35.4 | -35.5 |
| Piano | -35.8 | -35.8 |
| Bass | -31.7 | -31.7 |
| Drums | -32.4 | -32.4 |

A pitch track of the rendered trumpet confirms the shapes: the bar 13 shake swings between F5 and G5 about 2.5 times a beat, the bar 17 fall drops about 6 semitones over the last beat, and the vibrato on the final B♭5 starts about a beat and a half in. In v1 those notes are flat.
