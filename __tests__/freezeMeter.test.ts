import {
  BAG_LIMIT,
  FREEZE_ON_CATCH,
  FREEZE_ON_SNAP,
  FREEZE_ON_SPOOK,
  STRIKES_MAX,
  TICK_MS,
  TRIP_FREEZE_MS,
} from '../src/constants/config';
import { END_HEADLINE, endReasonFor } from '../src/game/trip';

function drainIdle(): number {
  let freeze = 100;
  let elapsed = 0;
  while (freeze > 0) {
    freeze -= (100 * TICK_MS) / TRIP_FREEZE_MS;
    elapsed += TICK_MS;
  }
  return elapsed;
}

describe('hole freeze meter', () => {
  it('never kills an idle player inside the first minute', () => {
    const elapsed = drainIdle();
    expect(elapsed).toBeGreaterThanOrEqual(60000);
    expect(elapsed).toBeGreaterThanOrEqual(TRIP_FREEZE_MS - 200);
    expect(elapsed).toBeLessThanOrEqual(TRIP_FREEZE_MS + 200);
  });

  it('charges a real cost for a spook, a snap and a catch', () => {
    expect(FREEZE_ON_SPOOK).toBeGreaterThan(0);
    expect(FREEZE_ON_SNAP).toBeGreaterThan(0);
    expect(FREEZE_ON_CATCH).toBeGreaterThan(0);
    expect(FREEZE_ON_SPOOK).toBeGreaterThan(FREEZE_ON_SNAP);
  });

  it('ends the trip with the right reason, in the game own words', () => {
    expect(endReasonFor(100, 0, STRIKES_MAX, 0, 'FREE')).toBeNull();
    expect(endReasonFor(0, 0, STRIKES_MAX, 0, 'FREE')).toBe('FROZEN');
    expect(endReasonFor(50, STRIKES_MAX, STRIKES_MAX, 0, 'FREE')).toBe('SPOOKED');
    expect(endReasonFor(50, 0, STRIKES_MAX, BAG_LIMIT, 'FREE')).toBe('BAG');
    expect(endReasonFor(50, 0, STRIKES_MAX, BAG_LIMIT, 'DAILY')).toBe('OBJECTIVE');
    expect(END_HEADLINE.FROZEN).toBe('HOLE FROZE OVER');
    expect(END_HEADLINE.SPOOKED).toBe('FISH SPOOKED OUT');
  });

  it('lets three bad hooks end a trip in about three seconds', () => {
    const tapsPerSecond = 1;
    expect(STRIKES_MAX / tapsPerSecond).toBeLessThanOrEqual(3);
  });
});
