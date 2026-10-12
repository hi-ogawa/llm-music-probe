# 07 Sunset Drive

- Date: 2026-10-10
- Model: claude-opus-5-5

## Setup

This was the first dog-food of toy-midi's agent interface. The agent was a Claude Code session that had started on unrelated work, and it wrote into the open toy-midi page by running JavaScript against its runtime through the WebMCP eval tool ([toy-midi#737](https://github.com/hi-ogawa/toy-midi/pull/737)) and `webmcp-bridge`, with no score file. Playback was toy-midi's in-browser General MIDI synth.

The listener opened an empty project and asked the agent to compose something, with no style, key, or instrument given, so the agent chose the piece itself. The listener then asked for bass tab, which was not planned, and the rest of the session was about the bass: its register, and the strings and frets it should be played on, on a 5-string bass. The listener's notes were phrased as questions a bassist would ask a collaborator, without naming a fix.

What came out was "Sunset Drive", 16 bars of city pop in D major at 96 bpm, with a bass tab the listener accepted.

## Session

| #   | Listener                                                                                             | Agent                                                                                                                                                                                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | "just created empty new project. can you compose something?"                                         | "Sunset Drive": an 8-bar progression, Gmaj7, A7, F#m7, Bm7, Em7, A7, Dmaj7, A7sus4 to A7, played twice and ending on Dmaj7. Electric piano comps the chords, a flute plays the melody, a pad joins on the second pass, and a fingered bass plays root, root, fifth, octave, and a chromatic approach from below into the next chord in every bar.                 |
| 2   | "do you have tab too?"                                                                               | Tabbed the bass by searching for fingerings that keep the hand from moving far, over several versions. They mixed open strings with high positions, such as G0 G0 D12 G12 in bar 1, and reached fret 19 at first and fret 16 at best.                                                                                                                             |
| 3   | "isn't bass octave high? intended?", then "just dropping sounds just fine?", then "5 string is fine" | Explained that the octave notes sat high (roots D2 to B2, octaves up to B3), proposed dropping the bass an octave, and did so once the listener agreed, so the line runs from C#1 to B2 and reaches onto the low B string. The re-run tab stayed within fret 4, but used open strings in place of the usual hand shape in bars 1, 7, and 15, such as B3 B3 A0 D0. |
| 4   | "isn't tab awkward? or you don't have much intuition?"                                               | Fingered every bar with the root, fifth, octave box shape: root on the lowest fret it can, fifth on the next string up, octave two strings up. Every bar became the same moving hand shape within fret 5.                                                                                                                                                         |
| 5   | "very cool nontheless."                                                                              |                                                                                                                                                                                                                                                                                                                                                                   |

## Notes

The composition:

- The agent wrote toy-midi's raw numbers directly, with chord names only as labels for voicings it chose by hand. Every voicing holds exactly its chord's pitch classes, and every melody note is in D major, apart from the bass's intended chromatic approaches. So the one error was register, not pitch.
- The bass register was not a deliberate choice. When asked, the agent first called the whole part high, but only the octave notes were.
- The melody and voicings were written directly as numbers, while the bass and every tab pass went through a procedure. So the directly written layers came out right even in an unfamiliar numeric form.
- The listener played the piece but said nothing about how the composition sounded, only about the bass.

The tab:

- The agent's first instinct was a generic optimizer, not a bassist's habit. It searched for fingerings with costs for "few frets and little movement", which gave open strings mixed with high positions.
- It knew the root, fifth, octave box shape by name and applied it correctly as soon as the tab was questioned, but did not reach for it on its own.
- This was first written up as the idiom being in the model's vocabulary all along. The listener pointed out that recalling a named rule and running it as code is still a heuristic solver. Intuition would mean writing fret numbers directly as text, the way someone who has read a lot of tab would, and this session never asked for that. So every pass, including the final one, was a solver.
- Two awkward spots are in the notes, not the fingering. In bars 4 and 6 the approach note from below falls under E1, so the hand jumps from the G string to the B string. The agent suggested approaching from above instead, which was not tried.

How the agent took the notes:

- Both of the listener's notes were questions a bassist would ask, not instructions. For the register, the agent explained the cause and waited for agreement before changing the part, but for the tab it rewrote directly.

## References

- [session.md](session.md): the listener's prompts verbatim, every script the agent ran, and the tab from each pass
- [project-state.json](project-state.json): the final project as read from the page, with every note and tab string
- [toy-midi#737](https://github.com/hi-ogawa/toy-midi/pull/737): the WebMCP eval tool the agent used to write into the page
