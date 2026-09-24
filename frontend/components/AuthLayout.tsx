import Link from 'next/link';
import type { ReactNode } from 'react';
import { Contours } from '@/components/ui/Contours';
import { Logo } from '@/components/ui/Logo';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthLayout({ title, subtitle, footer, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh flex-1 lg:grid-cols-[5fr_6fr]">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-forest px-6 py-6 text-white lg:p-12">
        <Contours className="absolute inset-0 h-full w-full text-wheat/25" />
        <Link href="/" className="relative w-fit" aria-label="AgroManage, página inicial">
          <Logo />
        </Link>
        <p className="relative hidden max-w-sm font-display text-3xl font-semibold leading-tight lg:block">
          O que foi plantado, o que foi feito no campo e quanto custou. Tudo no mesmo lugar.
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-10 sm:py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-bold text-ink">{title}</h1>
          <p className="mb-8 mt-2 text-muted">{subtitle}</p>
          {children}
          <p className="mt-8 text-sm text-muted">{footer}</p>
        </div>
      </main>
    </div>
  );
}
