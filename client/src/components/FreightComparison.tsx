import { TrendDown, TrendUp, Truck } from '@phosphor-icons/react';
import type { FreightQuote } from '../types';
import { formatINR } from '../lib/format';
import { cheapestQuote, freightDeviationPct } from '../lib/risk';
import { Panel } from './ui/Panel';
import { Eyebrow } from './ui/Eyebrow';
import { Callout } from './ui/Callout';

export function FreightComparison({ quotes }: { quotes: FreightQuote[] }) {
  const cheapest = cheapestQuote(quotes);

  return (
    <Panel>
      <Eyebrow>Freight Quote Comparison</Eyebrow>

      <div className="mt-3 space-y-2.5">
        {quotes.map((q) => {
          const deviation = freightDeviationPct(q.baseCost, q.currentCost);
          return (
            <div key={q.carrier + q.route} className={`rounded-sm border p-3 ${q.priceAnomaly ? 'border-critical/50 bg-critical/5' : 'border-border-soft'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-medium text-text"><Truck size={14} weight="regular" className="text-muted" />{q.carrier}</div>
                <div className="font-display text-lg font-medium tabular-nums">{formatINR(q.currentCost)}</div>
              </div>
              <div className="mt-0.5 flex items-center justify-between font-mono-ui text-[11px] text-muted">
                <span>{q.route} · {q.transitDays}d · risk {q.riskLevel}</span>
                {deviation !== 0 && (
                  <span className={`flex items-center gap-1 ${deviation > 20 ? 'font-semibold text-critical' : 'text-muted'}`}>
                    {deviation > 0 ? <TrendUp size={12} weight="regular" /> : <TrendDown size={12} weight="regular" />}
                    {deviation > 0 ? '+' : ''}{deviation}% vs baseline
                  </span>
                )}
              </div>
              <div className="mt-0.5 font-mono-ui text-[10px] text-muted-2">Reference band: {formatINR(q.expectedBand.min)}–{formatINR(q.expectedBand.max)}</div>
              {q.priceAnomaly && (
                <div className="mt-2">
                  <Callout tone="critical" label="Alert">Current cost falls outside the expected reference band — limited alternatives, requires review.</Callout>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {quotes.length > 1 && (
        <div className="mt-3">
          <Callout tone="brand" label="Recommendation">
            {cheapest.carrier}, lowest total cost among available options{cheapest.priceAnomaly ? '' : ' with acceptable risk.'}
          </Callout>
        </div>
      )}
    </Panel>
  );
}
