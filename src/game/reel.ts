import {
  REEL_BAND_HIGH,
  REEL_BAND_LOW,
  REEL_DECAY_PER_S,
  REEL_GRACE_MS,
  REEL_TAP_GAIN,
  REEL_TARGET_MS,
} from '../constants/config';
import { SPECIES, type SpeciesId } from './species';

export type ReelState = {
  tension: number;
  inBandMs: number;
  outMs: number;
};

export type ReelOutcome = 'running' | 'landed' | 'snapped';

export function createReel(start: number): ReelState {
  return { tension: start, inBandMs: 0, outMs: 0 };
}

export function inReelBand(tension: number): boolean {
  return tension >= REEL_BAND_LOW && tension <= REEL_BAND_HIGH;
}

export function reelTargetMs(id: SpeciesId): number {
  return Math.round(REEL_TARGET_MS * SPECIES[id].reelFactor);
}

export function tapTension(tension: number): number {
  return Math.min(118, tension + REEL_TAP_GAIN);
}

/** One tick of the reel loop: tension decays, in-band time accrues, grace runs out. */
export function advanceReel(
  state: ReelState,
  dtMs: number,
  targetMs: number,
): { state: ReelState; outcome: ReelOutcome } {
  const tension = Math.max(-10, state.tension - (REEL_DECAY_PER_S * dtMs) / 1000);
  const ok = inReelBand(tension);
  const next: ReelState = {
    tension,
    inBandMs: state.inBandMs + (ok ? dtMs : 0),
    outMs: ok ? 0 : state.outMs + dtMs,
  };
  if (next.inBandMs >= targetMs) {
    return { state: next, outcome: 'landed' };
  }
  if (next.outMs >= REEL_GRACE_MS) {
    return { state: next, outcome: 'snapped' };
  }
  return { state: next, outcome: 'running' };
}

export const REEL_BAND: readonly [number, number] = [REEL_BAND_LOW, REEL_BAND_HIGH];
