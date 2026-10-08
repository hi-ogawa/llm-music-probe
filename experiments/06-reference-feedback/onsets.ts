import fs from "node:fs";
import { expandScore } from "../../src/score/expand.ts";
import { parseScore } from "../../src/score/parse.ts";

// Print each voice's onsets per bar on a 14-step grid relative to the bar,
// so scores in 7/8 and 7/4, or at different tempos, compare directly.
// Target for 2 2 1.5 1.5: 0 4 8 11. Original even last group: 8 10 12.
const GRID = 14;

for (const file of process.argv.slice(2)) {
  const { score } = parseScore(fs.readFileSync(file, "utf-8"));
  const song = expandScore(score, { loops: 1 }).song;
  const bars: { start: number; beats: number }[] = [];
  song.meters.forEach((meter, i) => {
    const end = song.meters[i + 1]?.start ?? song.length;
    for (let start = meter.start; start < end; start += meter.beats) {
      bars.push({ start, beats: meter.beats });
    }
  });
  const tempos = song.tempos.map((t) => t.bpm).join(",");
  const meters = song.meters.map((m) => m.beats).join(",");
  console.log(`${file}  tempo ${tempos}  beats ${meters}  bars ${bars.length}`);
  for (const voice of song.voices) {
    const rows = bars.map((bar) => {
      const steps = new Set<number>();
      for (const note of song.notes) {
        if (note.voice !== voice.name) {
          continue;
        }
        if (note.start < bar.start || note.start >= bar.start + bar.beats) {
          continue;
        }
        const step = ((note.start - bar.start) / bar.beats) * GRID;
        steps.add(Math.round(step * 100) / 100);
      }
      return [...steps].sort((a, b) => a - b).join(" ") || "-";
    });
    console.log(
      `  ${voice.name.padEnd(8)} ${rows.map((r) => r.padEnd(24)).join("| ")}`,
    );
  }
}
