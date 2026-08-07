// Pure calculation helpers for risk/pricing display. These compute values;
// they know nothing about Tailwind classes or JSX — components/ui/tone.ts
// is what turns a Tone into a class name.
import type { FreightQuote } from '../types';

export type Tone = 'good' | 'warn' | 'high' | 'critical';

export function factorTone(value: number): Tone {
  if (value >= 85) return 'good';
  if (value >= 70) return 'warn';
  if (value >= 50) return 'high';
  return 'critical';
}

export function freightDeviationPct(baseCost: number, currentCost: number): number {
  return Math.round((currentCost / baseCost - 1) * 100);
}

export function cheapestQuote(quotes: FreightQuote[]): FreightQuote {
  return [...quotes].sort((a, b) => a.currentCost - b.currentCost)[0];
}
