"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "./useScrollLock";
import { addDays, addMonths, monthLabel } from "@/lib/dates";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

const noop = () => () => {};
const mounted = () => true;
// "Hoy" en la zona horaria del dispositivo (el servidor puede estar en otra).
const deviceToday = () => new Date().toLocaleDateString("en-CA");

function monthCells(ym: string): (string | null)[] {
  const [y, m] = ym.split("-").map(Number);
  const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7; // semana desde lunes
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => `${ym}-${String(i + 1).padStart(2, "0")}`)];
}

function format(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("es-PE", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function relative(d: string, today: string) {
  if (!today) return null;
  if (d === today) return "Hoy";
  if (d === addDays(today, -1)) return "Ayer";
  if (d === addDays(today, 1)) return "Mañana";
  return null;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={dir === "left" ? "M14.5 6l-6 6 6 6" : "M9.5 6l6 6-6 6"} />
    </svg>
  );
}

export function DatePicker({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  const today = useSyncExternalStore(noop, deviceToday, () => "");
  const [picked, setPicked] = useState<string | null>(null);
  const value = picked ?? defaultValue ?? today;

  const [open, setOpen] = useState(false);
  const canPortal = useSyncExternalStore(noop, mounted, () => false);
  useScrollLock(open);
  const [view, setView] = useState("");
  const [focusDay, setFocusDay] = useState("");
  const [dir, setDir] = useState<"next" | "prev">("next");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function show() {
    const base = value || today;
    setView(base.slice(0, 7));
    setFocusDay(base);
    setOpen(true);
  }

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function choose(d: string) {
    setPicked(d);
    close();
  }

  function shiftMonth(n: number) {
    setDir(n > 0 ? "next" : "prev");
    const next = addMonths(view, n);
    setView(next);
    setFocusDay(`${next}-01`);
  }

  function moveFocus(d: string) {
    setDir(d.slice(0, 7) > view ? "next" : "prev");
    setFocusDay(d);
    setView(d.slice(0, 7));
  }

  function onGridKey(e: React.KeyboardEvent) {
    const step: Record<string, () => string> = {
      ArrowLeft: () => addDays(focusDay, -1),
      ArrowRight: () => addDays(focusDay, 1),
      ArrowUp: () => addDays(focusDay, -7),
      ArrowDown: () => addDays(focusDay, 7),
      PageUp: () => `${addMonths(focusDay.slice(0, 7), -1)}-${focusDay.slice(8)}`,
      PageDown: () => `${addMonths(focusDay.slice(0, 7), 1)}-${focusDay.slice(8)}`,
    };
    const next = step[e.key]?.();
    if (!next) return;
    e.preventDefault();
    moveFocus(next);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Mantiene el foco sobre el día activo al navegar con el teclado.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focusDay}"]`)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [open, focusDay, view]);

  const rel = value ? relative(value, today) : null;
  const yesterday = today ? addDays(today, -1) : "";

  return (
    <div className="relative">
      <input type="hidden" name={name} value={value} />
      <span id={`${name}-label`} className="mb-1.5 block text-sm font-medium">
        {label}
      </span>

      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${name}-label ${name}-value`}
        onClick={() => (open ? close(false) : show())}
        className={`press flex min-h-14 w-full items-center gap-3 rounded-2xl border bg-surface px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          open ? "border-primary ring-2 ring-primary/25" : "border-border hover:border-primary/50"
        }`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5zM4 10h16M8 3v4M16 3v4" />
          </svg>
        </span>
        <span id={`${name}-value`} className="min-w-0 flex-1 truncate first-letter:uppercase">
          {value ? format(value) : "Elegir fecha"}
        </span>
        {rel && <span className="shrink-0 rounded-full bg-primary/12 px-2.5 py-0.5 text-xs font-semibold text-primary">{rel}</span>}
      </button>

      {canPortal &&
        // En un portal para que `fixed` se ancle a la pantalla y no a un ancestro con transform (animaciones).
        createPortal(
          <>
            <div
              aria-hidden
              onClick={() => close(false)}
              className={`fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 ${
                open ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            />

            <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center md:items-center">
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={label}
                inert={!open}
                data-open={open}
                className="pointer-events-auto invisible max-h-[90dvh] w-full translate-y-full overflow-y-auto rounded-t-3xl border border-border bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl outline-none transition-[transform,opacity,visibility] duration-300 ease-[var(--ease-drawer)] data-[open=true]:visible data-[open=true]:translate-y-0 md:max-w-[21rem] md:translate-y-0 md:scale-95 md:rounded-2xl md:pb-5 md:opacity-0 md:data-[open=true]:scale-100 md:data-[open=true]:opacity-100"
              >
                <div className="mb-3 flex gap-2">
                  {[
                    { label: "Hoy", d: today },
                    { label: "Ayer", d: yesterday },
                  ].map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      disabled={!q.d}
                      aria-pressed={value === q.d}
                      onClick={() => choose(q.d)}
                      className={`press h-9 rounded-full border px-4 text-sm font-semibold ${
                        value === q.d
                          ? "border-primary bg-primary text-primary-contrast"
                          : "border-border hover:border-primary/50 hover:bg-surface-2"
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>

                <div className="mb-1 flex items-center justify-between">
                  <button
                    type="button"
                    aria-label="Mes anterior"
                    onClick={() => shiftMonth(-1)}
                    className="press grid h-10 w-10 place-items-center rounded-full hover:bg-surface-2"
                  >
                    <Chevron dir="left" />
                  </button>
                  <p aria-live="polite" className="font-display font-semibold first-letter:uppercase">
                    {view && monthLabel(view)}
                  </p>
                  <button
                    type="button"
                    aria-label="Mes siguiente"
                    onClick={() => shiftMonth(1)}
                    className="press grid h-10 w-10 place-items-center rounded-full hover:bg-surface-2"
                  >
                    <Chevron dir="right" />
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center text-xs font-semibold text-muted" aria-hidden>
                  {WEEKDAYS.map((w, i) => (
                    <span key={i} className="py-2">
                      {w}
                    </span>
                  ))}
                </div>

                <div
                  key={view}
                  role="grid"
                  aria-label={view && monthLabel(view)}
                  onKeyDown={onGridKey}
                  className={`grid grid-cols-7 gap-y-1 ${dir === "next" ? "cal-next" : "cal-prev"}`}
                >
                  {(view ? monthCells(view) : []).map((d, i) => {
                    if (!d) return <span key={`e${i}`} />;
                    const selected = d === value;
                    const isToday = d === today;
                    return (
                      <button
                        key={d}
                        type="button"
                        role="gridcell"
                        data-day={d}
                        tabIndex={d === focusDay ? 0 : -1}
                        aria-selected={selected}
                        aria-current={isToday ? "date" : undefined}
                        onClick={() => choose(d)}
                        className={`press mx-auto grid h-10 w-10 place-items-center rounded-full text-sm tabular outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                          selected
                            ? "bg-primary font-bold text-primary-contrast shadow-[0_8px_16px_-8px_var(--primary)]"
                            : isToday
                              ? "font-bold text-primary ring-1 ring-primary/50 hover:bg-primary/10"
                              : "hover:bg-surface-2"
                        }`}
                      >
                        {Number(d.slice(8))}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
