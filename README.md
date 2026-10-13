# llm-music-probe

How does a person steer an LLM to compose good music in a symbolic medium, such as a text score or a MIDI-like project format?

Working hypothesis: textbook technique, which is what an LLM is best at, gets much further than it seems, as long as the prompts ask for enough of it. So far the model knows the vocabulary as rules it can name and carry out, but defaults to the cheapest reading of a prompt. What comes out depends on which compositional elements the prompts name, such as sections, energy per section, roles, and variation on repeats. Melody stays weak. The details are in [docs/README.md](docs/README.md).

- [docs/README.md](docs/README.md): the current reading, with the experiments behind it
- [experiments/](experiments/README.md): one write-up per session, with the pieces worth keeping in the [Toy MIDI catalog](https://gisthost.github.io/?a59cf62ada7ef9f1f327bdc8672d0db6/index.html)
- [packages/score-tool/](packages/score-tool/): the score-to-sound tool used by experiments 02 to 06, with its format reference
