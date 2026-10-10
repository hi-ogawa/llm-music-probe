// Bundle every part module into one toy_midi_eval code body on stdout.
import { TEMPO, TOTAL_BEATS, timeline } from "./spec.mjs";
const mods = process.argv.slice(2);
const tracks = [];
for (const m of mods) {
  tracks.push(...(await import(new URL(m, import.meta.url))).parts());
}
for (const t of tracks) {
  t.notes = t.notes.map((n) => ({
    pitch: n.pitch,
    start: +n.start.toFixed(4),
    duration: +n.duration.toFixed(4),
    velocity: Math.round(n.velocity),
  }));
}
const locators = timeline().map((s) => [s.start, s.name]);
console.log(`
const tracks = ${JSON.stringify(tracks)};
const locators = ${JSON.stringify(locators)};
runtime.pause();
for (const t of runtime.store.get().midiTracks) runtime.removeMidiTrack(t.id);
for (const l of runtime.store.get().locators) runtime.deleteLocator(l.id);
runtime.setTitle("Donut Shop (Dilla Sketch)");
runtime.setTempo(${TEMPO});
for (const t of tracks) {
  const before = new Set(runtime.store.get().midiTracks.map((x) => x.id));
  await runtime.addMidiTrack({ bank: t.bank, program: t.program });
  const id = runtime.store.get().midiTracks.find((x) => !before.has(x.id)).id;
  runtime.setTrackName({ id, name: t.name });
  runtime.setTrackMix(id, { gain: t.gain });
  runtime.setMidiTrackNotes(id, t.notes.map((n) => ({ id: crypto.randomUUID(), ...n })));
  runtime.setMidiTrackSettings(id, { viewMode: "overview" });
}
for (const [beat, label] of locators) runtime.updateLocator({ id: runtime.addLocator(beat), label });
runtime.setLoop({ range: { startBeat: 0, endBeat: ${TOTAL_BEATS} }, enabled: false });
runtime.seek(0);
await runtime.play();
const s = runtime.store.get();
return { playing: s.isPlaying, tempo: s.tempo, tracks: s.midiTracks.map((t) => [t.name, t.bank ?? 0, t.program, t.notes.length]) };
`);
