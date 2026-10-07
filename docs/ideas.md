# Ideas

Loose ideas to keep, not yet a plan.

## Design our own format

Scrimshaw is the existence proof, not the base. Designing the text format is part of the exploration: what notation lets the model express the most musical intent, and how close it should stay to notations that already exist as text.

## Translate between text and a DAW

Round-trip between the model's text format and a DAW, so the model's output can be opened, edited, and played in real tools, and existing projects can be turned back into text for the model. A candidate is the toy-midi JSON format (`../toy-midi`), which also allows testing bass tab notation: string and fret choices carry playability and fingering intent that pitch notation leaves out.

## Comping a jazz standard

Ask the model how it would comp a jazz standard with explicit voicings, then play it back.

- Even if it reproduces a known transcription, that still shows musical fluency, the way humans learn by transcribing.
- Then ask for variants: Red Garland block chords, Bill Evans rootless voicings, Freddie Green four-to-the-bar, bossa, sparse against busy comping, reharmonized turnarounds.
- Interesting for nuanced chords, voicing, and progression ideas, which the six Scrimshaw tracks did not show because they used chord names voiced by the renderer.
- Scrimshaw's `+` stacks and global swing are enough for a first try, before our own format exists.
