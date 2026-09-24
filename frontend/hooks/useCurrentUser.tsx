'use client';

import { createContext, useContext } from 'react';
import type { AuthUser } from '@/types/auth';

const UserContext = createContext<AuthUser | null>(null);

export const UserProvider = UserContext.Provider;

export function useCurrentUser() {
  const user = useContext(UserContext);
  if (!user) throw new Error('useCurrentUser precisa estar dentro do layout autenticado');
  return user;
}
