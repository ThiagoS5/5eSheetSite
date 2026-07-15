import { StatFrameOrnament } from "@/src/components/atoms/sheet/frames/StatFrameOrnament";

import type { CombatStatFrameProps } from "./index.types";
export type { CombatFrameVariant, CombatStatFrameProps } from "./index.types";


export function CombatStatFrame({
  children,
  variant,
  accentColor = "#7a7e99",
}: CombatStatFrameProps) {
  if (variant === "shield") {
    return (
      <div className="relative flex h-[132px] w-[124px] items-center justify-center">
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
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-[3px] pb-2 text-center leading-tight">
          {children}
        </div>
      </div>
    );
  }

  const w = 88;
  const h = 88;

  return (
    <div className="relative" style={{ width: w, height: h }}>
      <StatFrameOrnament width={w} height={h} accentColor={accentColor} cut={7} />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        {children}
      </div>
    </div>
  );
}
