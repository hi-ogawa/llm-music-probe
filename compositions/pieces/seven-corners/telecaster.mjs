// Moves guitar v5's Gtr 1 and its double to Toy MIDI's bundled Telecaster Neck
// SoundFont, the font and pickup guitar v1 was rendered and heard on.
//
// Usage: node telecaster.mjs guitar-v5-simple.json guitar-v6-telecaster.json
//
// GM program 27 becomes the Standard preset (program 0). The notes are already
// at velocity 46 and up, above the preset's muted layer. They let ring and
// rarely stop into silence, and guitar v1 sounded right with the Telecaster's
// release, so there is no CC 11 cut. Gains are level-matched to guitar v5's solo
// loudness from `toy-midi render-audio`.

import fs from "node:fs";

const [input, output] = process.argv.slice(2);
const project = JSON.parse(fs.readFileSync(input, "utf8"));
const gains = { "Gtr 1 (clean, L)": 0.37, "Gtr 1 double": 0.22 };

for (const [name, gain] of Object.entries(gains)) {
  const track = project.midiTracks.find((t) => t.name === name);
  Object.assign(track, { soundfont: "flamestudios-telecaster-neck", program: 0, gain });
}

fs.writeFileSync(output, JSON.stringify(project));
