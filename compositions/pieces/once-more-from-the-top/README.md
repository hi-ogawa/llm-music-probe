# Once More, From the Top

A J-pop / anisong sketch.

**[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fonce-more-from-the-top%2Fproject.json)**

32 bars at 152 BPM in 4/4, D major with a final chorus in E major, looping bars 1–32. The tracks are Lead (saw lead), Countermelody (violin), Piano, Strings, Arp (square), Bass (finger), and Drums (GS Standard). `compose.mjs` generates the project.

## Plan (bar by bar)

| Bars | Section | Harmony | What happens |
|---|---|---|---|
| 1–3 | Intro, hook-first | Gmaj7 A7 \| F#m7 Bm7 \| Em7 A7 | The chorus hook opens the song with piano, 8th-note arp, light drums, and the bass counter-line. Energy is medium. |
| 4 | Intro turnaround | Gmaj7 A7sus4 A7 | The lead's F#5 is anticipated over the barline and held. A snare pickup leads into the verse. |
| 5–8 | Verse A | D \| A/C# \| Bm7 \| Gmaj7 | One chord per bar for slow harmonic rhythm. The melody is low (D4–B4) and every phrase starts on the "&" of 1. Sidestick and sparse piano. The bass walks a descending counter-line, D–C#–B–G. Energy is low. |
| 9–12 | Verse B | Em7 \| F#m7 \| Gmaj7 \| A7sus4 A7 | Bar 10 repeats bar 9's motif a step higher. Soft spread strings come in, and a tom fill closes bar 12. |
| 13–14 | Pre-chorus | Em7 A7 \| F#m7 B7 | Two chords per bar. Bar 14 is bar 13 a step up, ii–V of I then ii–V of ii, with B7 tonicizing Em. Pumping 8th-note bass, piano, and arp. Four-on-the-floor kick. |
| 15–16 | Pre-chorus build | Gmaj7 F#7 \| Bm7 E7 A7sus4 A7 | F#7 tonicizes Bm, and E7 (V/V) leads to A. The harmonic rhythm speeds up to one chord per beat. The snare build roll goes quarters → 8ths → 16ths → 32nds. |
| 17–20 | Chorus 1 (D) | Royal road Gmaj7 A7 F#m7 Bm7 \| Em7 A7 \| D D7 | The melody lifts to F#5–A5 over piano power voicings, 4-note spread strings, and a crash. The bass line uses inversions (D7/C → G/B). |
| 21–24 | Chorus 1 cont. | Gmaj7 A7 \| F#7 Bm7 \| Em7 A7sus4 A7 \| D B7 | The F#7 (V/vi) sets up the D6 peak. The resolution note is anticipated on the "&" of 4. B7 is V/ii in D and becomes the pivot dominant of E, with a tom fill. |
| 25–31 | Final chorus (E) | Royal road +2 | The key rises a whole step and the peak reaches E6. The violin countermelody enters, the arp moves to 16ths, and drums add 16th hats. This is the energy peak. |
| 32 | Turnaround | E D7 | D7 (bVII7 in E, V/IV in D) and a drum fill return to the intro's Gmaj7. The lead pickup A4–D5–E5 lands on the hook's F#5 at bar 1. |

**Energy curve:** intro 6 → verse 3–4 → pre-chorus 5→8 → chorus 8 → final chorus 10 → loop to intro 6.

**Panning plan:** kick, snare, bass, and lead are centered. The piano is at L30 and the strings at R30, so the harmony beds face each other. The arp is at R55 and the countermelody at L50, so the two moving lines sit on opposite sides.

## Technique checklist

| Technique | Bars |
|---|---|
| Royal road (王道進行) | 1–3, 17–23, 25–31 (IVmaj7–V7–iii7–vi) |
| Secondary dominants and tonicization | D7 = V/IV (20, 32), B7 = V/ii (14, 24), F#7 = V/vi (15, 22), E7 = V/V (16), plus G#7 and E7 in E (28, 30) |
| Harmonic rhythm control | 1 chord per bar in the verse (5–11), 2 per bar in the pre-chorus and chorus, 4 per bar into the chorus (16) |
| Sequence | 1→2 (tonal, hook down a step), 9→10 (verse motif up a step), 13→14 (pre-chorus motif up a step) |
| Syncopated and anticipated phrasing | Verse phrases start on the "&" of 1 (5–11). Chorus notes land on the "&" (17–24). Anticipations over the barline at 3→4, 19→20, 23→24, 27→28, and 31→32. Piano comps push on the "&" of 2. |
| Register lift | Verse D4–E5 (5–12) → chorus up to D6 (22) → final chorus up to E6 (30) |
| Pop power voicing | Piano LH root–5th–octave with an RH triad + 9 (m11 on minor 7ths) throughout |
| Spread voicings | Strings root + 10th + 7th/5th above the octave (9–32) |
| Melodic counter-line bass | Descending verse line (5–8), inversions moving against the hook in the chorus (17–31), including A#2 under F#7 and C3 under D7 |
| Arpeggiation | Up-down arp: 8ths (1–4, 13–24), 16ths (25–32) |
| Countermelody | Violin in the final chorus (25–32), with B#–C# leading-tone motion at 30 |
| Fills and build rolls | Snare pickup (4), tom fill (12), snare build roll (15–16), tom fills (24, 32) |
| Hook-first intro | 1–4 open on the chorus hook |
| Verse–pre-chorus–chorus | 5–12 → 13–16 → 17–24 → 25–32 |
| Final-chorus key change | D → E at 25, with B7 as the pivot at 24 |
| Energy curve | See above. Density, velocity, and the drum pattern change by section. |
| Panning plan | See above |
