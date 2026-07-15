
import type { ActionBtnProps } from "./index.types";
export type { ActionBtnProps } from "./index.types";
export function ActionBtn({
  children,
  intent = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ActionBtnProps) {
  const intentClass =
    intent === "primary"
      ? "border-brand-crimson-alt bg-brand-crimson-alt text-foreground shadow-lg shadow-brand-crimson-alt/20 hover:bg-destructive"
      : "border-border bg-white/5 text-foreground hover:border-white/20 hover:bg-white/10";

  const sizeClass =
    size === "sm"
      ? "min-h-9 px-3 py-1.5 text-xs"
      : "min-h-11 px-4 py-2 text-sm";

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-md border font-bold uppercase tracking-[0.08em] outline-none transition focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${intentClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
