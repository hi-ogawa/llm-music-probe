# Composition landscape: a bird's-eye view

- Written: 2026-10-11

The catalog of named techniques in a DAW-era composition workflow, grouped by area. It is a map of the territory, not a curriculum.

Areas run from harmony and voicing toward sampling, mixing, and genre production idioms. The first two areas are standard theory, so they are listed at a compressed, name-only level for coverage.

The one-screen map [landscape.html](https://htmlpreview.github.io/?https://github.com/hi-ogawa/llm-music-probe/blob/main/docs/landscape/landscape.html) is generated from the tables below by `node gen-html.mjs`.

**Roots** tags the tradition a technique comes from: `C` classical and film, `J` jazz, soul, and gospel, `P` pop and songwriting, `E` electronic, hip-hop, and production, `L` Latin and African diaspora, `U` universal. Genre rows also list the catalog techniques they use.

The last column says whether toy-midi can demo the technique today. It is a side note for picking demos, explained in [toy-midi](#toy-midi).

## Harmony: progressions and schemas

| Technique                              | What it is                                                                                        | Typical in                             | Roots | toy-midi |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------- | ----- | -------- |
| Doo-wop schema                         | I–vi–IV–V loop, and its I–vi–ii–V variant                                                         | 50s–60s pop, retro ballads             | P     | ✓        |
| Singer/songwriter ("axis") loop        | I–V–vi–IV and its rotations, especially vi–IV–I–V                                                 | 90s–2010s pop, rock, EDM               | P     | ✓        |
| Hopscotch schema                       | IV–V–vi–I, starting off-tonic so the loop never lands                                             | 2010s pop                              | P     | ✓        |
| Royal road (王道進行)                  | IVmaj7–V7–iii7–vi, the stock J-pop chorus engine                                                  | J-pop, anisong, K-pop, city pop        | P     | ✓        |
| "Just the Two of Us" progression       | IVmaj7–III7–vi7–(v7–I7), chromatic mediant dominant into relative minor                           | City pop, J-pop, K-R&B, lo-fi          | J     | ✓        |
| Lament / Andalusian descent            | i–♭VII–♭VI–V over a descending minor tetrachord                                                   | Flamenco, rock, pop ballads            | C     | ✓        |
| Aeolian "epic" loop                    | i–♭VI–♭III–♭VII and rotations, no dominant function                                               | Trance, EDM, trailer, K-pop            | E     | ✓        |
| Mixolydian and double-plagal cadences  | ♭VII–IV–I, replacing V with stacked plagal motion                                                 | Rock, gospel, anthemic pop             | P     | ✓        |
| Modal vamp                             | Two-chord shuttle that fixes a mode, such as Dorian i–IV or Mixolydian I–♭VII                     | Funk, house, neo-soul, Latin           | J     | ✓        |
| Harmonic stasis                        | One chord or a drone, with bass, melody, or groove carrying motion                                | Trap, techno, afrobeats, minimalism    | E     | ✓        |
| Blues forms                            | 12- and 16-bar blues and jazz blues variants                                                      | Blues, rock, jazz, R&B                 | J     | ✓        |
| Rhythm changes                         | I–vi–ii–V A sections with a III7–VI7–II7–V7 bridge                                                | Bebop                                  | J     | ✓        |
| Line cliché                            | Chromatic inner line over a sustained chord (m, m(maj7), m7, m6)                                  | Standards, film themes, ballads        | J     | ✓        |
| Chromatic descending bass              | Stepwise bass under one harmony becoming new chords (I–I/7–I/♭7–IV/6)                             | Beatles-era pop, ballads               | P     | ✓        |
| Pedal point                            | Sustained bass under moving harmony for tension or suspense                                       | Film, EDM builds, gospel, classical    | C     | ✓        |
| Gospel turnarounds and passing chords  | Walk-ups, passing diminished, 1–6–2–5 with altered secondary dominants                            | Gospel, neo-soul, R&B                  | J     | ✓        |
| Neo-soul extended loops                | ii–V or iv–i loops in m9, maj9♯11, and 13sus, rarely resolving                                    | Neo-soul, lo-fi hip-hop, K-R&B         | J     | ✓        |
| Chromatic mediants                     | Major-to-major chords a third apart (I–♭VI, I–III) for color shifts                               | Film, trailer, prog                    | C     | ✓        |
| Neo-Riemannian moves                   | P, L, R triad transformations and their chains                                                    | Film scoring, game music               | C     | ✓        |
| Modal interchange                      | Borrowed iv, ♭VI, ♭VII, ♭III from the parallel mode                                               | Everywhere                             | U     | ✓        |
| Secondary dominants and tonicization   | V/x chords that briefly treat a diatonic chord as tonic                                           | Everywhere                             | U     | ✓        |
| Tritone substitution and backdoor ii–V | ♭II7 for V7, and iv–♭VII7–I                                                                       | Jazz, R&B, city pop                    | J     | ✓        |
| Coltrane changes                       | Major-third key cycles with dominants inserted                                                    | Post-bop, jazz reharm                  | J     | ✓        |
| Constant structure and planing         | One chord quality moved in parallel, ignoring key                                                 | Modal jazz, house stabs, Impressionism | J     | ✓        |
| Negative harmony                       | Reflection of harmony around the tonic–dominant axis                                              | Jazz reharm, internet-era theory       | J     | ✓        |
| Pandiatonicism                         | Diatonic clusters and sus/add colors with no functional pull                                      | Ambient, film, worship, minimalism     | C     | ✓        |
| Melody-note reharmonization            | Re-harmonizing one melody note as a different chord tone or tension                               | Jazz arranging, covers                 | J     | ✓        |
| Harmonic rhythm control                | Changing the rate of chord change by section, such as faster into a cadence or slower in a chorus | Everywhere                             | U     | ✓        |

## Voicing and voice leading

| Technique                      | What it is                                                              | Typical in                   | Roots | toy-midi          |
| ------------------------------ | ----------------------------------------------------------------------- | ---------------------------- | ----- | ----------------- |
| Shell voicings                 | Root, 3rd, and 7th only, leaving room for bass and melody               | Jazz comping, small band     | J     | ✓                 |
| Rootless A/B voicings          | 3-7-9-13 and 7-3-13-9 forms, with the bass player taking the root       | Jazz piano                   | J     | ✓                 |
| Drop-2, drop-3, drop-2&4       | Close voicings with the 2nd (and others) from the top dropped an octave | Big band soli, guitar        | J     | ✓                 |
| Quartal voicings               | Stacked fourths, as in the "So What" voicing                            | Modal jazz, fusion, neo-soul | J     | ✓                 |
| Upper-structure triads         | A triad over a dominant's guide tones to spell altered tensions         | Jazz, gospel                 | J     | ✓                 |
| Clusters and seconds           | Voicings with deliberate 2nd rubs                                       | Neo-soul, film, modern jazz  | J     | ✓                 |
| Spread voicings                | Open spacing with 10ths and wide intervals for pads and ballads         | Ballads, string pads         | C     | ✓                 |
| Guide-tone voice leading       | 3rds and 7ths moving by step through changes                            | Jazz                         | J     | ✓                 |
| Inversions for a stepwise bass | Slash chords chosen so the bass walks                                   | Pop, gospel, ballads         | P     | ✓                 |
| Pop power voicing              | Left hand root–5th–octave, right hand triad with add9, often no 3rd     | Pop, rock, EDM pads          | P     | ✓                 |
| Sus and add as default color   | sus2, sus4, add9, 6/9 used as stable chords                             | Pop, K-pop, worship          | P     | ✓                 |
| Polychords and slash chords    | Triad over a foreign bass note (D/C, F/G)                               | Fusion, gospel, film         | J     | ✓                 |
| Low interval limits            | Keeping close intervals above register thresholds to avoid mud          | Arranging, mixing            | C     | ✓                 |
| Chord stabs                    | Short voiced hits, usually m7 or m9, as rhythmic events                 | House, garage, techno        | E     | ~ GM timbres only |

## Melody, motif, and topline

| Technique                           | What it is                                                                         | Typical in                      | Roots | toy-midi                              |
| ----------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------- | ----- | ------------------------------------- |
| Contour design                      | Choosing the overall arch, ramp, or inverted arch of a phrase                      | Everywhere                      | U     | ✓                                     |
| Register lift                       | Raising the tessitura into the chorus, sometimes by an octave                      | Pop, K-pop, ballads             | P     | ✓                                     |
| Repetition with variation           | AAB or 3+1 phrase shapes where the last statement breaks the pattern               | Pop hooks, blues                | P     | ✓                                     |
| Sequence                            | Repeating a motif transposed, real or tonal                                        | Baroque, pop, J-pop             | C     | ✓                                     |
| Motivic transformation              | Inversion, retrograde, augmentation, diminution, fragmentation                     | Classical, film, jazz heads     | C     | ✓                                     |
| Sentence and period                 | Presentation–continuation and antecedent–consequent phrase plans                   | Classical, pop verses           | C     | ✓                                     |
| Call and response                   | A phrase answered by another voice or instrument                                   | Blues, gospel, funk, pop        | J     | ✓                                     |
| Guide-tone and compound-line melody | Writing a melody from an underlying voice-leading line                             | Jazz heads                      | J     | ✓                                     |
| Outer-voice counterpoint            | Treating melody and bass as a two-voice frame first                                | Classical, arranging            | C     | ✓                                     |
| Melodic rhythm by section           | Contrasting note density, such as sparse verse, busy pre-chorus, long chorus notes | Pop                             | P     | ✓                                     |
| Syncopated and anticipated phrasing | Phrases starting off the beat and pushing into barlines                            | Pop, R&B, funk                  | P     | ✓                                     |
| Tension-note landing                | Landing strong beats on 9, 11, ♯11, or 13 instead of chord tones                   | Jazz, J-pop, neo-soul           | J     | ✓                                     |
| Chromatic approach and enclosure    | Approaching targets from above and below by step or half step                      | Bebop, jazz                     | J     | ✓                                     |
| Pentatonic and blues-scale hooks    | Hooks built from pentatonic cells and blue notes                                   | Rock, R&B, pop                  | P     | ~ no bends `bend`                     |
| Modal color tone                    | Featuring the characteristic degree of a mode, such as Dorian ♮6 or Lydian ♯4      | Film, game, pop                 | U     | ✓                                     |
| Gap-fill                            | A leap followed by stepwise motion back into the gap                               | Everywhere                      | C     | ✓                                     |
| Instrumental riff hook              | A synth or guitar riff standing in for a sung chorus                               | EDM, K-pop post-chorus, rock    | P     | ✓                                     |
| Repeated-note chant hook            | Rhythm-led hooks on one or two pitches, the "killing part"                         | K-pop, trap, pop                | P     | ✓                                     |
| Topline over a track                | Writing the melody last over a finished loop or beat                               | Modern pop, K-pop writing camps | P     | ~ lead instrument stands in for voice |
| Runs and melisma                    | Fast pentatonic and blues runs on one syllable                                     | R&B, gospel, K-pop ballads      | J     | ~ lead instrument stands in for voice |

## Rhythm, meter, and groove

| Technique                            | What it is                                                               | Typical in                                 | Roots | toy-midi  |
| ------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------ | ----- | --------- |
| Swing amount                         | Continuous swing from straight to triplet, as in MPC swing percentages   | Jazz, hip-hop, house, lo-fi                | J     | ✓         |
| Microtiming ("Dilla feel")           | Parts deliberately offset against the grid and against each other        | Neo-soul, lo-fi, hip-hop                   | E     | ✓         |
| Laid-back vs pushed placement        | Consistent drag or push on specific instruments, such as a late snare    | R&B, funk, hip-hop                         | J     | ✓         |
| Accent maps and ghost notes          | Velocity patterns that make a groove, not just note positions            | Funk, R&B, drum programming                | J     | ✓         |
| Humanization                         | Bounded random variation of timing and velocity                          | Everywhere                                 | E     | ✓         |
| Tresillo (3+3+2)                     | Eighths grouped 3+3+2 over a 4/4 bar                                     | Reggaeton, afrobeats, pop, K-pop           | L     | ✓         |
| Clave                                | Son and rumba clave in 2-3 and 3-2 directions, as an organizing timeline | Salsa, Latin jazz                          | L     | ✓         |
| Dembow                               | The reggaeton kick–snare pattern built on tresillo                       | Reggaeton, dancehall                       | L     | ✓         |
| Half-time and double-time feel       | Halving or doubling the backbeat rate at a constant tempo                | Trap, dubstep, rock bridges                | E     | ✓         |
| Triplet subdivision and triplet flow | Triplet grids on hats or rap rhythms against a straight beat             | Trap, drill                                | E     | ✓         |
| Hemiola                              | Three-against-two regrouping across bar lines                            | Classical, afro-Latin, waltz-time pop      | C     | ✓         |
| Polyrhythm                           | Simultaneous 3:2, 4:3, and similar layers                                | Afro-Cuban, jazz, math rock                | L     | ✓         |
| Polymeter and asynchronous loops     | Loops of different lengths phasing against each other                    | Techno, minimal, IDM                       | E     | ✓         |
| Odd meters                           | 5/4, 7/8, and additive groupings                                         | Prog, jazz, Balkan                         | U     | ✓         |
| Meter and tempo changes              | Metric modulation, mixed meter, and tempo shifts within a piece          | Prog, film, K-pop beat switch              | C     | ✗ `tempo` |
| Rhythmic ostinato as identity        | A fixed rhythmic cell defining the piece                                 | Film, minimalism, trailer                  | C     | ✓         |
| Stop-time and breaks                 | Band hits followed by silence, leaving room for a soloist or vocal       | Blues, funk, pop                           | J     | ✓         |
| Unison hits                          | All parts hitting the same rhythm on accents                             | Big band, funk, K-pop choreography accents | J     | ✓         |

## Drum programming and beat-making

| Technique                 | What it is                                                           | Typical in                              | Roots | toy-midi                                       |
| ------------------------- | -------------------------------------------------------------------- | --------------------------------------- | ----- | ---------------------------------------------- |
| Four-on-the-floor         | Kick on every beat with offbeat open hats and claps on 2 and 4       | House, disco, techno                    | E     | ✓                                              |
| Boom-bap                  | Syncopated kick, heavy snare on 2 and 4, swung hats                  | 90s hip-hop                             | E     | ✓                                              |
| Trap pattern              | Half-time snare on 3, rolled hats, 808 tied to the kick              | Trap, modern pop, K-pop                 | E     | ✓                                              |
| Hi-hat rolls and ratchets | 1/16T and 1/32 bursts with velocity ramps                            | Trap, drill                             | E     | ✓                                              |
| UK garage 2-step          | Shuffled hats with a skipping, broken kick                           | UK garage, 2-step, jersey club adjacent | E     | ✓                                              |
| Breakbeats                | Amen and Funky Drummer style patterns, programmed or chopped         | DnB, jungle, big beat                   | E     | ~ programmed only, no chopped breaks `sampler` |
| Linear drumming           | Patterns where no two limbs strike together                          | Funk, gospel chops                      | J     | ✓                                              |
| Fills and build rolls     | Snare rolls that accelerate in subdivision into a downbeat           | EDM, pop, rock                          | P     | ✓                                              |
| Section markers           | Crash on section downbeats, reverse cymbal into them                 | Everywhere                              | P     | ~ crashes work, no reverse cymbals `sampler`   |
| Drum dropout              | Pulling the kick or whole kit for a beat or bar before a downbeat    | Pop, EDM, hip-hop                       | P     | ✓                                              |
| Percussion tops           | Shaker, conga, and tambourine layers that add density without weight | House, afro, pop                        | L     | ✓                                              |
| Sample layering           | Kick and snare built from stacked samples, clap stacks               | Everywhere modern                       | E     | ~ stack GM kits only `sampler`                 |
| Kick–bass interlock       | Bass either locking to or avoiding the kick by design                | Everywhere                              | U     | ✓                                              |
| Brush and jazz kit idioms | Ride pattern, hi-hat on 2 and 4, snare comping, brush patterns       | Jazz                                    | J     | ✓                                              |
| Drum-machine kit identity | Choosing the 808, 909, or LinnDrum sound as a genre signifier        | Electro, hip-hop, house, synth-pop      | E     | ~ TR-808 and Electronic kits only              |

## Bass lines

| Technique                     | What it is                                                       | Typical in             | Roots | toy-midi                                     |
| ----------------------------- | ---------------------------------------------------------------- | ---------------------- | ----- | -------------------------------------------- |
| Root pulse                    | Root eighths or root–fifth patterns                              | Pop, rock              | P     | ✓                                            |
| Walking bass                  | Quarter-note lines connecting chord tones with approach notes    | Jazz                   | J     | ✓                                            |
| Octave bass                   | Alternating octaves on eighths                                   | Disco, nu-disco, K-pop | P     | ✓                                            |
| Offbeat bass                  | Bass on every "and" between four-on-the-floor kicks              | Trance, house          | E     | ✓                                            |
| Rolling 16th bass             | Galloping 16ths, often with the downbeat left to the kick        | Psytrance, techno      | E     | ✓                                            |
| Syncopated funk bass          | 16th pushes, ghost notes, slides                                 | Funk, neo-soul         | J     | ~ no slides `bend`                           |
| Melodic counter-line bass     | Bass as an independent melody against the vocal                  | Motown, Beatles        | P     | ✓                                            |
| Riff bass                     | Bass riff as the song's hook, often doubled by guitar            | Rock, funk             | P     | ✓                                            |
| Tumbao                        | The anticipated Afro-Cuban bass pattern on "2-and" and 4         | Salsa, Latin jazz      | L     | ✓                                            |
| One-drop bass                 | Heavy, spacious lines that leave beat 1 empty                    | Reggae, dub            | L     | ✓                                            |
| 808 sub bass                  | Long sub notes that follow the kick, with glides between pitches | Trap, drill, K-pop     | E     | ~ notes work, no glides or grit `bend` `dyn` |
| Reese, wobble, and growl bass | Detuned or LFO-modulated bass whose movement is the part         | DnB, dubstep           | E     | ✗ `synth` `filter` `auto`                    |
| Acid and filter-envelope bass | Resonant filter envelopes with accents and slides                | Acid house, funk       | E     | ✗ `synth` `filter` `bend`                    |
| Slap and pop                  | Thumb slaps and popped strings with octave patterns              | Funk, city pop         | J     | ~ GM slap presets, no articulations          |

## Form and structure

| Technique                            | What it is                                                                          | Typical in                      | Roots | toy-midi                                                         |
| ------------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------- | ----- | ---------------------------------------------------------------- |
| Verse–pre-chorus–chorus              | The core modern pop section cycle                                                   | Pop                             | P     | ✓                                                                |
| Post-chorus                          | An instrumental or chant hook after the chorus                                      | Modern pop, K-pop               | P     | ✓                                                                |
| AABA and ABAC                        | 32-bar song forms                                                                   | Standards, Tin Pan Alley        | J     | ✓                                                                |
| Bridge or middle 8                   | A contrast section with a new harmony or key area                                   | Pop, rock                       | P     | ✓                                                                |
| Pre-chorus build                     | Rising bass or harmony, snare build, and rhythmic acceleration toward the chorus    | Pop, K-pop                      | P     | ✓                                                                |
| Break, build, drop                   | Strip down, build tension, then release on a downbeat                               | EDM, K-pop                      | E     | ~ notes and drums work, no risers or sweeps `filter` `auto` `fx` |
| Silence before the drop              | A beat or bar of near-silence before the downbeat                                   | EDM, K-pop, pop                 | E     | ✓                                                                |
| Dance break                          | An instrumental section designed for choreography                                   | K-pop                           | P     | ✓                                                                |
| Beat or song switch                  | A new groove, genre, or tempo partway through a song                                | K-pop, hip-hop                  | P     | ~ groove switch works, no tempo change `tempo`                   |
| Final-chorus key change              | Lifting the last chorus, usually by a half or whole step                            | Pop, K-pop, ballads             | P     | ✓                                                                |
| Stripped chorus                      | A minimal chorus before the final full one                                          | Pop, K-pop                      | P     | ✓                                                                |
| Hook-first intro                     | Opening on the chorus or hook instead of an instrumental intro                      | Streaming-era pop               | P     | ✓                                                                |
| Bookend, deferred, and twin choruses | Chorus placement variants such as starting with it, delaying it, or alternating two | K-pop                           | P     | ✓                                                                |
| DJ-friendly phrase blocks            | 8, 16, and 32-bar sections with beat-only intros and outros                         | House, techno                   | E     | ✓                                                                |
| Energy curve                         | Planning intensity section by section as a dramatic arc                             | Everywhere                      | U     | ✓                                                                |
| Subtractive arranging                | Building the full loop first, then muting parts to carve sections                   | EDM, beat-making                | E     | ✓                                                                |
| Loop mutation                        | Varying a loop across repetitions so it evolves instead of repeating                | Hip-hop, electronic             | E     | ✓                                                                |
| Unique events                        | A one-off sound or fill heard once, as ear candy                                    | Pop production                  | P     | ~ note events work, most ear candy is effects `fx`               |
| False ending                         | A stop that sounds final, followed by a restart                                     | Pop, rock                       | P     | ✓                                                                |
| Tag, coda, and fade                  | Repeating the last line, a surprise final chord, or a fade-out                      | Pop, jazz                       | P     | ~ tags and codas work, no fade-out `auto`                        |
| Classical large forms                | Sonata, rondo, theme and variations, binary, and ternary                            | Classical, film, K-pop analyses | C     | ✓                                                                |

## Arranging and orchestration

| Technique                  | What it is                                                                        | Typical in                       | Roots | toy-midi                                                      |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------------- | ----- | ------------------------------------------------------------- |
| Texture choice             | Monophony, melody with accompaniment, counterpoint, or homorhythm per section     | Everywhere                       | C     | ✓                                                             |
| Register slotting          | Giving each part its own frequency and register band                              | Everywhere                       | U     | ✓                                                             |
| Octave and unison doubling | Doubling a line for weight or brightness                                          | Orchestral, rock, EDM leads      | C     | ✓                                                             |
| Timbre layering            | Stacking sounds on one part, such as piano with pad or strings with synth         | Everywhere                       | U     | ✓                                                             |
| Countermelody              | A second melody, often entering in a later chorus                                 | Pop, orchestral, musical theater | C     | ✓                                                             |
| Pad vs pulse roles         | Sustained beds against rhythmic comping parts                                     | Everywhere                       | U     | ✓                                                             |
| Comping patterns           | Piano and guitar rhythm figures such as Charleston, 16th strums, and block chords | Jazz, pop                        | J     | ✓                                                             |
| Arpeggiation               | Up, down, and gated arpeggio patterns                                             | Synth-pop, trance, film          | E     | ✓                                                             |
| String ostinato            | Driving 8th or 16th string figures                                                | Pop, trailer, film               | C     | ✓                                                             |
| Sectional soli             | Harmonized lines for a horn or string section, often in drop-2                    | Big band, funk, K-pop horns      | J     | ✓                                                             |
| Background figures         | Pads, punches, and stabs behind the melody                                        | Big band, pop                    | J     | ✓                                                             |
| Density build              | Adding one layer every 4 or 8 bars                                                | EDM, pop                         | E     | ✓                                                             |
| Idiomatic range            | Writing lines that real instruments can play                                      | Live arranging                   | C     | ✓                                                             |
| Orchestral color           | Divisi strings, woodwind doublings, horns as glue, pizzicato and tremolo          | Film, ballads                    | C     | ~ GM pizzicato and tremolo presets, no articulation switching |
| Orchestrated crescendo     | Building intensity by adding instruments and register, not only volume            | Orchestral, film                 | C     | ~ adding parts works, no volume swells `cc`                   |
| Stabs and hits             | Brass or string hits on accents                                                   | K-pop, funk, trailer             | P     | ✓                                                             |
| Guitar idioms              | Power chords, palm-muted chugs, strummed voicings                                 | Rock, pop-punk                   | P     | ~ GM guitars, strums as staggered starts                      |
| Backing vocal parts        | Harmonized vocal lines in 3rds or 6ths, gang vocals                               | Pop, R&B                         | P     | ~ GM choir stands in `vox`                                    |
| Reduction                  | Arranging a full texture down to a small band or solo piano                       | Jazz, covers                     | J     | ✓                                                             |

## Sound selection and synthesis

| Technique                  | What it is                                                          | Typical in                   | Roots | toy-midi                          |
| -------------------------- | ------------------------------------------------------------------- | ---------------------------- | ----- | --------------------------------- |
| Era-signifier timbres      | DX7 EP, Rhodes, Juno pads, M1 piano, and Clavinet as period markers | City pop, 80s pop, 90s house | P     | ~ GM approximations               |
| Subtractive synthesis      | Oscillator, filter, and amp with envelopes                          | All synth genres             | E     | ✗ `synth` `filter`                |
| Supersaw and unison detune | Many detuned saw voices for width                                   | Trance, EDM, future bass     | E     | ✗ `synth`                         |
| Plucks                     | Short amp and filter decay patches                                  | EDM, tropical house          | E     | ~ GM plucked presets only `synth` |
| Evolving pads              | Slow attack and modulated movement                                  | Ambient, film                | E     | ✗ `synth` `auto`                  |
| FM synthesis               | Bells, electric pianos, metallic basses                             | 80s pop, city pop, dubstep   | E     | ✗ `synth`                         |
| Wavetable movement         | Sweeping through wavetables over time                               | Modern EDM                   | E     | ✗ `synth` `auto`                  |
| 808 design                 | Sine with pitch envelope, long decay, and saturation                | Trap, drill                  | E     | ✗ `synth` `dyn` `bend`            |
| Acid line                  | 303-style resonance, accents, and slides                            | Acid house, techno           | E     | ✗ `synth` `filter` `bend`         |
| Transition FX              | Risers, white-noise sweeps, impacts, downlifters                    | EDM, K-pop, film             | E     | ✗ `synth` `filter` `auto`         |
| Layered sound design       | Building one sound from transient, body, and tail parts             | Sound design                 | E     | ✗ `synth` `sampler`               |
| Portamento leads           | Mono legato leads that glide between notes                          | Synth-pop, G-funk            | E     | ✗ `bend`                          |
| Velocity-to-timbre mapping | Velocity changing brightness, not only level                        | Everywhere                   | U     | ~ soundfont velocity layers only  |

## Sampling and audio manipulation

| Technique                | What it is                                                | Typical in                         | Roots | toy-midi                                         |
| ------------------------ | --------------------------------------------------------- | ---------------------------------- | ----- | ------------------------------------------------ |
| Chopping                 | Slicing a loop and re-sequencing the slices               | Hip-hop, lo-fi, jungle             | E     | ~ clip trim and move, no slice-to-pads `sampler` |
| Flipping a sample        | Re-contextualizing a sampled loop with new drums and bass | Hip-hop                            | E     | ~ import and place clips                         |
| Pitched samples          | Speed-changing a sample, as in chipmunk soul              | 2000s hip-hop                      | E     | ✗ `sampler`                                      |
| Time-stretching to tempo | Fitting audio to the project tempo without changing pitch | Everywhere                         | E     | ✗ `sampler`                                      |
| Vocal chops              | A sliced vocal played as a melodic instrument             | Future bass, K-pop, tropical house | E     | ✗ `sampler`                                      |
| Reverse                  | Reversed cymbals and reversed reverb tails                | Everywhere                         | E     | ✗ `sampler`                                      |
| Resampling               | Bouncing a part to audio and mangling it further          | EDM, sound design                  | E     | ✗ `sampler`                                      |
| Stutter and gate edits   | Rhythmic repeats and gating of audio                      | EDM, glitch                        | E     | ~ coarse clip edits only `sampler` `auto`        |
| Tape stop                | Pitch and speed falling to a stop                         | Lo-fi, hip-hop, EDM                | E     | ✗ `sampler` `auto`                               |
| Found sound              | Foley and field recordings used as percussion or texture  | Lo-fi, experimental                | E     | ~ import clips                                   |

## Mixing and effects

| Technique                 | What it is                                                           | Typical in            | Roots | toy-midi                           |
| ------------------------- | -------------------------------------------------------------------- | --------------------- | ----- | ---------------------------------- |
| Static balance            | A level-only mix before any processing                               | Everywhere            | E     | ✓                                  |
| Panning plan              | LCR placement with a centered kick, bass, and lead                   | Everywhere            | E     | ✓                                  |
| Complementary EQ          | Cutting one part to make room for another                            | Everywhere            | E     | ✓                                  |
| High-pass and shelving    | Clearing low end from non-bass parts and tilting tone                | Everywhere            | E     | ~ peaking cuts only `filter`       |
| Compression               | Controlling dynamics and shaping attack                              | Everywhere            | E     | ✗ `dyn`                            |
| Parallel compression      | Blending a crushed copy under the dry signal                         | Drums, vocals         | E     | ✗ `dyn`                            |
| Sidechain pumping         | Ducking pads and bass from the kick as a rhythmic effect             | House, EDM, K-pop     | E     | ~ faked with shortened notes `dyn` |
| Reverb depth              | Placing parts front to back with reverb, pre-delay, and gated reverb | Everywhere, 80s snare | E     | ✗ `fx`                             |
| Delay throws              | Tempo-synced echoes on chosen words or hits                          | Pop, reggae, dub      | E     | ✗ `fx` `auto`                      |
| Dub mixing                | Send feedback and spring reverb played as an instrument              | Dub, reggae           | L     | ✗ `fx` `auto`                      |
| Saturation and distortion | Adding harmonics so a part reads on small speakers                   | Trap 808s, rock       | E     | ✗ `dyn`                            |
| Stereo width              | Double-tracking, Haas offsets, and chorus                            | Pop, rock             | E     | ~ panned double tracks only `fx`   |
| Mono low end              | Keeping sub frequencies centered                                     | Club music            | E     | ✓                                  |
| Filter sweeps             | DJ-style low- and high-pass sweeps over a whole mix                  | House, French house   | E     | ✗ `filter` `auto`                  |
| Volume automation         | Rides and fades over time                                            | Everywhere            | E     | ✗ `auto`                           |
| Bus processing            | Shared compression or saturation on a group                          | Everywhere            | E     | ✗ `dyn`                            |
| Mastering loudness        | Limiting and final tonal balance                                     | Everywhere            | E     | ✗ `dyn`                            |
| Lo-fi degradation         | Bitcrushing, wow and flutter, vinyl noise                            | Lo-fi, vaporwave      | E     | ✗ `fx`                             |
| Hard pitch correction     | Audible tuning as an effect                                          | Trap, K-pop, R&B      | E     | ✗ `vox` `fx`                       |

## Lyrics and vocals

| Technique                 | What it is                                                                    | Typical in                | Roots | toy-midi                               |
| ------------------------- | ----------------------------------------------------------------------------- | ------------------------- | ----- | -------------------------------------- |
| Prosody                   | Aligning stressed syllables with strong beats and open vowels with long notes | All sung music            | P     | ✗ `vox`                                |
| Rhyme schemes             | End, internal, and multisyllabic rhymes                                       | Pop, rap                  | P     | ✗ `vox`                                |
| Title and hook placement  | Putting the title in the first or last line of the chorus                     | Pop                       | P     | ✗ `vox`                                |
| Rap flow                  | Flow patterns such as triplet flow and switching pockets                      | Hip-hop, K-pop rap verses | E     | ~ rhythm on a lead or percussion track |
| Vocal stacks              | Doubles, harmonies, and ad-libs layered on a lead                             | Pop, R&B                  | P     | ✗ `vox`                                |
| Hook language switching   | English hooks inside non-English verses                                       | K-pop, J-pop              | P     | ✗ `vox`                                |
| Line distribution         | Assigning lines to group members by voice color                               | K-pop                     | P     | ✗ `vox`                                |
| Chants and gang shouts    | Group "hey" and crowd hooks                                                   | Pop, hip-hop              | P     | ✗ `vox`                                |
| Delivery shift by section | Rap verse, sung pre-chorus, belted chorus                                     | K-pop, pop                | P     | ~ register shift with a lead stand-in  |

## Genre idioms

Each genre is a bundle of the techniques above. A genre demo is a good integration test once its parts are known.

| Genre                   | Defining moves                                                                    | Typical tempo       | Roots | Uses                                                                                                                                                                                                  | toy-midi                                                           |
| ----------------------- | --------------------------------------------------------------------------------- | ------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Boom-bap                | Swung drums, chopped soul sample, dusty low-passed loop                           | 85–95               | E     | Boom-bap;Swing amount;Microtiming ("Dilla feel");Chopping;Flipping a sample;Pitched samples;Loop mutation;Rap flow                                                                                    | ~ drums work, no sample chops or filtering `sampler` `filter`      |
| Trap                    | Half-time snare, hat rolls, 808 sub with glides, minor-loop harmony               | 130–150 (half-time) | E     | Trap pattern;Hi-hat rolls and ratchets;808 sub bass;808 design;Harmonic stasis;Half-time and double-time feel;Triplet subdivision and triplet flow;Rap flow                                           | ~ beat works, no 808 glides or grit `bend` `dyn`                   |
| Lo-fi hip-hop           | Neo-soul 9th chords, Dilla timing, vinyl noise, low-pass                          | 70–90               | E     | Neo-soul extended loops;Rootless A/B voicings;Microtiming ("Dilla feel");Swing amount;Chopping;Lo-fi degradation                                                                                      | ~ harmony and groove work, no lo-fi texture `fx` `filter`          |
| Neo-soul and modern R&B | Extended and quartal chords, behind-the-beat feel, Rhodes                         | 70–100              | J     | Neo-soul extended loops;Quartal voicings;Clusters and seconds;Laid-back vs pushed placement;Microtiming ("Dilla feel");Tension-note landing;Syncopated funk bass;Runs and melisma                     | ✓                                                                  |
| Funk                    | 16th syncopation, clav and guitar comping, horn stabs, one-chord vamps            | 95–115              | J     | Modal vamp;Accent maps and ghost notes;Syncopated funk bass;Slap and pop;Comping patterns;Stabs and hits;Linear drumming;Riff bass;Unison hits                                                        | ✓                                                                  |
| Disco and nu-disco      | Four-on-the-floor, octave bass, string lines, open hats                           | 110–125             | E     | Four-on-the-floor;Octave bass;String ostinato;Percussion tops;Stabs and hits;Filter sweeps                                                                                                            | ✓                                                                  |
| House                   | Four-on-the-floor, chord stabs, organ bass, sidechain                             | 120–128             | E     | Four-on-the-floor;Chord stabs;Sidechain pumping;Filter sweeps;Modal vamp;Offbeat bass;DJ-friendly phrase blocks;Percussion tops                                                                       | ~ grooves work, no pumping `dyn`                                   |
| Techno                  | Polymeter loops, minimal harmony, evolution through automation                    | 125–140             | E     | Four-on-the-floor;Polymeter and asynchronous loops;Harmonic stasis;Rolling 16th bass;Filter sweeps;Subtractive arranging;Loop mutation;Acid line                                                      | ~ loops work, no evolving movement `auto` `filter`                 |
| Trance                  | Offbeat bass, supersaw, Aeolian loops, long builds                                | 135–140             | E     | Offbeat bass;Supersaw and unison detune;Aeolian "epic" loop;Break, build, drop;Arpeggiation;Transition FX;Fills and build rolls                                                                       | ~ parts work, no supersaw `synth`                                  |
| UK garage               | 2-step shuffle, chopped vocals, organ stabs                                       | 130–135             | E     | UK garage 2-step;Vocal chops;Chord stabs;Swing amount;Sidechain pumping                                                                                                                               | ~ groove works, no vocal chops `sampler`                           |
| Drum & bass and jungle  | Breaks at 170, Reese bass, half-time sections                                     | 170–175             | E     | Breakbeats;Reese, wobble, and growl bass;Half-time and double-time feel;Chopping;Resampling                                                                                                           | ~ programmed breaks only, no Reese bass `sampler` `synth`          |
| Dubstep                 | Half-time at 140, wobble and growl bass                                           | 140                 | E     | Half-time and double-time feel;Reese, wobble, and growl bass;Break, build, drop;Wavetable movement;Silence before the drop                                                                            | ✗ `synth` `auto`                                                   |
| Future bass             | Supersaw maj7 and 9 chords with pumping, vocal chops                              | 140–160             | E     | Supersaw and unison detune;Sidechain pumping;Vocal chops;Sus and add as default color;Break, build, drop;Transition FX                                                                                | ✗ `synth` `dyn` `sampler`                                          |
| Synthwave               | Gated snare, arpeggios, Juno-style pads                                           | 80–118              | E     | Arpeggiation;Era-signifier timbres;Reverb depth;Drum-machine kit identity;Portamento leads                                                                                                            | ~ parts work, no gated reverb `fx`                                 |
| City pop                | maj7 and 9 chords, "Just the Two of Us" moves, slap bass, horns, Rhodes and DX EP | 95–120              | P     | "Just the Two of Us" progression;Royal road (王道進行);Slap and pop;Sectional soli;Era-signifier timbres;Tension-note landing;Octave bass                                                             | ✓                                                                  |
| J-pop and anisong       | Royal road, frequent modulation, fast harmonic rhythm                             | 120–180             | P     | Royal road (王道進行);Final-chorus key change;Harmonic rhythm control;Secondary dominants and tonicization;Sequence;Register lift                                                                     | ✓                                                                  |
| K-pop title track       | Section contrast, beat switch, dance break, killing part, final key change        | 90–130              | P     | Verse–pre-chorus–chorus;Post-chorus;Beat or song switch;Dance break;Repeated-note chant hook;Final-chorus key change;Hook language switching;Line distribution;Delivery shift by section;Trap pattern | ~ instrumental parts work, no vocals or tempo switch `vox` `tempo` |
| Reggaeton               | Dembow, minor loops, sub bass                                                     | 88–100              | L     | Dembow;Tresillo (3+3+2);808 sub bass;Modal vamp                                                                                                                                                       | ✓                                                                  |
| Afrobeats               | Syncopated percussion layers, tresillo feel, guitar riffs                         | 95–115              | L     | Tresillo (3+3+2);Percussion tops;Polyrhythm;Harmonic stasis;Call and response                                                                                                                         | ✓                                                                  |
| Amapiano                | Log drum, shaker grids, jazzy keys, long builds                                   | 110–115             | L     | Percussion tops;Neo-soul extended loops;Loop mutation;Energy curve;Swing amount                                                                                                                       | ~ grooves work, no log drum `synth`                                |
| Bossa nova              | Bossa clave, nylon guitar comping, extended chords                                | 120–140             | L     | Clave;Comping patterns;Tension-note landing;Guide-tone voice leading;Rootless A/B voicings                                                                                                            | ✓                                                                  |
| Gospel                  | Reharmonized turnarounds, walk-ups, organ, call and response, modulation          | Varies              | J     | Gospel turnarounds and passing chords;Upper-structure triads;Call and response;Final-chorus key change;Inversions for a stepwise bass;Runs and melisma;Linear drumming                                | ✓                                                                  |
| Film and trailer        | Ostinato, chromatic mediants, braams, hybrid percussion                           | Varies              | C     | String ostinato;Chromatic mediants;Neo-Riemannian moves;Pedal point;Orchestrated crescendo;Transition FX;Rhythmic ostinato as identity                                                                | ~ orchestral parts work, no braams or risers `synth` `fx`          |
| Ambient                 | Drones, slow harmony, reverb as instrument                                        | Free                | E     | Pandiatonicism;Evolving pads;Reverb depth;Harmonic stasis;Pedal point                                                                                                                                 | ✗ `fx` `auto`                                                      |
| Chiptune and game music | Square and pulse leads, fast arpeggios faking chords                              | Varies              | E     | Arpeggiation;Sequence;Instrumental riff hook;Modal color tone                                                                                                                                         | ✓                                                                  |

## toy-midi

Checked against https://github.com/hi-ogawa/toy-midi `main` at 8da9151 (#810). Notes carry pitch, start, duration, and velocity. Tracks choose a GM preset or one of 9 drum kits (Standard, Room, Power, Electronic, TR-808, Jazz, Brush, Orchestra, SFX) from the bundled soundfont, and have static gain, pan, mute, solo, and up to 8 peaking EQ bands. Audio clips can be imported, moved, trimmed, and gained.

`✓` demo now, `~` approximate (the cell says what is missing), `✗` needs a missing feature. Gap keys:

| Key       | Missing in toy-midi                                                                                |
| --------- | -------------------------------------------------------------------------------------------------- |
| `bend`    | Pitch bend, glide, portamento                                                                      |
| `cc`      | Sustain pedal, mod wheel, expression and volume swells (only per-note velocity exists)             |
| `tempo`   | Tempo or meter changes within a project (one tempo, one time signature)                            |
| `auto`    | Automation of any mix or sound parameter over time                                                 |
| `fx`      | Time and modulation effects such as reverb, delay, chorus, and sends                               |
| `dyn`     | Dynamics and saturation such as compression, sidechain, limiting, and distortion (no buses either) |
| `filter`  | Low-pass, high-pass, shelf, and resonant filters (track EQ is peaking-only)                        |
| `synth`   | Designing a patch instead of picking a GM preset                                                   |
| `sampler` | Slicing, pitching, stretching, or reversing audio                                                  |
| `vox`     | Sung or rapped vocals and lyrics                                                                   |

## Sources

The taxonomy was seeded from these tables of contents and topic lists. Only topic names were used, as a checklist. Entries marked "TOC read" were checked against the actual contents page. The others were taken from a search-result summary of the contents, so they are weaker evidence.

| Source                                                                                                                                                                                         | Seeded                                                                                                                                    | Evidence                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Open Music Theory, contents: https://openmusictheory.github.io/contents.html                                                                                                                   | Harmony, voice leading, classical form, pop/rock rhythm, harmony, and form                                                                | TOC read                 |
| Open Music Theory 2e, pop harmonic schemas: https://viva.pressbooks.pub/openmusictheory/chapter/intro-to-pop-schemas/ and https://viva.pressbooks.pub/openmusictheory/chapter/4-chord-schemas/ | Doo-wop, singer/songwriter, hopscotch, lament, and blues schemas                                                                          | Search summary           |
| Mark Levine, _The Jazz Theory Book_, contents: https://www.img-music.com/links/pdf/FA_0001096164_13004.pdf                                                                                     | Chord/scale theory, slash chords, outside playing, reharmonization, Coltrane changes, song form, Latin jazz                               | TOC read                 |
| Ted Pease, _Jazz Composition: Theory and Practice_: https://online.berklee.edu/store/product?product_id=654963&usca_p=t                                                                        | Guide-tone and compound-line melody, constant structure, pedal point, pandiatonicism, harmonic rhythm, song forms                         | Search summary           |
| Jack Perricone, _Melody in Songwriting_: https://www.halleonard.com/product/50449419/melody-in-songwriting                                                                                     | Melodic rhythm, contour, symmetry, melody–bass relationships, pedal and sus chords                                                        | Search summary           |
| Rimsky-Korsakov, _Principles of Orchestration_, contents: https://www.gutenberg.org/files/33900/old/rimsky_toc.html                                                                            | Melody and harmony distribution across orchestral groups, combining timbres                                                               | TOC read (summary level) |
| Dennis DeSantis, _Making Music: 74 Creative Strategies_ (Ableton): https://makingmusic.ableton.com/                                                                                            | Asynchronous loops, linear drumming, contour, parallel harmony, automation humanizing, subtractive arranging, unique events, dramatic arc | TOC read                 |
| Rick Snoman, _Dance Music Manual_ 4th ed., publisher preview: https://api.pageplace.de/preview/DT0400.9780429843907_A36005525/preview-9780429843907_A36005525.pdf                              | Synthesis, sampling, dynamics, effects, rhythm and drum loops, leads and bass design, dance form, genre chapters, mixing                  | TOC read                 |
| Mike Senior, _Mixing Secrets for the Small Studio_: https://www.routledge.com/Mixing-Secrets-for-the-Small-Studio/Senior/p/book/9781032840451                                                  | Balance, compression, EQ, arrangement and comping in the mix                                                                              | Search summary           |
| Syntorial lesson coverage: https://www.syntorial.com/tutorials/ufaqs/what-material-do-the-lessons-cover/                                                                                       | Subtractive synthesis parameters                                                                                                          | Search summary           |
| Amir Said, _The BeatTips Manual_: https://www.perlego.com/book/2860775/the-beattips-manual-the-art-of-beatmaking-the-hip-hoprap-music-tradition-and-the-common-composer-pdf                    | Drum programming, sampling, hip-hop arrangement                                                                                           | Search summary           |
| Kpopalypse, "common song structures in k-pop": https://kpopalypse.com/2016/09/13/kpopalypse-explains-common-song-structures-in-k-pop/                                                          | K-pop section types and chorus placement variants                                                                                         | Page read                |
| BMI, writing for the J-pop and K-pop markets: https://www.bmi.com/news/entry/how_to_write_and_pitch_songs_for_the_j_pop_and_k_pop_markets                                                      | K-pop and J-pop writing practice                                                                                                          | Search result only       |

Where no source covered a technique, it comes from general knowledge of the practice, for example the royal road, "Just the Two of Us" progression, amapiano, and the genre tempo ranges. Those rows are the ones most worth a skeptical read.
