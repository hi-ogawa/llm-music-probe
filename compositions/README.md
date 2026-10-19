# Compositions

Composed pieces you can search, open, and loop in Toy MIDI.

- **Viewer:** Toy MIDI's [Examples page](https://toy-midi.hiro18181.workers.dev/examples), which loads `catalog.json` from `main`
- **Kept pieces:** [`catalog.json`](catalog.json)
- **Candidates:** pieces still being iterated on, listed on the [composition tracker](https://github.com/hi-ogawa/toy-midi/issues/862)

Each piece, kept or candidate, has a folder in [`pieces/`](pieces/) with its project files next to the write-up and scripts that produced them. A write-up that compares several sessions, such as `orchestral-genre-triggers/`, has its own folder next to their pieces. A later session that iterates on part of a piece, such as `cliche-guitar/`, also has its own folder, with each step's files prefixed by its step. A piece composed in an experiment has a folder holding its kept version and a README linking the experiment.

A project file is a Toy MIDI `SharedProject` and opens as an unsaved draft with `https://toy-midi.hiro18181.workers.dev/draft?src=<raw url>`. Its raw URL on `main` always serves the latest version, and replacing `main` with a commit SHA gives a link that keeps playing that version.

```
https://raw.githubusercontent.com/hi-ogawa/llm-music-probe/main/compositions/pieces/<folder>/<file>.json
```

A composing session writes its folder here from the start, and a session that continues a piece adds to that piece's folder.

Toy MIDI's Examples page reads `catalog.json` and opens the files it links, so when you move a file, update its `url` in the same commit, and keep the entry fields Toy MIDI reads unless Toy MIDI changes with them.

## Catalog format

`catalog.json` is an array, newest first, of:

```json
{
  "name": "Orquestra de Bolso",
  "description": "One line on the genre and what makes it distinctive",
  "date": "2026-10-14",
  "tags": ["orchestral", "bossa nova"],
  "url": "https://raw.githubusercontent.com/hi-ogawa/llm-music-probe/main/compositions/pieces/orquestra-de-bolso/project.json",
  "writeup": "https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/orquestra-de-bolso"
}
```

- `url` is the raw URL of the piece's project file on `main`.
- `writeup` links the folder with the write-up, usually the piece's own.

## Adding a piece

Add a piece when the listener says to keep it.

1. Make sure its folder has the project file. If the session only has a share link, decode the link into a file. Toy MIDI's `/llms.txt` documents the encoding.
2. Append an entry to `catalog.json`, keeping newest first.

## Optional steps

Add these to a composing prompt only when a piece calls for them.

- **Level check.** An agent that sets levels by role without hearing them can bury its own hook, as in [13](../experiments/13-loudness-mix-fix/README.md). Ask the session to measure per-track loudness from a render, for example with that experiment's [`loudness.mjs`](../experiments/13-loudness-mix-fix/loudness.mjs), and to check that the focus part sits on top. Toy MIDI's own loudness meter for agents is planned in [toy-midi#890](https://github.com/hi-ogawa/toy-midi/issues/890).
