import type { ReactNode } from "react";
import { StatFrameOrnament } from "@/src/components/atoms/sheet/frames/StatFrameOrnament";

interface StatFrameProps {
  children: ReactNode;
  width?: number;
  height?: number;
  accentColor?: string;
}


export function StatFrame({
  children,
  width = 96,
  height = 120,
  accentColor = "#e61c23",
}: StatFrameProps) {
  return (
    <div className="relative" style={{ width, height }}>
      <StatFrameOrnament width={width} height={height} accentColor={accentColor} />
      <div className="absolute inset-0 flex flex-col items-center justify-between py-3 px-2">
        {children}
      </div>
    </div>
  );
}
