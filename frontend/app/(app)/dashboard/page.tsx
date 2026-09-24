'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { listProperties } from '@/services/properties';
import { listCrops } from '@/services/crops';
import { listActivities } from '@/services/activities';
import { listStockItems } from '@/services/stock-items';
import { listExpenses } from '@/services/expenses';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/Feedback';
import { Icon } from '@/components/ui/Icon';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { EXPENSE_CATEGORY_LABELS } from '@/types/expense';
import type { ExpenseCategory, Expense } from '@/types/expense';
import type { Property } from '@/types/property';
import type { Crop } from '@/types/crop';
import type { Activity } from '@/types/activity';
import type { StockItem } from '@/types/stock-item';

// As datas do backend são meia-noite UTC: comparar o mês em UTC, e não no fuso local.
function isSameMonth(dateIso: string, reference: Date) {
  const date = new Date(dateIso);
  return date.getUTCFullYear() === reference.getFullYear() && date.getUTCMonth() === reference.getMonth();
}

function greeting(hour: number) {
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function Panel({ title, href, children }: { title: string; href?: string; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {href && (
          <Link href={href} className="inline-flex items-center gap-1 text-sm font-medium text-link hover:underline">
            Ver tudo
            <Icon name="arrow" className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="px-5 py-6 text-sm text-muted">{children}</p>;
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando dados" className="grid gap-6">
      <div className="panel h-28 motion-safe:animate-pulse" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel h-72 motion-safe:animate-pulse" />
        <div className="panel h-72 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const user = useCurrentUser();
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
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar o dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const now = useMemo(() => new Date(), []);
  const activeCrops = useMemo(() => crops.filter((crop) => crop.status !== 'HARVESTED'), [crops]);
  const lowStockItems = useMemo(() => stockItems.filter((item) => item.quantity <= item.minimumQuantity), [stockItems]);
  const expensesThisMonth = useMemo(() => expenses.filter((expense) => isSameMonth(expense.date, now)), [expenses, now]);
  const totalExpensesThisMonth = useMemo(
    () => expensesThisMonth.reduce((sum, expense) => sum + expense.amount, 0),
    [expensesThisMonth],
  );
  const expensesByCategory = useMemo(() => {
    const totals = new Map<ExpenseCategory, number>();
    for (const expense of expensesThisMonth) {
      totals.set(expense.category, (totals.get(expense.category) ?? 0) + expense.amount);
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  }, [expensesThisMonth]);
  const recentActivities = useMemo(
    () => [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [activities],
  );
  const recentExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [expenses],
  );

  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' });
  const today = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const stats = [
    { label: 'Propriedades', value: formatNumber(properties.length), href: '/propriedades' },
    { label: 'Culturas ativas', value: formatNumber(activeCrops.length), href: '/culturas' },
    { label: 'Atividades registradas', value: formatNumber(activities.length), href: '/atividades' },
    { label: 'Estoque baixo', value: formatNumber(lowStockItems.length), href: '/estoque', alert: lowStockItems.length > 0 },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">
          {greeting(now.getHours())}, {user.name.split(' ')[0]}
        </h1>
        <p className="mt-1.5 text-muted first-letter:uppercase">{today}</p>
      </div>

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-[1.7fr_1fr_1fr_1fr_1fr]">
            <Link
              href="/despesas"
              className="col-span-2 bg-surface p-5 transition-colors hover:bg-surface-2 lg:col-span-1"
            >
              <p className="text-sm text-muted">Despesas de {monthName}</p>
              <p className="mt-1 font-display text-4xl font-bold tabular-nums text-ink">
                {formatCurrency(totalExpensesThisMonth)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {expensesThisMonth.length === 1 ? '1 lançamento' : `${expensesThisMonth.length} lançamentos`} no mês
              </p>
            </Link>

            {stats.map((stat) => (
              <Link key={stat.label} href={stat.href} className="bg-surface p-5 transition-colors hover:bg-surface-2">
                <p className="text-sm text-muted">{stat.label}</p>
                <p
                  className={`mt-1 font-display text-3xl font-bold tabular-nums ${stat.alert ? 'text-danger' : 'text-ink'}`}
                >
                  {stat.value}
                </p>
              </Link>
            ))}
          </div>

          {properties.length === 0 ? (
            <EmptyState
              icon="property"
              title="Comece pela sua primeira propriedade"
              description="Culturas, atividades, estoque e despesas ficam ligados a uma propriedade. Cadastre a primeira e o dashboard passa a mostrar seus números."
              action={
                <Link href="/propriedades" className="btn btn-primary">
                  Cadastrar propriedade
                </Link>
              }
            />
          ) : (
            <>
              {lowStockItems.length > 0 && (
                <section className="rounded-xl border border-warn/30 bg-warn-soft">
                  <div className="flex items-center justify-between px-5 py-3.5">
                    <h2 className="flex items-center gap-2 text-base font-semibold text-warn">
                      <Icon name="alert" className="size-[18px]" />
                      Estoque para repor
                    </h2>
                    <Link href="/estoque" className="text-sm font-medium text-warn hover:underline">
                      Ver estoque
                    </Link>
                  </div>
                  <ul className="divide-y divide-warn/20 border-t border-warn/20">
                    {lowStockItems.map((item) => (
                      <li key={item.id} className="flex flex-wrap items-center justify-between gap-x-4 px-5 py-3 text-sm">
                        <span className="text-ink">
                          <span className="font-semibold">{item.name}</span>
                          <span className="ml-2 text-muted">{propertyNameById.get(item.propertyId) ?? '—'}</span>
                        </span>
                        <span className="font-semibold tabular-nums text-danger">
                          {formatNumber(item.quantity)} {item.unit}
                          <span className="ml-2 font-normal text-muted">
                            mínimo {formatNumber(item.minimumQuantity)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="grid items-start gap-6 lg:grid-cols-2">
                <Panel title="Últimas atividades" href="/atividades">
                  {recentActivities.length === 0 ? (
                    <EmptyLine>Nenhuma atividade registrada ainda.</EmptyLine>
                  ) : (
                    <ul className="divide-y divide-line">
                      {recentActivities.map((activity) => (
                        <li key={activity.id} className="px-5 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-medium text-ink">{activity.title}</p>
                            <Badge>{activity.category}</Badge>
                          </div>
                          <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
                            <span className="tabular-nums">{formatDate(activity.date)}</span>
                            <span>{propertyNameById.get(activity.propertyId) ?? '—'}</span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>

                <div className="grid gap-6">
                  <Panel title={`Gastos de ${monthName} por categoria`}>
                    {expensesByCategory.length === 0 ? (
                      <EmptyLine>Nenhuma despesa lançada neste mês.</EmptyLine>
                    ) : (
                      <ul className="grid gap-4 px-5 py-4">
                        {expensesByCategory.map(([category, amount]) => (
                          <li key={category}>
                            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                              <span className="font-medium text-ink">{EXPENSE_CATEGORY_LABELS[category]}</span>
                              <span className="tabular-nums text-muted">{formatCurrency(amount)}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-line">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${Math.max((amount / totalExpensesThisMonth) * 100, 2)}%` }}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Panel>

                  <Panel title="Últimas despesas" href="/despesas">
                    {recentExpenses.length === 0 ? (
                      <EmptyLine>Nenhuma despesa registrada ainda.</EmptyLine>
                    ) : (
                      <ul className="divide-y divide-line">
                        {recentExpenses.map((expense) => (
                          <li key={expense.id} className="flex items-start justify-between gap-3 px-5 py-3">
                            <div>
                              <p className="font-medium text-ink">{expense.description}</p>
                              <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
                                <span className="tabular-nums">{formatDate(expense.date)}</span>
                                <span>{EXPENSE_CATEGORY_LABELS[expense.category]}</span>
                              </p>
                            </div>
                            <span className="font-semibold tabular-nums text-ink">{formatCurrency(expense.amount)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Panel>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
