import type { Rng } from './rng';
import { MATCH_BONUS, type MatchBucket } from './bait';

export type SpeciesId = 'PERCH' | 'BURBOT' | 'PIKE' | 'CHAR';
export type Tier = 'SMALL' | 'PRIME' | 'TROPHY';

export type Species = {
  id: SpeciesId;
  name: string;
  /** 1-based index into sprite_1..sprite_4 */
  sprite: number;
  base: number;
  /** heavier fish need longer in the reel band */
  reelFactor: number;
  ranges: Record<Tier, [number, number]>;
};

export const SPECIES: Record<SpeciesId, Species> = {
  PERCH: {
    id: 'PERCH',
    name: 'PERCH',
    sprite: 1,
    base: 40,
    reelFactor: 1,
    ranges: { SMALL: [0.3, 0.9], PRIME: [0.9, 1.8], TROPHY: [1.8, 2.6] },
  },
  BURBOT: {
    id: 'BURBOT',
    name: 'BURBOT',
    sprite: 2,
    base: 70,
    reelFactor: 1.15,
    ranges: { SMALL: [0.5, 1.1], PRIME: [1.1, 2.2], TROPHY: [2.2, 3.4] },
  },
  PIKE: {
    id: 'PIKE',
    name: 'PIKE',
    sprite: 3,
    base: 110,
    reelFactor: 1.3,
    ranges: { SMALL: [0.7, 1.4], PRIME: [1.4, 2.8], TROPHY: [2.8, 4.6] },
  },
  CHAR: {
    id: 'CHAR',
    name: 'ARCTIC CHAR',
    sprite: 4,
    base: 180,
    reelFactor: 1.6,
    ranges: { SMALL: [0.6, 1.2], PRIME: [1.2, 2.6], TROPHY: [2.6, 5.5] },
  },
};

export const SPECIES_ORDER: SpeciesId[] = ['PERCH', 'BURBOT', 'PIKE', 'CHAR'];
export const TIER_ORDER: Tier[] = ['SMALL', 'PRIME', 'TROPHY'];
export const TIER_MULT: Record<Tier, number> = { SMALL: 1, PRIME: 1.6, TROPHY: 2.4 };

export type Spot = {
  id: string;
  name: string;
  depth: number;
  weights: Record<SpeciesId, number>;
};

/** Six named spots on the lake — depth drives which species show up. */
export const SPOTS: readonly Spot[] = [
  { id: 'reed', name: 'REED EDGE', depth: 2.5, weights: { PERCH: 60, BURBOT: 22, PIKE: 15, CHAR: 3 } },
  { id: 'shelf', name: 'ICE SHELF', depth: 3.6, weights: { PERCH: 48, BURBOT: 28, PIKE: 19, CHAR: 5 } },
  { id: 'bar', name: 'SAND BAR', depth: 4.2, weights: { PERCH: 40, BURBOT: 30, PIKE: 22, CHAR: 8 } },
  { id: 'drop', name: 'DROP OFF', depth: 5.4, weights: { PERCH: 28, BURBOT: 30, PIKE: 28, CHAR: 14 } },
  { id: 'trench', name: 'COLD TRENCH', depth: 6.8, weights: { PERCH: 18, BURBOT: 28, PIKE: 32, CHAR: 22 } },
  { id: 'basin', name: 'DEEP BASIN', depth: 8.0, weights: { PERCH: 12, BURBOT: 24, PIKE: 32, CHAR: 32 } },
];

export function pickSpot(rng: Rng, minDepth = 0): Spot {
  const pool = SPOTS.filter(s => s.depth >= minDepth);
  return rng.pick(pool.length > 0 ? pool : SPOTS);
}

/** A perfect bait doubles the weight of the spot's rarest species. */
export function drawSpecies(spot: Spot, bucket: MatchBucket, rng: Rng): SpeciesId {
  const weights = { ...spot.weights };
  if (bucket === 'perfect') {
    let rarest: SpeciesId = SPECIES_ORDER[0];
    for (const id of SPECIES_ORDER) {
      if (weights[id] < weights[rarest]) {
        rarest = id;
      }
    }
    weights[rarest] = weights[rarest] * 2;
  }
  return rng.weighted(weights);
}

/** Small 55 / Prime 33 / Trophy 12, shifted +8 pp upward on a perfect bait. */
export function rollTier(bucket: MatchBucket, rng: Rng): Tier {
  const shift = bucket === 'perfect' ? 8 : 0;
  const weights: Record<Tier, number> = {
    SMALL: 55 - shift,
    PRIME: 33,
    TROPHY: 12 + shift,
  };
  return rng.weighted(weights);
}

export function sampleWeight(id: SpeciesId, tier: Tier, rng: Rng): number {
  const [min, max] = SPECIES[id].ranges[tier];
  return Math.round(rng.range(min, max) * 10) / 10;
}

export function catchPoints(
  id: SpeciesId,
  tier: Tier,
  bucket: MatchBucket,
  challengeMultiplier = 1,
): number {
  return Math.round(SPECIES[id].base * TIER_MULT[tier] * MATCH_BONUS[bucket] * challengeMultiplier);
}
