# Lamplight

A sustain pedal (CC64), vibrato (CC1), and pitch-bend test for Toy MIDI's `automation` sequences (https://github.com/hi-ogawa/toy-midi/issues/804), written as a short clarinet and piano ballad: 16 bars, 4/4, 66 BPM, E-flat major. The two versions have the same notes and velocities.

- `v2-expression.json`: the piano is pedaled with CC64 and re-pedaled on every chord change. The clarinet has delayed vibrato on CC1 and gentle scoops as pitch bend.
- `v1-plain.json`: no automation. The piano fakes the pedal the way agents usually do, with every note held to the end of its bar, so the first chord of each bar smears into the second.
- `lamplight.mjs`: the generator. `node lamplight.mjs <dir>` writes both files.

Toy MIDI doesn't play `automation` yet, so listen to the offline renders (`tools/render/render.ts` on `fix/issue-863`, GeneralUser GS, fluidsynth).

## Why clarinet, not flute

The brief asked for Flute (73), but GeneralUser GS's flute sample has vibrato baked in, measured at about ±20 cents and 5.7 Hz with CC1 at 0, so CC1 vibrato on top of it is barely audible. Clarinet (71) is a clean sample (about ±3 cents with CC1 at 0), so its vibrato comes only from CC1. Recorder (74) also wobbles a little. Ocarina, Oboe, and Piccolo are clean too.

## Tracks

| Track | Program | Automation in v2 |
|---|---|---|
| Clarinet | 71 | CC1 (delayed vibrato on notes of 1.5 beats or more), pitch bend (four scoops) |
| Piano | 0 | CC64, down a 1/16 after each chord starts, up exactly at the next change |

## Sections

| Bars | Harmony | What to hear |
|---|---|---|
| 1-2 | Ebmaj9, Abmaj9 Bb13sus4 | Piano alone. Each chord rings and clears at the change. In v1, Abmaj9 carries over into Bb13sus4 |
| 3-6 | Ebmaj7, Gm7 C7b9, Fm9, Bb13sus4 Bb9 | Scooped pickup into the long G5 and Ab5, which sit still for the attack, then bloom into vibrato |
| 7-10 | Gm7 Cm9, Abmaj7 Abm6, Eb/G Gbdim7, Fm7 Bb9 | Scooped phrase entry on Bb4, a lighter scoop into the C6 climax. In v1, Abmaj7's C rubs against Abm6's Cb in bar 8 |
| 11-12 | Cm9 F9/A, Abm6 Bb13sus4 | Piano alone, two chords a bar, the clearest re-pedaling against v1's smear |
| 13-16 | Ebmaj7, Abmaj7 Abm6, Eb/Bb Bb9, Ebmaj9 | Return. The final Eb5 gets the deepest vibrato and tapers with the breath. The pedal holds the last chord and lifts at the end |

## Measured

Pitch tracking on the dry clarinet render:

- Vibrato on the long notes: v1 about ±4 cents (estimator noise), v2 about ±17 cents at 4.9 Hz.
- Scoops: written as 100 cents below (60 at C6), measured about 70 cents flat just after the attack, reaching pitch within a 1/16.

Loudness:

| Track | v1 LUFS | v2 LUFS |
|---|---|---|
| Mix | -30.5 | -30.7 |
| Clarinet | -31.7 | -31.7 |
| Piano | -34.4 | -34.6 |
