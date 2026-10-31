"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { Bar as BarData } from "@/lib/data/stats";

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export function BarsChart({ data, height = 150 }: { data: BarData[]; height?: number }) {
  const dense = data.length > 12;
  return (
    <div role="img" aria-label="Gráfico de gastos" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={dense ? 4 : 0}
            tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            formatter={(v) => [pen.format(Number(v)), "Gastos"]}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              color: "var(--text)",
            }}
          />
          <Bar dataKey="value" animationDuration={500} animationEasing="ease-out" radius={[8, 8, 8, 8]} maxBarSize={dense ? 10 : 28}>
            {data.map((d, i) => (
              <Cell
                key={i}
                style={{ fill: d.highlight ? "var(--peach)" : "var(--accent)", opacity: d.highlight ? 1 : 0.55 }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
