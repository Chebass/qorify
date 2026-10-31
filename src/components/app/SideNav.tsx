"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

export function SideNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col gap-6 border-r border-border bg-surface px-4 py-6 md:flex">
      <p className="px-3 font-display text-2xl font-semibold text-primary">Qorify</p>

      <Link
        href="/movimientos/nuevo"
        className="btn-cta flex h-12 items-center justify-center gap-2 rounded-2xl text-[15px] font-bold"
      >
        <svg viewBox="0 0 24 24" className="btn-cta-icon h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        Nuevo
      </Link>

      <nav aria-label="Principal" className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`press flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                active ? "bg-primary/12 text-primary" : "text-muted hover:bg-surface-2"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
