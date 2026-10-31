// Run from a directory where `playwright` resolves: node <this file> project.json
// Renders the lead alone on the toy-midi#1055 preview and prints its pitch deviation in cents.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const project = JSON.parse(readFileSync(process.argv[2], "utf8"));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("https://fix-issue-1052-toy-midi.hiro18181.workers.dev/draft");
await page.waitForFunction(() => window.toyMidi?.runtime, null, { timeout: 60000 });
const { sr, data } = await page.evaluate(async (project) => {
  const { runtime, utils } = window.toyMidi;
  project.midiTracks.forEach((t, i) => (t.muted = i !== 0));
  await runtime.deserializeProject(utils.convertSharedProject(project));
  const buf = await runtime.renderMix();
  return { sr: buf.sampleRate, data: Array.from(buf.getChannelData(0)) };
}, project);
await browser.close();
const spb = 60 / project.tempo;
// cents deviation of each 30 ms window from the written pitch, by autocorrelation
function track(b0, b1, midi) {
  const f0 = 440 * 2 ** ((midi - 69) / 12), out = [];
  for (let t = b0 * spb; t < b1 * spb; t += 0.03) {
    const i0 = Math.floor(t * sr), N = Math.floor(0.03 * sr);
    let best = 0, bestLag = 0;
    for (let lag = Math.floor(sr / (f0 * 1.06)); lag <= Math.ceil(sr / (f0 / 1.06)); lag++) {
      let s = 0; for (let i = 0; i < N; i++) s += data[i0 + i] * data[i0 + i + lag];
      if (s > best) { best = s; bestLag = lag; }
    }
    // parabolic interpolation
    const c = (lag) => { let s = 0; for (let i = 0; i < N; i++) s += data[i0 + i] * data[i0 + i + lag]; return s; };
    const a = c(bestLag - 1), b = c(bestLag), d = c(bestLag + 1);
    const lag = bestLag + (a - d) / (2 * (a - 2 * b + d));
    out.push(Math.round(1200 * Math.log2(sr / lag / f0)));
  }
  return out;
}
const range = (xs) => `${Math.min(...xs)}..${Math.max(...xs)} cents`;
console.log("A long C5 straight (b2.2-3):", range(track(2.2, 3, 72)));
console.log("A long C5 bloomed (b4.8-6):", range(track(4.8, 6, 72)));
console.log("climax straight (b48.2-49):", range(track(48.2, 49, 82)));
console.log("climax deep (b52.5-54):", range(track(52.5, 54, 82)));
console.log("short note b36 (D5):", range(track(36.05, 36.45, 74)));
