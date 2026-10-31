import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/PageSkeleton";
import { getCatalog, TX_SELECT, type TxRow } from "@/lib/data/context";
import { decryptText } from "@/lib/crypto";
import { dayLabel, isMonth, monthEnd, todayLima } from "@/lib/dates";
import { formatPEN } from "@/lib/money";
import { TxItem } from "@/components/app/TxItem";
import { MovimientosShell, type Params } from "./movimientos-shell";

// La página depende de la sesión del usuario: se renderiza en cada petición.
export const instant = false;

type SP = { m?: string; tipo?: string; cat?: string; cta?: string };

const uuid = (s?: string) => (s && /^[0-9a-f-]{36}$/i.test(s) ? s : undefined);

export default function MovimientosPage({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MovimientosContent searchParams={searchParams} />
    </Suspense>
  );
}

async function MovimientosContent({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { supabase, accounts, categories } = await getCatalog();

  const today = todayLima();
  const ym = sp.m && isMonth(sp.m) ? sp.m : today.slice(0, 7);
  const tipo = sp.tipo === "income" || sp.tipo === "expense" ? sp.tipo : undefined;
  const cat = uuid(sp.cat);
  const cta = uuid(sp.cta);

  let q = supabase
    .from("transactions")
    .select(TX_SELECT)
    .gte("occurred_on", `${ym}-01`)
    .lte("occurred_on", monthEnd(`${ym}-01`))
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (tipo) q = q.eq("type", tipo);
  if (cat) q = q.eq("category_id", cat);
  if (cta) q = q.eq("account_id", cta);

  const { data } = await q;
  const rows = (data ?? []) as unknown as TxRow[];

  const income = rows.filter((r) => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
  const expense = rows.filter((r) => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);

  const groups = new Map<string, TxRow[]>();
  for (const r of rows) groups.set(r.occurred_on, [...(groups.get(r.occurred_on) ?? []), r]);

  const params: Params = { ym, tipo: tipo ?? "", cta: cta ?? "", cat: cat ?? "" };

  return (
    <MovimientosShell
      params={params}
      accounts={accounts.map((a) => ({ id: a.id, name: a.name }))}
      categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type, icon: c.icon }))}
    >
      <section className="grid grid-cols-2 gap-3">
        <div className="card rounded-2xl border border-border bg-surface p-3">
          <p className="text-xs text-muted">Ingresos</p>
          <p className="tabular font-semibold text-success">{formatPEN(income)}</p>
        </div>
        <div className="card rounded-2xl border border-border bg-surface p-3">
          <p className="text-xs text-muted">Gastos</p>
          <p className="tabular font-semibold">{formatPEN(expense)}</p>
        </div>
      </section>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
          No hay movimientos con estos filtros. Prueba quitar alguno o usa el botón + para agregar uno.
        </p>
      ) : (
        [...groups.entries()].map(([day, items]) => (
          <section key={day} className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold capitalize text-muted">{dayLabel(day, today)}</h2>
            {items.map((tx) => (
              <TxItem key={tx.id} tx={tx} note={decryptText(tx.note_enc)} />
            ))}
          </section>
        ))
      )}
    </MovimientosShell>
  );
}
