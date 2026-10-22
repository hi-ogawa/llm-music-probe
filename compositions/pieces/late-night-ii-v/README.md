# Late Night ii-V

Lo-fi jazz in C at 88 BPM, 32 bars, built around a Dm9–G13–Cmaj9–Am9 loop. A vibraphone melody in thirds and sixths carries it, with a flute answering in the gaps. A B section moves toward F major and changes the feel, and the outro turns around on A7♭9 so the song loops back into its intro.

- `project.json`: the piece, a Toy MIDI `SharedProject`.
- `late-night-ii-v.mjs`: the generator. `node late-night-ii-v.mjs` writes `project.json` next to it.

## How it was made

The session drove Toy MIDI's open draft page through its WebMCP tool, `toy_midi_eval`, from the desktop app's built-in browser. There was no brief up front. Hiroshi steered with short requests while listening, and each step was written straight into the open project:

1. "compose something": an 8-bar loop on the ii–V–I–vi in C with electric piano, bass, drums, and vibes.
2. "minimize track": every track collapsed to an overview row.
3. "two note vibe harmony": a second vibes voice, a third or sixth below each melody note, taken from the chord under it.
4. "upright bass": Fingered Bass to Acoustic Bass.
5. "pad or string": a string section holding each chord.
6. "midi cc for articulation": sustain pedal on the keys, expression swells and vibrato on the strings, and vibrato on the vibes.
7. "percussion": shaker, congas, and triangle on a second kit track.
8. "extend longer with multiple section with contrast": the 32-bar form below, with every track regenerated from one section plan.
9. "loop" and "arrange ends like loop naturally indicates come back": the outro turnaround into the intro.
10. "add supporting melody 2nd instrument": the flute counter-melody.

The browser pane couldn't hand the project back to the session as a file, because clipboard writes were denied and downloads need approval. So the generator here is the session's in-page code, consolidated into one Node script, and each track's notes and automation hash the same as the project the session left open.

## Form

| Bars | Section | Harmony | What happens |
|---|---|---|---|
| 1–4 | Intro | Dm9 G13 Cmaj9 Am9 | Held keys chords and strings. A soft vibes D5 and bass D2 on the downbeat, the shaker and bass come in for bars 3–4, the flute leads in, and a snare pickup sets up A. |
| 5–12 | A | Dm9 G13 Cmaj9 Am9, twice | The two-hit keys comp with pedal, the bass on root, fifth, and a chromatic approach, hats and backbeat, congas, and the vibes melody. The flute only fills the vibes' two held notes. |
| 13–20 | B | Fmaj9 E7♭9 Am9 Gm9–C13 Fmaj9 B♭maj7♯11 Em7–A7♭9 Dm9–G13 | The contrast. Dry offbeat keys stabs without pedal, walking bass, ride and side stick, strings an octave up, and eighth-note shaker only. The vibes play long tones that climb to E6 in bars 17–18 while the flute falls under them, and a snare roll leads back. |
| 21–28 | A' | As A | A with more push: a crash, a kick added in every bar, more open hats, tambourine, louder keys and vibes, and the flute as a full second voice. |
| 29–32 | Outro | Dm9 G13 Cmaj9 A7♭9 | The groove for two bars, then the drums thin to ride and side stick and finally a soft kick and hats. The keys hold a rolled A7♭9, the strings and shaker swell, and the vibes climb to B♭5 and step down to C♯5, which resolves to the D5 that opens the intro. |

## The parts

- **Vibes.** The melody with a harmony voice 16 velocity below it, a third under each note when that is a chord tone, otherwise a sixth, and a fifth or fourth only where neither fits, as on the E6 over B♭maj7♯11. CC1 holds a light motor vibrato, and CC11 lifts through B's climb and A'.
- **Flute.** A counter-melody in D4–G5, mostly under the vibes. Its role grows by section: fills in A, a falling line against the vibes' climb in B, and sustained notes plus answers in every gap in A'. Its CC11 rises with that role. A pass moves any flute note that lands within a half step of a sounding vibes note, or holds outside the chord, to the nearest chord tone, preferring below.
- **Keys.** Electric piano in rootless voicings. Held chords in the intro, a hit on 1 and on the "and" of 3 in A, and short offbeat stabs in B. CC64 presses at each chord and lifts just before the next, except in B, which stays dry.
- **Bass.** Upright. A two-feel in A, ending each bar on a chromatic approach to the next root, and walking quarters in B, approaching from above when the next root is lower. The turnaround walks A2–E2–C♯2 into the intro's D2.
- **Strings.** Three-note chords voiced to move by step, swelling through CC11 from 60 to 112 and back to 80 on each chord, with CC1 vibrato that blooms on the held note. In B they move up an octave, and on the turnaround they swell into the loop point.
- **Drums and percussion.** Two kit tracks. The drums play hats and backbeat in A, ride and side stick in B, and thin out in the outro. The percussion track plays sixteenth-note shaker accented on the offbeats, a light conga pattern with fills at phrase ends, triangle at section starts, and tambourine in A'.

Levels are set by role and not measured.

## Toy MIDI doc gaps

- **Where the tool lives.** `/llms.txt` says the app registers its tools through `document.modelContext`, but not that they exist only on a project page, so the project list at `/` has none. The session found this from the app's source.
- **Calling the tool from a plain browser.** In a browser without WebMCP the page installs a polyfill, and calling it takes `document.modelContext.executeTool({ name: "toy_midi_eval" }, { code })`, which returns a JSON string. The docs cover a WebMCP browser and the bridge, not this.
- **Which controllers the synth plays.** The declarations name CC1, CC11, and CC64 as examples. The session confirmed from the source that the synth passes any controller to SpessaSynth.
- **Getting the project out.** The runtime has no way to produce a `SharedProject`, so a session that composes in the open app builds one by hand from `runtime.store.get()`.
- **Collapsed tracks.** `viewMode: "overview"` alone leaves a row at its full height. The session matched how share links open tracks, overview at the minimum 44 px height, after reading the share code.

The session read Toy MIDI's source for the points above, and for nothing about how to compose the piece.
