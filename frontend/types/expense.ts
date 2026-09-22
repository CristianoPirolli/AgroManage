export type ExpenseCategory = 'INSUMOS' | 'COMBUSTIVEL' | 'MANUTENCAO' | 'MAO_DE_OBRA' | 'MAQUINARIO' | 'OUTROS';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  INSUMOS: 'Insumos',
  COMBUSTIVEL: 'Combustível',
  MANUTENCAO: 'Manutenção',
  MAO_DE_OBRA: 'Mão de obra',
  MAQUINARIO: 'Maquinário',
  OUTROS: 'Outros',
};

export type Expense = {
  id: number;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  propertyId: number;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseInput = {
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  propertyId: number;
};
