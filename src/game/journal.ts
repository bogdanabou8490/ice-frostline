import { SPECIES, SPECIES_ORDER, TIER_ORDER, type SpeciesId, type Tier } from './species';
import type { BaitId } from './bait';

export type PageKey = string; // `${SpeciesId}:${Tier}`

export type JournalEntry = {
  key: PageKey;
  species: SpeciesId;
  tier: Tier;
  bestKg: number;
  date: string;
  bait: BaitId;
};

export type Journal = Record<PageKey, JournalEntry>;

export function pageKey(species: SpeciesId, tier: Tier): PageKey {
  return species + ':' + tier;
}

/** 12 pages = 4 species x 3 size tiers. */
export const ALL_PAGES: { key: PageKey; species: SpeciesId; tier: Tier }[] = SPECIES_ORDER.flatMap(
  species => TIER_ORDER.map(tier => ({ key: pageKey(species, tier), species, tier })),
);

export const TOTAL_PAGES = ALL_PAGES.length;

/** The one-line hint shown on a page that is still locked. */
export const PAGE_CLUES: Record<PageKey, string> = {
  'PERCH:SMALL': 'ANY HOLE, ANY BAIT',
  'PERCH:PRIME': 'SHALLOW REED EDGE',
  'PERCH:TROPHY': 'BRIGHT DAY, LIGHT WIND',
  'BURBOT:SMALL': 'OVERCAST SAND BAR',
  'BURBOT:PRIME': 'GREY SKY, STILL AIR',
  'BURBOT:TROPHY': 'DEEP COLD, GRUB BAIT',
  'PIKE:SMALL': 'DROP OFF, MINNOW BAIT',
  'PIKE:PRIME': 'WINDY DROP OFF',
  'PIKE:TROPHY': 'COLD TRENCH, PERFECT BAIT',
  'CHAR:SMALL': 'DEEP BASIN WATER',
  'CHAR:PRIME': 'CALM NIGHT, DEEP WATER',
  'CHAR:TROPHY': 'DEEP BASIN, PERFECT SPOON',
};

/** Writes a page once; a heavier fish only updates the best weight. */
export function mergeCatch(
  journal: Journal,
  species: SpeciesId,
  tier: Tier,
  weightKg: number,
  bait: BaitId,
  dateIso: string,
): { journal: Journal; isNew: boolean } {
  const key = pageKey(species, tier);
  const existing = journal[key];
  if (!existing) {
    const created: JournalEntry = {
      key,
      species,
      tier,
      bestKg: weightKg,
      date: dateIso,
      bait,
    };
    return { journal: { ...journal, [key]: created }, isNew: true };
  }
  if (weightKg > existing.bestKg) {
    const updated: JournalEntry = { ...existing, bestKg: weightKg, date: dateIso, bait };
    return { journal: { ...journal, [key]: updated }, isNew: false };
  }
  return { journal, isNew: false };
}

export function unlockedCount(journal: Journal): number {
  return Object.keys(journal).length;
}

export function speciesName(id: SpeciesId): string {
  return SPECIES[id].name;
}
