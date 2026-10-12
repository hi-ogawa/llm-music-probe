# score-tool

The score-to-sound tool used by experiments 02 to 06. It reads a plain-text score in a Scrimshaw-compatible format, checks it, and renders it as note events, General MIDI, or audio. The format is described in [docs/score-format.md](../../docs/score-format.md), and the plan behind the tool in [docs/tool-plan.md](../../docs/tool-plan.md).

## Usage

Run from this directory.

```sh
pnpm cli check <score...>
pnpm cli render <score> <output> [--loops <n>] [--phrase <voices>] [--solo <voices>] [--gain <g>] [--soundfont <file>]
```

- `check` prints each problem as `file:line: message` and exits non-zero if there are any.
- `render` picks the format from the output's extension: `.json` for note events, `.mid` for MIDI, and `.wav` for audio.
- `--loops` sets how many times the loop section plays, 1 by default.
- `--phrase` plays the listed voices, comma-separated, through the phrasing pass, which shapes velocity, length and expression without changing any note.
- `--solo` keeps only the listed voices, comma-separated.
- `--gain` and `--soundfont` set fluidsynth's output gain and soundfont for `.wav`.

Rendering `.wav` needs `fluidsynth` on the path and, by default, the FluidR3 General MIDI soundfont at `/usr/share/soundfonts/FluidR3_GM.sf2`.

## Layout

- `src/score/` parses a score and expands it into note events: bars, chords, pitches and instruments.
- `src/midi/` writes the events as General MIDI, applies the phrasing pass, and renders audio with fluidsynth.
- `src/cli.ts` is the command line above.

## Development

```sh
pnpm test
pnpm typecheck
```

Some tests read the Scrimshaw scores in [experiments/01-scrimshaw-breakdown/source](../../experiments/01-scrimshaw-breakdown/source) as fixtures.
