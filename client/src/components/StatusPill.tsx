import { CheckCircle, WarningCircle, WarningOctagon, WifiHigh, WifiSlash, type Icon } from '@phosphor-icons/react';
import { Tag } from './ui/Tag';
import type { Tone } from './ui/tone';

const LABEL_TONE: Record<string, Tone> = {
  LOW: 'good', MODERATE: 'warn', HIGH: 'high', CRITICAL: 'critical',
  ONLINE: 'good', DEGRADED: 'warn', OFFLINE: 'critical',
};

const LABEL_ICON: Record<string, Icon> = {
  LOW: CheckCircle, MODERATE: WarningCircle, HIGH: WarningCircle, CRITICAL: WarningOctagon,
  ONLINE: WifiHigh, DEGRADED: WarningCircle, OFFLINE: WifiSlash,
};

export function StatusPill({ label }: { label: string }) {
  const StatusIcon = LABEL_ICON[label];
  return (
    <Tag tone={LABEL_TONE[label] ?? 'info'}>
      {StatusIcon && <StatusIcon size={11} weight="regular" />}
      {label}
    </Tag>
  );
}
