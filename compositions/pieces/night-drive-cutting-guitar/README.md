# Night Drive in D♭, cutting guitar iteration

**Demo: [open v6 in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv6-telecaster.json)** (latest, which plays the bundled Telecaster; [v5](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv5-binary-verse.json), [v4](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv4-verse-chks.json), [v3](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv3-cutting-port.json), [v2](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv2-stroke-simulation.json), [v1](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv1-as-written.json)). Up to v5, Toy MIDI plays GeneralUser, not the FSBS renders.

Spin-off: a fresh guitar loop, Interlock in E, at https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/interlock-in-e

Iterating by ear on Night Drive in D♭'s clean cutting guitar (Toy MIDI catalog), toward a convincing electric guitar. Context and plan: https://github.com/hi-ogawa/toy-midi/issues/861 ("Next experiment: an electric guitar font"). The Clichê iteration log is the model for this one: https://github.com/hi-ogawa/llm-music-probe/tree/main/compositions/pieces/cliche-guitar

Each version is a full project file here (`vN-<slug>.json`) with a Toy MIDI link, for reviewing the notes on the piano roll. Toy MIDI couldn't load another SoundFont until #852, so up to v5 it plays GeneralUser. The FSBS renders are posted as MP3s in the Discord thread, not kept here.

## Setup

- Project: the catalog's `night-drive-in-db.json`. The guitar is "Guitar (clean cutting)".
- Fonts: GeneralUser GS (toy-midi's bank) and FreePats [FSBS Electric Guitar Clean](https://freepats.zenvoid.org/ElectricGuitar/clean-electric-guitar.html), CC0, the full 129 MiB version. It has a single preset and no mute samples.
- `render.mjs`: `node render.mjs <project.json> --sf2 <default font> --out <dir>`. It renders each track with fluidsynth (default reverb and chorus on), applies gain and pan, mixes, and prints per-track LUFS. A track with an `sf2` field uses that font. Normalize for listening with `ffmpeg -i <dir>/00-mix.wav -af loudnorm=I=-16:TP=-1.5 -b:a 192k out.mp3`.
- `rhythm-section-*.json`: Rhodes, guitar, both basses, and drums, with the guitar on each font. FSBS samples are about 7 LU hotter at the same gain, so the FSBS guitar's gain is lowered to match GeneralUser's loudness. Level-match every guitar comparison.
- A track's `nrpn` field (such as `{ "38": -1000 }`) offsets a SoundFont generator on its channel through SoundFont NRPN. Generator 38 is the volume envelope release, at 2 timecents per step.
- `stroke.mjs`: `node stroke.mjs <in project.json> <out project.json> [--fsbs]`, the stroke simulation from iteration 2. Without `--fsbs` it writes a plain Toy MIDI project, and with it the guitar tracks get the FSBS font and release offsets for rendering.
- `cutting.mjs`: `node cutting.mjs <in project.json> <out project.json> [--fsbs]`, the Interlock cutting port from iteration 3.
- `muted-fill-spike.mjs`: an early muted 16th fill experiment. Bars 9–23 already play every 16th, so the fill only touches bars 1–8.

## The part as written

Bars 1–8 have sparse stabs. From bar 9 on, it plays every 16th on a 3-note top-string grip (such as Ab4 Bb4 Db5). Every stroke uses the same grip, lengths are 0.18 beat on the accented `&` and 0.08 elsewhere, every roll is 11 ms, the accent sits on the `&` in every bar, and the upstrokes on `e` and `a` land slightly late (6 ms). The non-accent strokes are soft pitched chords (velocity 33–60), not mutes. The upstrokes roll middle, top, bottom (such as Bb4, Db5, Ab4), so they are neither a downstroke nor an upstroke.

FSBS ignores short notes. Its release takes about 250 ms to fall 20 dB and 425 ms to fall 40 dB whether the note lasts 11 ms or 44 ms, so the 0.08-beat ghost strokes ring for about a quarter second. Shortening notes can't fake a mute, but a release offset can: `nrpn: { 38: -2800 }` brings a 22 ms note down 40 dB in about 45 ms, and `-1000` in about 165 ms.

## Iteration

1. **As written, GeneralUser program 27 vs FSBS** ([`v1-as-written.json`](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv1-as-written.json), rendered with the rhythm section and level-matched). Feedback: the FSBS sample is better. **Kept**: FSBS as the guitar font.
2. **Stroke simulation** ([`v2-stroke-simulation.json`](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv2-stroke-simulation.json), made by `stroke.mjs`). The guitar splits into two tracks:
   - Open: the accents and every stab in bars 1–8, all strings choked together at the written length. On FSBS it gets a release offset of -1000.
   - Muted: the non-accent 16ths in bars 9–23 as faked left-hand mutes, with 22 ms notes. On FSBS it gets a release offset of -2800. Downstrokes add a fourth string below the grip, and upstrokes hit only the top 2 strings.

   Every stroke is re-rolled. Downstrokes on even 16ths go low to high, and upstrokes go high to low. Spreads are about 18 ms on accents, 12 ms on other open stabs, 8 ms on muted downstrokes, and 5 ms on muted upstrokes. Velocity tapers by about 8 across each stroke, with ±4 ms timing jitter and ±4 velocity jitter, and the written upstroke push stays. The muted track is 6 dB up (my guess, because the short strokes lose most of their energy). For the FSBS render, both tracks are scaled so the guitar matches v1's -34.3 LUFS. Rendered with the rhythm section, plus v1 and v2 guitar solo for a close listen. Feedback: pending.
3. **Interlock cutting ported back** ([`v3-cutting-port.json`](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv3-cutting-port.json), made by `cutting.mjs` from `v1-as-written.json`). The Interlock in E loop showed that cutting works once the writing is guitar-like, even on Toy MIDI's GeneralUser playback, so Night Drive's problem is more likely its phrasing than its font. Changes, guitar only:
   - Grips: each chord keeps its written pitch classes, revoiced as a 3-note grip on the G, B, and e strings within a 4-fret span, picked to move least from the previous grip. The written grips leap around, up to an octave between chords, and sit in the Rhodes's register (Eb3–B4).
   - Rhythm in bars 9–23: the Interlock grids instead of every 16th with an accent on every `&`. Syncopated open accents, muted chks for the rest (GeneralUser program 28 in Toy MIDI, FSBS with a short release in the render), and air strokes. The chord timeline stays as written, including its anticipations on the last 16th.
   - Bars 1–8 keep their stab rhythm on the new grips, and the closing chord stays as written.

   Rendered with the rhythm section, plus guitar solo, level-matched to v1 (-34.3 LUFS). Feedback: pending.
4. **Verse chks** ([`v4-verse-chks.json`](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv4-verse-chks.json), `cutting.mjs`). v3 left the verse (bars 1–8) as bare stabs with no mutes. v4 adds light muted downstrokes on the 8ths the stabs leave free, so the verse stays lighter than the chorus's full grid. Rendered with the rhythm section, level-matched. Feedback: better, but the phrasing is still odd. The written verse stabs grade open strokes by velocity only, such as beat 4 as x-xx with all three ringing, which is keyboard thinking. A guitar marks the rhythm by which strokes ring and which are muted, such as X-xo or X-ox. I had inherited the written stabs as intentional.
5. **Binary verse articulation** ([`v5-binary-verse.json`](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv5-binary-verse.json), `cutting.mjs`). In bars 1–8, only the written accents and the last-16th push into each chord change ring open, and every other written stab becomes a muted chk. Bar 1's beat 4 is now X-xo. Rendered with the rhythm section, level-matched. Feedback: this is it. **Kept**: v5 as the cutting part. The takeaway for guitar writing in MIDI: phrase cutting with open versus muted strokes, not velocity steps, keep the grips in one position, and leave the hand moving in 16ths between accents.
6. **Telecaster in Toy MIDI** ([`v6-telecaster.json`](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fnight-drive-cutting-guitar%2Fv6-telecaster.json), made by `telecaster.mjs` from `v5-binary-verse.json`). Toy MIDI now bundles the FlameStudios Telecaster (toy-midi#852), so v6 plays both guitar tracks on its bridge pickup, which has the sharp attack cutting wants. The notes and track gains are v5's.
   - The open strokes use the Standard preset. Its release falls about 13 dB in the first 75 ms after a note-off, where program 27's falls about 25 dB, so the choked accents would ring into the chks. CC 11 fades each stroke to 0 over 30 ms after its note-off and comes back at the next note-on, as in Quiet-Loud in E's `quiet-loud-swell-cut.json`.
   - The chks use the Muted preset, whose real mute samples die faster than program 28's, so they need no cut.

   Rendered with `toy-midi render-audio` against v5, as the full mix and the guitars alone. Feedback: pending.

## Ideas queued

Dead vs open contrast, upstrokes on the top strings, and varied rolls went into iteration 2.

1. Optionally, vary the accent placement, such as an `a` that anticipates the next beat.
2. Chorus on the guitar channel (CC93), the classic city pop cutting sound, perhaps with less reverb send (CC91).
3. Light compression on the guitar, so the ghosts sit closer to the accents.
