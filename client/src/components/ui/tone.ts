// The one place a semantic Tone maps to a Tailwind class. Every component
// that needs a risk color imports from here instead of hand-rolling its own map.
export type Tone = 'good' | 'warn' | 'high' | 'critical' | 'info' | 'brand';

export const TONE_TEXT: Record<Tone, string> = {
  good: 'text-good', warn: 'text-warn', high: 'text-high', critical: 'text-critical', info: 'text-info', brand: 'text-brand',
};

export const TONE_BORDER: Record<Tone, string> = {
  good: 'border-good/40', warn: 'border-warn/40', high: 'border-high/40', critical: 'border-critical/40', info: 'border-info/40', brand: 'border-brand/40',
};

export const TONE_BG: Record<Tone, string> = {
  good: 'bg-good', warn: 'bg-warn', high: 'bg-high', critical: 'bg-critical', info: 'bg-info', brand: 'bg-brand',
};
