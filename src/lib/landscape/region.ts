export type Region = "costa" | "sierra" | "selva";
export const REGIONS: Region[] = ["costa", "sierra", "selva"];

type Pt = [lat: number, lon: number];

// Aproximación de la línea de costa y del borde oriental andino (lat decreciente).
const COAST: Pt[] = [
  [-4.2, -81.2], [-6, -81.0], [-8, -79.1], [-10, -78.3], [-12, -77.2],
  [-14, -76.2], [-16, -73.0], [-17.5, -71.3], [-18.4, -70.4],
];
const SELVA_EDGE: Pt[] = [
  [-2, -78.2], [-5, -78.0], [-7, -77.0], [-9, -76.0], [-11, -75.0],
  [-12.5, -73.5], [-13.5, -71.2], [-14, -69.5],
];
const COAST_WIDTH = 0.9; // ~100 km tierra adentro

function lonAt(points: Pt[], lat: number) {
  if (lat >= points[0][0]) return points[0][1];
  for (let i = 0; i < points.length - 1; i++) {
    const [la, lo] = points[i];
    const [lb, lob] = points[i + 1];
    if (lat <= la && lat >= lb) return lo + ((lat - la) / (lb - la)) * (lob - lo);
  }
  return points[points.length - 1][1];
}

/** Clasifica una coordenada en costa/sierra/selva; null si está fuera del Perú. */
export function classify(lat: number, lon: number): Region | null {
  if (lat > 0.1 || lat < -18.5 || lon < -81.5 || lon > -68.6) return null;
  if (lon > lonAt(SELVA_EDGE, lat)) return "selva";
  if (lon < lonAt(COAST, lat) + COAST_WIDTH) return "costa";
  return "sierra";
}

export const DEFAULT_REGION: Region = "costa";
