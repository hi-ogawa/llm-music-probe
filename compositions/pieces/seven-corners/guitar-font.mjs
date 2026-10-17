// Moves Seven Corners' guitars to the FlameStudios Telecaster neck pickup SF3, for rendering only.
// Usage: node guitar-font.mjs <in project.json> <out project.json>
// The gist's project files keep GM programs 27 and 28, so Toy MIDI plays guitars.
// The output sets the font's programs, which Toy MIDI would play as GM pianos.
// Program 27 tracks use its Standard preset, with velocities raised to at least 46,
// because 0-45 plays the font's Muted recordings. Program 28 tracks use its Muted preset.
// Gains were then level-matched to the GeneralUser render by hand from render.mjs's LUFS table.
import fs from "node:fs";
const [input, output] = process.argv.slice(2);
const p = JSON.parse(fs.readFileSync(input, "utf8"));
const sf2 = "/tmp/egtr/cand/tele-neck-SM.sf3";
for (const t of p.midiTracks) {
  if (t.program === 27) {
    Object.assign(t, { sf2, program: 0 });
    for (const n of t.notes) n.velocity = Math.max(46, n.velocity ?? 100);
  } else if (t.program === 28) Object.assign(t, { sf2, program: 1 });
}
fs.writeFileSync(output, JSON.stringify(p));
