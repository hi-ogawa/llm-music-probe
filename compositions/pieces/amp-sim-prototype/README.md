# Amp sim prototype

An offline amp sim for [Quiet-Loud in E](../quiet-loud-in-e/) and [Open E Mixolydian](../open-e-mixolydian/), to hear whether a clean DI guitar through drive and a cabinet beats General MIDI's distorted guitars before Toy MIDI builds one (https://github.com/hi-ogawa/toy-midi/issues/934). Without an amp, both pieces' Telecaster bridge parts sound like country guitar.

## Chain

`amp-sim.mjs` renders a project with Toy MIDI's offline render tool, then runs each guitar track through the amp setting its name starts with. Each call writes one variant as a mix and as the guitars soloed, both normalized to −16 LUFS, so a comparison is about tone, not level. Each processed track is matched to its dry loudness, then gets the track's gain and pan.

| Gain | v1 | v2 |
| --- | --- | --- |
| Clean | none | light compression |
| Crunch | pre-EQ, +20 dB into tanh | pre-EQ, compressor, asymmetric tanh at +18 dB, then a second stage at +6 dB |
| High gain | pre-EQ, two tanh stages | pre-EQ, harder compressor, asymmetric tanh, then two more tanh stages |

- **Pre-EQ:** a 90 Hz high-pass and a 750 Hz boost, like a mid-boost overdrive pedal in front of the amp, so the low end stays tight under distortion.
- **Compressor (v2):** keeps a decaying note pushed into the clipper. On a held note through high gain, v1 fades about 15 dB over 6 seconds as the note cleans up, while v2 holds within about 4 dB.
- **Note gate (`--note-gate`):** the input to the amp stays open while a note is held and closes over 30 ms after its note-off, like the fretting hand letting go of the string. Without it, the compressor and drive raise each note's decay after note-off to full distortion, so sustain leaks across the phrasing. On muted and open riff tracks, the level after note-off drops from 7 to 13 dB below the notes to 36 to 40 dB below. A gate on the audio level, as on a real high-gain rig, didn't help here, because the leaking decay sits between about −30 and −50 dB, where cutting it would also cut a held note's sustain.
- **Asymmetric clipping (v2):** a DC offset before the first clipper adds even harmonics, like a tube stage.
- **Drive:** tanh clipping at 4× the sample rate, so the harmonics it adds above the original Nyquist frequency are filtered out instead of aliasing.
- **Cabinet:** with `--ir`, a convolution with a recorded cabinet impulse response. Without it, filters stand in for a speaker: a 75 Hz high-pass, a steep roll-off from about 5 kHz, a presence bump at 2.4 kHz, and a dip at 450 Hz.
- **Room (`--room`):** a few early reflections, because a fully dry distorted guitar sounds small next to a recorded one.

## Run

```sh
node amp-sim.mjs ../quiet-loud-in-e/quiet-loud.json \
  --toy-midi <toy-midi checkout with tools/render> --out /tmp/ampsim/quiet-loud \
  --tag v2-ir --amp v2 --note-gate --ir <cabinet.wav> [--room] [--sf2 <guitar font>]
node amp-sim.mjs ../quiet-loud-in-e/quiet-loud.json \
  --toy-midi <toy-midi checkout with tools/render> --out /tmp/ampsim/quiet-loud \
  --tag gm --gm
```

`--gm` renders the guitar tracks on General MIDI's Clean (27), Muted (28), Overdriven (29), and Distortion (30) Guitar instead, as the baseline. `--sf2` swaps in another guitar font, such as the FlameStudios Les Paul bridge from toy-midi's `soundfonts-1` release.

The cabinet IR used so far is a Marshall 1960A 4×12 with an SM57, `45oa4x12-sm57-1in-1.5c.wav` from https://github.com/fnpngn/IR, a collection of freely shared IRs. It isn't committed here, because its license doesn't say it can be redistributed.

The render tool is in https://github.com/hi-ogawa/toy-midi/pull/864. It needs `fluidsynth` and `ffmpeg`, and this script needs `ffmpeg` and `ffprobe`.
