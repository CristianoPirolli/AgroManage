'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createStockItem, deleteStockItem, listStockItems, updateStockItem } from '@/services/stock-items';
import { listProperties } from '@/services/properties';
import { StockItemFormModal } from '@/components/StockItemFormModal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, NeedsPropertyState } from '@/components/ui/EmptyState';
import { ErrorAlert, TableSkeleton } from '@/components/ui/Feedback';
import { Icon } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { RowActions } from '@/components/ui/RowActions';
import { formatNumber } from '@/lib/format';
import type { StockItem, StockItemInput } from '@/types/stock-item';
import type { Property } from '@/types/property';

export default function EstoquePage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StockItem | null>(null);
  const [deleting, setDeleting] = useState<StockItem | null>(null);

  const propertyNameById = useMemo(
    () => new Map(properties.map((property) => [property.id, property.name])),
    [properties],
  );
  const lowStockCount = useMemo(() => items.filter((item) => item.quantity <= item.minimumQuantity).length, [items]);

  const loadData = useCallback(async () => {
    try {
      const [itemsData, propertiesData] = await Promise.all([listStockItems(), listProperties()]);
      setItems(itemsData);
      setProperties(propertiesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar estoque');
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

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteStockItem(deleting.id);
      setDeleting(null);
      await loadData();
    } catch (err) {
      setDeleting(null);
      setError(err instanceof Error ? err.message : 'Erro ao excluir item de estoque');
    }
  }

  const newItemButton = (
    <button type="button" onClick={openCreateModal} className="btn btn-primary">
      <Icon name="plus" className="size-4" />
      Novo item
    </button>
  );

  return (
    <>
      <PageHeader
        title="Estoque"
        description="Insumos e materiais de cada propriedade, com aviso quando o saldo chega ao mínimo."
        action={!loading && properties.length > 0 && items.length > 0 ? newItemButton : undefined}
      />

      {error && <ErrorAlert message={error} />}

      {!loading && lowStockCount > 0 && (
        <p
          role="alert"
          className="mb-4 flex items-center gap-2 rounded-lg border border-warn/30 bg-warn-soft px-4 py-3 text-sm font-medium text-warn"
        >
          <Icon name="alert" className="size-4 shrink-0" />
          {lowStockCount === 1
            ? '1 item está com a quantidade igual ou abaixo do mínimo.'
            : `${lowStockCount} itens estão com a quantidade igual ou abaixo do mínimo.`}
        </p>
      )}

      {loading ? (
        <TableSkeleton />
      ) : properties.length === 0 ? (
        <NeedsPropertyState description="Todo item de estoque fica ligado a uma propriedade. Cadastre a primeira para começar." />
      ) : items.length === 0 ? (
        <EmptyState
          icon="stock"
          title="Nenhum item no estoque"
          description="Cadastre sementes, adubo, defensivos e combustível. Avisamos quando o saldo ficar no mínimo."
          action={newItemButton}
        />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Categoria</th>
                <th>Propriedade</th>
                <th className="num">Quantidade</th>
                <th className="num">Mínimo</th>
                <th className="w-24">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const isLow = item.quantity <= item.minimumQuantity;
                return (
                  <tr key={item.id}>
                    <td>
                      <span className="font-semibold">{item.name}</span>
                      {isLow && (
                        <span className="ml-2 align-middle">
                          <Badge tone="red">Estoque baixo</Badge>
                        </span>
                      )}
                    </td>
                    <td>
                      <Badge>{item.category}</Badge>
                    </td>
                    <td>{propertyNameById.get(item.propertyId) ?? '—'}</td>
                    <td className={`num ${isLow ? 'font-semibold text-danger' : ''}`}>
                      {formatNumber(item.quantity)} {item.unit}
                    </td>
                    <td className="num text-muted">
                      {formatNumber(item.minimumQuantity)} {item.unit}
                    </td>
                    <td>
                      <RowActions label={item.name} onEdit={() => openEditModal(item)} onDelete={() => setDeleting(item)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <StockItemFormModal
        open={modalOpen}
        stockItem={editing}
        properties={properties}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir item de estoque"
        message={`Excluir "${deleting?.name}"? Essa ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
