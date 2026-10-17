# Orquestra de Bolso, orchestral bossa after Jobim

**Demo: [open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Forquestra-de-bolso%2Fproject.json)** (the same project as a [self-contained share link](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Forquestra-de-bolso%2Fproject.json))

A looping orchestral piece in F major at 132 BPM, inspired by bossa nova and Antônio Carlos Jobim. The brief was open: no drum kit, so the groove has to come from the orchestra, with multiple sections, a loop, and build-ups at the section boundaries. The composing session had only that prompt and the Toy MIDI agent guide (https://toy-midi.hiro18181.workers.dev/llms.txt), and it wrote the project without hearing it.

## Setup

- Every track is a General MIDI program on Toy MIDI's default GeneralUser GS font. There are 13 tracks, with flute (GM 73), oboe (68), clarinets (71), horns (60), timpani (47), celesta (8), harp (46), violins as string ensemble (48), tremolo strings (44), violas pizz and basses pizz (both 45), a slow string pad (49), and cellos (42).
- `gen.mjs` writes `project.json` and the share link. Chords are named in one table, each with a bass note, an alternate bass for the bossa pattern, and a four-note close voicing. The groove layers are generated from that chord table, while the melodies and the cello line in B are written out bar by bar.
- No optional display fields are set, such as track height or view mode, so the app's defaults apply. Each track sets gain, pan, and an F major key signature.

## Composition

### Reading of the inspiration

Jobim's signature is less the rhythm than the harmony moving under a melody that barely moves, so the piece leans on a few of his habits.

- **Minor iv over a tonic pedal.** Fmaj9 goes to Bbm6/F with three voices rising a half step while G holds (A C E G to Bb Db F G), and the same three fall a half step into Am7.
- **Chromatic voice leading.** Through Am7, Abdim7, and Gm9 the bass walks down A, Ab, G and an inner voice descends C, B, Bb in parallel. The lowest voice of the voicings mostly moves by half steps around A (A, Bb, A, Ab, A, Bb), and in A' the cellos play it, so that neighbor line is audible.
- **One note, changing meaning.** In the middle of A the tune sits on D for four bars while the chord under it changes the note's role, from the 11th of Am7 to a chord tone of Abdim7, the 5th of Gm9, and the 9th of C7. This is the idea behind Samba de Uma Nota Só, not its melody.
- **Color tones on long notes.** Held melody notes land on the maj7, the 9th, and the #11 (A over Eb9#11), and the D7b9 bar runs F# to Eb.
- **Tritone-sub turnaround.** The intro and the tag both end on Gb7#11, which falls into Fmaj9 by a half step, so the loop point resolves like one of his turnarounds.

### Form

48 bars, about 87 seconds per pass, with locators at each section.

1. **Intro (4 bars).** Fmaj9, Bbm6/F, Fmaj9, Gb7#11. The harp and pizz basses set up the groove under a soft string pad and celesta, with a small flute sigh (Db to C) over the minor iv.
2. **A (16 bars).** The flute carries the tune. Fmaj9, Bbm6/F, Am7, Abdim7, Gm9, C7b9, then Fmaj9, F13, Bbmaj9, Eb9#11, and ii-V pairs back home. The last bar is F7b9, a V of the B section's opening chord. The clarinets join halfway, and the violas pizz two bars later.
3. **B (8 bars).** Up a minor third to Ab, Bbm9, Eb13, Abmaj9, Dbmaj9#11, Bbm9, Eb9, then Gm9 and C7alt to come home. The horns sing a lyrical line, and the cellos answer with a slow counterline from below. The oboe joins the horns in unison and the violins an octave above for the second half, so B grows inside itself.
4. **A' (16 bars).** The tutti return. The violins take the tune, the flute doubles it an octave up in the second half, the horns hold guide tones, and the cellos play the voicings' lowest voice, anticipated by an eighth. The final melody note is E over Fmaj9, the maj7, held.
5. **Tag (4 bars).** Gm9 C13, Am7 D7b9, Gm9, Gb7#11. The oboe echoes the opening motif over the turnaround while the texture thins back to the intro's, and the loop restarts on the intro's Fmaj9.

### Groove without drums

The parts split a bossa guitarist's and a ganzá's jobs across the orchestra.

- **Thumb.** The pizz basses play the root on 1, the alternate bass on the "and" of 2 and on 3, and the root again on the "and" of 4. Half-bar chords use the first half of that pattern twice.
- **Fingers.** The harp plays the chord voicing in the two-bar syncopated figure, on 8ths 1, 4, and 7 of the first bar and 3 and 6 of the second.
- **Shaker.** From the middle of A on, the violas pizz alternate two inner chord tones in 8ths, with the upbeats accented.
- **Anticipation.** The clarinets hold guide-tone dyads that enter an 8th before each chord change, so the harmony pushes ahead of the beat the way bossa phrasing does.

The timpani never keep time. They only roll in the builds and hit the arrivals.

### Build-ups

The two big boundaries, A to B and B to A', each get the same layered build on the last bar.

- Tremolo strings play the dominant's voicing in two octaves as eight retriggered 8ths, with a velocity crescendo from 30 to 107.
- The timpani roll in 16ths on the dominant root (F, then C) with a crescendo, and the next downbeat gets a loud timpani hit.
- The flute runs up the dominant's scale in 16ths from beat 3 and lands on the next section's downbeat (Db6 over Bbm9, F6 under the violins' return).
- The harp glisses up the chord tones over the second half of the bar.
- Into A', the horns also climb in quarters (Bb C Db E) with a crescendo.

The boundaries into A and around the loop get only a soft harp glissando over Gb7#11, so the piece breathes out before it starts again.

### Mix

The melody carries the highest velocities (about 90 to 100) and the accompaniment sits around 40 to 70, with track gains from 0.45 (string pad) to 0.95 (violins). The harp is panned left and the violas pizz and cellos right, with the flute and violins a quarter of the way to either side. None of this was checked by ear.

## Iteration

1. **First take** (`project.json`). Everything above, written in one pass from the brief. The section design, the reading of Jobim, and the instrumentation were all the session's own choices. Before posting, the session checked that the payload matches `SharedProject` and that the gist's raw file is served with cross-origin access, but it never played the project.
   - Unheard risks: the harp's 524 notes and 0.85 gain may crowd the flute in A, and the tremolo crescendos may jump out of the mix, because velocity is the only crescendo control on sustained patches.

   Feedback: none yet.
