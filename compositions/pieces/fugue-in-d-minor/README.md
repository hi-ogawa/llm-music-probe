# Fugue in D minor

**[▶ Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Ffugue-in-d-minor%2Fproject.json)**

An original three-voice fugue in D minor in Baroque style, for church organ. It has 29 bars in 4/4 at 54 BPM, which is about 2:08. The piece fills a gap in the catalog, because no other piece is real counterpoint. It has all the standard parts of a fugue: an exposition with a tonal answer and a countersubject, episodes built from fragments of the subject, middle entries in F major and G minor, a stretto, and a final entry over a tonic pedal that ends on a D major chord.

## Files

- `project.json`: the piece as a Toy MIDI `SharedProject`.
- `fugue-in-d-minor.mjs`: the generator. `node fugue-in-d-minor.mjs` writes `project.json` next to it. Each voice is written in a compact note-name notation, with beat markers that fail when a bar is miscounted.

## How it was made

A brainstorm session about Toy MIDI compositions briefed this piece. The brief asked for a three-voice fugue in D minor with each voice on its own track, harpsichord or organ, the standard fugue sections, no parallel fifths or octaves, and a length of 2 to 3 minutes.

The session wrote the voices in a note-name notation and checked them with a script for parallel fifths and octaves, voice crossing, awkward leaps, and dissonances on the beat. It fixed what the script found and reviewed the remaining dissonances by hand. Then it built the project in the built-in browser through `window.toyMidi.runtime`, played it, and rendered the mix to confirm that every section makes sound. Nobody has listened to it yet.

## Form

The subject is two bars long, starting in the alto:

```
D4 A4 | Bb4. A4 G4 F4 | E4 F4 G4 E4  F4 G4 A4 F4 | E4 D4 C#4 E4 | D4
```

It opens with a leap from tonic to dominant, falls through a dotted figure, and then climbs in sixteenth-note "turns" (E-F-G-E, F-G-A-F) before it cadences through the leading tone. The answer is tonal, so the opening D-A is answered A-D instead of A-E, and the rest moves up a fifth into A minor.

| Bars | Section | Key | What happens |
|---|---|---|---|
| 1–2 | Exposition | D minor | Subject alone in the alto. |
| 3–4 | Exposition | A minor | Tonal answer in the soprano, with the countersubject in the alto. |
| 5 | Codetta | A minor → D minor | The soprano climbs on the turn figure over the alto and cadences on C♯ back into D minor. |
| 6–7 | Exposition | D minor | Subject in the bass, with the countersubject above it in the soprano and a free alto. |
| 8–10 | Episode 1 | D minor → F major | Sequence falling by fifths. The alto has the turn figure, the soprano holds prepared sevenths, and the bass walks in quarter notes. |
| 11–12 | Middle entry | F major | Subject in the alto, with the countersubject below it in the bass. |
| 13–15 | Episode 2 | F major → G minor | Rising sequence on the subject's head in the soprano, with the turn figure in the alto. |
| 16–17 | Middle entry | G minor | Subject in the bass, with the countersubject in the alto. |
| 18–20 | Episode 3 | G minor → dominant of D minor | A chain of 7–6 suspensions in the soprano over a bass that steps down, with the turn figure upside down in the alto. |
| 21–24 | Stretto | D minor | Subject in the bass at bar 21, in the alto three beats later an octave higher, and in the soprano at bar 23, where it reaches B♭5. |
| 25 | Dominant pedal | D minor | The bass holds A under a cadential 6/4. |
| 26–29 | Final entry | D minor → D major | Subject in the alto over a tonic pedal on D, with the countersubject in the soprano. It closes with iv and V over the pedal and ends on a D major chord. |

## The parts

All three tracks use church organ (GM program 19). The brief allowed harpsichord too, but organ sustains, so the tied suspensions and the 15-beat tonic pedal really hold, and the bass can act as a pedal part. Every track uses velocity 90, unity gain, and a key signature of D minor.

| Track | Range | Pan | Role |
|---|---|---|---|
| Soprano | F4–B♭5 | −0.3 | Answer, countersubject in bars 6–7 and 26–27, stretto entry, suspension chains |
| Alto | B♭3–D5 | +0.3 | First subject entry, countersubject, turn-figure sequences, final entry |
| Bass (pedal) | D2–B♭3 | 0 | Enters at bar 6. Subject in D minor and G minor, countersubject in F major, walking bass, both pedal points |

The countersubject moves in eighths and quarters while the subject holds, and it holds while the subject runs in sixteenths. It is invertible at the octave because it moves mostly in thirds and sixths with the subject, so it works above the subject in bars 6–7, 16–17 and 26–27 and below it in bars 11–12.

The checking script reports no parallel fifths or octaves and no voice crossing. It flags two hidden fifths between soprano and bass inside the Episode 2 sequence, which were kept. The dissonances on the beat are prepared suspensions, chord sevenths, or clashes against a pedal.

## Toy MIDI doc gaps

- The full Score Viewer is disabled for unsaved drafts. The "Open score viewer" link in the score preview is `aria-disabled`, and the docs don't say so. The session could only check the score in the track's score preview, because the brief said not to save the project.
- The score preview draws every MIDI track on a bass clef with tablature, so the soprano sits on ledger lines. Changing `tabOpenStringPitches` changed the tab numbers but not the clef, and the docs don't say whether the clef can be set.
