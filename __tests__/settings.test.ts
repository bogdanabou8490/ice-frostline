import { ASSIST_WIDE, REDUCED_MOTION_MS } from '../src/constants/config';
import { bandWidth } from '../src/game/hook';
import { formatWeight, unitLabel } from '../src/game/format';
import { DEFAULT_SETTINGS, deserialize, serialize, type Profile } from '../src/game/storage';
import { DEFAULT_PROFILE } from '../src/game/storage';

describe('settings have real effects', () => {
  it('HOOK ASSIST WIDE widens the bite band by ASSIST_WIDE', () => {
    const standard = bandWidth('good', false);
    const wide = bandWidth('good', true);
    expect(wide / standard).toBeCloseTo(ASSIST_WIDE, 5);
  });

  it('WEIGHT UNITS re-format every weight', () => {
    expect(formatWeight(1.8, 'KG')).toBe('1.8 KG');
    expect(formatWeight(1.8, 'LB')).toBe('4.0 LB');
    expect(unitLabel('LB')).toBe('LB');
  });

  it('REDUCED MOTION clamps decorative durations', () => {
    expect(REDUCED_MOTION_MS).toBeLessThanOrEqual(120);
  });

  it('persists every setting through a serialise round trip', () => {
    const profile: Profile = {
      ...DEFAULT_PROFILE,
      settings: { assist: 'WIDE', reducedMotion: true, units: 'LB' },
    };
    const back = deserialize(serialize(profile));
    expect(back.settings).toEqual({ assist: 'WIDE', reducedMotion: true, units: 'LB' });
  });

  it('falls back to the default settings for an unknown profile', () => {
    expect(deserialize(null).settings).toEqual(DEFAULT_SETTINGS);
    expect(deserialize('{"xp":40}').settings).toEqual(DEFAULT_SETTINGS);
  });
});
