# llm-music-probe

Notes and experiments on how a person steers an LLM to compose good music in a symbolic medium, such as a text score or a MIDI-like project format.

The model already knows the musical vocabulary, mostly as rules it can name and carry out. What it does by default is the cheapest reading of the brief, so what comes out depends on which compositional elements the brief and the listener's notes name. Melody is the layer that stays weak. The current reading and the evidence behind each claim are in [docs/context.md](docs/context.md).

Research:

- [docs/context.md](docs/context.md): the current question and reading
- [experiments/](experiments/README.md): one directory or gist per experiment, written up in the format its README describes and listed on the [experiment index](https://github.com/hi-ogawa/llm-music-probe/issues/5)
- [docs/directions.md](docs/directions.md): open research directions and the probe ideas that serve them
- [docs/notation.md](docs/notation.md): what makes musical intent encodable, and presentable by an LLM through a medium
- [docs/history.md](docs/history.md): how the question got here, kept as written at the time

Background and tooling:

- [docs/industry-landscape.md](docs/industry-landscape.md): how the music industry uses AI as of October 2026, with sources
- [docs/score-format.md](docs/score-format.md): reference for the score format, written to hand to a model
- [docs/tool-plan.md](docs/tool-plan.md): plan for our own score-to-sound tool
- [docs/toy-midi-playback.md](docs/toy-midi-playback.md): what toy-midi needs to play our MIDI output
- [packages/score-tool/](packages/score-tool/): the score-to-sound tool used by the early experiments. It reads a text score into note events and writes General MIDI, rendered to audio with fluidsynth
