# La Clave Manda

A son montuno salsa in D minor on a 2-3 son clave, at 190 quarter notes per minute, felt in two. It runs 72 bars, about a minute and a half.

- Project file: [`project.json`](project.json), written by [`compose.mjs`](compose.mjs) (`node compose.mjs`)
- Open in Toy MIDI: https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fla-clave-manda%2Fproject.json

## Brief

The brief, as given to the session:

> Compose a salsa piece in the son montuno tradition for Toy MIDI. Everything locks to a 2-3 son clave. Choose the clave direction deliberately and keep every part consistent with it.
>
> - **Bass:** a tumbao that anticipates the harmony, landing on the "and" of 2 and on 4 and rarely on the downbeat.
> - **Piano:** a montuno, a syncopated two-bar guajeo in octaves with inner chord tones, locked to the clave.
> - **Form:** intro, a sung-style head (any lead voice), then a montuno section where a coro answers a lead in call and response, a mambo section of interlocking horn riffs layered one at a time, and a tight cierre to end.
> - **Contrast:** the head moves through changes, and the montuno sits on a two- or four-chord vamp that builds by adding layers, not by speeding up.
> - The percussion follows the section: bongo martillo and cowbell come in at the montuno.
>
> Instrumentation is your choice beyond what these roles imply.

The brief names no reference recording on purpose.

## Setup

Composed blind, as the [compositions README](../../README.md) describes. The session worked from the brief and Toy MIDI's agent docs ([`/llms.txt`](https://toy-midi.hiro18181.workers.dev/llms.txt) and [`/llms/toy-midi.d.ts`](https://toy-midi.hiro18181.workers.dev/llms/toy-midi.d.ts)) and did not open other pieces. The session composed in its own turn, without a subagent, and did not hear the result. The checks were structural: note ranges, and where each part's attacks fall in the clave cycle.

## Composition

**Clave.** The piece is notated in 4/4, so one clave cycle spans two bars. Even bars are the 2 side, with clave on beats 2 and 3, and odd bars are the 3 side, with clave on 1, the and-of-2 (the bombo), and 4. Every section has an even number of bars, so the clave never turns around, and every part takes its shape from this split. The 2 side is on the beat and the 3 side leans on the offbeats.

**Form.**

| Bars  | Section | What happens |
| ----- | ------- | ------------ |
| 1-8   | Intro   | Piano guajeo with clave, then bass, congas, and güiro, then a trumpet and trombone figure twice. Bar 8 breaks on the 3 side (1, and-of-2, 4) into the head. |
| 9-24  | Head    | Alto sax sings a 16-bar melody over Dm7, Gm7, C7, Fmaj7, Bbmaj7, Em7b5, A7, twice through, with the second half climbing to A5. Soft trombone guide tones sit under the second half. |
| 25-28 | Puente  | The band plays the clave itself as block hits on the vamp, twice, with a timbale fill. |
| 29-44 | Montuno | Coro and pregón over Dm, Gm, A7, Gm, two beats each. Bongo martillo and the bongo bell enter here. Each four-bar cycle adds a layer: three-part coro in cycle 2, the piano's top octave in cycle 3, and conga and bass variations in cycle 4. |
| 45-60 | Mambo   | Three horn riffs enter one at a time, four bars apart. The trombones own the 2 side, the trumpets answer on the 3 side, and the bari sax punches the clave underneath. All three play together for the last eight bars. |
| 61-68 | Coro    | Two more coro and pregón cycles, with the bari still on the clave. |
| 69-72 | Cierre  | The whole band plays the clave rhythm as a cadence, twice, ending on a Dm6/9 on the 3 side's beat 4. |

**Bass.** The tumbao plays only the and-of-2 and beat 4. Beat 4 takes the root of the next bar's chord and holds it across the barline, so the bass almost never attacks a downbeat. On the vamp, the and-of-2 anticipates the chord change on beat 3, which gives the line G A | G D. In the head, the chord holds for the whole bar, so the and-of-2 would repeat the anticipated root. There, it moves to the chord's fifth instead.

**Piano.** The guajeo is two bars long. On the 2 side, it plays beats 2, 3, and 4, with pushes on the and-of-2 and the and-of-4. On the 3 side, it plays only offbeats, so the right hand answers the bombo. Each attack has a top note doubled an octave below, with a chord tone a fourth or so under the top. An offbeat attack takes the chord it anticipates half a beat later. On the vamp, the top line is A D D Bb D C# | E D Bb A. In the head, the same slots snap to the nearest tones of each bar's chord, so the guajeo follows the changes without changing shape.

**Percussion.** The clave plays from the first bar to the last. The congas play a tumbao throughout, with a slap on 2 and open tones on 4 and the and-of-4, dropping to the low drum on the 3 side. The güiro plays long-short-short. At the montuno, the bongo martillo (open on 1 and 3, low bongo on 4) and the bongo bell (mouth on 1 and 3, plus the and-of-2 on the 3 side) come in. Timbale fills and crashes mark the section changes.

**Mix.** Levels are set by role, without a listen. The lead and bass are near unity, and the percussion is between 0.45 and 0.7. The trumpets and trombones are panned opposite each other.

## Toy MIDI doc gaps

- **Drum key map.** The docs list GeneralUser GS's drum kits in bank 128 but don't say they follow the General MIDI percussion key map, or which keys each kit fills. The piece assumes the GM map (claves 75, bongos 60 and 61, congas 62 to 64, timbales 65 and 66, cowbell 56, güiro 73 and 74) on the Standard kit.
- **Choke groups across tracks.** The percussion is split into several tracks on the same kit. The docs don't say whether a kit's choke groups, such as long and short güiro or open and muted conga, work within one track only or across tracks.
- **Preset envelopes.** The coro uses Choir Aahs (52) for short, syncopated notes. The docs don't say how quickly a preset's attack speaks or how long its release rings, so the piece can't tell whether eighth-note coro hits will come through or smear.
