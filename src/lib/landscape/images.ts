import type { Region } from "./region";

export type Phase = "amanecer" | "dia" | "atardecer" | "noche";

/** Franja del día para elegir la imagen (coincide con los cortes del cielo en palette.ts). */
export function phaseAt(hour: number): Phase {
  if (hour >= 5 && hour < 8) return "amanecer";
  if (hour >= 8 && hour < 16.8) return "dia";
  if (hour >= 16.8 && hour < 19.5) return "atardecer";
  return "noche";
}

/**
 * Imágenes de paisaje (vertical 9:16, WebP/AVIF) en /public/landscapes/.
 * Registra aquí cada archivo cuando lo agregues; lo que no esté registrado
 * sigue usando el paisaje SVG dibujado en código.
 *
 *   sierra: { dia: "/landscapes/sierra-dia.webp", noche: "/landscapes/sierra-noche.webp" }
 */
export const IMAGES: Partial<Record<Region, Partial<Record<Phase, string>>>> = {
  sierra: { dia: "/landscapes/sierra-dia.webp" },
};

// Si falta la franja exacta se usa la más parecida y se oscurece/aclara con CSS.
const FALLBACK: Record<Phase, Phase[]> = {
  amanecer: ["dia", "atardecer", "noche"],
  dia: ["amanecer", "atardecer", "noche"],
  atardecer: ["amanecer", "dia", "noche"],
  noche: ["atardecer", "amanecer", "dia"],
};

export function imageFor(region: Region, hour: number): { src: string; exact: boolean } | null {
  const set = IMAGES[region];
  if (!set) return null;
  const phase = phaseAt(hour);
  if (set[phase]) return { src: set[phase]!, exact: true };
  for (const p of FALLBACK[phase]) if (set[p]) return { src: set[p]!, exact: false };
  return null;
}
