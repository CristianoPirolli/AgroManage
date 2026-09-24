import { Icon } from '@/components/ui/Icon';

export function ErrorAlert({ message }: { message: string }) {
  return (
    <p role="alert" className="mb-4 flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
      <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
      {message}
    </p>
  );
}

export function Spinner({ className = 'size-6' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={`inline-block animate-spin rounded-full border-2 border-line border-t-primary ${className}`}
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center bg-canvas">
      <Spinner className="size-8" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="panel divide-y divide-line" aria-busy="true" aria-label="Carregando dados">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-4">
          <div className="h-3.5 w-1/4 rounded bg-line motion-safe:animate-pulse" />
          <div className="h-3.5 w-1/5 rounded bg-line motion-safe:animate-pulse" />
          <div className="ml-auto h-3.5 w-16 rounded bg-line motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  );
}
