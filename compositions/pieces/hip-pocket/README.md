# Hip Pocket

A pitch-bend, CC1, and CC64 test for Toy MIDI's `automation` sequences (https://github.com/hi-ogawa/toy-midi/issues/804), written as a short funk groove: 16 bars, 4/4, 98 BPM, E Dorian. The two versions have the same notes and velocities.

- `v2-expression.json`: pitch bend and CC1 on the lead, CC64 on the electric piano.
- `v1-plain.json`: no automation. In the breakdown and on the last chord, the electric piano notes are held to the next chord change instead of pedaled, the way an agent fakes sustain.
- `hip-pocket.mjs`: the generator. `node hip-pocket.mjs <dir>` writes both files.

Toy MIDI doesn't play `automation` yet, so listen to the offline renders (`tools/render/render.ts` on `fix/issue-863`, GeneralUser GS, fluidsynth).

## Tracks

| Track | Preset | Expression |
|---|---|---|
| Lead | Saw Lead (81) | Pitch bend: scoops, bends up into accents, glides, a fall in bar 6, a doit in bar 8, the D-to-D# bend in bar 12, and the final fall. CC1: delayed vibrato on held notes at phrase ends |
| Electric Piano | Tine Electric Piano (4) | CC64 in bars 9-12 and on the last chord, lifted on each change and pressed again a 16th later |
| Bass | Fingered Bass (33) | None |
| Drums | Standard kit (bank 128) | None |

Pitch bend points are every 1/64 note on eased curves, and every bend returns to 0 before the next note that shouldn't bend. CC1 sits at 0 for the first half beat of a held note, eases up to 60 over a beat, and drops to 0 at the release.

## Sections

| Bars | Harmony | What to listen for |
|---|---|---|
| 1-4 | Em7 A9 Em7 A9 | Call and answer. Scoops on the pickups, a whole-step bend into the accented E5 (bar 1) and A4 (bar 3), glides A4-B4 and D5-E5. Bar 4 holds A4 for two beats: straight at first, then the vibrato fades in |
| 5-8 | Em7 A9 Em7 A9 | Quick riffs. In bar 5, G5 bends up from F# twice on back-to-back 16ths with clean E5s between, then A5 bends up from G. Bar 6 glides C#5-D5-E5 and the E5 falls 5 semitones. Bar 7 bends up into four 16ths in a row. Bar 8's A4 ends with a doit |
| 9-12 | Cmaj9 Bm11 Am9 B7sus4 B7 | Breakdown. The piano's short strikes ring under the pedal and clear at each change, where v1's held notes stop dead. The lead holds long notes with delayed vibrato and glides down F#5-D5 and up F#5-A5. Over the B7, the lead bends D5 up to D#5, minor third to major |
| 13-16 | Em7 A9 Em7 Em9 | The groove comes back with the densest bends (bars 13-14), a peak bend into B5 (bar 15), and a final E5 over the Em9 hit that gets vibrato and then falls 7 semitones as it ends |

## Loudness match

| Track | v1 LUFS | v2 LUFS |
|---|---|---|
| Mix | -21.7 | -21.6 |
| Lead | -25.1 | -25.1 |
| Electric Piano | -28.5 | -28.1 |
| Bass | -27.7 | -27.7 |
| Drums | -28.2 | -28.2 |

A pitch tracker on the dry lead render confirms the shapes: the bar 5 bends reach pitch within a 16th and the E5s between them are flat, the bar 4 vibrato runs about ±20 cents at 4.7 Hz in v2 and is absent in v1, and the final fall goes from E5 to A4 over the last beat.
