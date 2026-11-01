import type { Env } from "@/lib/landscape/palette";
import { Bird } from "./Costa";
import { Sky } from "./Sky";

/**
 * Paisaje con imagen de fondo + el mismo movimiento del SVG por encima:
 * zoom lento (Ken Burns), parallax con el puntero, nubes, estrellas y aves.
 */
export function ImageScene({
  src, exact, env, label,
}: { src: string; exact: boolean; env: Env; label: string }) {
  // Sin imagen exacta para la hora, se ajusta el brillo con la luz del momento.
  const filter = exact ? undefined : `brightness(${0.35 + 0.65 * env.light}) saturate(${0.7 + 0.3 * env.light})`;

  return (
    <>
      <div
        key={src}
        className="fade-in absolute inset-0"
        style={{
          transform: "translate(calc(var(--px, 0) * -10px), calc(var(--py, 0) * -6px)) scale(1.12)",
          transition: "transform 0.5s ease-out",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={label}
          className="kenburns h-full w-full object-cover object-bottom"
          style={{ filter }}
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 90 400 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <Sky env={env} overlay />
        <Bird y={180} dur={34} delay={-6} env={env} />
        <Bird y={210} dur={40} delay={-22} env={env} />
      </svg>
    </>
  );
}
