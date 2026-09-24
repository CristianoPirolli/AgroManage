'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

// Quem já está logado não precisa ver a página de apresentação.
export function RedirectIfAuthenticated() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user, router]);

  return null;
}
