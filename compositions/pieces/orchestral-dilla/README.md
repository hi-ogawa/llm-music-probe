# Orchestral Dilla, a J Dilla beat played by an orchestra with no drums

**Demo: [open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Forchestral-dilla%2Forchestral-dilla.json)** ([self-contained share link](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Forchestral-dilla%2Forchestral-dilla.json))

A 40-bar looping piece at 88 BPM in Db major, with a flip into Bb minor. The prompt asked for orchestral music inspired by J Dilla beats, with no drum kit so the groove has to come from the orchestra, multiple sections, a loop, and build-ups at the section boundaries. It was composed in one take as a share link, without hearing it, and has no feedback yet.

## How I read the inspiration

A Dilla beat is a looped soul chord progression played against a groove that sits deliberately off the grid. The snare drags late, the kick lands a little early and in a different place every bar, and the hats swing somewhere between straight and triplet, so the beat feels like it is leaning back while the loop keeps turning. The harmony is lush and jazzy (major 9ths, minor 9ths, 13ths), because it comes from chopped soul records.

So the piece does two things. It gives each drum role to an orchestral part that can play short, articulated notes, which in General MIDI means pizzicato and timpani. Then it applies Dilla's timing to those parts rather than to the orchestra as a whole, so the late snare and the early kick come from different string sections disagreeing about where the beat is.

## Setup

- Everything plays on the bundled GeneralUser GS font, with 16 MIDI tracks and no audio.
- `gen.mjs` writes `orchestral-dilla.json`. It uses a seeded random generator, so it reproduces the file byte for byte.
- One beat at 88 BPM is about 682 ms, which converts the timing offsets below.

### The drum roles

- **Kick:** low pizzicato basses (GM 45) on the chord root, doubled an octave down, about 0.02 beats (14 ms) early. The pattern cycles through four variants, one per bar, such as 1, the "a" of 2, and the "and" of 3. A kick on the "a" of 4 takes the next bar's root as an anticipation. In the last section, timpani (GM 47) double the kick.
- **Snare:** a pizzicato chord (GM 45, the chord's three lower voices plus the root) on 2 and 4, about 0.065 beats (44 ms) late. Every second bar, a soft ghost lands just before the next downbeat. In the last section, a short brass-section stab (GM 61) doubles it.
- **Hats:** high pizzicato violins (GM 45) on the chord's top two voices an octave up. The 8ths always play, about half of the off-16ths are dropped at random, and the off-16ths that remain are pushed 0.07 beats late. That puts them at roughly 0.32 of a beat instead of 0.25, a heavy swing that stops short of triplets.
- **Sample chops:** a string ensemble (GM 48) plays the full chord voicing in an uneven rhythm each bar (on 1 for 1.4 beats, a stab just after the "and" of 2, and the "a" of 3 held over beat 4), as if a sampled chord were chopped and retriggered.
- **Bass:** an arco contrabass (GM 43) follows the kick and holds each root until the next kick, so the bass line inherits the kick's drunk placement.
- Every note also gets about ±10 ms of timing jitter and ±5 velocity.

### Harmony

- The main loop is IV–iii–ii–V in Db, one chord per bar: Gbmaj9 (Bb Db F Ab over Gb), Fm7 (Ab C Eb Ab over F), Ebm9 (Gb Bb Db F over Eb), and Ab13 (Gb C Eb F over Ab). The V never resolves to I, so the loop keeps turning, which is the soul-sample quality.
- The flip in section C moves to the relative minor: Bbm9, Gbmaj7#11, Ebm9, and F7b9. They are voiced as close clusters in the same register, so the strings change color without jumping.
- Section C's F7b9 runs into Gbmaj9 at section D, a deceptive resolution (V to VI in Bb minor) that lands back in the main loop.

### Melodies

- The hook is two four-bar phrases in Db for flute. Many notes start 0.08 beats (55 ms) after the beat or the "and", so the melody sits behind the beat like the snare.
- Section C has its own bluesier phrase for muted trumpet (GM 59) in a lower register, touching A natural over F7b9.

### Tracks

| Track | GM | Gain | Pan | Notes |
| --- | --- | --- | --- | --- |
| Flute | 73 | 0.9 | 0.25 | 61 |
| Muted Trumpet | 59 | 0.85 | -0.1 | 36 |
| Violins (melody) | 40 | 0.85 | -0.35 | 55 |
| Clarinet | 71 | 0.6 | 0.15 | 15 |
| Horns | 60 | 0.6 | 0.3 | 46 |
| Brass Section | 61 | 0.5 | 0 | 147 |
| Celesta | 8 | 0.55 | 0.4 | 35 |
| Harp | 46 | 0.7 | -0.45 | 166 |
| Strings (chops) | 48 | 0.7 | -0.15 | 404 |
| Strings (pad) | 49 | 0.45 | 0.1 | 128 |
| Tremolo Strings | 44 | 0.55 | -0.2 | 108 |
| Pizz (hats) | 45 | 0.5 | 0.5 | 325 |
| Pizz (backbeat) | 45 | 0.8 | 0.05 | 218 |
| Pizz Basses (kick) | 45 | 1 | 0 | 220 |
| Contrabass | 43 | 0.75 | 0 | 112 |
| Timpani | 47 | 0.7 | 0.2 | 207 |

Height and view mode are left out, so the tracks open with the app defaults. Every track sets the Db major key signature.

## Form

| Section | Bars | What happens |
| --- | --- | --- |
| A, dusty intro | 1–8 | Slow strings (GM 49) hold the chords softly and the harp rolls arpeggios. The kick and contrabass enter at bar 5, sparse and quiet, and the celesta (GM 8) plays the first hook phrase an octave up as a faint hint. |
| B, the beat | 9–24 | The full groove. Four bars of beat alone, then the flute hook (phrase 1, phrase 2, then phrase 1 again with clarinet an octave below). From bar 17 the pad returns, and horns (GM 60) hold a two-voice guide-tone line (Bb Ab Gb Gb over Db C Bb C). Every second bar, the harp answers with a chord on the "and" of 3. |
| C, the flip | 25–32 | Bb minor in a half-time feel, with the snare only on 3, a two-bar kick pattern, and hats on 8th-note triplets with some dropped. The string chops switch to a busier pattern that pushes the next chord early on the "e" of 4. Muted trumpet takes the melody, and horns double it an octave down the second time. |
| D, tutti | 33–38 | The main loop at full weight. Violins (GM 40) take the hook with the flute an octave up, the chops are louder and doubled an octave up, timpani double the kick, brass doubles the snare, and the horns hold their guide tones. |
| Breakdown | 39–40 | The groove, chops, and horns drop out, leaving the pad, harp arpeggios, a held contrabass, and the celesta while the violins finish phrase 2, fading. The harp arpeggios are the intro's texture, so the loop returns to bar 1 by thinning out instead of stopping. |

Locators mark each section, and the loop covers all 160 beats.

### Build-ups

Each boundary into B, C, and D gets the same two-bar gesture over the outgoing section's last two chords:

- A timpani roll in 32nds on each bar's root, rising from velocity about 20 to about 110.
- Tremolo strings (GM 44) re-strike the chord every beat with rising velocity, moving up an octave during the second bar.
- In the last bar, the brass section crescendos in 8ths on the chord, and the violins run up eight 16ths into the downbeat (the Db major scale from Ab, or Bb harmonic minor from A before section D). Into C, the hats also fill in every 16th with a velocity ramp.
- Everything cuts out for the last half beat, a beat-tape dropout, and the next section opens on a tutti hit: timpani on the root and its octave, the brass section on the chord, and tremolo strings an octave up. The hit into B is softer (velocity 90 against 118), because B is the beat entering rather than a climax.

The boundary from D back to A has no build. It is the breakdown above, because a build into a quiet intro would make the loop seam sound like a mistake.

## Iteration

1. **First take** (`orchestral-dilla.json`). Everything above. Feedback: pending.

## Untested

- I set gains and velocities without hearing anything. In llm-music-probe experiment 13, an agent that mixed by role without listening buried its own hook, so the flute and trumpet against the string chops and pizzicato are the first thing to check.
- The pizzicato snare and the pizzicato hats share GM 45, so they may blur together. Panning them apart (0.05 and 0.5) is the only separation.
- A few build and tutti notes ring up to a quarter beat past beat 160, where the loop cuts them.
