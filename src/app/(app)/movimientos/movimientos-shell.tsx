"use client";

import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState, useTransition, type ReactNode } from "react";
import { Segmented } from "@/components/app/Segmented";
import { addMonths, monthLabel } from "@/lib/dates";

export type Params = { ym: string; tipo: "" | "income" | "expense"; cta: string; cat: string };
type Account = { id: string; name: string };
type Category = { id: string; name: string; type: "income" | "expense"; icon: string | null };

const TIPOS = [
  { value: "all", label: "Todos" },
  { value: "expense", label: "Gastos" },
  { value: "income", label: "Ingresos" },
] as const;

function buildUrl(p: Params) {
  const q = new URLSearchParams({ m: p.ym });
  if (p.tipo) q.set("tipo", p.tipo);
  if (p.cta) q.set("cta", p.cta);
  if (p.cat) q.set("cat", p.cat);
  return `/movimientos?${q.toString()}`;
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function OptionChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`press inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium ${
        active
          ? "border-primary bg-primary text-primary-contrast shadow-[0_8px_20px_-10px_var(--primary)]"
          : "border-border bg-surface hover:-translate-y-px hover:border-primary/50 hover:bg-surface-2"
      }`}
    >
      {active && <Check />}
      {children}
    </button>
  );
}

function ListSkeleton() {
  return (
    <div className="fade-in flex flex-col gap-3 [animation-delay:120ms]" aria-busy="true" aria-label="Cargando movimientos">
      <div className="grid grid-cols-2 gap-3">
        <div className="skeleton h-16 rounded-2xl" />
        <div className="skeleton h-16 rounded-2xl" />
      </div>
      <div className="skeleton h-4 w-16 rounded-md" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton h-[68px] rounded-2xl" />
      ))}
    </div>
  );
}

export function MovimientosShell({
  params,
  accounts,
  categories,
  children,
}: {
  params: Params;
  accounts: Account[];
  categories: Category[];
  children: ReactNode;
}) {
  const router = useRouter();
  const [opt, setOpt] = useOptimistic(params);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  function navigate(partial: Partial<Params>) {
    const next = { ...opt, ...partial };
    // Si la categoría elegida no pertenece al tipo seleccionado, se descarta.
    if (next.tipo && next.cat && categories.find((c) => c.id === next.cat)?.type !== next.tipo) next.cat = "";
    startTransition(() => {
      setOpt(next); // el estado seleccionado cambia al instante
      router.push(buildUrl(next), { scroll: false });
    });
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const count = (opt.cta ? 1 : 0) + (opt.cat ? 1 : 0);
  const activeAccount = accounts.find((a) => a.id === opt.cta);
  const activeCategory = categories.find((c) => c.id === opt.cat);
  const visibleCats = categories.filter((c) => !opt.tipo || c.type === opt.tipo);
  const groups = (["expense", "income"] as const)
    .filter((t) => !opt.tipo || opt.tipo === t)
    .map((t) => ({ type: t, label: t === "expense" ? "Gastos" : "Ingresos", items: visibleCats.filter((c) => c.type === t) }));

  return (
    <main className="flex flex-col gap-4 px-4 py-8 md:mx-auto md:w-full md:max-w-3xl md:px-8">
      <header className="flex items-center justify-between">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => navigate({ ym: addMonths(opt.ym, -1) })}
          className="press grid h-11 w-11 place-items-center rounded-full text-xl hover:bg-surface-2"
        >
          ‹
        </button>
        <h1 className="font-display text-xl font-semibold capitalize">{monthLabel(opt.ym)}</h1>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => navigate({ ym: addMonths(opt.ym, 1) })}
          className="press grid h-11 w-11 place-items-center rounded-full text-xl hover:bg-surface-2"
        >
          ›
        </button>
      </header>

      <div className="relative flex items-center gap-2">
        <Segmented
          label="Tipo de movimiento"
          className="flex-1"
          options={[...TIPOS]}
          value={opt.tipo || "all"}
          onChange={(v) => navigate({ tipo: v === "all" ? "" : v })}
        />
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={`press relative flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${
            open || count > 0 ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-surface hover:border-primary/50"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
            <circle cx="16" cy="7" r="2" />
            <circle cx="8" cy="17" r="2" />
          </svg>
          <span className="hidden sm:inline">Filtros</span>
          {count > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-contrast">
              {count}
            </span>
          )}
        </button>

        {/* Fondo: oscurece en móvil; en escritorio solo captura el clic para cerrar */}
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 md:bg-transparent md:backdrop-blur-none ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        {/* Hoja inferior en móvil, panel anclado al botón en escritorio */}
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Filtros"
          tabIndex={-1}
          inert={!open}
          data-open={open}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[82dvh] translate-y-full overflow-y-auto rounded-t-3xl border border-border bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl outline-none transition-[transform,opacity,visibility] duration-300 ease-[var(--ease-drawer)] invisible data-[open=true]:visible data-[open=true]:translate-y-0 md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-[calc(100%+0.5rem)] md:max-h-[70dvh] md:w-[28rem] md:origin-top-right md:translate-y-0 md:scale-95 md:rounded-2xl md:pb-5 md:opacity-0 md:data-[open=true]:scale-100 md:data-[open=true]:opacity-100"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Filtros</h2>
            <div className="flex items-center gap-1">
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => navigate({ cta: "", cat: "" })}
                  className="press rounded-full px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  Limpiar
                </button>
              )}
              <button
                type="button"
                aria-label="Cerrar filtros"
                onClick={() => setOpen(false)}
                className="press grid h-10 w-10 place-items-center rounded-full hover:bg-surface-2 md:hidden"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          <section className="mb-5">
            <h3 className="mb-2 text-sm font-semibold text-muted">Medio de pago</h3>
            <div className="flex flex-wrap gap-2">
              {accounts.map((a) => (
                <OptionChip key={a.id} active={opt.cta === a.id} onClick={() => navigate({ cta: opt.cta === a.id ? "" : a.id })}>
                  {a.name}
                </OptionChip>
              ))}
            </div>
          </section>

          {groups.map((g) => (
            <section key={g.type} className="mb-5">
              <h3 className="mb-2 text-sm font-semibold text-muted">Categorías de {g.label.toLowerCase()}</h3>
              <div className="flex flex-wrap gap-2">
                {g.items.map((c) => (
                  <OptionChip key={c.id} active={opt.cat === c.id} onClick={() => navigate({ cat: opt.cat === c.id ? "" : c.id })}>
                    <span aria-hidden>{c.icon}</span>
                    {c.name}
                  </OptionChip>
                ))}
              </div>
            </section>
          ))}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="press w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-contrast hover:brightness-110"
          >
            Listo
          </button>
        </div>
      </div>

      {(activeAccount || activeCategory) && (
        <div className="flex flex-wrap gap-2">
          {activeAccount && (
            <button
              type="button"
              onClick={() => navigate({ cta: "" })}
              className="press page-enter inline-flex h-9 items-center gap-1.5 rounded-full bg-primary/12 pl-3.5 pr-2.5 text-sm font-medium text-primary hover:bg-primary/20"
            >
              {activeAccount.name}
              <span aria-hidden className="text-base leading-none">×</span>
              <span className="sr-only">Quitar filtro</span>
            </button>
          )}
          {activeCategory && (
            <button
              type="button"
              onClick={() => navigate({ cat: "" })}
              className="press page-enter inline-flex h-9 items-center gap-1.5 rounded-full bg-primary/12 pl-3.5 pr-2.5 text-sm font-medium text-primary hover:bg-primary/20"
            >
              <span aria-hidden>{activeCategory.icon}</span>
              {activeCategory.name}
              <span aria-hidden className="text-base leading-none">×</span>
              <span className="sr-only">Quitar filtro</span>
            </button>
          )}
        </div>
      )}

      {/* La llave cambia cuando llegan datos nuevos: la lista vuelve a entrar con animación */}
      <div key={buildUrl(params)} className="stagger flex flex-col gap-4">
        {pending ? <ListSkeleton /> : children}
      </div>
    </main>
  );
}
