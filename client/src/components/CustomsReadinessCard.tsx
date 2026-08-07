import { CheckCircle } from '@phosphor-icons/react';
import type { CustomsReadiness } from '../types';
import { Panel } from './ui/Panel';
import { Eyebrow } from './ui/Eyebrow';
import { Callout } from './ui/Callout';

export function CustomsReadinessCard({ readiness }: { readiness: CustomsReadiness }) {
  const ok = readiness.missing.length === 0;
  return (
    <Panel>
      <Eyebrow>Customs Readiness</Eyebrow>
      <div className="font-display mt-1 text-2xl font-medium tabular-nums">
        {readiness.available.length} / {readiness.required.length}
        <span className="font-sans ml-2 text-sm font-normal text-muted">documents available</span>
      </div>

      {ok ? (
        <div className="mt-2 flex items-center gap-1.5 font-mono-ui text-xs uppercase tracking-[0.06em] text-good">
          <CheckCircle size={13} weight="regular" />
          All required documents available
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <Callout tone="warn" label="Missing">{readiness.missing.join(', ')}</Callout>
          <p className="text-xs text-muted">Recommended action: obtain required documentation before arrival to avoid clearance delay.</p>
        </div>
      )}

      <ul className="mt-4 space-y-1.5 font-mono-ui text-[11px]">
        {readiness.required.map((doc) => (
          <li key={doc} className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${readiness.available.includes(doc) ? 'bg-good' : 'bg-critical'}`} />
            <span className={readiness.available.includes(doc) ? 'text-muted' : 'text-text'}>{doc}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
