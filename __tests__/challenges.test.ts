import { CHALLENGES, challengeById, isChallengeUnlocked } from '../src/game/challenges';
import { bandWidth } from '../src/game/hook';
import { pickSpot } from '../src/game/species';
import { makeRng } from '../src/game/rng';
import { strikeBudget, challengeMultiplier } from '../src/game/trip';

describe('challenges', () => {
  it('offers three challenges, each paying more than a free trip', () => {
    expect(CHALLENGES).toHaveLength(3);
    for (const c of CHALLENGES) {
      expect(c.multiplier).toBeGreaterThan(1);
      expect(c.objective.length).toBeGreaterThan(8);
    }
  });

  it('gates the harder challenges behind a rank', () => {
    const [deep, whiteout, trophy] = CHALLENGES;
    expect(isChallengeUnlocked(deep, 1)).toBe(true);
    expect(isChallengeUnlocked(whiteout, 2)).toBe(false);
    expect(isChallengeUnlocked(whiteout, 3)).toBe(true);
    expect(isChallengeUnlocked(trophy, 4)).toBe(false);
    expect(isChallengeUnlocked(trophy, 5)).toBe(true);
  });

  it('applies the modifier of the chosen challenge', () => {
    expect(challengeMultiplier('TROPHY')).toBe(2);
    expect(challengeMultiplier(null)).toBe(1);
    expect(strikeBudget('TROPHY', 3)).toBe(4);
    expect(strikeBudget(null, 3)).toBe(3);

    const deep = challengeById('DEEP');
    expect(deep).not.toBeNull();
    expect(bandWidth('good', false, deep ? deep.bandFactor : 1)).toBeLessThan(
      bandWidth('good', false),
    );
    expect(pickSpot(makeRng(7), deep ? deep.minDepth : 0).depth).toBeGreaterThanOrEqual(6);
    expect(challengeById('WHITEOUT')?.hideClues).toBe(true);
  });
});
