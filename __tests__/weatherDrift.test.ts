import { DRIFT_INTERVAL_MS } from '../src/constants/config';
import { makeRng } from '../src/game/rng';
import { driftWeather, rollWeather } from '../src/game/weather';
import { bucketFor } from '../src/game/bait';

describe('weather drift', () => {
  it('moves exactly one clue, inside its bounds', () => {
    const rng = makeRng(4242);
    let weather = rollWeather(rng);
    for (let i = 0; i < 300; i++) {
      const before = weather;
      const drifted = driftWeather(before, rng);
      weather = drifted.weather;

      const changedFields = [
        weather.windSpeed !== before.windSpeed,
        weather.cloud !== before.cloud,
        weather.iceTemp !== before.iceTemp,
      ].filter(Boolean).length;
      expect(changedFields).toBeLessThanOrEqual(1);

      expect(Math.abs(weather.windSpeed - before.windSpeed)).toBeLessThanOrEqual(4);
      expect(Math.abs(weather.cloud - before.cloud)).toBeLessThanOrEqual(18);
      expect(Math.abs(weather.iceTemp - before.iceTemp)).toBeLessThanOrEqual(3);

      expect(weather.windSpeed).toBeGreaterThanOrEqual(2);
      expect(weather.windSpeed).toBeLessThanOrEqual(22);
      expect(weather.cloud).toBeGreaterThanOrEqual(0);
      expect(weather.cloud).toBeLessThanOrEqual(100);
      expect(weather.iceTemp).toBeGreaterThanOrEqual(-24);
      expect(weather.iceTemp).toBeLessThanOrEqual(-2);
    }
  });

  it('can turn a perfect bait into a worse one over a trip', () => {
    const rng = makeRng(11);
    let weather = { windDir: 'NE' as const, windSpeed: 6, cloud: 30, iceTemp: -18 };
    expect(bucketFor('JIG', weather)).toBe('perfect');
    let downgraded = false;
    for (let i = 0; i < 200 && !downgraded; i++) {
      weather = driftWeather(weather, rng).weather;
      if (bucketFor('JIG', weather) !== 'perfect') {
        downgraded = true;
      }
    }
    expect(downgraded).toBe(true);
  });

  it('drifts on a timer the player can read', () => {
    expect(DRIFT_INTERVAL_MS).toBeGreaterThan(5000);
  });
});
