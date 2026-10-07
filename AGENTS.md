# Agent Guide

## Layout

- `docs/` holds the running thesis and plan. Update `docs/context.md` when evidence changes the status of a claim, and keep the claim status table current.
- `experiments/<nn>-<slug>/` holds one experiment. Start from `experiments/TEMPLATE.md` as its `README.md`.

## Conventions

- File names: kebab-case
- Commit messages: use Conventional Commits (`docs:`, `feat:`, `chore:`)
- Record the exact model ID, prompt, and output format for every run, so results stay comparable across models and formats
- Keep raw model output verbatim in the experiment directory. Put judgments and interpretation in the README, separate from the raw output
- Mark each claim as measured, judged by ear, or inferred. Do not present an inference as a result
- Prefer material the model cannot have memorized, such as original or personally transcribed pieces, when the probe is about comprehension rather than recall
