import { BAITS, MATCH_BONUS, MATCH_FACTOR, baitById, matchBucket, matchScore } from '../src/game/bait';
import { weatherVector, type Weather } from '../src/game/weather';

function weatherFor(bait: (typeof BAITS)[number]): Weather {
  const [wind, cloud, warmth] = bait.profile;
  return {
    windDir: 'NE',
    windSpeed: Math.round(2 + wind * 20),
    cloud: Math.round(cloud * 100),
    iceTemp: Math.round(warmth * 22 - 24),
  };
}

describe('bait match', () => {
  it('scores a bait on its own weather as perfect', () => {
    for (const bait of BAITS) {
      const score = matchScore(bait, weatherFor(bait));
      expect(score).toBeGreaterThan(0.95);
      expect(matchBucket(score)).toBe('perfect');
    }
  });

  it('scores a bait on the opposite weather as poor', () => {
    const jig = baitById('JIG');
    const opposite: Weather = { windDir: 'S', windSpeed: 22, cloud: 100, iceTemp: -2 };
    expect(matchBucket(matchScore(jig, opposite))).toBe('poor');
  });

  it('keeps the bucket thresholds ordered', () => {
    expect(matchBucket(0.9)).toBe('perfect');
    expect(matchBucket(0.6)).toBe('good');
    expect(matchBucket(0.2)).toBe('poor');
    expect(MATCH_FACTOR.perfect).toBeGreaterThan(MATCH_FACTOR.good);
    expect(MATCH_FACTOR.good).toBeGreaterThan(MATCH_FACTOR.poor);
    expect(MATCH_BONUS.perfect).toBeGreaterThan(MATCH_BONUS.poor);
  });

  it('normalises the weather into the same 0..1 space as the profiles', () => {
    const v = weatherVector({ windDir: 'N', windSpeed: 22, cloud: 100, iceTemp: -2 });
    expect(v).toEqual([1, 1, 1]);
  });
});
