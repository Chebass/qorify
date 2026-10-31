import { REGIONS, type Region } from "./region";

export type Mode = "auto" | "random" | Region;

export const MODES: { value: Mode; label: string }[] = [
  { value: "auto", label: "Automático" },
  { value: "costa", label: "Costa" },
  { value: "sierra", label: "Sierra" },
  { value: "selva", label: "Selva" },
  { value: "random", label: "Aleatorio" },
];

export const MODE_KEY = "qorify.landscape";
export const GEO_KEY = "qorify.geoRegion";
export const GEO_DENIED_KEY = "qorify.geoDenied";

export const isMode = (v: unknown): v is Mode => MODES.some((m) => m.value === v);
export const isRegion = (v: unknown): v is Region => REGIONS.includes(v as Region);

export function store(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {}
}

export function load(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Preferencia → columnas de `profiles` (landscape_mode / landscape_region). */
export function toProfile(mode: Mode): { landscape_mode: "auto" | "fixed" | "random"; landscape_region: Region | null } {
  if (mode === "auto" || mode === "random") return { landscape_mode: mode, landscape_region: null };
  return { landscape_mode: "fixed", landscape_region: mode };
}

export function fromProfile(p: { landscape_mode: string; landscape_region: string | null } | null): Mode {
  if (!p) return "auto";
  if (p.landscape_mode === "fixed" && isRegion(p.landscape_region)) return p.landscape_region;
  return p.landscape_mode === "random" ? "random" : "auto";
}
