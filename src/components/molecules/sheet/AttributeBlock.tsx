import type { SheetAttribute } from "@/types/builder";
import { cn } from "@/src/lib/utils";

const ACCENT: Partial<Record<string, string>> = {
  forca: "bg-[#e61c23]",
  constituicao: "bg-[#e61c23]",
  destreza: "bg-[#f3c969]",
};

interface AttributeBlockProps {
  attribute: SheetAttribute;
}

export function AttributeBlock({ attribute }: AttributeBlockProps) {
  const accent = ACCENT[attribute.key] ?? "bg-white/10";
  const sign = attribute.modifier >= 0 ? "+" : "";

  return (
    <div className="relative flex flex-col items-center overflow-hidden rounded-lg border border-white/[0.08] bg-[#1c1e2a] py-3">
      {/* left accent bar */}
      <div className={cn("absolute left-0 top-0 h-full w-1", accent)} />

      <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
        {attribute.abbr}
      </span>
      <span className="mt-1 font-serif text-2xl font-bold leading-none text-white">
        {sign}{attribute.modifier}
      </span>
      <span className="mt-1 text-[0.7rem] text-[#7a7e99]">({attribute.score})</span>
    </div>
  );
}
