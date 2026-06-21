import type { ReactNode } from "react";

type CombatFrameVariant = "shield" | "square";

interface CombatStatFrameProps {
  children: ReactNode;
  variant: CombatFrameVariant;
  accentColor?: string;
}

/**
 * Moldura SVG inline para estatísticas de combate (CA, Iniciativa, Velocidade).
 * `shield` desenha um escudo clássico; `square` é consistente com o StatFrame
 * dos atributos. A cor de acento é sempre recebida via prop.
 */
export function CombatStatFrame({
  children,
  variant,
  accentColor = "#7a7e99",
}: CombatStatFrameProps) {
  if (variant === "shield") {
    return (
      <div className="relative flex h-[124px] w-[116px] items-center justify-center">
        <svg
          viewBox="0 0 100 110"
          className="absolute inset-0 h-full w-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 50 4 L 94 18 L 94 54 C 94 80 72 100 50 106 C 28 100 6 80 6 54 L 6 18 Z"
            fill="#12131a"
            stroke={accentColor}
            strokeWidth="1.5"
            opacity="0.8"
          />
          <path
            d="M 50 10 L 88 22 L 88 54 C 88 77 68 96 50 101 C 32 96 12 77 12 54 L 12 22 Z"
            fill="none"
            stroke={accentColor}
            strokeWidth="0.5"
            opacity="0.35"
          />
        </svg>
        <div className="relative z-10 flex h-full flex-col items-center justify-center pb-2">
          {children}
        </div>
      </div>
    );
  }

  const w = 108;
  const h = 108;
  const cut = 8;
  const framePath = `M ${cut} 0 L ${w - cut} 0 L ${w} ${cut} L ${w} ${h - cut} L ${w - cut} ${h} L ${cut} ${h} L 0 ${h - cut} L 0 ${cut} Z`;
  const innerPath = `M ${cut + 3} 3 L ${w - cut - 3} 3 L ${w - 3} ${cut + 3} L ${w - 3} ${h - cut - 3} L ${w - cut - 3} ${h - 3} L ${cut + 3} ${h - 3} L 3 ${h - cut - 3} L 3 ${cut + 3} Z`;

  return (
    <div className="relative" style={{ width: w, height: h }}>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        className="absolute inset-0 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={framePath} fill="#12131a" />
        <path d={framePath} fill="none" stroke={accentColor} strokeWidth="1" opacity="0.6" />
        <path d={innerPath} fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
        <path d={`M 2 ${cut + 2} L ${cut + 2} 2`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
        <path d={`M ${w - cut - 2} 2 L ${w - 2} ${cut + 2}`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
        <path d={`M 2 ${h - cut - 2} L ${cut + 2} ${h - 2}`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
        <path d={`M ${w - 2} ${h - cut - 2} L ${w - cut - 2} ${h - 2}`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {children}
      </div>
    </div>
  );
}
