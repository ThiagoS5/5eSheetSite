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
      ? "border-[#c41e1e] bg-[#c41e1e] text-white shadow-lg shadow-[#c41e1e]/20 hover:bg-[#a91515]"
      : "border-white/10 bg-white/5 text-[#e8e9f0] hover:border-white/20 hover:bg-white/10";

  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] outline-none transition focus-visible:ring-2 focus-visible:ring-[#f3c969] disabled:cursor-not-allowed disabled:opacity-50 ${intentClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
