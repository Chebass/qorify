import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/PageSkeleton";
import { getCatalog } from "@/lib/data/context";
import { createTransaction } from "../actions";
import { TxForm } from "../tx-form";

// La página depende de la sesión del usuario: se renderiza en cada petición.
export const instant = false;

export default function NuevoMovimientoPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NuevoContent />
    </Suspense>
  );
}

async function NuevoContent() {
  const { accounts, categories } = await getCatalog();

  return (
    <main className="stagger flex flex-col gap-5 px-4 py-8 md:mx-auto md:w-full md:max-w-xl md:px-8">
      <h1 className="font-display text-2xl font-semibold">Nuevo movimiento</h1>
      <TxForm action={createTransaction} accounts={accounts} categories={categories} submitLabel="Guardar" />
    </main>
  );
}
