import { BAITS, CONFIDENCE_PAGES, isBaitUnlocked, unlockedBaits } from '../src/game/bait';
import { TOTAL_PAGES } from '../src/game/journal';

describe('journal driven bait unlocks', () => {
  it('starts with two baits and opens the rest with journal pages', () => {
    expect(unlockedBaits(0)).toEqual(['JIG', 'MINNOW']);
    expect(unlockedBaits(3)).toContain('SPOON');
    expect(unlockedBaits(6)).toContain('GRUB');
    expect(unlockedBaits(TOTAL_PAGES)).toHaveLength(BAITS.length);
  });

  it('keeps a locked bait locked until its page count is reached', () => {
    expect(isBaitUnlocked('SPOON', 2)).toBe(false);
    expect(isBaitUnlocked('SPOON', 3)).toBe(true);
    expect(isBaitUnlocked('GRUB', 5)).toBe(false);
    expect(isBaitUnlocked('GRUB', 6)).toBe(true);
  });

  it('turns the confidence dots on later than the last bait', () => {
    const lastUnlock = BAITS.reduce((m, b) => Math.max(m, b.unlockPages), 0);
    expect(CONFIDENCE_PAGES).toBeGreaterThan(lastUnlock);
    expect(CONFIDENCE_PAGES).toBeLessThanOrEqual(TOTAL_PAGES);
  });

  it('covers a different weather region with every bait', () => {
    for (let i = 0; i < BAITS.length; i++) {
      for (let j = i + 1; j < BAITS.length; j++) {
        const a = BAITS[i].profile;
        const b = BAITS[j].profile;
        const distance = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
        expect(distance).toBeGreaterThan(0.25);
      }
    }
  });
});
