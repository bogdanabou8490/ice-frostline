/**
 * IceFrostline — tunable gameplay constants.
 * Every number the trip machine reads lives here, so balance is one file.
 */

// Loader holds exactly 8 s (game-common 2.1 / RN rule #13). Never shorten.
export const LOADER_DURATION_MS = 8000;

// Trip shape
export const TRIP_FREEZE_MS = 90000; // idle drain of a fresh hole, 100% -> 0%
export const STRIKES_MAX = 3;
export const BAG_LIMIT = 6;

// Bite phase
export const SWEEP_MS = 1400; // one left->right pass of the marker
export const BASE_BAND = 0.2; // green band as a fraction of the track
export const ASSIST_WIDE = 1.35;
export const BITE_RISE_MIN_MS = 1200;
export const BITE_RISE_MAX_MS = 2600;
export const DESCEND_MS = 900;
export const FLEE_MS = 420;

// Reel phase
export const REEL_TARGET_MS = 2800;
export const REEL_DECAY_PER_S = 22;
export const REEL_TAP_GAIN = 14;
export const REEL_BAND_LOW = 35;
export const REEL_BAND_HIGH = 72;
export const REEL_GRACE_MS = 700;
export const REEL_START = 50;

// Freeze meter costs
export const DRIFT_INTERVAL_MS = 25000;
export const FREEZE_ON_SPOOK = 12;
export const FREEZE_ON_SNAP = 8;
export const FREEZE_ON_CATCH = 10;
export const FREEZE_ON_MOVE_COST_MS = 12000; // drilling a new hole costs trip time

// Presentation
export const CATCH_CARD_MS = 1800;
export const TICK_MS = 50; // game loop resolution
export const REDUCED_MOTION_MS = 120;

// Touch and button geometry — one source for the rules the UI must obey.
export const TOUCH_MIN = 48;
export const HEADER_BUTTON = 44;
export const HEADER_HIT_SLOP = 8;
export const BUTTON_HEIGHT_PRIMARY = 60;
export const BUTTON_HEIGHT_SECONDARY = 48;
export const BUTTON_ICON = 24;
export const BUTTON_GAP = 10;
export const ROUND_BUTTON = 60;
