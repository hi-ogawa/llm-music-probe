# Context

Last updated: 2026-10-12

The current thesis, reading, and claim status. Keep this file current, and rewrite it when evidence changes a claim. How the thesis got here is in [history.md](history.md).

## Thesis

The interest is in LLM robustness, generality, and creativity as a property of linguistic expressiveness, not in music generation technology as such.

Creative work starts as discrete, symbolic ideas: which sections, which instruments, which chords, which notes, which rhythm pattern, which knob to turn. If the model has those ideas in its vocabulary, then turning them into sound is a harness and tooling problem, not an intrinsic model capability. Closing a perceptual feedback loop is a finishing touch, and it is a separate question from whether the model is creative.

The motivating analogy is code-based visual generation. Geometric and motion intuition shows up through code in motion graphics, explanatory material, and 2D/3D demos, without diffusion-style image generation. The question was whether musical intuition is encoded in the same way.

The question that matters is whether an encodable medium exists: a form an LLM can write that carries high-level musical intuition such as voicing, orchestration, tension, and reharmonization. It is not how deep a particular model goes today. Once such a medium exists, depth and breadth become a matter of training, which future models can be expected to improve, as they have in other domains.

## Conclusion so far (2026-10-07)

1. **An encodable medium for musical intuition exists.** Scrimshaw Jukebox shows it at a primitive level: a plain-text score format carried harmony, bass, rhythm, orchestration, and form idioms that were judged legitimate by ear.
2. **End-to-end audio is not needed for an AI to present musical ideas.** A text model with no audio input or output produced the music, and audio was only rendering. This was the main point the discussion set out to settle.
3. **The agent workflow from coding and visuals carries over.** Discuss the composition at a high level, let the agent drill down to notes, rhythms, and chords, then adjust together, the way agents already work on code, visualizations, and video. Scrimshaw shows the first half: scene-level briefs such as "the villain's ship" became keys, progressions, bass lines, and instrument choices, with the high-level idea kept in comments. The adjustment loop is not shown, because Simon gave no musical feedback, so that half rests on the analogy for now.
4. **Working assumption: depth and breadth will follow from training.** This is plausible given how other domains have gone, but not demonstrated. The one caveat from the discussion is that taste has no automatic checker, so improvement would rely on preference data, as it has for prose and design.

What remains open is collected in [directions.md](directions.md). Depth, meaning which layers of musical intuition have an encodable medium, is one direction among several.

## Working reading: a rulebook and a trigger (2026-10-11)

Drawn from [07](../experiments/07-live-toy-midi-tab/README.md), [08](../experiments/08-dilla-role-fan-out/README.md), and [09](../experiments/09-top-layer-dialogue/README.md), and inferred, not measured.

Much of what came out convincing is a known rule carried out, not note patterns recalled from listening or playing. 08's Dilla feel is a timing rule, a mean drag plus random scatter, which simulates a groove no one played. 07's bass tab is a recalled box shape run as code. 09's stacked harmony was written note by note with no script, but it follows a rule too: a diatonic third below, a fourth where a third would clash, and none on bends and teases. So an agent can carry out a rule in code or in its head, and writing by hand does not by itself show more than a rule.

That gets far, because much practical musicianship is rule-shaped: groove templates, voicing and voice leading, doubling in thirds and sixths, idiomatic fingerings, call and answer, leaving space. The model recalls these rules from training, which is memory at the level of rules, and carries them out reliably. For the thesis this counts in favor. A rule the model can state and apply is intent that the medium carries, whatever its source.

Two things the rulebook has not supplied so far:

1. **Melody.** It is the least rule-shaped layer, and it keeps falling short: in the range sweep, in 08, and in 09's rewrite. Rules can make a line fit its chords, but not make it memorable.
2. **When to apply a rule.** In 09 the producers knew stacking and vibes voicings, but did not reach for them in four autonomous turns. The listener's "this sounds thin" was the trigger. 07's box shape waited for a bassist's question the same way.

Predictions this makes: a routine arranging checklist in the prompt should recover most arrangement moves without a listener, melody should stay weak even with it, and a melody judged good by ear would be the first evidence of something beyond a rule.

## Claim status

Each claim's evidence is in the experiments it links to.

| Claim                                                                          | Status                       | Basis                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| An encodable text medium for musical intuition exists                          | Supported                    | [01](../experiments/01-scrimshaw-breakdown/README.md)                                                                                                                                                   |
| End-to-end audio is not needed for an AI to present musical ideas              | Supported                    | [01](../experiments/01-scrimshaw-breakdown/README.md): a text model with no audio in or out                                                                                                             |
| Harmony, form, and instrumentation ideas are encoded in the text vocabulary    | Supported                    | [01](../experiments/01-scrimshaw-breakdown/README.md), and 43 cells of [04](../experiments/04-range-sweep/README.md) by ear                                                                             |
| Melodic intent is as convincing as rhythmic and harmonic intent                | Not supported                | [04](../experiments/04-range-sweep/README.md) and [08](../experiments/08-dilla-role-fan-out/README.md) by ear. Notes or missing phrasing not yet separated                                              |
| The awkward lines need only interpretation, not different notes                | Open                         | [05](../experiments/05-phrasing-pass/README.md) renders the lines through a phrasing pass, not yet listened to. Test: a performer plays the lines from the score                                        |
| Music needs a perceptual feedback loop more than visuals do                    | Refuted for presenting ideas | [01](../experiments/01-scrimshaw-breakdown/README.md): only an execution check, no listening                                                                                                            |
| Note-level vocabulary is locked in audio ("no GitHub for music")               | Refuted at this level        | Named idioms are written down in theory teaching and notation                                                                                                                                           |
| Artistic music will stay end-to-end                                            | Refuted for presenting ideas | [01](../experiments/01-scrimshaw-breakdown/README.md), [04](../experiments/04-range-sweep/README.md). Timbre and vocals are a separate question                                                         |
| Depth and breadth will follow from training                                    | Working assumption           | Track record in other domains, with the taste-signal caveat                                                                                                                                             |
| Voicing, groove, and timbre each have an encodable medium                      | Open                         | [directions.md](directions.md)                                                                                                                                                                          |
| The intuition holds beyond genres with a strong symbolic tradition             | Supported, except melody     | [04](../experiments/04-range-sweep/README.md) by ear. [10](../experiments/10-cold-start-hip-hop/README.md) adds hip-hop, not judged by ear                                                              |
| An agent can extend expression a human programmed into one part across a piece | Open                         | Expectation from [04](../experiments/04-range-sweep/README.md)                                                                                                                                          |
| A named fingering rule for bass tab is known, but not applied by default       | Supported in one run         | [07](../experiments/07-live-toy-midi-tab/README.md)                                                                                                                                                     |
| Fingering intuition is encoded in tab as text, beyond named rules              | Open                         | [07](../experiments/07-live-toy-midi-tab/README.md) tested only a recalled rule. Test in [directions.md](directions.md)                                                                                 |
| Exact syntax matters little, and room in the medium decides what gets out      | Supported in two runs        | [07](../experiments/07-live-toy-midi-tab/README.md), [09](../experiments/09-top-layer-dialogue/README.md). Consistent in [10](../experiments/10-cold-start-hip-hop/README.md)                           |
| Standard arrangement moves are known, but not reached for without a prompt     | Supported in one run         | [09](../experiments/09-top-layer-dialogue/README.md). Consistent in [10](../experiments/10-cold-start-hip-hop/README.md), whose prompts mostly named the move. Next test: a routine arranging checklist |
