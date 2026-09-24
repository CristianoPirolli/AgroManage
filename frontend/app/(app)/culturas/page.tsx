'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createCrop, deleteCrop, listCrops, updateCrop } from '@/services/crops';
import { listProperties } from '@/services/properties';
import { CropFormModal } from '@/components/CropFormModal';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { EmptyState, NeedsPropertyState } from '@/components/ui/EmptyState';
import { ErrorAlert, TableSkeleton } from '@/components/ui/Feedback';
import { Icon } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { RowActions } from '@/components/ui/RowActions';
import { formatDate, formatNumber } from '@/lib/format';
import { CROP_STATUS_LABELS } from '@/types/crop';
import type { Crop, CropInput, CropStatus } from '@/types/crop';
import type { Property } from '@/types/property';

const STATUS_TONES: Record<CropStatus, BadgeTone> = {
  PLANNED: 'neutral',
  PLANTED: 'amber',
  GROWING: 'green',
  HARVESTED: 'dark',
};

export default function CulturasPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Crop | null>(null);
  const [deleting, setDeleting] = useState<Crop | null>(null);

  const propertyNameById = useMemo(
    () => new Map(properties.map((property) => [property.id, property.name])),
    [properties],
  );

  const loadData = useCallback(async () => {
    try {
      const [cropsData, propertiesData] = await Promise.all([listCrops(), listProperties()]);
      setCrops(cropsData);
      setProperties(propertiesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar culturas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreateModal() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEditModal(crop: Crop) {
    setEditing(crop);
    setModalOpen(true);
  }

  async function handleSubmit(data: CropInput) {
    if (editing) {
      const { propertyId: _propertyId, ...rest } = data;
      await updateCrop(editing.id, rest);
    } else {
      await createCrop(data);
    }
    setModalOpen(false);
    await loadData();
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteCrop(deleting.id);
      setDeleting(null);
      await loadData();
    } catch (err) {
      setDeleting(null);
      setError(err instanceof Error ? err.message : 'Erro ao excluir cultura');
    }
  }

  const newCropButton = (
    <button type="button" onClick={openCreateModal} className="btn btn-primary">
      <Icon name="plus" className="size-4" />
      Nova cultura
    </button>
  );

  return (
    <>
      <PageHeader
        title="Culturas"
        description="O que está planejado, plantado e colhido em cada propriedade."
        action={!loading && properties.length > 0 && crops.length > 0 ? newCropButton : undefined}
      />

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <TableSkeleton />
      ) : properties.length === 0 ? (
        <NeedsPropertyState description="Toda cultura fica ligada a uma propriedade. Cadastre a primeira para começar." />
      ) : crops.length === 0 ? (
        <EmptyState
          icon="crop"
          title="Nenhuma cultura cadastrada"
          description="Registre o que está plantado para acompanhar a safra, da semeadura à colheita."
          action={newCropButton}
        />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cultura</th>
                <th>Propriedade</th>
                <th>Plantio</th>
                <th>Colheita prevista</th>
                <th className="num">Área (ha)</th>
                <th>Status</th>
                <th className="w-24">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {crops.map((crop) => (
                <tr key={crop.id}>
                  <td className="font-semibold">{crop.name}</td>
                  <td>{propertyNameById.get(crop.propertyId) ?? '—'}</td>
                  <td className="tabular-nums">{formatDate(crop.plantingDate)}</td>
                  <td className="tabular-nums">{crop.expectedHarvestDate ? formatDate(crop.expectedHarvestDate) : '—'}</td>
                  <td className="num">{formatNumber(crop.plantedArea)}</td>
                  <td>
                    <Badge tone={STATUS_TONES[crop.status]}>{CROP_STATUS_LABELS[crop.status]}</Badge>
                  </td>
                  <td>
                    <RowActions label={crop.name} onEdit={() => openEditModal(crop)} onDelete={() => setDeleting(crop)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CropFormModal
        open={modalOpen}
        crop={editing}
        properties={properties}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir cultura"
        message={`Excluir "${deleting?.name}"? As atividades ligadas a ela continuam registradas, só perdem o vínculo com a cultura.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
