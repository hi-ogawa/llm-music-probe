# Swell

A CC11 (expression) test for Toy MIDI's `automation` sequences (https://github.com/hi-ogawa/toy-midi/issues/804), written as a short orchestral cue: 16 bars, 4/4, 66 BPM, D major turning to B minor. The two versions have the same notes and velocities. The only difference is CC11.

- `v2-expression.json`: CC11 shaped on cello, strings, horns, and timpani, with a point every 1/16 note on eased curves.
- `v1-flat.json`: each of those tracks holds CC11 at one constant value.
- `swell.mjs`: the generator. `node swell.mjs <dir>` writes both files.

Toy MIDI doesn't play `automation` yet, so listen to the offline renders (`tools/render/render.ts` on `fix/issue-863`, GeneralUser GS, fluidsynth).

## Sections

| Bars | Harmony | What CC11 does |
|---|---|---|
| 1-4 | D Bm G A | Note-level shaping. The solo cello dips at the start of each long note, swells to a peak about 60% through, and tapers at the two phrase ends (bars 2 and 4). The string pad has a hairpin on each chord, about 8 dB peak to trough. The harp is plucked and has no CC11 |
| 5-8 | Bm F#/C# Bm/D Em F#7 | Phrase crescendo. Horns join, the bass climbs B C# D E F#, the cello climbs to C#5. Strings and horns crescendo across all four bars, and a 32nd-note timpani roll on F# crescendos about 22 dB into the G stroke on bar 9 |
| 9-12 | G D/F# Em7 A7sus4 A7 | Long diminuendo. A forte arrival on G (VI of B minor), then the ensemble falls away while the line descends |
| 13-16 | D | Fade to silence. The held chord fades to CC11 0 |

Velocity still sets each attack: the harp's velocities follow the dynamics, and the bar 9 arrivals have harder attacks in both versions.

## Loudness match

The flat constants (Cello 102, Strings 94, Horns 115, Timpani 104) are tuned so that integrated loudness matches v2.

| Track | v1 LUFS | v2 LUFS |
|---|---|---|
| Mix | -26.7 | -26.7 |
| Cello | -30.9 | -30.9 |
| Strings | -32.1 | -32.1 |
| Horns | -30.8 | -30.7 |
| Harp | -34.1 | -34.1 |
| Timpani | -33.2 | -33.2 |

The difference is in the shape. Per beat, the v2 mix rises about 12 dB from bar 5 to bar 9 where v1 rises about 5 dB, and v2 fades from about -35 dB to silence over bars 13-16 where v1 holds steady at about -31 dB.
