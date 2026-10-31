export type Hex = string;

export const HORIZON = 460; // y del horizonte en el viewBox 400x800

function hexToRgb(hex: Hex): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): Hex {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

export function mix(a: Hex, b: Hex, t: number): Hex {
  const k = Math.min(1, Math.max(0, t));
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex([ar + (br - ar) * k, ag + (bg - ag) * k, ab + (bb - ab) * k]);
}

export function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// Colores del cielo por hora local (se interpolan de forma continua).
const SKY_KEYS: { h: number; top: Hex; bottom: Hex }[] = [
  { h: 0, top: "#0b0a24", bottom: "#1d1b4b" },
  { h: 4.8, top: "#0f0e2e", bottom: "#2a2460" },
  { h: 5.8, top: "#2b2a70", bottom: "#c8648c" },
  { h: 6.5, top: "#4a5fb0", bottom: "#f4a877" },
  { h: 8, top: "#4a90d9", bottom: "#bfe3f5" },
  { h: 12, top: "#3b82d6", bottom: "#a9d8f5" },
  { h: 16, top: "#4a8fd6", bottom: "#cfe6f2" },
  { h: 17.6, top: "#5a63b8", bottom: "#f5b27a" },
  { h: 18.4, top: "#2e2a6e", bottom: "#e8688a" },
  { h: 19.3, top: "#17143f", bottom: "#4a2f70" },
  { h: 20.5, top: "#0f0d2e", bottom: "#221e52" },
  { h: 24, top: "#0b0a24", bottom: "#1d1b4b" },
];

export type Env = {
  hour: number;
  sky: { top: Hex; bottom: Hex };
  light: number; // 0 noche … 1 día pleno
  warm: number; // 0…1, pico en amanecer y atardecer
  stars: number;
  sun: { x: number; y: number; o: number };
  moon: { x: number; y: number; o: number };
};

function arc(t: number) {
  const k = Math.min(1, Math.max(0, t));
  return { x: 30 + 340 * k, y: HORIZON + 25 - Math.sin(Math.PI * k) * (HORIZON - 190) };
}

export function computeEnv(hour: number): Env {
  const h = ((hour % 24) + 24) % 24;
  let i = 0;
  while (i < SKY_KEYS.length - 2 && h >= SKY_KEYS[i + 1].h) i++;
  const a = SKY_KEYS[i];
  const b = SKY_KEYS[i + 1];
  const t = (h - a.h) / (b.h - a.h);

  const light = smoothstep(5.3, 7.5, h) * (1 - smoothstep(16.8, 19.3, h));
  const warm = Math.exp(-(((h - 6.1) / 0.8) ** 2)) + Math.exp(-(((h - 18.1) / 0.9) ** 2));
  const stars = h < 12 ? 1 - smoothstep(5.0, 7.0, h) : smoothstep(18.0, 20.0, h);

  const sunO = smoothstep(5.4, 6.4, h) * (1 - smoothstep(17.6, 18.6, h));
  const moonO = h >= 12 ? smoothstep(17.8, 19, h) : 1 - smoothstep(5.2, 6.4, h);
  const moonT = (h >= 12 ? h - 18 : h + 6) / 12;

  return {
    hour: h,
    sky: { top: mix(a.top, b.top, t), bottom: mix(a.bottom, b.bottom, t) },
    light,
    warm: Math.min(1, warm),
    stars,
    sun: { ...arc((h - 6) / 12), o: sunO },
    moon: { ...arc(moonT), o: moonO },
  };
}

/** Tiñe un color base según la luz, el atardecer y la bruma (fog 0…1 hacia el cielo). */
export function shade(base: Hex, env: Env, fog = 0): Hex {
  let c = mix(base, "#15123b", (1 - env.light) * 0.72);
  c = mix(c, "#ff9a6a", env.warm * 0.2);
  return mix(c, env.sky.bottom, fog);
}

export function greeting(hour: number) {
  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 19) return "Buenas tardes";
  return "Buenas noches";
}
