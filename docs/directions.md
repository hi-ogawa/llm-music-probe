# Directions

Open directions for the research, each with probe ideas that serve it. Nothing here is a fixed plan or order. Format design lives in [notation.md](notation.md), and our score-to-sound tool in [tool-plan.md](tool-plan.md).

Judge results by ear, with renders named by condition so the listener knows what each one is. Blind listening adds a key, shuffled names, and a reveal step, so use it only when a judgment would otherwise lean on knowing the condition and the conditions cannot be told apart by ear. Measure from the scores whatever can be measured, so listening is left for what only the ear can judge. Bass lines and grooves are the strongest targets, because that is where the judge's ear is most reliable.

## Depth

How far musical intuition goes beyond named idioms, and whether each layer has a medium that can carry it. Depth is expected to improve with training, so it is one vector among several, not the goal. Scrimshaw's six tracks hid several layers: chord names were voiced by the renderer, the chord vocabulary stopped at 7ths and 9ths, and groove was one global swing value plus three dynamic levels.

Probe ideas:

- **Comping a jazz standard.** Ask how the model would comp a standard with explicit voicings, then play it back. Even reproducing a known transcription shows fluency, the way humans learn by transcribing. Then ask for variants: Red Garland block chords, Bill Evans rootless voicings, Freddie Green four-to-the-bar, bossa, sparse against busy, reharmonized turnarounds.
- **Voicing.** The same progression in contrasting characters, such as dark and close against open and airy. The signal is whether spacing, register, low-interval limits, and voice leading change to match the stated intent.
- **Tension and reharmonization.** A melody and a plain progression, with extended chords available. Check validity mechanically, then judge whether tensions are placed with intent or just added.
- **Groove.** The same bass line straight, laid back, and pushing, or with ghost notes, using per-note timing offsets and velocities. This is the layer least written down as text, so it is the most likely place where no medium exists in the model's vocabulary.
- **Instrument idiom.** Bass tab: do the model's string and fret choices make sense for playability and hand position? It was planned through the toy-midi JSON format (`../toy-midi`), and first ran through toy-midi's agent interface instead in [07-live-toy-midi-tab](../experiments/07-live-toy-midi-tab/README.md), where the model knew the root, fifth, octave box shape as a named rule but did not apply it until asked. Every pass there was a solver, either a generic search or the recalled rule run as code, so it says nothing about intuition absorbed from reading tab. Next: give the model a new melodic bass line with real fingering choices and ask for ASCII tab written directly, with no script, then convert it to toy-midi's per-note strings mechanically. A rule-based version of the same line is the comparison, and the judgment is by a bassist. Tab found online is often amateur, so tab-like output may also carry its habits.
- **Timbre and orchestration.** The same passage orchestrated for different scenes, with synth parameters available. The signal is whether parameters follow the intent rather than staying at defaults.

## Genre breadth

Scrimshaw's six tracks are in the friendliest genres for a symbolic medium: retro game music, folk jig, and waltz. They were written as notes in the first place, and many symbolic transcriptions exist. Does the intuition hold in genres whose vocabulary lives mostly in recordings rather than in written notation? Simon's follow-up dance track, Starlight Armada, is one data point outside game music, but it is formulaic and has not been judged by ear.

Probe ideas:

- **K-pop bass line from a chord chart.** A genre the judge knows well as a bassist, so the result can be judged in seconds.
- **Neo-soul or R&B keys and bass.** Dense voicings and a groove that is rarely notated.
- **Production-led genres such as hip-hop or modern pop.** Much of the idea is in the beat and the sound, so this also tests where a text medium runs out.

## Beat making

A practical, self-contained slice that goes deep in one area and touches several directions at once: groove (depth), sound choice through labels (timbre), production-led genres (genre breadth), and easy feedback such as "lay back the snare" (the adjustment loop). It leaves harmony out, which comping covers.

Scrimshaw already shows the grid level: genre-appropriate drum patterns (son clave, calypso, 6/8 bodhran, four-on-the-floor), accents and ghost notes, global swing, and drum sounds chosen from 27 fixed names such as `conga`, `clave`, and `ohat`. The notation is expressive enough to start with.

Steps, in order:

1. **Better samples, same format.** Map each drum name to a good one-shot sample, so the output is usable as a beat with the right mood. We choose the sounds and the model chooses the patterns. The renderer only mixes one-shot WAVs at event times. This is already practical as a rhythm machine and practice companion, for example "a laid-back neo-soul groove at 84 bpm" to play bass over.
2. **Sample choice by label.** Let the model pick samples from a labeled library instead of fixed names. It never hears them and chooses by description, the same way Scrimshaw turned "the villain's ship" into pipe organ and choir. This tests whether text can carry sound choice, and the choices can only be as good as the labels.
3. **Feel.** Add per-note timing offsets and velocities, so "laid back" and "pushed" become writable. This is the groove probe under Depth.

## Fan-out

Do subagents that fan out composition ideas improve quality or the range of choices? Much of the gain may just be sampling variance, which shrinks as models improve, so this is one angle rather than a main direction. Fan-out mostly buys exploration: picking the best variant needs a judge, and taste has no automatic checker, so in practice the judge is the human ear, for example four grooves generated and one picked. A second form splits the work by role, such as a bass agent and a drums agent, which ComposerX tried with symbolic critics.

## Fast decision models

Decision models are a new class of model that cannot generate. They take a state (text, JSON, and for Clef also images) and answer typed questions about it, such as yes or no, pick one of these options, or a score on a scale, returning a probability for each answer in one pass. As of October 2026:

- **Jev** from TypeSafe AI, released 2026-09-15 and API only, with a 32k context and reported latency of roughly 150 to 500 ms
- **Clef** and **Clef-flash** from Cloudflare, released 2026-10-01 with open weights under Apache 2.0, a 64k context, and median latency of 209 ms and 39 ms. They come with an RL fine-tuning service.

The motivation is real-time interaction. A decision fast enough fits inside the music: at 120 bpm a beat is 500 ms and a bar is 2 s, so Clef-flash could decide every beat and Jev every bar, while a generating model is far too slow for that loop. That suggests a split:

- A generating model prepares the musical vocabulary ahead of time: patterns, fills, variations, and section changes, written in the score format.
- A decision model picks among them live, with the recent bars and the player's input as state, for example "keep the groove, add a fill, or move to the next section?"

This fits the beat-making practice companion, which could then react to the player instead of looping. Neither model has published anything on music, so whether their choices make musical sense is untested. Designing the state, the questions, and the options is the experiment. Other uses, such as judging fan-out variants or running discrimination probes at scale, are possible but secondary.

## Generality across media

Does the pattern hold beyond visuals and music? Choreography, lighting cues, sound design, and game level design all have or could have text notations. If intuition carries into each of them, that says something about language itself, which is the original interest.

## Inventing the medium

In Simon's transcript, the model designed Scrimshaw's format itself before writing any music. A model may not just use an existing medium but create one where none exists. This bears directly on the existence question.

## Robustness across notations

Is the intuition in the model, or tied to a notation it memorized? Express the same musical intent through different notations, including one invented on the spot. If the music stays good, the intuition sits above any one encoding.

## Creativity beyond idioms

What Scrimshaw showed was mostly choosing the right named idiom for the context. Whether the model makes good choices that no idiom names is a separate question from depth.

## The adjustment loop

Conclusion 3 in [context.md](context.md) holds that the agent workflow carries over: discuss at a high level, let the agent drill down to notes, then adjust together. Scrimshaw showed only the first half. Probe the second: give musical feedback the way you would to another musician, and see whether revisions follow the intent. Comping is a good first target.

Prompts in this direction should imitate human musical interaction, not an agent delegating a precise task to a subagent. Write the listener's note the way a musician says it to a collaborator after listening, including its scope, as in "keep everything, just the groove". A note that names the fix, states the scope in technical terms, or points at the measured target makes the test easier than real use. [06-reference-feedback](../experiments/06-reference-feedback/README.md) learned this the hard way, because a draft of its batch 2 added a spec-like rule to the prompt.
