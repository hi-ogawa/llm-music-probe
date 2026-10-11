// Apply arrangement.txt to base.json, then write full.json, summary.md, and load.js. Purely mechanical.
import { readFileSync, writeFileSync } from "node:fs";
const here = (f) => new URL(f, import.meta.url);
const base = JSON.parse(readFileSync(here("base.json"), "utf8"));
const CHART = JSON.parse(readFileSync(here("chords.json"), "utf8")); // [[startBeat, lengthBeats, name]]
const DRUM = {
  kick: 36,
  rim: 37,
  side: 37,
  snare: 38,
  clap: 39,
  snare2: 40,
  hat: 42,
  phat: 44,
  ohat: 46,
  ltom: 45,
  mtom: 47,
  htom: 50,
  crash: 49,
  ride: 51,
  bell: 53,
  tamb: 54,
  cowbell: 56,
  bongo: 60,
  lbongo: 61,
  conga: 63,
  lconga: 64,
  cabasa: 69,
  maracas: 70,
  claves: 75,
  shaker: 82,
};
const DRUM_NAME = Object.fromEntries(
  Object.entries(DRUM)
    .reverse()
    .map(([k, v]) => [v, k]),
);
Object.assign(DRUM_NAME, {
  35: "kick",
  37: "rim",
  38: "snare",
  40: "snare",
  41: "ltom",
  43: "ltom",
  48: "htom",
  57: "crash",
  59: "ride",
});
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 },
  NAMES = "C C# D Eb E F F# G Ab A Bb B".split(" ");
const nm = (p) => `${NAMES[p % 12]}${Math.floor(p / 12) - 1}`;
const pitchOf = (s) => {
  if (/^\d+$/.test(s)) {
    return +s;
  }
  if (s in DRUM) {
    return DRUM[s];
  }
  const m = /^([A-G])(#|b)?(-?\d)$/.exec(s);
  if (!m) {
    throw new Error(`bad pitch ${s}`);
  }
  return (
    PC[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + (+m[3] + 1) * 12
  );
};
const posOf = (s) => {
  const m = /^([1-4])(e|&|a)?([+-]\d*\.?\d+)?$/.exec(s);
  if (!m) {
    throw new Error(`bad pos ${s}`);
  }
  return (
    +m[1] -
    1 +
    { undefined: 0, e: 0.25, "&": 0.5, a: 0.75 }[m[2]] +
    (m[3] ? +m[3] : 0)
  );
};
const num = (s) =>
  s.includes("/") ? s.split("/").reduce((a, b) => a / b) : +s;

const tracks = structuredClone(base);
const chart = CHART.map(([s, , n]) => [s, n]);
const find = (name) => {
  const t = tracks.find((t) => t.name === name);
  if (!t) {
    throw new Error(
      `no track named "${name}" (have: ${tracks.map((t) => t.name).join(", ")})`,
    );
  }
  return t;
};
// The rhythm section and the harmony are fixed. Only the top layer is open.
const FIXED = new Set([
  "Drums Standard",
  "Drums Brush",
  "Drums 808 Layer",
  "Perc Shaker/Tamb",
  "Bass Fingered",
  "Bass Synth",
  "Rhodes Keys",
  "String Bed",
  "Organ Layer",
]);
const open = (name) => {
  if (FIXED.has(name)) {
    throw new Error(
      `"${name}" is part of the fixed rhythm section or harmony and cannot be changed`,
    );
  }
  return name;
};
let cur = null;
const text = readFileSync(here("arrangement.txt"), "utf8");
for (const [i, raw] of text.split("\n").entries()) {
  const line = raw.replace(/(^|\s)#.*/, "").trim();
  if (!line) {
    continue;
  }
  const f = line.split(/\s+/);
  try {
    if (f[0] === "track") {
      // track <Name...> <program> <gain> [kit]: new track, or replace a same-named one; "kit" means a drum kit (bank 128)
      const kit = f.at(-1) === "kit",
        g = kit ? f.slice(0, -1) : f;
      const [program, gain, bank] = [+g.at(-2), +g.at(-1), kit ? 128 : 0];
      if (!Number.isInteger(program) || !(gain >= 0)) {
        throw new Error("track needs <Name> <program> <gain> [kit]");
      }
      const name = open(g.slice(1, -2).join(" "));
      const t = { name, bank, program, gain, notes: [] };
      const at = tracks.findIndex((x) => x.name === name);
      if (at >= 0) {
        tracks[at] = t;
      } else {
        tracks.push(t);
      }
      cur = t;
    } else if (f[0] === "edit") {
      cur = find(open(f.slice(1).join(" ")));
    } else if (f[0] === "drop") {
      tracks.splice(tracks.indexOf(find(open(f.slice(1).join(" ")))), 1);
      cur = null;
    } else if (f[0] === "clear") {
      // clear <Name...> <bar> [toBar]
      const lastNum =
        f.length -
        (f.at(-2) && /^\d+$/.test(f.at(-2)) && /^\d+$/.test(f.at(-1)) ? 2 : 1);
      const name = f.slice(1, lastNum).join(" ");
      const [from, to] = f.slice(lastNum).map(Number);
      const t = find(open(name));
      t.notes = t.notes.filter((n) => {
        const b = Math.floor(Math.round(n.start * 4) / 16) + 1;
        return b < from || b > (to ?? from);
      });
      cur = t;
    } else if (f[0] === "pan") {
      // pan <Name...> <-1..1>: a mix setting, allowed on every track including the fixed ones
      const v = +f.at(-1);
      if (!(v >= -1 && v <= 1)) {
        throw new Error("pan takes a value from -1 (left) to 1 (right)");
      }
      find(f.slice(1, -1).join(" ")).pan = v;
    } else if (f[0] === "set") {
      // set <Name...> program|gain|bank <value>
      const key = f.at(-2),
        t = find(open(f.slice(1, -2).join(" ")));
      if (!["program", "gain", "bank"].includes(key)) {
        throw new Error(`set takes program, gain or bank`);
      }
      t[key] = +f.at(-1);
    } else if (f[0] === "chord") {
      throw new Error(
        "the harmony is fixed, so the chord chart cannot be relabeled",
      );
      // chord <bar> <pos> <label>: relabel the chart from that point
      const start = (+f[1] - 1) * 4 + posOf(f[2]);
      const k = chart.findIndex(([s]) => s >= start);
      if (k >= 0 && chart[k][0] === start) {
        chart[k][1] = f[3];
      } else {
        chart.splice(k < 0 ? chart.length : k, 0, [start, f[3]]);
      }
    } else {
      if (!cur) {
        throw new Error("note line before any track/edit/clear");
      }
      const [bar, pos, pitch, len, vel] = f;
      const start = (+bar - 1) * 4 + posOf(pos);
      const n = {
        pitch: pitchOf(pitch),
        start,
        duration: num(len),
        velocity: +vel,
      };
      if (
        !(
          start >= 0 &&
          start + n.duration <= 144.001 &&
          n.duration > 0 &&
          Number.isInteger(n.velocity) &&
          n.velocity >= 1 &&
          n.velocity <= 127 &&
          n.pitch >= 0 &&
          n.pitch <= 127
        )
      ) {
        throw new Error(
          "out of range (notes must end by beat 144, velocity 1-127)",
        );
      }
      cur.notes.push(n);
    }
  } catch (e) {
    console.error(
      `arrangement.txt line ${i + 1}: ${raw.trim()}\n  ${e.message}`,
    );
    process.exit(1);
  }
}
for (const t of tracks) {
  t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}
writeFileSync(here("full.json"), JSON.stringify(tracks));

// Summary: bar by bar, every track, positions rounded to 16ths
const SECTIONS = [
  ["intro", 4],
  ["verseA", 8],
  ["bridgeB", 8],
  ["breakdown", 4],
  ["verseA2", 8],
  ["outro", 4],
];
const q = (b) => Math.round(b * 4) / 4;
const pos = (b) =>
  `${Math.floor(b) + 1}${{ 0: "", 0.25: "e", 0.5: "&", 0.75: "a" }[b - Math.floor(b)]}`;
const frac = (d) => {
  const x = Math.round(d * 4);
  return x % 4 === 0 ? `${x / 4}` : x % 2 === 0 ? `${x / 2}/2` : `${x}/4`;
};
const out = [
  "# Song summary (generated by build.mjs; positions rounded to 16ths, so small timing offsets are not shown)",
  "",
  "Tracks: " +
    tracks
      .map(
        (t) =>
          `${t.name} [${t.bank === 128 ? "drum kit " : "GM "}${t.program}, gain ${t.gain}, pan ${t.pan ?? 0}, ${t.notes.length} notes]`,
      )
      .join("; "),
];
let bar = 0;
for (const [sec, bars] of SECTIONS) {
  out.push("", `## ${sec} (bars ${bar + 1}-${bar + bars})`);
  for (let b = bar; b < bar + bars; b++) {
    const ch = chart
      .filter(([s]) => s >= b * 4 && s < b * 4 + 4)
      .map(([s, n]) => (s === b * 4 ? n : `${n}@${pos(s - b * 4)}`));
    out.push("", `### bar ${b + 1}${ch.length ? " | " + ch.join(" ") : ""}`);
    for (const t of tracks) {
      const ns = t.notes.filter((n) => Math.floor(q(n.start) / 4) === b);
      if (!ns.length) {
        continue;
      }
      const v = Math.round(ns.reduce((a, n) => a + n.velocity, 0) / ns.length);
      let body;
      if (t.bank === 128) {
        const g = {};
        for (const n of ns) {
          const k = DRUM_NAME[n.pitch] ?? `drum${n.pitch}`;
          (g[k] ??= []).push(
            pos(q(n.start) - b * 4) + (n.velocity < 55 ? "(g)" : ""),
          );
        }
        body = Object.entries(g)
          .map(([k, ps]) => `${k} ${[...new Set(ps)].join(" ")}`)
          .join(" | ");
      } else {
        const groups = [];
        for (const n of ns) {
          const last = groups.at(-1);
          if (last && n.start - last.start < 0.08) {
            last.ps.push(n.pitch);
          } else {
            groups.push({ start: n.start, ps: [n.pitch], d: n.duration });
          }
        }
        body = groups
          .map(
            (g) =>
              `${pos(q(g.start) - b * 4)}:${g.ps.length > 1 ? `[${g.ps.map(nm).join(" ")}]` : nm(g.ps[0])}(${frac(g.d)})`,
          )
          .join(" ");
      }
      out.push(`- ${t.name} (v${v}): ${body}`);
    }
  }
  bar += bars;
}
writeFileSync(here("summary.md"), out.join("\n") + "\n");
writeFileSync(
  here("load.js"),
  `
const tracks = ${JSON.stringify(tracks)};
runtime.pause();
for (const t of runtime.store.get().midiTracks) runtime.removeMidiTrack(t.id);
for (const t of tracks) {
  const before = new Set(runtime.store.get().midiTracks.map((x) => x.id));
  await runtime.addMidiTrack({ bank: t.bank, program: t.program });
  const id = runtime.store.get().midiTracks.find((x) => !before.has(x.id)).id;
  runtime.setTrackName({ id, name: t.name });
  runtime.setTrackMix(id, { gain: t.gain });
  runtime.setMidiTrackNotes(id, t.notes.map((n) => ({ id: crypto.randomUUID(), ...n })));
  runtime.setMidiTrackSettings(id, { viewMode: "overview" });
}
runtime.seek(0);
await runtime.play();
return runtime.store.get().midiTracks.map((t) => [t.name, t.program, t.notes.length]);
`,
);
// Mix pass: set pan by track name and the project comment, in place, so the listener's mute and solo states are kept
let comment = "";
try {
  comment = readFileSync(here("comment.md"), "utf8");
} catch {}
writeFileSync(
  here("apply-mix.js"),
  `
const pans = ${JSON.stringify(Object.fromEntries(tracks.map((t) => [t.name, t.pan ?? 0])))};
const done = [];
for (const t of runtime.store.get().midiTracks) {
  if (t.name in pans) { runtime.setTrackPan(t.id, pans[t.name]); done.push([t.name, pans[t.name]]); }
}
runtime.setComment(${JSON.stringify(comment)});
return { pans: done, commentLength: runtime.store.get().comment.length };
`,
);
// Sync pass: update tracks in place by name, so the listener's mute, solo and row height are kept
writeFileSync(
  here("sync.js"),
  `
const tracks = ${JSON.stringify(tracks)};
const want = new Set(tracks.map((t) => t.name));
const report = [];
for (const t of runtime.store.get().midiTracks) if (!want.has(t.name)) { runtime.removeMidiTrack(t.id); report.push(["removed", t.name]); }
const key = (n) => [n.pitch, n.start, n.duration, n.velocity].join();
for (const t of tracks) {
  let cur = runtime.store.get().midiTracks.find((x) => x.name === t.name);
  if (!cur) {
    const id = await runtime.addMidiTrack({ bank: t.bank, program: t.program });
    runtime.setTrackName({ id, name: t.name });
    runtime.setMidiTrackSettings(id, { viewMode: "overview" });
    runtime.setTrackHeight(id, 72);
    cur = runtime.store.get().midiTracks.find((x) => x.id === id);
    report.push(["added", t.name]);
  } else if ((cur.bank ?? 0) !== t.bank || cur.program !== t.program) {
    await runtime.setMidiTrackPreset(cur.id, { bank: t.bank, program: t.program });
    report.push(["preset", t.name]);
  }
  if (cur.gain !== t.gain) { runtime.setTrackMix(cur.id, { gain: t.gain }); report.push(["gain", t.name]); }
  if ((cur.pan ?? 0) !== (t.pan ?? 0)) { runtime.setTrackPan(cur.id, t.pan ?? 0); report.push(["pan", t.name]); }
  const a = cur.notes.map(key).sort().join("|"), b = t.notes.map(key).sort().join("|");
  if (a !== b) { runtime.setMidiTrackNotes(cur.id, t.notes.map((n) => ({ id: crypto.randomUUID(), ...n }))); report.push(["notes", t.name]); }
}
${comment ? "if (runtime.store.get().comment !== " + JSON.stringify(comment) + ") { runtime.setComment(" + JSON.stringify(comment) + "); report.push(['comment']); }" : ""}
return report;
`,
);
console.log(
  "ok: " + tracks.map((t) => `${t.name}(${t.notes.length})`).join(", "),
);
