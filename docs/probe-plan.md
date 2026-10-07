# Probe plan

The existence of an encodable medium is settled at a primitive level (see [context.md](context.md)). How deep a current model goes is expected to improve with training, so measuring it is not the goal. The open question is per layer: does a text medium exist that can carry this layer of musical intuition, and does the model use it when one is offered?

Scrimshaw's format hid several layers. Chord names were voiced by the renderer, the chord vocabulary stopped at 7ths and 9ths, and groove was one global swing value plus three dynamic levels. Each probe below opens one of those layers and checks whether the model fills it with intent.

## P0. Baseline

Done in [experiments/01-scrimshaw-breakdown](../experiments/01-scrimshaw-breakdown/README.md). Next, pick a format to extend: the Scrimshaw format itself, or a small note list that renders to MIDI. Implementation should stay trivial, because the interest is the encoding.

## P1. Voicing

Medium: explicit note stacks instead of chord names. Ask for the same progression in contrasting characters, for example dark and close against open and airy, or a jazz ballad against a pop ballad. The signal is whether the voicings change in ways that match the stated intent: spacing, register, low-interval limits, voice leading between chords.

## P2. Tension and reharmonization

Medium: an extended chord vocabulary (9, 11, 13, altered tensions) and explicit notes. Give a melody and a plain progression and ask for a reharm. Check validity mechanically, then judge by ear whether the tensions are placed with intent or just added.

## P3. Groove

Medium: per-note timing offsets and velocities. Ask for the same bass line straight, laid back, and pushing, or with ghost notes. This is the layer least written down as text, so it is the most likely place where no medium exists in the model's vocabulary, even if one exists in the format.

## P4. Timbre and orchestration

Medium: instrument choice plus synth parameters such as brightness, attack, release, and register. Ask for the same passage orchestrated for different scenes. The signal is whether parameter choices follow from the stated intent rather than staying at defaults.

## Judging

Judge by ear, blind where possible. Bass lines and grooves are the strongest targets, because that is where the judge's ear is most reliable.

## Order

P1 and P2 first, because they extend Scrimshaw's format in the most obvious way and have the richest written literature, so they should work if the thesis holds. P3 is the real test, because it is where an encoding could be missing. P4 depends most on the renderer, so it comes last.
