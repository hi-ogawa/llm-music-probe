// Rhythm section: drums, bass, percussion. Dilla-style drunk feel.
import { timeline, TOTAL_BEATS } from "./spec.mjs";

// GM drum notes
const KICK = 36,
  KICK2 = 35,
  SNARE = 38,
  RIM = 37,
  CLAP = 39,
  CHH = 42,
  PHH = 44,
  OHH = 46;
const RIDE = 51,
  BELL = 53,
  CRASH = 49,
  TOM_L = 45,
  TOM_M = 47,
  TOM_H = 50,
  TAMB = 54,
  SHAKER = 82;
const CONGA_LO = 64,
  CONGA_HI = 63;

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function track(name, bank, program, gain) {
  const t = { name, bank, program, gain, notes: [] };
  t.add = (pitch, start, duration, velocity) => {
    start = Math.max(0, start);
    if (start >= TOTAL_BEATS) {
      return;
    }
    duration = Math.min(duration, TOTAL_BEATS - start);
    if (duration <= 0.01) {
      return;
    }
    t.notes.push({
      pitch: Math.max(0, Math.min(127, Math.round(pitch))),
      start: +start.toFixed(4),
      duration: +duration.toFixed(4),
      velocity: Math.max(1, Math.min(127, Math.round(velocity))),
    });
  };
  return t;
}

export function parts() {
  const rnd = mulberry32(880144);
  const r = (a, b) => a + (b - a) * rnd();
  const chance = (p) => rnd() < p;
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

  const S = Object.fromEntries(timeline().map((s) => [s.name, s]));
  const kit = track("Drums Standard", 128, 0, 1.0);
  const brush = track("Drums Brush", 128, 40, 0.95);
  const k808 = track("Drums 808 Layer", 128, 25, 0.55);
  const perc = track("Perc Shaker/Tamb", 128, 0, 0.7);
  const bass = track("Bass Fingered", 0, 33, 1.0);
  const sub = track("Bass Synth", 0, 38, 0.6);

  // Timing helpers. Positions are in 16ths within a bar.
  const swing16 = (i) => (i % 2 === 1 ? r(0.05, 0.085) : 0); // odd 16ths pushed late
  const kickT = (bar, i) =>
    bar +
    i / 4 +
    swing16(i) +
    (i % 4 === 2 ? 0.02 : 0) +
    (chance(0.25) ? r(-0.035, -0.01) : r(-0.01, 0.035));
  const snareT = (bar, i) => bar + i / 4 + r(0.03, 0.06);
  const hatT = (bar, i) =>
    bar + i / 4 + (i % 2 === 1 ? r(0.015, 0.03) : 0) + r(-0.008, 0.008);

  // Kick variants (16th indices within a bar)
  const KV = {
    a: [0, 3, 10],
    b: [0, 6, 10, 11],
    c: [0, 3, 8, 14],
    d: [0, 10, 15],
    e: [0, 7, 9, 10],
    f: [0, 2, 11, 14],
  };
  const kickTimes = []; // for bass locking: absolute times of kicks

  function kickBar(t, bar, idxs, vel = 100, pitch = KICK) {
    for (const i of idxs) {
      const at = kickT(bar, i);
      const v = (i === 0 ? vel : vel - 14) + r(-8, 6);
      t.add(pitch, at, 0.25, v);
      kickTimes.push(at);
    }
  }
  function snareBackbeat(t, bar, vel = 98, pitch = SNARE) {
    t.add(pitch, snareT(bar, 4), 0.25, vel + r(-6, 6));
    t.add(pitch, snareT(bar, 12), 0.25, vel + r(-4, 8));
  }
  function ghosts(t, bar, prob, slots = [7, 9, 15, 14, 6]) {
    for (const i of slots) {
      if (chance(prob)) {
        t.add(
          SNARE,
          bar + i / 4 + swing16(i) + r(0.01, 0.04),
          0.125,
          r(20, 40),
        );
      }
    }
  }
  function hats8(t, bar, base = 66, extra16 = 0.15, openOn = -1) {
    for (let i = 0; i < 16; i += 2) {
      if (i === openOn) {
        t.add(OHH, hatT(bar, i), 0.5, base - 6 + r(-6, 6));
        continue;
      }
      const acc = i % 4 === 0 ? base : base - 16;
      t.add(CHH, hatT(bar, i), 0.2, acc + r(-10, 10));
      if (chance(extra16)) {
        t.add(CHH, hatT(bar, i + 1), 0.15, base - 32 + r(-6, 8));
      }
    }
  }
  function hats16(t, bar, base = 60) {
    for (let i = 0; i < 16; i++) {
      const acc = i % 4 === 0 ? base : i % 2 === 0 ? base - 12 : base - 24;
      t.add(CHH, hatT(bar, i), 0.15, acc + r(-9, 9));
    }
  }

  // Fill over the last two beats of a bar (starts at beat 2 of that bar)
  function fill(t, bar, kind, vel = 90) {
    const b = bar + 2;
    if (kind === "snare") {
      for (let i = 0; i < 8; i++) {
        if (i === 1 || i === 5) {
          continue;
        }
        t.add(
          SNARE,
          b + i / 4 + swing16(i) + r(0.02, 0.05),
          0.15,
          vel * (0.45 + 0.07 * i) + r(-5, 5),
        );
      }
    } else if (kind === "toms") {
      const seq = [TOM_H, TOM_H, TOM_M, 0, TOM_M, TOM_L, TOM_L, KICK];
      seq.forEach(
        (p, i) =>
          p &&
          t.add(
            p,
            b + i / 4 + swing16(i) + r(0, 0.04),
            0.25,
            vel * (0.6 + 0.05 * i) + r(-6, 4),
          ),
      );
    } else if (kind === "drop") {
      // Dilla turnaround: everything drops for the last beat, one late snare flam
      t.add(SNARE, b + 0.05, 0.25, vel);
      t.add(SNARE, b + 1.5 + r(0.04, 0.07), 0.15, vel * 0.5);
      t.add(SNARE, b + 1.75 + r(0.05, 0.08), 0.15, vel * 0.7);
    }
  }

  // Standard groove bar used by verses and the bridge
  function grooveBar(bar, opts) {
    const {
      kv,
      hatMode = 8,
      hatBase = 66,
      ghost = 0.45,
      last = false,
      fillKind = "snare",
      openOn = -1,
      extra16 = 0.15,
    } = opts;
    if (last) {
      kickBar(
        kit,
        bar,
        kv.filter((i) => i < 8),
      );
      kit.add(SNARE, snareT(bar, 4), 0.25, 96 + r(-5, 5));
      ghosts(kit, bar, ghost, [7]);
      for (let i = 0; i < 8; i += 2) {
        kit.add(CHH, hatT(bar, i), 0.2, hatBase - (i % 4 ? 16 : 0) + r(-8, 8));
      }
      fill(kit, bar, fillKind);
      return;
    }
    kickBar(kit, bar, kv);
    snareBackbeat(kit, bar);
    ghosts(kit, bar, ghost);
    if (hatMode === 16) {
      hats16(kit, bar, hatBase);
    } else {
      hats8(kit, bar, hatBase, extra16, openOn);
    }
  }

  // ---------- INTRO: keys only, faint hat and rim creep in during the last bar ----------
  {
    const s = S.intro,
      bar = s.end - 4;
    for (let i = 0; i < 16; i += 2) {
      brush.add(CHH, hatT(bar, i), 0.15, 18 + i * 2.2 + r(-4, 4));
    }
    brush.add(RIM, snareT(bar, 12), 0.2, 38);
    brush.add(RIM, bar + 3.75 + 0.07, 0.15, 30);
  }

  // ---------- VERSE A: the main loop ----------
  {
    const s = S.verseA;
    for (let b = 0; b < 8; b++) {
      const bar = s.start + b * 4;
      const kv = b % 2 === 0 ? KV.a : KV.b;
      grooveBar(bar, {
        kv,
        last: b === 7,
        fillKind: "drop",
        openOn: b % 4 === 3 ? 14 : -1,
      });
    }
  }

  // ---------- BRIDGE B: lift, ride + side stick, more syncopation ----------
  {
    const s = S.bridgeB;
    kit.add(CRASH, s.start + 0.01, 2, 70);
    const kvs = [KV.c, KV.e, KV.c, KV.f, KV.c, KV.e, KV.d, KV.f];
    for (let b = 0; b < 8; b++) {
      const bar = s.start + b * 4;
      const last = b === 7;
      kickBar(kit, bar, last ? KV.c.filter((i) => i < 8) : kvs[b]);
      kit.add(SNARE, snareT(bar, 4), 0.25, 96 + r(-5, 5));
      if (!last) {
        kit.add(SNARE, snareT(bar, 12), 0.25, 100 + r(-5, 5));
      }
      // side-stick ghost chatter instead of snare ghosts
      for (const i of [3, 7, 10, 15]) {
        if (chance(0.5)) {
          kit.add(
            RIM,
            bar + i / 4 + swing16(i) + r(0.01, 0.04),
            0.15,
            r(30, 50),
          );
        }
      }
      // ride on 8ths, bell on beat 1 every other bar, hats on the pedal
      for (let i = 0; i < (last ? 8 : 16); i += 2) {
        kit.add(
          i === 0 && b % 2 === 0 ? BELL : RIDE,
          hatT(bar, i),
          0.5,
          (i % 4 === 0 ? 72 : 54) + r(-8, 8),
        );
        if (i % 4 === 2) {
          kit.add(PHH, hatT(bar, i), 0.15, 44 + r(-6, 6));
        }
      }
      if (last) {
        fill(kit, bar, "toms", 96);
      }
    }
    // congas for color in the bridge
    for (let b = 0; b < 8; b++) {
      const bar = s.start + b * 4;
      for (const [i, p, v] of [
        [2, CONGA_HI, 52],
        [3, CONGA_HI, 38],
        [6, CONGA_LO, 58],
        [11, CONGA_HI, 46],
        [14, CONGA_LO, 54],
      ]) {
        if (chance(b === 7 && i > 7 ? 0 : 0.8)) {
          perc.add(
            p,
            bar + i / 4 + swing16(i) + r(-0.01, 0.03),
            0.2,
            v + r(-8, 8),
          );
        }
      }
    }
  }

  // ---------- BREAKDOWN: brush kit, near-empty then half-time build ----------
  {
    const s = S.breakdown;
    // bars 1-2: only a rim click on beat 3 and pedal hat on the quarters
    for (let b = 0; b < 2; b++) {
      const bar = s.start + b * 4;
      brush.add(RIM, snareT(bar, 8), 0.2, 40 + r(-4, 4));
      for (let q = 0; q < 4; q++) {
        brush.add(PHH, bar + q + r(-0.01, 0.01), 0.15, 26 + r(-5, 5));
      }
      if (b === 1) {
        brush.add(KICK, kickT(bar, 0), 0.5, 62);
      }
    }
    // bars 3-4: half-time (kick on 1, snare on 3), brush 8ths swelling
    for (let b = 2; b < 4; b++) {
      const bar = s.start + b * 4;
      brush.add(KICK, kickT(bar, 0), 0.5, 80 + r(-5, 5));
      brush.add(KICK, kickT(bar, 11), 0.25, 64 + r(-5, 5));
      brush.add(SNARE, snareT(bar, 8), 0.3, 78 + b * 6);
      for (let i = 0; i < 16; i += 2) {
        brush.add(CHH, hatT(bar, i), 0.2, 30 + b * 4 + i * 1.5 + r(-6, 6));
      }
      ghosts(brush, bar, 0.35, [6, 13]);
    }
    // build into verseA2: snare roll on the main kit in the final beat
    const lastBar = s.end - 4;
    for (let i = 0; i < 8; i++) {
      kit.add(SNARE, lastBar + 3 + i / 8 + r(0.01, 0.03), 0.1, 30 + i * 9);
    }
  }

  // ---------- VERSE A2: the peak, main loop + 808 layer + tamb/shaker, varied ----------
  {
    const s = S.verseA2;
    kit.add(CRASH, s.start + 0.01, 2.5, 82);
    const kvs = [KV.a, KV.b, KV.a, KV.e, KV.c, KV.b, KV.a, KV.f];
    for (let b = 0; b < 8; b++) {
      const bar = s.start + b * 4;
      const last = b === 7;
      const before = kickTimes.length;
      grooveBar(bar, {
        kv: kvs[b],
        last,
        fillKind: "snare",
        ghost: 0.6,
        hatMode: b === 2 || b === 3 || b === 6 ? 16 : 8,
        hatBase: 70,
        extra16: 0.3,
        openOn: b % 2 === 1 ? 14 : -1,
      });
      // extra kick "stumble" in some bars
      if (!last && chance(0.4)) {
        const at = kickT(bar, pick([13, 15]));
        kit.add(KICK, at, 0.2, 70);
        kickTimes.push(at);
      }
      // 808 sub kick doubles the kit kicks, clap doubles the backbeat slightly later
      for (const at of kickTimes.slice(before)) {
        k808.add(KICK, at + 0.005, 0.5, 92 + r(-6, 6));
      }
      for (const i of last ? [4] : [4, 12]) {
        k808.add(CLAP, bar + i / 4 + r(0.05, 0.075), 0.25, 82 + r(-6, 6));
      }
      // tambourine on backbeats, shaker 16ths (late 16ths pushed)
      for (const i of last ? [4] : [4, 12]) {
        perc.add(TAMB, snareT(bar, i) + 0.01, 0.2, 58 + r(-6, 6));
      }
      for (let i = 0; i < (last ? 8 : 16); i++) {
        perc.add(
          SHAKER,
          hatT(bar, i) + (i % 2 ? 0.03 : 0),
          0.12,
          (i % 2 ? 52 : 38) + r(-8, 8),
        );
      }
    }
  }

  // ---------- OUTRO: thin out, stop before the last chord rings ----------
  {
    const s = S.outro;
    // bar 1: full-ish groove, softer
    const b0 = s.start;
    kickBar(kit, b0, KV.a, 88);
    snareBackbeat(kit, b0, 86);
    hats8(kit, b0, 56, 0.1);
    // bar 2: kick only on 1, rim instead of snare, hats thinning
    const b1 = s.start + 4;
    kickBar(kit, b1, [0], 80);
    kit.add(RIM, snareT(b1, 4), 0.2, 54);
    kit.add(RIM, snareT(b1, 12), 0.2, 48);
    for (let i = 0; i < 16; i += 4) {
      kit.add(CHH, hatT(b1, i), 0.2, 46 - i + r(-4, 4));
    }
    // bar 3 (last chord begins): one soft kick, a faint hat, then silence
    const b2 = s.start + 8;
    kickBar(kit, b2, [0], 72);
    kit.add(CHH, hatT(b2, 8), 0.2, 24);
    brush.add(RIM, snareT(b2, 12) + 0.03, 0.2, 26);
  }

  // ---------- BASS ----------
  const tl = timeline();
  const chordAt = (t) => {
    for (const s of tl) {
      for (const c of s.chords) {
        if (t >= c.start - 1e-6 && t < c.start + c.length - 1e-6) {
          return c;
        }
      }
    }
    return null;
  };
  const sectionOf = (t) => tl.find((s) => t >= s.start && t < s.end);

  function groovedBass(
    s,
    { fifths = 0.1, walk = 0, pickup = 0.4, octave = 0.25, vel = 92 },
  ) {
    // Hits: kick times in section (loosely late), plus each chord start.
    const ks = kickTimes
      .filter((t) => t >= s.start - 0.05 && t < s.end - 0.05)
      .map((t) => t + r(0.0, 0.04));
    const cs = s.chords.map((c) => c.start + r(0.01, 0.04));
    let hits = [...ks];
    for (const c of cs) {
      if (!hits.some((h) => Math.abs(h - c) < 0.2)) {
        hits.push(c);
      }
    }
    hits = hits.sort((a, b) => a - b);
    const events = [];
    for (const h of hits) {
      const c = chordAt(Math.max(s.start, Math.round(h * 4) / 4)) || chordAt(h);
      if (!c) {
        continue;
      }
      const rel = h - c.start;
      let p = c.root;
      if (rel > 0.4 && chance(fifths)) {
        p = c.root + 7;
      }
      if (rel > 1.5 && chance(octave)) {
        p = c.root + 12;
      }
      events.push({ t: h, p, v: (rel < 0.2 ? vel : vel - 12) + r(-7, 5), c });
    }
    // walking passing tones: a note on beat 3 of 4-beat chords if empty
    for (const c of s.chords) {
      if (c.length < 4 || !chance(walk)) {
        continue;
      }
      const t = c.start + 2 + r(0.02, 0.05);
      if (events.some((e) => Math.abs(e.t - t) < 0.4)) {
        continue;
      }
      events.push({ t, p: c.root + pick([3, 5, 7, 10]), v: vel - 16, c });
    }
    // chromatic pickups into the next chord
    s.chords.forEach((c, idx) => {
      const nxt = s.chords[idx + 1] || chordAt(s.end + 0.01);
      if (!nxt || !chance(pickup)) {
        return;
      }
      const t = nxt.start - pick([0.25, 0.5]) + swing16(1) * 0.6;
      if (t < s.start) {
        return;
      }
      const dir = nxt.root > c.root ? -1 : 1;
      events.push({ t, p: nxt.root + dir, v: vel - 20, c, pickup: true });
    });
    events.sort((a, b) => a.t - b.t);
    // De-duplicate near-simultaneous hits
    const ev = events.filter((e, i) => i === 0 || e.t - events[i - 1].t > 0.12);
    ev.forEach((e, i) => {
      const next = ev[i + 1]
        ? ev[i + 1].t
        : Math.min(s.end, e.c.start + e.c.length);
      let d = Math.min(next - e.t - 0.04, e.pickup ? 0.24 : 1.75);
      if (d < 0.1) {
        d = 0.1;
      }
      bass.add(e.p, e.t, d, e.v);
    });
  }

  // intro: one pickup slide into the drop (F, then A into Bb)
  bass.add(41, S.intro.end - 0.5 + 0.03, 0.2, 62);
  bass.add(33, S.intro.end - 0.25 + 0.06, 0.2, 74);

  groovedBass(S.verseA, { fifths: 0.12, walk: 0, pickup: 0.35, octave: 0.25 });
  groovedBass(S.bridgeB, {
    fifths: 0.25,
    walk: 0.6,
    pickup: 0.55,
    octave: 0.35,
    vel: 94,
  });

  // breakdown: long held synth bass roots, fingered bass out, pickup at the end
  for (const c of S.breakdown.chords) {
    sub.add(c.root, c.start + 0.03, c.length - 0.1, 78);
    if (c.length >= 8) {
      sub.add(c.root - 12, c.start + 4 + 0.05, 3.85, 66);
    }
  }
  bass.add(36 + 7, S.breakdown.end - 0.75 + 0.05, 0.22, 64);
  bass.add(35, S.breakdown.end - 0.25 + 0.07, 0.22, 76);

  groovedBass(S.verseA2, {
    fifths: 0.2,
    walk: 0.3,
    pickup: 0.5,
    octave: 0.4,
    vel: 96,
  });
  // synth bass doubles chord roots in verseA2 for weight
  for (const c of S.verseA2.chords) {
    sub.add(c.root, c.start + 0.02, c.length - 0.15, 72);
  }

  // outro: roots on chord starts, a little kick lock in bar 1, final Dm held to the end
  {
    const s = S.outro;
    for (const c of s.chords) {
      if (c.length >= 8) {
        bass.add(c.root, c.start + 0.03, TOTAL_BEATS - c.start - 0.03, 80);
        sub.add(c.root, c.start + 0.03, TOTAL_BEATS - c.start - 0.03, 60);
      } else {
        bass.add(c.root, c.start + 0.03, 1.6, 84);
        bass.add(
          c.root + (chance(0.5) ? 7 : 12),
          c.start + 2.5 + 0.06,
          0.9,
          66,
        );
        const nxt = s.chords.find((x) => x.start === c.start + c.length);
        if (nxt) {
          bass.add(nxt.root - 1, c.start + 3.75 + 0.05, 0.2, 58);
        }
      }
    }
  }

  const out = [kit, brush, k808, perc, bass, sub].map(({ add, ...t }) => {
    t.notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
    return t;
  });
  return out.filter((t) => t.notes.length > 0);
}
