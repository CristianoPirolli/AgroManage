'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  size?: 'sm' | 'md';
  children: ReactNode;
};

// Os filhos só existem enquanto o modal está aberto: cada abertura recomeça com estado novo.
export function Modal({ open, title, onClose, size = 'md', children }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current
      ?.querySelector<HTMLElement>('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')
      ?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4"
      onMouseDown={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        className={`max-h-[92dvh] w-full animate-rise overflow-y-auto rounded-t-2xl bg-surface p-6 shadow-2xl sm:rounded-2xl ${
          size === 'sm' ? 'sm:max-w-sm' : 'sm:max-w-lg'
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl font-semibold text-ink">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="icon-btn -mr-2 -mt-1">
            <Icon name="close" className="size-[18px]" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
};

export function ConfirmDialog({ open, title, message, confirmLabel = 'Excluir', onConfirm, onCancel }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} title={title} onClose={onCancel} size="sm">
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={busy} className="btn btn-secondary">
          Cancelar
        </button>
        <button type="button" onClick={handleConfirm} disabled={busy} className="btn btn-danger">
          {busy ? 'Excluindo…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
