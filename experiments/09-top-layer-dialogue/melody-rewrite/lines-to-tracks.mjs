// Convert a hand-written melody file into toy-midi track data. Purely mechanical.
// Format:
//   track <Name> <program> <gain>     starts a track (bank 0)
//   <bar> <pos>[+-offset] <pitch> <length> <velocity>
//   # comment
// bar is 1-based; pos is 1, 1e, 1&, 1a ... 4a; offset in beats (e.g. 2&+0.06);
// pitch is a note name with octave, C4 = 60 (e.g. F5, Bb4, C#5); length in beats, decimal or fraction (1/2).
import { readFileSync } from "node:fs";
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const pitchOf = (s) => {
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
export function parse(text) {
  const tracks = [];
  for (const [i, raw] of text.split("\n").entries()) {
    const line = raw.replace(/(^|\s)#.*/, "").trim();
    if (!line) {
      continue;
    }
    const f = line.split(/\s+/);
    try {
      if (f[0] === "track") {
        tracks.push({
          name: f.slice(1, -2).join(" "),
          bank: 0,
          program: +f.at(-2),
          gain: +f.at(-1),
          notes: [],
        });
        continue;
      }
      const [bar, pos, pitch, len, vel] = f;
      const start = (+bar - 1) * 4 + posOf(pos);
      const note = {
        pitch: pitchOf(pitch),
        start,
        duration: num(len),
        velocity: +vel,
      };
      if (
        !(
          start >= 0 &&
          start + note.duration <= 144 &&
          note.velocity >= 1 &&
          note.velocity <= 127 &&
          Number.isInteger(note.velocity)
        )
      ) {
        throw new Error("out of range");
      }
      tracks.at(-1).notes.push(note);
    } catch (e) {
      throw new Error(`line ${i + 1}: ${raw.trim()}: ${e.message}`);
    }
  }
  return tracks;
}
export function parts() {
  return parse(readFileSync(new URL("./melody.txt", import.meta.url), "utf8"));
}
if (process.argv[2]) {
  const tracks = parse(readFileSync(process.argv[2], "utf8"));
  for (const t of tracks) {
    const p = t.notes.map((n) => n.pitch);
    console.log(
      t.name,
      t.program,
      t.notes.length,
      "notes, MIDI",
      Math.min(...p),
      "-",
      Math.max(...p),
    );
  }
}
