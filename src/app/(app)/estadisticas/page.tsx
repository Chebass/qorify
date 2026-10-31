import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/PageSkeleton";
import { PeriodTabs } from "@/components/app/PeriodTabs";
import { getCatalog, TX_SELECT, type TxRow } from "@/lib/data/context";
import { addDays, monthStart, todayLima, yearStart } from "@/lib/dates";
import { formatPEN } from "@/lib/money";
import { byAccount, byCategory, dailyExpense, monthlyExpense, total } from "@/lib/data/stats";
import { BarsChart } from "@/components/charts/BarsChart";
import { DonutChart } from "@/components/charts/DonutChart";

// La página depende de la sesión del usuario: se renderiza en cada petición.
export const instant = false;

const PERIODS = [
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mes" },
  { key: "anio", label: "Año" },
] as const;

export default function EstadisticasPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EstadisticasContent searchParams={searchParams} />
    </Suspense>
  );
}

async function EstadisticasContent({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const period = PERIODS.find((x) => x.key === p)?.key ?? "mes";

  const { supabase } = await getCatalog();
  const today = todayLima();
  const from =
    period === "semana" ? addDays(today, -6) : period === "mes" ? monthStart(today) : yearStart(today);

  const { data } = await supabase
    .from("transactions")
    .select(TX_SELECT)
    .gte("occurred_on", from)
    .lte("occurred_on", today);
  const rows = (data ?? []) as unknown as TxRow[];

  const income = total(rows, "income");
  const expense = total(rows, "expense");
  const cats = byCategory(rows, "expense");
  const accs = byAccount(rows, "expense");
  const maxAcc = accs[0]?.value ?? 1;

  const bars =
    period === "semana"
      ? dailyExpense(rows, today, 7)
      : period === "mes"
        ? dailyExpense(rows, today, Number(today.slice(8)), (d) => String(Number(d.slice(8))))
        : monthlyExpense(rows, today);

  return (
    <main className="stagger flex flex-col gap-5 px-4 py-8 md:px-8">
      <h1 className="font-display text-2xl font-semibold">Estadísticas</h1>

      <Suspense fallback={<div className="skeleton h-11 rounded-full md:max-w-sm" />}>
        <PeriodTabs />
      </Suspense>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div className="card rounded-2xl border border-border bg-surface p-3">
          <p className="text-xs text-muted">Ingresos</p>
          <p className="font-semibold text-success">{formatPEN(income)}</p>
        </div>
        <div className="card rounded-2xl border border-border bg-surface p-3">
          <p className="text-xs text-muted">Gastos</p>
          <p className="font-semibold">{formatPEN(expense)}</p>
        </div>
        <div className="card col-span-2 rounded-2xl border border-border bg-surface p-3 md:col-span-1">
          <p className="text-xs text-muted">Balance del periodo</p>
          <p className={`font-semibold ${income - expense < 0 ? "text-danger" : "text-success"}`}>
            {formatPEN(income - expense)}
          </p>
        </div>
      </section>

      <section className="card rounded-card border border-border bg-surface p-4">
        <h2 className="mb-2 font-semibold">Gastos en el tiempo</h2>
        <BarsChart data={bars} />
      </section>

      <div className="grid items-start gap-5 md:grid-cols-2">
      <section className="card rounded-card border border-border bg-surface p-4">
        <h2 className="mb-2 font-semibold">Por categoría</h2>
        {cats.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Sin gastos en este periodo.</p>
        ) : (
          <>
            <DonutChart data={cats} label="Gastos" />
            <ul className="mt-3 flex flex-col gap-2">
              {cats.map((c) => (
                <li key={c.name} className="flex items-center gap-3 text-sm">
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="flex-1">{c.icon} {c.name}</span>
                  <span className="text-muted">{Math.round((c.value / expense) * 100)}%</span>
                  <span className="w-24 text-right font-semibold">{formatPEN(c.value)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section className="card rounded-card border border-border bg-surface p-4">
        <h2 className="mb-3 font-semibold">Por medio de pago</h2>
        {accs.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted">Sin gastos en este periodo.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {accs.map((a) => (
              <li key={a.name} className="text-sm">
                <div className="mb-1 flex justify-between">
                  <span>{a.name}</span>
                  <span className="font-semibold">{formatPEN(a.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.max(4, (a.value / maxAcc) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
    </main>
  );
}
