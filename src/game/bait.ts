import { weatherVector, type Weather } from './weather';

export type BaitId = 'JIG' | 'MINNOW' | 'SPOON' | 'GRUB';
export type MatchBucket = 'perfect' | 'good' | 'poor';

export type Bait = {
  id: BaitId;
  name: string;
  /** [wind, cloud, warmth] the bait likes, each 0..1 */
  profile: [number, number, number];
  unlockPages: number;
  note: string;
};

/** Four baits covering four corners of the weather space. */
export const BAITS: readonly Bait[] = [
  { id: 'JIG', name: 'JIG', profile: [0.2, 0.3, 0.25], unlockPages: 0, note: 'CALM COLD WATER' },
  { id: 'MINNOW', name: 'MINNOW', profile: [0.75, 0.7, 0.5], unlockPages: 0, note: 'WINDY OVERCAST' },
  { id: 'SPOON', name: 'SPOON', profile: [0.45, 0.15, 0.8], unlockPages: 3, note: 'BRIGHT MILD DAY' },
  { id: 'GRUB', name: 'GRUB', profile: [0.15, 0.85, 0.7], unlockPages: 6, note: 'STILL GREY THAW' },
];

export const CONFIDENCE_PAGES = 10; // the 3-dot confidence row turns on here

export function baitById(id: BaitId): Bait {
  return BAITS.find(b => b.id === id) ?? BAITS[0];
}

/** 1 - normalised distance between the bait profile and the weather vector. */
export function matchScore(bait: Bait, weather: Weather): number {
  const w = weatherVector(weather);
  let sum = 0;
  for (let i = 0; i < 3; i++) {
    const d = bait.profile[i] - w[i];
    sum += d * d;
  }
  const distance = Math.sqrt(sum) / Math.sqrt(3);
  return Math.max(0, Math.min(1, 1 - distance));
}

export function matchBucket(score: number): MatchBucket {
  if (score >= 0.78) {
    return 'perfect';
  }
  if (score >= 0.52) {
    return 'good';
  }
  return 'poor';
}

/** Widens / narrows the green bite band. */
export const MATCH_FACTOR: Record<MatchBucket, number> = { perfect: 1.35, good: 1.0, poor: 0.7 };
/** Multiplies the points of a landed fish. */
export const MATCH_BONUS: Record<MatchBucket, number> = { perfect: 1.5, good: 1.2, poor: 0.8 };
export const BUCKET_LABEL: Record<MatchBucket, string> = {
  perfect: 'PERFECT MATCH',
  good: 'GOOD MATCH',
  poor: 'POOR MATCH',
};

export function isBaitUnlocked(id: BaitId, journalPages: number): boolean {
  return journalPages >= baitById(id).unlockPages;
}

export function unlockedBaits(journalPages: number): BaitId[] {
  return BAITS.filter(b => journalPages >= b.unlockPages).map(b => b.id);
}

export function bucketFor(id: BaitId, weather: Weather): MatchBucket {
  return matchBucket(matchScore(baitById(id), weather));
}
