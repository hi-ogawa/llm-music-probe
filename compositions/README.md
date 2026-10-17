# Compositions

Composed pieces you can search, open, and loop in Toy MIDI.

- **Viewer:** https://hi-ogawa.github.io/llm-music-probe/compositions/
- **Kept pieces:** [`catalog.json`](catalog.json)
- **Candidates:** pieces still being iterated on, listed on the [composition tracker](https://github.com/hi-ogawa/toy-midi/issues/862)

Every piece, kept or candidate, has one project file in [`pieces/`](pieces/). Each file is a Toy MIDI `SharedProject` and opens as an unsaved draft with `https://toy-midi.hiro18181.workers.dev/draft?src=<raw url>`. Its raw URL on `main` always serves the latest version, and replacing `main` with a commit SHA gives a link that keeps playing that version.

```
https://raw.githubusercontent.com/hi-ogawa/llm-music-probe/main/compositions/pieces/<file>.json
```

When a session iterates on a piece, commit the new version over its file, so git history holds the earlier ones. Scripts and notes from the session stay with its write-up.

Toy MIDI's Examples menu opens some of these files by name, so don't rename or delete a file in `pieces/` without updating Toy MIDI first.

## Catalog format

`catalog.json` is an array, newest first, of:

```json
{
  "name": "Orquestra de Bolso",
  "description": "One line on the genre and what makes it distinctive",
  "date": "2026-10-14",
  "tags": ["orchestral", "bossa nova"],
  "url": "https://raw.githubusercontent.com/hi-ogawa/llm-music-probe/main/compositions/pieces/orquestra-de-bolso.json",
  "writeup": "https://gist.github.com/<user>/<gist>"
}
```

- `url` is the raw URL of the piece's file on `main`.
- `writeup` links the write-up, an experiment README in this repository, or the session gist that has the plan and notes.

## Adding a piece

Add a piece when the listener says to keep it.

1. Make sure its file is in `pieces/`, named after the piece in kebab-case. If the session only has a share link, decode the link into the file. Toy MIDI's `/llms.txt` documents the encoding.
2. Append an entry to `catalog.json`, keeping newest first.
