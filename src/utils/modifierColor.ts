
export function modifierColorClass(modifier: number): string {
  if (modifier < 0) return "text-primary";
  if (modifier === 0) return "text-foreground";
  if (modifier <= 2) return "text-accent";
  return "text-brand-green";
}
