# Seven Corners: math rock in 7/8

## Guitar iteration on v4

**Demo: [open guitar v6 in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fseven-corners%2Fguitar-v6-telecaster.json)**, which plays the bundled Telecaster ([guitar v5](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fseven-corners%2Fguitar-v5-simple.json), [guitar v4](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fseven-corners%2Fguitar-v4-keys.json), [guitar v2](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fseven-corners%2Fguitar-v2-ring.json), [guitar v1](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fseven-corners%2Fguitar-v1-tele.json)) (plays GeneralUser, not the Telecaster renders)

Iterating by ear on v4's guitars with a better electric guitar font, without changing the composition otherwise. Context: https://github.com/hi-ogawa/toy-midi/issues/861, after the Night Drive cutting (https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/night-drive-cutting-guitar) and Interlock (https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/interlock-in-e) iterations. Toy MIDI couldn't load another SoundFont until #852, so the links up to v5 play GeneralUser. The renders are MP3s in the Discord thread, not kept here.

- Font: the [FlameStudios Telecaster neck pickup](https://github.com/gdm-2112/electric-guitar-soundfonts/tree/main/SF3/FlameStudios) SF3 (GPL), the clean default picked in #861. Standard preset for open notes, Muted preset for "Gtr 1 mutes". Velocities 0–45 play its Muted recordings, so open notes need 46 and up.
- `guitar-font.mjs` moves the guitars to it at render time. The project files keep GM programs 27 and 28 (with the velocity floor of 46), so Toy MIDI plays guitars. `guitar-gtr2.mjs <in> <out> ring|space` rewrites Gtr 2's 16th cells.
- Rendering: `render.mjs` from the Night Drive gist, with fluidsynth. Changed tracks are level-matched to the previous version's LUFS for the same track.

0. **As written** (`project-v4.json`), rendered on GeneralUser programs 27 and 28 as the reference.
1. **Telecaster neck** (`guitar-v1-tele.json`). All five guitar tracks on the Telecaster, each level-matched to its GeneralUser loudness within 0.1 LU, notes otherwise as written. Feedback: the left arpeggio (Gtr 1) is so good and clean. The fast phrase, Gtr 2's 16th cells (bars 5–12 and 28–36), is hard to make feel right. Two likely causes in the writing: every note is cut to 0.325 beats (about 130 ms), keyboard staccato where a guitar's notes on different strings ring, and accents around 95 against 60 switch the font's velocity layers each cell. **Kept**: Gtr 1 as written.
2. **Gtr 2 rings** (`guitar-v2-ring.json`). Same notes. Each cell note gets its own string by pitch rank and rings until that string plays again (up to 1.5 beats), and accents are 86 against 76, in one velocity layer. Feedback: better, enough to suggest the 16th rush might be a phrasing or melody construction issue rather than a medium limit. **Kept**.
3. **Gtr 2 with space** (`guitar-v3-space.json`). A compositional rewrite: only each cell's first note, as a ringing dotted-8th line. Feedback: not good either. **Dropped**.

   Side finding: before a program fix, Toy MIDI played the guitar files as GM piano, and Gtr 2's ringing cells sounded better on piano. The ringing three-note cells are a keyboard idiom, where the overlap acts like a sustain pedal, which fits the melody construction reading: the line was written like keys.
4. **Gtr 2 on piano** (`guitar-v4-keys.json`). An arrangement change: Gtr 2's cells move to GM piano (program 0) with v2's ringing lengths and the original velocities, level-matched to v2's Gtr 2. The original piano track is dropped, since its riff doubling overlaps the unison riff, and so is Gtr 2 double, because a double-tracked piano is a guitar trick that doesn't carry over. Gtr 1 and its double and mutes stay on the Telecaster render. Feedback: the piano notes weren't what had been heard. The ringing lengths are my per-string rule from v2, not the composition, and I restored the original 95-against-60 accents where the accidental piano had played v2's 86 against 76. **Replaced** by v5.
5. **Simplified** (`guitar-v5-simple.json`). v4 with the piano playing v2's notes exactly as heard (ringing lengths and velocities), level-matched to v4's piano. Gtr 1 mutes (about 19 LU under the mix, close to inaudible) and the organ (a pad under B and the climax, mostly covered by the Rhodes) are dropped. Feedback: sounds good. **Kept**: v5.
6. **Telecaster in Toy MIDI** (`guitar-v6-telecaster.json`, made by `telecaster.mjs` from `guitar-v5-simple.json`). Toy MIDI now bundles the FlameStudios Telecaster (#852), so v6 plays Gtr 1 and its double on the neck pickup's Standard preset in the app, which is the font and pickup guitar v1 was heard on. The notes are v5's. They let ring and rarely stop into silence, and guitar v1 sounded clean with this release, so there is no CC 11 cut. Both tracks are level-matched to v5's solo loudness in Toy MIDI within 0.1 LU, measured from `toy-midi render-audio`, which puts Gtr 1 at gain 0.37 (from 0.49) and the double at 0.22 (from 0.27). Rendered with `toy-midi render-audio` against v5, as the full mix and the guitars alone. Feedback: pending.

Next (from v3): the cells were planned as tapping, with "taps accented and the hammer-ons and pull-offs soft and legato" (v2 below), but in MIDI every note is a fresh pick. The articulation contract from #861 (`art: "h" | "p"`) can now render that as one tap per cell with legato notes. Separately, the cells repeat one triad shape per chord with the accent always first, so phrasing the line's top notes is the melody construction angle.

---

## v4

**[Open v4 in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fseven-corners%2Fproject-v4.json)**

v4 drops the genre constraint and aims for whatever sounds best in a GM render, which here means leaning into fusion. The keys now carry the harmony, and the guitars step back to rhythm and texture. The files are `project-v4.json` and `gen-v4.mjs`.

- **Rhodes (GM 4, pan +0.25)** comps rootless voicings between the bass and the guitar hook (E3–G♯4). The voicings are Amaj9 (G♯ B C♯ E), Emaj9/G♯ (F♯ G♯ B D♯), F♯m11 (E A B C♯), B13sus (G♯ A C♯ E), Cmaj9♯11 (G B D F♯), and C♯m9 (G♯ B D♯ E).
- **Piano** keeps the punch, meaning the build in bar 20, the riff doubling, and the hits. The plain-fifths pulse from v3 is gone.
- **Drawbar organ (GM 16, pan −0.25, gain 0.45)** holds one chord per bar under B and the climax as glue.
- **Guitars are lower.** Gtr 1 goes from 1.0 to 0.85, Gtr 2 from 0.8 to 0.7, and the doubles from 0.55 and 0.5 to 0.45 and 0.4.
- **The riff is back on ride bell.** The hats in v3 were only there to make it sound less like fusion.
- The trumpet, the 4+4+3+3 feel, and the muted chucks are unchanged. The harmonics track stays removed.

### Rhodes by section

| Bars | Rhodes |
| --- | --- |
| 1–4, 39–40 | One soft held voicing per bar under the solo guitar |
| 5–8 | Sparse comping, with a long chord on the downbeat and a stab on 16th 11 |
| 9–12 | Full comping on 0, 6, and 11. Bars 9 and 11 anticipate the next chord on 16th 13, so bars 10 and 12 have no downbeat |
| 13–19 | Held voicing with a soft restrike on the second group (16th 6). Bar 20 holds B13sus under the build |
| 21–25, 37 | Tacet, so the unison riff stays a unison |
| 27 | Emaj9 colour over the false-ending E chord |
| 31–32 | Rejoins in the build |
| 33–36 | Full comping. Bar 33 anticipates Emaj9/G♯, and bar 35 anticipates the Cmaj9♯11 of bar 36 |
| 38 | Stop hits as Emaj9, Dmaj9, and Cmaj9 |

### Techniques added or changed in v4

| Technique | Bars | How |
| --- | --- | --- |
| Rootless A/B voicings | 1–20, 31–36, 39–40 | The Rhodes voicings above |
| Comping patterns | 5–12, 32–36 | Rhodes comps on the 4+4+3+3 pulses, plus anticipations |
| Pad vs pulse roles | 13–20, 33–36 | Organ is the pad, while Rhodes, piano, and drums are the pulse |
| Timbre layering | 27, 38 | Piano triads and Rhodes extended voicings on the same hits |
| Texture choice | 21–25 | Keys drop out except the piano doubling, so the riff stays homophonic |
| Static balance | all | Guitars lowered, so the keys and trumpet lead |

---

## v3


**[Open v3 in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fseven-corners%2Fproject-v3.json)**

v3 is v2 with three changes, aimed at sounding less like fusion and relying less on the GM guitar. The files are `project-v3.json` and `gen-v3.mjs`.

- **Harmonics track removed.** The GM guitar sample is the weak link, so v3 doesn't add more guitar articulation on top of it.
- **Dry piano added (GM 0, pan −0.15).** Left-hand root octaves land on the kick pulses (16ths 0 and 8) and right-hand open fifths on the backbeats (4 and 11). That anchors the 4+4+3+3 feel with a timbre GM renders well. The fifths stay plain so they don't add jazz colour.
- **Riff on hats.** The riff section (21–25, 37) moves from ride bell to closed hats, with the hat opening on the riff's empty eighth. The ride bell is kept for the climax only.

The trumpet is unchanged.

### Piano by section

| Bars | Piano |
| --- | --- |
| 1–4, 39–40 | One soft low octave per bar under the solo guitar |
| 5–8 | Left-hand octaves on 0 and 8 only |
| 9–12 | Adds right-hand fifths on 4 and 11, as a density step inside A |
| 13–19 | One held low octave per bar, used as a pad under the 4:7 guitars |
| 20 | Octave B eighths with a crescendo under the build roll |
| 21–25, 37 | Doubles the riff in two octaves above the bass |
| 26–27, 38 | Plays the cadence hits, the false-ending E chord, and the stop hits |
| 28–31 | Tacet |
| 32–36 | The full pulse returns and is played harder in the climax |

### Techniques added or changed in v3

| Technique | Bars | How |
| --- | --- | --- |
| Pad vs pulse roles | 5–12, 13–19, 32–36 | The piano is the pulse in A and the climax, and a held pad in B |
| Octave and unison doubling | 21–25, 37 | Piano octaves join the bass and guitars on the riff |
| Density build | 5–12 | A1 has left hand and side-stick, and A2 adds right hand and full snare |
| Register slotting | 5–12, 33–36 | Piano sits between the bass and the guitar hook (F♯2–E4 in the pulse) |

---

## v2


**[Open v2 in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fseven-corners%2Fproject-v2.json)**

v2 keeps v1's form, harmony, and tempo. Three things change: the bar's "limp" feel, articulation tracks, and humanised timing. The files are `project-v2.json` and `gen-v2.mjs`.

### Feel: 2+2+1+1+1 against 2+2+1.5+1.5

In sixteenths, 1.5+1.5 is 4+4+3+3, so it's four pulses with the last two clipped. v1 ran the 2+2+3 groups with a 1+1+1 tail. In v2 the drums and bass take 4+4+3+3 as the home feel, with the kick on 0 and 8 and the backbeat on 4 and 11. The guitar hook switches between the two tails, so some bars lock and others rub 3-against-2 inside the tail.

| Bars | Drums and bass | Gtr 1 hook tail | Result |
| --- | --- | --- | --- |
| 1–4 | (tacet) | 1+1+1 | Lurching solo intro, as in v1 |
| 5, 7, 11 | 4+4+3+3 | 1+1+1 | Tail rubs 3:2 against the kit |
| 6, 8, 9, 10, 12 | 4+4+3+3 | 1.5+1.5 | Locked, swaying four |
| 13–20 | 3+2+2 half-time | (B arpeggios) | Unchanged from v1 |
| 21–25, 37 | 2+3+2 riff | (riff) | Unchanged, except the riff's empty eighth now gets a muted scratch |
| 30–32 | Hats, bass, and build in 4+4+3+3 | 1.5+1.5 in bar 32 | The restart hints at the limp before the climax |
| 33–36 | 4+4+3+3 | 1.5+1.5, and Gtr 2 taps 4+4+3+3 cells | Everyone locks into the limp at the peak |
| 39–40 | (tacet) | 1+1+1 | Back to the lurch, which loops into bar 1 |

In A1 (5–8) the backbeat is a side-stick, and A2 (9–12) switches to full snare, so A has its own dynamic step up.

### Tracks and mix

| Track | GM | Pan | Role |
| --- | --- | --- | --- |
| Gtr 1 (clean) | 27 | −0.75 | Hook with let-ring, notes overlap like open strings. EQ cuts 320 Hz and lifts 2.6 kHz |
| Gtr 1 mutes | 28 | −0.5 | Dead-string chucks before the pulses (16ths 7 and 13 in A, 3, 7, and 13 in the climax, the riff's gap) |
| Gtr 1 double | 27 | +0.35 | 15 ms late, only in 21–27 and 33–38 |
| Gtr 2 (clean) | 27 | +0.75 | Taps are accented and the hammer-ons and pull-offs are soft and legato. B dyads are raked |
| Gtr 2 harmonics | 31 | +0.5 | Chimes on bars 1 and 3, on the B dyads, over the false-ending chord, and at the restart |
| Gtr 2 double | 27 | −0.35 | 19 ms late, only in 21–27 and 33–38 |
| Trumpet | 56 | +0.1 | Climax melody in 33–36, a held E over the riff in 37, and the stop hits in 38 |
| Bass | 33 | 0 | 4+4+3+3 counter-line in A, riff bass on the pulses in the climax |
| Drums (Room) | 128/8 | 0 | Side-stick, open and pedal hat, flams on the big backbeats, a splash on the clipped "4" |

Timing is humanised per track. Drums sit about 4 ms ahead, bass about 7 ms behind, and the trumpet about 10 ms behind, each with jitter of up to ±8 ms. Chord hits are raked low string first, 9 ms per string.

### Techniques added in v2

| Technique | Bars | How |
| --- | --- | --- |
| Odd meters | 5–12, 30–36 | 4+4+3+3 (2+2+1.5+1.5) is added as a fourth grouping inside 7/8 |
| Polyrhythm | 5, 7, 11 | Hook tail 1+1+1 (three eighths) against the drums' 1.5+1.5, a 3:2 inside the tail |
| Laid-back vs pushed placement | all | Drums push, while bass and trumpet lay back |
| Humanization | all | Bounded timing and velocity jitter per track |
| Guitar idioms | 5–12, 21–25, 33–37 | Muted chucks, let-ring arpeggios, raked chords, and legato hammer-ons and pull-offs |
| Stereo width | 21–27, 33–38 | Panned double tracks with 15–19 ms offsets, only for the big sections |
| Countermelody | 33–38 | The trumpet line enters only at the peak |
| Timbre layering | 13–19 | Harmonics layered on Gtr 2's top dyad notes |
| Complementary EQ | all | Guitars cut at 320 Hz, Gtr 1 presence lifted so the hook reads over the tapping |
| Unique events | 27 | Harmonics ring E5, B5, and E6 over the false-ending chord |
| Accent maps and ghost notes | 5–12, 33–36 | Accents on 0, 4, 8, and 11, ghosts on 3, 6, 10, and 13, flams in C and the climax |

---

## v1

**[Open v1 in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fseven-corners%2Fproject.json)**

7/8 at ♩ = 144 (eighth = 288), 40 bars, about 58 seconds. Key centre is E major with Lydian ♭VI/♭VII borrowings. The loop is on, and bar 40 leads back into bar 1. Tracks are Gtr 1 (clean, GM 27, pan −0.6), Gtr 2 (clean, GM 27, pan +0.6), Bass (finger, GM 33, centre), and Drums (GS Room kit, centre). `gen.mjs` is the generator that writes `project.json`.

### Plan

Groupings are in eighths within the one 7/8 bar. The hook progression is Amaj9 | E/G♯ add9 | F♯m11 | A/B (B11).

| Bars | Section | Grouping | Harmony | Who plays | Energy |
| --- | --- | --- | --- | --- | --- |
| 1–4 | Intro: hook alone | 2+2+3 | Hook progression | Gtr 1 only. The drums give a tom pickup in the last group of bar 4 | 2 |
| 5–8 | A1: interlock | 2+2+3 | Hook progression | Gtr 1 hook, Gtr 2 tapped 16ths in 3-note cells, bass counter-line, drums with hats, ghosts, and a tom fill in bar 8 | 5 |
| 9–12 | A2: mutation | 2+2+3 | Hook progression | Same as A1, but Gtr 2's cells now descend, and in bar 12 Gtr 1's last note jumps up to F♯5. Fill in bar 12 | 5 |
| 13–19 | B: half-time | 3+2+2 | C♯m9 A E/G♯ F♯m11 C♯m9 A F♯m11 | Gtr 1 low arpeggios, Gtr 2 high dyads 4 per bar (4:7), bass half-time counter-line, drums half-time on ride (one snare per bar). Snare fill in bar 16 | 4 |
| 20 | Build | 3+2+2 | A/B | Guitars as in B, bass B pedal eighths with a crescendo, drums kick eighths with a snare roll moving from eighths to 16ths | 6 |
| 21–25 | C: riff | 2+3+2 | E E C D E | Everyone plays the riff. Bass at the root, Gtr 1 in octave dyads one and two octaves up, Gtr 2 three octaves up. Double-time drums with a tom fill in bar 24 | 8 |
| 26 | Cadence | hits on 1, 3, 6 | C C D | Unison hits from the full band with crashes, then a snare pickup | 9 |
| 27 | False ending | — | E | A big E chord rings for the whole bar with a double crash | 7 decaying |
| 28 | Silence | — | — | Nobody | 0 |
| 29–30 | Restart from the wrong side | 2+2+3 | A E/G♯ | Gtr 2 alone, quiet tapped cells on the right. Closed hats join softly in bar 30 | 1 |
| 31 | Build back | 2+2+3 | F♯m11 | Gtr 2, hats, bass counter-line | 2 |
| 32 | Build back | 2+2+3 | A/B | Gtr 2, bass, Gtr 1 hook returns on the left, tom-to-snare build roll | 5 |
| 33–36 | Climax | 2+2+3 | A E/G♯ F♯m11 **Cmaj7♯11** | Gtr 1 hook, Gtr 2 tapping an octave up, riff bass, double-time drums with a snare on every group. Bar 36 swaps B11 for ♭VI and ends in a fill | 10 |
| 37 | Riff | 2+3+2 | E | Full octave and unison riff | 10 |
| 38 | Stop | hits on 1, 3, 5 | E D C | Unison hits, then silence for the last two eighths | 9 → 0 |
| 39–40 | Outro | 2+2+3 | F♯m11 A/B | Gtr 1 alone with the second half of the hook. A/B resolves into the Amaj9 of bar 1 when the loop wraps | 2 |

Energy runs low, mid, half-time lift, riff peak, and then a false ending into silence. The restart is on the opposite guitar, and from there it climbs to the true peak and stops dead. The piece ends on a lone guitar in the middle of the hook, which is also how it begins.

### Technique checklist

Names are from [composition-landscape.md](https://gist.github.com/hi-ogawa-agent/ebb143c64417ed58b4e9971e4f838e4c).

| Technique | Bars | How |
| --- | --- | --- |
| Odd meters | 1–40 | 7/8 throughout. The groupings are 2+2+3 (1–12, 29–36, 39–40), 3+2+2 (13–20), and 2+3+2 (21–25, 37) |
| Polyrhythm | 5–12, 29–36 / 13–19 | Gtr 2's 3-sixteenth cells (3+3+3+3+2) run as a dotted-eighth pulse against Gtr 1's eighths, which is 3:2 at the subdivision. In B, Gtr 2's four even dyads per bar play 4:7 against Gtr 1's seven eighths |
| Half-time and double-time feel | 13–19 half / 21–25, 33–37 double | Half-time has one snare per bar on the 3+**2**+2 boundary and ride. Double-time puts a snare on every group's second pulse with ride bell |
| Arpeggiation | 1–20, 32–36, 39–40 | Gtr 1's hook and B arpeggios, plus Gtr 2's tapped cells. There is no "tapping" row, so tapped-style lines are counted here |
| Register slotting | 13–19, 33–36 | The interlock comes from registers. Gtr 1 sits low (F♯2–E4) while Gtr 2 sits high (G♯4–A5), and in the climax Gtr 2 moves up another octave |
| Instrumental riff hook | 1–4 (and every hook bar), 21–25, 37 | Gtr 1's 2+2+3 hook is the A theme, and the C riff is the second hook |
| Melodic counter-line bass | 5–19, 31–32 | The A line descends A–E–C♯–B–A against the hook's rising top notes. B is a half-time counter-line |
| Riff bass | 21–25, 33–37 | The bass states the riff at the root. In the climax it plays root, octave, and fifth figures locked to the kick |
| Kick–bass interlock | 21–25, 33–37 | In the riff, the kick lands with the bass on eighths 1, 3, and 4. In the climax, it locks to the bass accents on 1, 3, and 5 |
| Accent maps and ghost notes | 5–19, 33–36 | Hats are accented on group starts. Ghost snares sit on the 16ths before the backbeats and the downbeat. The guitars accent each group start |
| Fills and build rolls | Fills in 4, 8, 12, 16, 24, 36. Build rolls in 20, 26, 32 | Bar 20 accelerates from eighths to 16ths with a crescendo. Bar 32 runs a 16th tom cascade into the snare |
| Section markers | 5, 9, 13, 17, 21, 23, 25, 27, 33, 35, 37 | Crash on the section downbeats |
| Octave and unison doubling | 21–25, 26–27, 37, 38 | The riff is spread across four octaves (bass, Gtr 1 dyad, Gtr 2), and the hits are voiced across the whole band |
| Unison hits | 26, 38 | Whole-band hits on group starts |
| Stop-time and breaks | 38 | Hits followed by silence, so the lone guitar is left on its own |
| False ending | 26–29 | A ♭VI–♭VII–I cadence lands on a ringing E chord, followed by a bar of silence and a restart |
| Silence before the drop | 28 | An empty bar after the false ending |
| Mixolydian and double-plagal cadences | 23–27 | C–D–E (♭VI–♭VII–I) in the riff and again in the cadence hits |
| Modal interchange | 23, 26, 36, 38 | ♭VI (C) and ♭VII (D) borrowed into E major, and Cmaj7♯11 replacing B11 in bar 36 |
| Modal color tone | 23, 24, 36 | The riff's fourth degree is raised to make C Lydian (F♯) and D Lydian (G♯). Bar 36 voices the ♯11 of Cmaj7♯11 |
| Sus and add as default color | 1–20, 29–36, 39–40 | Amaj9, E/G♯ add9, F♯m11, and A/B as stable chords |
| Repetition with variation | 12, 22, 25 | The fourth hook statement breaks upward to F♯5, and the riff's last note lifts from G♯ to D♯ |
| Loop mutation | 9–12, 22, 25 | Gtr 2's cells reverse on the second pass, and the riff's ending mutates |
| Texture choice | 1–4, 29–30, 39–40 | Single-guitar monophony set against full counterpoint in A and in the climax |
| Drum dropout | 28–29, 39–40 | The kit drops out so the guitar is exposed |
| Density build | 29–32 | One layer is added per bar: Gtr 2, then hats, then bass, then Gtr 1 and the build roll |
| Energy curve | 1–40 | See the Energy column in the plan |
| Panning plan | all | Gtr 1 is left at −0.6 and Gtr 2 right at +0.6. Bass and drums are centred |





