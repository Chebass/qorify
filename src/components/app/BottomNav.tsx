"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

type Item = (typeof NAV_ITEMS)[number];

function NavLink({ item, active }: { item: Item; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`press flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${
        active ? "text-primary" : "text-muted"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={item.icon} />
      </svg>
      {item.label}
    </Link>
  );
}

/** Barra inferior solo para celular; en pantallas grandes se usa SideNav. */
export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const [inicio, movs, stats, perfil] = NAV_ITEMS;

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center rounded-t-3xl border border-b-0 border-border bg-surface/90 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(18,14,40,0.12)] backdrop-blur-xl md:hidden"
    >
      <NavLink item={inicio} active={isActive(inicio.href)} />
      <NavLink item={movs} active={isActive(movs.href)} />
      <Link
        href="/movimientos/nuevo"
        aria-label="Agregar movimiento"
        className="-mt-7 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-cta text-white shadow-lg ring-4 ring-bg press hover:brightness-110"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
      <NavLink item={stats} active={isActive(stats.href)} />
      <NavLink item={perfil} active={isActive(perfil.href)} />
    </nav>
  );
}
