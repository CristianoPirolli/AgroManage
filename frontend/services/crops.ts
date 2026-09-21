import { api } from './api';
import type { Crop, CropInput } from '@/types/crop';

export function listCrops() {
  return api<Crop[]>('/crops');
}

export function createCrop(data: CropInput) {
  return api<Crop>('/crops', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateCrop(id: number, data: Partial<CropInput>) {
  return api<Crop>(`/crops/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteCrop(id: number) {
  return api<{ id: number }>(`/crops/${id}`, { method: 'DELETE' });
}
