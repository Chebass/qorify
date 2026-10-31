"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { Account, Category } from "@/lib/data/context";
import type { TxFormState } from "./actions";
import { Segmented } from "@/components/app/Segmented";

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
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

function Chip({
  name, value, checked, onChange, children, defaultChecked,
}: {
  name: string; value: string; checked?: boolean; defaultChecked?: boolean;
  onChange?: () => void; children: React.ReactNode;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="press flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-sm hover:border-primary/60 peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-contrast peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
        {children}
      </span>
    </label>
  );
}

export function TxForm({ action, accounts, categories, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [type, setType] = useState<"income" | "expense">(initial?.type ?? "expense");
  const dateRef = useRef<HTMLInputElement>(null);

  // "Hoy" en la zona horaria del dispositivo (el servidor puede estar en otra).
  useEffect(() => {
    if (dateRef.current && !dateRef.current.value) {
      dateRef.current.value = new Date().toLocaleDateString("en-CA");
    }
  }, []);

  const cats = categories.filter((c) => c.type === type);

  return (
    <form action={formAction} className="flex flex-col gap-5">
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

      <label className="flex flex-col gap-1.5 text-sm">
        Monto (S/)
        <input
          name="amount"
          inputMode="decimal"
          placeholder="0.00"
          defaultValue={initial?.amount}
          required
          autoFocus
          className={`${inputClass} font-display text-3xl font-semibold`}
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm">Categoría</legend>
        <div className="flex flex-wrap gap-2">
          <Chip name="category_id" value="" defaultChecked={!initial?.category_id}>
            Sin categoría
          </Chip>
          {cats.map((c) => (
            <Chip
              key={c.id}
              name="category_id"
              value={c.id}
              defaultChecked={initial?.category_id === c.id}
            >
              <span aria-hidden>{c.icon}</span>
              {c.name}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm">Medio de pago</legend>
        <div className="flex flex-wrap gap-2">
          {accounts.map((a, i) => (
            <Chip
              key={a.id}
              name="account_id"
              value={a.id}
              defaultChecked={initial ? initial.account_id === a.id : i === 0}
            >
              {a.name}
            </Chip>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-sm">
        Fecha
        <input
          ref={dateRef}
          name="occurred_on"
          type="date"
          defaultValue={initial?.occurred_on}
          required
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        Nota (opcional, se guarda cifrada)
        <input name="note" maxLength={200} defaultValue={initial?.note} className={inputClass} />
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <Link
          href="/movimientos"
          className="press rounded-xl border border-border px-5 py-3 text-center font-semibold hover:bg-surface-2"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-contrast press hover:brightness-110 disabled:opacity-60"
        >
          {pending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
