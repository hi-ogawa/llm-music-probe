// Moves the muted guitar to Toy MIDI's bundled Telecaster Bridge SoundFont.
//
// Usage: node telecaster.mjs dorian-vamp-funk.json dorian-vamp-funk-v2-telecaster.json
//
// GM program 28 becomes the Muted preset (program 1), which keeps the chicken
// scratch's ghost and accent velocities on one layer. Its mutes die faster than
// program 28's, so there is no CC 11 cut. The gain is level-matched to v1's solo
// loudness from `toy-midi render-audio`.

import fs from "node:fs";

const [input, output] = process.argv.slice(2);
const project = JSON.parse(fs.readFileSync(input, "utf8"));
const track = project.midiTracks.find((t) => t.name === "Muted Guitar");
Object.assign(track, { soundfont: "flamestudios-telecaster-bridge", program: 1, gain: 0.44 });

fs.writeFileSync(output, JSON.stringify(project, null, 2));
