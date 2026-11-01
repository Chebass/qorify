/** Wordmark de Qorify. "Qori" = oro en quechua: de ahí el degradado dorado. */
export function Brand({ tagline }: { tagline: string }) {
  return (
    <header className="mb-4 text-center">
      <h1
        className="font-display text-[2.6rem] font-bold leading-none tracking-[-0.03em] bg-gradient-to-br from-[#f7d774] via-[#e9a93b] to-[#b8741a] bg-clip-text text-transparent [filter:drop-shadow(0_2px_6px_rgb(10_8_36/0.35))]"
        aria-label="Qorify"
      >
        Qorify
      </h1>
      <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-text/75">{tagline}</p>
    </header>
  );
}

/** Tarjeta compacta y translúcida: deja ver el paisaje de fondo. */
export function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-enter rounded-3xl border border-white/25 bg-surface/50 p-5 shadow-[0_24px_48px_-24px_rgb(10_8_36/0.55)] backdrop-blur-md [animation-delay:200ms]">
      {children}
    </div>
  );
}
