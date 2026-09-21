import { api } from './api';
import type { Property, PropertyInput } from '@/types/property';

export function listProperties() {
  return api<Property[]>('/properties');
}

export function createProperty(data: PropertyInput) {
  return api<Property>('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateProperty(id: number, data: Partial<PropertyInput>) {
  return api<Property>(`/properties/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteProperty(id: number) {
  return api<{ id: number }>(`/properties/${id}`, { method: 'DELETE' });
}
