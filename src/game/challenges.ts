export type ChallengeId = 'DEEP' | 'WHITEOUT' | 'TROPHY';

export type Challenge = {
  id: ChallengeId;
  name: string;
  objective: string;
  modifier: string;
  multiplier: number;
  rankNeeded: number;
  minDepth: number;
  bandFactor: number;
  hideClues: boolean;
  strikes: number;
  trophyOnly: boolean;
};

export const CHALLENGES: readonly Challenge[] = [
  {
    id: 'DEEP',
    name: 'DEEP WATER',
    objective: 'FISH ONLY HOLES AT 6 M OR DEEPER',
    modifier: 'BITE BAND -25 % · REWARD x1.6',
    multiplier: 1.6,
    rankNeeded: 1,
    minDepth: 6,
    bandFactor: 0.75,
    hideClues: false,
    strikes: 3,
    trophyOnly: false,
  },
  {
    id: 'WHITEOUT',
    name: 'WHITEOUT',
    objective: 'THE CLUE CHIPS HIDE AFTER THE FIRST CAST',
    modifier: 'MEMORY ONLY · REWARD x1.8',
    multiplier: 1.8,
    rankNeeded: 3,
    minDepth: 0,
    bandFactor: 1,
    hideClues: true,
    strikes: 3,
    trophyOnly: false,
  },
  {
    id: 'TROPHY',
    name: 'TROPHY HUNT',
    objective: 'ONLY PRIME AND TROPHY FISH SCORE',
    modifier: '4 STRIKES ALLOWED · REWARD x2.0',
    multiplier: 2,
    rankNeeded: 5,
    minDepth: 0,
    bandFactor: 1,
    hideClues: false,
    strikes: 4,
    trophyOnly: true,
  },
];

export function challengeById(id: ChallengeId | null): Challenge | null {
  if (!id) {
    return null;
  }
  return CHALLENGES.find(c => c.id === id) ?? null;
}

export function isChallengeUnlocked(c: Challenge, rank: number): boolean {
  return rank >= c.rankNeeded;
}
