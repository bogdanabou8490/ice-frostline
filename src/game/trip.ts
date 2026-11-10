import { BAG_LIMIT, FREEZE_ON_CATCH, FREEZE_ON_SNAP, FREEZE_ON_SPOOK } from '../constants/config';
import type { BaitId } from './bait';
import { challengeById, type ChallengeId } from './challenges';
import type { SpeciesId, Tier } from './species';

export type Phase = 'bait' | 'descend' | 'bite' | 'reel' | 'landed';

export type EndReason = 'FROZEN' | 'SPOOKED' | 'BAG' | 'OBJECTIVE';

/** Result headlines in the game's own words - never a generic "Game over". */
export const END_HEADLINE: Record<EndReason, string> = {
  FROZEN: 'HOLE FROZE OVER',
  SPOOKED: 'FISH SPOOKED OUT',
  BAG: 'BAG LIMIT REACHED',
  OBJECTIVE: 'DAILY RUN COMPLETE',
};

export const END_SUB: Record<EndReason, string> = {
  FROZEN: 'THE ICE CLOSED THE HOLE BEFORE YOU DID',
  SPOOKED: 'TOO MANY MISSED HOOKS - THE SHOAL LEFT',
  BAG: 'SIX FISH ON THE ICE - A FULL BAG',
  OBJECTIVE: 'THE DAY LAKE IS CLOSED UNTIL TOMORROW',
};

export type TripMode = 'FREE' | 'DAILY' | 'CHALLENGE';

export type CatchRecord = {
  species: SpeciesId;
  tier: Tier;
  weightKg: number;
  points: number;
  bait: BaitId;
  isNewPage: boolean;
};

export type TripSummary = {
  reason: EndReason;
  points: number;
  catches: CatchRecord[];
  hooks: number;
  attempts: number;
  seed: number;
  tripIndex: number;
  spotName: string;
  mode: TripMode;
  challengeId: ChallengeId | null;
  newPages: number;
  heaviestKg: number;
};

export function accuracy(hooks: number, attempts: number): number {
  if (attempts <= 0) {
    return 0;
  }
  return Math.round((hooks / attempts) * 100);
}

export function heaviest(catches: CatchRecord[]): number {
  return catches.reduce((best, c) => (c.weightKg > best ? c.weightKg : best), 0);
}

export function totalPoints(catches: CatchRecord[]): number {
  return catches.reduce((sum, c) => sum + c.points, 0);
}

export function strikeBudget(challengeId: ChallengeId | null, base: number): number {
  const c = challengeById(challengeId);
  return c ? c.strikes : base;
}

export function challengeMultiplier(challengeId: ChallengeId | null): number {
  const c = challengeById(challengeId);
  return c ? c.multiplier : 1;
}

export const FREEZE_COST = {
  spook: FREEZE_ON_SPOOK,
  snap: FREEZE_ON_SNAP,
  landed: FREEZE_ON_CATCH,
};

/** The single place that decides a trip is over. */
export function endReasonFor(
  freeze: number,
  strikes: number,
  maxStrikes: number,
  landed: number,
  mode: TripMode,
): EndReason | null {
  if (landed >= BAG_LIMIT) {
    return mode === 'FREE' ? 'BAG' : 'OBJECTIVE';
  }
  if (strikes >= maxStrikes) {
    return 'SPOOKED';
  }
  if (freeze <= 0) {
    return 'FROZEN';
  }
  return null;
}
