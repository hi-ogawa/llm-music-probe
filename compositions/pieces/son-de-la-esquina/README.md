# Son de la Esquina

Salsa in the son montuno tradition, in D minor at 190 BPM, with every part locked to a 2-3 son clave.

[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fson-de-la-esquina%2Fproject.json)

`compose.mjs` writes `project.json`. Run it with `node compose.mjs`.

## Brief

> Compose a salsa piece in the son montuno tradition for Toy MIDI. Everything locks to a 2-3 son clave. Choose the clave direction deliberately and keep every part consistent with it.
>
> - **Bass:** a tumbao that anticipates the harmony, landing on the "and" of 2 and on 4 and rarely on the downbeat.
> - **Piano:** a montuno, a syncopated two-bar guajeo in octaves with inner chord tones, locked to the clave.
> - **Form:** intro, a sung-style head (any lead voice), then a montuno section where a coro answers a lead in call and response, a mambo section of interlocking horn riffs layered one at a time, and a tight cierre to end.
> - **Contrast:** the head moves through changes, and the montuno sits on a two- or four-chord vamp that builds by adding layers, not by speeding up.
> - The percussion follows the section: bongo martillo and cowbell come in at the montuno.
>
> Instrumentation is your choice beyond what these roles imply.

Composed blind, from the brief and Toy MIDI's agent docs only.

## Clave

The clave is 2-3 throughout, with two hits on beats 2 and 3 of the first bar and three on 1, the "and" of 2, and 4 of the second. Every section starts on an even bar, so even bars are always the 2 side and odd bars the 3 side, and the script relies on that instead of tracking clave per part.

The parts lock to it like this:

- **Piano guajeo:** the 2-side bar leans on the beat (1, 2, 3, "and" of 3, "and" of 4), and the 3-side bar on the offbeats ("and" of 1, "and" of 2, 3, 4, "and" of 4). The last eighth of each bar takes the next chord.
- **Head and coro phrases** mostly enter on beat 2 of a 2-side bar, on the clave's first hit.
- **Mambo trombone riff** hits the clave's 2-side beats and its 3-side "and" of 2 and 4. The trumpets fill the gaps between them.
- **Timbale bell** is on the beat on the 2 side and follows the 3 side's offbeat.
- **Cierre:** the whole band plays the clave pattern as hits, then lands its last two hits on the next 2 side.

## Form

| Bars  | Section | Harmony                                  | What enters                                                                 |
| ----- | ------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| 1-8   | Intro   | vamp Dm7 G7 Bbmaj7 A7, twice             | piano and clave, then bass, congas, guiro; horn pickup in bars 7-8          |
| 9-40  | Head    | A A' B A' through ii-V's in D minor      | tenor sax sings the melody over piano, bass, congas, guiro                  |
| 41-72 | Montuno | the same four-chord vamp, eight times    | bongo martillo and bongo bell; coro answered by the lead's pregón each cycle |
| 73-96 | Mambo   | vamp, six times                          | trombone riff, then trumpets, then a sax line on top, two cycles apart      |
| 97-100| Cierre  | Dm7, G7, Bbmaj7, A7, Dm6/9               | tutti hits on the clave, an A7 stab, and the final chord                    |

The head's A section is | Dm7 | Dm7 | Gm7 | C7 | Fmaj7 | Bbmaj7 | Em7b5 A7 | A7 |, A' resolves its last bar to Dm7, and B is | Gm7 | C7 | Fmaj7 | Dm7 | Gm7 | A7 | Dm7 | A7 |. The montuno vamp is i, IV7, bVImaj7, V7, so the G7 brings in the Dorian B natural that the coro sings.

The montuno builds by adding layers at the same tempo:

- **Cycles 1-2:** bongo martillo and bongo bell over the congas and guiro, coro and pregón.
- **Cycles 3-4:** maracas.
- **Cycles 5-6:** trombone pads on the guide tones behind the coro.
- **Cycles 7-8:** timbale bell, and a fourth coro voice an octave under the top line.

The pregones climb across the eight cycles, from a short answer near D5 to a call reaching A5 that hands off to the mambo, with a timbale fill into each section.

## Parts

- **Bass (Acoustic Bass):** a tumbao on the "and" of 2 and on 4. The "and" of 2 plays the fifth, or the new root when the chord changes on beat 3. Beat 4 plays the next bar's root and ties over the barline. The only downbeat is the bass's entrance in bar 5, and the cierre hits.
- **Piano (Acoustic Grand):** the guajeo is one two-bar rhythm with a melodic contour, snapped to each chord's tones between D4 and F5, doubled an octave down, and filled with two inner chord tones on every other hit. In the head it follows the changes, at a lower level.
- **Lead (Tenor Sax):** the sung-style voice for the head, the pregones, and the top mambo line.
- **Coro (Choir Aahs):** three voices, the melody plus the two chord tones under it, and four in the last two cycles.
- **Trumpets and Trombones:** two voices each, in thirds or sixths taken from the chord.
- **Percussion:** each instrument is its own track on GeneralUser GS's Standard kit (bank 128, program 0): clave, congas in tumbao with slap on 2 and open tones on 4 and its "and", bongo martillo, bongo bell in quarters with 1 and 3 accented, timbales (bell, fills, crashes), and guiro with maracas.

Notes are on an eighth-note grid with small seeded velocity variation, so reruns write the same file.

## Choices I made without hearing it

- Levels are set by role (lead and bass on top, piano and horns under them, percussion lower) and haven't been measured.
- The timbalero plays no cáscara in the head, because the GM key map has no timbale shell sound. Congas and guiro carry the head instead.
- The bongo martillo and the bongo bell play together in the montuno, as the brief asks, although one bongocero usually switches from one to the other.

## Toy MIDI doc gaps

- **Drum tracks:** the docs list bank 128's kits but don't say that notes on them follow the GM percussion key map, or whether several tracks can use a kit at once. I assumed both, with one track per percussion instrument.
- **Percussion note length:** it isn't documented whether a drum note's duration affects its sound, such as for a long guiro scrape, or whether the sample always plays out. I gave long guiro strokes 0.9 beats and other hits 0.2-0.3.
- **Overlapping notes:** it isn't documented what happens when two notes of the same pitch overlap on one track. I shortened ties and anticipations so none overlap.
- **Kit sounds beyond GM:** the docs don't say whether GeneralUser GS's kits have sounds outside the GM key map, such as a timbale shell for cáscara.
