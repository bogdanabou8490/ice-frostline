import { LOADER_DURATION_MS } from '../src/constants/config';
import { END_HEADLINE, END_SUB, accuracy, heaviest, totalPoints } from '../src/game/trip';
import { formatPercent, formatPoints, formatWeight } from '../src/game/format';
import { unlockedCount } from '../src/game/journal';
import { DEFAULT_PROFILE } from '../src/game/storage';

describe('screen states', () => {
  it('holds the loader for exactly eight seconds', () => {
    expect(LOADER_DURATION_MS).toBe(8000);
  });

  it('names every trip end in the game own words', () => {
    for (const reason of ['FROZEN', 'SPOOKED', 'BAG', 'OBJECTIVE'] as const) {
      expect(END_HEADLINE[reason]).not.toMatch(/game over/i);
      expect(END_HEADLINE[reason].length).toBeGreaterThan(5);
      expect(END_SUB[reason].length).toBeGreaterThan(10);
    }
  });

  it('starts empty so every hub can show its themed empty state', () => {
    expect(DEFAULT_PROFILE.trips).toBe(0);
    expect(unlockedCount(DEFAULT_PROFILE.journal)).toBe(0);
    expect(DEFAULT_PROFILE.recentTrips).toHaveLength(0);
    expect(totalPoints([])).toBe(0);
    expect(heaviest([])).toBe(0);
    expect(accuracy(0, 0)).toBe(0);
  });

  it('formats the numbers the result screen prints', () => {
    expect(formatPoints(1240)).toBe('1 240');
    expect(formatPoints(980)).toBe('980');
    expect(formatPoints(1240000)).toBe('1 240 000');
    expect(formatPercent(72.4)).toBe('72 %');
    expect(formatWeight(2.44, 'KG')).toBe('2.4 KG');
  });

  it('reports hook accuracy out of the attempts actually made', () => {
    expect(accuracy(3, 4)).toBe(75);
    expect(accuracy(0, 5)).toBe(0);
  });
});
