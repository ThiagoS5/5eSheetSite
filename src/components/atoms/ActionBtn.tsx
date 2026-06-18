import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ActionBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  intent?: "primary" | "secondary";
}

export function ActionBtn({
  children,
  intent = "primary",
  className = "",
  type = "button",
  ...props
}: ActionBtnProps) {
  const intentClass =
    intent === "primary"
      ? "border-brand-crimson-alt bg-brand-crimson-alt text-foreground shadow-lg shadow-brand-crimson-alt/20 hover:bg-destructive"
      : "border-border bg-white/5 text-foreground hover:border-white/20 hover:bg-white/10";

  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] outline-none transition focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50 ${intentClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
