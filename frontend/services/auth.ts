import { api } from './api';
import type { AuthResponse, AuthUser } from '@/types/auth';

export { getToken, setToken, clearToken } from './token';

export function register(data: { name: string; email: string; password: string }) {
  return api<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function login(data: { email: string; password: string }) {
  return api<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function me() {
  return api<AuthUser>('/auth/me');
}
