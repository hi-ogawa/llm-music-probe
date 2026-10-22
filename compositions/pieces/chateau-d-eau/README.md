# Château d'Eau

A soul-jazz riff tune after the techniques of Roy Hargrove's "Strasbourg / St. Denis" (*Earfood*, 2008). Château d'Eau is the next Métro stop up line 4 from Strasbourg–Saint-Denis.

- **v3, the guitar answers the bass and the figure develops: [open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fchateau-d-eau%2Fv3.json)** (`v3.json`, made by `compose.mjs`)
- v2, fuller arrangement: [open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fchateau-d-eau%2Fv2.json) (`v2.json`, made by `compose-v2.mjs`)
- v1, first take: [open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fchateau-d-eau%2Fv1.json) (`v1.json`, made by `compose-v1.mjs`)

50 bars at 100 BPM in 4/4, E♭ major, looping the whole piece. From v2 on, the tracks are Trumpet, Alto sax, Tenor sax, Bari sax, Trombone, Brass section (body), French horns, Rhodes solo, Rhodes comp, Guitar on Toy MIDI's Telecaster neck font, Organ, Strings, Upright bass, Drums, and Congas + shaker.

The session composed it directly from Hiroshi's brief, which asked for the reading of the reference to be written out as techniques before composing. Two earlier runs of an older brief came out as F minor blues because that brief called the head "bluesy" from an unchecked recollection, so this session checked the reading against published lead sheets instead of recalling it, and did not look at those two pieces.

## Reading of the reference

Checked against two lead sheets, [realjazz.es (concert)](https://www.realjazz.es/wp-content/uploads/2020/02/Strasbourg-St.Denis-C.pdf) and [matthiasbergmann.koeln (B♭, ♩=100)](http://matthiasbergmann.koeln/wp-content/uploads/2019/10/Strasbourg-St.Denis-Bb-C-Eb-Roy-Hargrove.pdf), and [OpenRealB](https://www.openrealb.com/sheet/strasbourg-st-denis), which lists it in A♭ as funk/soul "with call and response between horns and rhythm section". Not checked by listening to the record.

- **Key and mode.** A♭ major, plainly diatonic. It is not blues and not minor. It opens on B♭m7, the ii, so it can sound minor at first, and the tonic A♭Δ7 arrives only at the end of the phrase.
- **Harmony.** A two-bar cycle whose roots climb stepwise, ii → iii → IV (B♭m7 Cm7 | D♭Δ7), with F7♭9 (V/ii) snapping back to the top. The cycle runs three times, and the fourth time it goes on to E♭7♭9 → A♭Δ7 with F7♭9 as the turnaround, so the form is 8 bars. The solos use the same changes.
- **Groove.** Straight-16th soul-jazz at about ♩=100, not swing.
- **Head.** A short unison horn riff, a descending 16th sequence from high A♭ that drops and lands on a held A♭ over the IV chord. It is one gesture that comes back every two bars with small changes to its tail. An interlude has trumpet and sax trading 16th answers over the same cycle.
- **Bass.** The bass intro is the harmony: staccato climbing roots B♭–B♭–C–C, D♭ pushed on the "and" of 4 and held across the barline, then a walk down to F7. The push into IV is the hook.

What the piece takes from that, in its own key, notes, and turnaround, is a major key with a stepwise-rising diatonic cycle and a secondary dominant snapping back to its top, a staccato bass figure with an anticipated push over the barline, and a short 16th riff that keeps returning.

## Plan

| Bars | Section | Harmony | What happens |
|---|---|---|---|
| 1–8 | Intro | (Gm7 A♭Δ7 \| B♭7sus D7♭9) ×4 | The bass figure alone with 16th hats for two bars, then drums with the guitar doubling the figure for two bars, then guitar stabs, the Rhodes phrase, organ, congas, and shaker. The horns' D7♭9 run is the pickup into the head. |
| 9–16 | Head 1 | Gm7 A♭Δ7 \| B♭7sus D7♭9 \| ×2 \| Gm7 A♭Δ7 \| B♭7sus B♭7 \| E♭Δ7 \| Cm9 D7♭9 | The riff spread over trumpet, alto, and tenor with the Brass Section under them. |
| 17–24 | Head 2 | Same | The bari joins the riff, the trombone adds a guide-tone counter-line, and the tambourine comes in. The bass figure starts to vary. |
| 25–32 | Solo, loose | Gm11 (2) \| A♭Δ7♯11 (2) \| Gm11 (2) \| Cm11 (2) | Rhodes solo. One chord per two bars. Drums go to ride and cross-stick, the bass to long roots with space, and the guitar to ringing sixths. The riff horns lay out, and French horn pads and strings swell under the solo. |
| 33–36 | Solo, backgrounds | A♭Δ7♯11 (2) \| Fm9 (2) | Alto, tenor, and trombone join the pads. Congas and snare ghosts return. |
| 37–40 | Solo, tightening | Gm11 \| A♭Δ7 \| B♭7sus \| B♭7sus D7♭9 | One chord per bar. The bass figure reassembles itself, the hats and backbeat return, and the horns push on the "and" of 4. A fill and the horns' D7♭9 run snap back into the head. |
| 41–48 | Head 3 | Head changes | The head at the loudest dynamic, with strings, French horns doubling the counter-line, and the guitar's octave counter-line. |
| 49–50 | Ending | Gm7 A♭Δ7, E♭Δ9 on the "and" of 4 | The riff's first bar once more in stop time with everyone in octaves, then one anticipated E♭Δ9 hit with a crash. |

## The parts

- **Bass figure.** Per two-bar cycle: G staccato with a ghosted octave pop, G again, A♭ twice, then B♭ pushed on the "and" of 4 and tied over the barline into B♭7sus. In the second bar, a quick A♭–F pickup to B♭, then a D–C–A tumble over D7♭9 that falls back to G. The last cycle pushes E♭ into the tonic instead. It should identify the piece on its own, which is why the intro opens with it exposed. Head 1 states it plain. From v3, heads 2 and 3 vary it about every other bar: fills into the turnaround (bars 20, 24, 42, and 48), into the push to the tonic (46), and new answers in place of the octave pop (21 and 43).
- **Riff.** The horns enter on the "and" of 1, after the bass's downbeat, so bass and horns call and answer. The first bar is D–F–G with an accent and a fall to B♭. The second bar is E♭–F–A♭ and then the diminished run F♯–E♭–C–A over D7♭9 back to the top. The tail changes on repeats: the run rises instead in the second cycle, the third cycle opens on G5 to resolve that F♯, and the last two bars hold G5 over the tonic before the run comes back.
- **Contrast.** The solo section halves the harmonic rhythm, opens the chords to 11ths and ♯11, drops the drums to ride, and takes the horns out, so it breathes against the riff. It then tightens back over bars 33–40 through backgrounds, pushes, one chord per bar, and the bass figure returning.
- **Comping (v2).** Few attacks, each ringing. The Rhodes plays a two-bar phrase per cycle: chords held for a dotted quarter or longer on the bass's hits and pushes, and a small answer in the hole at the start of each second bar, where the horns rest. The organ holds every chord from bar 5 on, and strings join in the solo and head 3.
- **Guitar (v3).** Its own part, answering the bass. In the intro, heads 1 and 2, and bars 37–40 it plays soul-jazz stabs: three-note grips on the D, G, and B strings around frets 6–10 (B♭3–A♭4), voice-led in one position, with muted scratches between. The stabs fall in the holes the bass figure leaves: the "and" of 2 and beat 4 in the first bar of each cycle, and the "and" of 1 and of 3 in the second, while the bass holds its push. In head 3 it plays a Wes-style octave counter-line instead, in the start of each second bar where the horns rest, with an octave hit on each push. It doubles the bass figure only as an event, in bars 3–4 and the stop-time ending. In the loose part of the solo it plays ringing sixths.
- **Horn section (v2).** No literal unison except the stop-time ending. The riff is spread over trumpet, a second voice in the alto, tenor an octave down, and bari two octaves down from head 2, and GM's Brass Section doubles both voices an octave down for body. Each player has a fixed lean on the beat (alto 6 ms, tenor 11, trombone 9, bari 14 behind the trumpet) and a small fixed detune through pitch bend, within ±7 cents. The B♭ ending each riff bar falls off through pitch bend, and the G held over the tonic arrival and the trombone's guide tones are played sfz, drop, and swell through CC11. French horns pad the solo from bar 25 with swells, alto, tenor, and trombone join from bar 33, and the whole section pushes in bars 37–39.

## v3 rework

Hiroshi's listen to v2: "overall interesting but upright and tele unison sound a bit thin and feels lack of musical idea, i.e. boring." In v2 the guitar played the bass figure exactly an octave up from bar 3 to 49, mostly E2–G3, where a clean Telecaster has little body, and the figure itself repeated nearly unchanged through the heads. v2 had picked the doubling to make the bass figure stronger as the hook, but shadowing it added neither body nor a new line. v3 changes only the guitar and the bass:

- **The guitar gets its own role,** stabs in the bass figure's holes in its middle register, and an octave counter-line in head 3, as above. The doubling stays only as an event.
- **The figure develops across the heads,** with fills and new answers, as above, so head 1 states it and the later heads play with it.

The guitar sits about 5.7 LU under the bass in heads 1 and 2, and 5.0 LU under in head 3, measured the same way as below. Every other level is unchanged from v2.

## v2 rework

Hiroshi's listen to v1: the comping and backing felt spotty and the whole thin, and a small General MIDI ensemble can't carry the nuance and depth a real combo would, with horn unison the clearest case. Toy MIDI also plays MIDI tracks dry ([toy-midi#842](https://github.com/hi-ogawa/toy-midi/issues/842)), so there is no room to blend a section. v2 keeps the riff, the bass figure, the form, and the harmony, and fakes depth through the arrangement:

- **Phrases instead of hits.** v1's backing was per-bar templates of short hits, so almost nothing rang between the riff's attacks. v1 had read "keep comping sparse" as short. v2 keeps the attacks few and lets them ring, as above.
- **A bigger section with surface techniques.** Spread voicings instead of unison, an ensemble patch under the solo horns, fixed player leans and detunes, and falls and sfz swells, as above.
- **The bass in its real register.** v1 wrote the figure an octave above a real bass, with roots around G2. v2 plays it an octave down, with E1 as its floor, and lets notes ring closer to full value, keeping the pops short and the pushes tied.
- **The solo's first half filled.** French horn pads and strings with swells under the Rhodes from bar 25, so the section breathes without going empty.

### Levels

Measured with experiment 13's `loudness.mjs` (fluidsynth, GeneralUser, no reverb), and the guitar separately on the Telecaster neck font, because the tool ignores the `soundfont` field and automation. Before rebalancing, the heads had the bass 2.8 LU over the lead trumpet, the solo had the Rhodes level with the bass and the French horns, and the organ sat about 16 LU under the mix. The gains were set from those numbers: bass −1.6 dB, trumpet +1.7 dB, Rhodes solo +2.8 dB, French horns −1.7 dB, and organ +3.8 dB, which puts the trumpet level with the bass in the heads and the Rhodes about 2 LU over the bass in the solo. The guitar sits about 5 LU under the bass it doubles. The CC11 default is 127 so that the measured levels hold in Toy MIDI. Not re-rendered after the gain change, since gain only scales each track.

## Technique checklist

| Technique | Bars |
|---|---|
| Stepwise-rising diatonic cycle, iii → IV → V7sus | 1–24, 37–48 |
| Secondary dominant snap-back, D7♭9 = V/iii | Every second bar of the cycle, 40 |
| Anticipated push over the barline | Bass, Rhodes, and kick on the "and" of 4 into B♭7sus and E♭Δ7; horn pushes 37–39; the final hit 49 |
| Call and response, bass and horns | Head bars, since the horns enter after the bass's downbeat |
| Variation on repeats | Riff tails in 12, 13, and 14–16 of each head; the section grows across the three heads |
| Guide-tone counter-line | Trombone F–G–A♭–F♯, heads 2 and 3 |
| Diminished run over V7♭9 | The riff's turnaround and the pickups 8 and 40 |
| Open harmony and slower harmonic rhythm in the solo | 25–36 |
| Horn backgrounds with swells | 25–36 |
| Harmonic rhythm tightening into the return | 37–40 |
| Stop-time ending with an anticipated tonic | 49 |

## Notes for listening

- v1's levels are set by role and not measured. v2's are measured, see above.
