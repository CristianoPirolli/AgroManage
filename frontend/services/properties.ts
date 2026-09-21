import { api } from './api';
import { getToken } from './auth';
import type { Property, PropertyInput } from '@/types/property';

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function listProperties() {
  return api<Property[]>('/properties', { headers: authHeaders() });
}

export function createProperty(data: PropertyInput) {
  return api<Property>('/properties', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export function updateProperty(id: number, data: Partial<PropertyInput>) {
  return api<Property>(`/properties/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
}

export function deleteProperty(id: number) {
  return api<{ id: number }>(`/properties/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
