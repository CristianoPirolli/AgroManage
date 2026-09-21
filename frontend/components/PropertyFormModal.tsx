'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Property, PropertyInput } from '@/types/property';

type PropertyFormModalProps = {
  open: boolean;
  property: Property | null;
  onClose: () => void;
  onSubmit: (data: PropertyInput) => Promise<void>;
};

const emptyForm: PropertyInput = { name: '', location: '', city: '', state: '', totalArea: 0 };

export function PropertyFormModal({ open, property, onClose, onSubmit }: PropertyFormModalProps) {
  const [form, setForm] = useState<PropertyInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      property
        ? {
            name: property.name,
            location: property.location ?? '',
            city: property.city,
            state: property.state,
            totalArea: property.totalArea,
          }
        : emptyForm,
    );
  }, [open, property]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        state: form.state.toUpperCase(),
        totalArea: Number(form.totalArea),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar propriedade');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-950"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {property ? 'Editar propriedade' : 'Nova propriedade'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nome
            </label>
            <input
              id="name"
              required
              minLength={2}
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="location" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Localização (opcional)
            </label>
            <input
              id="location"
              maxLength={200}
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1">
              <label htmlFor="city" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Cidade
              </label>
              <input
                id="city"
                required
                minLength={2}
                maxLength={100}
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="state" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                UF
              </label>
              <input
                id="state"
                required
                minLength={2}
                maxLength={2}
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm uppercase outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="totalArea" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Área total (hectares)
            </label>
            <input
              id="totalArea"
              type="number"
              required
              min={0.01}
              step="0.01"
              value={form.totalArea}
              onChange={(e) => setForm((f) => ({ ...f, totalArea: Number(e.target.value) }))}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
            >
              {submitting ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
