import type { SheetAttribute } from "@/types/builder";
import { cn } from "@/src/lib/utils";
import { StatFrame } from "@/src/components/atoms/sheet/frames/StatFrame";

interface AttributeBlockProps {
  attribute: SheetAttribute;
}

export function AttributeBlock({ attribute }: AttributeBlockProps) {
  const isNegative = attribute.modifier < 0;
  const modifierStr =
    attribute.modifier >= 0 ? `+${attribute.modifier}` : `${attribute.modifier}`;

  return (
    <StatFrame width={88} height={108} accentColor="#e61c23">
      <span className="select-none text-[9px] font-semibold uppercase tracking-widest text-[#7a7e99]">
        {attribute.abbr}
      </span>
      <span
        className={cn(
          "font-serif text-2xl font-bold leading-none",
          isNegative ? "text-[#7a7e99]" : "text-white",
        )}
      >
        {modifierStr}
      </span>
      <div className="flex h-5 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0a0b10]">
        <span className="text-[11px] leading-none text-[#7a7e99]">{attribute.score}</span>
      </div>
    </StatFrame>
  );
}
