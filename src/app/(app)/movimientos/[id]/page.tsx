import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageSkeleton } from "@/components/app/PageSkeleton";
import { getCatalog } from "@/lib/data/context";
import { decryptText } from "@/lib/crypto";
import { deleteTransaction, updateTransaction } from "../actions";
import { TxForm } from "../tx-form";

// La página depende de la sesión del usuario: se renderiza en cada petición.
export const instant = false;

export default function EditarMovimientoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditarContent params={params} />
    </Suspense>
  );
}

async function EditarContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { supabase, accounts, categories } = await getCatalog();
  const { data: tx } = await supabase
    .from("transactions")
    .select("id,type,amount,occurred_on,account_id,category_id,note_enc")
    .eq("id", id)
    .maybeSingle();
  if (!tx || tx.type === "transfer") notFound();

  return (
    <main className="stagger flex flex-col gap-5 px-4 py-8 md:mx-auto md:w-full md:max-w-xl md:px-8">
      <h1 className="font-display text-2xl font-semibold">Editar movimiento</h1>
      <TxForm
        action={updateTransaction.bind(null, id)}
        accounts={accounts}
        categories={categories}
        submitLabel="Guardar cambios"
        initial={{
          type: tx.type,
          amount: String(tx.amount),
          occurred_on: tx.occurred_on,
          account_id: tx.account_id,
          category_id: tx.category_id ?? "",
          note: decryptText(tx.note_enc),
        }}
      />
      <form action={deleteTransaction.bind(null, id)}>
        <button className="press w-full rounded-xl border border-danger/40 px-4 py-3 text-sm font-semibold text-danger hover:bg-danger/10">
          Eliminar movimiento
        </button>
      </form>
    </main>
  );
}
