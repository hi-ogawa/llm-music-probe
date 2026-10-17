# Glass Hook, clean guitar lick with designed bends

**Demo: [open v12 in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffe081664cb36bb42e6587ef4796c099a%2Fraw%2Fv12-bass-climb.json)** ([v11](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffe081664cb36bb42e6587ef4796c099a%2Fraw%2Fv11-rhodes.json), [v10](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffe081664cb36bb42e6587ef4796c099a%2Fraw%2Fv10-b-harmony-below.json), [v9](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffe081664cb36bb42e6587ef4796c099a%2Fraw%2Fv9-loop-dovetail.json), [v7](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffe081664cb36bb42e6587ef4796c099a%2Fraw%2Fv7-a2-run-harmony.json), [v5](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffe081664cb36bb42e6587ef4796c099a%2Fraw%2Fv5-b-harmony.json), [v4](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffe081664cb36bb42e6587ef4796c099a%2Fraw%2Fv4-a2-double.json), [v3](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffe081664cb36bb42e6587ef4796c099a%2Fraw%2Fv3-arrangement.json), [v2](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffe081664cb36bb42e6587ef4796c099a%2Fraw%2Fv2-no-ghosts.json), [v1](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fgist.githubusercontent.com%2Fhi-ogawa-agent%2Ffe081664cb36bb42e6587ef4796c099a%2Fraw%2Fv1-glass-hook.json)) (plays GeneralUser without the bends, not the Telecaster render)

A short clean guitar hook in E minor at 90 BPM (Cmaj7 D6 Em9 Bm7), Polyphia-flavored: a melodic phrase that is mechanically precise, with bends designed into the phrase rather than played expressively. Context: https://github.com/hi-ogawa/toy-midi/issues/861. It follows the bend test (https://gist.github.com/hi-ogawa-agent/799f6bebab89cfaed6b03cc10b4f2c4c), where a calm ballad solo stayed hard for MIDI even with bends, because the held notes carry what MIDI can't fake. The direction here is to pick a phrase style MIDI can carry, instead of making one part carry everything.

The renders are MP3s in the Discord thread, not kept here.

## Setup

- Lead font: the [FlameStudios Telecaster bridge pickup](https://github.com/gdm-2112/electric-guitar-soundfonts/tree/main/SF3/FlameStudios) SF3 (GPL), for a brighter, tighter clean tone than the neck default. The project keeps GM 27 for the lead (and v1 GM 28 for ghosts), and the render maps them to the font's Standard (and Muted) presets.
- Backing on GeneralUser: a half-time trap groove (kick on 1 and the "and" of 2, clap on 3, 16th hats with 32nd rolls), a sub bass on the roots (GM 38), and a quiet pad (GM 89).
- `lick.mjs` writes the v1 and v2 lick test, and `demo.mjs` writes the arranged demo from v3 on. Rendering uses `render.mjs` from the Night Drive gist (https://gist.github.com/hi-ogawa-agent/348fb1c97dfb6be73254543ce1714081), which expands `art` (h, p, b, r) into pitch bend.

## Iteration

1. **Hook with designed bends** (`v1-glass-hook.json`). Written from the fretboard as string and fret.
   - Bars 1 and 3: a string-skipping arpeggio on G-B-e with notes ringing across strings, rising into B string 15 (D5) bent a whole step to E5 in 90 ms, released, and pulled off, then a legato descent.
   - Bars 2 and 4: sextuplet runs, one pick and two legato notes per string. Bar 2 descends from D5 and answers with an A-B-A trill. Bar 4 climbs to the peak, e string 12 (E5) bent to F#5, the 5th of Bm7.
   - Muted ghosts on the last 16th before a new phrase (dropped in v2).
   - Notes ring until their string plays again. Pitch bend is channel-wide, so any legato or bent note cuts the other ringing strings first, as a player mutes them while bending.

   Feedback: the fast, technical side went further than intended (it didn't need to copy Polyphia's speed), but it was pulled off. The bends work: a mechanically justified bend, landing in time on a designed target in a precise phrase, is good evidence that MIDI pitch bend helps articulation. **Kept**: the designed-bend idea.

   Later feedback: a mysterious mute in the middle, which isn't working. The muted ghosts came from the funky 16th lead, where the picking hand keeps moving through every 16th. Here the line has no running 16ths, so they're isolated clicks, the same mistake as in the bend test's v2. Also, the first note seemed missing: timing jitter put it 3 ms before beat 0, which Toy MIDI's loop skips. The MP3 renderer clamps it to 0, so the render had it. **Dropped**: the ghosts.
2. **No ghosts** (`v2-no-ghosts.json`). v1 without the muted ghosts, and note starts clamped at beat 0. Feedback: pending.
3. **Arrangement** (`v3-arrangement.json`). The lick grown into a looping 28-bar demo: Intro 4, A 8, B 8, A' 8. The hook is unchanged, and this take changes the arrangement around it. The second guitar comes next, as its own take.
   - Intro: Rhodes (GM 4) arpeggiates the A chords alone over 8th hats and a rim click, with a snare build into A.
   - A: the v2 hook twice over the same trap groove and sub bass, plus Rhodes stabs locked to the bass rhythm, and an open hat every second bar.
   - B (new): Am9 Bm7 Cmaj7 D6 | Am9 Bm7 Cmaj7 B7. A calmer guitar melody, mostly 8ths, that reuses the hook's two designed bends (B15 D5 to E5, e12 E5 to F#5) and adds G14 A4 to B4. The B7 bar ends E5 bent to F#5, released, and pulled off to D#5, the leading tone back into the hook. Drums thin to 8th hats with a soft shaker, the Rhodes holds half notes, and a tom fill closes the section.
   - A': A again with a vibraphone (GM 11) on two high chord tones per bar above the guitar, and a crash on the downbeat.
   - Improvised: the B section's progression and melody, the Rhodes, vibraphone, shaker, and tom fill, and the section locators.

   Feedback: sounds good. **Kept.**
4. **A' double** (`v4-a2-double.json`). A second guitar doubles the hook in A' only, so the hook's return gets its lift from the guitars. A and B stay single-tracked, and every other track is identical to v3.
   - The double is a separately played take on its own track, because pitch bend is channel-wide. It runs about 14 ms late with its own timing jitter, its own velocities (4 softer on average), and its own bend times (±10 ms).
   - The double renders on the FlameStudios Les Paul bridge font (the Tele bridge plus LP bridge pair from #861), about 2 LU under the lead in A'.
   - Panning: the lead moves from 0.1 to -0.2 and the double sits at 0.4. The vibraphone moves from 0.3 to -0.4, out of the double's side.

   Feedback: approved, go on to the B harmony. **Kept.**
5. **B harmony** (`v5-b-harmony.json`). On B's second pass, guitar 2 (the same Les Paul track as the A' double, panned opposite the lead) harmonizes the melody's held and landing notes a diatonic third above, so B builds into the hook's return. Guitar 2 plays only the held notes, not every melody note, and it's about 3 LU under the lead there. Everything else is identical to v4.
   - Where the melody bends, the harmony bends too, by the interval that keeps it in key: over D5 bent to E5 (Bm7) it bends F#5 a half step to G5, and over the B7 bar's E5 bent to F#5 it bends G5 a whole step to A5, then pulls off to F#5 over the melody's D#5.
   - The Cmaj7 bar's pull-off run goes B5 A5 G5 over G5 F#5 E5, the highest point of the piece (e string 19).
   - Guitar 2 has its own random stream for timing, velocity, and bend speed, so the A' double is unchanged.

   Feedback: the idea is fine, but the takes so far treat "more is better", adding a layer per section like a beginner. Two pointed questions about my intent:
   - The vibraphone counter in A' was the part he liked, so why hold it out of the first A? My reason was to save a layer for A's return, which is exactly that layering habit, and A' already lifts from the second guitar. → v6.
   - Unison in A' is fine but under-uses the second guitar. Bar 21's chordal arpeggio shines doubled, but bar 22's single-note run down would work better harmonized in thirds or sixths. The unison was my default double-tracking move, not a choice made for the runs. → v7.

   **Kept**: the B harmony.
6. **Vibes in A** (file removed, the change lives on in v7). The vibraphone counter now plays in the first A too, not only A'. Everything else is identical to v5. Feedback: pending.
7. **A' run harmony** (`v7-a2-run-harmony.json`). On top of v6, guitar 2 in A' keeps the unison double on the odd bars (the chordal arpeggio and bend) and harmonizes the even-bar runs a diatonic third below, so the Tele stays the top voice. Each harmony is fingered on its own strings, with the same pick and legato pattern as the lead.
   - Bar 22 (D6): B4 A4 G4, F#4 E4 D4, C4 B3 under the descending run, then F#4 G4 F#4 under the A-B-A trill.
   - Bar 24 (Bm7): the ascending run in thirds below, and the peak bend paired: C5 bent to D5 under E5 bent to F#5, released, and pulled off to B4 under D5.
   - The harmony has its own random stream, so the unison bars keep v4's timing.

   Feedback: the even-bar harmony in the last hook is killer. **Kept**, along with v6's vibes in A. Next ask: section boundaries feel terse with only a drum fill marking them, so craft transitions from the backing's rhythm, and the loop from the last bar back to the intro is too abrupt. → v8 and v9.
8. **Transitions** (file removed, the change lives on in v9 until v10 reverted it). Each section boundary gets its own backing gesture instead of only a drum fill. The guitars are unchanged.
   - Intro to A, a push: the Rhodes, sub bass, and a kick play A's first chord (Cmaj7) on the "a" of 4, a 16th early, tied over the downbeat. The snare build stops a 16th short to make room.
   - A to B, a stop: in A's last bar the band hits beat 3 together (clap, snare, a short bass and Rhodes stab) and drops out. The guitar's last notes and the vibraphone ring alone into the calmer B.
   - B to A', a build: on B7's beats 3 and 4, the bass and Rhodes pump 8ths with a crescendo under the tom fill.
   - Housekeeping: the drums and intro keys now have their own random streams, so changing a backing part no longer shifts the guitars' jitter. That reshuffled the lead's, Rhodes', and drums' timing and velocity jitter once (±3 ms, ±4 velocity).

   Feedback: pending.
9. **Loop dovetail** (`v9-loop-dovetail.json`). On top of v8, the last bar of A' already starts the intro's texture, so the loop continues a running figure instead of falling off a density cliff. Under the hook's last bar the band falls away: one kick on 1, the bass holds the B root, the drums switch to the intro's 8th hats and rim, and the Rhodes plays the intro arpeggio on Bm7. The guitars and vibraphone are unchanged. The Discord MP3 renders the intro again after A' so the seam is audible.

   Feedback: the loop connection is good, **Kept**. The other boundary ideas (v8's push, stop, and build) sound musically bad, so revert them. Also, guitar 2 harmonizing a third *above* in B pushes too many upper notes, which is unbalanced in tone and orchestration, so try a third or sixth below. Asked to stop splitting iterations into pairs, and to delete the even intermediates (v6, v8). → v10.
10. **B harmony below** (`v10-b-harmony-below.json`). v9 with v8's boundary gestures reverted (the intro's snare build and B's tom fill are back as the only fills, and the dovetail stays), and guitar 2 in B's second pass moved from a third above the melody's held notes to a third below. The Tele stays the top voice and guitar 2 becomes an inner voice, the same move as the A' runs. A third rather than a sixth below, because a sixth would put guitar 2 around C4 to B4, against the Rhodes.
    - Bm7: B4 bent a half step to C5 under D5 bent to E5, then D5 C5 B4 under F#5 E5 D5.
    - Cmaj7: E5 D5 C5 pull-offs under G5 F#5 E5. The piece's top note is back to the lead's G5.
    - B7: D#5 B4 under F#5 D#5, then B4 bent to C#5 (the 9th) under E5 bent to F#5, resolving to F#4 under the D#5 lead-in. The note under B4 is F#4, a fourth rather than a third, because G would clash with B7.
    - Guitar 2 sits about 4.7 LU under the lead in B, as an inner voice.

    Feedback: the Rhodes could come up, and in B's first pass an arpeggio-like phrase may work better than plain long notes. → v11.
11. **Rhodes up, B phrase** (`v11-rhodes.json`). The Rhodes gain goes from 0.55 to 0.8 (+3.3 dB, now about 8 LU under the mix instead of 11). In B's first pass it breaks each chord in a 3+3+2 16th phrase per half bar (on 16ths 0, 3, 6, 8, 11, 14, low voice first, then up and back), with notes left ringing like a held sustain pedal, a syncopated counter to the guitar's 8ths. The second pass keeps the half notes, so the guitar harmony has room. Everything else is identical to v10.

    Feedback: pending.
12. **Bass climb into A'** (`v12-bass-climb.json`). Taken from "Pre-chorus build" in the composition landscape map (https://gisthost.github.io/?ebb143c64417ed58b4e9971e4f838e4c/landscape.html): a rising bass carries the B to A' boundary instead of a drum gesture. On the B7 bar, the sub bass climbs the chord in quarters, B1 D#2 F#2 A2, with a crescendo, and A' lands on the Cmaj7 downbeat, a deceptive resolution of the B7. The tom fill stays, and everything else is identical to v11. v8's stop and build were stock "Break, build, drop" gestures in rhythm alone, while this one moves the harmony.

    Feedback: pending.
