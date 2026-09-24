'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ErrorAlert } from '@/components/ui/Feedback';
import { Field, FormActions } from '@/components/ui/Form';
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

function toForm(activity: Activity | null, properties: Property[]): ActivityInput {
  if (!activity) {
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
  return {
    title: activity.title,
    description: activity.description ?? '',
    date: activity.date.slice(0, 10),
    cost: activity.cost ?? undefined,
    category: activity.category,
    propertyId: activity.propertyId,
    cropId: activity.cropId ?? undefined,
  };
}

export function ActivityFormModal({ open, activity, properties, crops, onClose, onSubmit }: ActivityFormModalProps) {
  return (
    <Modal open={open} title={activity ? 'Editar atividade' : 'Nova atividade'} onClose={onClose}>
      <ActivityForm activity={activity} properties={properties} crops={crops} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}

type ActivityFormProps = Omit<ActivityFormModalProps, 'open'>;

function ActivityForm({ activity, properties, crops, onClose, onSubmit }: ActivityFormProps) {
  const [form, setForm] = useState<ActivityInput>(() => toForm(activity, properties));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cropsForProperty = useMemo(
    () => crops.filter((crop) => crop.propertyId === Number(form.propertyId)),
    [crops, form.propertyId],
  );

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
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Propriedade" htmlFor="propertyId">
          <select
            id="propertyId"
            required
            disabled={!!activity}
            value={form.propertyId}
            onChange={(e) => setForm((f) => ({ ...f, propertyId: Number(e.target.value), cropId: undefined }))}
            className="input"
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Cultura (opcional)" htmlFor="cropId">
          <select
            id="cropId"
            value={form.cropId ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, cropId: e.target.value ? Number(e.target.value) : undefined }))}
            className="input"
          >
            <option value="">Nenhuma</option>
            {cropsForProperty.map((crop) => (
              <option key={crop.id} value={crop.id}>
                {crop.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Título" htmlFor="title">
        <input
          id="title"
          required
          minLength={2}
          maxLength={150}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="input"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoria" htmlFor="category">
          <input
            id="category"
            required
            minLength={2}
            maxLength={80}
            list="category-suggestions"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className="input"
          />
          <datalist id="category-suggestions">
            {ACTIVITY_CATEGORY_SUGGESTIONS.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </Field>

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
      </div>

      <Field label="Custo (R$, opcional)" htmlFor="cost">
        <input
          id="cost"
          type="number"
          min={0}
          step="0.01"
          placeholder="0,00"
          value={form.cost ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value ? Number(e.target.value) : undefined }))}
          className="input"
        />
      </Field>

      <Field label="Descrição (opcional)" htmlFor="description">
        <textarea
          id="description"
          rows={2}
          maxLength={2000}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          className="input resize-y"
        />
      </Field>

      {error && <ErrorAlert message={error} />}
      <FormActions onCancel={onClose} submitting={submitting} disabled={properties.length === 0} />
    </form>
  );
}
