"use client";

import { useEffect, useRef, useState } from "react";
import { monthLabel, monthShort, todayLima } from "@/lib/dates";

function Chevron({ dir, className = "h-5 w-5" }: { dir: "left" | "right" | "down"; className?: string }) {
  const d = { left: "M14.5 6l-6 6 6 6", right: "M9.5 6l6 6-6 6", down: "M6 9.5l6 6 6-6" }[dir];
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/** Título del mes que abre un selector rápido: año con flechas y cuadrícula de 12 meses. */
export function MonthPicker({ value, onChange }: { value: string; onChange: (ym: string) => void }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(Number(value.slice(0, 4)));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const now = todayLima().slice(0, 7);

  function toggle() {
    if (!open) setYear(Number(value.slice(0, 4)));
    setOpen((o) => !o);
  }

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const id = requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLButtonElement>("[aria-pressed='true']")?.focus({ preventScroll: true }),
    );
    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(id);
    };
  }, [open]);

  function pick(ym: string) {
    onChange(ym);
    close();
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className={`press flex h-12 items-center gap-2 rounded-full px-5 font-display text-xl font-semibold hover:bg-surface-2 ${open ? "bg-surface-2" : ""}`}
      >
        <span className="first-letter:uppercase">{monthLabel(value)}</span>
        <Chevron dir="down" className={`h-5 w-5 text-muted transition-transform duration-300 ease-[var(--ease-out)] ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 md:bg-transparent md:backdrop-blur-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-label="Elegir mes y año"
        inert={!open}
        data-open={open}
        className="invisible fixed inset-x-0 bottom-0 z-50 translate-y-full rounded-t-3xl border border-border bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl transition-[transform,opacity,visibility] duration-300 ease-[var(--ease-drawer)] data-[open=true]:visible data-[open=true]:translate-y-0 md:absolute md:inset-x-auto md:bottom-auto md:left-1/2 md:top-[calc(100%+0.5rem)] md:w-80 md:-translate-x-1/2 md:translate-y-0 md:scale-95 md:rounded-2xl md:pb-5 md:opacity-0 md:data-[open=true]:scale-100 md:data-[open=true]:opacity-100"
      >
        <div className="mb-3 flex items-center justify-between">
          <button type="button" aria-label="Año anterior" onClick={() => setYear((y) => y - 1)} className="press grid h-11 w-11 place-items-center rounded-full border border-border hover:bg-surface-2">
            <Chevron dir="left" />
          </button>
          <p aria-live="polite" className="font-display text-lg font-semibold tabular">{year}</p>
          <button type="button" aria-label="Año siguiente" onClick={() => setYear((y) => y + 1)} className="press grid h-11 w-11 place-items-center rounded-full border border-border hover:bg-surface-2">
            <Chevron dir="right" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 12 }, (_, i) => {
            const ym = `${year}-${String(i + 1).padStart(2, "0")}`;
            const selected = ym === value;
            const current = ym === now;
            return (
              <button
                key={ym}
                type="button"
                aria-pressed={selected}
                onClick={() => pick(ym)}
                className={`press h-12 rounded-xl text-sm font-semibold first-letter:uppercase ${
                  selected
                    ? "bg-primary text-primary-contrast shadow-[0_8px_16px_-8px_var(--primary)]"
                    : current
                      ? "text-primary ring-1 ring-primary/50 hover:bg-primary/10"
                      : "hover:bg-surface-2"
                }`}
              >
                {monthShort(`${ym}-01`).replace(".", "")}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => pick(now)}
          className="press mt-3 w-full rounded-xl border border-border py-3 text-sm font-semibold hover:bg-surface-2"
        >
          Ir a este mes
        </button>
      </div>
    </div>
  );
}
