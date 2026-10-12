# Agent Guide

## Quick Reference

| Command                                          | When                                      |
| ------------------------------------------------ | ----------------------------------------- |
| `pnpm lint`                                      | Format, Lint, Typecheck after any changes |
| `pnpm test`                                      | Unit tests (src/, vitest)                 |
| `pnpm cli check <score...>`                      | Report problems in scores                 |
| `pnpm cli render <score> <out.wav\|.mid\|.json>` | Render a score to audio, MIDI, or events  |

## Layout

- `docs/` holds the running thesis and plan. `docs/context.md` is the current state: rewrite it when evidence changes a claim, and keep the claim status table to one line of links per claim. `docs/history.md` records how the thesis got here: add to it, and do not rewrite it.
- `src/` holds the score-to-sound tool: `score/` reads a text score into note events, and `midi/` writes them as General MIDI and renders audio with fluidsynth.
- `experiments/<nn>-<slug>/` holds one experiment. Start from `experiments/TEMPLATE.md` as its `README.md`.

## Conventions

- For code, follow the conventions of [toy-compositor](https://github.com/hi-ogawa/toy-compositor) (checked out at `../toy-compositor`) and [toy-midi](https://github.com/hi-ogawa/toy-midi) (at `../toy-midi`)
- File names: kebab-case
- Commit messages: use Conventional Commits (`docs:`, `feat:`, `chore:`)
- Commit after each meaningful change, without waiting to be asked
- Record the exact model ID, prompt, and output format for every run, so results stay comparable across models and formats
- Keep raw model output verbatim in the experiment directory. Put judgments and interpretation in the README, separate from the raw output
- Record the musical iteration, the listener's requests and the musical changes that answered them, not tooling details. Keep observations in Notes, separate from the record of the session
