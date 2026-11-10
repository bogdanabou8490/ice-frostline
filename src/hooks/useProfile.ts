import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearProfile,
  loadProfile,
  saveProfile,
  DEFAULT_PROFILE,
  type Profile,
  type Settings,
} from '../game/storage';
import { mergeCatch, unlockedCount, type Journal } from '../game/journal';
import { rankFromXp } from '../game/progression';
import { dateKey } from '../game/daily';
import type { TripSummary } from '../game/trip';

export type ProfileApi = {
  profile: Profile;
  loading: boolean;
  error: boolean;
  rank: number;
  journalPages: number;
  reload: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
  commitTrip: (summary: TripSummary) => void;
  resetProgress: () => void;
};

/** One owner of the stored profile; screens receive it as a prop. */
export function useProfile(): ProfileApi {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const reload = useCallback(() => {
    setLoading(true);
    setError(false);
    loadProfile()
      .then(p => {
        if (mounted.current) {
          setProfile(p);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted.current) {
          setError(true);
          setLoading(false);
        }
      });
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const persist = useCallback((next: Profile) => {
    setProfile(next);
    saveProfile(next).catch(() => {
      /* a failed write must never take the app down */
    });
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setProfile(prev => {
        const next: Profile = { ...prev, settings: { ...prev.settings, ...patch } };
        saveProfile(next).catch(() => {});
        return next;
      });
    },
    [],
  );

  const commitTrip = useCallback((summary: TripSummary) => {
    setProfile(prev => {
      let journal: Journal = prev.journal;
      let heaviest = prev.heaviestKg;
      const today = dateKey(new Date());
      for (const c of summary.catches) {
        const merged = mergeCatch(journal, c.species, c.tier, c.weightKg, c.bait, today);
        journal = merged.journal;
        if (c.weightKg > heaviest) {
          heaviest = c.weightKg;
        }
      }
      const recent = [
        ...prev.recentTrips,
        { index: prev.trips + 1, points: summary.points, fish: summary.catches.length },
      ].slice(-5);
      const challengeBest = { ...prev.challengeBest };
      if (summary.challengeId) {
        const best = challengeBest[summary.challengeId] ?? 0;
        if (summary.points > best) {
          challengeBest[summary.challengeId] = summary.points;
        }
      }
      const daily = { ...prev.daily };
      if (summary.mode === 'DAILY') {
        daily[today] = { key: today, points: summary.points, fish: summary.catches.length };
      }
      const next: Profile = {
        ...prev,
        xp: prev.xp + summary.points,
        trips: prev.trips + 1,
        fishLanded: prev.fishLanded + summary.catches.length,
        hooks: prev.hooks + summary.hooks,
        attempts: prev.attempts + summary.attempts,
        heaviestKg: heaviest,
        bestTrip: Math.max(prev.bestTrip, summary.points),
        journal,
        daily,
        challengeBest,
        recentTrips: recent,
      };
      saveProfile(next).catch(() => {});
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    clearProfile(profile.settings)
      .then(fresh => {
        if (mounted.current) {
          setProfile(fresh);
        }
      })
      .catch(() => {
        if (mounted.current) {
          persist({ ...DEFAULT_PROFILE, settings: profile.settings });
        }
      });
  }, [persist, profile.settings]);

  return {
    profile,
    loading,
    error,
    rank: rankFromXp(profile.xp),
    journalPages: unlockedCount(profile.journal),
    reload,
    updateSettings,
    commitTrip,
    resetProgress,
  };
}
