'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { ErrorAlert } from '@/components/ui/Feedback';
import { Field, FormActions } from '@/components/ui/Form';
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

function toForm(crop: Crop | null, properties: Property[]): CropInput {
  if (!crop) {
    return {
      name: '',
      plantedArea: 0,
      plantingDate: '',
      expectedHarvestDate: '',
      status: 'PLANNED',
      propertyId: properties[0]?.id ?? 0,
    };
  }
  return {
    name: crop.name,
    plantedArea: crop.plantedArea,
    plantingDate: crop.plantingDate.slice(0, 10),
    expectedHarvestDate: crop.expectedHarvestDate?.slice(0, 10) ?? '',
    status: crop.status,
    propertyId: crop.propertyId,
  };
}

export function CropFormModal({ open, crop, properties, onClose, onSubmit }: CropFormModalProps) {
  return (
    <Modal open={open} title={crop ? 'Editar cultura' : 'Nova cultura'} onClose={onClose}>
      <CropForm crop={crop} properties={properties} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
}

type CropFormProps = Omit<CropFormModalProps, 'open'>;

function CropForm({ crop, properties, onClose, onSubmit }: CropFormProps) {
  const [form, setForm] = useState<CropInput>(() => toForm(crop, properties));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Field label="Propriedade" htmlFor="propertyId">
        <select
          id="propertyId"
          required
          disabled={!!crop}
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

      <Field label="Nome da cultura" htmlFor="name">
        <input
          id="name"
          required
          minLength={2}
          maxLength={120}
          placeholder="Soja, milho, trigo…"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="input"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Área plantada (ha)" htmlFor="plantedArea">
          <input
            id="plantedArea"
            type="number"
            required
            min={0.01}
            step="0.01"
            placeholder="0,00"
            value={form.plantedArea || ''}
            onChange={(e) => setForm((f) => ({ ...f, plantedArea: Number(e.target.value) }))}
            className="input"
          />
        </Field>

        <Field label="Status" htmlFor="status">
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CropStatus }))}
            className="input"
          >
            {Object.entries(CROP_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data de plantio" htmlFor="plantingDate">
          <input
            id="plantingDate"
            type="date"
            required
            value={form.plantingDate}
            onChange={(e) => setForm((f) => ({ ...f, plantingDate: e.target.value }))}
            className="input"
          />
        </Field>

        <Field label="Previsão de colheita" htmlFor="expectedHarvestDate">
          <input
            id="expectedHarvestDate"
            type="date"
            value={form.expectedHarvestDate}
            onChange={(e) => setForm((f) => ({ ...f, expectedHarvestDate: e.target.value }))}
            className="input"
          />
        </Field>
      </div>

      {error && <ErrorAlert message={error} />}
      <FormActions onCancel={onClose} submitting={submitting} disabled={properties.length === 0} />
    </form>
  );
}
