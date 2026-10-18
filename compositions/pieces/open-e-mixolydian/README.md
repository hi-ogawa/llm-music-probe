# Open E Mixolydian

A 24-bar blues-based hard rock loop in E at 125 BPM, 4/4, straight 8ths, built on one open-position guitar riff. The project is `project.json` (`SharedProject` format). `gen.mjs` generates it, and `render.mjs` runs the level check described below. `share-link.txt` has a `/draft#p=` link (about 10.6k characters, too long for Discord).

## Tracks and gain

| Track | Gain stage | Sound | Pan |
| --- | --- | --- | --- |
| Crunch L Riff (open) | Crunch | Telecaster Bridge, Standard | -0.55 |
| Crunch L Riff (muted) | Crunch | Telecaster Bridge, Muted | -0.55 |
| Crunch R Chords (open) | Crunch | Telecaster Bridge, Standard | +0.6 |
| Crunch R Chords (muted) | Crunch | Telecaster Bridge, Muted | +0.6 |
| High Gain Lead | High gain | Telecaster Bridge, Standard, pitch-bend automation | +0.1 |
| Bass | none | GM 34 Electric Bass (pick) | 0 |
| Drums | none | GeneralUser Power kit (bank 128, program 16) | 0 |

Each guitar track stays at one gain for the whole piece, so the offline amp sim can run one setting per track: the four Crunch tracks at crunch, and High Gain Lead at high gain. Open and muted strokes are on separate tracks because they use separate presets, and each pair shares a name prefix and a pan position so they read as one guitar. Guitars are written in standard tuning (E2 A2 D3 G3 B3 E4). Toy MIDI's tab presets are bass-only and `tabString` stops at 5, so the tab fields are left out along with `height` and `viewMode`.

## Plan

Bar numbers are 1-based. Riff bar A is on E and riff bar B is D–A–E.

| Bars | Section | Harmony | Gain on stage | What happens |
| --- | --- | --- | --- | --- |
| 1–4 | Riff alone | E \| D A \| E \| D A | Crunch (L only) | Riff guitar alone. Bar 4 ends with a G–A–A♯–B walk and a one-beat drum pickup fill. |
| 5–8 | Band in | same | Crunch (L + R) | Crash in. Bass doubles the riff an octave down, kick under the riff accents, rhythm guitar R plays open chords with chks on 2 and 4. Bar 8 walks into bar 9. |
| 9–12 | ♭VII–IV–I section | D \| A \| E \| G A | Crunch (L + R) | Contrast: rhythm R lets open chords ring on a 3+3+2 accent, riff L plays open double stops with muted chugs between, bass goes to root 8ths, ride replaces hats. Snare fill into bar 13. |
| 13–16 | Stop-time | E \| D A \| E \| D (A) | Crunch hits + High gain lead | Band hits on 1 (and on &2 in bar 14) followed by space, pedal hat keeps time. The lead enters in the gaps. The band comes back on beat 3 of bar 16 with an A–A♯–B walk and a fill. |
| 17–20 | Lead break | E \| D A \| E \| G A | Crunch (L + R) + High gain lead | Full band. Riff L steps back to muted chugs with one open dyad per half bar, rhythm R plays the backbeat chord pattern. Fill into bar 21. |
| 21–24 | Riff again | E \| D A \| E \| D A | Crunch (L + R) | Same as 5–8, except bar 24: band hits on D (beat 1) and A (&2), then everyone but the riff guitar drops out, and its E–G–G♯ pickup leads back into bar 1, where the riff is alone again. |

The loop range is beats 0–96, so bar 24 wraps into bar 1.

### The riff

Two bars, played as A B A B′ (bar B′ swaps the last half for a blues-scale walk).

- Bar A (E): open E chord on 1, muted low-E chug, G single note (the blue third) on &2, open A string on 3, muted chk on &3, D/A double stop (open D + G string 2nd fret) on 4, muted low-E chug on &4.
- Bar B (D–A–E): open D chord on 1, chk on 2, open A chord on &2 (anticipating beat 3), chk on 3, then single notes E–G–G♯ on &3, 4, &4 pulling back up to the E chord.
- Bar B′: D chord, chk, A chord, then G–A–A♯–B.

## Technique checklist

| Technique | Where | How |
| --- | --- | --- |
| Instrumental riff hook | 1–8, 21–24 | One 2-bar open-position riff is the hook. It mixes single notes (G, A, E–G–G♯), a double stop (D/A), and open chords (E, D, A). |
| Riff bass | 5–8, 21–24 | Bass plays the riff's notes an octave down, including the G–G♯ pickup and the walk in bar 8. |
| Octave and unison doubling | 5–8, 21–24, and the walks in bars 8 and 16 | Bass doubles the riff an octave down, and the A–A♯–B walk in bar 16 is guitar and bass in octaves. |
| Mixolydian and double-plagal cadences | 2, 4, 6, 8, 22 (D–A–E inside the riff); 9–11 (D \| A \| E); 18–19 and 24→1 | ♭VII–IV–I in E, from the riff's second bar landing on the next bar's E chord, and as the contrast section's whole progression. |
| Modal vamp (Mixolydian I–♭VII) | 17–19 | E \| D A \| E under the lead break, with C♯ in the lead over A in bar 18. |
| Bridge or middle 8 | 9–12 | New chord pattern (D \| A \| E \| G A), new texture, ride instead of hats. |
| Guitar idioms: real chord shapes | everywhere | Full open grips: E 022100, A x02220, D xx0232, G 320003, downstrokes low to high with about 8 ms between strings, upstrokes on the top three strings. |
| Open against muted strokes | 1–8, 17–24 (rhythm R chks on 2 and 4; riff L chugs and chks); 9–12, 17–20 (riff L muted chugs between open dyads) | Rhythm carried by open vs muted (Muted preset) strokes, not by velocity steps. |
| Second rhythm guitar panned away | 5–24 | Crunch R at +0.6 plays open chords against the riff at -0.55. |
| Stop-time and breaks | 13–16, 24 | Band hits followed by space. |
| Unison hits | 13–16, 24 | Both guitars, bass, kick, and crash hit the same chord. |
| Call and response | 13–16 | Each band hit is answered by a lead phrase in the space. |
| Pentatonic and blues-scale hooks | 13–20 | E minor pentatonic around the 12th fret, with the blue B♭ in bar 16 (B–B♭–A) and the A♯ walks in the riff. |
| Bends (pitch-bend automation) | 13 (A→B, whole step), 15 (G→A and release), 16 (quarter-tone curl on G), 17 (D→E held), 19 (G→A and release) | Track-level pitch-bend points, curved rise over a third of a beat or less, reset to 0 before the next note. |
| Vibrato (pitch-bend automation) | 13, 14, 15, 17, 18, 20 | About 5 Hz sine on the longer notes, 0.2–0.35 semitones deep, on top of the bend where there is one. |
| Repetition with variation | 17 vs 19; riff A B A B′ | Bar 19 repeats bar 17's held bend a fourth higher with a release. The riff's fourth bar swaps its tail for a walk. |
| Rock backbeat, kick under riff accents | 5–12, 17–23 | Snare on 2 and 4 throughout. Under the riff (5–8, 21–23) the kicks follow its accents: bar A on 1, &2 (the G), and &4; bar B on 1, &2 (the A chord), and &3. In 9–12 and 17–20 the kicks fall on 1, &2, and 3. |
| Fills and build rolls | 4, 12, 16, 20 | 16th snare and tom fills into the next section. |
| Drum dropout | 1–4, 24 | No kit under the riff alone apart from the one-beat pickup fill in bar 4. The kit drops after the A hit in bar 24. |
| Hook-first intro | 1–4 | The piece opens on the riff alone. |
| Subtractive arranging | 17–20 | Riff guitar thins to chugs so the lead has room. |
| Energy curve | 1→12, 13–16, 17–20, 24 | Builds from one guitar to full band, drops to stop-time, peaks at the lead break, then drops back to one guitar for the loop. |
| Panning plan | all | Kick, snare, and bass centered, lead near center (+0.1), the two rhythm guitars split left and right. |

## Mix check

I can't hear the piece, so the check is a measurement. `render.mjs` renders each track alone with fluidsynth, guitar tracks through the same Telecaster Bridge SF3 that Toy MIDI bundles and the rest through GeneralUser GS 2.0.3 (the version Toy MIDI ships), with the 12-semitone bend range Toy MIDI uses. It applies each track's gain and compares RMS per bar for the riff guitar (both Crunch L tracks), the lead, and the drums.

The first pass had the lead 1–5 dB under the drums in the lead break, so I raised the lead from 1.0 to 1.6 and lowered the drums from 0.75 to 0.65. After that, per bar, relative to the drums:

| Section | Riff L | Lead |
| --- | --- | --- |
| 5–8 band in | +5.7 to +6.7 dB | |
| 9–12 ♭VII–IV–I | +2.5 to +6.1 dB | |
| 13–16 stop-time | +3.3 to +9.2 dB | +1.2 to +8.0 dB |
| 17–20 lead break | -0.1 to +2.9 dB | +0.1 to +4.1 dB |
| 21–24 riff again | +5.8 to +6.9 dB | |

In the lead break the riff guitar is about level with the drums, which is on purpose since it has stepped back to chugs, and it still has the left side to itself. The lead is weakest in bar 17 (+0.1 dB) because that bar is one held, bent note decaying for two beats. The full mix peaks at -3.3 dBFS in this render.

Limits: fluidsynth is not Toy MIDI's synth (SpessaSynth), so absolute levels and the drum kit's balance may differ, and bar RMS says nothing about frequency masking. The amp sim will also change the guitars' levels, since gain compresses and brightens them. Treat these numbers as a starting balance and check by ear in Toy MIDI. The lead and riff faders are the first things to adjust.

## Renders

`renders/` has this piece through each step of Toy MIDI's amp sim prototype, numbered as the steps in its README (https://github.com/hi-ogawa/toy-midi/tree/main/tools/amp-sim, added in https://github.com/hi-ogawa/toy-midi/pull/963). Each step through 5 adds one stage to the one before, step 6 takes the cabinet out of step 5, step 7 replaces step 4's gate with automation, every render is normalized to −16 LUFS, and `-guitars` has the guitars soloed.

| File | Guitars |
| --- | --- |
| `0-gm-reference.mp3` | General MIDI's own clean, muted, overdriven, and distortion guitars, no amp |
| `1-no-amp.mp3` | The Telecaster Bridge presets as rendered |
| `2-drive.mp3` | Through the first amp: pre-EQ, one drive stage, and the filter cabinet (`v1`) |
| `3-compressor.mp3` | With a compressor in front and cascaded drive stages, which sustain but leak after note-offs (`v2`) |
| `4-note-gate.mp3` | With the note gate, which cuts each note 30 ms after its note-off |
| `5-room.mp3` | With a short room after the amp, the final chain |
| `6-no-cabinet.mp3` | The final chain without the cabinet, which leaves the drive's fizz above 5 kHz |
| `7-swell-cut.mp3` | Step 3's amp with no note gate, but CC 11 automation on each guitar track that fades to 0 over 30 ms after a note-off and comes back at the next note-on, the gate written as expression instead |
