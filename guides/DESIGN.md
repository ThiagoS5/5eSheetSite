# Design System - Forge & Fate

This guide defines the visual grammar of the app. It complements `PRODUCT.md`, `MANIFESTO.md`, and the master plan.

## Register And Mood

Forge & Fate is product UI first. Design serves creation, review, play, and export workflows.

The visual grammar is dark tactical fantasy: ornate where it reinforces the fantasy, restrained where users need speed and clarity. The character sheet is the hero artifact; the builder assembles it.

The reference is a curated character vault and advanced tactical panel, not a SaaS dashboard, marketing landing page, static PDF clone, or generic form wizard.

## Current Product Surfaces

Design work must stay anchored to the real app:

- Vault dashboard with empty, populated, search, import, create, and character-card states.
- 10-step builder with sidebar, mobile bar, guided help, quick build, step validation, and live sheet preview.
- Builder conclusion surface, which embeds the canonical sheet renderer.
- `/sheet` live character sheet with play state, notes, tabs, exports, and level-up.
- Printable PDF output, which has its own print palette but must preserve product clarity and information hierarchy.

## Theme And Color

Dark is the default committed app theme. OKLCH tokens live in `app/globals.css`; app components should use tokens, not hardcoded color literals.

Roles:

- Surfaces: `--background` -> `--surface-nested` -> `--card`. Keep the layering shallow.
- Crimson `--primary` / `--brand-crimson-alt`: action, current selection, primary CTA, active step.
- Gold `--brand-gold-alt` / `--accent`: focus, ornate frame, attention/pending affordances.
- Green `--brand-green`: complete/valid.
- Ink: `--foreground`, `--subdued`, `--muted-foreground`.
- Border: `--border`, usually a single subtle hairline.

Contrast rule: body text must meet WCAG 2.2 AA. Do not use crimson as small functional text on a dark background when it fails contrast; use foreground text with a crimson indicator.

PDF note: the PDF adapter may define a small print-specific palette because it renders outside Tailwind. Keep that palette local to the PDF adapter.

## Ornate Frame Vocabulary

The canonical ornate primitives are the gilded corner, rail, and banner language used by hero choice cards and the sheet hero. Use heavier ornament for hero moments only:

1. Class/species/background choice moments.
2. Locked or level-up panels.
3. Sheet hero and important completion states.
4. Printable sheet headers.

For dense work surfaces, prefer lighter cues:

- Gilded top rail.
- Corner accents.
- Small crest icon.
- Subtle border and background layering.

Do not combine multiple competing card styles inside the same panel.

## Typography

- Serif display (`font-serif`) for hero names, panel titles, and big numbers.
- Sans for interface copy and dense data.
- Do not introduce a third family.
- Use a fixed product scale, not viewport-fluid type.
- Functional labels should be at least 12px.
- Reserve tiny uppercase text for non-critical metadata inside stat frames.
- Keep letter spacing restrained and readable.
- Use `text-wrap: balance` for major headings where appropriate.

## Motion

Motion should be 150-250ms and communicate state. Transition only `transform`, `opacity`, `color`, `border-color`, and `box-shadow`.

Do not transition layout properties such as width, height, margin, padding, top, or left. Avoid `transition-all` for UI layout.

Respect `prefers-reduced-motion`.

## Layout

- Mobile-first and container-aware.
- No fixed minimum widths on flexible columns that can clip phones.
- Use `min-w-0`, stable grid tracks, `flex-basis`, and explicit aspect/size constraints for fixed-format elements.
- Verify at 390px, tablet, desktop, and 200 percent zoom for UI-heavy changes.
- The mobile builder separates step navigation from live sheet access. Do not blur those actions together.
- The sheet should read as a dense tactical dashboard, not a large whitespace-heavy showcase.

## Anti-Patterns

Do not reintroduce:

- Nested cards.
- Thick side-tab accents.
- Hero-eyebrow chips.
- Placeholder buttons with no handler.
- Glassmorphism as the default surface language.
- Gradient text.
- Identical icon/title/text marketing-card grids.
- Decorative effects that compete with sheet data.
- App component hex colors when a design token exists.
- Visible instructional copy describing how to use every control.

## Accessibility

Design must preserve:

- Keyboard access.
- Visible focus.
- Semantic controls.
- Accessible names for icon-only buttons.
- Contrast at WCAG 2.2 AA.
- Reduced-motion paths.
- Text that fits its container at mobile widths.

Use native HTML semantics before adding ARIA.

## Verification Loop

For UI changes, run the relevant tests and inspect the target screen:

- Focused Vitest/Testing Library tests.
- `npm run typecheck`.
- `npm run lint`.
- Browser checks at mobile, tablet, and desktop for layout-sensitive work.
- Computed-style or DOM checks for overflow/contrast when visual screenshots are too heavy.
