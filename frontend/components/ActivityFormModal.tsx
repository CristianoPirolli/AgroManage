'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Activity, ActivityInput } from '@/types/activity';
import { ACTIVITY_CATEGORY_SUGGESTIONS } from '@/types/activity';
import type { Property } from '@/types/property';
import type { Crop } from '@/types/crop';

type ActivityFormModalProps = {
  open: boolean;
  activity: Activity | null;
  properties: Property[];
  crops: Crop[];
  onClose: () => void;
  onSubmit: (data: ActivityInput) => Promise<void>;
};

function emptyForm(properties: Property[]): ActivityInput {
  return {
    title: '',
    description: '',
    date: '',
    cost: undefined,
    category: '',
    propertyId: properties[0]?.id ?? 0,
    cropId: undefined,
  };
}

export function ActivityFormModal({ open, activity, properties, crops, onClose, onSubmit }: ActivityFormModalProps) {
  const [form, setForm] = useState<ActivityInput>(() => emptyForm(properties));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cropsForProperty = useMemo(
    () => crops.filter((crop) => crop.propertyId === Number(form.propertyId)),
    [crops, form.propertyId],
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      activity
        ? {
            title: activity.title,
            description: activity.description ?? '',
            date: activity.date.slice(0, 10),
            cost: activity.cost ?? undefined,
            category: activity.category,
            propertyId: activity.propertyId,
            cropId: activity.cropId ?? undefined,
          }
        : emptyForm(properties),
    );
  }, [open, activity, properties]);

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
        propertyId: Number(form.propertyId),
        cost: form.cost !== undefined && form.cost !== null ? Number(form.cost) : undefined,
        cropId: form.cropId ? Number(form.cropId) : undefined,
        description: form.description || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar atividade');
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
            {activity ? 'Editar atividade' : 'Nova atividade'}
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
            <label htmlFor="propertyId" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Propriedade
            </label>
            <select
              id="propertyId"
              required
              disabled={!!activity}
              value={form.propertyId}
              onChange={(e) => setForm((f) => ({ ...f, propertyId: Number(e.target.value), cropId: undefined }))}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:disabled:bg-zinc-800"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="cropId" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Cultura (opcional)
            </label>
            <select
              id="cropId"
              value={form.cropId ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, cropId: e.target.value ? Number(e.target.value) : undefined }))}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">Nenhuma</option>
              {cropsForProperty.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Título
            </label>
            <input
              id="title"
              required
              minLength={2}
              maxLength={150}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="category" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Categoria
              </label>
              <input
                id="category"
                required
                minLength={2}
                maxLength={80}
                list="category-suggestions"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
              <datalist id="category-suggestions">
                {ACTIVITY_CATEGORY_SUGGESTIONS.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Data
              </label>
              <input
                id="date"
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="cost" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Custo (R$, opcional)
            </label>
            <input
              id="cost"
              type="number"
              min={0}
              step="0.01"
              value={form.cost ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value ? Number(e.target.value) : undefined }))}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              rows={2}
              maxLength={2000}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
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
              disabled={submitting || properties.length === 0}
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
