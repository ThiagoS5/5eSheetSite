/**
 * Shared style fragments for hand-rolled (non-shadcn) interactive elements.
 *
 * `focusRing` is the single canonical keyboard-focus treatment for buttons and
 * toggles that don't go through `buttonVariants`. It mirrors the ring used by
 * the base `Button` (`ring-3 ring-ring/50`) so every interactive element shows
 * the same visible ring — and never ships `outline-none` without a replacement.
 *
 * Usage: append to a `cn(...)`/template string on the interactive element.
 */
export const focusRing =
  "outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
