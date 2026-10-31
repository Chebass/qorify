"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Segmented } from "./Segmented";

const OPTIONS = [
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
  { value: "anio", label: "Año" },
] as const;

type Period = (typeof OPTIONS)[number]["value"];

/** El indicador se mueve al instante; los datos llegan después sin parpadeo (transición). */
export function PeriodTabs() {
  const router = useRouter();
  const sp = useSearchParams().get("p");
  const current: Period = OPTIONS.find((o) => o.value === sp)?.value ?? "mes";
  const [value, setValue] = useState<Period>(current);
  const [pending, startTransition] = useTransition();

  return (
    <div aria-busy={pending} className="md:max-w-sm">
      <Segmented
        label="Periodo"
        options={[...OPTIONS]}
        value={value}
        onChange={(v) => {
          setValue(v);
          startTransition(() => router.push(`/estadisticas?p=${v}`));
        }}
      />
    </div>
  );
}
