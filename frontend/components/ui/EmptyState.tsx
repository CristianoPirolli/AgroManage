import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon, type IconName } from '@/components/ui/Icon';

type EmptyStateProps = {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary-soft text-link">
        <Icon name={icon} className="size-6" />
      </span>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function NeedsPropertyState({ description }: { description: string }) {
  return (
    <EmptyState
      icon="property"
      title="Cadastre uma propriedade primeiro"
      description={description}
      action={
        <Link href="/propriedades" className="btn btn-primary">
          Ir para propriedades
        </Link>
      }
    />
  );
}
