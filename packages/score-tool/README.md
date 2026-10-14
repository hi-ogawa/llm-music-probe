# score-tool

The score-to-sound tool used by experiments 02 to 06. It reads a plain-text score in a Scrimshaw-compatible format, checks it, and renders it as note events, General MIDI, or audio. It also renders toy-midi projects to audio, so a composing session's result can be heard outside the app. The format is described in [score-format.md](score-format.md), the plan behind the tool in [tool-plan.md](tool-plan.md), and what toy-midi needs to play its MIDI output in [toy-midi-playback.md](toy-midi-playback.md).

## Usage

Run from this directory.

```sh
pnpm cli check <score...>
pnpm cli render <score> <output> [--loops <n>] [--phrase <voices>] [--solo <voices>] [--gain <g>] [--soundfont <file>] [--normalize]
pnpm cli render <project> <output> [--gain <g>] [--soundfont <file>] [--normalize]
```

- `check` prints each problem as `file:line: message` and exits non-zero if there are any.
- `render` picks the format from the output's extension: `.json` for note events, `.mid` for MIDI, `.wav` or `.mp3` for audio, and `.link` for a toy-midi share link.
- A project input is a toy-midi `SharedProject`: a `.json` file, a share link with `#p=`, a `/draft?src=` link, or the raw URL of a `.json` file. It renders to `.wav` or `.mp3` the way toy-midi mixes it: each track through fluidsynth on its own, then the track's gain and pan, without muted tracks, and only soloed tracks when there are any.
- `--loops` sets how many times the loop section plays, 1 by default.
- `--phrase` plays the listed voices, comma-separated, through the phrasing pass, which shapes velocity, length and expression without changing any note.
- `--solo` keeps only the listed voices, comma-separated.
- `--gain` and `--soundfont` set fluidsynth's output gain and soundfont for audio.
- `--normalize` brings audio to −16 LUFS for listening, with ffmpeg's single-pass `loudnorm`, so the result lands within about 1 LU of the target.

Rendering audio needs `fluidsynth` on the path, and `.mp3`, `--normalize`, and projects also need `ffmpeg`. A score uses the FluidR3 General MIDI soundfont at `/usr/share/soundfonts/FluidR3_GM.sf2` by default. A project uses [GeneralUser GS](https://github.com/mrbumpy409/GeneralUser-GS), the soundfont toy-midi plays with, at `~/.local/share/soundfonts/GeneralUser-GS.sf2`. fluidsynth's default reverb and chorus stay on, as toy-midi's synth has its own on.

## Layout

- `src/score/` parses a score and expands it into note events: bars, chords, pitches and instruments.
- `src/midi/` writes the events as General MIDI, applies the phrasing pass, and renders and mixes audio with fluidsynth and ffmpeg.
- `src/project/` reads a toy-midi project and writes each of its tracks as MIDI for rendering.
- `src/cli.ts` is the command line above.

## Development

```sh
pnpm test
pnpm typecheck
```

Some tests read the Scrimshaw scores in [experiments/01-scrimshaw-breakdown/source](../../experiments/01-scrimshaw-breakdown/source) as fixtures.
