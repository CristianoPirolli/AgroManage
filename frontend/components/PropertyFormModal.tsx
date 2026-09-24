'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ErrorAlert } from '@/components/ui/Feedback';
import { Field, FormActions } from '@/components/ui/Form';
import type { Property, PropertyInput } from '@/types/property';

type PropertyFormModalProps = {
  open: boolean;
  property: Property | null;
  onClose: () => void;
  onSubmit: (data: PropertyInput) => Promise<void>;
};

function toForm(property: Property | null): PropertyInput {
  if (!property) return { name: '', location: '', city: '', state: '', totalArea: 0 };
  return {
    name: property.name,
    location: property.location ?? '',
    city: property.city,
    state: property.state,
    totalArea: property.totalArea,
  };
}

export function PropertyFormModal({ open, property, onClose, onSubmit }: PropertyFormModalProps) {
  return (
    <Modal open={open} title={property ? 'Editar propriedade' : 'Nova propriedade'} onClose={onClose}>
      <PropertyForm property={property} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}

type PropertyFormProps = Omit<PropertyFormModalProps, 'open'>;

function PropertyForm({ property, onClose, onSubmit }: PropertyFormProps) {
  const [form, setForm] = useState<PropertyInput>(() => toForm(property));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    <form onSubmit={handleSubmit} className="grid gap-4">
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

      <Field label="Localização (opcional)" htmlFor="location" hint="Endereço, linha ou comunidade rural.">
        <input
          id="location"
          maxLength={200}
          value={form.location}
          onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Cidade" htmlFor="city" className="col-span-2">
          <input
            id="city"
            required
            minLength={2}
            maxLength={100}
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            className="input"
          />
        </Field>
        <Field label="UF" htmlFor="state">
          <input
            id="state"
            required
            minLength={2}
            maxLength={2}
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            className="input uppercase"
          />
        </Field>
      </div>

      <Field label="Área total (hectares)" htmlFor="totalArea">
        <input
          id="totalArea"
          type="number"
          required
          min={0.01}
          step="0.01"
          placeholder="0,00"
          value={form.totalArea || ''}
          onChange={(e) => setForm((f) => ({ ...f, totalArea: Number(e.target.value) }))}
          className="input"
        />
      </Field>

      {error && <ErrorAlert message={error} />}
      <FormActions onCancel={onClose} submitting={submitting} />
    </form>
  );
}
