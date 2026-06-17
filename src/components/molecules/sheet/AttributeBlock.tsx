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
      <span className="select-none text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        {attribute.abbr}
      </span>
      <span
        className={cn(
          "font-serif text-2xl font-bold leading-none",
          isNegative ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {modifierStr}
      </span>
      <div className="flex h-5 w-10 items-center justify-center rounded-full border border-border bg-background">
        <span className="text-[11px] leading-none text-muted-foreground">{attribute.score}</span>
      </div>
    </StatFrame>
  );
}
