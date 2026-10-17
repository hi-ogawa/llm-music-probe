// Render each track alone with spessasynth_core + GeneralUser GS and print RMS per section.
import { readFileSync } from "node:fs";
import { SoundBankLoader, SpessaSynthProcessor } from "spessasynth_core";

const project = JSON.parse(readFileSync("project.json", "utf8"));
const sf = readFileSync(process.env.HOME + "/code/personal/toy-midi/src/assets/soundfonts/GeneralUserGS.sf3");
const bank = SoundBankLoader.fromArrayBuffer(sf.buffer.slice(sf.byteOffset, sf.byteOffset + sf.byteLength));
const SR = 24000, BLOCK = 128;
const spb = 60 / project.tempo;
const totalSec = project.loop.range.endBeat * spb + 2;
const sections = project.locators.map((l, i, a) => [l.label, l.beat * spb, (a[i + 1]?.beat ?? project.loop.range.endBeat) * spb]);
const only = process.argv[2];

const results = [];
for (const t of project.midiTracks) {
  if (only && !t.name.includes(only)) continue;
  const synth = new SpessaSynthProcessor(SR, { enableEffects: false });
  synth.soundBankManager.addSoundBank(bank, "main");
  await synth.processorInitialized;
  synth.programChange(0, t.program);
  const events = [];
  for (const n of t.notes) {
    events.push([n.start * spb, 1, n.pitch, n.velocity]);
    events.push([(n.start + n.duration) * spb, 0, n.pitch, 0]);
  }
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const total = Math.ceil((totalSec * SR) / BLOCK) * BLOCK;
  const L = new Float32Array(total), R = new Float32Array(total);
  let e = 0;
  for (let s = 0; s < total; s += BLOCK) {
    const now = s / SR;
    while (e < events.length && events[e][0] <= now) {
      const [, on, p, v] = events[e++];
      on ? synth.noteOn(0, p, v) : synth.noteOff(0, p);
    }
    synth.process(L, R, s, BLOCK);
  }
  const g = t.gain ?? 1;
  const rms = (a, b) => {
    let sum = 0;
    for (let i = Math.floor(a * SR); i < Math.floor(b * SR); i++) sum += L[i] * L[i] + R[i] * R[i];
    const v = Math.sqrt(sum / 2 / ((b - a) * SR)) * g;
    return v > 1e-6 ? (20 * Math.log10(v)).toFixed(1) : "  -- ";
  };
  results.push([t.name.padEnd(14), ...sections.map(([, a, b]) => rms(a, b).padStart(6))].join(" "));
}
console.log("".padEnd(14), sections.map(([l]) => l.slice(0, 6).padStart(6)).join(" "));
console.log(results.join("\n"));
