import fs from "node:fs";

/** Parses each "## Section" of README.md into its table rows, keyed by header. */
export function parseNote(file) {
  const areas = [];
  let current;
  let headers;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const heading = line.match(/^## (.+)/);
    if (heading) {
      current = { name: heading[1], rows: [], intro: "" };
      headers = undefined;
      areas.push(current);
      continue;
    }
    if (!current || !line.startsWith("|")) {
      headers = undefined;
      if (current && line.trim() && !current.rows.length) {
        current.intro += (current.intro ? " " : "") + line.trim();
      }
      continue;
    }
    const cells = line
      .slice(1, -1)
      .split("|")
      .map((cell) => cell.trim());
    if (!headers) {
      headers = cells;
    } else if (!cells.every((cell) => /^-+$/.test(cell))) {
      current.rows.push(
        Object.fromEntries(headers.map((h, i) => [h, cells[i]])),
      );
    }
  }
  return areas;
}
