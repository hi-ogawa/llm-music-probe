# 08 Donut Shop

- Date: 2026-10-11
- Model: claude-opus-5-5, as the orchestrating agent and as three `general-purpose` subagents it launched in parallel

## Setup

The listener named a style, J Dilla, and nothing else. The agent drove toy-midi's open page through `webmcp-bridge` and played it on toy-midi's in-browser General MIDI synth. It first wrote an 8-bar sketch alone. When the listener asked for a longer song using subagents, the agent split the work by role instead of generating variants to pick from. It fixed the form and chords itself, then three subagents wrote the rhythm section, harmony and melody in parallel without seeing each other's parts. The result was "Donut Shop (Dilla Sketch)", 36 bars at 88 bpm on 13 tracks, which the listener judged by ear only later.

## Session

| #   | Listener                                                                                                             | Agent                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "see webmcp-bridge cli try some j dilla inspired mini song"                                                          | 8 bars at 88 bpm over Bbmaj9, Am11, Dm9, Gm9 C13: loose kicks, a late snare and near-straight hats, Rhodes playing a long hit then a late stab, and bass slightly behind the kick.                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2   | "try make longer multi section song with more parts/instruments variations. use subagents to explore idea"           | Six sections: intro, verse A, a bridge through Gm9, C13sus, Fmaj9, Dbmaj7#11, Gm9, Am7, Bbmaj7, A7#9, a breakdown, verse A2 as the peak, and an outro. Drums: none in the intro, snares laid back about 0.03 to 0.06 beats, a brush-only half-time breakdown, and a busier verse A2 with an 808 layer and tambourine. Bass on the roots with chromatic pickups. Rhodes as a chopped soul sample, with strings in the bridge and an organ bed in verse A2. A flute hook answered by choir chops, moved through the bridge chords and harmonized a third below by vibes in verse A2. |
| 3   | Later, after listening: "llike others experiments, rhythm, harmony looks desent grounded but melody feels arbitrary" |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Notes

How the work was split:

- The orchestrator fixed the form, chords, voicings and roots before handing anything out, so the subagents only filled in roles. The other reading of "use subagents to explore idea", several variants with one picked by ear, was never tried.
- The orchestrator also turned "J Dilla" into named idioms with numbers in its subagent prompts: drunk kicks, a snare 0.03 to 0.06 beats late, near-straight hats, ghost notes, a chopped soul sample on Rhodes, vocal chops, and extended neo-soul chords. That made the subagents' task much easier than the style name alone.
- The parts fit together mechanically, with every note in range, and the snare landed where the prompt asked, about 31 ms late. So the feel was carried through, but the number came from the prompt, not from a subagent's choice.
- Two parts drifted from their brief, and their subagents said so. The choir chops dipped into the keys' register, and the Rhodes played fewer hits in verse A2 than in verse A, though A2 was meant as the peak.

Why the melody felt arbitrary:

- No subagent chose notes one by one. Each wrote an on-the-fly DSL inside its module, a small vocabulary of helpers, and then wrote its part in that vocabulary. In the rhythm part, `snareT = (bar, i) => bar + i / 4 + r(0.03, 0.06)` returns a backbeat time with the lateness built in, so one definition places every snare, and a section reads as usage such as `snareT(bar, 12)` for the snare on beat 4. In the melody part, the hook phrases are literal, but the bridge develops them by transposing and snapping each note to the nearest tone of the new chord (`snapToChord`).
- These vocabularies are rule-level, not literal: one line stands for a rule, and its implementation, often with a random draw, decides the exact note.
- `snareT` also rebuilds two DAW features in one expression: a fixed drag of about +0.045 beats, which is a groove template, and ±0.015 of random scatter, which is humanize. Only the snare's range came from the prompt, so the kick swing and every jitter amount were the subagent's own.
- That lines up with the listener's verdict. A groove's feel is itself a systematic tendency, so rhythm and harmony written as rules came out grounded. The melody is where a rule stood in for choosing notes, and that is the part that felt arbitrary. [09](../09-top-layer-dialogue/README.md) followed this up by writing the top layer note by note. The longer write-up of the DSL reading is in [notation.md](../../docs/notation.md#second-evidence-notations-the-agents-invent-2026-10-11).
- Drums and chord names got through here, which [07](../07-live-toy-midi-tab/README.md) had not managed, probably because a Dilla beat is a drum-led request.

## References

- [session.md](session.md): the listener's prompts and the subagent prompts and reports, verbatim
- [sketch.js](sketch.js): the single-agent 8-bar sketch
- [parts/](parts/): the shared spec, the three subagents' parts, and the assembler, run with `node parts/assemble.mjs ./rhythm.mjs ./harmony.mjs ./melody.mjs > code.js` then `webmcp-bridge execute-tool toy_midi_eval --arg code=- < code.js`
- [project-state.json](project-state.json): the final project with every note
