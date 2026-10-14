import fs from "node:fs";
import { inflateRawSync } from "node:zlib";

/**
 * The parts of toy-midi's `SharedProject` that a render reads. The format is
 * described in toy-midi's `/llms.txt`. Note times are in quarter-note beats
 * whatever the meter, so 7/8 still counts quarters, and `tempo` is quarter
 * notes per minute.
 */
export interface Project {
  title?: string;
  tempo: number;
  timeSignature?: { numerator: number; denominator: number };
  /** Linear gain on the whole mix, 1 when absent */
  masterGain?: number;
  midiTracks?: ProjectTrack[];
}

export interface ProjectTrack {
  name: string;
  /** Program within `bank`, which picks the drum kit in bank 128 */
  program: number;
  /** SoundFont bank, 0 when absent. Bank 128 holds the GS drum kits. */
  bank?: number;
  /** Linear gain, 1 when absent */
  gain?: number;
  /** Stereo position from -1 (left) to 1 (right), 0 when absent */
  pan?: number;
  muted?: boolean;
  soloed?: boolean;
  notes: ProjectNote[];
}

export interface ProjectNote {
  pitch: number;
  /** In quarter-note beats from the start of the project */
  start: number;
  /** In quarter-note beats */
  duration: number;
  /** 0-127, 100 when absent */
  velocity?: number;
}

/** Whether a render input is a toy-midi project rather than a text score */
export function isProjectInput(input: string): boolean {
  return isUrl(input) || input.endsWith(".json");
}

/**
 * Read a project from a JSON file, a share link carrying it in `#p=`, a
 * `/draft?src=` link, or the raw URL of a JSON file.
 */
export async function readProject(input: string): Promise<Project> {
  if (!isUrl(input)) {
    return JSON.parse(fs.readFileSync(input, "utf-8"));
  }
  const url = new URL(input);
  const payload = new URLSearchParams(url.hash.slice(1)).get("p");
  if (payload) {
    return decodeSharePayload(payload);
  }
  const src = url.searchParams.get("src") ?? input;
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`could not fetch ${src} (HTTP ${response.status})`);
  }
  return (await response.json()) as Project;
}

/** A share link's payload is the project as JSON, raw-deflated and base64url-encoded */
export function decodeSharePayload(payload: string): Project {
  return JSON.parse(
    inflateRawSync(Buffer.from(payload, "base64url")).toString(),
  );
}

/**
 * The tracks toy-midi plays: muted tracks stay silent, and any soloed track
 * silences every track that isn't. Tracks without notes are left out too.
 */
export function getAudibleTracks(project: Project): ProjectTrack[] {
  const tracks = project.midiTracks ?? [];
  const anySoloed = tracks.some((track) => track.soloed);
  return tracks.filter(
    (track) =>
      !track.muted && (!anySoloed || track.soloed) && track.notes.length > 0,
  );
}

function isUrl(input: string): boolean {
  return /^https?:\/\//.test(input);
}
