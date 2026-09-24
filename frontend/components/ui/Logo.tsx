export function LogoMark({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="9" fill="#2c7a4b" />
      <g fill="none" stroke="#f2cf7a" strokeWidth="2" strokeLinecap="round">
        <path d="M6 23c6-3.5 14-3.5 20 0" />
        <path d="M6 17c6-3.5 14-3.5 20 0" />
        <path d="M6 11c6-3.5 14-3.5 20 0" />
      </g>
    </svg>
  );
}

// A cor do texto vem do contêiner (currentColor).
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-tight">AgroManage</span>
    </span>
  );
}
