"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { Slice } from "@/lib/data/stats";

const pen = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" });

export function DonutChart({ data, label }: { data: Slice[]; label: string }) {
  const sum = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative h-48" role="img" aria-label={`Distribución de ${label}`}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="68%"
            outerRadius="95%"
            paddingAngle={data.length > 1 ? 3 : 0}
            cornerRadius={6}
            stroke="none"
            animationDuration={600}
            animationEasing="ease-out"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-muted">{label}</span>
        <span className="font-display text-xl font-semibold">{pen.format(sum)}</span>
      </div>
    </div>
  );
}
