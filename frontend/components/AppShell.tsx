'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import type { AuthUser } from '@/types/auth';

const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/propriedades', label: 'Propriedades', icon: 'property' },
  { href: '/culturas', label: 'Culturas', icon: 'crop' },
  { href: '/atividades', label: 'Atividades', icon: 'activity' },
  { href: '/estoque', label: 'Estoque', icon: 'stock' },
  { href: '/despesas', label: 'Despesas', icon: 'expense' },
];

type SidebarProps = {
  user: AuthUser;
  pathname: string;
  onNavigate: () => void;
  onLogout: () => void;
  onClose?: () => void;
};

function Sidebar({ user, pathname, onNavigate, onLogout, onClose }: SidebarProps) {
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-full flex-col border-r border-white/5 bg-forest text-white">
      <div className="flex items-center justify-between px-5 pb-7 pt-6">
        <Logo />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="icon-btn text-white/70 hover:bg-white/10 hover:text-white"
          >
            <Icon name="close" className="size-[18px]" />
          </button>
        )}
      </div>

      <nav aria-label="Principal" className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`}
            >
              {active && <span className="absolute inset-y-2 -left-3 w-1 rounded-r bg-wheat" />}
              <Icon name={item.icon} className="size-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-wheat text-sm font-bold text-[#1c2a22]">
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-white/60">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Sair"
          title="Sair"
          className="icon-btn text-white/70 hover:bg-white/10 hover:text-white"
        >
          <Icon name="logout" className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}

type AppShellProps = {
  user: AuthUser;
  onLogout: () => void;
  children: ReactNode;
};

export function AppShell({ user, onLogout, children }: AppShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="flex-1">
      <header className="sticky top-0 z-30 flex items-center justify-between bg-forest px-4 py-3 text-white lg:hidden">
        <Logo />
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className="icon-btn text-white/80 hover:bg-white/10 hover:text-white"
        >
          <Icon name="menu" />
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 animate-fade bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-slide">
            <Sidebar
              user={user}
              pathname={pathname}
              onNavigate={() => setMenuOpen(false)}
              onLogout={onLogout}
              onClose={() => setMenuOpen(false)}
            />
          </div>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar user={user} pathname={pathname} onNavigate={() => {}} onLogout={onLogout} />
      </aside>

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
