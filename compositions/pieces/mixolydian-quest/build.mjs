import { deflateRawSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const B = 4; // beats per bar
const bar = (n) => (n - 1) * B;
const N = (pitch, start, duration, velocity = 100) => ({ pitch, start, duration, velocity });

// Harmony per bar: array of [chord, startBeatInBar, lengthBeats]
const A_HARM = [["D"], ["D"], ["C"], ["G"], ["D"], ["D"], ["C", "G"], ["D"]];
const A3_HARM = [["D"], ["D"], ["C"], ["G"], ["D"], ["D"], ["C"], ["G"]];
const B_HARM = [["G"], ["F"], ["F"], ["C"], ["G"], ["Em"], ["C"], ["G"]];
const HARM = [...A_HARM, ...A_HARM, ...B_HARM, ...A3_HARM];
const chordsInBar = (i) => {
  const cs = HARM[i];
  const len = B / cs.length;
  return cs.map((c, k) => ({ c, s: bar(i + 1) + k * len, len }));
};
const section = (i) => (i < 8 ? "A1" : i < 16 ? "A2" : i < 24 ? "B" : "A3");

const BASS_ROOT = { D: 38, C: 36, G: 43, F: 41, Em: 40 };
const ARP = { D: [62, 66, 69, 72], C: [60, 64, 67, 71], G: [59, 62, 67, 71], F: [60, 65, 69, 72], Em: [59, 64, 67, 71] };
const EP = { D: [62, 66, 69, 72], C: [60, 64, 67, 71], G: [59, 62, 67, 71] };
const PAD = { D: [57, 60, 62, 66], C: [55, 60, 64, 67], G: [55, 59, 62, 67], F: [53, 57, 60, 65], Em: [52, 55, 59, 64] };

// ---- Lead (D5 = 74) ----
const seq = (startBeat, items, vel = 100) => {
  const out = [];
  let t = startBeat;
  for (const [p, d] of items) {
    if (p != null) out.push(N(p, t, d, vel));
    t += d;
  }
  return out;
};
const riff = [[74, .5], [69, .5], [74, .5], [78, .5], [76, .5], [74, .5], [72, 1]]; // hook, lands on C natural
const riffSeq = [[72, .5], [67, .5], [72, .5], [76, .5], [74, .5], [72, .5], [71, 1]]; // tonal sequence a step down
const answer = [[69, 1], [71, .5], [72, .5], [74, 2]];
const bar4 = [[71, 1], [74, .5], [76, .5], [74, 2]];
const riffHigh = [[74, .5], [69, .5], [74, .5], [78, .5], [81, .5], [79, .5], [78, .5], [76, .5]];
const bar7 = [[76, 1], [72, 1], [74, 1], [71, 1]];
const riffInv = [[74, .5], [79, .5], [74, .5], [71, .5], [72, .5], [74, .5], [76, 1]]; // tonal inversion
const answerInv = [[79, 1], [78, .5], [76, .5], [74, 2]];

const lead = [];
const leadA = (b0, { last, sixth }) => {
  lead.push(...seq(bar(b0), riff));
  lead.push(...seq(bar(b0 + 1), answer));
  lead.push(...seq(bar(b0 + 2), riffSeq));
  lead.push(...seq(bar(b0 + 3), bar4));
  lead.push(...seq(bar(b0 + 4), riff));
  lead.push(...seq(bar(b0 + 5), sixth));
  lead.push(...seq(bar(b0 + 6), bar7));
  lead.push(...seq(bar(b0 + 7), last));
};
leadA(1, { sixth: riff.slice(0, 4).concat([[76, .5], [74, .5], [72, 1]]), last: [[74, 2], [null, 1.5], [69, .5]] });
leadA(9, { sixth: riffHigh, last: [[74, 2], [72, .5], [71, .5], [69, 1]] });
// B: augmentation + tonal sequence, then fragmentation/diminution
lead.push(...seq(bar(17), [[67, 1], [62, 1], [67, 1], [71, 1], [69, 1], [67, 1], [65, 2]]));
lead.push(...seq(bar(19), [[65, 1], [60, 1], [65, 1], [69, 1], [67, 1], [65, 1], [64, 2]]));
lead.push(...seq(bar(21), [[71, .5], [67, .5], [71, 1], [74, .5], [71, .5], [74, 1]]));
lead.push(...seq(bar(22), [[76, .5], [71, .5], [76, 1], [79, 2]]));
lead.push(...seq(bar(23), [[76, 1], [74, 1], [72, 2]]));
lead.push(...seq(bar(24), [[71, 1], [72, 1], [69, 2]]));
// A3
lead.push(...seq(bar(25), riff));
lead.push(...seq(bar(26), answer));
lead.push(...seq(bar(27), riffSeq));
lead.push(...seq(bar(28), bar4));
lead.push(...seq(bar(29), riffInv));
lead.push(...seq(bar(30), answerInv));
lead.push(...seq(bar(31), [[76, 1], [72, 1], [76, .5], [79, .5], [76, 1]]));
lead.push(...seq(bar(32), [[74, 1], [71, 1], [72, 1], [69, 1]])); // pickup back into bar 1

// Doubling: unison in A2, octave below in B, octave above in A3
const double = lead.flatMap((n) => {
  const s = n.start;
  if (s >= bar(9) && s < bar(17)) return [{ ...n, velocity: 80 }];
  if (s >= bar(17) && s < bar(25)) return [{ ...n, pitch: n.pitch - 12, velocity: 80 }];
  if (s >= bar(25)) return [{ ...n, pitch: n.pitch + 12, velocity: 70 }];
  return [];
});

// ---- Bass: octave bass ----
const bass = [];
for (let i = 0; i < 32; i++) {
  for (const { c, s, len } of chordsInBar(i)) {
    const r = BASS_ROOT[c];
    if (section(i) === "B") {
      // half-time: long low root, octave pickup
      for (let t = 0; t < len; t += 2) {
        bass.push(N(r, s + t, 1.4, 105));
        bass.push(N(r + 12, s + t + 1.5, 0.45, 90));
      }
    } else {
      for (let t = 0; t < len; t += 0.5) {
        const hi = (t * 2) % 2 === 1;
        bass.push(N(hi ? r + 12 : r, s + t, 0.42, hi ? 88 : 105));
      }
    }
  }
}

// ---- Arp ----
const arp = [];
for (let i = 0; i < 32; i++) {
  const sec = section(i);
  for (const { c, s, len } of chordsInBar(i)) {
    const tones = ARP[c];
    if (sec === "B") {
      // gated down-arp on eighths
      const down = [...tones].reverse();
      for (let k = 0; k < len * 2; k++) arp.push(N(down[k % 4] + 12, s + k * 0.5, 0.2, k % 2 ? 60 : 75));
    } else {
      const pat = sec === "A3" ? [0, 1, 2, 3, 2, 1] : [0, 1, 2, 3];
      for (let k = 0; k < len * 4; k++) {
        const p = tones[pat[k % pat.length]] + 12;
        arp.push(N(p, s + k * 0.25, 0.22, k % 4 === 0 ? 82 : 64));
      }
    }
  }
}

// ---- DX EP stabs (A sections) ----
const ep = [];
const EP_RHYTHM = [[0, 1], [1.5, 0.5], [2.5, 1]];
for (let i = 0; i < 32; i++) {
  if (section(i) === "B") continue;
  for (const [t, d] of EP_RHYTHM) {
    const at = bar(i + 1) + t;
    const ch = chordsInBar(i).find((x) => at >= x.s && at < x.s + x.len).c;
    for (const p of EP[ch]) ep.push(N(p, at, d, 76));
  }
}

// ---- Juno-style pad (B + A3) ----
const pad = [];
for (let i = 16; i < 32; i++) {
  for (const { c, s, len } of chordsInBar(i)) for (const p of PAD[c]) pad.push(N(p, s, len, 58));
}

// ---- Drums (TR-808): kick/snare/toms track + hats track ----
const KICK = 36, SNARE = 38, CLAP = 39, CH = 42, OH = 46, CRASH = 49;
const TOMS = [50, 48, 47, 45, 43, 41];
const kit = [];
const hats = [];
for (let i = 0; i < 32; i++) {
  const s = bar(i + 1);
  const sec = section(i);
  const isFillBar = [7, 15, 23, 31].includes(i);
  const groove = sec === "B"
    ? { kick: [0, 1.5], snare: [2], hat: [0, 1, 2, 3], hatLen: 1 }
    : sec === "A3"
      ? { kick: [0, 1, 2, 3], snare: [0.5, 1.5, 2.5, 3.5], hat: [...Array(16)].map((_, k) => k / 4), hatLen: 0.25 }
      : { kick: [0, 1.5, 2], snare: [1, 3], hat: [...Array(8)].map((_, k) => k / 2), hatLen: 0.5 };
  const fillFrom = isFillBar ? (i === 23 ? 0 : 2) : B;
  for (const t of groove.kick) if (t < fillFrom) kit.push(N(KICK, s + t, 0.5, 115));
  for (const t of groove.snare) if (t < fillFrom) {
    kit.push(N(SNARE, s + t, 0.5, sec === "A3" ? 92 : 105));
    kit.push(N(CLAP, s + t, 0.5, sec === "A3" ? 80 : 95));
  }
  for (const t of groove.hat) if (t < fillFrom) {
    const open = sec !== "A3" && t === 3.5;
    hats.push(N(open ? OH : CH, s + t, groove.hatLen, t % 1 === 0 ? 90 : 68));
  }
  if ([0, 8, 16, 24].includes(i)) kit.push(N(CRASH, s, 2, 105));
  if (isFillBar) {
    if (i === 23) {
      // snare build into A3: eighths then 16ths, rising velocity
      for (let k = 0; k < 4; k++) kit.push(N(SNARE, s + k * 0.5, 0.25, 70 + k * 4));
      for (let k = 0; k < 8; k++) kit.push(N(SNARE, s + 2 + k * 0.25, 0.25, 86 + k * 4));
      kit.push(N(KICK, s, 0.5, 115));
    } else if (i === 15) {
      for (let k = 0; k < 8; k++) kit.push(N(SNARE, s + 2 + k * 0.25, 0.25, 80 + k * 4));
    } else {
      // tom fill (bar 32's fill leads back into bar 1's crash)
      for (let k = 0; k < 8; k++) kit.push(N(TOMS[Math.floor(k / 1.4)], s + 2 + k * 0.25, 0.25, 100));
    }
  }
}

const track = (name, program, notes, extra = {}) => ({
  name, program, notes, gain: 0.8, muted: false, soloed: false,
  viewMode: "editor", height: 110, keySignature: { fifths: 2, mode: "major" }, ...extra,
});

const project = {
  title: "Mixolydian Quest (AABA loop)",
  comment: "32-bar AABA game loop in D Mixolydian, 128 BPM. A1 1-8, A2 9-16, B 17-24 (half-time), A3 25-32 (double-time). Bar 32 (G) resolves into bar 1 (D) as the C-G-D double-plagal across the loop seam.",
  tempo: 128,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: { range: { startBeat: 0, endBeat: 128 }, enabled: true },
  locators: [
    { beat: 0, label: "A1" }, { beat: 32, label: "A2" },
    { beat: 64, label: "B (half-time)" }, { beat: 96, label: "A3 (double-time)" },
  ],
  masterGain: 0.9,
  midiTracks: [
    track("Lead (saw)", 81, lead, { gain: 0.75, pan: 0 }),
    track("Lead double (calliope)", 82, double, { gain: 0.5, pan: 0.2 }),
    track("Arp (clavinet)", 7, arp, { gain: 0.45, pan: -0.6 }),
    track("DX EP", 5, ep, { gain: 0.55, pan: 0.5 }),
    track("Juno pad", 90, pad, { gain: 0.45, pan: -0.25 }),
    track("Octave bass", 38, bass, { gain: 0.8, pan: 0 }),
    track("808 kit", 25, kit, { bank: 128, gain: 0.85, pan: 0 }),
    track("808 hats", 25, hats, { bank: 128, gain: 0.55, pan: 0.35 }),
  ],
};

const payload = deflateRawSync(JSON.stringify(project)).toString("base64url");
const url = `https://toy-midi.hiro18181.workers.dev/draft#p=${payload}`;
writeFileSync("link.txt", url + "\n");
writeFileSync("project.json", JSON.stringify(project, null, 1));
console.log(project.midiTracks.map((t) => `${t.name}: ${t.notes.length}`).join("\n"));
console.log("url length", url.length);
