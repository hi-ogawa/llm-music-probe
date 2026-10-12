// Generates landscape.html, a one-screen map of the catalog in README.md.
// Usage: node gen-html.mjs
import fs from "node:fs";
import path from "node:path";
import { parseNote } from "./parse-note.mjs";

const dir = path.dirname(new URL(import.meta.url).pathname);
const sections = parseNote(path.join(dir, "README.md"));

// Presentation only: genres on top as lenses, then areas from notes to sound.
const LAYERS = [
  {
    name: "Styles",
    hint: "genres as bundles of the moves below, click one to light them up",
    areas: { "Genre idioms": "🗺️" },
  },
  {
    name: "Notes",
    hint: "pitch and harmony",
    areas: {
      "Harmony: progressions and schemas": "🎼",
      "Voicing and voice leading": "🎹",
      "Melody, motif, and topline": "🎵",
    },
  },
  {
    name: "Time",
    hint: "rhythm and the low end",
    areas: {
      "Rhythm, meter, and groove": "⏱️",
      "Drum programming and beat-making": "🥁",
      "Bass lines": "🎸",
    },
  },
  {
    name: "Shape",
    hint: "how a piece unfolds",
    areas: { "Form and structure": "🧱", "Arranging and orchestration": "🎻" },
  },
  {
    name: "Sound",
    hint: "production and voice",
    areas: {
      "Sound selection and synthesis": "🎛️",
      "Sampling and audio manipulation": "✂️",
      "Mixing and effects": "🎚️",
      "Lyrics and vocals": "🎤",
    },
  },
];
const ROOTS = {
  C: { label: "Classical and film", color: "#4a3aa7" },
  J: { label: "Jazz, soul, and gospel", color: "#2a78d6" },
  P: { label: "Pop and songwriting", color: "#e87ba4" },
  E: { label: "Electronic, hip-hop, and production", color: "#1baf7a" },
  L: { label: "Latin and African diaspora", color: "#eb6834" },
  U: { label: "Universal", color: "#898781" },
};

const GAPS = {
  synth: "Synth design",
  sampler: "Audio sampling",
  auto: "Automation",
  fx: "Effects",
  dyn: "Dynamics",
  filter: "Filters",
  vox: "Vocals",
  bend: "Pitch bend",
  tempo: "Tempo changes",
  cc: "Pedal and swells",
};

// Plain words for the toy-midi cell, such as "can't demo yet, needs synth design".
function toyMidiText(cell) {
  const gaps = [...cell.matchAll(/`([a-z]+)`/g)]
    .map((m) => GAPS[m[1]].toLowerCase())
    .join(", ");
  if (cell[0] === "✓") {
    return "demo now";
  }
  if (cell[0] === "✗") {
    return `can't demo yet, needs ${gaps}`;
  }
  const note = cell
    .slice(1)
    .replace(/\s*`[a-z]+`/g, "")
    .replace(/(\s+needs?)?[,\s]*$/, "")
    .trim();
  return `approximate: ${note}` + (gaps ? ` · missing ${gaps}` : "");
}

const byName = Object.fromEntries(sections.map((s) => [s.name, s]));
const layers = LAYERS.map((layer) => ({
  ...layer,
  areas: Object.entries(layer.areas).map(([name, icon]) => {
    const section = byName[name];
    if (!section) {
      throw new Error(`missing section: ${name}`);
    }
    return {
      name,
      icon,
      items: section.rows.map((row) => ({
        name: row.Technique ?? row.Genre,
        what: row["What it is"] ?? row["Defining moves"],
        typical: row["Typical in"] ?? `Tempo ${row["Typical tempo"]}`,
        roots: row.Roots,
        uses: row.Uses ? row.Uses.split(";") : undefined,
        toyMidi: row["toy-midi"],
        gaps: [...row["toy-midi"].matchAll(/`([a-z]+)`/g)].map((m) => m[1]),
        toyMidiText: toyMidiText(row["toy-midi"]),
      })),
    };
  }),
}));
const sources = byName.Sources.rows;
const toyMidi = byName["toy-midi"];

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) =>
  escape(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/(https:\/\/[^\s<)]+)/g, '<a href="$1">$1</a>');

const total = layers
  .flatMap((l) => l.areas)
  .reduce((n, a) => n + a.items.length, 0);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Composition landscape</title>
<style>
  :root {
    --ink: #0b0b0b; --ink-2: #52514e; --muted: #898781; --line: #e1e0d9;
    --surface: #fcfcfb; --page: #f4f3ef;
${Object.entries(ROOTS)
  .map(([k, r]) => `    --r-${k}: ${r.color};`)
  .join("\n")}
  }
  * { box-sizing: border-box; }
  body { margin: 0; font: 14px/1.4 system-ui, sans-serif; color: var(--ink); background: var(--page); }
  header { padding: 16px 20px 6px; }
  h1 { font-size: 22px; margin: 0 0 2px; }
  header p { margin: 0; color: var(--ink-2); }
  .controls { position: sticky; top: 0; z-index: 3; display: flex; flex-wrap: wrap; gap: 6px 14px; align-items: center;
    padding: 8px 20px; background: var(--page); border-bottom: 1px solid var(--line); }
  .controls input[type=search] { width: 15em; padding: 4px 6px; }
  .roots { display: flex; flex-wrap: wrap; gap: 4px; }
  .root { border: 1px solid var(--line); background: #fff; border-radius: 12px; padding: 2px 9px 2px 7px; font: inherit; font-size: 12px; cursor: pointer; color: var(--ink); }
  .root i { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 5px; vertical-align: 0; }
  .root.off { opacity: 0.35; }
  .controls label { display: inline-flex; gap: 4px; align-items: center; font-size: 12.5px; cursor: pointer; }
  #shown { color: var(--muted); margin-left: auto; font-size: 12.5px; }
  .layer { display: grid; grid-template-columns: 92px 1fr; gap: 10px; padding: 10px 20px 4px; }
  .layer-label { padding-top: 8px; }
  .layer-label b { display: block; font-size: 15px; letter-spacing: 0.04em; text-transform: uppercase; }
  .layer-label span { display: block; color: var(--muted); font-size: 11.5px; line-height: 1.3; }
  .layer-areas { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 10px; }
  .area { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 9px 11px 11px; }
  .area h2 { font-size: 14px; margin: 0 0 4px; display: flex; gap: 6px; align-items: baseline; }
  .area h2 .icon { font-size: 16px; }
  .area h2 .n { margin-left: auto; color: var(--muted); font-weight: normal; font-size: 12px; }
  .mix { display: flex; height: 4px; gap: 1px; margin-bottom: 7px; border-radius: 2px; overflow: hidden; }
  .chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .chip { --c: var(--muted); border: 1px solid color-mix(in srgb, var(--c) 30%, white); border-left: 4px solid var(--c);
    background: color-mix(in srgb, var(--c) 9%, white); color: var(--ink); border-radius: 4px; padding: 2px 7px 2px 6px;
    font: inherit; font-size: 12.5px; cursor: pointer; text-align: left; transition: opacity 0.12s; }
  .chip:hover { background: color-mix(in srgb, var(--c) 20%, white); }
  .chip.genre { font-weight: 600; font-size: 13px; padding: 4px 9px 4px 7px; }
  .chip.dim { opacity: 0.18; }
  .chip.lit { background: color-mix(in srgb, var(--c) 28%, white); box-shadow: 0 0 0 2px var(--c); }
  .chip.selected { outline: 2px solid var(--ink); outline-offset: 2px; }
  body.tm .chip.tm-approx { border-style: dashed; border-left-style: solid; }
  body.tm .chip.tm-missing { color: var(--ink-2);
    background: repeating-linear-gradient(135deg, #fff 0 4px, color-mix(in srgb, var(--c) 14%, white) 4px 6px); }
  .tmbar { display: none; width: 100%; gap: 6px 10px; align-items: center; flex-wrap: wrap; font-size: 12px; color: var(--ink-2); }
  body.tm .tmbar { display: flex; }
  .tmbar .sw { display: inline-block; width: 22px; height: 12px; border: 1px solid var(--muted); border-radius: 2px; vertical-align: -1px; margin-right: 3px; }
  .tmbar .sw.approx { border-style: dashed; }
  .tmbar .sw.missing { background: repeating-linear-gradient(135deg, #fff 0 3px, #d9d8d2 3px 5px); }
  .gap { border: 1px solid var(--line); background: #fff; border-radius: 12px; padding: 1px 8px; font: inherit; font-size: 12px; cursor: pointer; color: var(--ink); }
  .gap b { font-weight: 600; color: var(--muted); margin-left: 3px; }
  .gap.on { background: var(--ink); color: #fff; }
  #detail { position: sticky; bottom: 0; z-index: 3; background: var(--surface); border-top: 1px solid var(--line); padding: 9px 20px; min-height: 4.4em; }
  #detail h3 { margin: 0 0 2px; font-size: 15px; display: flex; gap: 8px; align-items: baseline; }
  #detail .tag { font-size: 11.5px; font-weight: normal; padding: 0 7px; border-radius: 9px; color: #fff; }
  #detail .meta { color: var(--ink-2); font-size: 13px; }
  #detail .empty { color: var(--muted); }
  #detail button { font: inherit; font-size: 12px; border: 0; background: none; color: var(--ink-2); text-decoration: underline; cursor: pointer; padding: 0; }
  code { font-size: 12px; background: #eeede8; padding: 0 3px; border-radius: 3px; }
  header { display: flex; align-items: flex-start; gap: 16px; }
  header .about { margin-left: auto; font: inherit; font-size: 13px; border: 1px solid var(--line); background: #fff; border-radius: 14px; padding: 4px 12px; cursor: pointer; white-space: nowrap; }
  .link { font: inherit; font-size: 12px; border: 0; background: none; color: var(--ink-2); text-decoration: underline; cursor: pointer; padding: 0; }
  dialog { width: min(860px, 92vw); max-height: 86vh; border: 1px solid var(--line); border-radius: 12px; padding: 0; background: var(--surface); color: var(--ink); }
  dialog::backdrop { background: rgb(0 0 0 / 0.3); }
  dialog .head { position: sticky; top: 0; display: flex; align-items: center; gap: 14px; padding: 12px 20px; background: var(--surface); border-bottom: 1px solid var(--line); }
  dialog .head b { font-size: 16px; }
  dialog .head nav { display: flex; gap: 12px; font-size: 13px; }
  dialog .head a { color: var(--ink-2); }
  dialog .head button { margin-left: auto; font: inherit; border: 0; background: none; font-size: 20px; cursor: pointer; line-height: 1; }
  dialog .body { padding: 4px 20px 18px; font-size: 13.5px; }
  dialog h3 { font-size: 15px; margin: 18px 0 6px; scroll-margin-top: 64px; }
  dialog table { width: 100%; }
  dialog td a { overflow-wrap: anywhere; }
  dialog td:nth-child(3) { width: 8em; }
  dialog ul { margin: 0; padding-left: 18px; }
  dialog li { margin: 3px 0; }
  .swatch-chip { display: inline-block; padding: 0 6px; border-radius: 3px; border: 1px solid var(--line); border-left: 4px solid var(--c); background: color-mix(in srgb, var(--c) 9%, white); font-size: 12px; }
  table { border-collapse: collapse; margin-top: 8px; background: var(--surface); font-size: 13px; }
  td, th { border: 1px solid var(--line); padding: 4px 8px; text-align: left; vertical-align: top; }
</style>
</head>
<body>
<header>
  <div>
    <h1>Composition landscape</h1>
    <p>${total} named techniques, grouped into layers and colored by the tradition they come from. Click a genre to light up its moves, or a technique to see where it's used.</p>
  </div>
  <button class="about" data-about="#about">ⓘ About</button>
</header>
<div class="controls">
  <input type="search" id="q" placeholder="Search">
  <div class="roots" id="roots">${Object.entries(ROOTS)
    .map(
      ([k, r]) =>
        `<button class="root" data-root="${k}" title="Click to show only this, click again to show all"><i style="background:${r.color}"></i>${r.label}</button>`,
    )
    .join("")}</div>
  <label><input type="checkbox" id="tm"> Can toy-midi play it?</label>
  <span id="shown"></span>
  <div class="tmbar"><span><span class="sw"></span>demo now</span><span><span class="sw approx"></span>approximate</span><span><span class="sw missing"></span>can't demo yet</span>
    <span style="margin-left:8px">Missing in toy-midi:</span><span id="gaps"></span><button class="link" data-about="#about-toy-midi">details</button></div>
</div>
<main id="map"></main>
<div id="detail"><span class="empty">Click a genre to light up the techniques it uses, or a technique to see what it is and which genres use it.</span></div>
<dialog id="about">
  <div class="head"><b>About this map</b>
    <nav><a href="#about">How to read</a><a href="#about-toy-midi">toy-midi</a><a href="#about-sources">Sources</a></nav>
    <button aria-label="Close" data-close autofocus>×</button></div>
  <div class="body">
    <h3 id="about-read">How to read</h3>
    <ul>
      <li><b>Layers.</b> Genres sit on top. Below them, areas stack the way a track is built: Notes (harmony, voicing, melody), Time (rhythm, drums, bass), Shape (form, arranging), and Sound (synthesis, sampling, mixing, voice).</li>
      <li><b>Color is roots</b>, the tradition a technique comes from: ${Object.values(
        ROOTS,
      )
        .map(
          (r) =>
            `<span class="swatch-chip" style="--c:${r.color}">${r.label}</span>`,
        )
        .join(
          " ",
        )}. The thin bar under each area title shows its mix. Click a legend entry to show only that tradition.</li>
      <li><b>Lenses.</b> Click a genre to light up the techniques it uses across every area. Click a technique to see what it is and which genres use it. Esc clears.</li>
      <li><b>Can toy-midi play it?</b> switches to a demo view: plain chips can be demoed now, dashed ones only approximately, and hatched ones not yet. The pills rank what toy-midi is missing, and clicking one lights up what it blocks.</li>
      <li>Roots tags and genre links are judgment calls, and one root per technique is a simplification.</li>
    </ul>
    <h3 id="about-toy-midi">toy-midi</h3>
    <p>A side note for picking demos. ${inline(toyMidi.intro.split(" `✓`")[0])}</p>
    <table><tr><th>Missing</th><th>What that means</th></tr>${toyMidi.rows.map((r) => `<tr><td>${escape(GAPS[r.Key.replace(/`/g, "")])}</td><td>${escape(r["Missing in toy-midi"])}</td></tr>`).join("")}</table>
    <h3 id="about-sources">Sources</h3>
    <p>The taxonomy was seeded from these tables of contents and topic lists, using topic names only. Rows no source covered come from general knowledge of the practice and are worth a skeptical read.</p>
    <table><tr><th>Source</th><th>Seeded</th><th>Evidence</th></tr>${sources.map((s) => `<tr><td>${inline(s.Source)}</td><td>${escape(s.Seeded)}</td><td>${escape(s.Evidence)}</td></tr>`).join("")}</table>
  </div>
</dialog>
<script>
const LAYERS = ${JSON.stringify(layers)};
const GAPS = ${JSON.stringify(GAPS)};
const ROOTS = ${JSON.stringify(ROOTS)};
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const code = (s) => escape(s).replace(/\`([^\`]+)\`/g, "<code>$1</code>");

const map = document.getElementById("map");
const chips = [];
const chipByName = new Map();
const genres = [];
for (const layer of LAYERS) {
  const row = document.createElement("section");
  row.className = "layer";
  row.innerHTML = '<div class="layer-label"><b>' + layer.name + "</b><span>" + escape(layer.hint) + '</span></div><div class="layer-areas"></div>';
  for (const area of layer.areas) {
    const card = document.createElement("div");
    card.className = "area";
    const counts = {};
    for (const item of area.items) counts[item.roots] = (counts[item.roots] || 0) + 1;
    card.innerHTML =
      '<h2><span class="icon">' + area.icon + "</span>" + escape(area.name) + '<span class="n">' + area.items.length + "</span></h2>" +
      '<div class="mix" title="Roots mix">' + Object.keys(ROOTS).filter((k) => counts[k])
        .map((k) => '<div style="flex:' + counts[k] + ";background:var(--r-" + k + ')"></div>').join("") + "</div>" +
      '<div class="chips"></div>';
    const box = card.querySelector(".chips");
    for (const item of area.items) {
      const chip = document.createElement("button");
      chip.className = "chip" + (item.uses ? " genre" : "");
      chip.style.setProperty("--c", "var(--r-" + item.roots + ")");
      chip.textContent = item.name;
      if (item.toyMidi[0] === "~") chip.classList.add("tm-approx");
      if (item.toyMidi[0] === "✗") chip.classList.add("tm-missing");
      chip.title = item.what;
      const entry = { chip, item, area };
      chip.onclick = () => select(entry);
      box.append(chip);
      chips.push(entry);
      if (item.uses) genres.push(entry);
      else chipByName.set(item.name, entry);
    }
    row.querySelector(".layer-areas").append(card);
  }
  map.append(row);
}

let lens = null;
let selected = null;
const detail = document.getElementById("detail");
function tag(roots) {
  return '<span class="tag" style="background:var(--r-' + roots + ')">' + ROOTS[roots].label + "</span>";
}
function select(entry) {
  if (selected === entry) return clear();
  selected = entry;
  const { item, area } = entry;
  let extra;
  if (item.uses) {
    lens = new Set([entry, ...item.uses.map((n) => chipByName.get(n))]);
    extra = '<div class="meta">Uses: ' + item.uses.map(escape).join(" · ") + "</div>";
  } else {
    const usedBy = genres.filter((g) => g.item.uses.includes(item.name));
    lens = new Set([entry, ...usedBy]);
    extra = '<div class="meta">Used in: ' + (usedBy.length ? usedBy.map((g) => escape(g.item.name)).join(" · ") : "no genre linked") + "</div>";
  }
  detail.innerHTML =
    "<h3>" + area.icon + " " + escape(item.name) + tag(item.roots) + ' <button id="clear">clear</button></h3>' +
    "<div>" + escape(item.what) + "</div>" +
    '<div class="meta">' + escape(area.name) + " · " + escape(item.typical) + " · toy-midi: " + escape(item.toyMidiText) + "</div>" + extra;
  document.getElementById("clear").onclick = clear;
  render();
}
function clear() {
  lens = selected = null;
  detail.innerHTML = '<span class="empty">Click a genre to light up the techniques it uses, or a technique to see what it is and which genres use it.</span>';
  render();
}

const q = document.getElementById("q");
let rootFilter = null;
for (const b of document.querySelectorAll(".root")) {
  b.onclick = () => {
    rootFilter = rootFilter === b.dataset.root ? null : b.dataset.root;
    for (const o of document.querySelectorAll(".root")) o.classList.toggle("off", !!rootFilter && o.dataset.root !== rootFilter);
    render();
  };
}
function render() {
  const text = q.value.trim().toLowerCase();
  let shown = 0;
  for (const entry of chips) {
    const { chip, item } = entry;
    const match =
      (!rootFilter || item.roots === rootFilter) &&
      (!text || (item.name + " " + item.what + " " + item.typical).toLowerCase().includes(text)) &&
      (!lens || lens.has(entry));
    chip.classList.toggle("dim", !match);
    chip.classList.toggle("lit", !!lens && lens.has(entry));
    chip.classList.toggle("selected", entry === selected);
    shown += match;
  }
  document.getElementById("shown").textContent = shown + " of " + chips.length + " shown";
}
q.addEventListener("input", render);
document.addEventListener("keydown", (e) => e.key === "Escape" && clear());
document.getElementById("tm").addEventListener("input", (e) => {
  document.body.classList.toggle("tm", e.target.checked);
  if (!e.target.checked && selectedGap) toggleGap(selectedGap);
});

// Gap pills, ranked by how many techniques each one touches. Clicking one is a lens.
let selectedGap = null;
const gapCounts = {};
for (const { item } of chips) for (const g of item.gaps) gapCounts[g] = (gapCounts[g] || 0) + 1;
const gapBox = document.getElementById("gaps");
for (const [g, n] of Object.entries(gapCounts).sort((a, b) => b[1] - a[1])) {
  const b = document.createElement("button");
  b.className = "gap";
  b.dataset.gap = g;
  b.innerHTML = escape(GAPS[g]) + "<b>" + n + "</b>";
  b.onclick = () => toggleGap(g);
  gapBox.append(b, " ");
}
function toggleGap(g) {
  selectedGap = selectedGap === g ? null : g;
  for (const b of gapBox.querySelectorAll(".gap")) b.classList.toggle("on", b.dataset.gap === selectedGap);
  selected = null;
  if (selectedGap) {
    lens = new Set(chips.filter((c) => c.item.gaps.includes(g)));
    detail.innerHTML = "<h3>Missing in toy-midi: " + escape(GAPS[g]) + ' <button id="clear">clear</button></h3><div class="meta">' + lens.size + " techniques are blocked or limited by it.</div>";
    document.getElementById("clear").onclick = () => toggleGap(g);
  } else {
    clear();
  }
  render();
}
render();

// About dialog, also reachable by #about, #about-toy-midi, and #about-sources.
const about = document.getElementById("about");
function openAbout(hash) {
  if (!about.open) about.showModal();
  const target = hash === "#about" ? "about-read" : hash.slice(1);
  document.getElementById(target)?.scrollIntoView({ block: "start" });
}
for (const b of document.querySelectorAll("[data-about]")) b.onclick = () => (location.hash = b.dataset.about);
for (const a of about.querySelectorAll("nav a")) a.onclick = (e) => { e.preventDefault(); history.replaceState(null, "", a.getAttribute("href")); openAbout(a.getAttribute("href")); };
about.querySelector("[data-close]").onclick = () => about.close();
about.addEventListener("click", (e) => e.target === about && about.close());
about.addEventListener("close", () => history.replaceState(null, "", location.pathname + location.search));
const route = () => location.hash.startsWith("#about") && openAbout(location.hash);
addEventListener("hashchange", route);
route();
</script>
</body>
</html>
`;

fs.writeFileSync(path.join(dir, "landscape.html"), html);
console.log(`landscape.html: ${layers.length} layers, ${total} techniques`);
