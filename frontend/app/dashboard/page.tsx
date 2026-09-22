'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { listProperties } from '@/services/properties';
import { listCrops } from '@/services/crops';
import { listActivities } from '@/services/activities';
import { listStockItems } from '@/services/stock-items';
import { listExpenses } from '@/services/expenses';
import { EXPENSE_CATEGORY_LABELS } from '@/types/expense';
import type { Property } from '@/types/property';
import type { Crop } from '@/types/crop';
import type { Activity } from '@/types/activity';
import type { StockItem } from '@/types/stock-item';
import type { Expense } from '@/types/expense';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function isSameMonth(dateIso: string, reference: Date) {
  const date = new Date(dateIso);
  return date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth({ redirectToLogin: true });
  const [properties, setProperties] = useState<Property[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const propertyNameById = useMemo(
    () => new Map(properties.map((property) => [property.id, property.name])),
    [properties],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [propertiesData, cropsData, activitiesData, stockData, expensesData] = await Promise.all([
        listProperties(),
        listCrops(),
        listActivities(),
        listStockItems(),
        listExpenses(),
      ]);
      setProperties(propertiesData);
      setCrops(cropsData);
      setActivities(activitiesData);
      setStockItems(stockData);
      setExpenses(expensesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar o dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const now = useMemo(() => new Date(), []);
  const activeCrops = useMemo(() => crops.filter((crop) => crop.status !== 'HARVESTED'), [crops]);
  const lowStockItems = useMemo(() => stockItems.filter((item) => item.quantity <= item.minimumQuantity), [stockItems]);
  const expensesThisMonth = useMemo(() => expenses.filter((expense) => isSameMonth(expense.date, now)), [expenses, now]);
  const totalExpensesThisMonth = useMemo(
    () => expensesThisMonth.reduce((sum, expense) => sum + expense.amount, 0),
    [expensesThisMonth],
  );
  const recentActivities = useMemo(
    () =>
      [...activities]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [activities],
  );
  const recentExpenses = useMemo(
    () =>
      [...expenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    [expenses],
  );

  const cards = [
    { label: 'Propriedades', value: properties.length },
    { label: 'Culturas ativas', value: activeCrops.length },
    { label: 'Despesas do mês', value: formatCurrency(totalExpensesThisMonth) },
    { label: 'Atividades registradas', value: activities.length },
    { label: 'Itens com estoque baixo', value: lowStockItems.length, alert: lowStockItems.length > 0 },
  ];

  if (authLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-500">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-2">
          <Link href="/" className="text-sm text-emerald-700 hover:underline dark:text-emerald-400">
            ← Início
          </Link>
        </div>

        <h1 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>

        {error && (
          <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Carregando dados…</p>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {cards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-lg border px-4 py-4 ${
                    card.alert
                      ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950'
                      : 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950'
                  }`}
                >
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{card.value}</p>
                </div>
              ))}
            </div>

            {lowStockItems.length > 0 && (
              <div className="mb-8">
                <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Alertas de estoque baixo</h2>
                <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                  {lowStockItems.map((item) => (
                    <li key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <span className="text-zinc-900 dark:text-zinc-100">
                        {item.name} — {propertyNameById.get(item.propertyId) ?? '—'}
                      </span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {item.quantity} {item.unit} (mín. {item.minimumQuantity})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Últimas atividades</h2>
                {recentActivities.length === 0 ? (
                  <p className="text-sm text-zinc-500">Nenhuma atividade registrada ainda.</p>
                ) : (
                  <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                    {recentActivities.map((activity) => (
                      <li key={activity.id} className="px-4 py-3 text-sm">
                        <p className="text-zinc-900 dark:text-zinc-100">{activity.title}</p>
                        <p className="text-xs text-zinc-500">
                          {activity.category} · {new Date(activity.date).toLocaleDateString('pt-BR')} ·{' '}
                          {propertyNameById.get(activity.propertyId) ?? '—'}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-50">Últimas despesas</h2>
                {recentExpenses.length === 0 ? (
                  <p className="text-sm text-zinc-500">Nenhuma despesa registrada ainda.</p>
                ) : (
                  <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                    {recentExpenses.map((expense) => (
                      <li key={expense.id} className="flex items-center justify-between px-4 py-3 text-sm">
                        <div>
                          <p className="text-zinc-900 dark:text-zinc-100">{expense.description}</p>
                          <p className="text-xs text-zinc-500">
                            {EXPENSE_CATEGORY_LABELS[expense.category]} ·{' '}
                            {new Date(expense.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {formatCurrency(expense.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
