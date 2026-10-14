// @tonejs/midi is CommonJS, so Node can only import it as a default export
import tonejsMidi from "@tonejs/midi";
import type { Project, ProjectTrack } from "./read.ts";

const { Midi } = tonejsMidi;

const DRUM_BANK = 128;
const PERCUSSION_CHANNEL = 9;

/** Beats after the last note ends, so fluidsynth renders the release tails */
const TAIL_BEATS = 2;

/**
 * Write one project track as a Standard MIDI File, so each track renders on
 * its own and gets its gain and pan in the mix afterwards. A project beat is
 * a quarter note, which is also what a MIDI beat is, so times carry over as
 * they are. A drum track plays on channel 10, where fluidsynth uses the drum
 * bank and the program picks the kit. Any other track selects its bank first.
 */
export function exportTrackMidi(
  project: Project,
  track: ProjectTrack,
): Uint8Array {
  const midi = new Midi();
  midi.name = track.name;
  const toTicks = (beats: number) => Math.round(beats * midi.header.ppq);
  midi.header.tempos = [{ ticks: 0, bpm: project.tempo }];
  const { numerator = 4, denominator = 4 } = project.timeSignature ?? {};
  midi.header.timeSignatures = [
    { ticks: 0, timeSignature: [numerator, denominator] },
  ];
  midi.header.update();

  const output = midi.addTrack();
  output.name = track.name;
  const drums = track.bank === DRUM_BANK;
  output.channel = drums ? PERCUSSION_CHANNEL : 0;
  output.instrument.number = track.program;
  if (!drums) {
    output.addCC({ number: 0, value: (track.bank ?? 0) / 127, ticks: 0 });
  }
  let end = 0;
  for (const note of track.notes) {
    output.addNote({
      midi: note.pitch,
      ticks: toTicks(note.start),
      durationTicks: Math.max(1, toTicks(note.duration)),
      velocity: (note.velocity ?? 100) / 127,
    });
    end = Math.max(end, note.start + note.duration);
  }
  // A neutral pitch bend changes nothing and only moves the end of the track
  output.addPitchBend({ value: 0, ticks: toTicks(end + TAIL_BEATS) });
  return midi.toArray();
}
