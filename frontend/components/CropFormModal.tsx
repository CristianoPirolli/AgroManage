'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Crop, CropInput, CropStatus } from '@/types/crop';
import { CROP_STATUS_LABELS } from '@/types/crop';
import type { Property } from '@/types/property';

type CropFormModalProps = {
  open: boolean;
  crop: Crop | null;
  properties: Property[];
  onClose: () => void;
  onSubmit: (data: CropInput) => Promise<void>;
};

function emptyForm(properties: Property[]): CropInput {
  return {
    name: '',
    plantedArea: 0,
    plantingDate: '',
    expectedHarvestDate: '',
    status: 'PLANNED',
    propertyId: properties[0]?.id ?? 0,
  };
}

export function CropFormModal({ open, crop, properties, onClose, onSubmit }: CropFormModalProps) {
  const [form, setForm] = useState<CropInput>(() => emptyForm(properties));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      crop
        ? {
            name: crop.name,
            plantedArea: crop.plantedArea,
            plantingDate: crop.plantingDate.slice(0, 10),
            expectedHarvestDate: crop.expectedHarvestDate?.slice(0, 10) ?? '',
            status: crop.status,
            propertyId: crop.propertyId,
          }
        : emptyForm(properties),
    );
  }, [open, crop, properties]);

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
        plantedArea: Number(form.plantedArea),
        propertyId: Number(form.propertyId),
        expectedHarvestDate: form.expectedHarvestDate || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cultura');
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
            {crop ? 'Editar cultura' : 'Nova cultura'}
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
              disabled={!!crop}
              value={form.propertyId}
              onChange={(e) => setForm((f) => ({ ...f, propertyId: Number(e.target.value) }))}
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
            <label htmlFor="name" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nome da cultura
            </label>
            <input
              id="name"
              required
              minLength={2}
              maxLength={120}
              placeholder="Soja, Milho, Trigo…"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="plantedArea" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Área plantada (ha)
              </label>
              <input
                id="plantedArea"
                type="number"
                required
                min={0.01}
                step="0.01"
                value={form.plantedArea}
                onChange={(e) => setForm((f) => ({ ...f, plantedArea: Number(e.target.value) }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="status" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CropStatus }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              >
                {Object.entries(CROP_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="plantingDate" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Data de plantio
              </label>
              <input
                id="plantingDate"
                type="date"
                required
                value={form.plantingDate}
                onChange={(e) => setForm((f) => ({ ...f, plantingDate: e.target.value }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="expectedHarvestDate" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Previsão de colheita
              </label>
              <input
                id="expectedHarvestDate"
                type="date"
                value={form.expectedHarvestDate}
                onChange={(e) => setForm((f) => ({ ...f, expectedHarvestDate: e.target.value }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>
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
