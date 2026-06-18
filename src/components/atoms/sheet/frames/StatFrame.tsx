import type { ReactNode } from "react";

interface StatFrameProps {
  children: ReactNode;
  width?: number;
  height?: number;
  accentColor?: string;
}

/**
 * Moldura ornamental (estilo ficha tradicional de D&D) para um bloco de
 * atributo. Desenhada como SVG inline — sem dependências externas — com cantos
 * octagonais, borda dupla e pequenos ornamentos angulares nos quatro cantos.
 * A cor de acento é sempre recebida via prop.
 */
export function StatFrame({
  children,
  width = 96,
  height = 120,
  accentColor = "#e61c23",
}: StatFrameProps) {
  const cut = 8;
  const framePath = `M ${cut} 0 L ${width - cut} 0 L ${width} ${cut} L ${width} ${height - cut} L ${width - cut} ${height} L ${cut} ${height} L 0 ${height - cut} L 0 ${cut} Z`;
  const innerPath = `M ${cut + 3} 3 L ${width - cut - 3} 3 L ${width - 3} ${cut + 3} L ${width - 3} ${height - cut - 3} L ${width - cut - 3} ${height - 3} L ${cut + 3} ${height - 3} L 3 ${height - cut - 3} L 3 ${cut + 3} Z`;

  return (
    <div className="relative" style={{ width, height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={framePath} fill="#12131a" />
        <path d={framePath} fill="none" stroke={accentColor} strokeWidth="1" opacity="0.6" />
        <path d={innerPath} fill="none" stroke={accentColor} strokeWidth="0.5" opacity="0.3" />
        {/* Ornamentos de canto */}
        <path d={`M 2 ${cut + 2} L ${cut + 2} 2`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
        <path d={`M ${width - cut - 2} 2 L ${width - 2} ${cut + 2}`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
        <path d={`M 2 ${height - cut - 2} L ${cut + 2} ${height - 2}`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
        <path d={`M ${width - 2} ${height - cut - 2} L ${width - cut - 2} ${height - 2}`} stroke={accentColor} strokeWidth="1.5" opacity="0.8" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-between py-3 px-2">
        {children}
      </div>
    </div>
  );
}
