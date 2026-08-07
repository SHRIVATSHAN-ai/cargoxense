import type { ReactNode } from 'react';
import { TONE_BORDER, TONE_TEXT, type Tone } from './tone';

export function Tag({ children, tone }: { children: ReactNode; tone?: Tone }) {
  const cls = tone ? `${TONE_BORDER[tone]} ${TONE_TEXT[tone]}` : 'border-border-soft text-muted';
  return (
    <span className={`font-mono-ui inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.08em] ${cls}`}>
      {children}
    </span>
  );
}
