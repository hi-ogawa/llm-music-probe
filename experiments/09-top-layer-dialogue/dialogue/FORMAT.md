# How to change the song

The song is `base.json` with every command in `arrangement.txt` applied top to bottom. Never edit `base.json`. Change the song only by appending commands to `arrangement.txt`. You may also delete or rewrite lines you or the other producer wrote earlier, but say so in your message.

After editing, run `node build.mjs` in this directory. It reports any bad line, and otherwise rewrites `summary.md`, a bar-by-bar view of every track. Read the summary to check what the song is now.

Fixed: 88 bpm, 4/4, 36 bars (beats 0-144), and the rhythm section and harmony: Drums Standard, Drums Brush, Drums 808 Layer, Perc Shaker/Tamb, Bass Fingered, Bass Synth, Rhodes Keys, String Bed, Organ Layer. `build.mjs` rejects any command on those tracks.

Open: everything else. That means the tracks currently on top (Flute, MutedTrumpet, Vibes, Voice Swell) and any track you add. You may change, replace, or drop any of them, and add new ones.

## Commands

```
track <Name> <program> <gain> [kit]   new track, or replace a same-named track entirely; note lines follow
edit <Name>                           note lines that follow are added to an existing track
clear <Name> <bar> [<toBar>]          remove a track's notes in those bars (inclusive); note lines that follow are added to it
drop <Name>                           remove a track
set <Name> program|gain <value>       change sound or level
<bar> <pos>[+-offset] <pitch> <length> <velocity>    one note
# comment
```

- `program` is a General MIDI program, 0-127. Add `kit` for a drum kit (bank 128): 0 Standard, 8 Room, 16 Power, 24 Electronic, 25 TR-808, 32 Jazz, 40 Brush.
- `gain` is a linear level, 1 unchanged.
- `bar` is 1-36. `pos` is 1, 1e, 1&, 1a, 2 ... 4a. The optional offset is in beats, for example `2&+0.05` sits behind the beat.
- `pitch` is a note name with octave, C4 = 60, for example F5, Bb4, C#5. For drums use a name: kick rim snare clap hat phat ohat ltom mtom htom crash ride bell tamb cowbell bongo lbongo conga lconga cabasa maracas claves shaker, or a GM drum number.
- `length` is in beats, a decimal or a fraction such as 1/2 or 3/2. `velocity` is 1-127.

Example:

```
track Clav 7 0.5
5 2&+0.05 C5 1/4 70
5 3a+0.04 Eb5 1/4 62
set Flute program 72
clear Vibes 25 28
25 1 A5 2 55
```

## Mix and notes

```
pan <Name> <value>                    stereo position, -1 left to 1 right, 0 center; allowed on every track, including the fixed ones
```

Pan is one fixed position per track for the whole song, with no automation. Each drum kit is a single track, so you cannot pan kick, snare and hats apart within a kit, only whole tracks. The summary's track list shows each track's current pan.

`comment.md` in this directory becomes the project's comment in toy-midi: free-form text shown to whoever opens the project, recording the intent and decisions behind the track. Write it for a listener or collaborator opening the project cold.
