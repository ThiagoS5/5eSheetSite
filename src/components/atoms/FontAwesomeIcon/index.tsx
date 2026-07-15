

import type { FontAwesomeIconProps } from "./index.types";
export type { FontAwesomeIconProps } from "./index.types";
export function FontAwesomeIcon({
  iconClassName,
  className = "",
}: FontAwesomeIconProps) {
  return (
    <i
      aria-hidden="true"
      className={`${iconClassName} ${className}`.trim()}
    />
  );
}

export function getHitDieIconClass(hitDie: number): string {
  const iconByHitDie: Record<number, string> = {
    6: "fa-regular fa-dice-d6",
    8: "fa-regular fa-dice-d8",
    10: "fa-regular fa-dice-d10",
    12: "fa-regular fa-dice-d12",
  };

  return iconByHitDie[hitDie] ?? "fa-regular fa-dice-d20";
}
