# Orchestral genre triggers

- Date: 2026-10-14
- Model: claude-opus-5-5

## Setup

Four fresh composing sessions each got the same short prompt, differing only in the genre or artist named as the inspiration. The shape follows the prompt behind [Overture in D minor](https://github.com/hi-ogawa/llm-music-probe/tree/main/experiments/12-classical-overture-loop): loose, no technique names, "anything you think works". The one constraint, no drum kit, makes the orchestra carry each genre's groove:

> compose some orchestral music inspired by {trigger} in Toy MIDI and give me the share link. Follow https://toy-midi.hiro18181.workers.dev/llms.txt. No drum kit, so the groove has to come from the orchestra. Multiple sections. Loop. Build-ups at the section boundaries. Or anything you think works.

Each session wrote its piece as a share link and a short note on how it read the inspiration. All four came back in one pass. The listener found three natural and good, city pop above all, and Daft Punk weak.

These sessions were not clean of probe context. Every forum session started with the assistant's home memory loaded, which at the time described this probe, its working hypothesis, and the loudness finding from 13. The city pop session followed that thread into rendering its own track levels. The pieces themselves don't obviously reflect it.

## Runs

| Piece | Inspiration | Bars | BPM | Tracks | Raw output |
|---|---|---|---|---|---|
| [Night Cruise Overture](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-cruise-overture%2Fproject.json) | 80s Japanese city pop | 74 | 112 | 15 | [session gist](https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/night-cruise-overture) |
| [Orquestra de Bolso](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Forquestra-de-bolso%2Fproject.json) | bossa nova and Antônio Carlos Jobim | 48 | 132 | 13 | [session gist](https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/orquestra-de-bolso) |
| [Orchestral Dilla](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Forchestral-dilla%2Forchestral-dilla.json) | J Dilla beats | 40 | 88 | 16 | [session gist](https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/orchestral-dilla) |
| [One More Loop](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fone-more-loop%2Fproject.json) | Daft Punk | 68 | 122 | 12 | [session gist](https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/one-more-loop) |

- **Night Cruise Overture (city pop):** maps each rhythm-section job onto the orchestra. Pizzicato basses pop octaves with chromatic approach notes, pizzicato chords on the 16th offbeats stand in for cutting guitar, brass stabs push the & of 4, and a glockenspiel stands in for the DX7 bell. The chorus uses the "Just the Two of Us" progression, and a brass interlude side-slips from E♭ up to E for the last chorus. The listener's favorite: "so polished".
- **Orquestra de Bolso (Jobim):** reads Jobim as harmony moving under a melody that barely moves. It uses Fmaj9 → B♭m6/F (minor iv over a tonic pedal, every voice up a half step), a chromatic inner line Am7 → A♭dim7 → Gm9, a held D whose function changes from the 11th of Am7 to the 9th of C7 (the "Samba de Uma Nota Só" device), and a tag on G♭7♯11 that falls back into F. The bossa guitar's thumb and fingers are split between pizzicato basses and harp.
- **Orchestral Dilla:** gives each drum role to an orchestral part. Low pizzicato is the kick, a pizzicato chord about a 16th of a beat late is the dragging snare, swung half-ghosted high pizzicato is the hats, and uneven string stabs are the chopped sample. A IV–iii–ii–V loop in D♭ flips to B♭ minor in half-time with triplet hats, and each section ends with a half-beat dropout before the downbeat. The listener found the forced groove partly failing, but some ideas concrete and worth studying.
- **One More Loop (Daft Punk):** reads French house as one four-bar loop with parts added and removed, a repeated robotic brass riff, timpani four-on-the-floor, and violin spiccato as hats. The agent noted it couldn't automate a filter sweep and faked one with rising velocity and register. The listener found it weak.

## Notes

- Genres whose identity is harmony and rhythm translated into an orchestra (city pop, Jobim). The one whose identity is sound processing did not: French house lives in filter sweeps, sidechain pumping, and vocoders, none of which exist in a MIDI orchestra, and the agent said so itself. Dilla sits between, with its feel reduced to a timing rule (the late snare) that partly survives.
- Every agent mapped drum-kit roles onto specific orchestral techniques without being asked to (pizzicato kick, late pizzicato snare, spiccato hats, timpani four-on-the-floor), and explained the mapping in its note.
- The harmony in the strong pieces is idiomatic and specific: named devices used for a reason, not generic extended chords.
- A loose prompt with one constraint produced the most convincing results so far, consistent with 12.

## References

- Session gists: [city pop](https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/night-cruise-overture), [Jobim](https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/orquestra-de-bolso), [Dilla](https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/orchestral-dilla), [Daft Punk](https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/one-more-loop)
- Project files are in each session gist and open in Toy MIDI with `/draft?src=` ([toy-midi#856](https://github.com/hi-ogawa/toy-midi/issues/856))

