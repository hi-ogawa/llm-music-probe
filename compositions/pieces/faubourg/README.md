# Faubourg

A soul-jazz riff tune after Roy Hargrove's "Strasbourg / St. Denis" (*Earfood*, 2008), composed directly in the session from the brief in [`prompt.md`](prompt.md).

**[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Ffaubourg%2Fproject.json)**

50 bars at 100 BPM in 4/4, F minor, about two minutes. `node compose.mjs` writes `project.json`.

## The bass figure

The upright bass carries the tune with a two-bar riff that the whole piece is built from.

| Bar | Notes | Idea |
|---|---|---|
| A | F2, F3, E♭3, C3 (held), A♭2, B♭2, B2 | Root, an octave leap, a fall to the fifth, then a blue chromatic climb |
| B | C3 (held), B♭2, A♭2, F2 (held), E♭2 | The climb lands on C, falls back to F, and the E♭ picks up into bar A |

The octave leap is the signature. It stays when the harmony moves to D♭9 and C7♯9, the kick drum follows the riff's rhythm, and in the solo it is the cue back: the bass teases bar A in solo bar 8, and its C octave leap in solo bar 16 is what snaps the band into the head.

## Feel

Toy MIDI has no swing setting, so the swing is written into the timing. The offbeat 8th lands at 58% of the beat in the intro and heads, which sits between straight (50%) and triplet swing (67%), and at 63% in the solo, so the groove loosens there. Horns, keys, and cymbals drift by up to about 1/100 of a beat so stacked parts don't hit together like a sequencer, and the bass stays on the grid.

## Form

| Bars | Section | Harmony | What happens |
|---|---|---|---|
| 1–8 | Intro | Fm9 | Hi-hat, kick, and congas for two bars, then the bass riff enters with the full groove (snare backbeat with ghost notes). Organ stabs join in bar 5, and a triplet fill leads into the head |
| 9–20 | Head | Minor blues: Fm9 ×4, B♭m9 ×2, Fm9 ×2, D♭9, C7♯9, Fm9 ×2 | Trumpet and tenor answer the riff in its gaps, a 4th apart. The second answer climbs with the bass's A♭–B♭–B and lands on C6. Bars 15–16 put the horns in octave unison with the bass, which is the punch. Over D♭9 and C7♯9 the horns, organ, and drums hit on the bass's octave leap. Tambourine on 2 and 4 |
| 21–28 | Trumpet solo | Fm9 ×2, D♭maj7♯11 ×2, B♭m9 ×2, Gø C7♯9, Fm9 | The harmony opens up. Bass plays in two, drums move to ride, hi-hat foot, and cross-stick, the Rhodes comps sparse offbeats over a soft organ pad, and the congas drop to open tones. The trumpet starts low and spare |
| 29–36 | Solo build | Fm9 ×2, A♭maj7, D♭maj7♯11, B♭m9, E♭13, D♭9, C7♯9 | The bass walks, snare comping joins, and tenor and trombone hold guide-tone backgrounds that enter on the "and" of 4 before each change and grow louder. The trumpet quotes the riff (bar 29), climbs to C6 and D♭6, and peaks on E♭6 over the C7♯9 break |
| 37–48 | Head out | As the head | The same head, louder, with the trombone joining the horns and the drums harder |
| 49–50 | Tag | Fm9 | Everyone plays riff bar A in unison, the climb lands on C, and the band hits F on beat 2. The cymbal is cut short |

The solo contrasts with the head through dynamics, density, and comping rhythm. The heads have short organ stabs on offbeats, a backbeat with ghost notes, and congas with tambourine. The solo has held organ pads under offbeat Rhodes, ride cymbal instead of hi-hat, a two-feel bass, and fewer, quieter notes, and it builds back up through its second half.

## Tracks

| Track | Preset | Pan | Role |
|---|---|---|---|
| Trumpet | Trumpet (56) | R15 | Head answers, solo |
| Tenor Sax | Tenor Sax (66) | L25 | Head answers under the trumpet, solo backgrounds |
| Trombone | Trombone (57) | R35 | Solo backgrounds and the head out |
| Organ | Drawbar Organ (16) | L40 | Stabs in the heads, pad in the solo |
| Rhodes | Electric Piano 1 (4) | R40 | Solo comping only |
| Upright Bass | Acoustic Bass (32) | Center | The riff |
| Drums | Jazz kit (bank 128, program 32) | Center | |
| Congas & Tambourine | Jazz kit (bank 128, program 32) | R50 | |

## Level check

The bass has to sit on top in the heads without burying the trumpet in the solo, so I rendered each track with [experiment 13's `loudness.mjs`](../../../experiments/13-loudness-mix-fix/loudness.mjs) (GeneralUser GS, fluidsynth, reverb and chorus off) and measured integrated loudness per section with ffmpeg's `ebur128`.

| Track (LUFS) | Head (9–20) | Solo (21–28) | Solo build (29–36) | Head out (37–48) |
|---|---|---|---|---|
| Mix | −24.7 | −28.6 | −25.7 | −23.6 |
| Upright Bass | −27.5 | −33.4 | −32.1 | −26.9 |
| Trumpet | −29.1 | −30.5 | −28.5 | −28.3 |
| Tenor Sax | −30.5 | −42.6 | −38.1 | −29.5 |
| Drums | −33.3 | −43.2 | −38.3 | −32.5 |

The first render had the trumpet 3.5 LU under the bass in the solo, so I turned the bass down (gain 1.0 to 0.85, and lower velocities in the solo) and brought the trumpet up (gain 0.75 to 0.95, and higher velocities in the solo). Now the bass leads the heads by about 1.5 LU and the trumpet leads the solo by 3 to 4 LU.

GeneralUser's ride cymbal is a quiet sample: steady 8ths at velocity 90 measure −42 LUFS on any kit. The ride plays near the top of the velocity range, and the drums still sit about 15 LU under the mix in the first half of the solo. If the ride disappears there, that is the sample, not the writing.
