'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createExpense, deleteExpense, listExpenses, updateExpense } from '@/services/expenses';
import { listProperties } from '@/services/properties';
import { ExpenseFormModal } from '@/components/ExpenseFormModal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, NeedsPropertyState } from '@/components/ui/EmptyState';
import { ErrorAlert, TableSkeleton } from '@/components/ui/Feedback';
import { Icon } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { RowActions } from '@/components/ui/RowActions';
import { formatCurrency, formatDate } from '@/lib/format';
import { EXPENSE_CATEGORY_LABELS } from '@/types/expense';
import type { Expense, ExpenseInput } from '@/types/expense';
import type { Property } from '@/types/property';

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const propertyNameById = useMemo(
    () => new Map(properties.map((property) => [property.id, property.name])),
    [properties],
  );
  const total = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);

  const loadData = useCallback(async () => {
    try {
      const [expensesData, propertiesData] = await Promise.all([listExpenses(), listProperties()]);
      setExpenses(expensesData);
      setProperties(propertiesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar despesas');
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

  function openEditModal(expense: Expense) {
    setEditing(expense);
    setModalOpen(true);
  }

  async function handleSubmit(data: ExpenseInput) {
    if (editing) {
      const { propertyId: _propertyId, ...rest } = data;
      await updateExpense(editing.id, rest);
    } else {
      await createExpense(data);
    }
    setModalOpen(false);
    await loadData();
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteExpense(deleting.id);
      setDeleting(null);
      await loadData();
    } catch (err) {
      setDeleting(null);
      setError(err instanceof Error ? err.message : 'Erro ao excluir despesa');
    }
  }

  const newExpenseButton = (
    <button type="button" onClick={openCreateModal} className="btn btn-primary">
      <Icon name="plus" className="size-4" />
      Nova despesa
    </button>
  );

  return (
    <>
      <PageHeader
        title="Despesas"
        description="Os gastos de cada propriedade, organizados por categoria."
        action={!loading && properties.length > 0 && expenses.length > 0 ? newExpenseButton : undefined}
      />

      {error && <ErrorAlert message={error} />}

      {!loading && expenses.length > 0 && (
        <div className="panel mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-sm text-muted">Total gasto</span>
            <span className="font-display text-3xl font-bold tabular-nums text-ink">{formatCurrency(total)}</span>
          </div>
          <span className="text-sm text-muted">
            {expenses.length === 1 ? '1 lançamento' : `${expenses.length} lançamentos`}
          </span>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : properties.length === 0 ? (
        <NeedsPropertyState description="Toda despesa fica ligada a uma propriedade. Cadastre a primeira para começar." />
      ) : expenses.length === 0 ? (
        <EmptyState
          icon="expense"
          title="Nenhuma despesa registrada"
          description="Lance os gastos da propriedade para ver quanto cada categoria custa."
          action={newExpenseButton}
        />
      ) : (
        <div className="panel overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Propriedade</th>
                <th>Data</th>
                <th className="num">Valor</th>
                <th className="w-24">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="font-semibold">{expense.description}</td>
                  <td>
                    <Badge>{EXPENSE_CATEGORY_LABELS[expense.category]}</Badge>
                  </td>
                  <td>{propertyNameById.get(expense.propertyId) ?? '—'}</td>
                  <td className="tabular-nums">{formatDate(expense.date)}</td>
                  <td className="num font-medium">{formatCurrency(expense.amount)}</td>
                  <td>
                    <RowActions
                      label={expense.description}
                      onEdit={() => openEditModal(expense)}
                      onDelete={() => setDeleting(expense)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ExpenseFormModal
        open={modalOpen}
        expense={editing}
        properties={properties}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir despesa"
        message={`Excluir "${deleting?.description}"? Essa ação não pode ser desfeita.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
