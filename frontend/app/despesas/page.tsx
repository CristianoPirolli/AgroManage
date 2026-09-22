'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createExpense, deleteExpense, listExpenses, updateExpense } from '@/services/expenses';
import { listProperties } from '@/services/properties';
import { ExpenseFormModal } from '@/components/ExpenseFormModal';
import { EXPENSE_CATEGORY_LABELS } from '@/types/expense';
import type { Expense, ExpenseInput } from '@/types/expense';
import type { Property } from '@/types/property';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function DespesasPage() {
  const { user, loading: authLoading } = useAuth({ redirectToLogin: true });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const propertyNameById = useMemo(
    () => new Map(properties.map((property) => [property.id, property.name])),
    [properties],
  );
  const total = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesData, propertiesData] = await Promise.all([listExpenses(), listProperties()]);
      setExpenses(expensesData);
      setProperties(propertiesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar despesas');
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

  async function handleDelete(expense: Expense) {
    if (!window.confirm(`Excluir a despesa "${expense.description}"? Essa ação não pode ser desfeita.`)) {
      return;
    }
    try {
      await deleteExpense(expense.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir despesa');
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
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Despesas</h1>
          <button
            onClick={openCreateModal}
            disabled={!loading && properties.length === 0}
            className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
          >
            + Nova despesa
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {!loading && expenses.length > 0 && (
          <p className="mb-4 rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            Total: <strong>{formatCurrency(total)}</strong> em {expenses.length} despesa(s)
          </p>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Carregando despesas…</p>
        ) : properties.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Cadastre uma{' '}
            <Link href="/propriedades" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              propriedade
            </Link>{' '}
            antes de registrar despesas.
          </p>
        ) : expenses.length === 0 ? (
          <p className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            Nenhuma despesa registrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Propriedade</th>
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Valor</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{expense.description}</td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {EXPENSE_CATEGORY_LABELS[expense.category]}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {propertyNameById.get(expense.propertyId) ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      {new Date(expense.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{formatCurrency(expense.amount)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <button
                          onClick={() => openEditModal(expense)}
                          className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(expense)}
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

      <ExpenseFormModal
        open={modalOpen}
        expense={editing}
        properties={properties}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
