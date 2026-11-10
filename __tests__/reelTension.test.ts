import {
  REEL_BAND_HIGH,
  REEL_BAND_LOW,
  REEL_GRACE_MS,
  REEL_START,
  REEL_TAP_GAIN,
  REEL_TARGET_MS,
  TICK_MS,
} from '../src/constants/config';
import { advanceReel, createReel, inReelBand, reelTargetMs, tapTension } from '../src/game/reel';

describe('reel tension', () => {
  it('knows the safe band', () => {
    expect(inReelBand(REEL_START)).toBe(true);
    expect(inReelBand(REEL_BAND_LOW)).toBe(true);
    expect(inReelBand(REEL_BAND_HIGH)).toBe(true);
    expect(inReelBand(REEL_BAND_LOW - 1)).toBe(false);
    expect(inReelBand(REEL_BAND_HIGH + 1)).toBe(false);
  });

  it('adds tension on a tap and bleeds it off over time', () => {
    expect(tapTension(50)).toBe(50 + REEL_TAP_GAIN);
    const decayed = advanceReel(createReel(50), 1000, REEL_TARGET_MS);
    expect(decayed.state.tension).toBeLessThan(50);
  });

  it('lands the fish when enough in-band time is accrued', () => {
    let state = createReel(REEL_START);
    let outcome = 'running';
    for (let t = 0; t < 20000 && outcome === 'running'; t += TICK_MS) {
      if (!inReelBand(state.tension)) {
        state = { ...state, tension: tapTension(state.tension) };
      }
      const step = advanceReel(state, TICK_MS, REEL_TARGET_MS);
      state = step.state;
      outcome = step.outcome;
    }
    expect(outcome).toBe('landed');
    expect(state.inBandMs).toBeGreaterThanOrEqual(REEL_TARGET_MS);
  });

  it('snaps the line when the tension stays out of the band', () => {
    let state = createReel(REEL_BAND_LOW - 5);
    let outcome = 'running';
    let elapsed = 0;
    while (outcome === 'running' && elapsed < 10000) {
      const step = advanceReel(state, TICK_MS, REEL_TARGET_MS);
      state = step.state;
      outcome = step.outcome;
      elapsed += TICK_MS;
    }
    expect(outcome).toBe('snapped');
    expect(elapsed).toBeLessThanOrEqual(REEL_GRACE_MS + TICK_MS);
  });

  it('asks heavier species for longer in the band', () => {
    expect(reelTargetMs('PERCH')).toBeLessThan(reelTargetMs('PIKE'));
    expect(reelTargetMs('PIKE')).toBeLessThan(reelTargetMs('CHAR'));
  });
});
