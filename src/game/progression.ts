/** XP equals Frost Points. Ten ranks, each one unlocks something concrete. */
export const RANK_THRESHOLDS = [220, 480, 780, 1150, 1600, 2150, 2800, 3600, 4600];
export const MAX_RANK = RANK_THRESHOLDS.length + 1;

export const RANK_REWARDS: string[] = [
  'RANK 2 OPENS THE DEEP WATER CHALLENGE',
  'RANK 3 OPENS THE WHITEOUT CHALLENGE',
  'RANK 4 UNLOCKS THE SPOON BAIT HINT',
  'RANK 5 OPENS THE TROPHY HUNT CHALLENGE',
  'RANK 6 WIDENS THE DAILY REWARD',
  'RANK 7 ADDS A FOURTH JOURNAL COLUMN',
  'RANK 8 UNLOCKS THE DEEP BASIN SPOT',
  'RANK 9 ADDS A TROPHY TIER BONUS',
  'RANK 10 IS THE FROSTLINE MASTER TITLE',
  'FROSTLINE MASTER - EVERY LAKE IS OPEN',
];

export function rankFromXp(xp: number): number {
  let rank = 1;
  for (const t of RANK_THRESHOLDS) {
    if (xp >= t) {
      rank += 1;
    }
  }
  return Math.min(rank, MAX_RANK);
}

export type RankProgress = {
  rank: number;
  floor: number;
  ceiling: number;
  inRank: number;
  needed: number;
  ratio: number;
  reward: string;
  isMax: boolean;
};

export function rankProgress(xp: number): RankProgress {
  const rank = rankFromXp(xp);
  const floor = rank === 1 ? 0 : RANK_THRESHOLDS[rank - 2];
  const isMax = rank >= MAX_RANK;
  const ceiling = isMax ? floor : RANK_THRESHOLDS[rank - 1];
  const inRank = Math.max(0, xp - floor);
  const needed = Math.max(1, ceiling - floor);
  return {
    rank,
    floor,
    ceiling,
    inRank,
    needed,
    ratio: isMax ? 1 : Math.max(0, Math.min(1, inRank / needed)),
    reward: RANK_REWARDS[Math.min(rank - 1, RANK_REWARDS.length - 1)],
    isMax,
  };
}
