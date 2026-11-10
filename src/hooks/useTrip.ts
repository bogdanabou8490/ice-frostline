import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BAG_LIMIT,
  CATCH_CARD_MS,
  DESCEND_MS,
  DRIFT_INTERVAL_MS,
  REEL_START,
  STRIKES_MAX,
  TICK_MS,
  TRIP_FREEZE_MS,
} from '../constants/config';
import {
  BAITS,
  bucketFor,
  isBaitUnlocked,
  type BaitId,
  type MatchBucket,
} from '../game/bait';
import { challengeById, type ChallengeId } from '../game/challenges';
import type { DailyModifier } from '../game/daily';
import { BITE_SWEEPS, bandStart as rollBandStart, bandWidth, isInBand } from '../game/hook';
import { mergeCatch, unlockedCount, type Journal } from '../game/journal';
import { makeRng, type Rng } from '../game/rng';
import { advanceReel, createReel, reelTargetMs, tapTension, type ReelState } from '../game/reel';
import {
  catchPoints,
  drawSpecies,
  pickSpot,
  rollTier,
  sampleWeight,
  type SpeciesId,
  type Spot,
} from '../game/species';
import type { Settings } from '../game/storage';
import {
  endReasonFor,
  heaviest,
  totalPoints,
  type CatchRecord,
  type EndReason,
  type Phase,
  type TripMode,
  type TripSummary,
} from '../game/trip';
import { driftWeather, rollWeather, type ClueId, type Weather } from '../game/weather';
import { SWEEP_MS } from '../constants/config';

export type TripSetup = {
  mode: TripMode;
  challengeId: ChallengeId | null;
  seed: number;
  tripIndex: number;
  journal: Journal;
  settings: Settings;
  daily: DailyModifier | null;
};

export type TripEvent = {
  kind: 'none' | 'hook' | 'spook' | 'snap' | 'landed' | 'drift' | 'move' | 'left';
  at: number;
};

export type TripView = {
  phase: Phase;
  spot: Spot;
  weather: Weather;
  cluesVisible: boolean;
  clueChanged: ClueId | null;
  freeze: number;
  freezeCeiling: number;
  strikes: number;
  maxStrikes: number;
  selectedBait: BaitId;
  bucket: MatchBucket;
  bandStart: number;
  bandWidth: number;
  castKey: number;
  species: SpeciesId | null;
  tension: number;
  reelRatio: number;
  lastCatch: CatchRecord | null;
  catches: CatchRecord[];
  points: number;
  moves: number;
  pages: number;
  event: TripEvent;
};

type Internal = {
  phase: Phase;
  spot: Spot;
  weather: Weather;
  freeze: number;
  freezeCeiling: number;
  strikes: number;
  catches: CatchRecord[];
  hooks: number;
  attempts: number;
  selectedBait: BaitId;
  bandStart: number;
  bandWidth: number;
  castKey: number;
  biteStartedAt: number;
  species: SpeciesId | null;
  reel: ReelState;
  reelTarget: number;
  lastCatch: CatchRecord | null;
  clueChanged: ClueId | null;
  clueFlashUntil: number;
  phaseUntil: number;
  nextDriftAt: number;
  cluesVisible: boolean;
  moves: number;
  journal: Journal;
  ended: EndReason | null;
};

const NO_EVENT: TripEvent = { kind: 'none', at: 0 };

/**
 * The trip state machine. The authoritative state lives in a ref so the 50 ms
 * loop and the tap handlers always read live values (never a stale closure);
 * React only ever sees the snapshot published by commit().
 */
export function useTrip(setup: TripSetup, onEnd: (summary: TripSummary) => void) {
  const rngRef = useRef<Rng>(makeRng(setup.seed));
  const challenge = useMemo(() => challengeById(setup.challengeId), [setup.challengeId]);
  const daily = setup.daily;
  const onEndRef = useRef(onEnd);
  onEndRef.current = onEnd;

  const maxStrikes = Math.max(
    1,
    (challenge ? challenge.strikes : STRIKES_MAX) + (daily ? daily.strikesDelta : 0),
  );
  const minDepth = Math.max(challenge ? challenge.minDepth : 0, daily ? daily.minDepth : 0);
  const bandFactor = (challenge ? challenge.bandFactor : 1) * (daily ? daily.bandFactor : 1);
  const pointsMult = (challenge ? challenge.multiplier : 1) * (daily ? daily.pointsMult : 1);
  const freezeMult = daily ? daily.freezeMult : 1;
  const driftMult = daily ? daily.driftMult : 1;
  const trophyOnly = Boolean(challenge && challenge.trophyOnly);
  const wideAssist = setup.settings.assist === 'WIDE';

  const stateRef = useRef<Internal | null>(null);
  if (stateRef.current === null) {
    const rng = rngRef.current;
    const spot = pickSpot(rng, minDepth);
    const weather = rollWeather(rng);
    const pages = unlockedCount(setup.journal);
    const firstBait = (BAITS.find(b => isBaitUnlocked(b.id, pages)) ?? BAITS[0]).id;
    stateRef.current = {
      phase: 'bait',
      spot,
      weather,
      freeze: 100,
      freezeCeiling: 100,
      strikes: 0,
      catches: [],
      hooks: 0,
      attempts: 0,
      selectedBait: firstBait,
      bandStart: 0.4,
      bandWidth: 0.2,
      castKey: 0,
      biteStartedAt: 0,
      species: null,
      reel: createReel(REEL_START),
      reelTarget: 2800,
      lastCatch: null,
      clueChanged: null,
      clueFlashUntil: 0,
      phaseUntil: 0,
      nextDriftAt: Date.now() + DRIFT_INTERVAL_MS / driftMult,
      cluesVisible: true,
      moves: 0,
      journal: setup.journal,
      ended: null,
    };
  }

  const snapshot = useCallback(
    (event: TripEvent): TripView => {
      const s = stateRef.current as Internal;
      return {
        phase: s.phase,
        spot: s.spot,
        weather: s.weather,
        cluesVisible: s.cluesVisible,
        clueChanged: Date.now() < s.clueFlashUntil ? s.clueChanged : null,
        freeze: Math.max(0, Math.min(100, s.freeze)),
        freezeCeiling: s.freezeCeiling,
        strikes: s.strikes,
        maxStrikes,
        selectedBait: s.selectedBait,
        bucket: bucketFor(s.selectedBait, s.weather),
        bandStart: s.bandStart,
        bandWidth: s.bandWidth,
        castKey: s.castKey,
        species: s.species,
        tension: s.reel.tension,
        reelRatio: Math.max(0, Math.min(1, s.reel.inBandMs / Math.max(1, s.reelTarget))),
        lastCatch: s.lastCatch,
        catches: s.catches,
        points: totalPoints(s.catches),
        moves: s.moves,
        pages: unlockedCount(s.journal),
        event,
      };
    },
    [maxStrikes],
  );

  const [view, setView] = useState<TripView>(() => snapshot(NO_EVENT));
  const commit = useCallback(
    (kind: TripEvent['kind'] = 'none') => {
      setView(snapshot(kind === 'none' ? NO_EVENT : { kind, at: Date.now() }));
    },
    [snapshot],
  );

  const finish = useCallback(
    (reason: EndReason) => {
      const s = stateRef.current as Internal;
      if (s.ended) {
        return;
      }
      s.ended = reason;
      const summary: TripSummary = {
        reason,
        points: totalPoints(s.catches),
        catches: s.catches,
        hooks: s.hooks,
        attempts: s.attempts,
        seed: rngRef.current.seed,
        tripIndex: setup.tripIndex,
        spotName: s.spot.name,
        mode: setup.mode,
        challengeId: setup.challengeId,
        newPages: s.catches.filter(c => c.isNewPage).length,
        heaviestKg: heaviest(s.catches),
      };
      onEndRef.current(summary);
    },
    [setup.challengeId, setup.mode, setup.tripIndex],
  );

  const checkEnd = useCallback(() => {
    const s = stateRef.current as Internal;
    const reason = endReasonFor(s.freeze, s.strikes, maxStrikes, s.catches.length, setup.mode);
    if (reason && !s.ended) {
      finish(reason);
      return true;
    }
    return false;
  }, [finish, maxStrikes, setup.mode]);

  const beginBite = useCallback(() => {
    const s = stateRef.current as Internal;
    s.phase = 'bite';
    s.biteStartedAt = Date.now();
    s.phaseUntil = 0;
  }, []);

  const land = useCallback(() => {
    const s = stateRef.current as Internal;
    const rng = rngRef.current;
    const species = s.species ?? 'PERCH';
    const bucket = bucketFor(s.selectedBait, s.weather);
    const tier = rollTier(bucket, rng);
    const weightKg = sampleWeight(species, tier, rng);
    const scored = trophyOnly && tier === 'SMALL' ? 0 : catchPoints(species, tier, bucket, pointsMult);
    const merged = mergeCatch(
      s.journal,
      species,
      tier,
      weightKg,
      s.selectedBait,
      new Date().toISOString().slice(0, 10),
    );
    s.journal = merged.journal;
    const record: CatchRecord = {
      species,
      tier,
      weightKg,
      points: scored,
      bait: s.selectedBait,
      isNewPage: merged.isNew,
    };
    s.catches = [...s.catches, record];
    s.lastCatch = record;
    s.freeze = Math.max(0, s.freeze - 10);
    s.phase = 'landed';
    s.phaseUntil = Date.now() + CATCH_CARD_MS;
    s.species = null;
  }, [pointsMult, trophyOnly]);

  const backToBait = useCallback(() => {
    const s = stateRef.current as Internal;
    s.phase = 'bait';
    s.phaseUntil = 0;
    s.species = null;
    s.reel = createReel(REEL_START);
  }, []);

  // ---- the loop -----------------------------------------------------------
  const pausedRef = useRef(false);
  const setPaused = useCallback(
    (value: boolean) => {
      pausedRef.current = value;
      commit();
    },
    [commit],
  );

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current as Internal;
      if (s.ended || pausedRef.current) {
        return;
      }
      const now = Date.now();
      let event: TripEvent['kind'] = 'none';

      s.freeze = Math.max(0, s.freeze - (100 * TICK_MS * freezeMult) / TRIP_FREEZE_MS);

      if (now >= s.nextDriftAt && s.phase === 'bait') {
        const drifted = driftWeather(s.weather, rngRef.current);
        s.weather = drifted.weather;
        s.clueChanged = drifted.changed;
        s.clueFlashUntil = now + 1600;
        s.nextDriftAt = now + DRIFT_INTERVAL_MS / driftMult;
        event = 'drift';
      }

      if (s.phase === 'descend' && now >= s.phaseUntil) {
        beginBite();
      } else if (s.phase === 'landed' && now >= s.phaseUntil) {
        backToBait();
      } else if (s.phase === 'bite') {
        if (now - s.biteStartedAt > BITE_SWEEPS * 2 * SWEEP_MS) {
          backToBait();
          event = 'left';
        }
      } else if (s.phase === 'reel') {
        const step = advanceReel(s.reel, TICK_MS, s.reelTarget);
        s.reel = step.state;
        if (step.outcome === 'landed') {
          land();
          event = 'landed';
        } else if (step.outcome === 'snapped') {
          s.freeze = Math.max(0, s.freeze - 8);
          backToBait();
          event = 'snap';
        }
      }

      if (checkEnd()) {
        return;
      }
      commit(event);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [backToBait, beginBite, checkEnd, commit, driftMult, freezeMult, land]);

  // ---- player actions -----------------------------------------------------
  const selectBait = useCallback(
    (id: BaitId) => {
      const s = stateRef.current as Internal;
      if (s.ended || s.phase !== 'bait') {
        return;
      }
      if (!isBaitUnlocked(id, unlockedCount(s.journal))) {
        return;
      }
      s.selectedBait = id;
      commit();
    },
    [commit],
  );

  const dropLine = useCallback(() => {
    const s = stateRef.current as Internal;
    const rng = rngRef.current;
    const bucket = bucketFor(s.selectedBait, s.weather);
    s.bandWidth = bandWidth(bucket, wideAssist, bandFactor);
    s.bandStart = rollBandStart(rng, s.bandWidth);
    s.species = drawSpecies(s.spot, bucket, rng);
    s.reelTarget = reelTargetMs(s.species);
    s.reel = createReel(REEL_START);
    s.castKey += 1;
    // WHITEOUT: the clue chips go dark once the first line is in the water.
    if (challenge && challenge.hideClues) {
      s.cluesVisible = false;
    }
    s.phase = 'descend';
    s.phaseUntil = Date.now() + DESCEND_MS;
    commit();
  }, [bandFactor, challenge, commit, wideAssist]);

  const hookNow = useCallback(
    (markerPosition: number) => {
      const s = stateRef.current as Internal;
      s.attempts += 1;
      if (isInBand(markerPosition, s.bandStart, s.bandWidth)) {
        s.hooks += 1;
        s.phase = 'reel';
        s.reel = createReel(REEL_START);
        commit('hook');
        return true;
      }
      s.strikes += 1;
      s.freeze = Math.max(0, s.freeze - 12);
      backToBait();
      if (!checkEnd()) {
        commit('spook');
      }
      return false;
    },
    [backToBait, checkEnd, commit],
  );

  const pullReel = useCallback(() => {
    const s = stateRef.current as Internal;
    if (s.phase !== 'reel') {
      return;
    }
    s.reel = { ...s.reel, tension: tapTension(s.reel.tension) };
    commit();
  }, [commit]);

  const skipCatchCard = useCallback(() => {
    const s = stateRef.current as Internal;
    if (s.phase !== 'landed') {
      return;
    }
    backToBait();
    commit();
  }, [backToBait, commit]);

  /** Drill a new hole: the meter refills, the clues re-roll, the ceiling drops. */
  const moveHole = useCallback(() => {
    const s = stateRef.current as Internal;
    if (s.ended || s.phase !== 'bait') {
      return;
    }
    const rng = rngRef.current;
    s.freezeCeiling = Math.max(45, s.freezeCeiling - 15);
    s.freeze = s.freezeCeiling;
    s.spot = pickSpot(rng, minDepth);
    s.weather = rollWeather(rng);
    s.cluesVisible = true;
    s.clueChanged = null;
    s.moves += 1;
    s.nextDriftAt = Date.now() + DRIFT_INTERVAL_MS / driftMult;
    commit('move');
  }, [commit, driftMult, minDepth]);

  const giveUp = useCallback(() => {
    finish('FROZEN');
  }, [finish]);

  return {
    view,
    bagLimit: BAG_LIMIT,
    setPaused,
    selectBait,
    dropLine,
    hookNow,
    pullReel,
    skipCatchCard,
    moveHole,
    giveUp,
  };
}
