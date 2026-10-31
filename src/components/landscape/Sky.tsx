import { HORIZON, mix, type Env } from "@/lib/landscape/palette";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(2024);
const STARS = Array.from({ length: 46 }, () => ({
  x: rand() * 400,
  y: rand() * 400,
  r: 0.6 + rand() * 1.1,
  d: rand() * 4,
}));

const CLOUDS = [
  { y: 150, s: 1.1, dur: 90, delay: -20 },
  { y: 230, s: 0.8, dur: 120, delay: -70 },
  { y: 310, s: 1.3, dur: 150, delay: -40 },
  { y: 90, s: 0.7, dur: 110, delay: -95 },
];

export function Sky({ env }: { env: Env }) {
  const cloudColor = mix("#ffffff", env.sky.bottom, 0.25 + env.warm * 0.2);
  const cloudOpacity = 0.25 + env.light * 0.6;

  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2={HORIZON} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={env.sky.top} />
          <stop offset="1" stopColor={env.sky.bottom} />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#ffd08a" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffb070" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonGlow">
          <stop offset="0" stopColor="#fff6d8" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff6d8" stopOpacity="0" />
        </radialGradient>
        <mask id="moonMask">
          <rect x="-40" y="-40" width="80" height="80" fill="white" />
          <circle cx="9" cy="-5" r="15" fill="black" />
        </mask>
        <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9a6a" stopOpacity="0" />
          <stop offset="1" stopColor="#ff9a6a" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <rect x="0" y="-100" width="400" height="1000" fill="url(#sky)" />
      <rect
        x="0"
        y={HORIZON - 220}
        width="400"
        height="220"
        fill="url(#horizonGlow)"
        opacity={env.warm}
      />

      <g opacity={env.stars}>
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fff"
            className="twinkle"
            style={{ animationDelay: `${s.d}s` }}
          />
        ))}
      </g>

      <g opacity={env.sun.o} transform={`translate(${env.sun.x} ${env.sun.y})`}>
        <circle r="90" fill="url(#sunGlow)" />
        <circle r="20" fill="#fff3c4" />
      </g>

      <g opacity={env.moon.o} transform={`translate(${env.moon.x} ${env.moon.y})`}>
        <circle r="60" fill="url(#moonGlow)" />
        <circle r="17" fill="#fff6d8" mask="url(#moonMask)" />
      </g>

      <g opacity={cloudOpacity}>
        {CLOUDS.map((c, i) => (
          <g key={i} transform={`translate(0 ${c.y})`}>
            <g
              className="cloud-drift"
              style={{ animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
            >
              <g transform={`scale(${c.s})`} fill={cloudColor}>
                <ellipse cx="0" cy="0" rx="46" ry="13" />
                <ellipse cx="-18" cy="-9" rx="22" ry="14" />
                <ellipse cx="14" cy="-12" rx="26" ry="16" />
              </g>
            </g>
          </g>
        ))}
      </g>
    </g>
  );
}
