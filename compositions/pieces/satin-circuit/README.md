# Satin Circuit

An early-80s boogie in G minor at 114 BPM, 21 bars, written to test whether Toy MIDI's own subtractive synth would earn its place ([toy-midi#1005](https://github.com/hi-ogawa/toy-midi/issues/1005)). The synth parts carry it, so the piece only works if they respond to how they're written.

- [Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fsatin-circuit%2Fproject.json), on General MIDI presets
- [Synth ladder](https://gisthost.github.io/?9ec4947671b13c60be1ddd9f8eb13f39/satin-circuit-synth-ladder.html), where the bass and then the lead move from General MIDI to a prototype synth one change at a time, each step playable in the mix and solo
- [Brief](prompt.md)

## The piece

| Bars | Section | Harmony |
|---|---|---|
| 1-4 | Intro, bass and pad | Gm9, C9, Gm9, Ebmaj9 F13 |
| 5-12 | A, the lead's hook twice, the second time higher | same loop |
| 13-16 | B, long lead notes | Ebmaj9, Dm9, Cm9, D7#9 |
| 17-20 | A' | the loop, ending on a slide down to G |
| 21 | last chord | Gm9 |

- **Synth bass (the star)** plays octave-jumping sixteenths with accents at velocity 110 and up and ghost notes at 60 to 70, so a filter that follows velocity barks on the accents and stays dark on the ghosts. The slide at the end of a bar lands on the next chord's root, mostly from a half step away, and the Ebmaj9 F13 bars end on an octave dive onto G.
- **Lead** is a portamento lead. About half its notes overlap the next one, which is where a mono synth glides, and the hook's long notes and all of B are held long enough for a delayed vibrato to come in.
- **Pad** holds rootless voicings on Polysynth, with C9 and F13 pushed an eighth ahead of the beat.
- **Drums** are the Standard kit, with sixteenth hats, a clap on the snare, and fills into each section.

On General MIDI, the bass and the lead get the same intent through controllers. CC 65 turns portamento on around each overlapping note, and CC 5 sets its speed, at 32 for the bass and 48 for the lead. SpessaSynth's portamento moves at a set time per semitone, about 12 ms and 25 ms here, so an octave dive takes longer than a half-step slide, unlike the synth's glide. CC 74 before each note raises the preset's cutoff on accents and lowers it on ghosts. The previous note still sounds through the overlap, because mono mode is CC 126, past the controllers a Toy MIDI track automates.

## Files

- `compose.mjs` writes `project.json`. Parts are written bar by bar as `pos:note:len:vel` tokens in sixteenths, and a trailing `~` makes a note overlap the next one by an eighth of a beat. The General MIDI controllers are derived from the notes.
- `render.mjs` is the prototype synth and the ladder. It renders the drums and the pad, and the General MIDI bass and lead, through spessasynth_core with GeneralUser GS and effects off, the way the app plays them. It needs a Toy MIDI checkout with dependencies installed, found next to this repository or through `TOY_MIDI`, and writes its clips to `out/`.
- `page.mjs` builds the ladder page from `out/`, with every clip embedded so it shares as one gist file.

## The prototype synth

It is one monophonic voice, which can be a unison stack.

- **Oscillators** are a saw and a square, band-limited with PolyBLEP, mixed at set levels and octaves.
- **Filter** is a 2-pole lowpass in the topology-preserving state-variable form, so its cutoff can move every sample. The cutoff, in octaves above its base, adds keytrack around C4 and the filter envelope, whose depth velocity scales.
- **Envelopes** have a linear attack and exponential decay and release, and a retrigger starts from the current level, so it doesn't click.
- **Glide** happens only when a note starts while the previous one is held. Then the pitch slides with a one-pole on semitones, and the envelopes keep running, as on a mono synth played legato. A detached note jumps and retriggers.
- **Vibrato** is a sine that starts a set time into each note and fades in, so short notes stay straight.
- **Unison** detunes copies evenly across a cent spread and pans them across the stereo field.

## The ladder

Clips cover bars 9 to 16, the second half of A and all of B. Every version of the bass and the lead is loudness-matched to the project's General MIDI version over those bars, using K-weighted loudness as in BS.1770 without gating, and one gain is shared by every clip, so no step wins by being louder.

| Step | Bass ladder, lead as the project plays it |
|---|---|
| b0 | General MIDI Synth Bass 1, notes only |
| b0p | + portamento on overlaps |
| b0c | + CC 74 from velocity, which is the project as it plays |
| b1 | own saw, filter wide open |
| b2 | + filter envelope: base 150 Hz, half keytrack, 4 octaves of envelope with a 150 ms decay |
| b3 | + resonance 0.6 |
| b4 | + velocity to filter depth, so a ghost at 64 opens 60% as far as an accent at 127 |
| b5 | + glide on overlaps, 35 ms |
| b6 | + a square sub-oscillator an octave down |

| Step | Lead ladder, over the b6 bass |
|---|---|
| l0 | General MIDI Saw Lead, notes only |
| l0p | + portamento on overlaps |
| l0c | + CC 74 from velocity, which is the project as it plays |
| l1 | own saw, filter wide open |
| l2 | + filter envelope: base 1.1 kHz, 70% keytrack, 2.5 octaves of envelope with a 350 ms decay |
| l3 | + resonance 0.4 |
| l4 | + velocity to filter depth |
| l5 | + glide on overlaps, 60 ms |
| l6 | + delayed vibrato, 5.5 Hz and ±18 cents, from 0.3 s into a note |
| l7 | + unison, three saws over ±9 cents |

The patch values are first guesses, checked only in spectrograms, because the session couldn't listen. Which steps stay is for the ear.

The pad stays on General MIDI in every step, so the ladder isolates the bass and the lead. A synth pad needs polyphony, which the prototype doesn't have yet.

## Levels

General MIDI levels over bars 9 to 16 with the project's track gains are lead -29.5 LUFS, bass -27.4, drums -30.0, and pad -35.7. The bass sits on top as the star, with the lead about 2 dB under it.

## Toy MIDI doc gaps

- The docs don't say that presets honor portamento through CC 65 and CC 5, how CC 5 maps to time, or that overlapping notes on a track both sound because a track can't switch to mono. This session found them in SpessaSynth's source.
- The docs name CC 1, 11, and 64 as examples but don't list which controllers shape a synth preset's sound, such as CC 74 for cutoff, or how far they move it.
