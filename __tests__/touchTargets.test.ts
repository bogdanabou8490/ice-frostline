import {
  BUTTON_GAP,
  BUTTON_HEIGHT_PRIMARY,
  BUTTON_HEIGHT_SECONDARY,
  BUTTON_ICON,
  HEADER_BUTTON,
  HEADER_HIT_SLOP,
  ROUND_BUTTON,
  TOUCH_MIN,
} from '../src/constants/config';

/**
 * Pure-logic guard over the geometry every control in src/components reads.
 * No renderer and no native module, so it runs in plain jest.
 */
describe('touch targets and button geometry', () => {
  it('keeps every button at or above the 48 px touch floor', () => {
    expect(BUTTON_HEIGHT_PRIMARY).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(BUTTON_HEIGHT_SECONDARY).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(ROUND_BUTTON).toBeGreaterThanOrEqual(TOUCH_MIN);
  });

  it('lifts the smaller header button over the floor with hit slop', () => {
    expect(HEADER_BUTTON + 2 * HEADER_HIT_SLOP).toBeGreaterThanOrEqual(TOUCH_MIN);
    expect(HEADER_HIT_SLOP).toBeGreaterThanOrEqual(8);
  });

  it('uses one icon size and one gap for every button in the app', () => {
    // buttons.tsx derives BTN_ICON / BTN_GAP and the label lineHeight from these
    expect([24, 28]).toContain(BUTTON_ICON);
    expect(BUTTON_GAP).toBe(10);
  });

  it('gives the primary action more weight than the secondary one', () => {
    expect(BUTTON_HEIGHT_PRIMARY).toBeGreaterThan(BUTTON_HEIGHT_SECONDARY);
  });
});
