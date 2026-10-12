# 10 Corner Store Thirds

- Date: 2026-10-12
- Model: claude-opus-5-5

## Setup

The session was a dog-food of toy-midi's new agent guide, the site's `/llms.txt` ([toy-midi#831](https://github.com/hi-ogawa/toy-midi/pull/831)). The agent started with no context about toy-midi beyond a preview URL. It read the guide and the runtime's type declarations, wrote the first version as a share link, a URL with the whole project encoded in it, and then switched to driving the open page through `webmcp-bridge`, running JavaScript against toy-midi's runtime for every later change. Playback was toy-midi's in-browser General MIDI synth.

The listener asked for a hip-hop beat loop and then shaped it one short request at a time, the way you would steer a producer sitting next to you. The agent never heard the music. The listener played it in the browser between requests and saved the result.

The beat started as a plain 4-bar loop. Over nine requests it gained hand percussion, a string pad, a humanized groove, a two-voice lead hook, a 24-bar arrangement, and transitions between sections.

## Session

| #   | Listener                                                                                           | Agent                                                                                                                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "can you make hip hop beat loop on [toy-midi]?"                                                    | A 4-bar loop at 88 bpm in A minor: TR-808 drums with a syncopated kick and swung hats, synth bass on the roots, and Rhodes on Am9, Fmaj7, Dm9, E7#9.                                                              |
| 2   | "can we add more background percussion to backup the vibe and maybe backing with other instrument" | Added hand percussion (swung 16th shaker, side stick, conga and bongo figures, panned right) and a string pad on the upper chord tones (panned left), both quiet.                                                 |
| 3   | "can you humanize a bit main beat and bass?"                                                       | Laid the snare back about 17 ms and the clap about 20 ms, kept the kick tight, made the hats loosest, and put the bass about 8 ms behind the kick.                                                                |
| 4   | "can we add other stacked lead-ish upper backing-ish?"                                             | Wrote a sparse call-and-response hook, played by vibes in two octaves and a flute on the top octave.                                                                                                              |
| 5   | "is it octave stack?"                                                                              | Confirmed that it was octaves only and offered harmony, without changing anything. The listener meant "isn't this boring octave stack? why not hamonize with two lead?"                                           |
| 6   | "harmony 2 lead stack maybe"                                                                       | Turned the vibes into a harmony line under the flute: thirds below, sixths where a third would clash, ending on G# under E7#9.                                                                                    |
| 7   | "name song"                                                                                        | "Corner Store Thirds".                                                                                                                                                                                            |
| 8   | "can we extend to multi section loop?"                                                             | 24 bars: intro (Rhodes, strings, shaker), verse (no hook), hook (everything), and break (no kick, snare or bass), looping back to the verse.                                                                      |
| 9   | "can we make each section boundary bar imply transition?"                                          | A snare build into a crash into the verse, a tom fill with the bass resting and strings swelling into the hook, a stop on the last beat into the break, and a snare roll with a bass walk-up back into the verse. |
| 10  | Raised the vibes about 4 dB and said "pretty awesome"                                              |                                                                                                                                                                                                                   |

## Notes

- Every musical move came from a request. The agent added none on its own, even standard ones such as a percussion layer, humanizing, or harmony in the lead.
- Once a move was named, the agent carried it out with sensible detail, and each one was a known rule. Humanizing was a fixed drag per drum plus random scatter, written as code, which is a groove template and a humanize pass simulated on the fly rather than taken from a DAW. The harmony was a third below the lead, with a sixth where a third would clash, chosen by the chord underneath. The transitions were one textbook move per boundary.
- The hook was rule-shaped too, chord tones from A minor pentatonic arranged as call and answer, and nobody judged it on its own.
- The critique phrased as a question, step 5, was answered as a factual question. The change came only once step 6 named it, so a musician's note that implies the fix can miss.
- Most requests named the move, such as "humanize" or "harmony 2 lead stack", which is easier for an agent than a note about how the music sounds.

## References

- [project-state.json](project-state.json): the project as the listener saved it, with every note
- [session.md](session.md): every script the agent ran, in order
- [share-link.mjs](share-link.mjs): the first version, written as a toy-midi share link
- [toy-midi#831](https://github.com/hi-ogawa/toy-midi/pull/831): the agent guide this session dog-fooded
