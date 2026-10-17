# Orchestral Daft Punk: One More Loop

**Demo: [open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fone-more-loop%2Fproject.json)** ([same project from `project.json`](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fone-more-loop%2Fproject.json))

An orchestral piece inspired by Daft Punk in F minor at 122 BPM, 68 bars (about 2:15) that loop back to the start. The prompt asked for no drum kit, so the groove has to come from the orchestra, with multiple sections, a loop, and build-ups at the section boundaries. It was composed on 2026-10-14 from that prompt alone, as a single take written straight to JSON. It was never opened, rendered, or heard during the session, and there is no listening feedback yet.

## How I read the inspiration

What I took from Daft Punk is the French-house method rather than any one song. One four-bar loop of lush, jazz-tinged chords, Fm9 | Dbmaj9 | Bbm9 | Csus4 to C7b9, runs under the whole track, and the drama comes from what joins or leaves the loop, not from new harmony. The hook is a short, robotic, syncopated brass riff that repeats until the repetition becomes the point, in the spirit of "One More Time" and "Harder, Better, Faster, Stronger". The 16th-note string ostinato leans on the orchestral side of *Tron: Legacy*.

A filter sweep is the genre's main tension device, and a MIDI-only orchestra has no filter to automate. So the intro fakes one by entering low and quiet, then raising velocity and register as parts join. The build-ups borrow the other signature move, a short silence right before the drop.

## Setup

- Instruments are General MIDI presets on Toy MIDI's bundled GeneralUser GS soundfont. There is no drum track, so bank 128 is never used.
- Each drum-kit role goes to an orchestral part:
  - Kick: timpani (GM 47) on all four beats, tuned to the chord root.
  - Clap: orchestra hit (GM 55) on 2 and 4, two octaves above the root, in the choruses only.
  - Hi-hats: violin (GM 40) 16ths arpeggiating the chord an octave above the pad. Accents fall on the off-beat 8ths like an open hat, with the downbeats medium and the rest soft.
  - Disco bass: pizzicato strings (GM 45) in 8th-note octave jumps, the root on the beat and the octave above on the "and".
  - Guitar chops: staccato string chords (GM 48) on 16ths 2, 5, 6, 10, 13, and 14 of each bar, a syncopated pattern in the spirit of Nile Rodgers.
- Melody and harmony parts:
  - Hook: brass section (GM 61).
  - Supporting voices: French horns (GM 60), slow strings pad (GM 49), harp (GM 46), cellos (GM 42), contrabass (GM 43) holding roots, and flute (GM 73).
- Tracks set only name, program, notes, gain, pan, and an F minor key signature, so height, view mode, EQ, and the tab settings use their defaults.
- The hook gets the highest gain (1.0) and the chops sit at 0.4, because 4-note chords six times a bar could bury the hook. The mix was set by role and never rendered or loudness-checked.
- `build.mjs` writes `project.json` and the share link. Every part is a pattern function applied per bar, so changing one pattern regenerates the piece.

## Arrangement

Bars are 1-based. Locators in the project mark each section.

1. **Intro, bars 1 to 8.** Pizzicato bass alone, getting louder bar by bar. Violin 16ths join in bar 3, quiet at first, and the chops join an octave low in bar 5 with a timpani hit on each downbeat.
2. **Build, bars 7 and 8.** The timpani plays a C pedal in 8ths and then 16ths, the violins climb a tremolo through the F minor scale from C4 to C6, and the pizzicato bass pumps 8ths on C. Velocities rise across both bars, then everything stops for the last half beat.
3. **Groove, bars 9 to 24.** The full rhythm section with the timpani on all four beats. The contrabass enters in bar 13, and from bar 17 the horns preview the hook an octave down, playing only the first three notes of each bar.
4. **Build, bars 23 and 24.** The intro's build, plus the horns pumping a C7 chord in 8ths with a crescendo. The half-beat silence comes again before the drop.
5. **Chorus 1, bars 25 to 40.** The brass hook over everything, with the orchestra-hit claps, pad, and contrabass added.
6. **Breakdown, bars 41 to 48.** No rhythm section. The pad holds the chords, the harp arpeggiates them in 8ths, and the cellos sing the hook an octave down, legato. The flute's long-tone countermelody enters quietly in bar 45.
7. **Build, bars 49 to 52.** The long build. The timpani on C accelerates one step per bar from quarters to 8ths, 16ths, and 16th triplets. Under the violin tremolo, the cellos climb from C3 to Bb3 in half-bar steps, the pad holds Fm9 and Dbmaj9 over the C pedal for two bars, and the horns pump C7 for the last two. Then comes the half-beat silence.
8. **Chorus 2, bars 53 to 68.** Chorus 1 a little louder, with the horns doubling the hook an octave down and the flute countermelody (G5, Ab5, F5, E5 to G5) above it.
9. **Loop back.** In the last bar the flute runs down C6, G5, E5, C5 over beat 4 and then drops into the quiet intro, so the loop restarts the filter-opening arc.

## Iteration

1. **One take** (`project.json`). Written as `build.mjs` and generated in one pass. Two fixes went in before publishing, both from reading the note counts and the code rather than from listening:
   - The chops' gain dropped from 0.55 to 0.4 to protect the hook.
   - In the last bar, the countermelody's held G5 was shortened to one beat so it doesn't sustain under the closing flute run.

   Feedback: none yet. My guess at the first places to listen is the chops and the violin 16ths, which make up about 2,100 of the piece's 3,800 notes and could make the choruses muddy, and the timpani on all four beats, which may read as boomy rather than as a kick.
