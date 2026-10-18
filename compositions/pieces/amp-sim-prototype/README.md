# Amp sim prototype

An offline amp sim for [Quiet-Loud in E](../quiet-loud-in-e/) and [Open E Mixolydian](../open-e-mixolydian/), to hear whether a clean DI guitar through drive and a cabinet beats General MIDI's distorted guitars before Toy MIDI builds one (https://github.com/hi-ogawa/toy-midi/issues/934). Without an amp, both pieces' Telecaster bridge parts sound like country guitar.

## Chain

`amp-sim.mjs` renders a project with Toy MIDI's offline render tool, then runs each guitar track through the amp setting its name starts with:

| Gain | Chain |
| --- | --- |
| Clean | cabinet only |
| Crunch | pre-EQ, +20 dB into a tanh soft clipper, cabinet |
| High gain | pre-EQ, two tanh stages (+24 dB, then a 1 kHz bump and +12 dB), cabinet |

- **Pre-EQ:** a 90 Hz high-pass and a 750 Hz boost, like a mid-boost overdrive pedal in front of the amp, so the low end stays tight under distortion.
- **Drive:** tanh clipping at 4× the sample rate, so the harmonics it adds above the original Nyquist frequency are filtered out instead of aliasing.
- **Cabinet:** filters standing in for a speaker, with a 75 Hz high-pass, a steep roll-off from about 5 kHz, a presence bump at 2.4 kHz, and a dip at 450 Hz. A recorded cabinet impulse response is the real version.

Each processed track is matched to its dry loudness, then gets the track's gain and pan. Every variant's mix is normalized to −16 LUFS, so the comparison is about tone, not level.

## Variants

1. `1-tele-dry`: the Telecaster bridge as written, no amp
2. `2-gm`: the guitar tracks on General MIDI's Clean (27), Muted (28), Overdriven (29), and Distortion (30) Guitar
3. `3-tele-amp`: the Telecaster bridge through the amp sim
4. `4-lespaul-amp`: the FlameStudios Les Paul bridge, from toy-midi's `soundfonts-1` release, through the same amp sim

Variants 2 to 4 also come as `-guitars`, with the guitars soloed.

## Run

```sh
node amp-sim.mjs ../quiet-loud-in-e/quiet-loud.json \
  --toy-midi <toy-midi checkout with tools/render> \
  --out /tmp/ampsim/quiet-loud \
  --lespaul FlameStudios-LesPaul-Bridge-SM-b50f761.sf3
```

The render tool is in https://github.com/hi-ogawa/toy-midi/pull/864. It needs `fluidsynth` and `ffmpeg`, and this script needs `ffmpeg` and `ffprobe`.
