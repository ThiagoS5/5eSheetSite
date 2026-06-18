/**
 * Token color class for an ability modifier, by sign/magnitude:
 * negative → crimson, zero → foreground, +1/+2 → gold, ≥ +3 → green.
 * Used on large stat text (≥ text-2xl), which meets WCAG AA for large text.
 */
export function modifierColorClass(modifier: number): string {
  if (modifier < 0) return "text-primary";
  if (modifier === 0) return "text-foreground";
  if (modifier <= 2) return "text-accent";
  return "text-brand-green";
}
