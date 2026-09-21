'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { StockItem, StockItemInput } from '@/types/stock-item';
import { STOCK_CATEGORY_SUGGESTIONS } from '@/types/stock-item';
import type { Property } from '@/types/property';

type StockItemFormModalProps = {
  open: boolean;
  stockItem: StockItem | null;
  properties: Property[];
  onClose: () => void;
  onSubmit: (data: StockItemInput) => Promise<void>;
};

function emptyForm(properties: Property[]): StockItemInput {
  return { name: '', category: '', quantity: 0, unit: '', minimumQuantity: 0, propertyId: properties[0]?.id ?? 0 };
}

export function StockItemFormModal({ open, stockItem, properties, onClose, onSubmit }: StockItemFormModalProps) {
  const [form, setForm] = useState<StockItemInput>(() => emptyForm(properties));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      stockItem
        ? {
            name: stockItem.name,
            category: stockItem.category,
            quantity: stockItem.quantity,
            unit: stockItem.unit,
            minimumQuantity: stockItem.minimumQuantity,
            propertyId: stockItem.propertyId,
          }
        : emptyForm(properties),
    );
  }, [open, stockItem, properties]);

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
        quantity: Number(form.quantity),
        minimumQuantity: Number(form.minimumQuantity),
        propertyId: Number(form.propertyId),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar item de estoque');
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
            {stockItem ? 'Editar item de estoque' : 'Novo item de estoque'}
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
              disabled={!!stockItem}
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
            <label htmlFor="category" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Categoria
            </label>
            <input
              id="category"
              required
              minLength={2}
              maxLength={80}
              list="stock-category-suggestions"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <datalist id="stock-category-suggestions">
              {STOCK_CATEGORY_SUGGESTIONS.map((suggestion) => (
                <option key={suggestion} value={suggestion} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="quantity" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Quantidade
              </label>
              <input
                id="quantity"
                type="number"
                required
                min={0}
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="unit" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Unidade
              </label>
              <input
                id="unit"
                required
                maxLength={20}
                placeholder="kg, L, sacas…"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 dark:border-zinc-700 dark:bg-zinc-900"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="minimumQuantity" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Qtd. mínima
              </label>
              <input
                id="minimumQuantity"
                type="number"
                required
                min={0}
                step="0.01"
                value={form.minimumQuantity}
                onChange={(e) => setForm((f) => ({ ...f, minimumQuantity: Number(e.target.value) }))}
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
