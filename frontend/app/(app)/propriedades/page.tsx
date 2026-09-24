'use client';

import { useCallback, useEffect, useState } from 'react';
import { createProperty, deleteProperty, listProperties, updateProperty } from '@/services/properties';
import { PropertyFormModal } from '@/components/PropertyFormModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert, TableSkeleton } from '@/components/ui/Feedback';
import { Icon } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { RowActions } from '@/components/ui/RowActions';
import { formatNumber } from '@/lib/format';
import type { Property, PropertyInput } from '@/types/property';

export default function PropriedadesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [deleting, setDeleting] = useState<Property | null>(null);

  const loadProperties = useCallback(async () => {
    try {
      setProperties(await listProperties());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar propriedades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

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

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteProperty(deleting.id);
      setDeleting(null);
      await loadProperties();
    } catch (err) {
      setDeleting(null);
      setError(err instanceof Error ? err.message : 'Erro ao excluir propriedade');
    }
  }

  const newPropertyButton = (
    <button type="button" onClick={openCreateModal} className="btn btn-primary">
      <Icon name="plus" className="size-4" />
      Nova propriedade
    </button>
  );

  return (
    <>
      <PageHeader
        title="Propriedades"
        description="As áreas que você administra. Culturas, atividades, estoque e despesas ficam ligados a elas."
        action={properties.length > 0 ? newPropertyButton : undefined}
      />

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <TableSkeleton />
      ) : properties.length === 0 ? (
        <EmptyState
          icon="property"
          title="Nenhuma propriedade cadastrada"
          description="Comece pela área onde você planta. Culturas, estoque e despesas ficam ligados a ela."
          action={newPropertyButton}
        />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Cidade/UF</th>
                <th className="num">Área (ha)</th>
                <th className="w-24">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id}>
                  <td>
                    <p className="font-semibold">{property.name}</p>
                    {property.location && <p className="text-xs text-muted">{property.location}</p>}
                  </td>
                  <td>
                    {property.city}/{property.state}
                  </td>
                  <td className="num">{formatNumber(property.totalArea)}</td>
                  <td>
                    <RowActions
                      label={property.name}
                      onEdit={() => openEditModal(property)}
                      onDelete={() => setDeleting(property)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PropertyFormModal
        open={modalOpen}
        property={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir propriedade"
        message={`Excluir "${deleting?.name}"? As culturas, atividades, estoque e despesas ligados a ela também serão apagados. Essa ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
