// Gtr 2's 16th arpeggio cells in Seven Corners, two takes.
// ring: same notes, each cell note on its own string, ringing until that string plays again,
//   accents pulled into the same velocity layer.
// space: a compositional rewrite, only each cell's first note, as a ringing dotted-8th line.
import fs from "node:fs";
const [input, output, mode] = process.argv.slice(2);
const p = JSON.parse(fs.readFileSync(input, "utf8"));
let seed = 3;
const jit = (a) => ((seed = (seed * 16807) % 2147483647) / 2147483647 * 2 - 1) * a;
for (const t of p.midiTracks.filter((t) => t.name.startsWith("Gtr 2"))) {
  const fast = t.notes.filter((n) => Math.abs(n.duration - 0.325) < 0.01).sort((a, b) => a.start - b.start);
  const keep = t.notes.filter((n) => !fast.includes(n));
  const cells = [];
  for (const n of fast) {
    const last = cells.at(-1);
    if (!last || last.length === 3 || n.start - last.at(-1).start > 0.4) cells.push([n]);
    else last.push(n);
  }
  const runEnd = (cell) => {
    let i = cells.indexOf(cell);
    while (cells[i + 1] && cells[i + 1][0].start - cells[i].at(-1).start < 0.4) i++;
    return cells[i].at(-1).start + 0.5;
  };
  const out = [];
  if (mode === "ring") {
    cells.forEach((cell, ci) => {
      const ranks = [...cell].sort((a, b) => a.pitch - b.pitch);
      cell.forEach((n, k) => {
        const s = ranks.indexOf(n);
        const nextCell = cells[ci + 1];
        const nextOnString = nextCell && nextCell[0].start - cell.at(-1).start < 0.4 ? [...nextCell].sort((a, b) => a.pitch - b.pitch)[s] : undefined;
        const end = nextOnString ? nextOnString.start : runEnd(cell);
        out.push({ ...n, duration: Math.min(1.5, end - n.start), velocity: Math.round((k === 0 ? 86 : 76) + jit(4)) });
      });
    });
  } else {
    const heads = cells.map((c) => c[0]);
    heads.forEach((n, i) => {
      const next = heads[i + 1];
      const end = next && next.start - n.start < 1 ? next.start + 0.2 : n.start + 1;
      out.push({ ...n, duration: end - n.start, velocity: Math.round(84 + jit(5)) });
    });
  }
  t.notes = [...keep, ...out];
}
fs.writeFileSync(output, JSON.stringify(p));
