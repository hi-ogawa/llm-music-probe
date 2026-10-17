# Night Cruise Overture, orchestral city pop

**Demo: [open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-cruise-overture%2Fproject.json)** ([self-contained share link](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-cruise-overture%2Fproject.json), the same project encoded in the URL)

An orchestral piece in the style of 80s Japanese city pop, at 112 BPM in 4/4, 74 bars (about 2:39), looping. The brief was to compose it in Toy MIDI by following `/llms.txt`, with no drum kit, so the groove has to come from the orchestra, plus multiple sections, a loop, and build-ups at the section boundaries.

It was composed in one take without listening, and the only check was a rendered per-track level comparison (see Process). Nobody has heard it yet, so the feedback below is still pending.

## How I read the inspiration

80s city pop (Tatsuro Yamashita, Mariya Takeuchi, Anri) is groove-first and harmonically lush. It runs on maj7, maj9, and m9 chords, a busy bass that pops octaves, a cutting guitar on the offbeats, brass stabs that push the "and" of 4, and a hooky chorus, often on the "Just the Two of Us" progression (IVmaj7, III7, vim7, then v7 to I7). The last chorus often goes up a half step.

The rhythm section is what carries those grooves, so without a drum kit each of its jobs goes to an orchestral part that can play it:

- **Bass guitar to pizzicato basses**, which pop octaves in 16ths and slide into each chord with a chromatic approach note. A bowed contrabass adds weight underneath in the bigger sections.
- **Cutting guitar to pizzicato chords** on the 16th offbeats, three-note rootless voicings in the middle register.
- **Horn section to brass stabs**, with a trumpet and trombone soli in the interlude.
- **Keys and pads to low strings, horns, and harp arpeggios.** A glockenspiel stands in for the bell-like DX7 keyboard sparkle.

The timpani is the only percussion, and it marks section downbeats, pushes into each chorus cycle, and rolls in the build-ups, rather than keeping time.

## Setup

- Tracks are all General MIDI on the default GeneralUser GS bank: flute (73), clarinet (71), violins (48), horns (60), trumpet (56), trombone (57), brass section (61), glockenspiel (9), harp (46), pizzicato chords (45), low strings (49), string runs (48), pizzicato basses (45), contrabass (43), and timpani (47).
- Optional track fields such as `height`, `viewMode`, `keySignature`, `muted`, and `soloed` are left out, so the app's defaults apply. `gain` and `pan` are kept because they carry the mix balance.
- `compose.mjs` writes `project.json`, and running it reproduces the file byte for byte. Chords are written as a chart with one entry per bar, a voice-leading voicer picks each part's voicing in its own register, and melodies are hand-written as note strings in 16ths.
- `render.mjs` renders each track alone with `spessasynth_core` (the engine Toy MIDI uses) and the same GeneralUser GS bank, without effects, and prints RMS level per section. It is a stopgap for per-track loudness in https://github.com/hi-ogawa/toy-midi/issues/845, so it measures plain RMS without loudness weighting.

## Form

| Bars | Section | Chords | What happens |
| --- | --- | --- | --- |
| 1-8 | Intro | Abmaj7 G7b9 Cm7 Bbm7-Eb7, twice, ending Fm7-Bb7sus4 | The glockenspiel teases the chorus hook over harp arpeggios and string pads. The groove and brass enter in bar 5, and the flute answers the hook. |
| 9-24 | Verse (Eb) | Ebmaj7 Cm7 Fm7 Bb13 Gm7 C7b9 Fm7 Bb7sus4, then a variant ending Abmaj7 Gm7 Fm7-Gm7 Abmaj7-Bb7sus4 | The flute takes the melody over a light groove and 8th-note harp. In the second half the melody climbs, the clarinet doubles it an octave down, and the violin pad enters. |
| 25-32 | Pre-chorus | Abmaj7 Bb/Ab Gm7 Cm7 Fm7 Gm7-C7 Abmaj7-Abm6 Bb7sus4-Bb7b9 | The horns and clarinet carry a longer-note melody. Bb over an Ab bass gives a Lydian lift, and the borrowed Abm6 darkens it before the dominant. The groove goes to full 16ths. |
| 33-48 | Chorus (Eb) | Abmaj7 G7b9 Cm7 Bbm7-Eb7, four times | The violins and flute play the hook in unison, starting from a pickup in the bar before. It leans on the maj7 (G over Ab) and the b9 (Ab over G7). The brass stabs, and the timpani pushes the "and" of 4 into each cycle. |
| 49-56 | Brass interlude | Abmaj7 Gm7 Fm7 Bb7sus4 Abmaj7 Gm7-C7 F#m7-B7sus4 Bm7-E7b9 | The strings drop to pads, and a trumpet line with the trombone an octave below takes over. The last two bars slide down a half step, so Bm7 to E7 sets up the new key. |
| 57-72 | Last chorus (E) | Amaj7 G#7b9 C#m7 Bm7-E7, four times | The chorus a half step up. The violins play in octaves, the glockenspiel sparkles on each cycle's first bar, and the trumpet joins the melody for the second half. |
| 73-74 | Turnaround | Amaj7, Bbm7-Eb7 | The flute holds the maj7 over Amaj7, then Bbm7 to Eb7 is a ii-V into the intro's Abmaj7, so the key steps back down to Eb across the loop. |

## Build-ups

Every section boundary gets a build, scaled to how much the next section lifts. Each one layers the same gestures:

- A string scale run, half a bar long for the medium builds and a full bar for the big ones, with a crescendo.
- A timpani roll on the dominant root, from one beat to a full bar long.
- A harp glissando over the last beat.
- The pizzicato basses leave the groove for 8th-note pedals on the dominant, alternating octaves and getting louder, while the pizzicato chords switch to straight 8ths.
- For the big builds, brass hits in 8ths climb in velocity and end with a push on the "and" of 4 that is already the next section's chord.

The biggest builds go into the chorus, into the key change, and back into the loop. The verse's midpoint gets only the harp glissando.

## Process

1. **First pass.** I composed the chart, melodies, and parts in `compose.mjs` and checked that every melody line fills its bars exactly. Then I rendered each track to compare levels, because llm-music-probe experiment 13 showed that an agent mixing by role without hearing buries its own hook. The render showed the same problem here. The horn pads were the loudest track in every section, at -26.9 dB in the chorus against the violin melody at -34.6, and in the interlude they sat 8 dB over the trumpet lead (-28.1 against -36.3).
2. **First rebalance.** I lowered the horns' gain and pad velocities, raised the violins, trumpet, glockenspiel, and string runs, lowered the pizzicato chords and low strings, and pushed the horns' pre-chorus melody harder. The trumpet now led the interlude, but the chorus horn pads were still level with the violin melody, and in the pre-chorus the violin pad was as loud as the horn melody.
3. **Second rebalance.** I cut the chorus horn pads and the pre-chorus violin pad further, raised the glockenspiel again, and lowered the pizzicato basses a little. After that, the harp's 16th arpeggios in the pre-chorus still edged over the horn melody, so the harp came down too.

These are the final levels in dB RMS, before reverb. Low parts read hotter in RMS than they sound, because the measure has no loudness weighting.

| Track | Intro | Verse | Pre-chorus | Chorus | Interlude | Last chorus | Turnaround |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Flute | -34.5 | -28.2 | | -25.9 | | -24.8 | -28.2 |
| Violins | -45.4 | -44.3 | -35.0 | -31.6 | | -27.7 | -36.2 |
| Horns | -37.2 | -36.1 | -31.0 | -34.6 | -37.2 | -33.0 | -34.4 |
| Clarinet | | -39.2 | -33.0 | | | | |
| Trumpet | | | | | -31.8 | -36.3 | |
| Brass Section | -41.0 | -50.7 | -42.2 | -35.1 | -39.0 | -33.6 | -36.5 |
| Glockenspiel | -39.8 | | | | | -42.2 | |
| Harp | -36.4 | -37.2 | -33.9 | -46.9 | -43.9 | -55.4 | -38.6 |
| Pizzicato chords | -39.9 | -39.0 | -34.0 | -35.1 | -34.1 | -34.0 | -32.7 |
| Pizzicato basses | -36.0 | -34.6 | -31.0 | -31.4 | -31.5 | -31.6 | -30.5 |
| Low Strings | -43.5 | -40.8 | -36.9 | -36.0 | -38.1 | -34.5 | -36.1 |
| Contrabass | -46.0 | | -39.6 | -36.8 | -39.4 | -35.7 | -36.8 |
| Timpani | -43.2 | -46.3 | -40.3 | -41.4 | -38.2 | -42.5 | -33.0 |

Blank cells are sections where the track is silent or only a release tail rings. The string runs and trombone are left out because they play too briefly for a section average to mean much.

Feedback: pending.
