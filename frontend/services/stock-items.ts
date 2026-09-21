import { api } from './api';
import type { StockItem, StockItemInput } from '@/types/stock-item';

export function listStockItems() {
  return api<StockItem[]>('/stock-items');
}

export function createStockItem(data: StockItemInput) {
  return api<StockItem>('/stock-items', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateStockItem(id: number, data: Partial<StockItemInput>) {
  return api<StockItem>(`/stock-items/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteStockItem(id: number) {
  return api<{ id: number }>(`/stock-items/${id}`, { method: 'DELETE' });
}
