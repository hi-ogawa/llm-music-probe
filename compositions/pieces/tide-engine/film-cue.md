# Film cue: Tide Engine (loop)

~40-bar orchestral cue for Toy MIDI. D minor, 96 BPM, loops bar 40 back to bar 1.

[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Ftide-engine%2Fproject.json)

## Plan

D minor, 96 BPM, 4/4, 40 bars (~100 s). The identity cell is a 3+3+2 eighth-note rhythm (accents on 8ths 1, 4, and 7). It drives the viola ostinato, and the theme's head motif (D–A–B♭) uses the same rhythm.

| Bars | Section | Harmony | What happens | Energy |
|---|---|---|---|---|
| 1–4 | Intro | Dm over a D pedal | Viola 3+3+2 ostinato and a contrabass D pedal, nothing else | 2 |
| 5–12 | A | Dm, B♭ (L), Gm (R), A, all over the D pedal | Horn states the 8-bar theme, an arch from D4 up to G5 at bar 9 and down to A4. A divisi string pad enters. Cellos double the ostinato an octave down from bar 9 | 3–4 |
| 13–20 | B | D (P), F♯ (chromatic mediant III), D, B♭ (chromatic mediant ♭VI) | Flute and clarinet in octaves play the theme in inversion. Oboe joins the flute in unison at bar 17. Horns hold glue chords, and pizzicato adds color | 5 |
| 21–28 | C build | B♭, B♭m (P), G♭ (L), E♭m (R), over a B♭ pedal and then E♭ | Horns repeat the head motif as a fragmented sequence. One layer enters every 2 bars: timpani cell and trombones (21), tremolo strings (23), 16th violin ostinato (25), snare roll and tuba (27). Velocities rise as well | 6→9 |
| 29–36 | Climax | E♭m→D (Slide), then D, B♭ (♭VI), Gm, A | Tutti theme in D major. Violins and flute play it in unison, and horns and trumpets play it an octave below. Trombones and tuba play the head motif in augmentation. Cymbal and bass drum hits | 10 |
| 37–40 | Outro and loop seam | Dm, B♭/D, A/D over the D pedal | Strips back to the intro layers plus a clarinet fragment of the head motif. The C♯ in bar 40 resolves to D in bar 1 | 3→2 |

## Technique checklist

Technique names come from [composition-landscape.md](https://gist.github.com/hi-ogawa-agent/ebb143c64417ed58b4e9971e4f838e4c).

| Technique | Bars | Where |
|---|---|---|
| **Pedal point** | 1–12, 37–40 (D); 21–26 (B♭); 27–28 (E♭) | Contrabass holds D under Dm, B♭, Gm, and even A, which gives a crunchy dominant in bars 11–12. In the build it holds B♭ under the chain of chords |
| **Chromatic mediants** | 13–16 (D→F♯), 19–20 (D→B♭), 31 (D→B♭) | Section B uses the major-third relations I–III and I–♭VI, and the climax repeats I–♭VI |
| **Neo-Riemannian moves** | 7 (Dm→B♭ L), 9 (B♭→Gm R), 13 (Dm→D P), 23–29 | The build chain runs B♭ –P→ B♭m –L→ G♭ –R→ E♭m –Slide→ D, and the Slide lands on the climax at bar 29 |
| **Rhythmic ostinato as identity** | 1–40 (violas), 21–26 and 29–36 (timpani), 5, 29–36 (theme and low brass) | The 3+3+2 cell is in the ostinato, the timpani, the theme head, and the augmented low-brass line |
| **String ostinato** | 1–40 (violas), 9–36 (cellos), 25–36 (Violins II in 16ths) | 8ths throughout, with the 16ths taking over the drive in the build and climax |
| **Contour design** | 5–12 (and 29–36) | The theme is an arch from D4 up to a G5 peak at bar 9 (G6 at bar 33) and back down to A |
| **Motivic transformation** | 13–20 inversion; 21–28 fragmentation and sequence; 29–36 augmentation (trombones and tuba) and a mode change to major; 37–40 fragmentation | All of these come from one head motif, D–A–B♭ |
| **Orchestral color** | 5–20 divisi pad, 13–20 pizzicato, 13–20 horns as glue, 17–20 flute and oboe doubling, 23–28 tremolo | These use the GM pizzicato and tremolo presets, as the cheatsheet notes |
| **Octave and unison doubling** | 9–36 violas and cellos in octaves, 13–20 flute and clarinet in octaves, 17–20 flute and oboe in unison, 29–36 | In the climax, violins and flute play in unison, horns and trumpets play in unison an octave below, and the tuba is an octave under the trombones |
| **Orchestrated crescendo** | 21–29 | Instruments and register are added, from the low pedal up to high tremolo, while velocities rise, ending with timpani and snare rolls in 27–28 |
| **Density build** | 1, 5, 9, 13, 17, 21, 23, 25, 27, 29 | A new layer enters about every 2–4 bars, with only 2 layers in bar 1 and 17 tracks at bar 29 |
| **Energy curve** | 2 → 4 → 5 → 6–9 → 10 → 3–2 | The outro returns to the intro's texture and dynamics. The violas' C♯ at the end of bar 40 is a leading tone into the D on bar 1, so the loop seam works like a cadence |
| **Panning plan** | All | Orchestral seating places violins left (−0.45/−0.3), violas and cellos right (+0.2/+0.35), basses near center (+0.15), woodwinds center, horns left-center (−0.3), trumpets and trombones right (+0.2/+0.35), and timpani and percussion center. The climax lead spreads to roughly center because it's doubled on both sides |
