import { Suspense } from "react";
import Link from "next/link";
import { PageSkeleton } from "@/components/app/PageSkeleton";
import { getCatalog, TX_SELECT, type TxRow } from "@/lib/data/context";
import { decryptText } from "@/lib/crypto";
import { addDays, monthStart, todayLima } from "@/lib/dates";
import { formatPEN, round2 } from "@/lib/money";
import { byCategory, dailyExpense, total } from "@/lib/data/stats";
import { BarsChart } from "@/components/charts/BarsChart";
import { TxItem } from "@/components/app/TxItem";

// La página depende de la sesión del usuario: se renderiza en cada petición.
export const instant = false;

export default function InicioPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <InicioContent />
    </Suspense>
  );
}

async function InicioContent() {
  const { supabase, user, accounts } = await getCatalog();
  const today = todayLima();
  const since = [monthStart(today), addDays(today, -6)].sort()[0];

  const [{ data: profile }, { data: all }, { data: recent }] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).single(),
    supabase.from("transactions").select("type,amount"),
    supabase
      .from("transactions")
      .select(TX_SELECT)
      .gte("occurred_on", since)
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const rows = (recent ?? []) as unknown as TxRow[];
  const monthRows = rows.filter((r) => r.occurred_on >= monthStart(today));

  const initial = accounts.reduce((s, a) => s + Number(a.initial_balance), 0);
  const delta = (all ?? []).reduce(
    (s, r) => s + (r.type === "income" ? Number(r.amount) : r.type === "expense" ? -Number(r.amount) : 0),
    0,
  );
  const balance = round2(initial + delta);
  const income = total(monthRows, "income");
  const expense = total(monthRows, "expense");
  const top = byCategory(monthRows, "expense")[0];

  return (
    <main className="stagger flex flex-col gap-5 px-4 py-8 md:px-8">
      <header>
        <p className="text-sm text-muted">Hola,</p>
        <h1 className="font-display text-2xl font-semibold">{profile?.display_name ?? "bienvenido"}</h1>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="flex flex-col gap-5">
      <section className="sheen card rounded-card bg-gradient-to-br from-primary to-[#3b2fa0] p-5 text-white shadow-lg">
        <p className="text-sm opacity-80">Saldo total</p>
        <p className="font-display text-4xl font-semibold">{formatPEN(balance)}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-white/15 p-3">
            <p className="opacity-80">Ingresos del mes</p>
            <p className="font-semibold">{formatPEN(income)}</p>
          </div>
          <div className="rounded-xl bg-white/15 p-3">
            <p className="opacity-80">Gastos del mes</p>
            <p className="font-semibold">{formatPEN(expense)}</p>
          </div>
        </div>
      </section>

      <section className="card rounded-card border border-border bg-surface p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-semibold">Últimos 7 días</h2>
          <span className="text-xs text-muted">Gastos</span>
        </div>
        <BarsChart data={dailyExpense(rows, today, 7)} />
        {top && (
          <p className="mt-2 text-sm text-muted">
            Tu mayor gasto del mes: <span className="font-semibold text-text">{top.icon} {top.name}</span> ({formatPEN(top.value)})
          </p>
        )}
      </section>
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Actividad reciente</h2>
          <Link href="/movimientos" className="press text-sm font-semibold text-primary hover:underline">
            Ver todo
          </Link>
        </div>
        {rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Aún no registras movimientos. Toca el botón + para empezar.
          </p>
        ) : (
          rows.slice(0, 5).map((tx) => <TxItem key={tx.id} tx={tx} note={decryptText(tx.note_enc)} />)
        )}
      </section>
      </div>
    </main>
  );
}
