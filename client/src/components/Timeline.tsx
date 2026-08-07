import type { ShipmentEvent } from '../types';
import { formatDateTime } from '../lib/format';
import { TONE_BG, type Tone } from './ui/tone';
import { Panel } from './ui/Panel';
import { Eyebrow } from './ui/Eyebrow';

const SEVERITY_TONE: Record<ShipmentEvent['severity'], Tone> = {
  INFO: 'info', WARNING: 'warn', CRITICAL: 'critical',
};

export function Timeline({ events }: { events: ShipmentEvent[] }) {
  return (
    <Panel>
      <Eyebrow>Shipment Timeline</Eyebrow>
      <ol className="mt-4 space-y-4">
        {events.map((e, i) => (
          <li key={i} className="relative pl-5">
            <span className={`absolute left-0 top-1.5 h-1.5 w-1.5 rotate-45 ${TONE_BG[SEVERITY_TONE[e.severity]] ?? 'bg-muted'}`} />
            {i < events.length - 1 && <span className="absolute left-[2.5px] top-3.5 h-full w-px bg-border" />}
            <div className="text-sm font-medium text-text">{e.title}</div>
            <div className="mt-0.5 text-xs text-muted">{e.description}</div>
            <div className="mt-1 font-mono-ui text-[10px] text-muted-2">{formatDateTime(e.timestamp)}</div>
          </li>
        ))}
        {events.length === 0 && <div className="text-sm text-muted">No events recorded yet.</div>}
      </ol>
    </Panel>
  );
}
