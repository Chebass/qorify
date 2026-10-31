import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type Account = { id: string; name: string; kind: string; initial_balance: number };
export type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  icon: string | null;
  color: string | null;
};

const DEFAULT_ACCOUNTS = [
  { name: "Efectivo", kind: "cash" },
  { name: "Yape", kind: "yape" },
  { name: "Plin", kind: "plin" },
  { name: "Tarjeta", kind: "card" },
];

const DEFAULT_CATEGORIES = [
  { name: "Comida", type: "expense", icon: "🍽️", color: "#EE7755" },
  { name: "Transporte", type: "expense", icon: "🚌", color: "#5349C2" },
  { name: "Hogar", type: "expense", icon: "🏠", color: "#B48BF1" },
  { name: "Servicios", type: "expense", icon: "💡", color: "#F2C382" },
  { name: "Salud", type: "expense", icon: "💊", color: "#4FC88A" },
  { name: "Compras", type: "expense", icon: "🛍️", color: "#D6609B" },
  { name: "Ocio", type: "expense", icon: "🎬", color: "#4DA3E0" },
  { name: "Educación", type: "expense", icon: "📚", color: "#8A7AE8" },
  { name: "Otros gastos", type: "expense", icon: "📦", color: "#9A96B5" },
  { name: "Sueldo", type: "income", icon: "💼", color: "#4FC88A" },
  { name: "Freelance", type: "income", icon: "💻", color: "#5349C2" },
  { name: "Regalos", type: "income", icon: "🎁", color: "#F2C382" },
  { name: "Otros ingresos", type: "income", icon: "➕", color: "#9A96B5" },
];

/** Usuario autenticado + cliente de Supabase (RLS). Redirige a /login si no hay sesión. */
export async function getContext() {
  // Marca la página como dinámica (depende de la sesión): se renderiza siempre en cada petición.
  await connection();
  const supabase = await createClient();
  // getClaims() verifica la firma del JWT localmente (sin viaje de red a Supabase en cada página).
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect("/login");
  const user = { id: claims.sub, email: typeof claims.email === "string" ? claims.email : undefined };
  return { supabase, user };
}

/** Crea medios de pago y categorías iniciales la primera vez que el usuario entra. */
export async function getCatalog() {
  const { supabase, user } = await getContext();

  const [{ data: accounts }, { data: categories }] = await Promise.all([
    supabase.from("accounts").select("id,name,kind,initial_balance").eq("archived", false).order("created_at"),
    supabase.from("categories").select("id,name,type,icon,color").order("created_at"),
  ]);

  if (!accounts?.length && !categories?.length) {
    // Idempotente: si dos peticiones siembran a la vez, las restricciones únicas ignoran los duplicados.
    await Promise.all([
      supabase.from("accounts").upsert(DEFAULT_ACCOUNTS, { onConflict: "user_id,name", ignoreDuplicates: true }),
      supabase
        .from("categories")
        .upsert(DEFAULT_CATEGORIES, { onConflict: "user_id,name,type", ignoreDuplicates: true }),
    ]);
    const [a, c] = await Promise.all([
      supabase.from("accounts").select("id,name,kind,initial_balance").eq("archived", false).order("created_at"),
      supabase.from("categories").select("id,name,type,icon,color").order("created_at"),
    ]);
    return {
      supabase,
      user,
      accounts: uniqueBy((a.data ?? []) as Account[], (r) => r.name.toLowerCase()),
      categories: uniqueBy((c.data ?? []) as Category[], (r) => `${r.type}:${r.name.toLowerCase()}`),
    };
  }

  // Red de seguridad: si la base aún tiene repetidos, se muestra solo el más antiguo
  // (el mismo que conserva la migración 0002).
  return {
    supabase,
    user,
    accounts: uniqueBy((accounts ?? []) as Account[], (r) => r.name.toLowerCase()),
    categories: uniqueBy((categories ?? []) as Category[], (r) => `${r.type}:${r.name.toLowerCase()}`),
  };
}

function uniqueBy<T>(rows: T[], key: (row: T) => string): T[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const k = key(r);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export type TxRow = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  occurred_on: string;
  note_enc: string | null;
  account_id: string;
  category_id: string | null;
  accounts: { name: string; kind: string } | null;
  categories: { name: string; icon: string | null; color: string | null } | null;
};

export const TX_SELECT =
  "id,type,amount,occurred_on,note_enc,account_id,category_id,accounts(name,kind),categories(name,icon,color)";
