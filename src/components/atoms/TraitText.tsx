import type { ReactNode } from "react";

interface TraitTextProps {
  children: ReactNode;
}

export function TraitText({ children }: TraitTextProps) {
  return (
    <span className="font-serif text-base font-bold tracking-wide text-accent">
      {children}
    </span>
  );
}
