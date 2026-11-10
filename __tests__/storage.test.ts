import {
  DEFAULT_PROFILE,
  clearProfile,
  deserialize,
  loadProfile,
  saveProfile,
  serialize,
  type Profile,
} from '../src/game/storage';
import { mergeCatch } from '../src/game/journal';

describe('profile storage', () => {
  it('returns the default profile when nothing is stored yet', async () => {
    const profile = await loadProfile();
    expect(profile.xp).toBeGreaterThanOrEqual(0);
    expect(profile.settings).toEqual(DEFAULT_PROFILE.settings);
  });

  it('round trips a played profile', async () => {
    const journal = mergeCatch({}, 'CHAR', 'TROPHY', 4.2, 'SPOON', '2026-11-10').journal;
    const played: Profile = {
      ...DEFAULT_PROFILE,
      xp: 1240,
      trips: 3,
      fishLanded: 9,
      heaviestKg: 4.2,
      bestTrip: 640,
      journal,
      recentTrips: [{ index: 1, points: 640, fish: 4 }],
    };
    await saveProfile(played);
    const back = await loadProfile();
    expect(back.xp).toBe(1240);
    expect(back.trips).toBe(3);
    expect(back.heaviestKg).toBe(4.2);
    expect(Object.keys(back.journal)).toContain('CHAR:TROPHY');
    expect(back.recentTrips).toHaveLength(1);
  });

  it('RESET CATCHBOOK clears progress but keeps the settings', async () => {
    const fresh = await clearProfile({ assist: 'WIDE', reducedMotion: true, units: 'LB' });
    expect(fresh.xp).toBe(0);
    expect(fresh.trips).toBe(0);
    expect(fresh.journal).toEqual({});
    expect(fresh.daily).toEqual({});
    expect(fresh.settings.assist).toBe('WIDE');

    const reloaded = await loadProfile();
    expect(reloaded.xp).toBe(0);
    expect(reloaded.settings.units).toBe('LB');
  });

  it('never throws on a damaged payload shape', () => {
    expect(deserialize(serialize(DEFAULT_PROFILE)).version).toBe(1);
    expect(deserialize('{}').journal).toEqual({});
  });
});
