import Link from "next/link";
import { formatPEN } from "@/lib/money";
import type { TxRow } from "@/lib/data/context";

export function TxItem({ tx, note }: { tx: TxRow; note?: string }) {
  const isIncome = tx.type === "income";
  const color = tx.categories?.color ?? "#9A96B5";

  return (
    <Link
      href={`/movimientos/${tx.id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 card hover:bg-surface-2"
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ backgroundColor: `${color}26` }}
        aria-hidden
      >
        {tx.categories?.icon ?? (isIncome ? "➕" : "💸")}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{tx.categories?.name ?? "Sin categoría"}</span>
        <span className="block truncate text-xs text-muted">
          {tx.accounts?.name}
          {note ? ` · ${note}` : ""}
        </span>
      </span>
      <span className={`shrink-0 font-semibold tabular ${isIncome ? "text-success" : ""}`}>
        {isIncome ? "+" : "−"}
        {formatPEN(Number(tx.amount))}
      </span>
    </Link>
  );
}
