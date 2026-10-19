# Château d'Eau

A soul-jazz riff tune after the techniques of Roy Hargrove's "Strasbourg / St. Denis" (*Earfood*, 2008). Château d'Eau is the next Métro stop up line 4 from Strasbourg–Saint-Denis.

**[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fchateau-d-eau%2Fproject.json)**

50 bars at 100 BPM in 4/4, E♭ major, looping the whole piece. The tracks are Trumpet, Alto sax, Tenor sax, Trombone, Rhodes solo, Rhodes comp, Guitar (open) and Guitar (muted) on Toy MIDI's Telecaster neck font, Organ pad, Upright bass, Drums, and Congas + shaker. `compose.mjs` generates `project.json`.

The session composed it directly from Hiroshi's brief, which asked for the reading of the reference to be written out as techniques before composing. Two earlier runs of an older brief came out as F minor blues because that brief called the head "bluesy" from an unchecked recollection, so this session checked the reading against published lead sheets instead of recalling it, and did not look at those two pieces.

## Reading of the reference

Checked against two lead sheets, [realjazz.es (concert)](https://www.realjazz.es/wp-content/uploads/2020/02/Strasbourg-St.Denis-C.pdf) and [matthiasbergmann.koeln (B♭, ♩=100)](http://matthiasbergmann.koeln/wp-content/uploads/2019/10/Strasbourg-St.Denis-Bb-C-Eb-Roy-Hargrove.pdf), and [OpenRealB](https://www.openrealb.com/sheet/strasbourg-st-denis), which lists it in A♭ as funk/soul "with call and response between horns and rhythm section". Not checked by listening to the record.

- **Key and mode.** A♭ major, plainly diatonic. It is not blues and not minor. It opens on B♭m7, the ii, so it can sound minor at first, and the tonic A♭Δ7 arrives only at the end of the phrase.
- **Harmony.** A two-bar cycle whose roots climb stepwise, ii → iii → IV (B♭m7 Cm7 | D♭Δ7), with F7♭9 (V/ii) snapping back to the top. The cycle runs three times, and the fourth time it goes on to E♭7♭9 → A♭Δ7 with F7♭9 as the turnaround, so the form is 8 bars. The solos use the same changes.
- **Groove.** Straight-16th soul-jazz at about ♩=100, not swing.
- **Head.** A short unison horn riff, a descending 16th sequence from high A♭ that drops and lands on a held A♭ over the IV chord. It is one gesture that comes back every two bars with small changes to its tail. An interlude has trumpet and sax trading 16th answers over the same cycle.
- **Bass.** The bass intro is the harmony: staccato climbing roots B♭–B♭–C–C, D♭ pushed on the "and" of 4 and held across the barline, then a walk down to F7. The push into IV is the hook.

What the piece takes from that, in its own key, notes, and turnaround, is a major key with a stepwise-rising diatonic cycle and a secondary dominant snapping back to its top, a staccato bass figure with an anticipated push over the barline, and a short 16th unison riff that keeps returning.

## Plan

| Bars | Section | Harmony | What happens |
|---|---|---|---|
| 1–8 | Intro | (Gm7 A♭Δ7 \| B♭7sus D7♭9) ×4 | The bass figure alone with 16th hats for two bars, then drums, then guitar chanks, Rhodes stabs, congas, and shaker. The horns' D7♭9 run is the pickup into the head. |
| 9–16 | Head 1 | Gm7 A♭Δ7 \| B♭7sus D7♭9 \| ×2 \| Gm7 A♭Δ7 \| B♭7sus B♭7 \| E♭Δ7 \| Cm9 D7♭9 | The riff in unison and octaves, trumpet and alto on top, tenor an octave below. |
| 17–24 | Head 2 | Same | The riff in two parts, with the alto on the nearest chord tone a third or more below. The trombone adds a guide-tone counter-line, and organ pad and tambourine come in. |
| 25–32 | Solo, loose | Gm11 (2) \| A♭Δ7♯11 (2) \| Gm11 (2) \| Cm11 (2) | Rhodes solo. One chord per two bars. Drums go to ride and cross-stick, the bass to long roots with space, the guitar to one off-beat chank a bar, and the horns lay out. |
| 33–36 | Solo, backgrounds | A♭Δ7♯11 (2) \| Fm9 (2) | Sustained horn pads behind the solo, with CC11 swells. Congas and snare ghosts return. |
| 37–40 | Solo, tightening | Gm11 \| A♭Δ7 \| B♭7sus \| B♭7sus D7♭9 | One chord per bar. The bass figure reassembles itself, the hats and backbeat return, and the horns push on the "and" of 4. A fill and the horns' D7♭9 run snap back into the head. |
| 41–48 | Head 3 | Head changes | The harmonized head at the loudest dynamic. |
| 49–50 | Ending | Gm7 A♭Δ7, E♭Δ9 on the "and" of 4 | The riff's first bar once more in stop time with everyone in octaves, then one anticipated E♭Δ9 hit with a crash. |

## The parts

- **Bass figure.** Per two-bar cycle: G2 staccato with a ghosted octave pop, G2 again, A♭2 twice, then B♭2 pushed on the "and" of 4 and tied over the barline into B♭7sus. In the second bar, a quick A♭–F pickup to B♭, then a D–C–A tumble over D7♭9 that falls back to G. The last cycle pushes E♭ into the tonic instead. It should identify the piece on its own, which is why the intro opens with it exposed.
- **Riff.** The horns enter on the "and" of 1, after the bass's downbeat, so bass and horns call and answer. The first bar is D–F–G with an accent and a fall to B♭. The second bar is E♭–F–A♭ and then the diminished run F♯–E♭–C–A over D7♭9 back to the top. The tail changes on repeats: the run rises instead in the second cycle, the third cycle opens on G5 to resolve that F♯, and the last two bars hold G5 over the tonic before the run comes back.
- **Contrast.** The solo section halves the harmonic rhythm, opens the chords to 11ths and ♯11, drops the drums to ride, and takes the horns out, so it breathes against the riff. It then tightens back over bars 33–40 through backgrounds, pushes, one chord per bar, and the bass figure returning.
- **Comping.** Sparse. The Rhodes plays one off-beat stab and the push per bar.
- **Guitar.** Written from the fretboard after the cutting-guitar lessons in [toy-midi#861](https://github.com/hi-ogawa/toy-midi/issues/861) and [Night Drive's cutting iteration](../night-drive-cutting-guitar/README.md). Each bar is a 16th grid of open accents, muted chks on the font's Muted preset, and air strokes, so open versus muted carries the rhythm instead of velocity steps. The open accents sit on beat 2 and on beat 4 over D7♭9, and a push on the "and" of 4 rings the next bar's chord, with the bass and the Rhodes. Grips are three notes on the G, B, and e strings, voice-led within a three-fret span around the 10th fret. Downstrokes roll low to high and add a fourth string under a chk, and upstrokes catch the top two strings slightly late. Accents choke at a 16th, and the last open stroke in a bar rings until the left hand lets go just before the next stroke. In the solo it drops to one open stroke and one chk per bar, then returns to the head grid from bar 37.

## Technique checklist

| Technique | Bars |
|---|---|
| Stepwise-rising diatonic cycle, iii → IV → V7sus | 1–24, 37–48 |
| Secondary dominant snap-back, D7♭9 = V/iii | Every second bar of the cycle, 40 |
| Anticipated push over the barline | Bass, Rhodes, and kick on the "and" of 4 into B♭7sus and E♭Δ7; horn pushes 37–39; the final hit 49 |
| Call and response, bass and horns | Head bars, since the horns enter after the bass's downbeat |
| Variation on repeats | Riff tails in 12, 13, and 14–16 of each head; unison → harmonized → loudest across the three heads |
| Guide-tone counter-line | Trombone F–G–A♭–F♯, heads 2 and 3 |
| Diminished run over V7♭9 | The riff's turnaround and the pickups 8 and 40 |
| Open harmony and slower harmonic rhythm in the solo | 25–36 |
| Horn backgrounds with swells | 33–36 |
| Harmonic rhythm tightening into the return | 37–40 |
| Stop-time ending with an anticipated tonic | 49 |

## Notes for listening

- The pads in bars 33–36 swell with CC11. If Toy MIDI doesn't play controller automation, they play flat at a soft velocity.
- Levels are set by role and not measured. If the riff or the bass figure sits under the rest, the compositions README's optional level check applies.
