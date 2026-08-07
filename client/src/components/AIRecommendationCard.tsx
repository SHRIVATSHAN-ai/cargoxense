import { CheckCircle, Sparkle } from '@phosphor-icons/react';
import type { AIRecommendation } from '../types';
import { Panel } from './ui/Panel';
import { Eyebrow } from './ui/Eyebrow';

export function AIRecommendationCard({ rec, onApprove, approved }: { rec: AIRecommendation; onApprove: () => void; approved: boolean }) {
  return (
    <Panel tone="brand">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkle size={13} weight="regular" className="text-brand" />
          <Eyebrow tone="brand">AI-Assisted Recommendation</Eyebrow>
        </div>
        <div className="font-mono-ui text-[10px] uppercase tracking-[0.06em] text-muted">Confidence {rec.confidence}%</div>
      </div>

      <div className="font-display mt-2 text-xl font-medium text-text">{rec.recommendation}</div>

      <div className="mt-4 font-mono-ui text-[10px] uppercase tracking-[0.08em] text-muted">Why</div>
      <ul className="mt-1.5 space-y-1.5 text-sm text-muted">
        {rec.why.map((w, i) => <li key={i} className="border-l border-border-soft pl-3">{w}</li>)}
      </ul>

      <div className="mt-3 text-sm text-text">
        <span className="font-mono-ui text-[10px] uppercase tracking-[0.06em] text-muted">Expected impact — </span>{rec.expectedImpact}
      </div>

      <div className="mt-2 font-mono-ui text-[10px] uppercase tracking-[0.04em] text-muted-2">
        Alternatives considered: {rec.alternatives.join(' · ')}
      </div>

      <div className="mt-5 flex items-center gap-4">
        {approved ? (
          <span className="flex items-center gap-1.5 rounded-sm border border-good/50 px-3 py-1.5 font-mono-ui text-xs uppercase tracking-[0.06em] text-good">
            <CheckCircle size={14} weight="regular" />
            Approved by operator — action executed
          </span>
        ) : (
          <button
            onClick={onApprove}
            className="rounded-sm bg-brand px-4 py-2 font-mono-ui text-xs font-medium uppercase tracking-[0.06em] text-bg transition hover:bg-brand-dim"
          >
            Approve Recommended Action
          </button>
        )}
        <span className="text-xs text-muted">Human approval required — CargoXense does not act autonomously.</span>
      </div>
    </Panel>
  );
}
