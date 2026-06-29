import { cn } from "@/src/lib/utils";

interface SpinnerProps {
  /** Tailwind size utility(ies), e.g. "size-4". Defaults to the current text size. */
  className?: string;
  /**
   * Accessible label. When omitted the spinner is decorative (`aria-hidden`) —
   * use this when an ancestor already conveys the busy state (e.g. a Button with
   * `aria-busy`). Provide a label when the spinner stands alone.
   */
  label?: string;
}

/**
 * Single source-of-truth loading indicator. Inline SVG (no icon dependency) so
 * it ships cleanly in the bundle. Animation is gated behind `motion-safe:` so
 * users with `prefers-reduced-motion: reduce` get a static ring instead of spin.
 */
export function Spinner({ className, label }: SpinnerProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("size-[1em] motion-safe:animate-spin", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
