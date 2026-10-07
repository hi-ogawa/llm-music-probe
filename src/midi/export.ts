// @tonejs/midi is CommonJS, so Node can only import it as a default export
import tonejsMidi from "@tonejs/midi";
import type { Song } from "../score/expand.ts";
import { GENERAL_MIDI_SOUNDS } from "./general-midi.ts";
import { phraseLine, type PlayedNote } from "./phrase.ts";

const { Midi } = tonejsMidi;

const PERCUSSION_CHANNEL = 9;

/**
 * Write a song as a Standard MIDI File with one track per voice.
 * A score beat is written as one MIDI quarter note, so 6/8 written as
 * `beats 2 steps 3` becomes 2/4 with triplet steps.
 * Voices listed in `phrase` are played through the phrasing pass, which
 * shapes velocity, note length, and expression without changing notes.
 */
export function exportMidi(
  song: Song,
  options: { phrase?: string[] } = {},
): Uint8Array {
  const midi = new Midi();
  midi.name = song.meta.title ?? "";
  const toTicks = (beats: number) => Math.round(beats * midi.header.ppq);
  midi.header.tempos = song.tempos.map((tempo) => ({
    ticks: toTicks(tempo.start),
    bpm: tempo.bpm,
  }));
  midi.header.timeSignatures = song.meters.map((meter) => ({
    ticks: toTicks(meter.start),
    timeSignature: [meter.beats, 4],
  }));
  midi.header.update();

  const channels = assignChannels(song);
  for (const voice of song.voices) {
    const sound = GENERAL_MIDI_SOUNDS[voice.instrument];
    const track = midi.addTrack();
    track.name = voice.name;
    track.channel = channels.get(voice.name)!;
    if (sound.kind !== "percussion") {
      track.instrument.number = sound.program;
      // Percussion voices share one channel, so they cannot have their own pan
      track.addCC({ number: 10, value: (voice.pan + 1) / 2, ticks: 0 });
    }
    const addPlayedNote = (note: PlayedNote) =>
      track.addNote({
        midi: note.pitch,
        ticks: toTicks(note.start),
        durationTicks: Math.max(1, toTicks(note.duration)),
        velocity: note.velocity / 127,
      });
    const notes = song.notes.filter((note) => note.voice === voice.name);
    if (sound.kind === "program" && options.phrase?.includes(voice.name)) {
      const phrased = phraseLine(
        notes.map((note) => ({
          pitch: note.pitch!,
          start: note.start,
          duration: note.duration,
          velocity: getVelocity(note.level, voice.vol),
        })),
        { instrument: voice.instrument, gate: voice.gate },
      );
      phrased.notes.forEach((note) => addPlayedNote(note));
      for (const control of phrased.controls) {
        track.addCC({
          number: control.number,
          value: control.value / 127,
          ticks: toTicks(control.time),
        });
      }
      continue;
    }
    for (const note of notes) {
      addPlayedNote({
        pitch:
          sound.kind === "percussion"
            ? sound.note
            : sound.kind === "effect"
              ? sound.pitch
              : note.pitch!,
        start: note.start,
        duration: sound.kind === "effect" ? sound.length : note.duration,
        velocity: getVelocity(note.level, voice.vol),
      });
    }
  }
  return midi.toArray();
}

/**
 * MIDI velocity from a note's dynamic level and its voice's `vol`.
 * Level 0 at the default `vol` of 0.8 is velocity 90, each level step is 18,
 * and `vol` scales the result, so voice balance and accents share one control.
 */
function getVelocity(level: number, vol: number): number {
  const velocity = Math.round(((90 + 18 * level) * vol) / 0.8);
  return Math.min(127, Math.max(1, velocity));
}

/** Percussion voices share channel 10, and every other voice gets its own channel */
function assignChannels(song: Song): Map<string, number> {
  const channels = new Map<string, number>();
  let next = 0;
  for (const voice of song.voices) {
    if (GENERAL_MIDI_SOUNDS[voice.instrument].kind === "percussion") {
      channels.set(voice.name, PERCUSSION_CHANNEL);
      continue;
    }
    if (next === PERCUSSION_CHANNEL) {
      next++;
    }
    if (next > 15) {
      throw new Error(
        "a song can have at most 15 voices that are not percussion",
      );
    }
    channels.set(voice.name, next++);
  }
  return channels;
}
