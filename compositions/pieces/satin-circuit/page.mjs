// Builds out/satin-circuit-synth-ladder.html from render.mjs's output, with every clip embedded,
// so the page works as a single gist file.
// Run: node page.mjs [--project <raw project.json url>] [--pr <pr url>]
import { readFileSync, writeFileSync } from "node:fs";

const OUT = new URL("./out/", import.meta.url).pathname;
const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : undefined; };
const { steps, excerptBeats, tempo, trackLufs } = JSON.parse(readFileSync(`${OUT}steps.json`, "utf8"));
const audio = (id) => `data:audio/mpeg;base64,${readFileSync(`${OUT}${id}.mp3`).toString("base64")}`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const bars = excerptBeats.map((b) => b / 4 + 1);

const projectUrl = arg("--project");
const pr = arg("--pr");
const links = [
  projectUrl && `<a href="https://toy-midi.hiro18181.workers.dev/draft?src=${encodeURIComponent(projectUrl)}">open the project in Toy MIDI</a>`,
  pr && `<a href="${pr}">pull request</a>`,
  `<a href="https://github.com/hi-ogawa/toy-midi/issues/1005">toy-midi#1005</a>`,
].filter(Boolean).join(" · ");

const diff = (p, prev) => {
  if (!p) return "";
  const keys = Object.keys(p).filter((k) => JSON.stringify(p[k]) !== JSON.stringify(prev?.[k]));
  return `<details><summary>patch</summary><pre>${esc(JSON.stringify(p, null, 0).replace(/,"/g, ', "'))}</pre>${prev ? `<p>changed: ${keys.join(", ")}</p>` : ""}</details>`;
};
const row = (st, i, list) => {
  const part = st.ladder === "bass" ? "bass" : "lead";
  const prev = list[i - 1]?.[part];
  return `<tr><td class="id">${st.id}</td><td><b>${esc(st.title)}</b><br><span class="change">${esc(st.change)}</span>${diff(st[part], prev)}</td>
<td><button data-clip="${st.id}-mix">mix</button> <button data-clip="${st.id}-solo">solo</button></td></tr>`;
};
const table = (ladder) => {
  const list = steps.filter((s) => s.ladder === ladder);
  return `<table>${list.map(row).join("\n")}</table>`;
};
const ids = [...steps.flatMap((s) => [`${s.id}-mix`, `${s.id}-solo`]), "full-gm", "full-synth"];

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Satin Circuit: synth ladder</title>
<style>
body { font: 15px/1.5 system-ui, sans-serif; max-width: 920px; margin: 2em auto; padding: 0 1em; color: #222; }
table { border-collapse: collapse; width: 100%; } td { border-top: 1px solid #ddd; padding: .5em .4em; vertical-align: top; }
td.id { font-family: monospace; color: #888; width: 2.5em; } td:last-child { white-space: nowrap; width: 9em; }
.change { color: #555; } pre { white-space: pre-wrap; font-size: 12px; background: #f6f6f6; padding: .5em; margin: .3em 0; }
button { font: inherit; padding: .2em .8em; border: 1px solid #aaa; border-radius: 4px; background: #fff; cursor: pointer; }
button.on { background: #2a6; color: #fff; border-color: #2a6; }
#transport { position: sticky; top: 0; background: #fff; padding: .6em 0; border-bottom: 1px solid #ccc; display: flex; gap: .8em; align-items: center; }
#pos { flex: 1; } #now { font-family: monospace; min-width: 12em; }
details summary { cursor: pointer; color: #777; font-size: 13px; }
</style></head><body>
<h1>Satin Circuit: a synth ladder</h1>
<p>${links}</p>
<p>An early-80s boogie in G minor at ${tempo} BPM, written so the synth parts carry it: a filter-envelope synth bass, a portamento lead, and a pad. The project plays on General MIDI presets in Toy MIDI. This page replaces the bass and then the lead with an offline prototype subtractive synth, one change per step, to hear whether a synth of its own earns a place in Toy MIDI.</p>
<ul>
<li>Clips are bars ${bars[0]}-${bars[1] - 1}, the second half of A and all of B, which has the most held lead notes.</li>
<li>Every synth part is loudness-matched to its General MIDI version (K-weighted, BS.1770 without gating, over the same bars), so a step can't win by being louder. One gain is shared by every clip.</li>
<li>Drums and pad stay on General MIDI throughout, rendered through spessasynth_core with GeneralUser GS and no reverb or chorus, like the app. The lead ladder plays over the bass from the last bass step.</li>
<li>Switching clips keeps the playback position, so you can flip between steps or between mix and solo mid-phrase. Space toggles play.</li>
</ul>
<p>General MIDI levels over these bars, in LUFS: ${Object.entries(trackLufs).map(([n, l]) => `${esc(n)} ${l}`).join(", ")}.</p>
<div id="transport"><button id="play">play</button><input id="pos" type="range" min="0" max="1" step="0.001" value="0"><span id="now">nothing selected</span><label><input id="loop" type="checkbox" checked> loop</label></div>
<h2>Whole piece</h2>
<p><button data-clip="full-gm">General MIDI</button> <button data-clip="full-synth">synth bass and lead (last steps)</button></p>
<h2>Bass ladder</h2>
<p>Solo is the bass alone. The lead stays on General MIDI Saw Lead in the mix.</p>
${table("bass")}
<h2>Lead ladder</h2>
<p>Solo is the lead alone.</p>
${table("lead")}
<script>
const SRC = {${ids.map((id) => `"${id}":"${audio(id)}"`).join(",\n")}};
const els = {}; let cur = null;
const pos = document.getElementById("pos"), now = document.getElementById("now"), playBtn = document.getElementById("play"), loop = document.getElementById("loop");
const get = (id) => els[id] ??= Object.assign(new Audio(SRC[id]), { preload: "auto" });
function select(id) {
  const next = get(id), t = cur ? cur.currentTime : 0;
  if (cur && cur !== next) cur.pause();
  next.loop = loop.checked;
  if (cur && cur !== next) next.currentTime = Math.min(t, (next.duration || t + 1) - 0.01);
  cur = next; cur.dataset.id = id;
  document.querySelectorAll("button[data-clip]").forEach((b) => b.classList.toggle("on", b.dataset.clip === id));
  now.textContent = id;
  cur.play();
}
document.querySelectorAll("button[data-clip]").forEach((b) => b.onclick = () => select(b.dataset.clip));
playBtn.onclick = () => { if (!cur) return select("b0-mix"); cur.paused ? cur.play() : cur.pause(); };
loop.onchange = () => { if (cur) cur.loop = loop.checked; };
pos.oninput = () => { if (cur && cur.duration) cur.currentTime = pos.value * cur.duration; };
document.addEventListener("keydown", (e) => { if (e.code === "Space" && e.target.tagName !== "INPUT") { e.preventDefault(); playBtn.onclick(); } });
setInterval(() => { if (cur && cur.duration) { pos.value = cur.currentTime / cur.duration; playBtn.textContent = cur.paused ? "play" : "pause"; now.textContent = cur.dataset.id + "  " + cur.currentTime.toFixed(1) + " s"; } }, 100);
</script>
</body></html>
`;
writeFileSync(`${OUT}satin-circuit-synth-ladder.html`, html);
console.log("wrote", (html.length / 1e6).toFixed(1), "MB");
