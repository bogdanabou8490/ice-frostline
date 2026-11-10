import { BASE_BAND, SWEEP_MS } from '../src/constants/config';
import { bandStart, bandWidth, isInBand, markerPos } from '../src/game/hook';
import { makeRng } from '../src/game/rng';

describe('hook timing', () => {
  it('sweeps as a triangle wave over SWEEP_MS', () => {
    expect(markerPos(0, SWEEP_MS)).toBeCloseTo(0, 5);
    expect(markerPos(SWEEP_MS / 2, SWEEP_MS)).toBeCloseTo(0.5, 5);
    expect(markerPos(SWEEP_MS, SWEEP_MS)).toBeCloseTo(1, 5);
    expect(markerPos(SWEEP_MS * 1.5, SWEEP_MS)).toBeCloseTo(0.5, 5);
    expect(markerPos(SWEEP_MS * 2, SWEEP_MS)).toBeCloseTo(0, 5);
    expect(markerPos(SWEEP_MS * 2.5, SWEEP_MS)).toBeCloseTo(0.5, 5);
  });

  it('widens the band on a perfect bait and with the wide assist', () => {
    const poor = bandWidth('poor', false);
    const good = bandWidth('good', false);
    const perfect = bandWidth('perfect', false);
    expect(poor).toBeLessThan(good);
    expect(good).toBeLessThan(perfect);
    expect(good).toBeCloseTo(BASE_BAND, 5);
    expect(bandWidth('good', true)).toBeGreaterThan(good);
    expect(bandWidth('good', false, 0.75)).toBeLessThan(good);
  });

  it('never rolls a band that runs off the track', () => {
    const rng = makeRng(99);
    for (let i = 0; i < 100; i++) {
      const width = bandWidth('perfect', true);
      const start = bandStart(rng, width);
      expect(start).toBeGreaterThanOrEqual(0.08);
      expect(start + width).toBeLessThanOrEqual(1);
    }
  });

  it('hits inside the band and misses outside it', () => {
    expect(isInBand(0.5, 0.4, 0.2)).toBe(true);
    expect(isInBand(0.4, 0.4, 0.2)).toBe(true);
    expect(isInBand(0.6, 0.4, 0.2)).toBe(true);
    expect(isInBand(0.39, 0.4, 0.2)).toBe(false);
    expect(isInBand(0.61, 0.4, 0.2)).toBe(false);
  });
});
