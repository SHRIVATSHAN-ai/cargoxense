import { Clock, FileText, MapPin, Radio, Thermometer, type Icon } from '@phosphor-icons/react';
import type { SurvivalFactors } from '../types';
import { factorTone } from '../lib/risk';
import { TONE_BG } from './ui/tone';
import { Panel } from './ui/Panel';
import { Eyebrow } from './ui/Eyebrow';

const LABELS: Record<keyof SurvivalFactors, string> = {
  environment: 'Environment',
  delay: 'Delay Risk',
  route: 'Route Risk',
  customs: 'Customs',
  communication: 'Communication',
};

const ICONS: Record<keyof SurvivalFactors, Icon> = {
  environment: Thermometer,
  delay: Clock,
  route: MapPin,
  customs: FileText,
  communication: Radio,
};

export function ScoreBreakdown({ score, factors }: { score: number; factors: SurvivalFactors }) {
  return (
    <Panel>
      <Eyebrow>Cargo Survival Score</Eyebrow>
      <div className="font-display mt-1 text-5xl font-medium tabular-nums">{score}<span className="text-lg text-muted"> / 100</span></div>

      <div className="mt-5 space-y-3">
        {(Object.keys(LABELS) as (keyof SurvivalFactors)[]).map((key) => {
          const FactorIcon = ICONS[key];
          return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between font-mono-ui text-[11px] uppercase tracking-[0.04em]">
              <span className="flex items-center gap-1.5 text-muted"><FactorIcon size={13} weight="regular" />{LABELS[key]}</span>
              <span className="tabular-nums text-text">{factors[key]}</span>
            </div>
            <div
              className="h-1.5 w-full rounded-full bg-panel-2"
              role="progressbar"
              aria-label={LABELS[key]}
              aria-valuenow={factors[key]}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={`h-1.5 rounded-full ${TONE_BG[factorTone(factors[key])]}`} style={{ width: `${factors[key]}%` }} />
            </div>
          </div>
          );
        })}
      </div>
    </Panel>
  );
}
