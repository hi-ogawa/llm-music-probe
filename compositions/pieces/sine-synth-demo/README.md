# Sine synth demo

**Demo: [open in Toy MIDI's toy-midi#1013 preview](https://fix-issue-1011-toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fsine-synth-demo%2Fcompositions%2Fpieces%2Fsine-synth-demo%2Fproject.json)**

A quick demo of Toy MIDI's own synth, which is a plain sine for now, for https://github.com/hi-ogawa/toy-midi/pull/1013, which adds it to the instrument picker. The synth is only on that PR's branch, so the link opens the branch preview. The deployed app doesn't play the synth.

A 16-bar loop in C at 84 BPM, Fmaj9, Em7, Dm9, and Cmaj9 two bars each, played twice. The lead and the sub bass are on the sine synth. The electric piano and the drums are GeneralUser presets, for comparison. To hear a lead on a SoundFont instead, switch Sine Lead to any preset in its instrument picker, then back to "Toy MIDI: Synth".

- `sine-synth-demo.mjs` writes `project.json`.
- A held sine rendered about 15 dB above the SoundFont parts, so the lead and bass gains are 0.5 and 0.35.
- Ocarina and Synth Bass 1 are the General MIDI programs used in `.mid` export.
