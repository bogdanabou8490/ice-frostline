import { makeRng, tripSeed } from '../src/game/rng';
import { pickSpot, SPOTS } from '../src/game/species';
import { rollWeather } from '../src/game/weather';

describe('trip plan', () => {
  it('rolls a spot and a weather triple from the trip seed', () => {
    const rng = makeRng(tripSeed(20461, 1));
    const spot = pickSpot(rng);
    const weather = rollWeather(rng);

    expect(SPOTS).toContain(spot);
    expect(spot.depth).toBeGreaterThanOrEqual(2.5);
    expect(weather.windSpeed).toBeGreaterThanOrEqual(2);
    expect(weather.windSpeed).toBeLessThanOrEqual(22);
    expect(weather.cloud).toBeGreaterThanOrEqual(0);
    expect(weather.cloud).toBeLessThanOrEqual(100);
    expect(weather.iceTemp).toBeGreaterThanOrEqual(-24);
    expect(weather.iceTemp).toBeLessThanOrEqual(-2);
  });

  it('is reproducible from the seed and different between trips', () => {
    const a = makeRng(tripSeed(20461, 1));
    const b = makeRng(tripSeed(20461, 1));
    const c = makeRng(tripSeed(20461, 2));
    expect(rollWeather(a)).toEqual(rollWeather(b));

    const first = JSON.stringify([pickSpot(makeRng(tripSeed(20461, 1))).id, rollWeather(c)]);
    let different = false;
    for (let trip = 2; trip < 12; trip++) {
      const rng = makeRng(tripSeed(20461, trip));
      if (JSON.stringify([pickSpot(rng).id, rollWeather(rng)]) !== first) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);
  });

  it('honours a minimum depth when a challenge demands deep water', () => {
    for (let i = 0; i < 40; i++) {
      expect(pickSpot(makeRng(i + 1), 6).depth).toBeGreaterThanOrEqual(6);
    }
  });
});
