import type { ReactNode } from "react";

/** Capa con parallax: se desplaza con --px/--py (definidos por el contenedor). */
export function Par({ k, children }: { k: number; children: ReactNode }) {
  return (
    <g
      style={{
        transform: `translate(calc(var(--px, 0) * ${k}px), calc(var(--py, 0) * ${k * 0.4}px))`,
        transition: "transform 0.5s ease-out",
      }}
    >
      {children}
    </g>
  );
}
