import { Check } from "lucide-react";

import type { ChoiceCounterProps } from "./index.types";
export type { ChoiceCounterProps } from "./index.types";
export function ChoiceCounter({
  selected,
  total,
  label,
}: ChoiceCounterProps) {
  const complete = selected >= total;
  const extra = Math.max(0, selected - total);

  return (
    <span
      aria-live="polite"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
    >
      <span>
        {Math.min(selected, total)} of {total} {label}
        {extra > 0 ? ` + ${extra} extra` : ""}
      </span>
      {complete ? (
        <span className="inline-flex items-center gap-1 text-brand-green">
          <Check aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="sr-only">complete</span>
        </span>
      ) : null}
    </span>
  );
}
