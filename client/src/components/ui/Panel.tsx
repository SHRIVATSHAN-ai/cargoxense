import type { ReactNode } from 'react';
import type { Tone } from './tone';

const TONE_PANEL: Record<Tone, string> = {
  brand: 'border-brand/50 bg-brand-soft',
  good: 'border-good/40 bg-good/5',
  warn: 'border-warn/40 bg-warn/5',
  high: 'border-high/40 bg-high/5',
  critical: 'border-critical/40 bg-critical/5',
  info: 'border-info/40 bg-info/5',
};

export function Panel({ children, tone, className = '' }: { children: ReactNode; tone?: Tone; className?: string }) {
  const toneClass = tone ? TONE_PANEL[tone] : 'border-border bg-panel';
  return <div className={`rounded-md border p-6 shadow-card ${toneClass} ${className}`}>{children}</div>;
}
