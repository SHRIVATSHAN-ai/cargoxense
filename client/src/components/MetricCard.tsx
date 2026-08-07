import type { Icon } from '@phosphor-icons/react';
import { TONE_TEXT, type Tone } from './ui/tone';
import { Eyebrow } from './ui/Eyebrow';

export function MetricCard({ label, value, tone, icon: IconComponent }: { label: string; value: string | number; tone?: Tone; icon?: Icon }) {
  return (
    <div className="border-t border-border pt-3">
      <div className="flex items-center gap-1.5">
        {IconComponent && <IconComponent size={13} weight="regular" className={tone ? TONE_TEXT[tone] : 'text-muted'} />}
        <Eyebrow>{label}</Eyebrow>
      </div>
      <div className={`font-display mt-1 text-3xl font-medium tabular-nums ${tone ? TONE_TEXT[tone] : 'text-text'}`}>{value}</div>
    </div>
  );
}
