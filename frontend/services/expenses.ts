import { api } from './api';
import type { Expense, ExpenseInput } from '@/types/expense';

export function listExpenses() {
  return api<Expense[]>('/expenses');
}

export function createExpense(data: ExpenseInput) {
  return api<Expense>('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateExpense(id: number, data: Partial<ExpenseInput>) {
  return api<Expense>(`/expenses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteExpense(id: number) {
  return api<{ id: number }>(`/expenses/${id}`, { method: 'DELETE' });
}
