import { Link } from 'react-router-dom';
import { FileText, Siren } from '@phosphor-icons/react';
import type { Shipment } from '../types';
import { formatINR } from '../lib/format';
import { StatusPill } from './StatusPill';
import { Tag } from './ui/Tag';

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  return (
    <Link
      to={`/shipment/${shipment.id}`}
      className="group block rounded-md border border-border bg-panel p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-ui text-[11px] tracking-[0.08em] text-muted">{shipment.id}</span>
            {shipment.isHero && <Tag tone="brand">DEMO</Tag>}
          </div>
          <div className="font-display mt-1 text-lg font-medium text-text">{shipment.name}</div>
          <div className="font-mono-ui text-[11px] uppercase tracking-[0.06em] text-muted-2">{shipment.cargoType}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-medium tabular-nums text-text">{shipment.survivalScore}</div>
          <div className="font-mono-ui text-[9px] uppercase tracking-[0.1em] text-muted">score</div>
        </div>
      </div>

      <div className="mt-3 font-mono-ui text-[11px] text-muted-2">
        {shipment.origin} → {shipment.destination}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <StatusPill label={shipment.riskLevel} />
        <StatusPill label={shipment.commsStatus} />
        {shipment.customsReadiness.missing.length > 0 && (
          <Tag tone="warn"><FileText size={11} weight="regular" />{shipment.customsReadiness.missing.length} doc missing</Tag>
        )}
        {shipment.incident?.status === 'OPEN' && <Tag tone="critical"><Siren size={11} weight="regular" />incident open</Tag>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border-soft pt-3 font-mono-ui text-[11px] text-muted">
        <span>{shipment.carrier}</span>
        <span className="tabular-nums text-text">{formatINR(shipment.cargoValueINR)}</span>
      </div>
    </Link>
  );
}
