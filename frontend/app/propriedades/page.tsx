'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createProperty, deleteProperty, listProperties, updateProperty } from '@/services/properties';
import { PropertyFormModal } from '@/components/PropertyFormModal';
import type { Property, PropertyInput } from '@/types/property';

export default function PropriedadesPage() {
  const { user, loading: authLoading } = useAuth({ redirectToLogin: true });
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);

  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProperties(await listProperties());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar propriedades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadProperties();
  }, [user, loadProperties]);

  function openCreateModal() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEditModal(property: Property) {
    setEditing(property);
    setModalOpen(true);
  }

  async function handleSubmit(data: PropertyInput) {
    if (editing) {
      await updateProperty(editing.id, data);
    } else {
      await createProperty(data);
    }
    setModalOpen(false);
    await loadProperties();
  }

  async function handleDelete(property: Property) {
    if (!window.confirm(`Excluir a propriedade "${property.name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await deleteProperty(property.id);
      await loadProperties();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir propriedade');
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
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Propriedades</h1>
          <button
            onClick={openCreateModal}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
          >
            + Nova propriedade
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Carregando propriedades…</p>
        ) : properties.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Nenhuma propriedade cadastrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Cidade/UF</th>
                  <th className="px-4 py-3 font-medium">Área (ha)</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{property.name}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {property.city}/{property.state}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{property.totalArea}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditModal(property)}
                          className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(property)}
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

      <PropertyFormModal
        open={modalOpen}
        property={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
