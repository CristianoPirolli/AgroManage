'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-500">Carregando…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-4 text-center dark:bg-black">
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">AgroManage</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Gerencie propriedades, culturas, atividades, estoque e despesas da sua propriedade rural em um só lugar.
      </p>

      {user ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-zinc-700 dark:text-zinc-300">
            Bem-vindo, <strong>{user.name}</strong>.
          </p>
          <div className="flex gap-3">
            <Link
              href="/propriedades"
              className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
            >
              Propriedades
            </Link>
            <Link
              href="/culturas"
              className="rounded-md border border-emerald-700 px-5 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950"
            >
              Culturas
            </Link>
            <button
              onClick={logout}
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Sair
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Link
            href="/login"
            className="rounded-md bg-emerald-700 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-md border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Cadastrar
          </Link>
        </div>
      )}
    </div>
  );
}
