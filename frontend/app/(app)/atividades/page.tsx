'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createActivity, deleteActivity, listActivities, updateActivity } from '@/services/activities';
import { listProperties } from '@/services/properties';
import { listCrops } from '@/services/crops';
import { ActivityFormModal } from '@/components/ActivityFormModal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, NeedsPropertyState } from '@/components/ui/EmptyState';
import { ErrorAlert, TableSkeleton } from '@/components/ui/Feedback';
import { Icon } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { RowActions } from '@/components/ui/RowActions';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Activity, ActivityInput } from '@/types/activity';
import type { Property } from '@/types/property';
import type { Crop } from '@/types/crop';

export default function AtividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [deleting, setDeleting] = useState<Activity | null>(null);

  const propertyNameById = useMemo(
    () => new Map(properties.map((property) => [property.id, property.name])),
    [properties],
  );
  const cropNameById = useMemo(() => new Map(crops.map((crop) => [crop.id, crop.name])), [crops]);

  const loadData = useCallback(async () => {
    try {
      const [activitiesData, propertiesData, cropsData] = await Promise.all([
        listActivities(),
        listProperties(),
        listCrops(),
      ]);
      setActivities(activitiesData);
      setProperties(propertiesData);
      setCrops(cropsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar atividades');
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

  function openEditModal(activity: Activity) {
    setEditing(activity);
    setModalOpen(true);
  }

  async function handleSubmit(data: ActivityInput) {
    if (editing) {
      const { propertyId: _propertyId, ...rest } = data;
      await updateActivity(editing.id, rest);
    } else {
      await createActivity(data);
    }
    setModalOpen(false);
    await loadData();
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteActivity(deleting.id);
      setDeleting(null);
      await loadData();
    } catch (err) {
      setDeleting(null);
      setError(err instanceof Error ? err.message : 'Erro ao excluir atividade');
    }
  }

  const newActivityButton = (
    <button type="button" onClick={openCreateModal} className="btn btn-primary">
      <Icon name="plus" className="size-4" />
      Nova atividade
    </button>
  );

  return (
    <>
      <PageHeader
        title="Atividades"
        description="O que foi feito no campo: plantio, adubação, pulverização, colheita e outros serviços."
        action={!loading && properties.length > 0 && activities.length > 0 ? newActivityButton : undefined}
      />

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <TableSkeleton />
      ) : properties.length === 0 ? (
        <NeedsPropertyState description="Toda atividade fica ligada a uma propriedade. Cadastre a primeira para começar." />
      ) : activities.length === 0 ? (
        <EmptyState
          icon="activity"
          title="Nenhuma atividade registrada"
          description="Anote o que foi feito no campo, com data e custo, para manter o histórico da propriedade."
          action={newActivityButton}
        />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Atividade</th>
                <th>Categoria</th>
                <th>Propriedade</th>
                <th>Cultura</th>
                <th>Data</th>
                <th className="num">Custo</th>
                <th className="w-24">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="font-semibold">{activity.title}</td>
                  <td>
                    <Badge>{activity.category}</Badge>
                  </td>
                  <td>{propertyNameById.get(activity.propertyId) ?? '—'}</td>
                  <td>{activity.cropId ? (cropNameById.get(activity.cropId) ?? '—') : '—'}</td>
                  <td className="tabular-nums">{formatDate(activity.date)}</td>
                  <td className="num">{activity.cost != null ? formatCurrency(activity.cost) : '—'}</td>
                  <td>
                    <RowActions
                      label={activity.title}
                      onEdit={() => openEditModal(activity)}
                      onDelete={() => setDeleting(activity)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ActivityFormModal
        open={modalOpen}
        activity={editing}
        properties={properties}
        crops={crops}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir atividade"
        message={`Excluir "${deleting?.title}"? Essa ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
