'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ErrorAlert } from '@/components/ui/Feedback';
import { Field, FormActions } from '@/components/ui/Form';
import type { Expense, ExpenseCategory, ExpenseInput } from '@/types/expense';
import { EXPENSE_CATEGORY_LABELS } from '@/types/expense';
import type { Property } from '@/types/property';

type ExpenseFormModalProps = {
  open: boolean;
  expense: Expense | null;
  properties: Property[];
  onClose: () => void;
  onSubmit: (data: ExpenseInput) => Promise<void>;
};

function toForm(expense: Expense | null, properties: Property[]): ExpenseInput {
  if (!expense) {
    return {
      description: '',
      amount: 0,
      category: 'INSUMOS',
      date: '',
      propertyId: properties[0]?.id ?? 0,
    };
  }
  return {
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    date: expense.date.slice(0, 10),
    propertyId: expense.propertyId,
  };
}

export function ExpenseFormModal({ open, expense, properties, onClose, onSubmit }: ExpenseFormModalProps) {
  return (
    <Modal open={open} title={expense ? 'Editar despesa' : 'Nova despesa'} onClose={onClose}>
      <ExpenseForm expense={expense} properties={properties} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}

type ExpenseFormProps = Omit<ExpenseFormModalProps, 'open'>;

function ExpenseForm({ expense, properties, onClose, onSubmit }: ExpenseFormProps) {
  const [form, setForm] = useState<ExpenseInput>(() => toForm(expense, properties));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount),
        propertyId: Number(form.propertyId),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar despesa');
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
          disabled={!!expense}
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

      <Field label="Descrição" htmlFor="description">
        <input
          id="description"
          required
          minLength={2}
          maxLength={200}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="input"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Valor (R$)" htmlFor="amount">
          <input
            id="amount"
            type="number"
            required
            min={0.01}
            step="0.01"
            placeholder="0,00"
            value={form.amount || ''}
            onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
            className="input"
          />
        </Field>

        <Field label="Categoria" htmlFor="category">
          <select
            id="category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
            className="input"
          >
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Data" htmlFor="date">
        <input
          id="date"
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          className="input"
        />
      </Field>

      {error && <ErrorAlert message={error} />}
      <FormActions onCancel={onClose} submitting={submitting} disabled={properties.length === 0} />
    </form>
  );
}
