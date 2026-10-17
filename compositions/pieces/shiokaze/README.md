# Shiokaze

A pitch bend, CC1, and CC64 test for Toy MIDI's `automation` sequences (https://github.com/hi-ogawa/toy-midi/issues/804), written as a short 1980s city pop tune: 16 bars, 4/4, 116 BPM, F major, with an alto sax lead over fretless bass, Rhodes, clean guitar, and drums. The two versions have the same notes and velocities.

- `v2-expression.json`: pitch bend and CC1 on the alto sax, pitch bend on the fretless bass, CC64 on the Rhodes.
- `v1-plain.json`: no automation. Instead of the pedal, the Rhodes notes from bar 9 are lengthened, the way an agent fakes sustain: each note is held 1.5 beats, cut at the chord change, and the last chord is held to the end.
- `shiokaze.mjs`: the generator. `node shiokaze.mjs <dir>` writes both files.

Toy MIDI doesn't play `automation` yet, so listen to the offline renders (`tools/render/render.ts` on `fix/issue-863`, GeneralUser GS, fluidsynth).

## Tracks

| Track | Preset | Expression in v2 |
|---|---|---|
| Alto Sax | 65 Alto Sax | Pitch bend: scoops from 1.2 to 1.5 semitones below into each phrase start, reaching pitch within a 1/16 note. Falls of 4 to 6 semitones and doits of +3 off phrase ends. CC1: delayed vibrato on the five notes of 2 beats or longer |
| Fretless Bass | 35 Fretless Bass | Pitch bend: glides into the next root at seven chord changes, with the held note bending over its last half beat |
| Rhodes | 4 Tine Electric Piano | CC64 from bar 9, lifted at each chord change and pressed again a 1/16 note later |
| Guitar | 27 Clean Guitar | None. Muted chops on 2 and 4 |
| Drums | Standard kit | None |

## Sections

| Bars | Harmony | What to listen for |
|---|---|---|
| 1-4 | Bbmaj9 C9 Am7 Dm9 | The scoop into A4 on the and of 1. The long E5 over C9 (bars 1-2) starts straight and the vibrato blooms after about half a beat. The answer phrase falls off A4 at the end of bar 4. The bass slides Bb→C and C→A. The Rhodes comps dry stabs, without the pedal in either version |
| 5-8 | Gm9 C9 Fmaj9 A7 | A doit off C5 on beat 3 of bar 6, then a long C#5 over A7 with delayed vibrato. The bass glides D→G down a fifth into bar 5 and C→F into bar 7 |
| 9-12 | Bbmaj9 A7 Dm9 Cm7 F13 | The climax: the sax climbs to G5 over A7, a wider vibrato, then a 6-semitone fall. The Rhodes switches to broken chords. In v2 the pedal lets each chord build into a wash and clear at the change, while in v1 the notes stop after 1.5 beats. A doit off F5 into bar 13 |
| 13-16 | Bbmaj9 Am7 D9 Gm9 C9sus4 Fmaj9 | A held D5 with vibrato, a short fall off C5 over D9, then a long A4 with vibrato over a rolled, pedalled Fmaj9 |

## Calibration notes

- The Alto Sax sample wobbles about ±10 cents on its own. Measured on a held E5, CC1 48 gives about ±16 cents, CC1 80 about ±27, and CC1 127 about ±42. So the vibrato uses CC1 64 (about ±20 cents) and 76 on the G5 climax, a little above the 30 to 60 suggested in the brief, because 48 barely clears the sample's own movement. Measured vibrato rate is about 5.2 Hz.
- Falls, doits, scoops, and bass glides have a point every 1/64 note. At 116 BPM, 1/32 points are 65 ms apart, and the steps of the last part of an eased doit were visible in a pitch track.

## Loudness match

| Track | v1 LUFS | v2 LUFS |
|---|---|---|
| Mix | -24.0 | -23.8 |
| Alto Sax | -27.5 | -27.5 |
| Fretless Bass | -29.8 | -29.8 |
| Rhodes | -29.8 | -28.8 |
| Guitar | -38.2 | -38.2 |
| Drums | -33.9 | -33.9 |

The pedal makes the Rhodes about 1 LU louder from bar 9, because the notes ring longer, but the mixes stay within 0.2 LU.
