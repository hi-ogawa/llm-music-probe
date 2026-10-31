import { writeFileSync } from "node:fs";

// Seven Against Five: djent / prog metal in 7/4 at 132 BPM, drop E. See README.md for the
// form and the parts. Run `node seven-against-five.mjs` to write project.json next to this file.

function composeProgMetal() {
  const BAR = 7; // beats in a 7/4 bar
  const S = 0.25; // sixteenth
  const r3 = (x) => Math.round(x * 1000) / 1000;
  let seed = 20261030;
  const rnd = () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const notes = {};
  const bends = {};
  const swellCc = [];
  const add = (track, pitch, start, duration, velocity) => {
    (notes[track] ??= []).push({
      pitch,
      start: r3(Math.max(0, start)),
      duration: r3(duration),
      velocity: Math.max(1, Math.min(127, Math.round(velocity))),
    });
  };

  // Drop D power chords (root, fifth, octave)
  const CH = {
    D: [38, 45, 50], Eb: [39, 46, 51], F: [41, 48, 53], G: [43, 50, 55],
    A: [45, 52, 57], Bb: [46, 53, 58], C: [48, 55, 60],
  };
  // GM drum map
  const K = 36, SN = 38, STK = 37, HH = 42, CR = 49, RD = 51, CN = 52, BELL = 53;
  const FT = 41, LT = 45, MT = 47, HT = 50;

  const SIDES = ["L", "R"];
  // Double-tracking: each side gets its own small timing and velocity drift.
  const gtr = (kind, pitches, start, dur, vel, sides = SIDES) => {
    for (const side of sides) {
      const dt = start > 0 ? (rnd() - 0.5) * 0.016 : 0;
      const dv = (rnd() - 0.5) * 10;
      for (const p of pitches) add(`Rhythm ${side} ${kind}`, p, start + dt, dur, vel + dv);
    }
  };
  const chug = (p, start, dur, vel, sides) => gtr("muted", [p], start, dur, vel, sides);
  const chord = (name, start, dur, vel, sides) => gtr("open", CH[name], start, dur, vel, sides);
  const bass = (p, start, dur, vel) => add("Bass", p, start, dur, vel);
  const dr = (p, beat, vel) => add("Drums", p, beat, 0.25, vel);
  const snareRoll = (beat, count) => {
    for (let i = 0; i < count; i++) dr(SN, beat + i * S, 84 + (40 * i) / count);
  };

  // Riff A: sixteenths grouped 3+3+2 | 3+3+2 | 3+3+2 | 4, the last group a chord stab.
  const RIFF_A_STABS = [["Eb"], ["F"], ["Eb"], ["Bb", "A"]];
  function riffA(bar, phraseBar, { sides = SIDES, drums = "full", crash = false, bassOn = true, fill = false } = {}) {
    const s0 = bar * BAR;
    const hits = [0, 3, 6, 7, 8, 11, 14, 15, 16, 19, 22, 23];
    const pitches = [[38, 38, 38, 38], [38, 38, 38, 39], [38, 38, 38, 38]];
    if (phraseBar === 3) pitches[2] = [38, 38, 39, 41];
    hits.forEach((h, i) => {
      const p = pitches[Math.floor(i / 4)][i % 4];
      const acc = i % 4 === 0;
      const t = s0 + h * S;
      chug(p, t, 0.2, acc ? 118 : 98, sides);
      if (bassOn) bass(p - 12, t, 0.2, acc ? 115 : 100);
      if (drums !== "none") dr(K, t, acc ? 118 : 100);
    });
    const stabs = RIFF_A_STABS[phraseBar % 4];
    stabs.forEach((c, i) => {
      const len = 1 / stabs.length;
      const t = s0 + 6 + i * len;
      chord(c, t, len - 0.08, 116, sides);
      if (bassOn) bass(CH[c][0] - 12, t, len - 0.08, 115);
      if (drums !== "none") dr(K, t, 118);
    });
    if (drums === "full") {
      for (let q = 0; q < 7; q++) {
        if (q === 0 && crash) continue;
        dr(q === 6 ? CN : HH, s0 + q, q === 6 ? 112 : q % 2 ? 76 : 92);
      }
      dr(SN, s0 + 2, 120);
      if (fill) snareRoll(s0 + 6, 4);
      else dr(SN, s0 + 6, 122);
      if (crash) dr(CR, s0, 122);
    } else if (drums === "intro") {
      for (let q = 0; q < 7; q++) dr(HH, s0 + q, 64 + q * 4);
      dr(FT, s0 + 2, 110);
      if (fill) snareRoll(s0 + 4, 12);
      else dr(FT, s0 + 6, 115);
    }
  }

  // Riff B: a 5-sixteenth cell (hits on 1, 2 and 4) cycling against the 7/4 bar,
  // so it lands somewhere new each time and only realigns after 4 bars.
  function riffB(bar, { china = false } = {}) {
    const s0 = bar * BAR;
    const cycle = [38, 39, 38, 41, 38, 39, 38, 44];
    for (let k = 0; k * 5 < 104; k++) {
      for (const o of [0, 1, 3]) {
        const st = k * 5 + o;
        if (st >= 104) break;
        const p = o === 3 ? cycle[k % 8] : 38;
        const t = s0 + st * S;
        const acc = o === 0;
        chug(p, t, 0.2, acc ? 120 : 96);
        bass(p - 12, t, 0.2, acc ? 114 : 98);
        dr(K, t, acc ? 116 : 96);
      }
    }
    for (const [c, b] of [["Bb", 26], ["A", 27]]) {
      chord(c, s0 + b, 0.9, 118);
      bass(CH[c][0] - 12, s0 + b, 0.9, 115);
      dr(K, s0 + b, 120);
    }
    dr(CN, s0 + 26, 116);
    dr(CR, s0 + 27, 118);
    for (let b = 0; b < 4; b++) {
      const bs = s0 + b * BAR;
      for (let q = 0; q < 7; q++) {
        if (b === 3 && q >= 5) continue;
        if (b === 0 && q === 0) { dr(CR, bs, 122); continue; }
        dr(china ? CN : BELL, bs + q, q % 2 ? 82 : 98);
      }
      dr(SN, bs + 2, 120);
      if (b < 3) dr(SN, bs + 6, 120);
    }
  }

  // Chorus: open chords on the 2+2+3 group heads, snare on the second pulse of each group.
  function chorusBar(bar, c, { crash = false, ring = false } = {}) {
    const s0 = bar * BAR;
    const root = CH[c][0] - 12;
    const hitsAt = ring ? [[0, 2], [2, 2], [4, 3]] : [[0, 2], [2, 2], [4, 2.4]];
    for (const [b, d] of hitsAt) {
      chord(c, s0 + b, d - 0.1, b === 0 ? 118 : 108);
      bass(root, s0 + b, d - 0.1, 112);
      dr(K, s0 + b, 116);
    }
    if (!ring) {
      for (const b of [6.5, 6.75]) {
        chug(38, s0 + b, 0.2, 108);
        bass(26, s0 + b, 0.2, 106);
        dr(K, s0 + b, 112);
      }
    }
    for (const b of [1, 3, 5]) dr(SN, s0 + b, 118);
    for (let e = 0; e < 14; e++) {
      const b = e * 0.5;
      if (b === 0 && crash) continue;
      if (ring && b >= 4) continue;
      dr(RD, s0 + b, e % 2 ? 76 : 96);
    }
    if (crash) dr(CR, s0, 122);
    if (ring) dr(CR, s0 + 4, 124);
  }

  // Lead: [start, duration, pitch, fx] with fx.bend (semitones, reached in half a beat),
  // fx.release (beat offset where the bend drops back), fx.vib, fx.dive.
  function leadNote(start, dur, pitch, fx = {}) {
    add("Lead", pitch, start, dur - 0.04, fx.v ?? 104);
    const P = (bends.Lead ??= []);
    P.push([start, 0]);
    let base = 0;
    let t = start;
    if (fx.bend) {
      const len = Math.min(0.5, dur / 2);
      for (let i = 1; i <= 4; i++) P.push([start + (len * i) / 4, (fx.bend * i) / 4]);
      base = fx.bend;
      t = start + len;
      if (fx.release != null) {
        for (let i = 1; i <= 4; i++) P.push([start + fx.release + (0.25 * i) / 4, fx.bend * (1 - i / 4)]);
        base = 0;
        t = start + fx.release + 0.25;
      }
    }
    const end = start + dur - 0.05;
    const diveFrom = fx.dive ? end - 1 : end;
    if (fx.vib) {
      let i = 0;
      for (let b = Math.max(t, start + dur * 0.35); b < diveFrom; b += 1 / 12, i++) {
        P.push([b, base + 0.3 * Math.sin((2 * Math.PI * i) / 6)]);
      }
    }
    if (fx.dive) {
      for (let i = 0; i <= 8; i++) P.push([diveFrom + i / 8, base + (fx.dive * i) / 8]);
    }
    P.push([start + dur, 0]);
  }
  const LEAD = [
    [[0, 1.5, 69], [1.5, 0.5, 70], [2, 2, 72, { bend: 2 }], [4, 3, 74, { vib: 1 }]],
    [[0, 1, 77], [1, 1, 74], [2, 1.5, 72, { bend: 2 }], [3.5, 0.5, 70], [4, 3, 69, { vib: 1 }]],
    [[0, 0.5, 72], [0.5, 0.5, 74], [1, 1, 77], [2, 2, 79, { bend: 2 }], [4, 1, 81], [5, 2, 77, { vib: 1 }]],
    [[0, 2, 76], [2, 1, 74], [3, 1, 72], [4, 3, 74, { vib: 1 }]],
    [[0, 0.5, 81], [0.5, 0.5, 79], [1, 0.5, 77], [1.5, 0.5, 76], [2, 2, 77, { bend: 2 }], [4, 3, 81, { vib: 1 }]],
    [[0, 1, 82], [1, 1, 81], [2, 1, 79], [3, 1, 77], [4, 3, 76, { bend: 1, vib: 1 }]],
    [
      [0, 0.25, 72], [0.25, 0.25, 74], [0.5, 0.25, 76], [0.75, 0.25, 77],
      [1, 0.25, 79], [1.25, 0.25, 81], [1.5, 0.25, 82], [1.75, 0.25, 84],
      [2, 2, 84, { bend: 2 }], [4, 3, 86, { vib: 1 }],
    ],
    [[0, 1.5, 84, { bend: 2, release: 0.9 }], [1.5, 0.5, 81], [2, 2, 79], [4, 3, 74, { vib: 1, dive: -2 }]],
  ];
  const leadBar = (bar, phrase) => {
    for (const [s, d, p, fx] of phrase) leadNote(bar * BAR + s, d, p, fx);
  };

  // Clean break: neck pickup, no amp, arpeggios grouped 3+2+2 | 3+2+2 eighths.
  const CLEAN = [
    [[50, 57, 64, 65, 69], 38], // Dm9
    [[46, 53, 57, 60, 62], 34], // Bbmaj9
    [[41, 48, 52, 57, 64], 41], // Fmaj7
    [[48, 55, 62, 67, 74], 36], // Csus2
  ];
  const ARP = [0, 2, 4, 1, 3, 2, 4, 0, 2, 3, 1, 4, 2, 3];
  const ARP_HEADS = new Set([0, 3, 5, 7, 10, 12]);
  function cleanBar(bar, i, { swell = false, bassOn = false, drums = "none" } = {}) {
    const s0 = bar * BAR;
    const [voicing, root] = CLEAN[i % 4];
    ARP.forEach((idx, e) => add("Clean arp", voicing[idx], s0 + e * 0.5, 1.4, ARP_HEADS.has(e) ? 84 : 66));
    if (swell) {
      for (const p of voicing.slice(2)) add("Clean swell", p + 12, s0, 6.9, 92);
      for (let b = 0; b <= 2.5; b += 0.125) swellCc.push({ beat: r3(s0 + b), value: Math.round((100 * b) / 2.5) });
      for (let b = 5; b <= 6.875; b += 0.125) swellCc.push({ beat: r3(s0 + b), value: Math.round((100 * (6.875 - b)) / 1.875) });
    }
    if (bassOn) bass(root, s0, 6.8, 84);
    if (drums === "light" || drums === "hats") {
      dr(K, s0, 80);
      dr(K, s0 + 4, 72);
      for (const b of [2, 5]) dr(STK, s0 + b, 78);
      for (let q = 0; q < 7; q++) dr(RD, s0 + q, 62);
      if (drums === "hats") for (let e = 0; e < 14; e++) if (e % 2) dr(HH, s0 + e * 0.5, 58);
    } else if (drums === "build") {
      dr(K, s0, 90);
      for (const b of [2]) dr(STK, s0 + b, 80);
      for (let q = 0; q < 3; q++) dr(RD, s0 + q, 66);
      const toms = [HT, HT, MT, MT, LT, LT, FT, FT];
      for (let k = 0; k < 16; k++) {
        const b = s0 + 3 + k * S;
        dr(toms[Math.floor(k / 2)], b, 70 + k * 3);
        if (k % 4 === 0) dr(K, b, 90 + k * 2);
      }
    }
  }

  function breakdown(bar, last = false) {
    const s0 = bar * BAR;
    for (const h of [0, 6, 12, 18, 24, 26]) {
      if (last && h >= 24) continue;
      const t = s0 + h * S;
      if (h >= 24) {
        chord("Eb", t, 0.4, 120);
        bass(27, t, 0.4, 118);
      } else {
        chug(38, t, 0.45, 124);
        bass(26, t, 0.45, 120);
      }
      dr(K, t, 124);
      dr(h === 0 && bar === 40 ? CR : CN, t, 116);
    }
    dr(SN, s0 + 3, 124);
    if (last) snareRoll(s0 + 6, 4);
    else dr(SN, s0 + 6.5, 124);
  }

  // ---- Form ----
  // Intro: bars 1-4
  riffA(0, 0, { sides: ["L"], drums: "none", bassOn: false });
  riffA(1, 1, { sides: ["L"], drums: "none", bassOn: false });
  riffA(2, 2, { drums: "intro" });
  riffA(3, 3, { drums: "intro", fill: true });
  // Riff A: bars 5-12
  for (let i = 0; i < 8; i++) riffA(4 + i, i % 4, { crash: i % 4 === 0, fill: i === 7 });
  // Riff B: bars 13-20
  riffB(12);
  riffB(16, { china: true });
  // Lead chorus: bars 21-28
  const CHORUS = ["D", "Bb", "F", "C"];
  for (let i = 0; i < 8; i++) {
    chorusBar(20 + i, CHORUS[i % 4], { crash: i % 2 === 0, ring: i === 7 });
    leadBar(20 + i, LEAD[i]);
  }
  // Clean break: bars 29-36
  const cleanDrums = ["none", "none", "light", "light", "light", "hats", "hats", "build"];
  for (let i = 0; i < 8; i++) cleanBar(28 + i, i, { swell: i >= 2, bassOn: i >= 2, drums: cleanDrums[i] });
  // Riff A returns: bars 37-40
  for (let i = 0; i < 4; i++) riffA(36 + i, i, { crash: i % 2 === 0, fill: i === 3 });
  // Breakdown: bars 41-44
  for (let i = 0; i < 4; i++) breakdown(40 + i, i === 3);
  // Outro: bars 45-49
  for (let i = 0; i < 4; i++) {
    chorusBar(44 + i, CHORUS[i], { crash: i % 2 === 0 });
    leadBar(44 + i, LEAD[4 + i]);
  }
  const fin = 48 * BAR;
  chord("D", fin, 6.5, 122);
  bass(26, fin, 6.5, 120);
  dr(K, fin, 124);
  dr(CR, fin, 126);
  dr(CN, fin, 118);
  leadNote(fin, 6.5, 84, { bend: 2, vib: 1 });

  // ---- Automation ----
  // CC 11 at 127 while a note sounds and 0 from just after its note-off, so the
  // amp's drive doesn't smear release tails into the rests.
  function gate(trackNotes, tail = 0.03) {
    const iv = trackNotes
      .map((n) => [n.start, n.start + n.duration + tail])
      .sort((a, b) => a[0] - b[0]);
    const merged = [];
    for (const [s, e] of iv) {
      const last = merged[merged.length - 1];
      if (last && s <= last[1]) last[1] = Math.max(last[1], e);
      else merged.push([s, e]);
    }
    const points = [];
    if (!merged.length || merged[0][0] > 0) points.push({ beat: 0, value: 0 });
    for (const [s, e] of merged) points.push({ beat: r3(s), value: 127 }, { beat: r3(e), value: 0 });
    return [{ type: "controller", controller: 11, points }];
  }
  function bendAutomation(points) {
    const sorted = points.map(([b, v], i) => [r3(b), Math.round(v * 100) / 100, i]).sort((a, b) => a[0] - b[0] || a[2] - b[2]);
    const out = [];
    for (const [beat, semitones] of sorted) {
      if (out.length && out[out.length - 1].beat === beat) out[out.length - 1].semitones = semitones;
      else out.push({ beat, semitones });
    }
    if (out[0].beat > 0) out.unshift({ beat: 0, semitones: 0 });
    return { type: "pitch-bend", points: out };
  }
  const swellAutomation = () => {
    const pts = [{ beat: 0, value: 0 }, ...swellCc].sort((a, b) => a.beat - b.beat);
    return [{ type: "controller", controller: 11, points: pts.filter((p, i) => i === 0 || p.beat !== pts[i - 1].beat) }];
  };

  // ---- Mix ----
  const band = (type, frequency, gain, q) => ({ type, frequency, gain, q, bypass: false });
  const highGain = { preset: "high-gain", cabinet: true };
  const rhythmEq = (presence) => ({
    bypass: false,
    bands: [band("high-pass", 95, 1, 0.707), band("peaking", 320, 0.55, 1.2), band(...presence), band("low-pass", 8500, 1, 0.707)],
  });
  const rhythm = (side, kind, presence) => ({
    name: `Rhythm ${side} (${kind})`,
    soundfont: "flamestudios-telecaster-bridge",
    program: kind === "muted" ? 1 : 0,
    amp: highGain,
    eq: rhythmEq(presence),
    pan: side === "L" ? -0.85 : 0.85,
    gain: kind === "muted" ? 0.62 : 0.46,
    notes: notes[`Rhythm ${side} ${kind}`],
    automation: gate(notes[`Rhythm ${side} ${kind}`]),
  });
  const L_PRESENCE = ["peaking", 1300, 1.35, 1.0];
  const R_PRESENCE = ["peaking", 2600, 1.35, 1.0];
  const tracks = [
    rhythm("L", "muted", L_PRESENCE),
    rhythm("L", "open", L_PRESENCE),
    rhythm("R", "muted", R_PRESENCE),
    rhythm("R", "open", R_PRESENCE),
    {
      name: "Lead",
      soundfont: "flamestudios-telecaster-bridge",
      program: 0,
      amp: highGain,
      eq: { bypass: false, bands: [band("high-pass", 220, 1, 0.707), band("peaking", 450, 0.6, 1), band("peaking", 1900, 1.5, 1.1)] },
      pan: 0.08,
      gain: 0.55,
      notes: notes.Lead,
      automation: [...gate(notes.Lead, 0.08), bendAutomation(bends.Lead)],
    },
    {
      name: "Clean arp (neck)",
      soundfont: "flamestudios-telecaster-neck",
      program: 0,
      eq: { bypass: false, bands: [band("high-pass", 120, 1, 0.707), band("peaking", 3500, 1.25, 0.8)] },
      pan: -0.4,
      gain: 0.75,
      notes: notes["Clean arp"],
    },
    {
      name: "Clean swell (neck)",
      soundfont: "flamestudios-telecaster-neck",
      program: 0,
      eq: { bypass: false, bands: [band("high-pass", 250, 1, 0.707), band("low-pass", 5000, 1, 0.707)] },
      pan: 0.5,
      gain: 0.55,
      notes: notes["Clean swell"],
      automation: swellAutomation(),
    },
    {
      name: "Bass",
      program: 34, // Electric Bass (pick)
      amp: { preset: "crunch", cabinet: false },
      eq: {
        bypass: false,
        bands: [band("high-pass", 35, 1, 0.707), band("peaking", 85, 1.45, 0.9), band("peaking", 650, 0.5, 1.0), band("low-pass", 2800, 1, 0.707)],
      },
      pan: 0,
      gain: 0.7,
      notes: notes.Bass,
      automation: gate(notes.Bass),
    },
    {
      name: "Drums (Power kit)",
      bank: 128,
      program: 16,
      eq: { bypass: false, bands: [band("peaking", 420, 0.7, 1.0), band("peaking", 4500, 1.2, 0.8)] },
      pan: 0,
      gain: 0.9,
      notes: notes.Drums,
    },
  ];
  // The riffs are written in drop D, but the Telecaster SoundFonts sample only keys 40-84
  // (E2-C6), so every pitched track moves up a whole step to drop E. At the top, the lead
  // drops an octave and the swell drops any note above C6 an octave.
  for (const t of tracks) {
    if (t.bank !== 128) for (const n of t.notes) n.pitch += 2;
    if (t.name === "Lead") for (const n of t.notes) n.pitch -= 12;
    if (t.name === "Clean swell (neck)") for (const n of t.notes) if (n.pitch > 84) n.pitch -= 12;
    t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
    Object.assign(t, { muted: false, soloed: false, viewMode: "overview", height: 64 });
    if (!t.automation) t.automation = [];
  }

  const loc = (bar, label) => ({ beat: bar * BAR, label });
  return {
    title: "Seven Against Five",
    comment: COMMENT,
    tempo: 132,
    timeSignature: { numerator: 7, denominator: 4 },
    masterGain: 1,
    loop: { enabled: false },
    locators: [
      loc(0, "Intro"),
      loc(4, "Riff A"),
      loc(12, "Riff B (5 over 7)"),
      loc(20, "Lead chorus"),
      loc(28, "Clean break"),
      loc(36, "Riff A return"),
      loc(40, "Breakdown"),
      loc(44, "Outro"),
    ],
    midiTracks: tracks,
  };
}

const COMMENT = `# Seven Against Five

Djent / prog-metal in **7/4 at 132 BPM**, drop E, E Phrygian-minor (E F G A B C D, with a Bb blue note in Riff B). 49 bars, about 2:36.

## Meter
The drums count each bar **2+2+3** quarters: hats on every quarter, snare on beats 3 and 7 in the riffs. The guitars subdivide the same 28 sixteenths differently:

- **Riff A**: \`3+3+2 | 3+3+2 | 3+3+2 | 4\`. Three tresillos of palm-muted low-E chugs, then a one-beat open power-chord stab. The stab walks F5, G5, F5, C5-B5 across the 4-bar phrase.
- **Riff B**: a 5-sixteenth cell (chug-chug-rest-chug-rest) repeated against the 7/4 bar. 5 against 28 never lines up inside a bar, so the riff seems to slide while the snare stays put. It resets every 4 bars with a C5-B5 stab.
- **Chorus**: open chords on the group heads (beats 1, 3, 5), snare on the second pulse of each group (2, 4, 6), and a two-sixteenth chug pickup on the last beat.
- **Breakdown**: eighths grouped \`3+3+3+3+2\`, half-time snare, china on every hit.

The kick doubles every chug and stab, so the guitars, bass and kick hit as one instrument.

## Form
| Bars | Section |
|---|---|
| 1-4 | Intro: Riff A on the left guitar alone, then the band with floor toms |
| 5-12 | Riff A |
| 13-20 | Riff B (5 over 7), ride bell then china |
| 21-28 | Lead chorus: E5 C5 G5 D5 under the lead |
| 29-36 | Clean break: neck pickup, no amp, Em9 Cmaj9 Gmaj7 Dsus2 arpeggios, volume swells, tom build |
| 37-40 | Riff A return |
| 41-44 | Breakdown |
| 45-49 | Outro: second half of the lead over the chorus, final E5 |

## Sound
- Rhythm guitars: Telecaster bridge into the **high-gain** amp, double-tracked hard left and right with small timing and velocity drift. Each side has a Muted (program 1) track for chugs and a Standard track for open chords.
- **CC 11** gates every amped track: 127 while a note sounds, 0 from 0.03 beats after its note-off, so the drive doesn't smear release tails into the rests.
- Lead: bridge pickup, high-gain, whole-step bends, a bend-and-release, step vibrato and a final dive, all as pitch-bend automation.
- Clean swells: CC 11 ramps 0 to 100 over 2.5 beats and back down each bar.
- Bass: picked bass an octave under the chugs through the crunch amp without cabinet.

## EQ
- Guitars: high-pass 95 Hz, cut 320 Hz, low-pass 8.5 kHz. The left side lifts 1.3 kHz and the right 2.6 kHz, so the two takes sit apart.
- Bass: lift 85 Hz, cut 650 Hz where the guitars live, low-pass 2.8 kHz.
- Lead: high-pass 220 Hz, cut 450 Hz, lift 1.9 kHz to sit above the rhythm guitars.
- Drums: cut 420 Hz boxiness, lift 4.5 kHz attack.
`;

const project = composeProgMetal();
writeFileSync(new URL("project.json", import.meta.url), JSON.stringify(project, null, 1) + "\n");
