"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { encryptText } from "@/lib/crypto";
import { transactionSchema } from "@/lib/validators/transaction";

export type TxFormState = { error?: string } | undefined;

function parse(formData: FormData) {
  return transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    occurred_on: formData.get("occurred_on"),
    account_id: formData.get("account_id"),
    category_id: formData.get("category_id") ?? "",
    note: formData.get("note") ?? "",
  });
}

function toRow(d: NonNullable<ReturnType<typeof parse>["data"]>) {
  return {
    type: d.type,
    amount: d.amount,
    occurred_on: d.occurred_on,
    account_id: d.account_id,
    category_id: d.category_id || null,
    note_enc: d.note ? encryptText(d.note) : null,
  };
}

export async function createTransaction(_prev: TxFormState, formData: FormData): Promise<TxFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").insert(toRow(parsed.data));
  if (error) return { error: "No se pudo guardar el movimiento" };
  redirect("/movimientos");
}

export async function updateTransaction(
  id: string,
  _prev: TxFormState,
  formData: FormData,
): Promise<TxFormState> {
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.from("transactions").update(toRow(parsed.data)).eq("id", id);
  if (error) return { error: "No se pudo actualizar el movimiento" };
  redirect("/movimientos");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  await supabase.from("transactions").delete().eq("id", id);
  redirect("/movimientos");
}
