# llm-music-probe

How does a person steer an LLM to compose good music in a symbolic medium, such as a text score or a MIDI-like project format?

Tentative answer so far: the model already knows the vocabulary, mostly as rules it can name and carry out, but defaults to the cheapest reading of the brief. What comes out depends on which compositional elements the brief and the listener's notes name, such as sections, energy per section, roles, and variation on repeats. Melody stays weak. The details are in [docs/reading.md](docs/reading.md).

- [docs/reading.md](docs/reading.md): the current reading, with the experiments behind it
- [docs/next.md](docs/next.md): sessions to run next
- [experiments/](experiments/README.md): one write-up per session, listed on the [experiment index](https://github.com/hi-ogawa/llm-music-probe/issues/5)
- [docs/history.md](docs/history.md): how the question got here, with the earlier question's conclusions and directions
- [docs/archive/](docs/archive/): background notes from the earlier question, on notation and on how the music industry uses AI
- [packages/score-tool/](packages/score-tool/): the score-to-sound tool used by experiments 02 to 06, with its format reference
