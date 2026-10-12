import { deflateRawSync } from "node:zlib";
import type { Song } from "../score/expand.ts";
import { DEFAULT_VOL, getChannelVolume, getVelocity } from "./export.ts";
import { GENERAL_MIDI_SOUNDS } from "./general-midi.ts";

export const TOY_MIDI_ORIGIN = "https://toy-midi.hiro18181.workers.dev";

/** toy-midi's soundfont bank for GS drum kits, and its Standard kit */
const DRUM_BANK = 128;
const STANDARD_KIT = 0;

/**
 * Write a song as a toy-midi share link, a `/draft` URL carrying the project
 * as raw-deflated, base64url JSON in the shape of toy-midi's `SharedProject`.
 * Timing follows `exportMidi`: a score beat is a quarter note. toy-midi has
 * one tempo and one meter per project, so only the first of each is kept.
 * Every voice gets its own track, percussion included, so each drum voice
 * keeps its own pan, which a shared MIDI channel could not. Levels match the
 * MIDI export as fluidsynth plays it: a melodic voice's channel volume becomes
 * track gain, and a percussion voice's level stays in its velocities.
 */
export function exportShareLink(song: Song): string {
  const midiTracks = song.voices.map((voice) => {
    const sound = GENERAL_MIDI_SOUNDS[voice.instrument];
    const notes = song.notes
      .filter((note) => note.voice === voice.name)
      .map((note) => ({
        pitch:
          sound.kind === "percussion"
            ? sound.note
            : sound.kind === "effect"
              ? sound.pitch
              : note.pitch!,
        start: round(note.start),
        duration: round(sound.kind === "effect" ? sound.length : note.duration),
        velocity: getVelocity(
          note.level,
          sound.kind === "percussion" ? voice.vol : DEFAULT_VOL,
        ),
      }));
    return {
      name: voice.name,
      ...(sound.kind === "percussion"
        ? { bank: DRUM_BANK, program: STANDARD_KIT }
        : { program: sound.program }),
      gain: sound.kind === "percussion" ? 1 : round(getTrackGain(voice.vol)),
      pan: voice.pan,
      notes,
    };
  });
  const project = {
    title: song.meta.title ?? "",
    tempo: song.tempos[0]?.bpm ?? 120,
    timeSignature: { numerator: song.meters[0]?.beats ?? 4, denominator: 4 },
    loop: { range: { startBeat: 0, endBeat: song.length }, enabled: true },
    midiTracks,
  };
  const payload = deflateRawSync(JSON.stringify(project)).toString("base64url");
  return `${TOY_MIDI_ORIGIN}/draft#p=${payload}`;
}

/**
 * Track gain for the channel volume (CC7) the MIDI export writes, relative to
 * the General MIDI default of 100. A SoundFont synth attenuates CC7 by
 * 40·log10(CC7/127) dB, which is an amplitude of (CC7/127)², so the gain is
 * that amplitude divided by the default's.
 */
function getTrackGain(vol: number): number {
  return (getChannelVolume(vol) / 100) ** 2;
}

/** Keep beat positions short in the link, since triplet steps repeat forever */
function round(value: number): number {
  return Math.round(value * 10000) / 10000;
}
