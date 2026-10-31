import { headers } from "next/headers";
import { classify, DEFAULT_REGION } from "@/lib/landscape/region";
import { Landscape } from "./Landscape";

/** Región aproximada por IP (cabeceras de geolocalización de Vercel); sin guardar nada. */
export async function LandscapeBackground() {
  const h = await headers();
  const lat = parseFloat(h.get("x-vercel-ip-latitude") ?? "");
  const lon = parseFloat(h.get("x-vercel-ip-longitude") ?? "");
  const region =
    Number.isFinite(lat) && Number.isFinite(lon) ? (classify(lat, lon) ?? DEFAULT_REGION) : DEFAULT_REGION;

  return <Landscape serverRegion={region} />;
}
