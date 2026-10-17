# Mixolydian Quest

A 32-bar AABA game loop in D Mixolydian, 128 BPM, 4/4, made in Toy MIDI. Loop range covers all 32 bars and is enabled, with locators at A1, A2, B and A3.

**[Open in Toy MIDI](https://toy-midi.hiro18181.workers.dev/draft?src=https%3A%2F%2Fraw.githubusercontent.com%2Fhi-ogawa%2Fllm-music-probe%2Fmain%2Fcompositions%2Fpieces%2Fmixolydian-quest%2Fproject.json)**

`build.mjs` generates the project and the link.

## Plan

| Bars | Section | Harmony | Lead | Groove / arrangement |
|---|---|---|---|---|
| 1–8 | A1 | D D C G D D C·G D | Hook riff ending on C♮, sequence a step down in bar 3 | 808 straight beat, octave bass, 16th up-arp on clavinet (L), DX EP stabs (R) |
| 9–16 | A2 | same, bar 16 pickup into B | Riff plus a unison calliope double, high variation in bar 14 | same plus fill into B |
| 17–24 | B | G F F C G Em C G | Hook in augmentation, a tonal sequence (G→F), then fragmentation and diminution | half-time drums, Juno-style pad, gated down-arp, EP out, octave double below |
| 25–32 | A3 | D D C G D D C G → loops to D | Riff with an octave double above, inverted riff in 29–30, pickup in 32 leading back into bar 1 | double-time drums, everything in |

## Technique checklist

| Technique | Bars |
|---|---|
| Mixolydian and double-plagal cadences | C–G–D (♭VII–IV–I) at 3–5, 7–8, 11–13, 15–16, 27–29. Bars 31–32 (C–G) resolve into bar 1 across the loop. In B, F–C–G at 18–21 is the same move in G. |
| Modal color tone | The C♮ ♭7 over D ends the hook at 1, 5, 9, 13, 25, appears in the pickups at 16 and 32, and sits in the D voicings throughout. The B section's F♮ over G is the same color in G (18, 20). |
| Instrumental riff hook | 1, 5, 9, 13, 25, with a high variant at 14 |
| Sequence | Hook a step down at 3, 11, 27. The augmented hook moves G→F at 17–18 → 19–20 |
| Motivic transformation | Augmentation 17–20, fragmentation and diminution 21–22, tonal inversion 29–30 |
| Arpeggiation | 16th up-arp 1–16, gated eighth down-arp 17–24, up-down 25–32 |
| Octave and unison doubling | Calliope double (GM 82) under the saw lead (GM 81): in unison 9–16, an octave below 17–24, an octave above 25–32. The bass alternates octaves throughout. |
| Era-signifier timbres | DX EP stabs (GM 5) in the A sections, clavinet arp (GM 7) throughout, Juno-style polysynth pad (GM 90) 17–32, TR-808 kit throughout |
| Drum-machine kit identity | TR-808 kit (bank 128, program 25), both drum tracks, all 32 bars |
| Half-time feel | 17–24, with the snare only on 3, quarter-note hats, and the bass halved |
| Double-time feel | 25–32, with the snare on every offbeat eighth and 16th hats |
| Octave bass | Eighths 1–16 and 25–32, a half-time version 17–24 |
| AABA | A1 1–8, A2 9–16, B 17–24, A3 25–32. The bar 32 tom fill and lead pickup run into bar 1's crash. |
| Panning plan | Center: lead, bass, kick and snare. Left: arp −0.6, pad −0.25. Right: EP +0.5, hats +0.35, double +0.2. |

## Notes

- Leads avoid GM 80 Square Wave, because in the bundled A320U.sf2 it stacks two fine-tuned layers and sounds detuned.

- Double-time in bars 25–32 is taken literally, so the backbeat moves twice as often. The kick lands on every beat and the snare on every offbeat eighth, which gives a galloping "boss battle" feel.
- Tracks use a D major key signature (2 sharps), so every C in the score carries a natural sign.
