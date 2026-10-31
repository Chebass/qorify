"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Segmented } from "./Segmented";

const OPTIONS = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
  { value: "system", label: "Sistema" },
];

const noop = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  return (
    <Segmented
      label="Tema"
      options={OPTIONS}
      value={mounted ? (theme ?? "system") : "system"}
      onChange={setTheme}
    />
  );
}
