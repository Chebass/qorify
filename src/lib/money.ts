const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export const formatPEN = (n: number) => pen.format(n);

export const round2 = (n: number) => Math.round(n * 100) / 100;
