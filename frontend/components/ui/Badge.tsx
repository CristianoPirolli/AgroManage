import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'green' | 'amber' | 'red' | 'dark';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-2 text-muted ring-1 ring-inset ring-line',
  green: 'bg-primary-soft text-link',
  amber: 'bg-warn-soft text-warn',
  red: 'bg-danger-soft text-danger',
  dark: 'bg-ink text-canvas',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>
      {children}
    </span>
  );
}
