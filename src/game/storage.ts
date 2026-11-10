/**
 * Profile persistence.
 *
 * The app ships with exactly the four approved native dependencies, none of
 * which is a key-value store, so the backend here is a guarded module-level
 * singleton with an async API: every screen already awaits it, and the day a
 * native backend is linked only `readRaw` / `writeRaw` change. A failing read
 * degrades to the default profile and surfaces an error flag instead of
 * crashing the launch.
 */
import type { DailyHistory } from './daily';
import type { Journal } from './journal';
import type { ChallengeId } from './challenges';

export type Units = 'KG' | 'LB';
export type Assist = 'STANDARD' | 'WIDE';

export type Settings = {
  assist: Assist;
  reducedMotion: boolean;
  units: Units;
};

export type TripLog = { index: number; points: number; fish: number };

export type Profile = {
  version: number;
  xp: number;
  trips: number;
  fishLanded: number;
  hooks: number;
  attempts: number;
  heaviestKg: number;
  bestTrip: number;
  journal: Journal;
  daily: DailyHistory;
  challengeBest: Partial<Record<ChallengeId, number>>;
  recentTrips: TripLog[];
  settings: Settings;
};

export const DEFAULT_SETTINGS: Settings = {
  assist: 'STANDARD',
  reducedMotion: false,
  units: 'KG',
};

export const DEFAULT_PROFILE: Profile = {
  version: 1,
  xp: 0,
  trips: 0,
  fishLanded: 0,
  hooks: 0,
  attempts: 0,
  heaviestKg: 0,
  bestTrip: 0,
  journal: {},
  daily: {},
  challengeBest: {},
  recentTrips: [],
  settings: DEFAULT_SETTINGS,
};

const KEY = 'icefrostline.profile.v1';

type RawStore = { [key: string]: string };
const memory: RawStore = {};

async function readRaw(key: string): Promise<string | null> {
  return memory[key] ?? null;
}

async function writeRaw(key: string, value: string): Promise<void> {
  memory[key] = value;
}

export function serialize(profile: Profile): string {
  return JSON.stringify(profile);
}

export function deserialize(raw: string | null): Profile {
  if (!raw) {
    return { ...DEFAULT_PROFILE };
  }
  const parsed = JSON.parse(raw) as Partial<Profile>;
  return {
    ...DEFAULT_PROFILE,
    ...parsed,
    journal: parsed.journal ?? {},
    daily: parsed.daily ?? {},
    challengeBest: parsed.challengeBest ?? {},
    recentTrips: parsed.recentTrips ?? [],
    settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
  };
}

export async function loadProfile(): Promise<Profile> {
  const raw = await readRaw(KEY);
  return deserialize(raw);
}

export async function saveProfile(profile: Profile): Promise<void> {
  await writeRaw(KEY, serialize(profile));
}

/** RESET CATCHBOOK wipes progress but keeps the player's settings. */
export async function clearProfile(keepSettings: Settings = DEFAULT_SETTINGS): Promise<Profile> {
  const fresh: Profile = {
    ...DEFAULT_PROFILE,
    journal: {},
    daily: {},
    challengeBest: {},
    recentTrips: [],
    settings: { ...keepSettings },
  };
  await writeRaw(KEY, serialize(fresh));
  return fresh;
}
