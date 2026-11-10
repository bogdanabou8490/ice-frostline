import type { Units } from './storage';

const KG_TO_LB = 2.20462;

/** 1240 -> "1 240" (space grouping, tabular numerals in the styles). */
export function formatPoints(value: number): string {
  const n = Math.round(Math.max(0, value));
  const s = String(n);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const fromEnd = s.length - i;
    out += s[i];
    if (fromEnd > 1 && fromEnd % 3 === 1) {
      out += ' ';
    }
  }
  return out;
}

export function formatWeight(kg: number, units: Units): string {
  if (units === 'LB') {
    return (kg * KG_TO_LB).toFixed(1) + ' LB';
  }
  return kg.toFixed(1) + ' KG';
}

export function formatWeightValue(kg: number, units: Units): string {
  return units === 'LB' ? (kg * KG_TO_LB).toFixed(1) : kg.toFixed(1);
}

export function unitLabel(units: Units): string {
  return units === 'LB' ? 'LB' : 'KG';
}

export function formatPercent(value: number): string {
  return Math.round(value) + ' %';
}

export function formatDepth(m: number): string {
  return m.toFixed(1) + ' M';
}
