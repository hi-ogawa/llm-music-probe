# Pulling Stops

**Demo: [open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fpulling-stops%2Fproject.json)**

A demo of octave and detune on Toy MIDI's own synth, made for https://github.com/hi-ogawa/toy-midi/pull/1067, which gives each synth layer's oscillator an octave and a detune in cents. Until that PR is merged, the deployed app plays every layer at the note's pitch, so listen on the preview of [toy-midi#1070](https://github.com/hi-ogawa/toy-midi/pull/1070), which also adds the octave and detune controls to the Synth panel: [open on the preview](https://fix-issue-1068-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fpulling-stops%2Fproject.json).

90s organ house in A minor at 122 BPM, 32 bars on i–VI–VII–v, looped. A house organ is itself a stack of octaves, so the genre's own sounds are what the feature builds.

| Section | Bars | Focus | What happens |
|---|---|---|---|
| Intro | 1–8 | Bass and drums | Kick and offbeat hats. The bass pumps offbeat roots, adds octave pops from bar 5, and fills into the groove. |
| Groove | 9–16 | Organ | The organ enters on offbeat stabs, and claps join on 2 and 4. |
| Breakdown | 17–24 | Pad | The kick drops out. A detuned saw pad swells with CC1 vibrato over F and G, then the hook plays once, quietly, under a snare roll, and the bass climbs an octave into the drop. |
| Drop | 25–32 | Hook | Everything. The organ switches to a syncopated two-bar figure, the bass gets busier, and the hook plays twice. |

| Track | Layers | Part |
|---|---|---|
| Organ | sines at octaves -1, 0, and +1, like 16', 8', and 4' drawbars, and a sine at +2 that decays in 0.18 s, so each stab starts with a tick | offbeat stabs in the groove, a syncopated figure in the drop |
| Bass | a short square and a sine sub at octave -1 | offbeat roots with octave pops, and a fill at the end of each 8-bar phrase |
| Pad | three saws at -12, 0, and +12 cents, with a slow attack | held chords in the breakdown, with CC1 vibrato, and lowered by CC11 under the drop |
| Hook | the same three saws, with a fast attack | a call that rises to G and an answer a step lower that falls to G. The first answer stops on B, and the second climbs back up to E. |
| Drums | GeneralUser GS Standard kit | four on the floor, open hats on the offbeats, claps, and a snare roll into the drop |

- `pulling-stops.mjs` writes `project.json`.
- The organ shows octave as building one timbre out of layers, and the bass shows it as the textbook sub oscillator. The pad and hook show detune: their three saws beat against each other.
- The organ patch is kept from an earlier 12-bar blues version of this demo, "Drawbars and Drift", which the listener found too thin and the wrong genre for a synth.
- This session composed from the brief and the PR preview's agent docs, `/llms.txt` and `/llms/toy-midi.d.ts`, and read the blues version's script only for the project file's shape.
- Levels were set from per-section renders of the mix and each solo track on the PR's preview with `toy-midi render-audio`, measured as RMS with ffmpeg's `volumedetect`. Over its section, each focus part sits on top: bass and drums near -34 dBFS in the intro, the organ at -31.5 in the groove, the pad at -32 in the breakdown, with the quiet hook level with it over the last four bars, and the hook at -26.5 over the organ's -29 in the drop. The mix peaks at -6.4 dBFS. Nobody had listened to it at that point.

## Toy MIDI doc gaps

- The synth's controller handling isn't in the docs: CC1 as vibrato and its depth and rate, pitch bend's range, and CC7 and CC11. This piece relied on the brief for them.
- How velocity scales a synth note's level isn't documented, so the quiet hook statement's velocity was set by measuring a render.
- The Standard kit's note map isn't documented, so the drums assume General MIDI notes: 36 kick, 38 snare, 39 clap, 42 closed hat, 46 open hat, 49 crash.
