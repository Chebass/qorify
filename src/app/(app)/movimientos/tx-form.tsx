"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { Account, Category } from "@/lib/data/context";
import type { TxFormState } from "./actions";
import { Segmented } from "@/components/app/Segmented";
import { DatePicker } from "@/components/app/DatePicker";
import { PAYMENT_COLORS, PaymentIcon } from "@/components/app/PaymentIcon";

type Initial = {
  type: "income" | "expense";
  amount: string;
  occurred_on: string;
  account_id: string;
  category_id: string;
  note: string;
};

type Props = {
  action: (prev: TxFormState, formData: FormData) => Promise<TxFormState>;
  accounts: Account[];
  categories: Category[];
  initial?: Initial;
  submitLabel: string;
};

const inputClass =
  "w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25";

/** Ficha seleccionable (radio nativo): icono teñido, marca de selección que aparece con resorte. */
function Tile({
  name, value, defaultChecked, color, icon, children,
}: {
  name: string; value: string; defaultChecked?: boolean; color: string;
  icon: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <label className="group cursor-pointer">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="press relative flex h-full flex-col items-center gap-2 rounded-2xl border border-border bg-surface px-2 pb-3 pt-3.5 text-center text-[13px] font-medium leading-tight hover:-translate-y-px hover:border-primary/45 peer-checked:border-primary peer-checked:bg-primary/[0.07] peer-checked:font-semibold peer-checked:shadow-[0_10px_24px_-14px_var(--primary)] peer-focus-visible:ring-2 peer-focus-visible:ring-primary/45 peer-checked:[&_.tile-icon]:scale-110 peer-checked:[&_.tile-check]:scale-100 peer-checked:[&_.tile-check]:opacity-100">
        <span
          className="tile-icon grid h-11 w-11 place-items-center rounded-xl text-xl transition-transform duration-300 ease-[var(--ease-spring)]"
          style={{ backgroundColor: `${color}26`, color }}
          aria-hidden
        >
          {icon}
        </span>
        <span className="line-clamp-2 break-words">{children}</span>
        <span
          aria-hidden
          className="tile-check absolute right-1.5 top-1.5 grid h-5 w-5 scale-50 place-items-center rounded-full bg-primary text-primary-contrast opacity-0 transition-[transform,opacity] duration-300 ease-[var(--ease-spring)]"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
      </span>
    </label>
  );
}

function Spinner() {
  return <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

export function TxForm({ action, accounts, categories, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [type, setType] = useState<"income" | "expense">(initial?.type ?? "expense");

  const cats = categories.filter((c) => c.type === type);
  const income = type === "income";

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="type" value={type} />
      <Segmented
        label="Tipo de movimiento"
        options={[
          { value: "expense", label: "Gasto" },
          { value: "income", label: "Ingreso" },
        ]}
        value={type}
        onChange={setType}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="amount" className="text-sm font-medium">
          Monto
        </label>
        <div
          className={`flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 transition focus-within:ring-2 ${
            income ? "focus-within:border-success focus-within:ring-success/25" : "focus-within:border-primary focus-within:ring-primary/25"
          }`}
        >
          <span className={`font-display text-2xl font-semibold transition-colors ${income ? "text-success" : "text-muted"}`}>S/</span>
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="0.00"
            defaultValue={initial?.amount}
            required
            autoFocus
            autoComplete="off"
            className="tabular min-w-0 flex-1 bg-transparent py-3.5 font-display text-4xl font-semibold outline-none placeholder:text-muted/50"
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-sm font-medium">Categoría</legend>
        <div key={type} className="stagger-fast grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          <Tile
            name="category_id"
            value=""
            defaultChecked={!initial?.category_id}
            color="#7d789a"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                <circle cx="12" cy="12" r="8" strokeDasharray="3 3.2" />
              </svg>
            }
          >
            Sin categoría
          </Tile>
          {cats.map((c) => (
            <Tile
              key={c.id}
              name="category_id"
              value={c.id}
              defaultChecked={initial?.category_id === c.id}
              color={c.color ?? "#7d789a"}
              icon={c.icon}
            >
              {c.name}
            </Tile>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-2.5 text-sm font-medium">Medio de pago</legend>
        <div className="grid grid-cols-2 gap-2.5 min-[420px]:grid-cols-4">
          {accounts.map((a, i) => (
            <Tile
              key={a.id}
              name="account_id"
              value={a.id}
              defaultChecked={initial ? initial.account_id === a.id : i === 0}
              color={PAYMENT_COLORS[a.kind] ?? PAYMENT_COLORS.other}
              icon={<PaymentIcon kind={a.kind} />}
            >
              {a.name}
            </Tile>
          ))}
        </div>
      </fieldset>

      <DatePicker name="occurred_on" label="Fecha" defaultValue={initial?.occurred_on} />

      <label className="flex flex-col gap-1.5 text-sm font-medium">
        <span>
          Nota <span className="font-normal text-muted">· opcional, se guarda cifrada</span>
        </span>
        <input name="note" maxLength={200} defaultValue={initial?.note} placeholder="Ej. almuerzo con el equipo" className={`${inputClass} font-normal placeholder:text-muted/60`} />
      </label>

      {state?.error && (
        <p role="alert" className="page-enter rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Link
          href="/movimientos"
          className="press grid place-items-center rounded-2xl border border-border px-6 py-3.5 font-semibold hover:bg-surface-2"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary press flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3.5 font-semibold disabled:opacity-70"
        >
          {pending && <Spinner />}
          {pending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
