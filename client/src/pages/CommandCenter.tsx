import { useMemo, useState } from 'react';
import { ClockCountdown, CurrencyInr, Package, SealWarning, Siren, TrendUp, Warning, WifiSlash } from '@phosphor-icons/react';
import { useShipmentsStore, computeMetrics } from '../store/useShipments';
import { formatINR } from '../lib/format';
import { MetricCard } from '../components/MetricCard';
import { ShipmentCard } from '../components/ShipmentCard';
import { PageHeader } from '../components/ui/PageHeader';

const FILTERS = ['ALL', 'AT_RISK', 'ALERTS'] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABEL: Record<Filter, string> = { ALL: 'All', AT_RISK: 'At Risk', ALERTS: 'Needs Attention' };

export function CommandCenter() {
  const shipmentsMap = useShipmentsStore((s) => s.shipments);
  const shipments = useMemo(() => Object.values(shipmentsMap).sort((a, b) => a.id.localeCompare(b.id)), [shipmentsMap]);
  const metrics = useMemo(() => computeMetrics(shipments), [shipments]);
  const [filter, setFilter] = useState<Filter>('ALL');

  const visible = shipments.filter((s) => {
    if (filter === 'AT_RISK') return s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL';
    if (filter === 'ALERTS') return s.customsReadiness.missing.length > 0 || s.commsStatus !== 'ONLINE' || s.incident?.status === 'OPEN';
    return true;
  });

  if (shipments.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-10 font-mono-ui text-sm text-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted" />
        Connecting to CargoXense server…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6">
      <PageHeader
        size="lg"
        eyebrow="Sense · Predict · Compare · Protect · Recover · Prove"
        title="Cargo can be moving and still be lost. Know which."
        description="Six live shipments, one intelligence layer. Every score below is explainable — trace it to the factor that moved."
      />

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-10 sm:grid-cols-4 lg:grid-cols-8">
        <MetricCard icon={Package} label="Active Shipments" value={metrics.activeShipments} />
        <MetricCard icon={Warning} label="At-Risk Cargo" value={metrics.atRiskCargo} tone={metrics.atRiskCargo > 0 ? 'high' : undefined} />
        <MetricCard icon={Siren} label="Critical Incidents" value={metrics.criticalIncidents} tone={metrics.criticalIncidents > 0 ? 'critical' : undefined} />
        <MetricCard icon={SealWarning} label="Customs Alerts" value={metrics.customsAlerts} tone={metrics.customsAlerts > 0 ? 'warn' : undefined} />
        <MetricCard icon={WifiSlash} label="Offline Trackers" value={metrics.offlineTrackers} tone={metrics.offlineTrackers > 0 ? 'warn' : undefined} />
        <MetricCard icon={TrendUp} label="Price Anomalies" value={metrics.priceAnomalies} tone={metrics.priceAnomalies > 0 ? 'high' : undefined} />
        <MetricCard icon={ClockCountdown} label="Claims In Review" value={metrics.claimsInReview} />
        <MetricCard icon={CurrencyInr} label="Loss Avoided" value={formatINR(metrics.recoverableValue)} tone="good" />
      </div>

      <div className="mb-8 flex items-center justify-between border-t border-border pt-8">
        <h2 className="font-display text-xl font-medium">Shipments</h2>
        <div className="flex gap-5 font-mono-ui text-xs uppercase tracking-[0.08em]">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`border-b pb-1 transition ${filter === f ? 'border-brand text-text' : 'border-transparent text-muted hover:text-text'}`}
            >
              {FILTER_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((s) => <ShipmentCard key={s.id} shipment={s} />)}
      </div>
    </div>
  );
}
