// Fechas como "YYYY-MM-DD". La app usa la hora de Lima para definir "hoy" y los límites de mes/año.
const TZ = "America/Lima";

export function todayLima(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export function addDays(d: string, n: number): string {
  const dt = new Date(`${d}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

export const monthStart = (d: string) => `${d.slice(0, 7)}-01`;
export const yearStart = (d: string) => `${d.slice(0, 4)}-01-01`;

export function monthEnd(d: string): string {
  const [y, m] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

export function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1 + n, 1));
  return dt.toISOString().slice(0, 7);
}

const fmt = (d: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString("es-PE", { timeZone: "UTC", ...opts });

export function dayLabel(d: string, today: string): string {
  if (d === today) return "Hoy";
  if (d === addDays(today, -1)) return "Ayer";
  return fmt(d, { weekday: "short", day: "numeric", month: "short" });
}

export const monthLabel = (ym: string) => fmt(`${ym}-01`, { month: "long", year: "numeric" });
export const weekdayShort = (d: string) => fmt(d, { weekday: "narrow" });
export const monthShort = (d: string) => fmt(d, { month: "short" });

export const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
export const isMonth = (s: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(s);
