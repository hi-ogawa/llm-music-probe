# Rue Saint-Denis (after Roy Hargrove)

A soul-jazz riff tune in F minor, inspired by Roy Hargrove's "Strasbourg / St. Denis" from *Earfood* (2008). It is 75 bars of 4/4 at 108 BPM, about 2:47.

## Files

- `strasbourg-st-denis.json` is the project as a Toy MIDI `SharedProject`. Open it with `/draft?src=<raw url>` once it is hosted, or paste it into a share link.
- `share-link.txt` is the same project encoded as a `/draft#p=` link (about 41,000 characters, so it is too long to post in chat).
- `compose.mjs` generates both files. Run `node compose.mjs`.

## The bass figure

The bass carries the tune with a two-bar figure, shown here on F:

- Bar 1 punches: low F, an octave pop, an Eb pushed on the and of 2, the high F, then C and Eb.
- Bar 2 leaves the downbeat empty, climbs Ab-A-Bb-B-C chromatically from the and of 1, holds the C across beat 4, and picks up with a leading tone into the next root.

The silent downbeat and the chromatic climb up to the fifth are the parts you should recognize. The kick drum follows the figure's accents instead of a stock pattern, and in the heads the muted Telecaster doubles it two octaves up. On the second pass of each head, the trombone joins the climb.

## Form

| Bars | Section | What happens |
| --- | --- | --- |
| 1-8 | Intro | Bass figure with drums on side stick, then full snare, congas, and shaker. Rhodes, organ, and guitar join at bar 5. Bars 7-8 preview the Db7 to C7alt turnaround hits. |
| 9-24 | Head x2 | Eight-bar riff: Fm (call, landing on C), Fm (answer, landing on F), Bbm (call up a fourth), then Db7 and C7alt hits on 1 and the and of 2. Trumpet and tenor play the riff in octaves. Tambourine marks 2 and 4. |
| 25-40 | Solo, chorus 1 | Trumpet solo with lots of space. The harmony opens to Fm11 (4 bars), Dbmaj7#11 (2), Gm7b5, C7alt, Bbm11 (4), Gbmaj7 (2), Dbmaj7, C7alt. The bass drops to a two-feel, the drums move to ride and pedal hi-hat with feathered kick, the Rhodes comps sparsely, and the organ pads come forward. |
| 41-56 | Solo, chorus 2 | The bass walks, and the trumpet gets bluesier and denser. Tenor and trombone play guide-tone pads that swell for 8 bars, then punch on the and of 2 and the and of 4 with rimshots. Bar 56 hits C7alt and leaves room for a drum fill. |
| 57-72 | Head x2 | The riff returns with crash, backbeat, hi-hat, and tambourine. |
| 73-75 | Tag | One last call, then the whole band plays the bass climb in octaves, and the piece ends on a single Fm6/9 hit. |

## Feel and contrast

- The head's eighths swing at a 0.58 ratio, between straight (0.5) and triplet (0.67). In the solo the swing loosens to 0.64.
- The head is loud and tight, with short notes and a backbeat. In the solo the first chorus plays at lower velocities with sparse comping, and the second chorus builds through the walking bass, horn backgrounds, and busier snare comping until the riff snaps back.
- The Rhodes plays short stabs on fixed rhythmic slots. The organ's expression (CC 11) sits low under the heads and rises in the solo.

## Instruments

Trumpet (lead and soloist), tenor sax, trombone, Rhodes, drawbar organ, muted Telecaster (neck pickup SoundFont), fingered electric bass, jazz drum kit, and a percussion track with congas, shaker, and tambourine.
