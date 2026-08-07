import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowCounterClockwise, Siren } from '@phosphor-icons/react';
import { useShipmentsStore } from '../store/useShipments';
import { api } from '../lib/api';
import { formatINR } from '../lib/format';
import { StatusPill } from '../components/StatusPill';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { SensorChart } from '../components/SensorChart';
import { CustomsReadinessCard } from '../components/CustomsReadinessCard';
import { FreightComparison } from '../components/FreightComparison';
import { Timeline } from '../components/Timeline';
import { AIRecommendationCard } from '../components/AIRecommendationCard';
import { Panel } from '../components/ui/Panel';
import { Eyebrow } from '../components/ui/Eyebrow';
import { Callout } from '../components/ui/Callout';

const STAGE_NAMES = ['Normal Transit', 'Geopolitical Disruption', 'Port Congestion', 'Communication Loss', 'Temperature Excursion', 'Recovered'];

export function ShipmentDetail() {
  const { id } = useParams<{ id: string }>();
  const shipment = useShipmentsStore((s) => (id ? s.shipments[id] : undefined));
  const [busy, setBusy] = useState(false);

  if (!shipment) {
    return (
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-10 font-mono-ui text-sm text-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" />
        Loading shipment…
      </div>
    );
  }

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link to="/" className="font-mono-ui text-xs uppercase tracking-[0.06em] text-muted hover:text-text">← Command Center</Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-ui text-xs tracking-[0.06em] text-muted">{shipment.id}</span>
            {shipment.isHero && <span className="font-mono-ui rounded-full border border-brand/40 px-2 py-0.5 text-[9px] tracking-[0.1em] text-brand">DEMO SHIPMENT</span>}
          </div>
          <h1 className="font-display text-3xl font-medium">{shipment.name}</h1>
          <p className="mt-1 text-sm text-muted">{shipment.description}</p>
          <p className="mt-2 font-mono-ui text-xs text-muted-2">{shipment.origin} → {shipment.destination} · {shipment.carrier} · {shipment.transportMode}</p>
        </div>
        <div className="flex gap-2">
          <StatusPill label={shipment.riskLevel} />
          <StatusPill label={shipment.commsStatus} />
        </div>
      </div>

      {/* Crisis simulation controls — the live hackathon demo driver */}
      <div className="mt-8">
        <Panel className="bg-panel-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Eyebrow>Simulation Control</Eyebrow>
              <div className="font-display mt-1 text-lg font-medium">{STAGE_NAMES[shipment.crisisStage]}</div>
            </div>
            <div className="flex gap-2">
              {shipment.crisisStage < 4 && (
                <button
                  disabled={busy}
                  onClick={() => run(() => api.advanceCrisis(shipment.id))}
                  className="flex items-center gap-1.5 rounded-sm bg-high px-3 py-2 font-mono-ui text-xs font-medium uppercase tracking-[0.06em] text-bg transition hover:opacity-90 disabled:opacity-50"
                >
                  <Siren size={14} weight="regular" />
                  Trigger Next Disruption →
                </button>
              )}
              <button
                disabled={busy}
                onClick={() => run(() => api.resetCrisis(shipment.id))}
                className="flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 font-mono-ui text-xs uppercase tracking-[0.06em] text-muted transition hover:text-text disabled:opacity-50"
              >
                <ArrowCounterClockwise size={14} weight="regular" />
                Reset Simulation
              </button>
            </div>
          </div>
          {shipment.storeAndForward?.buffering && (
            <div className="mt-4">
              <Callout tone="warn">
                Store-and-forward active — buffering sensor data locally, last confirmed {new Date(shipment.storeAndForward.lastConfirmed).toLocaleTimeString()}. Nothing is being lost.
              </Callout>
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ScoreBreakdown score={shipment.survivalScore} factors={shipment.factors} />

        <Panel className="lg:col-span-2">
          <Eyebrow>Live Sensor Reading — Temperature</Eyebrow>
          <SensorChart readings={shipment.sensorReadings} tempRange={shipment.tempRange} />
          <div className="font-mono-ui text-[11px] text-muted">Expected range: {shipment.tempRange.min}–{shipment.tempRange.max}°C · Cargo value: {formatINR(shipment.cargoValueINR)}</div>
        </Panel>
      </div>

      {shipment.aiRecommendation && (
        <div className="mt-5">
          <AIRecommendationCard
            rec={shipment.aiRecommendation}
            approved={shipment.crisisStage >= 5}
            onApprove={() => run(() => api.approveRecovery(shipment.id))}
          />
        </div>
      )}

      {shipment.economicImpact && (
        <div className="mt-5">
          <Panel tone="good">
            <Eyebrow tone="good">Economic Impact — {shipment.economicImpact.note}</Eyebrow>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <div className="font-mono-ui text-[10px] uppercase tracking-[0.06em] text-muted">Potential loss without intervention</div>
                <div className="font-display text-2xl font-medium tabular-nums text-high">{formatINR(shipment.economicImpact.potentialLossWithoutIntervention)}</div>
              </div>
              <div>
                <div className="font-mono-ui text-[10px] uppercase tracking-[0.06em] text-muted">Recovery intervention cost</div>
                <div className="font-display text-2xl font-medium tabular-nums text-text">{formatINR(shipment.economicImpact.interventionCost)}</div>
              </div>
              <div>
                <div className="font-mono-ui text-[10px] uppercase tracking-[0.06em] text-muted">Estimated loss avoided</div>
                <div className="font-display text-2xl font-medium tabular-nums text-good">{formatINR(shipment.economicImpact.estimatedLossAvoided)}</div>
              </div>
            </div>
          </Panel>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CustomsReadinessCard readiness={shipment.customsReadiness} />
        <FreightComparison quotes={shipment.freightQuotes} />
      </div>

      <div className="mb-20 mt-5">
        <Timeline events={shipment.events} />
      </div>
    </div>
  );
}
