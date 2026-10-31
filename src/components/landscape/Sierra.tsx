import { shade, mix, type Env } from "@/lib/landscape/palette";
import { Par } from "./Par";

function Pines({ x, y, env, base }: { x: number; y: number; env: Env; base: string }) {
  const c = shade(base, env, 0.05);
  return (
    <g transform={`translate(${x} ${y})`} fill={c}>
      {[0, 14, 28, 8, 22].map((dx, i) => {
        const h = 34 + ((i * 7) % 18);
        const oy = i > 2 ? 10 : 0;
        return (
          <path key={i} d={`M${dx} ${oy} l-9 ${h} h18 z M${dx} ${oy - 10} l-7 ${h * 0.6} h14 z`} />
        );
      })}
    </g>
  );
}

function Llama({ x, y, env }: { x: number; y: number; env: Env }) {
  const body = shade("#e6d3ad", env);
  return (
    <g transform={`translate(${x} ${y}) scale(0.8)`} fill={body}>
      <ellipse cx="0" cy="0" rx="22" ry="12" />
      <path d="M14 -6 L20 -30 L28 -30 L24 -4 Z" />
      <ellipse cx="26" cy="-33" rx="8" ry="5.5" />
      <path d="M22 -37 l-2 -9 l5 6 z M29 -37 l1 -9 l3 8 z" />
      <path d="M-14 8 v22 h5 v-22 z M-4 9 v22 h5 v-22 z M8 9 v22 h5 v-22 z M16 6 v24 h5 v-24 z" />
      <path d="M-22 -2 q-10 2 -9 12 q6 -4 9 -6 z" />
    </g>
  );
}

export function Sierra({ env }: { env: Env }) {
  const lake = mix("#4a8fb8", env.sky.bottom, 0.45);
  return (
    <g>
      <Par k={4}>
        <path
          d="M-20 480 L60 405 L110 445 L170 365 L230 435 L290 385 L350 435 L420 400 L420 540 L-20 540Z"
          fill={shade("#7a7fb0", env, 0.55)}
        />
      </Par>

      <Par k={8}>
        <path d="M120 540 L252 300 L300 362 L340 332 L440 540Z" fill={shade("#8b6f8f", env, 0.18)} />
        <path
          d="M252 300 L229 346 L243 339 L253 359 L267 338 L285 351 L275 327Z"
          fill={shade("#f4f6ff", env, 0.05)}
        />
        <path
          d="M252 300 L260 340 L267 338 L285 351 L275 327Z"
          fill={shade("#cfd6ee", env, 0.05)}
          opacity="0.7"
        />
        <path
          d="M-20 520 L40 470 L95 505 L150 460 L210 520 L210 560 L-20 560Z"
          fill={shade("#6a5e86", env, 0.25)}
        />
      </Par>

      <Par k={12}>
        <path
          d="M-10 560 Q80 500 170 535 T340 520 T420 540 L420 640 L-10 640Z"
          fill={shade("#4f6b57", env, 0.1)}
        />
        <Pines x={18} y={540} env={env} base="#27482f" />
        <Pines x={340} y={548} env={env} base="#2c4f35" />
      </Par>

      <Par k={14}>
        <path d="M-10 600 Q100 585 200 600 T420 596 L420 700 L-10 700Z" fill={shade(lake, env)} />
        {[612, 630, 650].map((y, i) => (
          <rect
            key={i}
            x={70 + i * 50}
            y={y}
            width={90 - i * 14}
            height="2"
            rx="1"
            fill={mix("#ffffff", env.sky.bottom, 0.4)}
            className="shimmer"
            style={{ animationDelay: `${i * 0.9}s` }}
          />
        ))}
      </Par>

      <Par k={20}>
        <path
          d="M-10 690 Q60 664 130 684 T270 676 T420 690 L420 730 L-10 730Z"
          fill={shade("#5d7a4a", env)}
        />
        <path
          d="M-10 722 Q80 698 170 716 T330 708 T420 720 L420 760 L-10 760Z"
          fill={shade("#6b8a50", env)}
        />
        <path
          d="M-10 752 Q100 730 200 746 T420 740 L420 800 L-10 800Z"
          fill={shade("#7a9658", env)}
        />
        <Llama x={90} y={720} env={env} />
        <Llama x={150} y={742} env={env} />
      </Par>

      <Par k={30}>
        <path
          d="M-10 780 Q120 752 230 782 T420 770 L420 800 L-10 800Z"
          fill={shade("#2f4034", env)}
        />
      </Par>
      <rect x="-20" y="795" width="440" height="120" fill={shade("#2f4034", env)} />
    </g>
  );
}
