"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { GEO_DENIED_KEY, MODE_KEY, store, type Mode } from "@/lib/landscape/prefs";
import { updateLandscape } from "@/app/(app)/perfil/actions";

// Miniaturas ilustradas (atardecer) de cada región.
function CostaThumb() {
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="t-costa-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a63b8" />
          <stop offset="1" stopColor="#f5b27a" />
        </linearGradient>
        <linearGradient id="t-costa-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f8fb5" />
          <stop offset="1" stopColor="#16507c" />
        </linearGradient>
      </defs>
      <rect width="120" height="80" fill="url(#t-costa-sky)" />
      <circle cx="82" cy="40" r="11" fill="#fff3c4" opacity="0.95" />
      <rect y="42" width="120" height="38" fill="url(#t-costa-sea)" />
      <rect x="70" y="46" width="24" height="2" rx="1" fill="#ffe2a8" opacity="0.8" />
      <rect x="74" y="52" width="16" height="2" rx="1" fill="#ffe2a8" opacity="0.6" />
      <path d="M0 30 L26 34 L32 48 L36 80 L0 80Z" fill="#9a6a52" />
      <path d="M0 29 L26 33 L28 37 L0 35Z" fill="#4d8a4a" />
      <path d="M14 30 C16 20 12 12 17 6" stroke="#5a4030" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M17 6 C8 4 4 9 3 14 C9 9 13 8 17 6Z M17 6 C26 4 30 9 31 14 C25 9 21 8 17 6Z" fill="#2f7a4a" />
    </svg>
  );
}

function SierraThumb() {
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="t-sierra-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a90d9" />
          <stop offset="1" stopColor="#cfe6f2" />
        </linearGradient>
      </defs>
      <rect width="120" height="80" fill="url(#t-sierra-sky)" />
      <circle cx="94" cy="18" r="8" fill="#fff3c4" />
      <path d="M-5 56 L22 36 L40 48 L58 30 L78 50 L96 38 L125 56Z" fill="#a9b0d4" />
      <path d="M30 62 L70 14 L84 30 L96 22 L128 62Z" fill="#8b6f8f" />
      <path d="M70 14 L62 26 L68 23 L71 30 L76 23 L82 27 L78 20Z" fill="#f4f6ff" />
      <path d="M-5 80 L-5 58 Q30 48 60 60 T125 56 L125 80Z" fill="#5d7a4a" />
      <path d="M-5 80 L-5 68 Q40 58 80 70 T125 66 L125 80Z" fill="#6b8a50" />
      <ellipse cx="34" cy="66" rx="9" ry="4" fill="#e6d3ad" />
    </svg>
  );
}

function SelvaThumb() {
  return (
    <svg viewBox="0 0 120 80" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="t-selva-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fb8c8" />
          <stop offset="1" stopColor="#d9f0c9" />
        </linearGradient>
      </defs>
      <rect width="120" height="80" fill="url(#t-selva-sky)" />
      <path d="M-5 44 Q20 30 40 40 T80 36 T125 38 L125 60 L-5 60Z" fill="#4d8f6f" opacity="0.8" />
      <path d="M52 40 C56 52 44 58 54 70 C60 78 50 80 50 80 L72 80 C68 72 78 64 68 56 C62 50 68 44 62 40Z" fill="#9fd6c4" />
      <path d="M-5 38 Q12 24 28 36 Q36 28 46 42 C44 60 38 72 34 80 L-5 80Z" fill="#2f7a4e" />
      <path d="M125 38 Q108 24 92 36 Q84 28 76 44 C78 60 84 72 88 80 L125 80Z" fill="#276b45" />
      <path d="M-5 60 Q12 52 22 62 C20 72 18 76 16 80 L-5 80Z" fill="#1b4d35" />
      <circle cx="96" cy="16" r="6" fill="#fff6c8" opacity="0.9" />
      <path d="M30 22 q4 -4 8 0 q4 -4 8 0" stroke="#d8362b" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Tile({
  selected, disabled, onClick, label, hint, children,
}: { selected: boolean; disabled: boolean; onClick: () => void; label: string; hint: string; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      data-selected={selected}
      onClick={onClick}
      className={`group card press relative overflow-hidden rounded-2xl border bg-surface text-left ${
        selected ? "border-primary ring-2 ring-primary/40" : "border-border"
      }`}
    >
      <div className="aspect-[3/2] overflow-hidden">
        <div className="h-full w-full transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-105">{children}</div>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>
      <span
        aria-hidden
        className="absolute right-2 top-2 grid h-6 w-6 scale-50 place-items-center rounded-full bg-primary text-primary-contrast opacity-0 shadow-md transition duration-200 ease-[var(--ease-out)] group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    </button>
  );
}

function WideOption({
  selected, disabled, onClick, label, hint, icon, tint,
}: { selected: boolean; disabled: boolean; onClick: () => void; label: string; hint: string; icon: ReactNode; tint: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      data-selected={selected}
      onClick={onClick}
      className={`group card press relative col-span-3 flex items-center gap-3 overflow-hidden rounded-2xl border bg-surface p-3 text-left ${
        selected ? "border-primary ring-2 ring-primary/40" : "border-border"
      }`}
    >
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-105 group-hover:-rotate-3"
        style={{ background: tint }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
      <span
        aria-hidden
        className="grid h-6 w-6 shrink-0 scale-50 place-items-center rounded-full bg-primary text-primary-contrast opacity-0 transition duration-200 ease-[var(--ease-out)] group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
    </button>
  );
}

/** Elige el paisaje del login. Se guarda en tu cuenta y se recuerda en este dispositivo. */
export function LandscapeSetting({ initial }: { initial: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  // Lo guardado en la cuenta manda: así el login de este dispositivo lo respeta.
  useEffect(() => {
    store(MODE_KEY, initial);
  }, [initial]);

  function choose(m: Mode) {
    if (m === mode) return;
    setMode(m);
    setFailed(false);
    store(MODE_KEY, m);
    if (m === "auto") store(GEO_DENIED_KEY, null);
    startTransition(async () => {
      const res = await updateLandscape(m);
      if (!res.ok) setFailed(true);
    });
  }

  const common = { disabled: false };

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label="Paisaje del inicio de sesión" className="grid grid-cols-3 gap-3" aria-busy={pending}>
        <WideOption
          {...common}
          selected={mode === "auto"}
          onClick={() => choose("auto")}
          label="Automático"
          hint="Según donde estés (pide permiso de ubicación)"
          tint="linear-gradient(135deg,#5349c2,#b48bf1)"
          icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
              <circle cx="12" cy="10" r="2.4" />
            </svg>
          }
        />
        <Tile {...common} selected={mode === "costa"} onClick={() => choose("costa")} label="Costa" hint="Mar y palmeras">
          <CostaThumb />
        </Tile>
        <Tile {...common} selected={mode === "sierra"} onClick={() => choose("sierra")} label="Sierra" hint="Nevados y andenes">
          <SierraThumb />
        </Tile>
        <Tile {...common} selected={mode === "selva"} onClick={() => choose("selva")} label="Selva" hint="Río y bruma">
          <SelvaThumb />
        </Tile>
        <WideOption
          {...common}
          selected={mode === "random"}
          onClick={() => choose("random")}
          label="Aleatorio"
          hint="Una región distinta cada vez que entres"
          tint="linear-gradient(135deg,#ee7755,#f2c382)"
          icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
          }
        />
      </div>
      {failed && (
        <p role="alert" className="text-xs text-danger">
          No se pudo guardar en tu cuenta; quedó solo en este dispositivo.
        </p>
      )}
    </div>
  );
}
