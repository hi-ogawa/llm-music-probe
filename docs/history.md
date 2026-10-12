# History

How the thesis got here, kept as written at the time. Add to it, and do not rewrite it. The current state is in [the reading](README.md).

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

## Encodability conclusions, retired (2026-10-12)

On 2026-10-12 the current question in [the reading](README.md) moved from whether musical intuition is encodable to how a person steers an LLM toward good music. The thesis, conclusions, and claim table below are kept as they stood just before that change.

### Thesis

The interest is in LLM robustness, generality, and creativity as a property of linguistic expressiveness, not in music generation technology as such.

Creative work starts as discrete, symbolic ideas: which sections, which instruments, which chords, which notes, which rhythm pattern, which knob to turn. If the model has those ideas in its vocabulary, then turning them into sound is a harness and tooling problem, not an intrinsic model capability. Closing a perceptual feedback loop is a finishing touch, and it is a separate question from whether the model is creative.

The motivating analogy is code-based visual generation. Geometric and motion intuition shows up through code in motion graphics, explanatory material, and 2D/3D demos, without diffusion-style image generation. The question was whether musical intuition is encoded in the same way.

The question that matters is whether an encodable medium exists: a form an LLM can write that carries high-level musical intuition such as voicing, orchestration, tension, and reharmonization. It is not how deep a particular model goes today. Once such a medium exists, depth and breadth become a matter of training, which future models can be expected to improve, as they have in other domains.

### Conclusion so far (2026-10-07)

1. **An encodable medium for musical intuition exists.** Scrimshaw Jukebox shows it at a primitive level: a plain-text score format carried harmony, bass, rhythm, orchestration, and form idioms that were judged legitimate by ear.
2. **End-to-end audio is not needed for an AI to present musical ideas.** A text model with no audio input or output produced the music, and audio was only rendering. This was the main point the discussion set out to settle.
3. **The agent workflow from coding and visuals carries over.** Discuss the composition at a high level, let the agent drill down to notes, rhythms, and chords, then adjust together, the way agents already work on code, visualizations, and video. Scrimshaw shows the first half: scene-level briefs such as "the villain's ship" became keys, progressions, bass lines, and instrument choices, with the high-level idea kept in comments. The adjustment loop is not shown, because Simon gave no musical feedback, so that half rests on the analogy for now.
4. **Working assumption: depth and breadth will follow from training.** This is plausible given how other domains have gone, but not demonstrated. The one caveat from the discussion is that taste has no automatic checker, so improvement would rely on preference data, as it has for prose and design.

What remains open is collected in [the retired directions](history.md#directions-retired-2026-10-12). Depth, meaning which layers of musical intuition have an encodable medium, is one direction among several.

### Claim status

Each claim's evidence is in the experiments it links to.

| Claim                                                                                               | Status                       | Basis                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| An encodable text medium for musical intuition exists                                               | Supported                    | [01](../experiments/01-scrimshaw-breakdown/README.md)                                                                                                                                                                                |
| End-to-end audio is not needed for an AI to present musical ideas                                   | Supported                    | [01](../experiments/01-scrimshaw-breakdown/README.md): a text model with no audio in or out                                                                                                                                          |
| Harmony, form, and instrumentation ideas are encoded in the text vocabulary                         | Supported                    | [01](../experiments/01-scrimshaw-breakdown/README.md), and 43 cells of [04](../experiments/04-range-sweep/README.md) by ear                                                                                                          |
| Melodic intent is as convincing as rhythmic and harmonic intent                                     | Not supported                | [04](../experiments/04-range-sweep/README.md) and [08](../experiments/08-dilla-role-fan-out/README.md) by ear. Notes or missing phrasing not yet separated                                                                           |
| The awkward lines need only interpretation, not different notes                                     | Open                         | [05](../experiments/05-phrasing-pass/README.md) renders the lines through a phrasing pass, not yet listened to. Test: a performer plays the lines from the score                                                                     |
| Music needs a perceptual feedback loop more than visuals do                                         | Refuted for presenting ideas | [01](../experiments/01-scrimshaw-breakdown/README.md): only an execution check, no listening                                                                                                                                         |
| Note-level vocabulary is locked in audio ("no GitHub for music")                                    | Refuted at this level        | Named idioms are written down in theory teaching and notation                                                                                                                                                                        |
| Artistic music will stay end-to-end                                                                 | Refuted for presenting ideas | [01](../experiments/01-scrimshaw-breakdown/README.md), [04](../experiments/04-range-sweep/README.md). Timbre and vocals are a separate question                                                                                      |
| Depth and breadth will follow from training                                                         | Working assumption           | Track record in other domains, with the taste-signal caveat                                                                                                                                                                          |
| Voicing, groove, and timbre each have an encodable medium                                           | Open                         | [the retired directions](history.md#directions-retired-2026-10-12)                                                                                                                                                                   |
| The intuition holds beyond genres with a strong symbolic tradition                                  | Supported, except melody     | [04](../experiments/04-range-sweep/README.md) by ear. [10](../experiments/10-cold-start-hip-hop/README.md) adds hip-hop, not judged by ear. Medium fit not separated                                                                 |
| An agent can extend expression a human programmed into one part across a piece                      | Open                         | Expectation from [04](../experiments/04-range-sweep/README.md)                                                                                                                                                                       |
| A named fingering rule for bass tab is known, but not applied by default                            | Supported in one run         | [07](../experiments/07-live-toy-midi-tab/README.md)                                                                                                                                                                                  |
| Fingering intuition is encoded in tab as text, beyond named rules                                   | Open                         | [07](../experiments/07-live-toy-midi-tab/README.md) tested only a recalled rule. Test in [the retired directions](history.md#directions-retired-2026-10-12)                                                                          |
| Exact syntax matters little, and room in the medium decides what gets out                           | Supported in two runs        | [07](../experiments/07-live-toy-midi-tab/README.md), [09](../experiments/09-top-layer-dialogue/README.md). Consistent in [10](../experiments/10-cold-start-hip-hop/README.md)                                                        |
| Standard arrangement moves are known, but not reached for without a prompt                          | Supported in one run         | [09](../experiments/09-top-layer-dialogue/README.md). Consistent in [10](../experiments/10-cold-start-hip-hop/README.md), whose prompts mostly named the move. Next test: a routine arranging checklist, or element-level directions |
| Naming a compositional element above mechanics unlocks that level's standard techniques             | Supported in one run         | [12](../experiments/12-classical-overture-loop/README.md)                                                                                                                                                                            |
| Texture, tutti, keyboard, and electronic genres fit a General MIDI render better than exposed lines | Working assumption           | MIDI mock-up practice, and the range sweep hypothesis in [notation.md](archive/notation.md#performance-techniques-from-daw-practice)                                                                                                 |

## Directions, retired (2026-10-12)

The directions list as it stood when the question moved to steering. Sessions to run next are in [next.md](next.md).

Open directions for the research, each with probe ideas that serve it. Nothing here is a fixed plan or order. Format design lives in [notation.md](archive/notation.md), and our score-to-sound tool in [tool-plan.md](../packages/score-tool/tool-plan.md).

Most of these directions were written for the earlier question of whether musical intuition is encodable. For the current question in [the reading](README.md), how to steer an LLM toward good music, the ones that bear on it directly are [Beat making](#beat-making), [Fan-out](#fan-out) as sketching and picking, and [The adjustment loop](#the-adjustment-loop). The rest are parked: Depth, Genre breadth, Fast decision models, Generality across media, Inventing the medium, Robustness across notations, and Creativity beyond idioms.

Judge results by ear, with renders named by condition so the listener knows what each one is. Blind listening adds a key, shuffled names, and a reveal step, so use it only when a judgment would otherwise lean on knowing the condition and the conditions cannot be told apart by ear. Measure from the scores whatever can be measured, so listening is left for what only the ear can judge. Bass lines and grooves are the strongest targets, because that is where the judge's ear is most reliable.

### Depth

How far musical intuition goes beyond named idioms, and whether each layer has a medium that can carry it. Depth is expected to improve with training, so it is one vector among several, not the goal. Scrimshaw's six tracks hid several layers: chord names were voiced by the renderer, the chord vocabulary stopped at 7ths and 9ths, and groove was one global swing value plus three dynamic levels.

Probe ideas:

- **Comping a jazz standard.** Ask how the model would comp a standard with explicit voicings, then play it back. Even reproducing a known transcription shows fluency, the way humans learn by transcribing. Then ask for variants: Red Garland block chords, Bill Evans rootless voicings, Freddie Green four-to-the-bar, bossa, sparse against busy, reharmonized turnarounds.
- **Voicing.** The same progression in contrasting characters, such as dark and close against open and airy. The signal is whether spacing, register, low-interval limits, and voice leading change to match the stated intent.
- **Tension and reharmonization.** A melody and a plain progression, with extended chords available. Check validity mechanically, then judge whether tensions are placed with intent or just added.
- **Groove.** The same bass line straight, laid back, and pushing, or with ghost notes, using per-note timing offsets and velocities. This is the layer least written down as text, so it is the most likely place where no medium exists in the model's vocabulary.
- **Instrument idiom.** Bass tab: do the model's string and fret choices make sense for playability and hand position? It was planned through the toy-midi JSON format (`../toy-midi`), and first ran through toy-midi's agent interface instead in [07-live-toy-midi-tab](../experiments/07-live-toy-midi-tab/README.md), where the model knew the root, fifth, octave box shape as a named rule but did not apply it until asked. Every pass there was a solver, either a generic search or the recalled rule run as code, so it says nothing about intuition absorbed from reading tab. Next: give the model a new melodic bass line with real fingering choices and ask for ASCII tab written directly, with no script, then convert it to toy-midi's per-note strings mechanically. A rule-based version of the same line is the comparison, and the judgment is by a bassist. Tab found online is often amateur, so tab-like output may also carry its habits.
- **Timbre and orchestration.** The same passage orchestrated for different scenes, with synth parameters available. The signal is whether parameters follow the intent rather than staying at defaults.

### Genre breadth

Scrimshaw's six tracks are in the friendliest genres for a symbolic medium: retro game music, folk jig, and waltz. They were written as notes in the first place, and many symbolic transcriptions exist. Does the intuition hold in genres whose vocabulary lives mostly in recordings rather than in written notation? Simon's follow-up dance track, Starlight Armada, is one data point outside game music, but it is formulaic and has not been judged by ear. Symbolic tradition is a different axis from [medium fit](README.md#what-the-medium-limits), meaning how much of a genre a General MIDI render can carry, and a probe should keep the two apart.

Probe ideas:

- **K-pop bass line from a chord chart.** A genre the judge knows well as a bassist, so the result can be judged in seconds.
- **Neo-soul or R&B keys and bass.** Dense voicings and a groove that is rarely notated.
- **Production-led genres such as hip-hop or modern pop.** Much of the idea is in the beat and the sound, so this also tests where a text medium runs out.

### Beat making

A practical, self-contained slice that goes deep in one area and touches several directions at once: groove (depth), sound choice through labels (timbre), production-led genres (genre breadth), and easy feedback such as "lay back the snare" (the adjustment loop). It leaves harmony out, which comping covers.

Scrimshaw already shows the grid level: genre-appropriate drum patterns (son clave, calypso, 6/8 bodhran, four-on-the-floor), accents and ghost notes, global swing, and drum sounds chosen from 27 fixed names such as `conga`, `clave`, and `ohat`. The notation is expressive enough to start with.

Steps, in order:

1. **Better samples, same format.** Map each drum name to a good one-shot sample, so the output is usable as a beat with the right mood. We choose the sounds and the model chooses the patterns. The renderer only mixes one-shot WAVs at event times. This is already practical as a rhythm machine and practice companion, for example "a laid-back neo-soul groove at 84 bpm" to play bass over.
2. **Sample choice by label.** Let the model pick samples from a labeled library instead of fixed names. It never hears them and chooses by description, the same way Scrimshaw turned "the villain's ship" into pipe organ and choir. This tests whether text can carry sound choice, and the choices can only be as good as the labels.
3. **Feel.** Add per-note timing offsets and velocities, so "laid back" and "pushed" become writable. This is the groove probe under Depth.

### Fan-out

Do subagents that fan out composition ideas improve quality or the range of choices? Much of the gain may just be sampling variance, which shrinks as models improve, so this is one angle rather than a main direction. Fan-out mostly buys exploration: picking the best variant needs a judge, and taste has no automatic checker, so in practice the judge is the human ear, for example four grooves generated and one picked. A second form splits the work by role, such as a bass agent and a drums agent, which ComposerX tried with symbolic critics. [08-dilla-role-fan-out](../experiments/08-dilla-role-fan-out/README.md) is a first run of the role split, and [09-top-layer-dialogue](../experiments/09-top-layer-dialogue/README.md) let two agents keep talking about one layer. Both converged rather than varied, so the exploration form is still untested.

### Fast decision models

Decision models are a new class of model that cannot generate. They take a state (text, JSON, and for Clef also images) and answer typed questions about it, such as yes or no, pick one of these options, or a score on a scale, returning a probability for each answer in one pass. As of October 2026:

- **Jev** from TypeSafe AI, released 2026-09-15 and API only, with a 32k context and reported latency of roughly 150 to 500 ms
- **Clef** and **Clef-flash** from Cloudflare, released 2026-10-01 with open weights under Apache 2.0, a 64k context, and median latency of 209 ms and 39 ms. They come with an RL fine-tuning service.

The motivation is real-time interaction. A decision fast enough fits inside the music: at 120 bpm a beat is 500 ms and a bar is 2 s, so Clef-flash could decide every beat and Jev every bar, while a generating model is far too slow for that loop. That suggests a split:

- A generating model prepares the musical vocabulary ahead of time: patterns, fills, variations, and section changes, written in the score format.
- A decision model picks among them live, with the recent bars and the player's input as state, for example "keep the groove, add a fill, or move to the next section?"

This fits the beat-making practice companion, which could then react to the player instead of looping. Neither model has published anything on music, so whether their choices make musical sense is untested. Designing the state, the questions, and the options is the experiment. Other uses, such as judging fan-out variants or running discrimination probes at scale, are possible but secondary.

### Generality across media

Does the pattern hold beyond visuals and music? Choreography, lighting cues, sound design, and game level design all have or could have text notations. If intuition carries into each of them, that says something about language itself, which is the original interest.

### Inventing the medium

In Simon's transcript, the model designed Scrimshaw's format itself before writing any music. A model may not just use an existing medium but create one where none exists. This bears directly on the existence question.

### Robustness across notations

Is the intuition in the model, or tied to a notation it memorized? Express the same musical intent through different notations, including one invented on the spot. If the music stays good, the intuition sits above any one encoding.

A concrete form from [07-live-toy-midi-tab](../experiments/07-live-toy-midi-tab/README.md): the same brief written in note names (our score format), in raw MIDI numbers (toy-midi's schema), and in scale degrees, each generated directly with no rule or script in between, and judged by ear. Measure pitch-class errors and register errors separately, because 07 had none of the first and one of the second. If quality holds across all three, the knowledge sits above the encoding. If numbers lose mainly on register, the numeric projection is lossy in that one dimension.

### Creativity beyond idioms

What Scrimshaw showed was mostly choosing the right named idiom for the context. Whether the model makes good choices that no idiom names is a separate question from depth.

### The adjustment loop

Conclusion 3 of the earlier question, in [history.md](history.md#encodability-conclusions-retired-2026-10-12), holds that the agent workflow carries over: discuss at a high level, let the agent drill down to notes, then adjust together. Scrimshaw showed only the first half. Probe the second: give musical feedback the way you would to another musician, and see whether revisions follow the intent. Comping is a good first target.

Prompts in this direction should imitate human musical interaction, not an agent delegating a precise task to a subagent. Write the listener's note the way a musician says it to a collaborator after listening, including its scope, as in "keep everything, just the groove". A note that names the fix, states the scope in technical terms, or points at the measured target makes the test easier than real use. [06-reference-feedback](../experiments/06-reference-feedback/README.md) learned this the hard way, because a draft of its batch 2 added a spec-like rule to the prompt.
