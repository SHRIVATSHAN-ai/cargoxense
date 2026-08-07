import type { ReactNode } from 'react';
import { TONE_TEXT, type Tone } from './tone';

export function Eyebrow({ children, tone }: { children: ReactNode; tone?: Tone }) {
  return (
    <div className={`font-mono-ui text-[10px] uppercase tracking-[0.1em] ${tone ? TONE_TEXT[tone] : 'text-muted'}`}>
      {children}
    </div>
  );
}
