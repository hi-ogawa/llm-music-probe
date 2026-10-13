// Apply per-track target loudness (LUFS after gain) to a saved toy-midi
// project by changing track gain only, then write the project JSON and
// share links for the original and the fixed version.
//
// Usage: node fix-mix.mjs <project.json> <out-dir> '<json {trackName: {raw, target}}>'
import fs from "node:fs";
import path from "node:path";
import { deflateRawSync } from "node:zlib";

const SITE = "https://toy-midi.hiro18181.workers.dev";
const [input, outDir, targetsJson] = process.argv.slice(2);
const project = JSON.parse(fs.readFileSync(input, "utf8"));
const targets = JSON.parse(targetsJson);

const toShared = (p) => {
  const { audioTracks, trackOrder, ...rest } = p;
  return {
    ...rest,
    locators: p.locators?.map(({ id, ...l }) => l),
    midiTracks: p.midiTracks.map(({ id, height, viewMode, notes, ...t }) => ({
      ...t,
      notes: notes.map(({ id, ...n }) => n),
    })),
  };
};
const link = (p) =>
  `${SITE}/draft#p=${deflateRawSync(JSON.stringify(toShared(p))).toString("base64url")}`;

const fixed = structuredClone(project);
fixed.title = `${project.title} (mix fix)`;
for (const track of fixed.midiTracks) {
  const t = targets[track.name];
  if (!t) {
    continue;
  }
  const db = t.target - t.raw;
  const before = 20 * Math.log10(track.gain);
  track.gain = 10 ** (db / 20);
  console.log(`${track.name}: ${before.toFixed(1)} dB -> ${db.toFixed(1)} dB`);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "project-fixed.json"),
  JSON.stringify(fixed, null, 2),
);
fs.writeFileSync(path.join(outDir, "link-original.txt"), link(project) + "\n");
fs.writeFileSync(path.join(outDir, "link-fixed.txt"), link(fixed) + "\n");
