// Writes a reverb version of each piece next to it, with every track's
// reverbSend set from its General MIDI family. `node add-reverb-sends.mjs`
import { readFileSync, writeFileSync } from "node:fs";

const PIECES = [
  "open-e-mixolydian/project-amp.json",
  "orchestral-dilla/orchestral-dilla-v2.json",
  "corner-store-thirds/corner-store-thirds.json",
  "night-drive-in-db/night-drive-in-db.json",
  "cliche/cliche.json",
  "tide-engine/tide-engine.json",
  "tidepool/tidepool-v2.json",
];

// #869's levels, 8 dB higher, the lower of the two raises that sounded good on
// Clichê in toy-midi#934's A/B
const RAISE_DB = 8;
const PAD_DB = -16;
const WIND_DB = -24;
const DEFAULT_DB = -30;

function getSendDb(track) {
  const program = track.program ?? 0;
  if (track.bank === 128) {
    return DEFAULT_DB;
  }
  if (program >= 32 && program <= 39) {
    return undefined;
  }
  if (program >= 80 && program <= 95) {
    return PAD_DB;
  }
  // #869 measured choir and flute. Brass and reeds join them by analogy.
  if ((program >= 52 && program <= 54) || (program >= 56 && program <= 79)) {
    return WIND_DB;
  }
  return DEFAULT_DB;
}

const toGain = (db) => Number((10 ** (db / 20)).toFixed(3));

for (const path of PIECES) {
  const url = new URL(`../${path}`, import.meta.url);
  const project = JSON.parse(readFileSync(url, "utf8"));
  for (const track of project.midiTracks) {
    const db = getSendDb(track);
    if (db !== undefined) {
      track.reverbSend = toGain(db + RAISE_DB);
    }
  }
  writeFileSync(
    new URL(path.replace(/\.json$/, "-reverb.json").replace(/^.*\//, ""), url),
    JSON.stringify(project, null, 2) + "\n",
  );
}
