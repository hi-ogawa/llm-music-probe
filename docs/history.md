# History

How the thesis got here, kept as written at the time. Add to it, and do not rewrite it. The current state is in [context.md](context.md).

## How the discussion got here (2026-10-06)

1. **Starting question.** How deep is LLM music intuition beyond easily symbolized chord progressions, for example voicing, orchestration, tension, and reharmonization, and how would we probe it? This was later clarified as a question about whether such intuition is encodable for an LLM to present, not about measuring a current model's depth.
2. **Feedback loop.** The assistant first argued that visual demos work because vision closes the loop, and music lacks an equivalent ear. Prior work surveyed: symbolic critics (ComposerX, Libretto), render plus analysis (vcv-agent), DAW control over MCP (ableton-mcp, reaper-mcp, DAWZY), and audio LLMs as the ear. The MUSE benchmark found audio LLMs good at surface perception (oddball detection, rhythm) and weak at relational harmony (Gemini Pro 66.67% on chord sequence matching against 85% for expert musicians).
3. **Correction: the loop is not the creativity.** Vision feedback catches coarse errors like overlap and clipping, and precision comes from the code. The creative content is already in the first draft and comes from training. Multimodal training matters because it grounds words like "airy" or "too busy" in perception, not because it adds a checker.
4. **Where musical vocabulary would come from.** Speech and environmental sound have huge labeled corpora, but music mostly gets captions like "♪ upbeat music ♪". Narrated music (bass lessons, theory videos) exists only as a niche.
5. **State of the art.** Suno, Udio, and Lyria are end-to-end audio models with thin control (style prompt, lyrics, section tags). Google published the Live Music Models report (Magenta RealTime). Suno has published essentially nothing about its song models. This branch turned out to be off-topic for the thesis.
6. **The assistant's main counterargument.** Coding agents work because GitHub holds the project format at scale, and music has no equivalent, so note-level vocabulary ("the notes are the idea") would be locked in audio. After pushback, this was weakened: visual and code ability also relies on targeted synthetic data and RL, and synthetic MIDI-to-audio data is cheap. The remaining limit was restated as "no checker for taste".
7. **Functional vs artistic.** The assistant argued the visual examples were functional (explanatory), while music is mostly aesthetic, and predicted that artistic music would stay end-to-end, the way diffusion did for artistic images.

## New evidence: Scrimshaw Jukebox (2026-10-06)

Simon Willison, [Scrimshaw Jukebox](https://simonwillison.net/2026/Oct/6/scrimshaw-jukebox/) ([tool](https://tools.simonwillison.net/scrimshaw-jukebox), [conversation](https://claude.ai/share/1f721c20-2499-4d23-b368-3ab57146d956)).

- Claude Opus 5.5 composed six adventure-game tracks inspired by The Secret of Monkey Island.
- The output is a plain-text music format played by an in-browser synth. There is no audio model and, as far as the post says, no listening step.
- The tracks vary tempo (66 to 152 bpm) and meter (3/4, 4/4, 6/8), use 8 to 16 voices, and make fitting arrangement choices such as steel drums and calypso for a harbor scene.
- The author called it "surprisingly good" and asked whether it is a newly emerged capability, like the recent 3D graphics one.

Caveats:

- One example in one genre. Retro game music is the friendliest case for symbolic composition, because it was originally written as notes for synth chips and many symbolic transcriptions exist.
- "Surprisingly good" speaks to competence, not to the depth of voicing, tension, or reharm choices.

Follow-up: the scores, the format, and the shared conversation are broken down in [experiments/01-scrimshaw-breakdown](../experiments/01-scrimshaw-breakdown/README.md). The tracks were judged legitimate by ear. The conversation shows a single prompt with no musical direction, a format the model designed itself, and a loop that only checked execution (levels, clipping, semitone clashes) because the model could not listen.

## Sources from the discussion

Links were not carried over from the chat, so these are names to look up.

- ComposerX, Libretto, vcv-agent, ableton-mcp, reaper-mcp, DAWZY
- MUSE benchmark (audio LLM music perception against human listeners)
- Live Music Models report by the Lyria Team at Google DeepMind, with weights at magenta/magenta-realtime
- Bark by Suno
