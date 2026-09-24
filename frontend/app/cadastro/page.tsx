'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/AuthLayout';
import { ErrorAlert } from '@/components/ui/Feedback';
import { Field } from '@/components/ui/Form';
import { register, setToken } from '@/services/auth';

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken } = await register({ name, email, password });
      setToken(accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Cadastre-se para gerenciar suas propriedades no AgroManage."
      footer={
        <>
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold text-link hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-4">
        <Field label="Nome" htmlFor="name">
          <input
            id="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="E-mail" htmlFor="email">
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </Field>

        <Field label="Senha" htmlFor="password" hint="Mínimo de 8 caracteres.">
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </Field>

        {error && <ErrorAlert message={error} />}

        <button type="submit" disabled={loading} className="btn btn-primary mt-1 w-full py-2.5">
          {loading ? 'Cadastrando…' : 'Criar conta'}
        </button>
      </form>
    </AuthLayout>
  );
}
