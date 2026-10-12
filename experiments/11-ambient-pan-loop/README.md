# 11 Slow Tide

- Date: 2026-10-12
- Model: claude-fable-5-1

## Setup

The listener opened an empty recorder project in toy-midi and asked for ambient music in 3/4 as a 16-bar loop, with one production constraint: use pan effectively. The agent drove the open page through `webmcp-bridge`, running JavaScript against toy-midi's runtime for every change, and read the page's tool description and type declarations as its only documentation. Playback was toy-midi's in-browser General MIDI synth.

The agent never heard the music. It wrote the whole piece in one script, then took short requests: play it, tidy the track list, brainstorm percussion, add every idea for auditioning, and mute a first set. Unlike [10](../10-cold-start-hip-hop/README.md), the brief here left key, tempo, instruments and form to the agent, and the listener asked for a brainstorm before any percussion was written.

What came out was "Slow Tide", 16 bars in D major at 66 bpm, six melodic tracks laid out across the stereo field, and eight percussion tracks numbered by idea so they can be muted in groups. The listener had not yet given a verdict on the sound when the session was written up.

## Session

| #   | Listener                                                                          | Agent                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "compose some ambiental music, 3/4, 16 bars loop. use pan effectively"            | "Slow Tide" at 66 bpm in D major: eight chords of two bars each, Dmaj7, Gmaj9, Bm7, Em9, Dmaj7/F#, Gmaj7, Em7, A(add9), so the loop closes back on D. Two pads hold the chords in the center, one an octave below. An electric piano melody sits left at -0.45 and mostly enters on beat 2. A music box answers right at +0.6, two octaves up, only in the melody's gaps. Two crystal tracks hard-panned at -0.95 and +0.95 ping-pong by bar, odd bars left on beat 3.5, even bars right on beat 2.5. |
| 2   | "how about some slight percusion idea? brainstorm first."                         | Five ideas, each placed in the stereo field: a brushed heartbeat split left and right, a kalimba ostinato on the right, a woodblock ping-pong moving against the crystals, a reverse-cymbal wash alternating sides every four bars, and a barely audible 808 kick in the center. Recommended the first with the fourth.                                                                                                                                                                               |
| 3   | "try a all together and we can switch muting or combining some to audition later" | Added all five as eight tracks, prefixed with the idea number. The wash starts three beats before each chord change so the swell peaks on it, with bar 1's swell wrapping from bar 16.                                                                                                                                                                                                                                                                                                                |
| 4   | "go ahead switch"                                                                 | Muted the kalimba and the 808, leaving the heartbeat, woodblock and wash over the loop.                                                                                                                                                                                                                                                                                                                                                                                                               |

## Notes

How the agent wrote the music:

- The agent wrote toy-midi's raw numbers directly, with the chords as a table of root and voicing in MIDI pitches and the chord names only in comments. A `bar()` helper turned bar numbers into beats, which is how the 3/4 constraint was carried, and every part was placed through it.
- The melody and the music box answers were literal tables of pitch, start and duration, chosen note by note, with the music box placed by reading where the melody rests.
- The crystals, the kalimba, the heartbeat and the 808 were rules run as code: a chord tone picked by bar index, root and fifth of the chord under each bar, a hit on alternating bars. The wash was two literal notes per side.
- Pan was the organizing idea, because the brief asked for it, and every placement was a textbook stereo move: the bed in the center, a conversation between a left and a right voice, hard-panned ping-pong, and a wash alternating sides. The agent also chose octaves so the panned parts sit in different registers, drone low, pad mid, crystals high, and named this in the project comment.
- The percussion brainstorm was built from named production moves, brushed heartbeat, ostinato, ping-pong, reverse-cymbal swell, sub pulse, each with a pan position and a velocity, and the one detail beyond the name was starting the reverse cymbal early so it peaks on the downbeat.

How the iteration went:

- The brief fixed meter, length and one mixing constraint, and the agent chose everything else without asking: key, tempo, instruments, harmony and form. It explained those choices in the project comment and in its reply.
- The listener asked for a brainstorm before any percussion was written, and then for all of it rather than the agent's pick, so the audition could happen in the DAW. The agent prepared for that by numbering the tracks by idea.
- "go ahead switch" named no tracks. The agent read it as accepting the mute set it had suggested one reply earlier, and said so.

## References

- [session.md](session.md): the listener's prompts verbatim and every script the agent ran
- [project-state.json](project-state.json): the project as the listener exported it, with every note
- [share-link.md](share-link.md): the same project as a toy-midi share link
- [toy-midi#821](https://github.com/hi-ogawa/toy-midi/issues/821): the track colors issue filed from this session's side topic about reading a many-track project
