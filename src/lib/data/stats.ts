import type { TxRow } from "@/lib/data/context";
import { addDays, monthShort, weekdayShort } from "@/lib/dates";
import { round2 } from "@/lib/money";

export const total = (rows: TxRow[], type: "income" | "expense") =>
  round2(rows.filter((r) => r.type === type).reduce((s, r) => s + Number(r.amount), 0));

export type Slice = { name: string; icon: string; color: string; value: number };

export function byCategory(rows: TxRow[], type: "income" | "expense"): Slice[] {
  const map = new Map<string, Slice>();
  for (const r of rows) {
    if (r.type !== type) continue;
    const name = r.categories?.name ?? "Sin categoría";
    const cur = map.get(name) ?? {
      name,
      icon: r.categories?.icon ?? "•",
      color: r.categories?.color ?? "#9A96B5",
      value: 0,
    };
    cur.value = round2(cur.value + Number(r.amount));
    map.set(name, cur);
  }
  return [...map.values()].sort((a, b) => b.value - a.value);
}

export function byAccount(rows: TxRow[], type: "income" | "expense") {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (r.type !== type) continue;
    const name = r.accounts?.name ?? "—";
    map.set(name, round2((map.get(name) ?? 0) + Number(r.amount)));
  }
  return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export type Bar = { label: string; value: number; highlight?: boolean };

/** Gasto por día para los `n` días que terminan en `end`. */
export function dailyExpense(rows: TxRow[], end: string, n: number, labelFn = weekdayShort): Bar[] {
  const out: Bar[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = addDays(end, -i);
    const value = rows
      .filter((r) => r.type === "expense" && r.occurred_on === d)
      .reduce((s, r) => s + Number(r.amount), 0);
    out.push({ label: labelFn(d), value: round2(value), highlight: i === 0 });
  }
  return out;
}

/** Gasto por mes del año de `today`. */
export function monthlyExpense(rows: TxRow[], today: string): Bar[] {
  const year = today.slice(0, 4);
  return Array.from({ length: 12 }, (_, i) => {
    const ym = `${year}-${String(i + 1).padStart(2, "0")}`;
    const value = rows
      .filter((r) => r.type === "expense" && r.occurred_on.startsWith(ym))
      .reduce((s, r) => s + Number(r.amount), 0);
    return {
      label: monthShort(`${ym}-01`).replace(".", "").slice(0, 3),
      value: round2(value),
      highlight: ym === today.slice(0, 7),
    };
  });
}
