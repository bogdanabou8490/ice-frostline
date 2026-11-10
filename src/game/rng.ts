/**
 * Seeded mulberry32. One generator per trip, so a run is reproducible from the
 * seed printed on the result screen, and two trips differ visibly.
 */
export type Rng = {
  readonly seed: number;
  next(): number;
  range(min: number, max: number): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  chance(p: number): boolean;
  weighted<T extends string>(weights: Record<T, number>): T;
};

export function makeRng(seed: number): Rng {
  let a = (seed >>> 0) || 1;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    seed: seed >>> 0,
    next,
    range: (min, max) => min + next() * (max - min),
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    pick: <T,>(items: readonly T[]) => items[Math.floor(next() * items.length) % items.length],
    chance: p => next() < p,
    weighted: <T extends string>(weights: Record<T, number>): T => {
      const keys = Object.keys(weights) as T[];
      let total = 0;
      for (const k of keys) {
        total += Math.max(0, weights[k]);
      }
      if (total <= 0) {
        return keys[0];
      }
      let roll = next() * total;
      for (const k of keys) {
        roll -= Math.max(0, weights[k]);
        if (roll <= 0) {
          return k;
        }
      }
      return keys[keys.length - 1];
    },
  };
}

/** seed = dayIndex * 7919 ^ tripIndex * 104729 — logged on the result screen. */
export function tripSeed(dayIndex: number, tripIndex: number): number {
  return ((dayIndex * 7919) ^ (tripIndex * 104729)) >>> 0;
}
