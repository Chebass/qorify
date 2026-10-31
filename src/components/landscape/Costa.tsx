import { HORIZON, shade, mix, type Env } from "@/lib/landscape/palette";
import { Par } from "./Par";

function waves(y: number) {
  return `M-100 ${y} q25 -8 50 0` + " t50 0".repeat(13) + ` L520 800 L-100 800Z`;
}

function Palm({ x, y, env, s = 1 }: { x: number; y: number; env: Env; s?: number }) {
  const trunk = shade("#5a4030", env);
  const leaf = shade("#2f7a4a", env);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 C4 -40 -4 -80 6 -120" stroke={trunk} strokeWidth="6" fill="none" strokeLinecap="round" />
      <g
        transform="translate(6 -120)"
        fill={leaf}
        className="sway"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <path d="M0 0 C-30 -18 -62 -4 -74 22 C-46 4 -24 0 0 0Z" />
        <path d="M0 0 C30 -18 62 -4 74 22 C46 4 24 0 0 0Z" />
        <path d="M0 0 C-14 -32 -40 -44 -64 -36 C-36 -34 -16 -22 0 0Z" />
        <path d="M0 0 C14 -32 40 -44 64 -36 C36 -34 16 -22 0 0Z" />
        <path d="M0 0 C-2 -30 4 -50 0 -62 C-10 -44 -6 -22 0 0Z" />
      </g>
    </g>
  );
}

function Bird({ y, dur, delay, env }: { y: number; dur: number; delay: number; env: Env }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <g className="fly" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        <path
          d="M0 0 q6 -7 12 0 q6 -7 12 0"
          fill="none"
          stroke={shade("#3a3550", env)}
          strokeWidth="2"
          strokeLinecap="round"
          className="bob"
        />
      </g>
    </g>
  );
}

export function Costa({ env }: { env: Env }) {
  const seaTop = mix("#2f8fb0", env.sky.bottom, 0.35);
  const seaBottom = "#16507c";
  return (
    <g>
      <defs>
        <linearGradient id="sea" x1="0" y1={HORIZON} x2="0" y2="800" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={shade(seaTop, env)} />
          <stop offset="1" stopColor={shade(seaBottom, env)} />
        </linearGradient>
      </defs>

      <Par k={3}>
        <path
          d={`M240 ${HORIZON} Q262 ${HORIZON - 22} 290 ${HORIZON}Z`}
          fill={shade("#6a7aa0", env, 0.5)}
        />
        <path
          d={`M320 ${HORIZON} Q336 ${HORIZON - 14} 356 ${HORIZON}Z`}
          fill={shade("#6a7aa0", env, 0.55)}
        />
      </Par>

      <rect x="-20" y={HORIZON} width="440" height={900 - HORIZON} fill="url(#sea)" />

      {/* reflejo del sol/luna */}
      <g opacity={Math.max(env.sun.o, env.moon.o * 0.6) * 0.8}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const cx = env.sun.o >= env.moon.o ? env.sun.x : env.moon.x;
          return (
            <rect
              key={i}
              x={cx - 36 + i * 3}
              y={HORIZON + 10 + i * 24}
              width={72 - i * 10}
              height="3"
              rx="1.5"
              fill={env.sun.o >= env.moon.o ? "#ffe2a8" : "#fff6d8"}
              className="shimmer"
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          );
        })}
      </g>

      <Par k={8}>
        <g fill={mix("#ffffff", env.sky.bottom, 0.5)} opacity="0.35">
          <g className="wave" style={{ animationDuration: "9s" }}>
            <path d={waves(HORIZON + 60)} />
          </g>
        </g>
        <g fill={shade("#1c6a96", env)} opacity="0.55">
          <g className="wave" style={{ animationDuration: "6s" }}>
            <path d={waves(HORIZON + 140)} />
          </g>
        </g>
        <g fill={shade("#12507c", env)} opacity="0.6">
          <g className="wave" style={{ animationDuration: "4.5s" }}>
            <path d={waves(HORIZON + 240)} />
          </g>
        </g>
      </Par>

      <Par k={14}>
        <path
          d="M-20 420 L74 436 L86 452 L112 520 L134 640 L96 800 L-20 800Z"
          fill={shade("#9a6a52", env)}
        />
        <path d="M-20 416 L76 434 L84 448 L-20 440Z" fill={shade("#4d8a4a", env)} />
        <path d="M60 470 L112 520 L134 640 L120 640 L90 520Z" fill={shade("#7c5440", env)} opacity="0.7" />
        <Palm x={30} y={430} env={env} s={0.9} />
        <Palm x={62} y={436} env={env} s={0.65} />
      </Par>

      <Par k={22}>
        <path d="M130 800 Q260 706 420 696 L420 800Z" fill={shade("#dcbd8e", env)} />
        <path
          d="M150 800 Q270 718 420 708"
          fill="none"
          stroke={mix("#ffffff", env.sky.bottom, 0.2)}
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.7"
          className="shimmer"
        />
      </Par>

      <rect x="-20" y="795" width="150" height="120" fill={shade("#9a6a52", env)} />
      <rect x="125" y="795" width="300" height="120" fill={shade("#dcbd8e", env)} />

      <Bird y={180} dur={34} delay={-6} env={env} />
      <Bird y={210} dur={40} delay={-22} env={env} />
      <Bird y={160} dur={46} delay={-30} env={env} />
    </g>
  );
}
