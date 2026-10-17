# City pop from named techniques

- Date: 2026-10-12
- Model: claude-opus-5-5

## Setup

The listener asked for a city pop piece of about 24 bars in toy-midi, specified element by element in names from the [composition landscape](https://gist.github.com/hi-ogawa-agent/ebb143c64417ed58b4e9971e4f838e4c) catalog, with a bar-by-bar plan before any notes and a checklist mapping each technique to bars afterwards.

The agent was reaching the listener through Discord, so it took the share-link path from toy-midi's `llms.txt` and posted the link through a secret gist, because the link was longer than a chat message allows.

The agent read `llms.txt`, the `SharedProject` type, and the catalog, then wrote the plan and one Node script that builds the project and prints the `/draft` link. It never heard the music.

What came out was 24 bars of 4/4 at 108 bpm in D♭ major, with the final chorus in D. It has 8 tracks and about 2,000 notes: soprano sax lead, string countermelody, Rhodes, clean guitar, brass, finger bass, slap bass, and drums. The listener questioned one harmonic choice, which produced v2, and asked for a more compact track layout, which produced v3.

## Session

### 1. The brief

> compose a ~24-bar city pop piece in Toy MIDI and give me the share link. Follow https://toy-midi.hiro18181.workers.dev/llms.txt. Use technique names from the cheatsheet https://gist.github.com/hi-ogawa-agent/ebb143c64417ed58b4e9971e4f838e4c (composition-landscape.md).
>
> Elements:
>
> - Harmony: "Just the Two of Us" progression in the verse, royal road in the chorus, faster harmonic rhythm into the cadence.
> - Voicing: rootless A/B voicings on Rhodes, guide-tone voice leading.
> - Melody: sentence-form phrases, tension-note landing (9/13 on strong beats), register lift into the chorus.
> - Groove: straight 16ths with light swing, ghost notes on hats and snare, slightly laid-back snare.
> - Bass: finger line bass in the verse, slap fills in the chorus, kick–bass interlock.
> - Arrangement: drop-2 brass stabs on chorus accents, countermelody only in the second chorus.
> - Form: 8-bar verse, 8-bar chorus, final chorus a half step up, planned as one energy curve.
> - Mix: panning plan with Rhodes and guitar spread, kick/bass/lead centered.
>
> Before writing notes, write a short bar-by-bar plan. After, give a checklist mapping each technique to bars where it appears.  write a share link. Discord cuts messages at 2,000 characters, so put the link in a secret gist and post only the gist URL here.

v1:

- **Verse** (bars 1–8): G♭maj7 · F7 · B♭m7 · A♭m7 D♭7, twice.
  - The soprano sax opens low with a sentence: a 2-bar basic idea falling from the 9th of each chord (A♭–G♭–F–E♭ over G♭maj7, then G–F–E♭–D♭ over F7), the idea sequenced in bars 3–4, and half-bar fragments in 5–6.
  - A pickup run in bar 8 jumps the lead up an octave.
  - Drums go from side-stick and 8th-note hats (1–4) to full kit (5–8).
- **Chorus** (9–16): the royal road, G♭maj7 · A♭7 · Fm7 · B♭m7.
  - Harmonic rhythm goes from one chord per bar to two (13–14) to one per beat (15), then a cadence on D♭maj9 with the 9th on top.
  - Am7–D7 at the end of bar 16 sets up D, as the same v7–I7 move the verse used.
  - Brass stabs on downbeats and pushes, guitar 16ths, and slap fills at the ends of even bars.
- **Final chorus** (17–24): bars 9–16 a half step up, plus a string countermelody, ending on Dmaj9 with the 9th on top.
- F7 was voiced E♭–G–A–D♭ (7–9–3–♭13).

### 2. The whole-tone bar

> is 2nd bar whole tone melody intended? 3rd 7th with natural 9 looks hard to make it work tho may not be impossible. i'd image flat/sharp 9th is easier choice?

The agent said the whole-tone sound wasn't chosen. It came from pairing a natural 9th on beat 1 with a ♭13 put there for voice leading. It took ♯9 for v2:

- F7: E♭–G–A–D♭ → E♭–A♭–A–D♭ (7–♯9–3–♭13)
- Bar 2 melody: G–F–E♭–D♭ → A♭–G♭–F–D♭, so the A♭ that is the 9th of G♭maj7 in bar 1 returns as the ♯9 of F7
- Bar 6 melody: G–A–G–E♭ → A♭–A–A♭–F, the ♯9 rubbing against the 3rd, with D♭ still on beat 3
- ♯9 over ♭9 because A♭ is in the key and is shared with bar 1

### 3. Track layout

> ui nit, can you make track overview mode and shorter height so easy to read through on toy-midi?

v3: every track opens in overview mode at the minimum row height. No musical change.

## Notes

How the agent wrote the music:

- The music lived in one Node script in raw numbers: MIDI note numbers, start and duration in beats, and velocities. Chord names appear only in comments, the plan, and the agent's replies.
- Harmony was a table of scale-degree and chord-quality pairs, with each section's chords placed bar by bar and transposed by a tonic number, D♭ or D. The final chorus is the same function called with a different tonic.
- The Rhodes voicings were a rule. Each chord quality had fixed interval sets for an A and a B rootless form. For each chord, code picked the candidate whose voices moved least from the previous chord. That is what the plan called "guide-tone voice leading". It mostly picked B forms in the verse, so A/B alternation was weak.
- Most of the accompaniment was rules run over the chord table:
  - Bass notes sat on the kick positions with a 5th and a chromatic approach added. A rule made any hit within a 16th of a chord change take the next chord as an anticipation.
  - The slap fill was one fixed 4-sixteenth cell per chord: thumb root, popped octave, dead note, popped 7th.
  - Code built the drop-2 brass from a close voicing.
  - The guitar took the upper three voices of the Rhodes voicing on a fixed 16th accent map.
  - The groove was global offsets: +0.03 beat on every off-16th for swing, and +0.025 beat on the backbeats for the laid-back snare.
- The lead and countermelody were chosen note by note. The lead was per-bar arrays of beat, duration, and pitch from a table of named pitches, written once for the chorus and transposed up a half step for the final chorus. The countermelody was raw MIDI numbers per bar, a mostly stepwise line in contrary motion to the lead.
- The bar-by-bar plan and the technique checklist were prose and tables kept next to the script. The checklist mapped each requested name to bars, and it listed bar 2 under tension-note landing, which was true of the 9th on beat 1, while that bar sounded whole-tone. Nothing in the checklist looked at how the chosen tones combined.
- The agent printed each chord's voicing as numbers after generating, but did not read the melody against the voicings.

How the iteration went:

- The whole-tone F7 came from two separate rules, one per brief item: tension-note landing put a natural 9th on beat 1, and the III7 voicing used a ♭13 to voice-lead into B♭m7. Neither rule was about the other, and no step looked at what the two together spelled. The listener noticed it and asked whether it was intended.
- The agent reached for an altered 9th only after the listener named ♭9 and ♯9. It did add its own reason for picking ♯9, the common tone with bar 1, and wrote that up as melody-note reharmonization in the checklist.
- The agent at first called the unchosen color a bug. The listener pushed back that there is no bug in music, and the agent reworded it in its log as a color that came out by accident and was then exchanged for a chosen one.
- Where the brief and the catalog didn't line up, the agent chose and said so. The catalog has no "finger line bass", so it mapped the bass to "Syncopated funk bass". With only two choruses, it read "countermelody only in the second chorus" as the final chorus. It chose soprano sax over alto because the chorus reaches B5.

## References

- [gen.mjs](gen.mjs): the agent's script at v3, which builds the project and prints the share link. v1 differs only in the F7 voicing (`7b13` intervals with a natural 9) and the bar 2 and 6 melodies, and v2 differs from v3 only in the track layout.
- [plan.md](plan.md): the bar-by-bar plan, as revised for v2
- [checklist.md](checklist.md): the technique-to-bars checklist, as revised for v2
- [shared-project.json](shared-project.json): the v3 `SharedProject`, decoded
- [share-link.md](share-link.md): the v1, v2 and v3 share links
- [composition landscape](https://gist.github.com/hi-ogawa-agent/ebb143c64417ed58b4e9971e4f838e4c): the catalog the brief's technique names came from
- [toy-midi `llms.txt`](https://toy-midi.hiro18181.workers.dev/llms.txt): the agent guide the session started from
