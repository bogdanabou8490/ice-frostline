import { ALL_PAGES, PAGE_CLUES, TOTAL_PAGES, mergeCatch, pageKey, unlockedCount } from '../src/game/journal';

describe('catch journal', () => {
  it('has one page per species and tier, each with a clue', () => {
    expect(TOTAL_PAGES).toBe(12);
    expect(new Set(ALL_PAGES.map(p => p.key)).size).toBe(12);
    for (const page of ALL_PAGES) {
      expect(typeof PAGE_CLUES[page.key]).toBe('string');
      expect(PAGE_CLUES[page.key].length).toBeGreaterThan(3);
    }
  });

  it('writes a page once and reports it as new', () => {
    const first = mergeCatch({}, 'PERCH', 'PRIME', 1.4, 'JIG', '2026-11-10');
    expect(first.isNew).toBe(true);
    expect(unlockedCount(first.journal)).toBe(1);
    expect(first.journal[pageKey('PERCH', 'PRIME')].bestKg).toBe(1.4);

    const again = mergeCatch(first.journal, 'PERCH', 'PRIME', 1.1, 'JIG', '2026-11-11');
    expect(again.isNew).toBe(false);
    expect(again.journal[pageKey('PERCH', 'PRIME')].bestKg).toBe(1.4);
  });

  it('keeps only the heaviest fish of a page', () => {
    const one = mergeCatch({}, 'PIKE', 'TROPHY', 3.1, 'SPOON', '2026-11-10');
    const two = mergeCatch(one.journal, 'PIKE', 'TROPHY', 4.4, 'MINNOW', '2026-11-12');
    expect(two.isNew).toBe(false);
    const entry = two.journal[pageKey('PIKE', 'TROPHY')];
    expect(entry.bestKg).toBe(4.4);
    expect(entry.bait).toBe('MINNOW');
    expect(entry.date).toBe('2026-11-12');
  });

  it('starts empty so the collection can show its themed empty state', () => {
    expect(unlockedCount({})).toBe(0);
  });
});
