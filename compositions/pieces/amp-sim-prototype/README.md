# Amp sim prototype

Can a clean DI guitar through a simple amp sim beat General MIDI's distorted guitars? This prototype answers that offline, before Toy MIDI builds an amp sim (https://github.com/hi-ogawa/toy-midi/issues/934). It renders [Quiet-Loud in E](../quiet-loud-in-e/) and [Open E Mixolydian](../open-e-mixolydian/), whose guitar tracks are on the FlameStudios Telecaster bridge font and named by the gain they get (Clean, Crunch, High Gain), and runs each guitar track through an amp in ffmpeg.

## Result

Yes. The final chain sustains like General MIDI's distortion, keeps the DI's pick attack, which General MIDI's samples lack, and stops cleanly between notes:

```
note gate → pre-EQ → compressor → drive (asymmetric, then cascaded stages, at 4× sample rate) → cabinet → short room
```

Each stage is there because of something heard along the way, so the iterations below are the explanation.

## Iterations

Each step changes one thing from the step before, all on the filter cabinet the chain ships with, and the cabinet itself gets its own comparison at the end. Every render is normalized to −16 LUFS, so a comparison is about tone, not level. The tags name the variants to compare, and [Reproduce](#reproduce) generates them all.

The session didn't run in this order. Its v2 round added the Marshall cabinet IR together with the amp changes, so the gate and the room were first heard with the IR. The cabinet comparison in step 6 found the IR and the filters interchangeable, and the gate was then confirmed on the filter-cabinet pair, so the steps below follow the cleaner order.

### 1. No amp: country guitar (`tele-dry`)

The Telecaster bridge pickup played clean is the classic country sound, so rock riffs on it sound like rock written for a country tone. The writing already reads as guitar, so the missing piece was the amp.

### 2. Drive (`v1` against `tele-dry`)

Pre-EQ, a fixed gain boost into a tanh soft clipper, and the filter cabinet.

**Heard:** better than clean, and the Les Paul bridge font better than the Telecaster. But General MIDI's distortion (`gm`) had the more convincing sustain, even though its samples have no pick attack.

**Why:** a fixed boost clips the start of a note, but as the DI string decays, the signal falls below the clipping point and the note cleans up. General MIDI's samples were recorded through a real amp, whose compression keeps the decaying string saturated. On a held note through high gain, v1 fades about 15 dB over 6 seconds. The font itself isn't the cause, since its samples sustain a full 6-second note.

### 3. Sustain (`v2` against `v1`)

Three changes to the amp:

- **Compressor before the drive,** which keeps a decaying note pushed into the clipper. A held note now holds within about 4 dB over 6 seconds.
- **Asymmetric first stage:** a DC offset before the clipper flattens one half of the wave more than the other, which adds even harmonics like a tube stage.
- **Cascaded stages** for high gain, each clipping a little, the way a high-gain preamp does, instead of one hard push.

**Heard:** a good addition, but sustain leaked and muddied the phrasing and articulation.

**Why:** the compressor and drive add about 40 dB of gain, so they also raise each note's decay after its note-off to full distortion, and it smears into the next note.

### 4. A gate keyed to the notes (`v2-gate-filtercab` against `v2`)

The input to the amp stays open while a note is held and closes over 30 ms after its note-off, like the fretting hand letting go of the string.

A real high-gain rig uses a noise gate on the audio level, and that was tried first, with no measurable effect. The leaking decay sits between about −30 and −50 dB, so a threshold high enough to cut it would also cut a held note's sustain. Only the note-off tells "let go" from "still holding", and Toy MIDI has every note-off, which a real amp doesn't.

| Track | Level after note-off, below the notes: v2 | with the gate |
| --- | --- | --- |
| Quiet-Loud crunch, muted | 16 dB | silent |
| Quiet-Loud high gain L | 21 dB | 43 dB |
| Open E riff, muted | 12 dB | 50 dB |
| Open E riff, open | 7 dB | 53 dB |

**Heard:** the gate is the fix, with good nuance, though the cut is unusually hard.

### 5. A short room (`v2-ir-gate-room` against `v2-ir-gate`)

A recorded guitar always carries some room, and that's what softens a note's end in real life. Here it's a few early reflections at 19 to 47 ms, after the amp, because a room before the drive would itself get distorted and smear again. Keep it short on fast parts, where a long reverb would bring the blur back. This pair was heard with the IR cabinet.

**Heard:** all good.

### 6. The cabinet: none, filters, or a recorded IR (`v2-gate-nocab`, `v2-gate-filtercab`, `v2-ir-gate`)

The same gated chain three ways. The filter cabinet is a 75 Hz high-pass, a steep roll-off from about 5 kHz, a presence bump at 2.4 kHz, and a dip at 450 Hz. The IR is a recorded Marshall 1960A 4×12 cabinet with an SM57.

**Heard:** without a cabinet it sounds fuzzed and bad. The filters and the IR sound different, but neither is clearly better in any particular way, so the filter cabinet is enough for now and a recorded IR is deferred.

**Why:** clipping adds harmonics far above what a guitar speaker reproduces. A real speaker rolls them off from about 5 kHz, so without a cabinet they come through as raw fizz. That roll-off is most of a cabinet's job, which is why the filters and the IR end up close.

## Pitfalls

Two ffmpeg details that silently broke the drive, worth knowing for an implementation:

- **Clipping before the clipper.** ffmpeg kept the 16-bit sample format through the chain, so the +24 dB boost hard-clipped before the tanh stage saw the signal. The chain runs in float.
- **Oversampling that overshoots.** `asoftclip`'s own oversample option produced peaks about 9 dB above full scale. Resampling to 4× around the drive stages explicitly is the textbook way, and it stays bounded.

## Open

- **A cabinet IR, deferred.** The Marshall IR is from https://github.com/fnpngn/IR, a collection of freely shared IRs, and isn't committed here, because its license doesn't say it can be redistributed. Step 6 found no clear gain over the filter cabinet, so an IR that Toy MIDI may ship is a later upgrade, not a requirement.
- **The gate's release.** 30 ms is a quick fretting-hand mute. 50 to 80 ms may sound more natural on open riffs.

## Reproduce

`amp-sim.mjs` renders with Toy MIDI's offline render tool from https://github.com/hi-ogawa/toy-midi/pull/864, which needs `fluidsynth` and `ffmpeg`, and the script also needs `ffprobe`. Each call writes one variant as `<tag>.mp3` and `<tag>-guitars.mp3`, with the guitars soloed.

```sh
run() {
  node amp-sim.mjs ../quiet-loud-in-e/quiet-loud.json \
    --toy-midi <toy-midi checkout> --out /tmp/ampsim/quiet-loud "$@"
}
run --tag gm --gm
run --tag tele-dry --amp none
run --tag v1 --amp v1
run --tag v2 --amp v2
run --tag v2-ir --amp v2 --ir <cabinet.wav>
run --tag v2-ir-gate --amp v2 --note-gate --ir <cabinet.wav>
run --tag v2-ir-gate-room --amp v2 --note-gate --ir <cabinet.wav> --room
run --tag v2-gate-filtercab --amp v2 --note-gate
run --tag v2-gate-nocab --amp v2 --note-gate --no-cab
```

`--amp none` leaves the guitars as rendered. `--gm` renders the guitar tracks on General MIDI's Clean (27), Muted (28), Overdriven (29), and Distortion (30) Guitar instead, and `--sf2` swaps in another guitar font, such as the FlameStudios Les Paul bridge from toy-midi's `soundfonts-1` release.
