import { useMemo, useState } from 'react';
import { DownloadSimple, FileText, ShieldCheck, ShieldWarning } from '@phosphor-icons/react';
import { useShipmentsStore } from '../store/useShipments';
import { formatINR, formatDateTime } from '../lib/format';
import { downloadJson } from '../lib/download';
import { StatusPill } from '../components/StatusPill';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Eyebrow } from '../components/ui/Eyebrow';
import { Callout } from '../components/ui/Callout';

export function EvidenceVault() {
  const shipmentsMap = useShipmentsStore((s) => s.shipments);
  const withIncidents = useMemo(
    () => Object.values(shipmentsMap).filter((s) => s.incident),
    [shipmentsMap],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? shipmentsMap[selectedId] : withIncidents[0];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        eyebrow="Prove"
        title="Insurance Evidence Vault"
        description="Every incident automatically preserves a chronological, tamper-aware evidence chain — GPS, sensor, communication and custody records — so claims aren't fought with fragmented paperwork."
      />

      {withIncidents.length === 0 ? (
        <Panel className="mt-8 font-mono-ui text-sm text-muted">
          No incidents recorded yet. Open the demo shipment <span className="text-text">CX-1001</span> from the Command Center and trigger the crisis simulation to see the evidence vault populate.
        </Panel>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            {withIncidents.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full rounded-md border p-4 text-left shadow-card transition ${
                  selected?.id === s.id ? 'border-brand/50 bg-panel-2' : 'border-border bg-panel hover:bg-panel-2'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-ui text-xs text-muted">{s.id}</span>
                  <StatusPill label={s.incident!.status} />
                </div>
                <div className="mt-1 font-display text-base font-medium">{s.incident!.type}</div>
                <div className="font-mono-ui text-[11px] text-muted-2">{s.name}</div>
              </button>
            ))}
          </div>

          {selected && selected.incident && (
            <div className="space-y-5 lg:col-span-2">
              <Panel>
                <div className="flex items-center justify-between">
                  <Eyebrow>Incident Summary</Eyebrow>
                  <span className="rounded-full border border-brand/40 px-2.5 py-0.5 font-mono-ui text-[10px] uppercase tracking-[0.06em] text-brand">
                    {selected.claimStatus ?? 'NO CLAIM'}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-y-3 font-mono-ui text-sm sm:grid-cols-3">
                  <div><dt className="text-[10px] uppercase tracking-[0.04em] text-muted">Shipment</dt><dd className="text-text">{selected.id}</dd></div>
                  <div><dt className="text-[10px] uppercase tracking-[0.04em] text-muted">Incident</dt><dd className="text-text">{selected.incident.type}</dd></div>
                  <div><dt className="text-[10px] uppercase tracking-[0.04em] text-muted">Start</dt><dd className="text-text">{new Date(selected.incident.start).toLocaleTimeString()}</dd></div>
                  <div><dt className="text-[10px] uppercase tracking-[0.04em] text-muted">Duration</dt><dd className="text-text">{selected.incident.durationMinutes} min</dd></div>
                  <div><dt className="text-[10px] uppercase tracking-[0.04em] text-muted">Maximum</dt><dd className="text-text">{selected.incident.maxTemp}°C</dd></div>
                  <div><dt className="text-[10px] uppercase tracking-[0.04em] text-muted">Expected</dt><dd className="text-text">{selected.incident.expectedRange}</dd></div>
                </dl>
                {selected.incident.recoveryAction && (
                  <div className="mt-4">
                    <Callout tone="good" label="Recovery action">{selected.incident.recoveryAction}</Callout>
                  </div>
                )}
                {selected.economicImpact && (
                  <div className="mt-3 font-mono-ui text-sm">
                    <span className="text-muted">Estimated loss avoided: </span>
                    <span className="font-medium tabular-nums text-good">{formatINR(selected.economicImpact.estimatedLossAvoided)}</span>
                  </div>
                )}
                <button
                  onClick={() => downloadJson(`${selected.id}-incident-report.json`, {
                    shipment: selected.id, incident: selected.incident, evidence: selected.insuranceEvidence,
                    evidenceChainValid: selected.evidenceChainValid,
                    events: selected.events, economicImpact: selected.economicImpact ?? null, claimStatus: selected.claimStatus ?? 'NO CLAIM',
                  })}
                  className="mt-5 flex items-center gap-1.5 rounded-sm border border-border px-3 py-2 font-mono-ui text-xs uppercase tracking-[0.06em] transition hover:border-brand/50 hover:text-brand"
                >
                  <DownloadSimple size={14} weight="regular" />
                  Download Incident Report (JSON)
                </button>
              </Panel>

              <Panel>
                <div className="flex items-center justify-between">
                  <Eyebrow>Evidence Chain</Eyebrow>
                  {selected.insuranceEvidence.length > 0 && (
                    selected.evidenceChainValid ? (
                      <span className="flex items-center gap-1.5 font-mono-ui text-[10px] uppercase tracking-[0.06em] text-good">
                        <ShieldCheck size={13} weight="regular" />
                        Chain verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-mono-ui text-[10px] uppercase tracking-[0.06em] text-critical">
                        <ShieldWarning size={13} weight="regular" />
                        Chain broken
                      </span>
                    )
                  )}
                </div>
                <p className="mt-2 text-xs text-muted">Each entry's hash covers its own content plus the previous entry's hash — editing any past entry would break every hash after it.</p>
                <ol className="mt-4 space-y-3">
                  {selected.insuranceEvidence.map((e, i) => (
                    <li key={i} className="flex items-start gap-3 border-b border-border-soft pb-3 last:border-0 last:pb-0">
                      <span className="mt-0.5 flex items-center gap-1 rounded-sm border border-border px-1.5 py-0.5 font-mono-ui text-[9px] font-medium uppercase tracking-[0.04em] text-muted">
                        <FileText size={10} weight="regular" />
                        {e.type}
                      </span>
                      <div>
                        <div className="text-sm text-text">{e.description}</div>
                        <div className="font-mono-ui text-[10px] text-muted-2">{formatDateTime(e.timestamp)}</div>
                        <div className="mt-0.5 font-mono-ui text-[9px] text-muted-2" title={`hash ${e.hash}\nprev ${e.prevHash}`}>#{e.hash.slice(0, 10)}</div>
                      </div>
                    </li>
                  ))}
                  {selected.insuranceEvidence.length === 0 && <div className="text-sm text-muted">No evidence captured yet.</div>}
                </ol>
              </Panel>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
