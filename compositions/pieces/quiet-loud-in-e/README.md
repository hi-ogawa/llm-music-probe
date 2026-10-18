# Quiet-Loud in E

A 24-bar loop at 120 BPM in 4/4, in E, written for Toy MIDI. The project file is `quiet-loud.json` (`SharedProject` format). `gen.mjs` generates it, and `check-mix.mjs` runs the level check described below.

## Plan

Gain is the amp-sim setting each guitar track will get in the offline render. Toy MIDI plays every guitar track clean on the Telecaster Bridge SoundFont: Standard (program 0) for open strokes and Muted (program 1) for palm mutes.

| Bars | Section | Gain | Harmony | What happens |
| --- | --- | --- | --- | --- |
| 1–4 | Intro | Crunch | E – D A – E – D G A | Two-bar riff in open position: two palm-muted chugs on the chord's root string, then an open chord stroke on the backbeat ("chug-chug-STAB"). Bar 4 varies the second half (G, A pushing back to E). Full kit, kick on the chugs, crash on bar 1. Bass doubles the riff roots. |
| 5–8 | Verse | Clean | same | The same riff, same shapes and thirds, on the clean tracks. Kit drops to cross-stick and soft closed hats, kick still on the chugs. Bass on held roots. Bar 8 ends in a small tom pickup. |
| 9–12 | Pre-chorus | Crunch | A – A – C – D | Palm-muted eighth chugs build: A pedal on the open A string (9–10), then C and D in their open shapes (11–12), with open chord stabs closing bars 10 and 11. Bass rises A → C → D. Snare build roll: eighths in bar 11, sixteenths on beats 1–2 of bar 12, thirty-seconds on beat 3, then the kit drops out for beat 4 while an open D chord rings. |
| 13–20 | Chorus | High gain | E5 C5 G5 D5 ×2 | Open power chords (root, fifth, octave) in straight eighths, double-tracked on High Gain L and R, panned hard, with the R take humanized a few milliseconds off L. Bass root pulse in eighths. Crash on 13 and 17, crash-cymbal ride, tom fill into 17, snare fill into 21. |
| 21–24 | Lead break | High gain | E5 C5 G5 D5 | Rhythm doubles thin to sustained, syncopated hits (beat 1, the "and" of 2, beat 3, the "and" of 4), and over them a single-note E minor pentatonic lead at the 12th to 15th frets, with whole-step bends on D→E (bar 21) and A→B (bar 23), each held two beats. Ride replaces the crash wash. Tom fill on bar 24 rolls back into bar 1. |

The loop runs bar 1 to the end of bar 24, so the D5 and the tom fill in bar 24 resolve onto the intro's E and crash.

Harmony: the riff is E Mixolydian (I–♭VII–IV, a double-plagal cadence), and the chorus borrows from E Aeolian (i–♭VI–♭III–♭VII). Thirds only appear in the clean and crunch sections. Every high-gain part is either root–fifth–octave or a single-note lead.

Gain-named tracks:

- `Crunch` (Standard) and `Crunch Mute` (Muted): bars 1–4 and 9–12
- `Clean` (Standard) and `Clean Mute` (Muted): bars 5–8
- `High Gain L` and `High Gain R` (Standard): bars 13–24
- `High Gain Lead` (Standard): bars 21–24

The open and muted tracks of one gain are one guitarist, so they never overlap in time.

## Technique checklist

Names are from the composition landscape cheatsheet.

| Technique | Bars | Where |
| --- | --- | --- |
| Energy curve | 1–24 | Crunch intro → clean verse → muted crunch build → high-gain chorus → lead break, so loudness comes from gain and density, not volume automation |
| Verse–pre-chorus–chorus | 5–20 | Verse 5–8, pre-chorus 9–12, chorus 13–20 |
| Instrumental riff hook | 1–8 | The chug-chug-STAB riff, crunch in 1–4, clean in 5–8 |
| Repetition with variation | 4, 8 | Bar 4 (and 8) replaces the A half with G–A pushes |
| Guitar idioms | 1–24 | Open-position chord shapes (E, D, A, G, C, frets 0–3), palm-muted chugs, open power chords (frets 0–5), strums as staggered string starts |
| Mixolydian and double-plagal cadences | 1–8, 24→1 | Riff E–D–A (I–♭VII–IV); D5 in bar 24 back to E in bar 1 |
| Aeolian "epic" loop | 13–24 | E5–C5–G5–D5 (i–♭VI–♭III–♭VII) |
| Modal interchange | 13 | Chorus trades the riff's major E (G♯) for E Aeolian's G and C |
| Guitar idioms: power chords | 13–24 | Every high-gain chord is root–fifth–octave. Thirds (G♯, F♯, C♯) only in clean 5–8 and crunch 1–4, 9–12 |
| Low interval limits | 1–24 | High-gain power chords have no thirds; muted chugs take two low strings only |
| Pedal point | 9–10 | Palm-muted A pedal on the open A string |
| Pre-chorus build | 9–12 | Bass and harmony rise A → C → D, chugs go from a full bar of eighths to shorter runs closed by open stabs, snare roll |
| Fills and build rolls | 4, 8, 11–12, 16, 20, 24 | Floor-tom push (4), tom pickup (8), snare roll eighths → sixteenths → thirty-seconds (11–12), tom fill (16), snare fill (20), tom roll back to the top (24) |
| Drum dropout | 12 beat 4 | Kit stops while the open D chord rings, then crash and kick on bar 13 |
| Section markers | 1, 13, 17, 21 | Crashes on section downbeats |
| Kick–bass interlock (kick locked to the palm mutes) | 1–12 | Kick on chugs 1, 1&, 3, 3& in intro and verse; on the chug eighths in the pre-chorus; bass doubles riff roots in the intro and the chug eighths in the pre-chorus |
| Root pulse | 13–24 | Bass root eighths under chorus and lead break |
| Texture choice / subtractive arranging | 5–8, 21–24 | Verse drops to cross-stick, soft hats, held bass. Lead break thins the rhythm doubles to sustained hits |
| Stereo width (double tracking) | 13–24 | High Gain L/R panned −1/+1, R strummed looser and 0–12 ms late with small velocity drift |
| Panning plan | 1–24 | Kick, snare, bass centered, rhythm doubles hard L/R, lead near center, clean and crunch guitar slightly left |
| Pentatonic and blues-scale hooks | 21–24 | E minor pentatonic lead, 12th to 15th frets |
| Pitch-bend lead (`bend`) | 21, 23 | D→E bend on beat 3 of bar 21 and A→B on beat 3 of bar 23, each held two beats, as pitch-bend automation on High Gain Lead |
| Gap-fill / contour design | 21–24 | Lead opens high on E5, falls, rises to the bend, and lands on low E (64) at the end of bar 24 into the intro's E |
| Static balance | 1–24 | Track gains set from the level check below |

## Mix check

I couldn't listen, so I measured instead. `check-mix.mjs` writes each track to a MIDI file, renders it with fluidsynth (Telecaster Bridge SF3 for the guitars, GeneralUser GS for bass and drums), applies the track's gain, and compares the summed guitar power against the drum power per section and per bar. It runs twice: broadband, and band-limited to 800 Hz–4 kHz, where a guitar has to cut through kick, snare, and cymbals. `levels.mjs` prints per-track, per-bar RMS for balancing.

The first pass found three problems, and I fixed each one:

- The Muted preset sits about 6 dB under Standard, which left the pre-chorus at 0 dB against the drums (−4.7 dB in its worst bar). Raised `Clean Mute` to 1.7 and `Crunch Mute` to 1.6.
- The snare roll in bar 12 was the loudest drum bar in the piece. Lowered the roll's velocities.
- The lead was about 10 dB under each rhythm double. Raised `High Gain Lead` to 2.0 and thinned the doubles in the break to sustained hits.

Final numbers, guitar power over drum power in dB (positive means the guitars are louder):

| Section | Broadband | Worst bar | 800 Hz–4 kHz | Worst bar |
| --- | --- | --- | --- | --- |
| Intro | +7.4 | +5.8 | +16.7 | +14.0 |
| Verse | +14.7 | +13.0 | +25.5 | +24.7 |
| Pre-chorus | +4.3 | +0.4 (bar 12, snare roll) | +14.2 | +12.0 |
| Chorus | +8.4 | +5.0 | +18.0 | +13.8 |
| Lead break | +8.6 | +6.1 | +19.9 | +16.4 |

In the lead break, the lead alone is +3.5 dB over the drums broadband and +16.3 dB in the band, and it is level with each rhythm double while sitting in the center between them.

Caveats: fluidsynth is not Toy MIDI's synth, so absolute levels differ, but both use the same SoundFonts, so the ratios should carry over. The guitars will also go through amp sims, which compress and add level, so the crunch and high-gain sections will be denser than this clean render. Gains on the clean, crunch, and high-gain tracks may need a final trim after the render.

## Renders

`renders/` has this piece through each step of Toy MIDI's amp sim prototype, numbered as the steps in its README (https://github.com/hi-ogawa/toy-midi/tree/main/tools/amp-sim, added in https://github.com/hi-ogawa/toy-midi/pull/963). Each step through 5 adds one stage to the one before, step 6 takes the cabinet out of step 5, every render is normalized to −16 LUFS, and `-guitars` has the guitars soloed.

| File | Guitars |
| --- | --- |
| `0-gm-reference.mp3` | General MIDI's own clean, muted, overdriven, and distortion guitars, no amp |
| `1-no-amp.mp3` | The Telecaster Bridge presets as rendered |
| `2-drive.mp3` | Through the first amp: pre-EQ, one drive stage, and the filter cabinet (`v1`) |
| `3-compressor.mp3` | With a compressor in front and cascaded drive stages, which sustain but leak after note-offs (`v2`) |
| `4-note-gate.mp3` | With the note gate, which cuts each note 30 ms after its note-off |
| `5-room.mp3` | With a short room after the amp, the final chain |
| `6-no-cabinet.mp3` | The final chain without the cabinet, which leaves the drive's fizz above 5 kHz |
