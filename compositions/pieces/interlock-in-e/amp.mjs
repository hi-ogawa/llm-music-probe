// Adds Toy MIDI's amp (https://github.com/hi-ogawa/toy-midi/pull/977) to the right guitar's line, while the cutting parts stay clean,
// on the Telecaster bridge SoundFont the amp was tuned on, with CC 11 cuts after
// each note-off so the drive doesn't bring a note's release up into the next one.
// The gain matches the amped track's loudness to the original's dry level,
// measured with the app's amp on fluidsynth renders.
import fs from "node:fs";

const SRC = "v8-tele.json";
const OUT = "amp.json";
const AMPS = {"Guitar R (line)": {"preset": "crunch", "gain": 0.49}};

const project = JSON.parse(fs.readFileSync(new URL(SRC, import.meta.url), "utf8"));
const spb = 60 / project.tempo;

// CC 11 drops to 0 over 30 ms after a note-off and returns at the next note-on,
// the same cut as the amp sim demo pieces' swell-cut versions.
function addSwellCut(track) {
  const fade = 0.03 / spb;
  const notes = track.notes.map((n) => [n.start, n.start + n.duration]);
  const ends = [...new Set(notes.map(([, b]) => b))].sort((a, b) => a - b);
  const points = [{ beat: 0, value: 127 }];
  for (const e of ends) {
    if (notes.some(([a, b]) => a < e + fade && b > e)) continue;
    if (points.at(-1).beat > e) continue;
    const next = Math.min(...notes.map(([a]) => a).filter((a) => a >= e + fade), Infinity);
    points.push({ beat: e, value: 127 }, { beat: e + fade / 3, value: 80 }, { beat: e + (2 * fade) / 3, value: 32 }, { beat: e + fade, value: 0 });
    if (next < Infinity) points.push({ beat: next, value: 127 });
  }
  (track.automation ??= []).push({ type: "controller", controller: 11, points });
}

for (const track of project.midiTracks) {
  const amp = AMPS[track.name];
  if (!amp) continue;
  track.soundfont = "flamestudios-telecaster-bridge";
  track.program = track.program === 28 ? 1 : 0; // GM clean or muted guitar to the open or muted preset
  addSwellCut(track);
  track.amp = { preset: amp.preset, cabinet: true, inputGain: 1 };
  track.gain = amp.gain;
}
project.title = `${project.title} (amp)`;
fs.writeFileSync(new URL(OUT, import.meta.url), JSON.stringify(project));
