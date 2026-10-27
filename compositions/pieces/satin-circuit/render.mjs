// Offline demo for toy-midi#1005: renders Satin Circuit with its bass and lead on a prototype
// subtractive synth, as a ladder where each step changes one thing. The other tracks render
// through spessasynth_core with GeneralUser GS, dry like the app.
//
// Needs a Toy MIDI checkout with dependencies installed, for spessasynth_core and the SoundFont.
// Run: TOY_MIDI=<checkout> node render.mjs   (defaults to a toy-midi checkout next to this repo)
// Writes out/<step>-<mix|solo>.mp3, out/full-<gm|synth>.mp3, and out/steps.json.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const TOY_MIDI = resolve(process.env.TOY_MIDI ?? new URL("../../../../toy-midi", import.meta.url).pathname);
const S = await import(`${TOY_MIDI}/node_modules/spessasynth_core/dist/index.js`);
const sf = readFileSync(`${TOY_MIDI}/public/soundfonts/GeneralUserGS-2.0.3.sf3`);

const SR = 44100;
const OUT = new URL("./out/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const project = JSON.parse(readFileSync(new URL("./project.json", import.meta.url), "utf8"));
const spb = 60 / project.tempo;
const END_BEAT = 84;
const TOTAL = Math.round((END_BEAT * spb + 2) * SR);
const EXCERPT = [32, 64]; // beats: second half of A and all of B, bars 9-16
const BASS = project.midiTracks.find((t) => t.name === "Synth Bass");
const LEAD = project.midiTracks.find((t) => t.name === "Lead");

// equal-power pan scaled so the center is unity, applied to a stereo render
const pan = ([L, R], p, gain = 1) => {
  const a = ((p + 1) * Math.PI) / 4, gl = Math.cos(a) * Math.SQRT2 * gain, gr = Math.sin(a) * Math.SQRT2 * gain;
  for (let i = 0; i < L.length; i++) { L[i] *= gl; R[i] *= gr; }
  return [L, R];
};

async function renderGM(track) {
  const synth = new S.SpessaSynthProcessor(SR, { eventsEnabled: false, effectsEnabled: false });
  await synth.processorInitialized;
  synth.soundBankManager.addSoundBank(S.SoundBankLoader.fromArrayBuffer(sf.buffer.slice(sf.byteOffset, sf.byteOffset + sf.byteLength)), "gu");
  const drums = track.bank === 128;
  synth.midiChannels[0].setDrums(drums);
  if (!drums) synth.controllerChange(0, 0, track.bank ?? 0);
  synth.programChange(0, track.program);
  synth.midiChannels[0].preset?.preload(0, 127);
  const ev = [];
  for (const n of track.notes) {
    ev.push({ s: Math.round(n.start * spb * SR), on: true, n });
    ev.push({ s: Math.round((n.start + n.duration) * spb * SR), on: false, n });
  }
  ev.sort((a, b) => a.s - b.s || a.on - b.on);
  const L = new Float32Array(TOTAL), R = new Float32Array(TOTAL);
  let pos = 0;
  for (const e of [...ev, { s: TOTAL }]) {
    const to = Math.min(e.s, TOTAL);
    while (pos < to) { const n = Math.min(128, to - pos); synth.process(L, R, pos, n); pos += n; }
    if (e.n) e.on ? synth.noteOn(0, e.n.pitch, e.n.velocity) : synth.noteOff(0, e.n.pitch);
  }
  return pan([L, R], track.pan, track.gain);
}

// ---------- prototype synth: one monophonic voice, optionally a unison stack ----------
// PolyBLEP smooths each waveform step over one sample on either side, which removes most aliasing.
const polyblep = (t, dt) => t < dt ? ((t /= dt), t + t - t * t - 1) : t > 1 - dt ? ((t = (t - 1) / dt), t * t + t + t + 1) : 0;
const OSC = {
  saw: (ph, dt) => 2 * ph - 1 - polyblep(ph, dt),
  square: (ph, dt) => (ph < 0.5 ? 1 : -1) + polyblep(ph, dt) - polyblep((ph + 0.5) % 1, dt),
};

// Mono with fingered glide: a note that starts while the previous one is held glides to its pitch
// and keeps the envelopes running, and a detached note jumps and retriggers them.
function renderSynth(notes, p) {
  const L = new Float32Array(TOTAL), R = new Float32Array(TOTAL);
  const voices = Array.from({ length: p.unison }, (_, i) => {
    const x = p.unison === 1 ? 0 : (i / (p.unison - 1)) * 2 - 1; // -1..1 across the stack
    return { cents: x * p.spread, pan: x * p.width, phases: p.oscs.map((_, j) => (i * 0.37 + j * 0.21) % 1) };
  });
  const ev = [];
  [...notes].sort((a, b) => a.start - b.start).forEach((n, i) => {
    ev.push({ s: Math.round(n.start * spb * SR), on: true, i, n });
    ev.push({ s: Math.round((n.start + n.duration) * spb * SR), on: false, i, n });
  });
  ev.sort((a, b) => a.s - b.s || a.on - b.on);
  const k = (sec) => 1 - Math.exp(-1 / (sec * SR)); // one-pole coefficient for a time constant
  const env = (e, A, D, Sus, Rel) => {
    if (e.stage === "attack") { e.v += 1 / (A * SR); if (e.v >= 1) { e.v = 1; e.stage = "decay"; } }
    else if (e.stage === "decay") e.v += (Sus - e.v) * k(D);
    else if (e.stage === "release") e.v += -e.v * k(Rel);
    return e.v;
  };
  const amp = { v: 0, stage: "off" }, fenv = { v: 0, stage: "off" };
  let cur = -1, gate = false, pitch = 60, target = 60, vel = 100, noteT = 0, ei = 0;
  const ic = [0, 0, 0, 0]; // SVF integrator states, two per channel
  for (let s = 0; s < TOTAL; s++) {
    for (; ei < ev.length && ev[ei].s <= s; ei++) {
      const e = ev[ei];
      if (e.on) {
        const legato = gate && p.glide > 0;
        target = e.n.pitch;
        if (!legato) { pitch = target; amp.stage = fenv.stage = "attack"; }
        cur = e.i; gate = true; vel = e.n.velocity; noteT = 0;
      } else if (e.i === cur) { gate = false; amp.stage = fenv.stage = "release"; }
    }
    pitch += p.glide > 0 ? (target - pitch) * k(p.glide) : target - pitch;
    const a = env(amp, p.ampA, p.ampD, p.ampS, p.ampR) * (1 - p.velAmp + (p.velAmp * vel) / 127);
    const f = env(fenv, p.fA, p.fD, p.fS, p.fR);
    noteT += 1 / SR;
    const vibCents = p.vib * Math.min(1, Math.max(0, (noteT - p.vibDelay) / p.vibRise)) * Math.sin((2 * Math.PI * p.vibHz * s) / SR);
    let l = 0, r = 0;
    for (const v of voices) {
      let x = 0;
      p.oscs.forEach((o, j) => {
        const dt = (440 * 2 ** ((pitch - 69) / 12 + o.oct + (v.cents + vibCents) / 1200)) / SR;
        x += o.level * OSC[o.wave](v.phases[j], dt);
        v.phases[j] = (v.phases[j] + dt) % 1;
      });
      const pa = ((v.pan + 1) * Math.PI) / 4;
      l += x * Math.cos(pa); r += x * Math.sin(pa);
    }
    // cutoff in octaves from the base: keytrack around C4, plus the filter envelope, whose depth velocity scales
    const depth = p.fAmt * (1 - p.velSens + (p.velSens * vel) / 127);
    const fc = Math.min(0.45 * SR, p.cutoff * 2 ** ((p.keytrack * (pitch - 60)) / 12 + depth * f));
    // TPT state-variable lowpass (Zavalishin): stays stable while the cutoff moves every sample
    const g = Math.tan((Math.PI * fc) / SR), kq = 2 - 2 * p.res, a1 = 1 / (1 + g * (g + kq)), a2 = g * a1, a3 = g * a2;
    const out = [l, r].map((x, c) => {
      const v3 = x - ic[2 * c + 1], v1 = a1 * ic[2 * c] + a2 * v3, v2 = ic[2 * c + 1] + a2 * ic[2 * c] + a3 * v3;
      ic[2 * c] = 2 * v1 - ic[2 * c]; ic[2 * c + 1] = 2 * v2 - ic[2 * c + 1];
      return v2;
    });
    const norm = 1 / Math.sqrt(p.unison);
    L[s] = out[0] * a * norm; R[s] = out[1] * a * norm;
  }
  return [L, R];
}

// ---------- loudness: K-weighted mean square over the excerpt, as in ITU-R BS.1770 without gating ----------
function biquad(x, [b0, b1, b2, a0, a1, a2]) {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const v = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
  }
  return y;
}
const kWeight = (x) => {
  let w = (2 * Math.PI * 1681.974450955533) / SR, A = 10 ** (3.99984385397 / 40), al = Math.sin(w) / (2 * 0.7071752369554196), c = Math.cos(w), sA = Math.sqrt(A);
  const shelf = [A * (A + 1 + (A - 1) * c + 2 * sA * al), -2 * A * (A - 1 + (A + 1) * c), A * (A + 1 + (A - 1) * c - 2 * sA * al), A + 1 - (A - 1) * c + 2 * sA * al, 2 * (A - 1 - (A + 1) * c), A + 1 - (A - 1) * c - 2 * sA * al];
  w = (2 * Math.PI * 38.13547087602444) / SR; al = Math.sin(w) / (2 * 0.5003270373238773); c = Math.cos(w);
  const hp = [(1 + c) / 2, -(1 + c), (1 + c) / 2, 1 + al, -2 * c, 1 - al];
  return biquad(biquad(x, shelf), hp);
};
const [s0, s1] = EXCERPT.map((b) => Math.round(b * spb * SR));
const loudness = ([L, R]) => {
  let e = 0;
  for (const ch of [L, R]) { const k = kWeight(ch.subarray(s0, s1)); for (const v of k) e += v * v; }
  return e / (s1 - s0);
};
const lufs = (st) => -0.691 + 10 * Math.log10(loudness(st));
const matchTo = (st, ref) => { const g = Math.sqrt(loudness(ref) / loudness(st)); for (const ch of st) for (let i = 0; i < ch.length; i++) ch[i] *= g; return st; };

// ---------- the ladder ----------
const OFF = { unison: 1, spread: 0, width: 0, keytrack: 0, res: 0, fAmt: 0, fA: 0.002, fD: 0.2, fS: 0, fR: 0.1, velSens: 0, vib: 0, vibHz: 5.5, vibDelay: 0.3, vibRise: 0.3, glide: 0 };
const bass0 = { ...OFF, oscs: [{ wave: "saw", oct: 0, level: 1 }], cutoff: 16000, ampA: 0.002, ampD: 0.3, ampS: 1, ampR: 0.03, velAmp: 0.3 };
const bass1 = { ...bass0, cutoff: 150, keytrack: 0.5, fAmt: 4, fA: 0.002, fD: 0.15, fS: 0.15, fR: 0.05 };
const bass2 = { ...bass1, res: 0.6 };
const bass3 = { ...bass2, velSens: 0.8 };
const bass4 = { ...bass3, glide: 0.035 };
const bass5 = { ...bass4, oscs: [...bass4.oscs, { wave: "square", oct: -1, level: 0.6 }] };
const lead0 = { ...OFF, oscs: [{ wave: "saw", oct: 0, level: 1 }], cutoff: 16000, ampA: 0.005, ampD: 0.3, ampS: 1, ampR: 0.12, velAmp: 0.2 };
const lead1 = { ...lead0, cutoff: 1100, keytrack: 0.7, fAmt: 2.5, fA: 0.005, fD: 0.35, fS: 0.35, fR: 0.2 };
const lead2 = { ...lead1, res: 0.4 };
const lead3 = { ...lead2, velSens: 0.7 };
const lead4 = { ...lead3, glide: 0.06 };
const lead5 = { ...lead4, vib: 18 };
const lead6 = { ...lead5, unison: 3, spread: 9, width: 0.6 };

const STEPS = [
  { ladder: "bass", id: "b0", title: "General MIDI Synth Bass 1", change: "GeneralUser's Synth Bass 1, as the project plays in Toy MIDI" },
  { ladder: "bass", id: "b1", title: "Own saw, nothing moving", change: "one band-limited saw through a wide-open lowpass, with a gate-shaped amp envelope", bass: bass0 },
  { ladder: "bass", id: "b2", title: "+ filter envelope", change: "the lowpass sits at 150 Hz, follows half the key, and opens 4 octaves at each attack, falling back over a 150 ms time constant to 15% of that", bass: bass1 },
  { ladder: "bass", id: "b3", title: "+ resonance", change: "resonance at 0.6, so the falling cutoff rings", bass: bass2 },
  { ladder: "bass", id: "b4", title: "+ velocity to filter depth", change: "velocity scales the filter envelope's depth, so a ghost note at 64 opens 60% as far as an accent at 127", bass: bass3 },
  { ladder: "bass", id: "b5", title: "+ glide on overlaps", change: "a note that starts before the previous one ends slides to its pitch with a 35 ms time constant and doesn't retrigger the envelopes", bass: bass4 },
  { ladder: "bass", id: "b6", title: "+ sub oscillator", change: "a square one octave below the saw, at 60% level", bass: bass5 },
  { ladder: "lead", id: "l0", title: "General MIDI Saw Lead", change: "GeneralUser's Saw Lead, as the project plays in Toy MIDI, over the bass from the last bass step", bass: bass5 },
  { ladder: "lead", id: "l1", title: "Own saw, nothing moving", change: "one band-limited saw through a wide-open lowpass, with a gate-shaped amp envelope", bass: bass5, lead: lead0 },
  { ladder: "lead", id: "l2", title: "+ filter envelope", change: "the lowpass sits at 1.1 kHz, follows 70% of the key, and opens 2.5 octaves at each attack, settling over 350 ms to 35% of that", bass: bass5, lead: lead1 },
  { ladder: "lead", id: "l3", title: "+ resonance", change: "resonance at 0.4", bass: bass5, lead: lead2 },
  { ladder: "lead", id: "l4", title: "+ velocity to filter depth", change: "velocity scales the filter envelope's depth, so a note at 64 opens 65% as far as one at 127", bass: bass5, lead: lead3 },
  { ladder: "lead", id: "l5", title: "+ glide on overlaps", change: "overlapping notes slide with a 60 ms time constant, without retriggering", bass: bass5, lead: lead4 },
  { ladder: "lead", id: "l6", title: "+ delayed vibrato", change: "a 5.5 Hz, ±18 cent vibrato that starts 0.3 s into each note and reaches full depth 0.3 s later, so only held notes sing", bass: bass5, lead: lead5 },
  { ladder: "lead", id: "l7", title: "+ unison", change: "three saws detuned ±9 cents and spread across the stereo field", bass: bass5, lead: lead6 },
];

const gm = {};
for (const t of project.midiTracks) { gm[t.name] = await renderGM(t); console.log("rendered GM", t.name); }
const trackLufs = Object.fromEntries(Object.entries(gm).map(([n, st]) => [n, +lufs(st).toFixed(1)]));
console.log("GM track LUFS over the excerpt", trackLufs);
const others = project.midiTracks.filter((t) => t !== BASS && t !== LEAD).map((t) => gm[t.name]);
const synthCache = new Map();
const synthPart = (track, p) => {
  const key = track.name + JSON.stringify(p);
  if (!synthCache.has(key)) synthCache.set(key, matchTo(pan(renderSynth(track.notes, p), track.pan), gm[track.name]));
  return synthCache.get(key);
};

const mixdown = (parts, from, to) => {
  const L = new Float32Array(to - from), R = new Float32Array(to - from);
  for (const [pl, pr] of parts) for (let i = from; i < to; i++) { L[i - from] += pl[i]; R[i - from] += pr[i]; }
  return [L, R];
};
const clips = [];
const levels = [];
for (const st of STEPS) {
  const bass = st.bass ? synthPart(BASS, st.bass) : gm[BASS.name];
  const lead = st.lead ? synthPart(LEAD, st.lead) : gm[LEAD.name];
  const solo = st.ladder === "bass" ? bass : lead;
  clips.push({ id: `${st.id}-mix`, st: mixdown([...others, bass, lead], s0, s1) });
  clips.push({ id: `${st.id}-solo`, st: mixdown([solo], s0, s1) });
  levels.push({ id: st.id, soloLufs: +lufs(solo).toFixed(1) });
  console.log("step", st.id);
}
const last = STEPS.at(-1);
const end = Math.round((END_BEAT * spb + 1.5) * SR);
clips.push({ id: "full-gm", st: mixdown(Object.values(gm), 0, end) });
clips.push({ id: "full-synth", st: mixdown([...others, synthPart(BASS, last.bass), synthPart(LEAD, last.lead)], 0, end) });

// one gain for every clip, so levels compare across steps
let peak = 0;
for (const c of clips) for (const ch of c.st) for (const v of ch) peak = Math.max(peak, Math.abs(v));
const gain = 0.9 / peak;
for (const c of clips) {
  const [L, R] = c.st, buf = Buffer.alloc(L.length * 8), raw = `${OUT}${c.id}.f32`;
  for (let i = 0; i < L.length; i++) { buf.writeFloatLE(L[i] * gain, i * 8); buf.writeFloatLE(R[i] * gain, i * 8 + 4); }
  writeFileSync(raw, buf);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "f32le", "-ar", String(SR), "-ac", "2", "-i", raw, "-b:a", "64k", `${OUT}${c.id}.mp3`]);
  rmSync(raw);
}
writeFileSync(`${OUT}steps.json`, JSON.stringify({ excerptBeats: EXCERPT, tempo: project.tempo, trackLufs, levels, steps: STEPS }, null, 1));
console.log(levels.map((l) => `${l.id} ${l.soloLufs}`).join("  "), "\ngain", gain.toFixed(3));
