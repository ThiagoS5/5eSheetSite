import { Check } from "lucide-react";

export function ChoiceCounter({
  selected,
  total,
  label,
}: {
  selected: number;
  total: number;
  label: string;
}) {
  const complete = selected === total;

  return (
    <span
      aria-live="polite"
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"
    >
      <span>
        {selected} of {total} {label}
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
