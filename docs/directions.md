# Directions

Open directions for the research, each with probe ideas that serve it. Nothing here is a fixed plan or order. Format design lives in [notation.md](notation.md), and our score-to-sound tool in [tool-plan.md](tool-plan.md).

Judge results by ear, blind where possible. Bass lines and grooves are the strongest targets, because that is where the judge's ear is most reliable.

## Depth

How far musical intuition goes beyond named idioms, and whether each layer has a medium that can carry it. Depth is expected to improve with training, so it is one vector among several, not the goal. Scrimshaw's six tracks hid several layers: chord names were voiced by the renderer, the chord vocabulary stopped at 7ths and 9ths, and groove was one global swing value plus three dynamic levels.

Probe ideas:

- **Comping a jazz standard.** Ask how the model would comp a standard with explicit voicings, then play it back. Even reproducing a known transcription shows fluency, the way humans learn by transcribing. Then ask for variants: Red Garland block chords, Bill Evans rootless voicings, Freddie Green four-to-the-bar, bossa, sparse against busy, reharmonized turnarounds.
- **Voicing.** The same progression in contrasting characters, such as dark and close against open and airy. The signal is whether spacing, register, low-interval limits, and voice leading change to match the stated intent.
- **Tension and reharmonization.** A melody and a plain progression, with extended chords available. Check validity mechanically, then judge whether tensions are placed with intent or just added.
- **Groove.** The same bass line straight, laid back, and pushing, or with ghost notes, using per-note timing offsets and velocities. This is the layer least written down as text, so it is the most likely place where no medium exists in the model's vocabulary.
- **Instrument idiom.** Bass tab, through the toy-midi JSON format (`../toy-midi`): do the model's string and fret choices make sense for playability and hand position?
- **Timbre and orchestration.** The same passage orchestrated for different scenes, with synth parameters available. The signal is whether parameters follow the intent rather than staying at defaults.

## Genre breadth

Scrimshaw's six tracks are in the friendliest genres for a symbolic medium: retro game music, folk jig, and waltz. They were written as notes in the first place, and many symbolic transcriptions exist. Does the intuition hold in genres whose vocabulary lives mostly in recordings rather than in written notation? Simon's follow-up dance track, Starlight Armada, is one data point outside game music, but it is formulaic and has not been judged by ear.

Probe ideas:

- **K-pop bass line from a chord chart.** A genre the judge knows well as a bassist, so the result can be judged in seconds.
- **Neo-soul or R&B keys and bass.** Dense voicings and a groove that is rarely notated.
- **Production-led genres such as hip-hop or modern pop.** Much of the idea is in the beat and the sound, so this also tests where a text medium runs out.

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
