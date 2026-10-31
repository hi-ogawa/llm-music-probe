// Run from a directory where `playwright` resolves: node <this file> project.json
// Renders the project on the toy-midi#1055 preview and prints per-track RMS in dB by section.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const project = JSON.parse(readFileSync(process.argv[2], "utf8"));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("https://fix-issue-1052-toy-midi.hiro18181.workers.dev/draft");
await page.waitForFunction(() => window.toyMidi?.runtime, null, { timeout: 60000 });
const out = await page.evaluate(async (project) => {
  const { runtime, utils } = window.toyMidi;
  const spb = 60 / project.tempo;
  const measure = async (p) => {
    await runtime.deserializeProject(utils.convertSharedProject(p));
    const buf = await runtime.renderMix(), sr = buf.sampleRate, L = buf.getChannelData(0), R = buf.getChannelData(1);
    const sec = (b0, b1) => { let s = 0, n = 0; for (let i = Math.floor(b0*spb*sr); i < Math.min(L.length, b1*spb*sr); i++) { s += L[i]*L[i] + R[i]*R[i]; n += 2; } return +(10*Math.log10(s/n)).toFixed(1); };
    let peak = 0; for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    return { A: sec(0, 32), B: sec(32, 48), climax: sec(48, 56), peak: +peak.toFixed(3) };
  };
  const res = { mix: await measure(project) };
  for (let k = 0; k < project.midiTracks.length; k++) {
    const p = structuredClone(project); p.midiTracks.forEach((t, i) => (t.muted = i !== k));
    res[project.midiTracks[k].name] = await measure(p);
  }
  return res;
}, project);
console.table(out);
await browser.close();
