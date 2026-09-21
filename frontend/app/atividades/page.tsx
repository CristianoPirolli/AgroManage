'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createActivity, deleteActivity, listActivities, updateActivity } from '@/services/activities';
import { listProperties } from '@/services/properties';
import { listCrops } from '@/services/crops';
import { ActivityFormModal } from '@/components/ActivityFormModal';
import type { Activity, ActivityInput } from '@/types/activity';
import type { Property } from '@/types/property';
import type { Crop } from '@/types/crop';

export default function AtividadesPage() {
  const { user, loading: authLoading } = useAuth({ redirectToLogin: true });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  const propertyNameById = useMemo(
    () => new Map(properties.map((property) => [property.id, property.name])),
    [properties],
  );
  const cropNameById = useMemo(() => new Map(crops.map((crop) => [crop.id, crop.name])), [crops]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [activitiesData, propertiesData, cropsData] = await Promise.all([
        listActivities(),
        listProperties(),
        listCrops(),
      ]);
      setActivities(activitiesData);
      setProperties(propertiesData);
      setCrops(cropsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar atividades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

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

  async function handleDelete(activity: Activity) {
    if (!window.confirm(`Excluir a atividade "${activity.title}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await deleteActivity(activity.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir atividade');
    }
  }

  if (authLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-500">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-2">
          <Link href="/" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
            ← Início
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Atividades</h1>
          <button
            onClick={openCreateModal}
            disabled={!loading && properties.length === 0}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
          >
            + Nova atividade
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Carregando atividades…</p>
        ) : properties.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Cadastre uma{' '}
            <Link href="/propriedades" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              propriedade
            </Link>{' '}
            antes de registrar atividades.
          </p>
        ) : activities.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Nenhuma atividade registrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Título</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Propriedade</th>
                  <th className="px-4 py-3 font-medium">Cultura</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Custo</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{activity.title}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{activity.category}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {propertyNameById.get(activity.propertyId) ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {activity.cropId ? (cropNameById.get(activity.cropId) ?? '—') : '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {new Date(activity.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {activity.cost != null
                        ? activity.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditModal(activity)}
                          className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(activity)}
                          className="font-medium text-red-600 hover:underline dark:text-red-400"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ActivityFormModal
        open={modalOpen}
        activity={editing}
        properties={properties}
        crops={crops}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
