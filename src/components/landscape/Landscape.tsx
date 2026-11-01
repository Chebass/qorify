"use client";

import { useEffect, useState, useSyncExternalStore, type PointerEvent } from "react";
import { computeEnv, greeting } from "@/lib/landscape/palette";
import { classify, REGIONS, type Region } from "@/lib/landscape/region";
import {
  GEO_DENIED_KEY, GEO_KEY, MODE_KEY, isMode, isRegion, load, store, type Mode,
} from "@/lib/landscape/prefs";
import { Sky } from "./Sky";
import { Sierra } from "./Sierra";
import { Costa } from "./Costa";
import { Selva } from "./Selva";
import { ImageScene } from "./ImageScene";
import { imageFor } from "@/lib/landscape/images";

// La preferencia se elige en Perfil → Paisaje y se recuerda en este dispositivo.
function readMode(): Mode {
  const v = load(MODE_KEY);
  return isMode(v) ? v : "auto";
}

function readGeo(): Region | null {
  const v = load(GEO_KEY);
  return isRegion(v) ? v : null;
}

function nowHour() {
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
}

/** Solo en desarrollo: ?t=21&r=selva fuerza hora y región para revisar las escenas. */
function readDev(): { t?: number; r?: Region } {
  if (process.env.NODE_ENV === "production") return {};
  const q = new URLSearchParams(window.location.search);
  const t = parseFloat(q.get("t") ?? "");
  const r = q.get("r");
  return { t: Number.isFinite(t) ? t : undefined, r: isRegion(r) ? r : undefined };
}

function Scene({ serverRegion }: { serverRegion: Region }) {
  const [mode] = useState<Mode>(readMode);
  const [geo, setGeo] = useState<Region | null>(readGeo);
  const [hour, setHour] = useState(nowHour);
  const [randomRegion] = useState<Region>(
    () => REGIONS[Math.floor(Math.random() * REGIONS.length)],
  );
  const [dev] = useState(readDev);

  useEffect(() => {
    const id = setInterval(() => setHour(nowHour()), 30_000);
    return () => clearInterval(id);
  }, []);

  // Ubicación del navegador (con permiso), procesada solo en el dispositivo.
  useEffect(() => {
    if (mode !== "auto" || !("geolocation" in navigator) || load(GEO_DENIED_KEY)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const r = classify(pos.coords.latitude, pos.coords.longitude);
        if (r) {
          store(GEO_KEY, r);
          setGeo(r);
        }
      },
      () => store(GEO_DENIED_KEY, "1"),
      { timeout: 8000, maximumAge: 86_400_000 },
    );
  }, [mode]);

  const region: Region =
    dev.r ?? (mode === "random" ? randomRegion : mode === "auto" ? (geo ?? serverRegion) : mode);
  const h = dev.t ?? hour;
  const env = computeEnv(h);
  const image = imageFor(region, h);
  const label = `Paisaje de la ${region} del Perú`;

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    el.style.setProperty("--px", String((e.clientX / window.innerWidth - 0.5) * 2));
    el.style.setProperty("--py", String((e.clientY / window.innerHeight - 0.5) * 2));
  }

  return (
    <div className="scene fade-in fixed inset-0 z-0 overflow-hidden" onPointerMove={onPointerMove}>
      {image ? (
        <ImageScene src={image.src} exact={image.exact} env={env} label={label} />
      ) : (
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 90 400 800"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={label}
        >
          <Sky env={env} />
          {region === "sierra" && <Sierra env={env} />}
          {region === "costa" && <Costa env={env} />}
          {region === "selva" && <Selva env={env} />}
        </svg>
      )}

      <div className="pointer-events-none absolute left-0 right-0 top-0 px-6 pt-8 text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
        <p className="font-display text-3xl font-semibold">{greeting(h)}</p>
        <p className="text-sm opacity-90">
          {new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}

const noopSubscribe = () => () => {};

export function Landscape({ serverRegion }: { serverRegion: Region }) {
  // false en servidor/hidratación y true después: evita diferencias de hora/almacenamiento.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  if (!mounted) {
    return <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0b0a24] to-[#2a2460]" />;
  }
  return <Scene serverRegion={serverRegion} />;
}
