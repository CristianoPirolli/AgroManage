'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ErrorAlert } from '@/components/ui/Feedback';
import { Field, FormActions } from '@/components/ui/Form';
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

function toForm(stockItem: StockItem | null, properties: Property[]): StockItemInput {
  if (!stockItem) {
    return { name: '', category: '', quantity: 0, unit: '', minimumQuantity: 0, propertyId: properties[0]?.id ?? 0 };
  }
  return {
    name: stockItem.name,
    category: stockItem.category,
    quantity: stockItem.quantity,
    unit: stockItem.unit,
    minimumQuantity: stockItem.minimumQuantity,
    propertyId: stockItem.propertyId,
  };
}

export function StockItemFormModal({ open, stockItem, properties, onClose, onSubmit }: StockItemFormModalProps) {
  return (
    <Modal open={open} title={stockItem ? 'Editar item de estoque' : 'Novo item de estoque'} onClose={onClose}>
      <StockItemForm stockItem={stockItem} properties={properties} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}

type StockItemFormProps = Omit<StockItemFormModalProps, 'open'>;

function StockItemForm({ stockItem, properties, onClose, onSubmit }: StockItemFormProps) {
  const [form, setForm] = useState<StockItemInput>(() => toForm(stockItem, properties));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field label="Propriedade" htmlFor="propertyId">
        <select
          id="propertyId"
          required
          disabled={!!stockItem}
          value={form.propertyId}
          onChange={(e) => setForm((f) => ({ ...f, propertyId: Number(e.target.value) }))}
          className="input"
        >
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" htmlFor="name">
          <input
            id="name"
            required
            minLength={2}
            maxLength={120}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input"
          />
        </Field>

        <Field label="Categoria" htmlFor="category">
          <input
            id="category"
            required
            minLength={2}
            maxLength={80}
            list="stock-category-suggestions"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="input"
          />
          <datalist id="stock-category-suggestions">
            {STOCK_CATEGORY_SUGGESTIONS.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Quantidade" htmlFor="quantity">
          <input
            id="quantity"
            type="number"
            required
            min={0}
            step="0.01"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
            className="input"
          />
        </Field>

        <Field label="Unidade" htmlFor="unit">
          <input
            id="unit"
            required
            maxLength={20}
            placeholder="kg, L, sacas…"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            className="input"
          />
        </Field>

        <Field label="Mínimo" htmlFor="minimumQuantity">
          <input
            id="minimumQuantity"
            type="number"
            required
            min={0}
            step="0.01"
            value={form.minimumQuantity}
            onChange={(e) => setForm((f) => ({ ...f, minimumQuantity: Number(e.target.value) }))}
            className="input"
          />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-muted">Você recebe um alerta quando a quantidade ficar igual ou abaixo do mínimo.</p>

      {error && <ErrorAlert message={error} />}
      <FormActions onCancel={onClose} submitting={submitting} disabled={properties.length === 0} />
    </form>
  );
}
