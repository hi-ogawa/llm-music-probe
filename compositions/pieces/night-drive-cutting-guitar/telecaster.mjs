// Moves v5's guitars to Toy MIDI's bundled Telecaster Bridge SoundFont.
//
// Usage: node telecaster.mjs v5-binary-verse.json v6-telecaster.json
//
// - Guitar (cutting): GM program 27 to the Standard preset (program 0). Its
//   release rings about twice as long as program 27's, which would smear the
//   choked open accents into the muted chks, so CC 11 fades each stroke to 0
//   over 30 ms after its note-off and comes back at the next note-on, as in
//   Quiet-Loud in E's `quiet-loud-swell-cut.json`.
// - Guitar (muted): GM program 28 to the Muted preset (program 1). Its mutes die
//   faster than program 28's, so they need no cut.

import fs from "node:fs";

const [input, output] = process.argv.slice(2);
const project = JSON.parse(fs.readFileSync(input, "utf8"));
const soundfont = "flamestudios-telecaster-bridge";
const ms = (x) => (x * project.tempo) / 60000;

const cutting = project.midiTracks.find((t) => t.name === "Guitar (cutting)");
Object.assign(cutting, { soundfont, program: 0 });
cutting.automation = [{ type: "controller", controller: 11, points: tailCut(cutting.notes, ms(30)) }];

const muted = project.midiTracks.find((t) => t.name === "Guitar (muted)");
Object.assign(muted, { soundfont, program: 1 });

fs.writeFileSync(output, JSON.stringify(project));

// CC 11 points that fade to 0 over `fade` beats after each run of overlapping
// notes ends, and jump back to 127 at the next note-on.
function tailCut(notes, fade) {
  const runs = [];
  for (const n of [...notes].sort((a, b) => a.start - b.start)) {
    const run = runs.at(-1);
    if (run && n.start <= run.end) run.end = Math.max(run.end, n.start + n.duration);
    else runs.push({ start: n.start, end: n.start + n.duration });
  }
  const points = [{ beat: 0, value: 127 }];
  runs.forEach((run, i) => {
    const next = runs[i + 1]?.start ?? Infinity;
    if (next - run.end < fade + ms(5)) return;
    const e = run.end;
    points.push(
      { beat: e, value: 127 },
      { beat: e + fade / 3, value: 80 },
      { beat: e + (2 * fade) / 3, value: 32 },
      { beat: e + fade, value: 0 },
    );
    if (next < Infinity) points.push({ beat: next - ms(1), value: 0 }, { beat: next, value: 127 });
  });
  return points;
}
