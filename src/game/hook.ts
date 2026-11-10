import { BASE_BAND, ASSIST_WIDE } from '../constants/config';
import { MATCH_FACTOR, type MatchBucket } from './bait';
import type { Rng } from './rng';

/** Green band width as a fraction of the track: BASE_BAND * matchFactor * assist. */
export function bandWidth(bucket: MatchBucket, wideAssist: boolean, challengeFactor = 1): number {
  const raw = BASE_BAND * MATCH_FACTOR[bucket] * (wideAssist ? ASSIST_WIDE : 1) * challengeFactor;
  return Math.max(0.06, Math.min(0.6, raw));
}

/** Band position is rolled per cast so the player cannot memorise one spot. */
export function bandStart(rng: Rng, width: number): number {
  return rng.range(0.08, Math.max(0.08, 0.92 - width));
}

/** Triangle wave 0..1..0 — the amber marker sweeping the track, linear so the
 *  JS hit test and the native-driven translateX stay in step. */
export function markerPos(elapsedMs: number, sweepMs: number): number {
  const period = sweepMs * 2;
  const t = ((elapsedMs % period) + period) % period;
  return t < sweepMs ? t / sweepMs : 2 - t / sweepMs;
}

export function isInBand(pos: number, start: number, width: number): boolean {
  return pos >= start && pos <= start + width;
}

/** How many full sweeps the fish stays interested before it loses interest. */
export const BITE_SWEEPS = 3;
