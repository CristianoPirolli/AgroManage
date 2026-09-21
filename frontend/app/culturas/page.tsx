'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createCrop, deleteCrop, listCrops, updateCrop } from '@/services/crops';
import { listProperties } from '@/services/properties';
import { CropFormModal } from '@/components/CropFormModal';
import { CROP_STATUS_LABELS } from '@/types/crop';
import type { Crop, CropInput } from '@/types/crop';
import type { Property } from '@/types/property';

export default function CulturasPage() {
  const { user, loading: authLoading } = useAuth({ redirectToLogin: true });
  const [crops, setCrops] = useState<Crop[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Crop | null>(null);

  const propertyNameById = useMemo(
    () => new Map(properties.map((property) => [property.id, property.name])),
    [properties],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cropsData, propertiesData] = await Promise.all([listCrops(), listProperties()]);
      setCrops(cropsData);
      setProperties(propertiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar culturas');
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

  async function handleDelete(crop: Crop) {
    if (!window.confirm(`Excluir a cultura "${crop.name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await deleteCrop(crop.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir cultura');
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
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Culturas</h1>
          <button
            onClick={openCreateModal}
            disabled={!loading && properties.length === 0}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
          >
            + Nova cultura
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Carregando culturas…</p>
        ) : properties.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Cadastre uma{' '}
            <Link href="/propriedades" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              propriedade
            </Link>{' '}
            antes de cadastrar culturas.
          </p>
        ) : crops.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Nenhuma cultura cadastrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Propriedade</th>
                  <th className="px-4 py-3 font-medium">Área (ha)</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((crop) => (
                  <tr key={crop.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{crop.name}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {propertyNameById.get(crop.propertyId) ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{crop.plantedArea}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {CROP_STATUS_LABELS[crop.status]}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditModal(crop)}
                          className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(crop)}
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

      <CropFormModal
        open={modalOpen}
        crop={editing}
        properties={properties}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
