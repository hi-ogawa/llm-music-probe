# Reading

The current reading in detail. Rewrite it when a session changes the reading, rather than appending dated notes, and keep the short version in the [README](../README.md) in step.

## Question

How does a person steer an LLM to compose good music in a symbolic medium?

The research started from an earlier question: is musical intuition encodable as text at all, so that an LLM can present musical ideas without generating audio, the way it presents geometric intuition through code? Experiments 01 to 04 settled that well enough for practical work. The question that is left is practical: given a model that knows the vocabulary, what does a brief or a note from the listener need to say to get music the listener actually likes?

It splits into three parts:

1. **What the model knows.** Mostly settled, see [below](#what-the-model-knows).
2. **How to steer it.** The open core, see [below](#how-to-steer-it).
3. **What the medium limits.** A confound to keep apart from the other two, see [below](#what-the-medium-limits).

## What the model knows

- **A text medium carries musical ideas.** Harmony, bass, rhythm, orchestration, and form idioms come through a plain-text score or a MIDI-like JSON schema, and audio is only rendering. See [01](../experiments/01-scrimshaw-breakdown/README.md) and the 43 cells of [04](../experiments/04-range-sweep/README.md).
- **The vocabulary is rule-shaped.** Much of what came out convincing is a known rule carried out: 08's Dilla feel is a mean drag plus random scatter, 07's bass tab is a recalled box shape, and 09's hand-written harmony line follows a third-below rule note for note. See [07](../experiments/07-live-toy-midi-tab/README.md), [08](../experiments/08-dilla-role-fan-out/README.md), and [09](../experiments/09-top-layer-dialogue/README.md). Writing by hand instead of with a script does not by itself show more than a rule.
- **The rules hold across genres.** The range sweep's genres, plus hip-hop and classical, have come out idiomatic in [04](../experiments/04-range-sweep/README.md), [10](../experiments/10-cold-start-hip-hop/README.md), and [12](../experiments/12-classical-overture-loop/README.md).
- **Melody is the weak layer.** It is the least rule-shaped, and it fell short in 04 and 08, and 09's hand-written rewrite "didn't explore much". Whether the gap is in the notes or in missing phrasing is not separated, and [05](../experiments/05-phrasing-pass/README.md) has not been listened to.

## How to steer it

The model does not lack knowledge so much as default to the cheapest reading of the brief. "A loop" comes out as 4 or 8 bars of fixed rules, because nothing asks for more. So steering is mostly a question of what the brief and the listener's notes name.

What the sessions so far show:

- **Moves are known but not reached for.** In 09 the agents knew stacking and voicing moves but did not use them until the listener said "this sounds thin". In 10 every move, from a percussion layer to humanizing to a harmony line, came from a request.
- **Once named, a move is carried out with sensible detail, usually the first textbook version.** 10's humanize was a fixed drag per drum plus scatter, and 12's two builds used the same recipe.
- **Naming an element can unlock a whole level.** 12's brief named multiple sections and build-ups at the boundaries, and the agent added a key plan, a dominant pedal before each arrival, a diminished seventh before the return, a tutti restatement, and a codetta, none of which were named. The listener's verdict on the first link was "pretty awesome", from one run.
- **A note phrased as a question can miss.** In 10, "is it octave stack?" was answered as a fact, and the change came only when the next note named the harmony. [06](../experiments/06-reference-feedback/README.md) found that a note naming the fix makes the test easier than real use.

Suggested by these, but not yet tested:

- **The level of the name matters.** A mechanism such as AABB makes the agent's choice for it. Imagery such as "a set the band has played a hundred times" names no element. The useful level is the compositional element: sections, boundary events, a build, the number of parts, an energy level per section, the role of each part, or variation on repeats.
- **A reference is an intent that has not been unpacked.** "Drums like Questlove on Voodoo" leaves the model to decide what that means, probably its one stereotype for the record. If the person steering knows what they mean, they should write it as techniques, such as the snare dragged behind the beat and loose hats. What the model reads into a bare reference is a question about its knowledge, not about steering, and is better asked out loud, so the answer can be corrected before anything is composed.
- **More parts give the agent more to vary.** Variation on repeats is mechanical and cheap for an agent, and a larger palette that comes and goes by section gives it more places to apply it.
- **Sketching first uses the listener's ear where it is cheapest.** Several short contrasting sketches, one picked by ear, then developed. The agent cannot hear, so sampling and picking stands in for its missing judgment.
- **Melody needs its own brief.** Fixing the melody and varying everything else, or the reverse, keeps the weak layer from hiding inside the arrangement.

If these hold, steering is a matter of compositional vocabulary: a person who can name the elements can direct the agent, and a map of named techniques is a map of the knobs.

## What the medium limits

From general knowledge of MIDI mock-up practice, not checked against sources. How well a genre survives a General MIDI render depends on where it keeps its information. That is a confound for every judgment by ear, because a genre that sounds worse may only be one the medium cannot carry.

- **Expression at the onset or within the note.** Struck and plucked sounds, such as piano, mallets, harp, pizzicato, and drums, do everything at the attack, so pitch and velocity carry most of it. Bowed strings, winds, brass, and voice shape each note while it sounds, which needs continuous control. [notation.md](archive/notation.md#performance-techniques-from-daw-practice) lists those techniques. toy-midi has no controller automation, pitch bend, or sustain pedal yet.
- **Born in a sequencer.** House, techno, synth-pop, chiptune, and trap were made as MIDI, so programmed sounds authentic there, groove feel included.
- **Texture that masks individuals.** Tutti orchestra, pads, and ambient washes forgive crude per-note expression. An exposed solo line shows all of it.
- **General MIDI sample quality.** Pads, string ensemble, piano, and synths hold up. Brushes, upright bass, solo sax, and nylon guitar sound like General MIDI.

So texture-led, tutti, keyboard, and electronic briefs fit the medium, and small-group jazz or solo wind lines do not. A brief meant to judge the composition rather than the renderer should pick a genre that fits.
