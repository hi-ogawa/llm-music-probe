# Playing scores in toy-midi

What toy-midi (`../toy-midi`) needs to play General MIDI files the way our renderer does. The reference is `fluidsynth`, which `src/midi/render.ts` uses to turn MIDI into WAV. It is not what our export happens to write today, because the export will grow: slides need pitch bend, and feel and phrasing need controller changes over time.

This comes from reading code on 2026-10-08: toy-midi, the synth wrapper it vendors, and the oxisynth fork behind it. Nothing has been tried in the browser yet.

## Layers in toy-midi

- **Synth engine.** oxisynth, a Rust port of fluidsynth, from the `chore-realtime-safe` branch of `hi-ogawa/OxiSynth`. Its event set covers note on and off, control change, pitch bend, program change, channel and key pressure, and all notes or sounds off, each with a channel (`src/core/midi_event.rs`). It handles bank select, sustain, the pitch bend range through RPN 0, a drum channel, and passes other controllers to SoundFont modulators (`src/core/synth/internal/midi.rs`). It has reverb and chorus modules.
- **Wrapper.** `SoundfontPlayer` in `../web-audio-worklet-rust/packages/wasm/src/soundfont_player.rs`, vendored as `src/assets/oxisynth/` in toy-midi. It exposes only `note_on(key, vel)`, `note_off(key)`, `set_preset`, `set_gain`, and `process`, all on one channel.
- **App.** Any number of MIDI tracks, each with one static program, gain, mute, solo, and EQ, played by one wrapper instance per track with the A320U soundfont (`src/lib/recorder/runtime.ts:74-88`, `src/lib/recorder/midi-track-playback.ts:36-44`). One tempo and one time signature per project (`src/lib/recorder/persistence.ts:73-77`).
- **Import.** `src/lib/midi-import.ts`, called from `src/components/recorder/recorder-midi-track.tsx:104-121`, merges every source track into the one track it is invoked on. It ignores the file's tempo and time signature, and drops channels, program changes, all controllers, and pitch bend.

## Capability comparison

"Engine" is oxisynth, "wrapper" is the vendored player, and "app" covers toy-midi's data model, playback, and import. The last column says whether our export writes it today.

| Capability                                   | fluidsynth    | Engine        | Wrapper                     | App                                                            | Our export                                   |
| -------------------------------------------- | ------------- | ------------- | --------------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| Many tracks or channels at once              | Yes           | Yes           | One channel per instance    | Yes, one instance per track, but import merges tracks into one | Yes                                          |
| Program per track                            | Yes           | Yes           | `set_preset`                | Static, bank 0 only, and import drops it                       | Yes                                          |
| Program or bank change mid-song              | Yes           | Yes           | No                          | No                                                             | No                                           |
| Drums on channel 10 (bank 128 kit)           | Yes           | Yes           | Any preset via `set_preset` | No. Bank 0 only, and lookup throws otherwise                   | Yes                                          |
| Velocity                                     | Yes           | Yes           | Yes                         | Yes                                                            | Yes                                          |
| Tempo map and time signature changes         | Yes           | n/a           | n/a                         | One tempo and meter, and import ignores even the first         | Yes, with one tempo in all six tracks so far |
| Volume (CC7) and expression (CC11) over time | Yes           | Yes           | No                          | Static track gain only                                         | No, `vol` goes into velocity                 |
| Pan (CC10)                                   | Yes           | Yes           | No                          | No                                                             | Yes, on melodic tracks                       |
| Sustain pedal (CC64)                         | Yes           | Yes           | No                          | No                                                             | No                                           |
| Pitch bend and bend range                    | Yes           | Yes           | No                          | No                                                             | No, needed for slides                        |
| Modulation (CC1), channel and key pressure   | Yes           | Yes           | No                          | No                                                             | No                                           |
| Reverb and chorus (CC91, CC93)               | Yes, built in | Modules exist | Not checked                 | No, EQ only                                                    | No                                           |
| SoundFont                                    | FluidR3_GM    | Any SF2       | Any SF2                     | A320U bundled                                                  | n/a                                          |

## Where the gaps sit

- **Wrapper.** A generic event call, such as passing any `MidiEvent` through, would make what the engine already implements reachable: controllers over time, pitch bend, sustain, and program changes. It is not needed for static pan and volume, which toy-midi can do in Web Audio because each track has its own synth, or for drums, which `set_preset` can select. Whether the wrapper enables reverb and chorus needs checking.
- **App data model and playback.** A per-track bank or drum flag, pan, a tempo map, and per-track events over time (controllers, pitch bend, program changes), not only notes.
- **Import.** One app track per source track with its name and program, channel 10 as drums, the tempo map and time signatures, and the controller and pitch bend events once the app can hold them.
- **Loading.** Projects load only by uploading a `.toymidi.zip`, with no load from a URL or a CLI. This matters later, so an agent can write a score and have it play without manual steps.

## Order for our use

1. Import tracks separately with their programs, play channel 10 as a drum kit by selecting a bank 128 preset, and apply the first tempo and time signature. This is enough to hear the six Scrimshaw tracks.
2. Let an agent put a score into the open toy-midi, so the loop of writing, listening, and revising needs no manual upload. Loading by URL or CLI is the narrowest form. The same need is open more broadly in [toy-midi #730](https://github.com/hi-ogawa/toy-midi/issues/730), projects as folders on disk that agents can edit, which lists external edits to `project.json` while a project is open as an open point, and [toy-compositor #157](https://github.com/hi-ogawa/toy-compositor/issues/157), editor operations exposed to an agent through WebMCP. The framing is to be revisited across the three.
3. Add per-track pan as a `StereoPannerNode` on each track's channel strip. toy-midi already runs one synth per track, so static pan and volume need no wrapper change.
4. Expose MIDI events in the wrapper, and add pitch bend, sustain, and controller events over time to the app, once our export writes slides as pitch bend, which it could today, or later feel and phrasing. These change during a note or over time, so they have to go through the synth rather than the mixer. A channel argument is not needed while each track has its own synth.
5. Add a tempo map, for tempo changes within a song. None of the six Scrimshaw tracks need it.

Fixing the importer is preferred over having our tool write toy-midi's project JSON directly, because the JSON route would still need the drum and wrapper work, and an importer fix helps with any General MIDI file. If projects become folders on disk as in #730, writing `project.json` directly becomes more attractive, so this preference may change.

The 6/8 jig shows up as 2/4 in toy-midi's grid, because our export writes a score beat as a quarter note, so compound meters become simple meters with triplet steps.
