'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createStockItem, deleteStockItem, listStockItems, updateStockItem } from '@/services/stock-items';
import { listProperties } from '@/services/properties';
import { StockItemFormModal } from '@/components/StockItemFormModal';
import type { StockItem, StockItemInput } from '@/types/stock-item';
import type { Property } from '@/types/property';

export default function EstoquePage() {
  const { user, loading: authLoading } = useAuth({ redirectToLogin: true });
  const [items, setItems] = useState<StockItem[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);

  const propertyNameById = useMemo(
    () => new Map(properties.map((property) => [property.id, property.name])),
    [properties],
  );
  const lowStockItems = useMemo(() => items.filter((item) => item.quantity <= item.minimumQuantity), [items]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsData, propertiesData] = await Promise.all([listStockItems(), listProperties()]);
      setItems(itemsData);
      setProperties(propertiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estoque');
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

  function openEditModal(item: StockItem) {
    setEditing(item);
    setModalOpen(true);
  }

  async function handleSubmit(data: StockItemInput) {
    if (editing) {
      const { propertyId: _propertyId, ...rest } = data;
      await updateStockItem(editing.id, rest);
    } else {
      await createStockItem(data);
    }
    setModalOpen(false);
    await loadData();
  }

  async function handleDelete(item: StockItem) {
    if (!window.confirm(`Excluir o item "${item.name}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await deleteStockItem(item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir item de estoque');
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
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Estoque</h1>
          <button
            onClick={openCreateModal}
            disabled={!loading && properties.length === 0}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
          >
            + Novo item
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {!loading && lowStockItems.length > 0 && (
          <p
            role="alert"
            className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
          >
            ⚠ {lowStockItems.length} item(ns) com quantidade igual ou abaixo do mínimo.
          </p>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Carregando estoque…</p>
        ) : properties.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Cadastre uma{' '}
            <Link href="/propriedades" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              propriedade
            </Link>{' '}
            antes de cadastrar itens de estoque.
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Nenhum item de estoque cadastrado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Propriedade</th>
                  <th className="px-4 py-3 font-medium">Quantidade</th>
                  <th className="px-4 py-3 font-medium">Mínimo</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isLow = item.quantity <= item.minimumQuantity;
                  return (
                    <tr
                      key={item.id}
                      className={`border-t border-zinc-200 dark:border-zinc-800 ${isLow ? 'bg-red-50 dark:bg-red-950/40' : ''}`}
                    >
                      <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                        {item.name}
                        {isLow && (
                          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
                            estoque baixo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{item.category}</td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {propertyNameById.get(item.propertyId) ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                        {item.minimumQuantity} {item.unit}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => openEditModal(item)}
                            className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="font-medium text-red-600 hover:underline dark:text-red-400"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StockItemFormModal
        open={modalOpen}
        stockItem={editing}
        properties={properties}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
