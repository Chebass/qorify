const PATHS: Record<string, string> = {
  cash: "M3 7h18v10H3zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM6.5 10v4M17.5 10v4",
  card: "M3 6h18v12H3zM3 10h18M7 15h3",
  yape: "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM10.5 18h3M9.5 8.5l2.5 3 2.5-3M12 11.5V15",
  plin: "M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM10.5 18h3M9.5 10h5M12.5 8l2 2-2 2M14.5 14h-5M11.5 12l-2 2 2 2",
  bank: "M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18",
  other: "M4 7a2 2 0 0 1 2-2h11v4M4 7v10a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6a2 2 0 0 1-2-1zM16 13.5h2",
};

/** Color propio de cada medio de pago (se usa para teñir su ficha). */
export const PAYMENT_COLORS: Record<string, string> = {
  cash: "#2f8f5b",
  card: "#5349c2",
  yape: "#8a3fb0",
  plin: "#1a9bb5",
  bank: "#3b7bd6",
  other: "#7d789a",
};

export function PaymentIcon({ kind, className = "h-5 w-5" }: { kind: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={PATHS[kind] ?? PATHS.other} />
    </svg>
  );
}
