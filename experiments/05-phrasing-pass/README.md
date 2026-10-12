# 05-phrasing-pass

- Direction: Depth (groove and phrasing) in [directions.md](../../docs/directions.md)
- Date: 2026-10-08
- Model ID: no model output. The lines are range sweep scores by claude-opus-5-5, and the phrasing pass is code
- Output format: range sweep scores, rendered flat and through the phrasing pass

## Question

In the range sweep, lines meant to be heard as lines sounded awkward by ear, while rhythmic and harmonic intent sounded natural. Is the awkwardness in the notes, or in the missing performance? If the same notes played with phrasing stop sounding awkward, the gap is performance, a format and tooling gap, and the composition holds.

## A confound found while preparing

The renderer used to scale velocity by each voice's `vol`. Loud voices saturated: three melodic voices, including the m01 lead, played every note at velocity 127, and 31 more had their `!` accents clipped flat. Nearly all were lead and bass lines, the voices the judgment found awkward. The renderer now sets a melodic voice's level with channel volume and keeps velocity for dynamics. The whole sweep was re-rendered with this fix into `.tmp/04-range-sweep/`, and the first listening set is kept in `.tmp/04-range-sweep-v1/`. The flat renders in this experiment use the fix, so the A/B compares phrasing alone.

## Phrasing pass

`--phrase <voices>` plays the listed voices through `src/midi/phrase.ts`. It never changes pitches or start times. The rules, all textbook defaults chosen without listening:

- **Events and phrases.** Notes struck together are one event. A rest of half a beat or more ends a phrase.
- **Velocity contour.** Within a phrase, velocity scales from 0.85 at the ends up to 1 at the highest event, with a 1.05 accent on beats. Written `!` and `?` levels still apply underneath.
- **Length.** Events written back to back connect: a new pitch overlaps the next by 0.04 beat on sustained instruments and meets it exactly on plucked ones, and a repeated pitch is detached to 85% of the span. The last event of a phrase is shortened to 90% for a breath. Written rests are kept, and the voice's `gate` is ignored in favor of these rules.
- **Expression (CC11), sustained instruments only.** Notes of a beat or longer swell from 85 to 120 at their middle and ease to 100. Shorter notes sit at 110.
- **Vibrato (CC1), sustained instruments only.** Notes of 1.5 beats or longer get no vibrato for their first 40%, then rise to 60 by 80%.

Sustained instruments are winds, brass, bowed strings, choir, and pad. Plucked and struck instruments, such as bass and guitar, get only contour and length.

## Lines

| Line           | Score                   | Phrased voices                     |
| -------------- | ----------------------- | ---------------------------------- |
| m01-lead       | m01-pop-hook            | lead (alto sax)                    |
| m02-horns      | m02-jazz-head           | trumpet, tenor                     |
| m05-sax-guitar | m05-blues-call-response | sax (tenor), gtr (electric guitar) |
| e02-horns      | e02-soul-band           | tpt, tenor, bone, bari             |
| e04-sections   | e04-big-band            | alto, tenor, bari, tpt, tbn        |
| d01d-bass      | d01d-bass-deep          | bass (upright)                     |

## Renders

In `.tmp/05-phrasing-pass/<line>/`, each line has a solo pair, with only the phrased voices, and a mix pair, with the full arrangement. In each pair, X and Y are flat and phrased in random order, recorded in `.tmp/05-phrasing-pass/KEY-do-not-open-until-judged.txt`.

## Listening sheet

For each pair: which sounds less awkward, and is the better one now fine or still awkward? Any notes you would want to change are the most useful data.

| Line           | Solo: better | Solo: fine or awkward | Mix: better | Mix: fine or awkward | Notes |
| -------------- | ------------ | --------------------- | ----------- | -------------------- | ----- |
| m01-lead       |              |                       |             |                      |       |
| m02-horns      |              |                       |             |                      |       |
| m05-sax-guitar |              |                       |             |                      |       |
| e02-horns      |              |                       |             |                      |       |
| e04-sections   |              |                       |             |                      |       |
| d01d-bass      |              |                       |             |                      |       |

## Reading the result

- Phrased is better and fine: the gap was performance, and composition holds for that line.
- Both are awkward: the gap is in the writing, and the notes you would change say where.
- No clear preference: the pass's textbook rules may be wrong for that line, which says the pass needs tuning, not that the line is bad.

## Judgment

Pending a listen.
