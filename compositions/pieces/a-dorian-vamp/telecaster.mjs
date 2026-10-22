// Moves the guitars to Toy MIDI's bundled Telecaster SoundFonts.
//
// Usage: node telecaster.mjs project.json project-v2-telecaster.json
//
// - Highlife guitar: GM program 27 to the neck pickup's Standard preset
//   (program 0). The line sits high (A4–A5), where the neck pickup is rounder
//   than the bridge. Velocities are already 46 and up, above the preset's muted
//   layer, and the accents at 96 and up get its brightest layer. The notes ring
//   a little past their written length into the next one, as picked single
//   notes would, so there is no CC 11 cut.
// - Muted guitar stabs: GM program 28 to the bridge pickup's Muted preset
//   (program 1), so the chop on the right stays sharper than the line on the
//   left.

import fs from "node:fs";

const [input, output] = process.argv.slice(2);
const project = JSON.parse(fs.readFileSync(input, "utf8"));
const parts = {
  "Highlife guitar": { soundfont: "flamestudios-telecaster-neck", program: 0 },
  "Muted guitar stabs": { soundfont: "flamestudios-telecaster-bridge", program: 1 },
};

for (const [name, part] of Object.entries(parts)) {
  Object.assign(project.midiTracks.find((t) => t.name === name), part);
}

fs.writeFileSync(output, JSON.stringify(project, null, 2));
