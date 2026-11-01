// Sets every track's reverbSend from its General MIDI family in the cataloged
// file of each piece below, in place. `node add-reverb-sends.mjs`
import { readFileSync, writeFileSync } from "node:fs";

const PIECES = [
  "open-e-mixolydian/project-amp.json",
  "orchestral-dilla/orchestral-dilla-v2.json",
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
  const text = readFileSync(url, "utf8");
  const project = JSON.parse(text);
  for (const track of project.midiTracks) {
    const db = getSendDb(track);
    if (db === undefined) {
      delete track.reverbSend;
    } else {
      track.reverbSend = toGain(db + RAISE_DB);
    }
  }
  // Keep each file's own formatting, since its generator chose it
  const indent = text.startsWith("{\n") ? 1 : undefined;
  writeFileSync(url, JSON.stringify(project, null, indent));
}
