import { MAX_RANK, RANK_THRESHOLDS, rankFromXp, rankProgress } from '../src/game/progression';
import { catchPoints } from '../src/game/species';

describe('progression', () => {
  it('starts at rank 1 and climbs through every threshold', () => {
    expect(rankFromXp(0)).toBe(1);
    expect(rankFromXp(219)).toBe(1);
    expect(rankFromXp(220)).toBe(2);
    RANK_THRESHOLDS.forEach((t, i) => {
      expect(rankFromXp(t)).toBe(i + 2);
    });
    expect(rankFromXp(999999)).toBe(MAX_RANK);
  });

  it('reports a bounded ratio and a reward line for every rank', () => {
    for (const xp of [0, 100, 220, 500, 1200, 4600, 9000]) {
      const p = rankProgress(xp);
      expect(p.ratio).toBeGreaterThanOrEqual(0);
      expect(p.ratio).toBeLessThanOrEqual(1);
      expect(p.reward.length).toBeGreaterThan(3);
    }
    expect(rankProgress(999999).isMax).toBe(true);
  });

  it('pays more for a bigger fish, a better bait and a challenge', () => {
    const base = catchPoints('PERCH', 'SMALL', 'poor');
    expect(catchPoints('PERCH', 'TROPHY', 'poor')).toBeGreaterThan(base);
    expect(catchPoints('PERCH', 'SMALL', 'perfect')).toBeGreaterThan(base);
    expect(catchPoints('CHAR', 'SMALL', 'poor')).toBeGreaterThan(base);
    expect(catchPoints('PERCH', 'SMALL', 'poor', 2)).toBe(base * 2);
  });
});
