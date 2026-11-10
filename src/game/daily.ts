export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + m + day;
}

/** The daily lake is seeded by the calendar date - every device gets the same water. */
export function dailySeed(d: Date): number {
  return Number(dateKey(d)) >>> 0;
}

export function dayIndex(d: Date): number {
  return Math.floor(d.getTime() / 86400000);
}

export type DailyRecord = { key: string; points: number; fish: number };
export type DailyHistory = Record<string, DailyRecord>;

export function canPlayDaily(history: DailyHistory, key: string): boolean {
  return !history[key];
}

/** Each day of the rotation changes one real number of the trip, not just a caption. */
export type DailyModifier = {
  id: string;
  text: string;
  pointsMult: number;
  freezeMult: number;
  bandFactor: number;
  strikesDelta: number;
  minDepth: number;
  driftMult: number;
};

export const DAILY_MODIFIERS: readonly DailyModifier[] = [
  {
    id: 'STEADY',
    text: 'STEADY LINE - A POOR BAIT NO LONGER NARROWS THE BAND',
    pointsMult: 1,
    freezeMult: 1,
    bandFactor: 1.25,
    strikesDelta: 0,
    minDepth: 0,
    driftMult: 1,
  },
  {
    id: 'COLDSNAP',
    text: 'COLD SNAP - THE HOLE FREEZES HALF AGAIN AS FAST',
    pointsMult: 1.2,
    freezeMult: 1.5,
    bandFactor: 1,
    strikesDelta: 0,
    minDepth: 0,
    driftMult: 1,
  },
  {
    id: 'FEEDING',
    text: 'FEEDING HOUR - EVERY CATCH SCORES x1.3',
    pointsMult: 1.3,
    freezeMult: 1,
    bandFactor: 1,
    strikesDelta: 0,
    minDepth: 0,
    driftMult: 1,
  },
  {
    id: 'DEEPDAY',
    text: 'DEEP DAY - ONLY HOLES AT 5 M AND DEEPER ARE OPEN',
    pointsMult: 1.15,
    freezeMult: 1,
    bandFactor: 1,
    strikesDelta: 0,
    minDepth: 5,
    driftMult: 1,
  },
  {
    id: 'THINICE',
    text: 'THIN ICE - ONE STRIKE LESS, REWARD x1.5',
    pointsMult: 1.5,
    freezeMult: 1,
    bandFactor: 1,
    strikesDelta: -1,
    minDepth: 0,
    driftMult: 1,
  },
  {
    id: 'GLASS',
    text: 'GLASS CALM - WIDE BITE BAND, SMALLER REWARD',
    pointsMult: 0.9,
    freezeMult: 1,
    bandFactor: 1.4,
    strikesDelta: 0,
    minDepth: 0,
    driftMult: 1,
  },
  {
    id: 'DRIFT',
    text: 'SNOW DRIFT - THE CLUES SHIFT TWICE AS OFTEN',
    pointsMult: 1.25,
    freezeMult: 1,
    bandFactor: 1,
    strikesDelta: 0,
    minDepth: 0,
    driftMult: 2,
  },
];

export function dailyModifier(d: Date): DailyModifier {
  return DAILY_MODIFIERS[dayIndex(d) % DAILY_MODIFIERS.length];
}

/** Seven cells, oldest first, marking which of the last seven days were fished. */
export function weekStrip(history: DailyHistory, today: Date): { key: string; played: boolean }[] {
  const out: { key: string; played: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86400000);
    const key = dateKey(d);
    out.push({ key, played: Boolean(history[key]) });
  }
  return out;
}

export function formatDateKey(key: string): string {
  if (key.length !== 8) {
    return key;
  }
  return key.slice(6, 8) + '.' + key.slice(4, 6) + '.' + key.slice(0, 4);
}

export const WEEK_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
