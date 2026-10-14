import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { deflateRawSync } from "node:zlib";
import { Midi } from "@tonejs/midi";
import { expect, test } from "vitest";
import { getPanFilter } from "../midi/render.ts";
import { exportTrackMidi } from "./export.ts";
import {
  getAudibleTracks,
  isProjectInput,
  readProject,
  type Project,
  type ProjectTrack,
} from "./read.ts";

const PROJECT: Project = {
  title: "Seven",
  tempo: 120,
  timeSignature: { numerator: 7, denominator: 8 },
  midiTracks: [
    {
      name: "bass",
      program: 33,
      gain: 0.5,
      pan: -0.25,
      notes: [{ pitch: 40, start: 3.5, duration: 0.5, velocity: 90 }],
    },
  ],
};

test("tells projects from scores", () => {
  expect(isProjectInput("song.json")).toBe(true);
  expect(isProjectInput("https://example.com/draft#p=abc")).toBe(true);
  expect(isProjectInput("song.txt")).toBe(false);
});

test("reads a project file and a share link", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "score-tool-test-"));
  const file = path.join(dir, "project.json");
  fs.writeFileSync(file, JSON.stringify(PROJECT));
  expect(await readProject(file)).toEqual(PROJECT);
  fs.rmSync(dir, { recursive: true });

  const payload = deflateRawSync(JSON.stringify(PROJECT)).toString("base64url");
  expect(
    await readProject(`https://toy-midi.example/draft#p=${payload}`),
  ).toEqual(PROJECT);
});

test("leaves out muted tracks, tracks a solo silences, and empty tracks", () => {
  const track = (name: string, update: Partial<ProjectTrack> = {}) => ({
    name,
    program: 0,
    notes: [{ pitch: 60, start: 0, duration: 1 }],
    ...update,
  });
  const names = (tracks: ProjectTrack[]) =>
    getAudibleTracks({ tempo: 120, midiTracks: tracks }).map((t) => t.name);
  expect(
    names([track("a"), track("b", { muted: true }), track("c", { notes: [] })]),
  ).toEqual(["a"]);
  expect(
    names([
      track("a"),
      track("b", { soloed: true }),
      track("c", { soloed: true, muted: true }),
    ]),
  ).toEqual(["b"]);
});

test("writes a track with quarter-note timing, its bank, and a tail", () => {
  const midi = new Midi(
    exportTrackMidi(PROJECT, { ...PROJECT.midiTracks![0], bank: 8 }),
  );
  expect(midi.header.tempos[0].bpm).toBe(120);
  expect(midi.header.timeSignatures[0].timeSignature).toEqual([7, 8]);
  const [track] = midi.tracks;
  expect(track.channel).toBe(0);
  expect(track.instrument.number).toBe(33);
  expect(Math.round(track.controlChanges[0][0].value * 127)).toBe(8);
  expect(
    track.notes.map((note) => [note.midi, note.time, note.duration]),
  ).toEqual([[40, 1.75, 0.25]]);
  // Two beats after the last note ends at beat 4
  expect(track.endOfTrackTicks).toBe(6 * midi.header.ppq);
});

test("writes a drum track on channel 10 with the kit as its program", () => {
  const midi = new Midi(
    exportTrackMidi(PROJECT, {
      name: "drums",
      bank: 128,
      program: 25,
      notes: [{ pitch: 36, start: 0, duration: 0.25 }],
    }),
  );
  const [track] = midi.tracks;
  expect(track.channel).toBe(9);
  expect(track.instrument.number).toBe(25);
  expect(track.controlChanges[0]).toBeUndefined();
  expect(track.notes[0].velocity).toBeCloseTo(100 / 127);
});

test("pans like StereoPannerNode on stereo input", () => {
  expect(getPanFilter(-1)).toBe("pan=stereo|c0=c0+1*c1|c1=0*c1");
  expect(getPanFilter(1)).toMatch(
    /^pan=stereo\|c0=6\.\d+e-17\*c0\|c1=c1\+1\*c0$/,
  );
  expect(getPanFilter(-0.5)).toBe(
    `pan=stereo|c0=c0+${Math.SQRT1_2}*c1|c1=${Math.sin(Math.PI / 4)}*c1`,
  );
});
