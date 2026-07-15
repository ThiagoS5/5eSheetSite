
import type { TraitTextProps } from "./index.types";
export type { TraitTextProps } from "./index.types";
export function TraitText({ children }: TraitTextProps) {
  return (
    <span className="font-serif text-base font-bold tracking-wide text-accent">
      {children}
    </span>
  );
}
