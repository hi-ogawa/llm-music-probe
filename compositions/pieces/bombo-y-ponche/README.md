# Bombo y Ponche

Salsa in the son montuno tradition, composed directly in a session from Hiroshi's brief, which named no reference recording. It is 78 bars of 4/4 at 184 BPM in C minor, about 1:43.

**[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fbombo-y-ponche%2Fproject.json)**

- `project.json`: the piece.
- `compose.mjs`: the generator. `node compose.mjs project.json` writes it.

## Clave

Everything sits on a 2-3 son clave. Odd bars are the 2-side, with strokes on beats 2 and 3, and even bars are the 3-side, with strokes on 1, the "and" of 2, and 4. The 3-side's "and" of 2 is the bombo and its 4 the ponche, the two spots the tumbao lands on, which gives the piece its name. Every section is an even number of bars and starts on an odd bar, so no section flips the clave.

The parts follow from that choice:

- **Piano guajeo.** On the 2-side bar, the octaves fall on beats 2, 3, and 4, on the strokes. On the 3-side bar, they push: the "and" of 2 (the clave's offbeat) anticipates the chord on beat 3, and the "and" of 4 anticipates the next bar. Beat 1 of each bar is tied from the anticipation before it.
- **Tumbao.** Notes fall on the "and" of 2 and on 4, and beat 4 carries the next bar's root a beat early and ties over the barline. The bass strikes a downbeat only at the cierre's hits. On the 3-side, the bass's "and" of 2 lines up with the piano's anticipation and the clave stroke.
- **Coro.** It enters on the 2-side's beat 2, and its accents fall on the 2-side's 2 and 3 and the 3-side's "and" of 2.
- **Campana.** The bell's mouth falls on every clave stroke, and the neck plays around it.
- **Conga.** With two drums, the open tones on 4 and the "and" of 4 sit on the high conga in the 2-side bar and move to the tumba in the 3-side bar.
- **Mambo riffs.** Each riff takes a different part of the clave (see below).
- **Cierre.** The last hits are the clave's own strokes, and the band stops on the final 4.

## Form

| Bars | Section | Harmony | What happens |
|---|---|---|---|
| 1-8 | Intro | Abmaj7 \| G7 | Piano guajeo and clave alone, then bass, congas, and güiro from bar 5, with a timbale fill into 9 |
| 9-10 | Tutti figure | Abmaj7 \| G7 | Horns, piano, and bass in a unison-and-harmony figure that pushes into G7 on the "and" of 4 and accents the 3-side's "and" of 2 and 4. It comes back as the cierre |
| 11-26 | Head | Cm7 Fm7 Bb7 Ebmaj7 \| Abmaj7 Dm7b5 G7 Cm7 \| Cm7 C7 Fm7 Bb7 \| Ebmaj7 Abmaj7 Dm7b5 G7b9 | The flute sings the melody. The second half restarts the opening phrase and C7 pushes it a step higher, to Db6 and Eb6. Piano guajeo on the changes, tumbao, one-drum conga, güiro. No bongo or bell |
| 27-58 | Montuno | Cm Fm \| G7 Fm | Four cycles of a 4-bar coro and a 4-bar sonero answer. Bongo martillo and campana come in at 27. Each cycle adds a layer (below) |
| 59-74 | Mambo | Cm Fm \| G7 Fm | Interlocking riffs layered one at a time: trombones from 59, trumpets from 63, saxes from 67, and all three from 71 |
| 75-78 | Cierre | Abmaj7 \| G7 \| Cm | The intro figure, then the whole band hits the clave strokes of bars 77-78 and stops on beat 4 with a Cm6/9 and a crash |

## How the montuno builds

The tempo never changes. Each cycle adds layers:

1. **27-34:** Piano guajeo, tumbao, clave, conga, güiro, plus the new bongo martillo and campana. The coro sings in two voices, and the sonero's first inspiración is relaxed and mid-register.
2. **35-42:** The coro opens to three voices, the conga adds the tumba, and the tumbao adds a sixteenth pickup into beat 4 on the 3-side. The sonero repeats notes in a higher register.
3. **43-50:** The tres enters with its own guajeo in octave pairs, mostly on the beats the piano ties over: beat 1 of each bar and beat 3 of the 3-side. The sonero's line turns syncopated and adds sixteenths.
4. **51-58:** Timbale fills every four bars, a harder bell and piano, and octave pops in the bass. The sonero's peak is a held F6 and a sixteenth-note run down.

## Mambo riffs

All three riffs are two bars long on the vamp, and each takes a different part of the clave:

- **Trombones:** the 2-side's beat 2 into a held "and" of 2, and the same shape on the 3-side, where the held note lands on the clave's offbeat.
- **Trumpets:** the gaps the trombones leave, from the "and" of 3 through the "and" of 4 in each bar, holding over the barline.
- **Saxes:** the two strokes still open, the 2-side's beat 3 and the 3-side's beat 1, plus the 3-side's "and" of 1 and beat 3.

Together they strike all five clave strokes and most of the 8ths, with none of the three doubling another's attack.

## Instrumentation

Flute as the lead voice, a Choir Aahs coro, two trumpets, two trombones, two alto saxes, piano, a tres played on GM steel-string guitar, acoustic bass for the baby bass, and clave, congas, bongos, campana, güiro, and timbales on separate tracks of the standard kit.

## Toy MIDI doc gaps

- **Drum key map.** The docs list bank 128's kits but not which keys hold which sounds. I assumed the General MIDI percussion map: 75 claves, 60 and 61 bongos, 62 to 64 congas, 65 and 66 timbales, 56 cowbell, 73 and 74 güiro.
- **Several drum tracks.** The docs don't say whether more than one track can use bank 128 at once. The piece splits the percussion into six bank-128 tracks so each part has its own level and pan.
- **Drum note length.** The docs don't say whether a duration matters on a drum kit, for example whether the long güiro's duration changes its sound.
