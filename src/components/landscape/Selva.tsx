import { shade, mix, type Env } from "@/lib/landscape/palette";
import { Par } from "./Par";

function Leaf({
  x, y, rot, env, base = "#14402d", len = 90,
}: { x: number; y: number; rot: number; env: Env; base?: string; len?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <g className="sway" style={{ transformBox: "fill-box", transformOrigin: "bottom center" }}>
        <path
          d={`M0 0 C${len * 0.3} ${-len * 0.25} ${len * 0.9} ${-len * 0.2} ${len} 0 C${len * 0.9} ${len * 0.2} ${len * 0.3} ${len * 0.25} 0 0Z`}
          fill={shade(base, env)}
        />
      </g>
    </g>
  );
}

function Macaw({ y, dur, delay, env }: { y: number; dur: number; delay: number; env: Env }) {
  return (
    <g transform={`translate(0 ${y})`}>
      <g className="fly" style={{ animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        <g className="bob">
          <ellipse cx="0" cy="0" rx="9" ry="4" fill={shade("#d8362b", env)} />
          <circle cx="9" cy="-1" r="3" fill={shade("#d8362b", env)} />
          <path d="M-9 0 l-16 4 l14 -6z" fill={shade("#2a5fc4", env)} />
          <path d="M-2 -2 q-6 -14 -16 -16 q4 10 8 18z" fill={shade("#f2c23a", env)} />
          <path d="M0 -1 q2 -14 12 -18 q-2 10 -8 19z" fill={shade("#2a5fc4", env)} />
        </g>
      </g>
    </g>
  );
}

export function Selva({ env }: { env: Env }) {
  const water = mix("#4f9a8e", env.sky.bottom, 0.4);
  const night = 1 - env.light;
  return (
    <g>
      <Par k={4}>
        <path
          d="M-20 470 Q40 420 100 456 T230 440 T360 452 T420 438 L420 570 L-20 570Z"
          fill={shade("#4d8f6f", env, 0.5)}
        />
      </Par>

      <Par k={8}>
        <path
          d="M-20 500 Q50 448 110 488 T250 470 T380 486 T420 470 L420 600 L-20 600Z"
          fill={shade("#3d7f5b", env, 0.3)}
        />
      </Par>

      <Par k={12}>
        <path
          d="M185 480 C200 528 140 566 190 626 C250 696 120 744 150 800 L290 800 C262 744 332 696 272 626 C232 576 262 528 216 480Z"
          fill={shade(water, env)}
        />
        {[560, 620, 690].map((y, i) => (
          <rect
            key={i}
            x={180 + i * 8}
            y={y}
            width={36 + i * 14}
            height="2"
            rx="1"
            fill={mix("#ffffff", env.sky.bottom, 0.4)}
            className="shimmer"
            style={{ animationDelay: `${i * 0.8}s` }}
          />
        ))}
      </Par>

      <Par k={18}>
        <path
          d="M-20 470 Q20 436 56 466 Q78 430 118 462 Q150 440 176 486 C170 600 150 700 130 800 L-20 800Z"
          fill={shade("#2f7a4e", env)}
        />
        <path
          d="M420 470 Q386 430 346 462 Q316 438 292 484 C300 600 322 700 340 800 L420 800Z"
          fill={shade("#276b45", env)}
        />
      </Par>

      {/* bruma */}
      <g opacity={0.12 + env.warm * 0.15 + night * 0.05}>
        {[0, 1, 2].map((i) => (
          <ellipse
            key={i}
            cx={100 + i * 110}
            cy={520 + i * 40}
            rx="130"
            ry="26"
            fill={mix("#ffffff", env.sky.bottom, 0.3)}
            className="mist"
            style={{ animationDuration: `${14 + i * 4}s`, animationDelay: `${-i * 5}s` }}
          />
        ))}
      </g>

      <Par k={30}>
        <path
          d="M-20 560 Q30 520 70 556 Q96 520 126 576 C112 680 96 740 90 800 L-20 800Z"
          fill={shade("#1b4d35", env)}
        />
        <path
          d="M420 580 Q388 526 350 560 Q322 530 306 584 C316 690 330 750 336 800 L420 800Z"
          fill={shade("#18472f", env)}
        />
        <Leaf x={-6} y={640} rot={-24} env={env} len={110} />
        <Leaf x={-6} y={700} rot={12} env={env} len={120} />
        <Leaf x={406} y={650} rot={204} env={env} len={110} />
        <Leaf x={406} y={720} rot={168} env={env} len={120} />
      </Par>

      <rect x="-20" y="795" width="440" height="120" fill={shade("#18472f", env)} />

      <Macaw y={200} dur={30} delay={-8} env={env} />
      <Macaw y={246} dur={38} delay={-24} env={env} />

      {/* luciérnagas de noche */}
      <g opacity={night}>
        {[
          [60, 640], [110, 590], [300, 610], [350, 660], [230, 700], [150, 720],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2.2"
            fill="#e9ff8a"
            className="firefly"
            style={{ animationDelay: `${i * 0.7}s`, animationDuration: `${4 + i}s` }}
          />
        ))}
      </g>
    </g>
  );
}
