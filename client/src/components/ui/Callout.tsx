import type { ReactNode } from 'react';
import { TONE_BORDER, TONE_TEXT, type Tone } from './tone';

// A left-rule inline note — used for the handful of "this needs your
// attention" moments (store-and-forward notice, price alert, customs gap,
// recommendation blurb). One definition instead of six copies of the same
// border-left/padding combination.
export function Callout({ children, tone, label }: { children: ReactNode; tone: Tone; label?: string }) {
  return (
    <div className={`rounded-r-sm border-l-2 bg-panel-2 py-2 pl-3 text-sm ${TONE_BORDER[tone]}`}>
      {label && <span className={`font-mono-ui text-xs uppercase tracking-[0.06em] ${TONE_TEXT[tone]}`}>{label} — </span>}
      {children}
    </div>
  );
}
