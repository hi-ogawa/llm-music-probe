# Experiments

Each experiment is a write-up of one session or batch run, in the [format](#write-up-format) below, delivered in one of two ways.

The session itself is an ordinary music session. The composing agent gets the person's prompts and the tools it needs, but nothing about this repository, its hypotheses, or what the session is meant to show, because an agent that knows the hypothesis composes toward it. The write-up is a separate step afterwards, made from the session's prompts and scripts.

- **In this repository**: write the write-up as `experiments/<nn>-<slug>/README.md`, with the agent's raw output, such as scripts and the saved project, in the same directory.
- **As a gist**, an optional alternative, such as for a self-contained run: create a public gist with the write-up as `README.md` and the raw output as flat files next to it, and set the gist's description to the experiment's name, because gists have no title of their own.

Either way, add a comment to the [experiment index](https://github.com/hi-ogawa/llm-music-probe/issues/5) in this form, leaving out the listen line when the experiment has no share link:

```md
**<name>**: <write-up link>

- Date: 2026-10-12, model: claude-opus-5-5
- Prompt: the first prompt in a few words
- Listen: <share link>
- Observation: the one thing worth remembering from the notes
```

## Write-up format

```md
# <name>

- Date:
- Model: the exact model ID

## Setup

## <Main section>

## Notes

## References
```

- **Setup**: a free-form intro, so the write-up reads on its own. Say what was asked, how the agent worked, how the session went, and what came out, in a few sentences. Context on tools and setup goes here, not in the main section.
- **Main section**: named for the experiment, such as Session or Runs. The musical iteration in order: what was asked and what changed, in whatever form reads best.
- **Notes**: observations on how the agent represented the music and iterated on it. Cover the form it wrote music in, such as raw numbers, a vocabulary it made up, or a text format, which choices were rules run as code and which were notes chosen one by one, and how it took the listener's requests, such as a move it never made on its own or a request it misread. Leave out tooling friction, such as setup problems and bugs.
- **References**: links to the agent's raw output, kept next to the write-up, along with any outside resources.
