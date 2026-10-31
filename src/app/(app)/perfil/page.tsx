import { Suspense } from "react";
import { PageSkeleton } from "@/components/app/PageSkeleton";
import { getContext } from "@/lib/data/context";
import { logout } from "@/app/(auth)/actions";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { LandscapeSetting } from "@/components/app/LandscapeSetting";
import { fromProfile } from "@/lib/landscape/prefs";

// La página depende de la sesión del usuario: se renderiza en cada petición.
export const instant = false;

export default function PerfilPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PerfilContent />
    </Suspense>
  );
}

async function PerfilContent() {
  const { supabase, user } = await getContext();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,landscape_mode,landscape_region")
    .eq("id", user.id)
    .single();

  return (
    <main className="stagger flex flex-col gap-5 px-4 py-8 md:mx-auto md:w-full md:max-w-xl md:px-8">
      <h1 className="font-display text-2xl font-semibold">Perfil</h1>

      <section className="card rounded-card border border-border bg-surface p-4">
        <p className="font-semibold">{profile?.display_name}</p>
        <p className="text-sm text-muted">{user.email}</p>
      </section>

      <section className="card flex flex-col gap-2 rounded-card border border-border bg-surface p-4">
        <h2 className="font-semibold">Tema</h2>
        <ThemeToggle />
      </section>

      <section className="card flex flex-col gap-2 rounded-card border border-border bg-surface p-4">
        <h2 className="font-semibold">Paisaje del inicio de sesión</h2>
        <LandscapeSetting initial={fromProfile(profile)} />
      </section>

      <form action={logout}>
        <button className="press w-full rounded-xl border border-border px-4 py-3 font-semibold hover:bg-surface-2">
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
