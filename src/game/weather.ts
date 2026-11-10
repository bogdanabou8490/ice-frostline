import type { Rng } from './rng';

export const WIND_DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
export type WindDir = (typeof WIND_DIRS)[number];

export type Weather = {
  windDir: WindDir;
  windSpeed: number; // 2..22
  cloud: number; // 0..100 %
  iceTemp: number; // -24..-2 C
};

export type ClueId = 'wind' | 'cloud' | 'temp';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function rollWeather(rng: Rng): Weather {
  return {
    windDir: rng.pick(WIND_DIRS),
    windSpeed: rng.int(2, 22),
    cloud: rng.int(0, 100),
    iceTemp: rng.int(-24, -2),
  };
}

/** One bounded step on one clue — the bait that was perfect may become merely good. */
export function driftWeather(w: Weather, rng: Rng): { weather: Weather; changed: ClueId } {
  const changed = rng.pick(['wind', 'cloud', 'temp'] as const);
  if (changed === 'wind') {
    return {
      weather: { ...w, windSpeed: clamp(w.windSpeed + rng.int(-4, 4), 2, 22) },
      changed,
    };
  }
  if (changed === 'cloud') {
    return { weather: { ...w, cloud: clamp(w.cloud + rng.int(-18, 18), 0, 100) }, changed };
  }
  return { weather: { ...w, iceTemp: clamp(w.iceTemp + rng.int(-3, 3), -24, -2) }, changed };
}

/** Weather as a normalised 0..1 vector so a bait profile can be compared to it. */
export function weatherVector(w: Weather): [number, number, number] {
  return [(w.windSpeed - 2) / 20, w.cloud / 100, (w.iceTemp + 24) / 22];
}

export function clueText(w: Weather): { wind: string; cloud: string; temp: string } {
  return {
    wind: `WIND ${w.windDir} ${w.windSpeed}`,
    cloud: `CLOUD ${w.cloud} %`,
    temp: `ICE ${w.iceTemp} C`,
  };
}
