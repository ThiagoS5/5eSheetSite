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
    <StatFrame width={104} height={124} accentColor="#e61c23">
      <span className="select-none text-base font-semibold uppercase tracking-widest text-muted-foreground">
        {attribute.abbr}
      </span>
      <span
        className={cn(
          "font-serif text-3xl font-bold leading-none",
          isNegative ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {modifierStr}
      </span>
      <div className="flex h-7 w-12 items-center justify-center rounded-full border border-border bg-background">
        <span className="text-base leading-none text-muted-foreground">{attribute.score}</span>
      </div>
    </StatFrame>
  );
}
