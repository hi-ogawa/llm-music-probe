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

A composing session composes the piece itself, so the listener can follow and steer it, and it writes its folder here from the start. A session that continues a piece adds to that piece's folder. An experiment that needs to control what the composer sees runs it in a fresh subagent instead, and says so in its write-up.

A composing session composes blind. It works from the brief and Toy MIDI's agent docs, and it doesn't open other pieces' folders, project files, scripts, or write-ups, because the piece should show what the brief and the docs produce rather than what earlier sessions did. A new piece's folder holds its project file, the script that writes it, and a README write-up covering the brief, the setup, the composition, and the Toy MIDI doc gaps described below.

A composing session works from Toy MIDI's agent docs, [`/llms.txt`](https://toy-midi.hiro18181.workers.dev/llms.txt) and the type declarations it links, rather than from Toy MIDI's source or the SoundFont's internals, because those docs are the interface Toy MIDI offers agents. When the docs leave a question open, such as how a controller sounds on a preset, the session makes a reasonable choice, lists the question under "Toy MIDI doc gaps" in its write-up, and mentions it when reporting the piece, so the docs can be fixed in Toy MIDI.

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

None of these is part of a default composing prompt. The person steering adds one when they choose to.

- **Level check.** An agent that sets levels by role without hearing them can bury its own hook, as in [13](../experiments/13-loudness-mix-fix/README.md), where the check came after a listen found the bass too loud and the lead buried. When a listen finds a part too loud or buried, ask the session to measure per-track loudness from a render, for example with that experiment's [`loudness.mjs`](../experiments/13-loudness-mix-fix/loudness.mjs), and to check that the focus part sits on top. Toy MIDI's own loudness meter for agents is planned in [toy-midi#890](https://github.com/hi-ogawa/toy-midi/issues/890).
