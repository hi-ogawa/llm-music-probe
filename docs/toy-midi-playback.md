# Playing scores in toy-midi

What toy-midi (`../toy-midi`) needs in order to play back the MIDI files our tool writes. This comes from reading toy-midi's code on 2026-10-08. Nothing here has been tried in the browser yet.

## What our MIDI files contain

`src/midi/export.ts` writes a Standard MIDI File with:

- One track per voice, named after the voice
- A General MIDI program per melodic track, and drums on channel 10 as separate tracks, one per drum voice
- A tempo map and time signatures. A score beat is written as one quarter note, so 6/8 written as `beats 2 steps 3` becomes 2/4 with triplet steps.
- Pan as CC10 on melodic tracks, and velocity from dynamics and `vol`

## What toy-midi does today

- **Tracks and sound.** A project can hold any number of MIDI tracks. Each has its own General MIDI program, gain, mute, solo, and EQ, and its own oxisynth instance in an AudioWorklet, playing the A320U soundfont (`src/lib/recorder/runtime.ts:74-88`, `src/lib/recorder/midi-track-playback.ts:36-44`). Velocity is honoured.
- **Instrument lookup.** Only bank 0 presets are accepted, and anything else throws (`src/lib/recorder/midi-track-playback.ts:201-218`). The soundfont does contain drum kits such as "Standard", presumably in bank 128.
- **Import.** The `.mid` importer (`src/lib/midi-import.ts`, called from `src/components/recorder/recorder-midi-track.tsx:104-121`) merges every source track into the one track it is invoked on, which keeps its own program. It ignores the file's tempo and time signature, and drops channels, program changes, all CC, pitch bend, and tempo changes. Note positions are imported exactly in beats.
- **Timing.** A project has one tempo and one time signature, with no tempo map (`src/lib/recorder/persistence.ts:73-77`).
- **Synth API.** The worklet takes note on and off, preset, and gain only, with no channel, CC, or pitch bend (`src/assets/oxisynth/worklet.js:518-581`).
- **Loading.** Projects load only by uploading a `.toymidi.zip` in the project list, and persist in IndexedDB. There is no load from a URL or a CLI.

## Gaps, in priority order

1. **Multi-track import.** Create one app track per source track, using the track name and the initial program, which `@tonejs/midi` already exposes as `instrument.number`.
2. **Drums.** Detect channel 10, add a drum flag or bank field to the MIDI track state, and allow a bank 128 kit in instrument lookup. That the "Standard" kit then plays correctly is an inference from the soundfont's preset list.
3. **Tempo and meter on import.** Apply at least the file's first tempo and time signature. A full tempo map can wait, because none of the six Scrimshaw tracks change tempo.
4. **Pan, sustain, pitch bend.** Unsupported in both the data model and the synth. Not needed yet, because our renderer ignores slides and pan is minor.
5. **Loading by URL or CLI.** Needed later, so an agent can write a score and have it play without manual steps. Not needed for first playback.

Items 1 to 3 are enough to hear the six tracks. Fixing the importer is preferred over having our tool write toy-midi's project JSON directly: the JSON route would only skip items 1 and 3, still needs item 2, and an importer fix helps with any General MIDI file.

One mismatch to expect: the 6/8 jig shows up as 2/4 in toy-midi's grid, because of how our export writes compound meters.
