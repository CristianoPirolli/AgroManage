'use client';

import type { ReactNode } from 'react';
import { AppShell } from '@/components/AppShell';
import { PageSpinner } from '@/components/ui/Feedback';
import { useAuth } from '@/hooks/useAuth';
import { UserProvider } from '@/hooks/useCurrentUser';

// Uma única checagem de sessão para todas as telas internas; o menu lateral
// permanece montado enquanto o usuário navega entre elas.
export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth({ redirectToLogin: true });

  if (loading || !user) return <PageSpinner />;

  return (
    <UserProvider value={user}>
      <AppShell user={user} onLogout={logout}>
        {children}
      </AppShell>
    </UserProvider>
  );
}
