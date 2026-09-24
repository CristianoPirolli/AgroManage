import type { ReactNode } from 'react';

type FieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: ReactNode;
};

export function Field({ label, htmlFor, hint, className, children }: FieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="label">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

type FormActionsProps = {
  onCancel: () => void;
  submitting: boolean;
  disabled?: boolean;
};

export function FormActions({ onCancel, submitting, disabled }: FormActionsProps) {
  return (
    <div className="mt-2 flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="btn btn-secondary">
        Cancelar
      </button>
      <button type="submit" disabled={submitting || disabled} className="btn btn-primary">
        {submitting ? 'Salvando…' : 'Salvar'}
      </button>
    </div>
  );
}
