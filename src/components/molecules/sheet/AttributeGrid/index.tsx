import { cn } from "@/src/lib/utils";

import type { AttributeGridProps } from "./index.types";
export type { AttributeGridProps } from "./index.types";
export function AttributeGrid({ attributes }: AttributeGridProps) {
  return (
    <div className="flex w-full max-w-[660px] flex-wrap justify-center gap-[10px]">
      {attributes.map((attr) => (
        <div
          key={attr.key}
          className="relative flex min-w-[88px] flex-1 basis-[94px] flex-col items-center gap-2 overflow-hidden rounded-xl border border-border bg-surface-nested px-2 pb-[10px] pt-3"
        >
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"
          />
          <span className="text-[10px] font-bold leading-none tracking-[0.16em] text-brand-crimson-alt">
            {attr.abbr}
          </span>
          <span
            className={cn(
              "font-serif text-[31px] font-extrabold leading-none",
              attr.modifier < 0 ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {attr.modifier >= 0 ? "+" : ""}{attr.modifier}
          </span>
          <span className="flex h-6 min-w-[36px] items-center justify-center rounded-full border border-border bg-background px-[9px] text-[12.5px] font-semibold text-muted-foreground">
            {attr.score}
          </span>
        </div>
      ))}
    </div>
  );
}
