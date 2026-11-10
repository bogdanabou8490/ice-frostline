import {
  DAILY_MODIFIERS,
  canPlayDaily,
  dailyModifier,
  dailySeed,
  dateKey,
  formatDateKey,
  weekStrip,
} from '../src/game/daily';

const DAY = new Date(2026, 10, 10, 12, 0, 0); // 10.11.2026

describe('daily lake', () => {
  it('derives a stable key and seed from the calendar date', () => {
    expect(dateKey(DAY)).toBe('20261110');
    expect(dailySeed(DAY)).toBe(20261110);
    expect(dailySeed(new Date(2026, 10, 10, 23, 59))).toBe(dailySeed(DAY));
    expect(dailySeed(new Date(2026, 10, 11, 0, 1))).not.toBe(dailySeed(DAY));
    expect(formatDateKey('20261110')).toBe('10.11.2026');
  });

  it('allows one run per day', () => {
    const key = dateKey(DAY);
    expect(canPlayDaily({}, key)).toBe(true);
    expect(canPlayDaily({ [key]: { key, points: 980, fish: 4 } }, key)).toBe(false);
  });

  it('gives every day a modifier that changes a real number', () => {
    const modifier = dailyModifier(DAY);
    expect(DAILY_MODIFIERS).toContain(modifier);
    for (const m of DAILY_MODIFIERS) {
      const touchesSomething =
        m.pointsMult !== 1 ||
        m.freezeMult !== 1 ||
        m.bandFactor !== 1 ||
        m.strikesDelta !== 0 ||
        m.minDepth !== 0 ||
        m.driftMult !== 1;
      expect(touchesSomething).toBe(true);
    }
  });

  it('builds a seven cell week strip ending today', () => {
    const played = dateKey(new Date(DAY.getTime() - 2 * 86400000));
    const strip = weekStrip({ [played]: { key: played, points: 10, fish: 1 } }, DAY);
    expect(strip).toHaveLength(7);
    expect(strip[6].key).toBe(dateKey(DAY));
    expect(strip[4].played).toBe(true);
    expect(strip[0].played).toBe(false);
  });
});
