# 13 Corner Store Thirds, mix fix

- Date: 2026-10-13
- Model: claude-opus-5-5

## Setup

Listening to [10 Corner Store Thirds](../10-cold-start-hip-hop/README.md) on toy-midi with GeneralUser GS (from [toy-midi#843](https://github.com/hi-ogawa/toy-midi/pull/843)), the listener heard the bass as loud against the other instruments throughout. The composing agent in 10 never heard the music, and it set velocities and track gains by reasoning alone.

This experiment tested whether measured per-track loudness points at the same imbalance the ear hears, and whether a correction taken from the numbers fixes it. It's the spike for [toy-midi#845](https://github.com/hi-ogawa/toy-midi/issues/845), which asks for loudness feedback that composing agents can use. An agent wrote a script that renders each track of the saved project on its own and measures it, then corrected two track gains from the result. The notes and velocities didn't change, and the listener preferred the corrected mix.

## Measurement and fix

[`loudness.mjs`](loudness.mjs) writes one MIDI file per track from `project-state.json`, renders each with fluidsynth and GeneralUser GS 2.0.3 (reverb and chorus off), applies the track's gain, sums the tracks, and measures integrated loudness with ffmpeg's `ebur128`. The mix measured −26.3 LUFS:

| Track           | Preset (bank/program) | Notes | Mean velocity | Gain (dB) | LUFS before gain | LUFS  | Δ vs mix (LU) |
| --------------- | --------------------- | ----- | ------------- | --------- | ---------------- | ----- | ------------- |
| Drums (808)     | 128/25                | 322   | 87            | 0.0       | −28.0            | −28.0 | −1.7          |
| Bass            | 0/38 Synth Bass 1     | 65    | 99            | −0.9      | −29.2            | −30.1 | −3.8          |
| Rhodes          | 0/4                   | 228   | 66            | −4.4      | −29.0            | −33.5 | −7.2          |
| Percussion      | 128/0                 | 513   | 51            | −5.2      | −39.7            | −44.9 | −18.6         |
| Strings         | 0/49                  | 51    | 54            | −9.1      | −31.0            | −40.1 | −13.8         |
| Vibes (harmony) | 0/11                  | 51    | 63            | −4.0      | −33.1            | −37.1 | −10.8         |
| Flute (lead)    | 0/73                  | 51    | 61            | −10.5     | −28.9            | −39.4 | −13.1         |

The bass was the loudest pitched part, 3.4 LU above the Rhodes, and the flute lead sat 13 LU under the mix. Before track gain, the bass measured about the same as the Rhodes and the flute, so the preset wasn't the cause. The levels the agent wrote were. The bass ran at velocity 99 with almost no gain cut, while the other pitched parts sat at velocity 54–66 with −4 to −10.5 dB.

[`fix-mix.mjs`](fix-mix.mjs) then set two track gains from target loudness levels. The bass came down to the Rhodes level, and the flute lead came up above the harmony parts:

| Track        | Gain before (dB) | Gain after (dB) | LUFS before | LUFS after |
| ------------ | ---------------- | --------------- | ----------- | ---------- |
| Bass         | −0.9             | −3.8            | −30.1       | −33.0      |
| Flute (lead) | −10.5            | −3.1            | −39.4       | −32.0      |

The listener compared the two on toy-midi and said the fix "sounds better".

## Notes

- The imbalance came from the agent's own mix plan. In 10's project comment it marked the flute and vibes, the hook that gives the piece its name, as "quiet", and it left the bass near default velocity with no cut. It reasoned about levels by role without hearing them, and the result buried its own hook.
- Measurement agreed with the ear here, and two gain changes were enough. Nothing in the note data shows the imbalance without rendering, which is the case for feeding rendered loudness back to the composing agent.
- The targets were a person's call (the bass level with the Rhodes, the lead about 1.5 LU above it), much like the "focus track" in commercial mix assistants. An agent given the table would need the same kind of target, and its own plan already says which part is the hook.
- Limits: fluidsynth isn't SpessaSynth, effects were off while toy-midi plays with SpessaSynth's default reverb and chorus, and LUFS weights low frequencies less, so a bass can sound louder than it measures on headphones.

## References

- [loudness.mjs](loudness.mjs): per-track render and loudness measurement
- [fix-mix.mjs](fix-mix.mjs): applies target levels as track gains, and writes the fixed project and share links
- [share-link.md](share-link.md): the fixed mix as a toy-midi share link
- [10-cold-start-hip-hop](../10-cold-start-hip-hop/README.md): the original session and project
- [toy-midi#845](https://github.com/hi-ogawa/toy-midi/issues/845): per-track loudness feedback for agents
