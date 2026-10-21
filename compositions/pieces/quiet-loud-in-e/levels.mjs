// Per-track, per-bar RMS (dB, gain applied) from rendered stems, for balancing.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const p = JSON.parse(readFileSync("quiet-loud.json"));
const SR = 44100;
for (const t of p.midiTracks) {
  const buf = execFileSync("ffmpeg", ["-v","error","-i",`stems/${t.name.replaceAll(" ","_")}.wav`,"-ac","1","-f","f32le","-"], { maxBuffer: 1<<30 });
  const x = new Float32Array(buf.buffer, buf.byteOffset, buf.length/4);
  const row = [];
  for (let b = 1; b <= 24; b++) { let s=0; const a=(b-1)*2*SR, e=b*2*SR; for (let i=a;i<e&&i<x.length;i++) s+=x[i]*x[i]; const v=10*Math.log10(s/(e-a)*t.gain*t.gain+1e-12); row.push(v<-80?"  .  ":v.toFixed(0).padStart(5)); }
  console.log(t.name.padEnd(15), row.join(""));
}
