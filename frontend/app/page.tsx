import Link from 'next/link';
import { RedirectIfAuthenticated } from '@/components/RedirectIfAuthenticated';
import { Contours } from '@/components/ui/Contours';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';

const FEATURES: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'property',
    title: 'Propriedades',
    text: 'Cadastre cada área que você administra, com localização e tamanho em hectares.',
  },
  {
    icon: 'crop',
    title: 'Culturas',
    text: 'Acompanhe o que está planejado, plantado, em crescimento e já colhido.',
  },
  {
    icon: 'activity',
    title: 'Atividades',
    text: 'Anote plantio, adubação, pulverização e colheita, com data e custo de cada serviço.',
  },
  {
    icon: 'stock',
    title: 'Estoque',
    text: 'Controle sementes, adubo, defensivos e combustível. O sistema avisa quando o saldo chega ao mínimo.',
  },
  {
    icon: 'expense',
    title: 'Despesas',
    text: 'Lance os gastos por categoria e veja quanto a propriedade gastou no mês.',
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <RedirectIfAuthenticated />

      <section className="relative overflow-hidden bg-forest text-white">
        <Contours className="absolute inset-0 h-full w-full text-wheat/25" />

        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo />
          <Link href="/login" className="btn btn-outline-light">
            Entrar
          </Link>
        </header>

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pb-32 sm:pt-24">
          <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] sm:text-6xl">
            Culturas, estoque e custos da fazenda, sem caderno e sem planilha.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/75">
            Registre o que foi plantado, o que foi feito no campo e quanto custou. O dashboard mostra o que precisa de
            atenção hoje.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/cadastro" className="btn btn-wheat px-6 py-3 text-base">
              Criar conta
            </Link>
            <Link href="/login" className="btn btn-outline-light px-6 py-3 text-base">
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[2fr_3fr]">
          <div>
            <h2 className="text-3xl font-bold text-ink">Tudo da propriedade no mesmo lugar</h2>
            <p className="mt-3 max-w-sm text-muted">
              Cada conta enxerga somente os próprios dados. Nada de misturar com a planilha do vizinho.
            </p>
          </div>

          <ul className="divide-y divide-line border-y border-line">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex gap-4 py-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-link">
                  <Icon name={feature.icon} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-0.5 text-muted">{feature.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="mt-auto border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-6 py-6 text-sm text-muted">
          <span>AgroManage</span>
          <span>Projeto da disciplina Programação IV, UNOESC. Time Semeando Bugs.</span>
        </div>
      </footer>
    </div>
  );
}
