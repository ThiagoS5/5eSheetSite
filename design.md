# Forge & Fate - Stitch-Ready Product Design Brief

## Stitch Master Prompt

Design a high-fidelity responsive web application called **Forge & Fate**, a polished D&D 5e character builder for Portuguese-speaking players. The interface should feel like a serious dark-fantasy command center: gothic, immersive, refined, accessible, and professional. It must not look like a generic SaaS dashboard, a childish fantasy game menu, or a beige parchment roleplaying sheet.

Create a complete product design system and key screens for:

1. A character dashboard with empty and populated states.
2. A nine-step character creation wizard.
3. A live character sheet preview that updates as the user builds the character.

Use a dark obsidian/charcoal foundation, crimson as the primary action and active-state color, muted steel text, and restrained gold/green/blue accents for secondary statuses. Keep the experience dense enough for RPG data, but calm, readable, keyboard-friendly, and responsive on desktop, tablet, and mobile.

User-facing UI text should be in **Portuguese (Brazil)**. This design brief is written in English only so design-generation tools can interpret it accurately.

Do not generate a marketing landing page. The first screen must be the actual usable app.

---

## Product Context

**Product name:** Forge & Fate  
**Product type:** Web app for building and managing D&D 5e characters  
**Primary audience:** Players who want a guided, readable, rules-aware character creation flow  
**Secondary audience:** Dungeon Masters reviewing a player's character sheet  
**Tone:** Dark fantasy, ritualistic, precise, trustworthy, tool-like  
**Core feeling:** "I am forging a legend with a serious, elegant RPG tool."

The product is not a combat tracker, tabletop VTT, or lore encyclopedia. It is focused on character creation, saved character management, and a live structured character sheet preview.

## Design Goals

- Make complex RPG decisions feel guided, not overwhelming.
- Keep mechanical information scannable: hit die, proficiencies, saves, traits, equipment, ability scores, validation status, and final sheet summary.
- Preserve a premium dark-fantasy atmosphere without sacrificing readability.
- Use strong hierarchy and compact information architecture instead of decorative clutter.
- Make every interaction understandable with keyboard, screen reader, and pointer input.
- Keep the design responsive without horizontal overflow at narrow mobile widths.

## Non-Goals

- Do not create a generic homepage, sales page, pricing page, or marketing hero.
- Do not create a bright high-fantasy theme, cartoon fantasy theme, anime game menu, cyberpunk theme, or beige parchment-heavy theme.
- Do not mimic official D&D/Wizards of the Coast visual trade dress, logos, book covers, or proprietary styling.
- Do not rely on low-contrast gray text, excessive glassmorphism, decorative bokeh/orbs, or purple-blue gradient dominance.
- Do not hide required choices behind hover-only interactions.

---

## Visual Identity

### Art Direction

Forge & Fate should look like a gothic character-forging interface inside a controlled arcane workshop. It should be atmospheric but not noisy. The UI should feel closer to a premium productivity tool for RPG character management than to a fantasy splash screen.

Use subtle visual signals:

- Obsidian surfaces.
- Thin crimson active lines.
- Iron-like borders.
- Soft red glows only for primary action focus, active cards, and progress.
- Very subtle grain/noise texture on large dark surfaces.
- Sharp typographic hierarchy.
- Small symbols, badges, and stat tiles to support scanning.

Avoid oversized ornamental frames, scroll textures, fake torn paper, heavy medieval decoration, skulls, flames, and overloaded fantasy props.

### Color Tokens

Use these colors as the design foundation:

- **Global background:** `#0A0B10` obsidian black.
- **Main app surface:** `#12131A` deep charcoal.
- **Raised card surface:** `#14151B` or `#1C1E2A`.
- **Nested/field surface:** `#0F1018`.
- **Border subtle:** `rgba(255,255,255,0.06)`.
- **Border interactive:** `rgba(255,255,255,0.10)`.
- **Primary crimson:** `#E61C23`.
- **Deep crimson hover:** `#A91515`.
- **Dark crimson active:** `#C41E1E`.
- **Text primary:** `#FFFFFF` or `#F8FAFC`.
- **Text body:** `#E8E9F0`.
- **Text muted:** `#B0B5CC`.
- **Text subdued:** `#7A7E99`.
- **Gold accent:** `#F3C969` for magic, warnings, spellcasting, special rules.
- **Green accent:** `#50C878` for completed steps and valid status.
- **Blue accent:** `#4A9EFF` for armor, defense, or informational metrics.
- **Warm orange:** `#F4A261` for initiative or secondary numeric highlights.

Crimson is the system accent. Use it for primary buttons, current step, selected cards, focus rings, active nav state, and key progress bars. Do not flood the interface with red backgrounds.

### Typography

Use a three-role type system:

- **Display / fantasy identity:** A refined serif such as EB Garamond, Cormorant Garamond, or another elegant fantasy-appropriate serif.
- **Interface / forms / body:** A clean sans-serif such as Inter, Geist Sans, or similar.
- **Stats / badges / numeric values:** A monospace font such as JetBrains Mono, Geist Mono, or similar.

Rules:

- Use serif for app title, screen titles, card titles, and character names.
- Use sans-serif for descriptions, form labels, body copy, navigation, and controls.
- Use mono for level, HP, AC, proficiency, markers, badges, counters, source labels, and compact metadata.
- Keep letter spacing normal for body text. Use uppercase tracking only for small labels and badges.
- Avoid viewport-scaled font sizes. Text must not overflow buttons or cards.

### Shape, Spacing, and Motion

- Use mostly `8px` radius for cards, dialogs, fields, and buttons.
- Use `12px` radius only for avatars, large containers, or mobile bottom nav.
- Use thin borders and restrained shadows.
- Prefer compact vertical rhythm: `12px`, `16px`, `20px`, `24px`, `32px`.
- Hover states may lift cards slightly, but never shift layout.
- Motion should be subtle: 150-250ms transitions for color, border, shadow, transform.
- Respect reduced-motion preferences.

---

## Information Architecture

The app has three primary surfaces.

### 1. Character Dashboard

Purpose: show saved characters and let the user create or continue a character.

States:

- Empty state: no saved characters.
- Populated state: saved character cards plus a new-character card.

Primary actions:

- `CRIAR NOVO PERSONAGEM`
- `Continuar`
- Secondary icon-only actions for view/profile/settings/notifications.

Expected desktop structure:

- Fixed top navigation bar.
- Left brand group with logo mark and `Forge & Fate`.
- Center/top desktop nav: `Grimoire`, `Vault`, `Tavern`, `Codex`.
- Right utility actions: notifications, settings, profile avatar.
- Main content below top nav, max width around 1280px.
- Saved character grid with 1-3 columns depending on viewport.

Expected mobile structure:

- Compact top brand bar.
- Character content starts below fixed header.
- Bottom navigation with four items: `Forge`, `Spells`, `Vault`, `Profile`.
- Primary create action remains easy to reach.

Empty state details:

- Centered composition.
- Large subtle forge/logo mark with low-opacity glow.
- Title: `Forje Sua Alma`.
- Supporting copy: `O multiverso aguarda seu comando. Comece sua lenda criando seu primeiro personagem hoje.`
- Primary crimson button with plus icon: `CRIAR NOVO PERSONAGEM`.

Populated state details:

- Header: `Bem-vindo, Arquiteto`.
- Subcopy: `Sua jornada continua.`
- Section title: `Seus Personagens`.
- A dashed `Novo Heroi` creation card.
- Character cards showing avatar or fallback glyph, name, level, species/class line, `Continuar` action, and an icon-only view action.

### 2. Character Creation Wizard

Purpose: guide the user through character creation step by step.

Desktop layout:

- Three-column application layout.
- Left column: collapsible step sidebar, about `16rem` expanded and `4.5rem` collapsed.
- Center column: active step content, flexible width, no horizontal overflow.
- Right column: live sheet preview, about `22rem-24rem`, collapsible to `4.5rem`.
- Sticky top header inside the center column.
- Sticky bottom step navigation for `Voltar` and `Avancar`.

Tablet/mobile layout:

- Stack sidebar, content, and preview.
- Step navigation becomes horizontally scrollable or compact.
- Preview may sit below the current step or become collapsible.
- Bottom action bar stays reachable and respects safe-area insets.
- Cards become single-column on narrow screens.

Wizard steps:

1. `Classe` (`CL`) - choose class.
2. `Recursos de Classe` (`RC`) - class skills and level-one features.
3. `Antecedente` (`BG`) - background, ability bonuses, origin feat.
4. `Raca/Especie` (`SP`) - species selection.
5. `Detalhes da Especie` (`DE`) - species choices and languages.
6. `Atributos` (`AT`) - standard array, point buy, or manual values.
7. `Equipamento` (`EQ`) - class gear, gold, optional items.
8. `Descricao` (`DS`) - narrative details.
9. `Conclusao` (`OK`) - summary and final review.

Sidebar behavior:

- Current step uses crimson border/background and white text.
- Completed steps use green accents and a check mark.
- Locked steps use subdued gray and are visibly disabled.
- Each item shows marker, full label, and `Etapa N`.
- Collapsed state keeps markers visible and preserves accessible labels.
- Progress card shows completed count and a crimson progress bar.

Step content pattern:

- Start every step with a compact header: small crimson eyebrow, serif title, muted description.
- Use a dense grid of cards, fieldsets, controls, or form sections depending on the step.
- Required selections should be visually clear.
- Validation should be silent: no flashing success banners. The `Avancar` button is disabled until the step is valid.

### 3. Live Character Sheet Preview

Purpose: show the evolving character sheet while the user makes choices.

Desktop behavior:

- Right sidebar with sticky scroll.
- Collapsible button at top.
- Expanded preview shows character identity, core metrics, attributes, traits/features, and pending items.
- Collapsed preview shows a compact initial/glyph.

Content blocks:

- Character header: avatar/initial, level, ruleset, character name, species and class.
- Summary metrics: HP/PV, AC/CA, proficiency, initiative.
- Background and origin feat.
- Attribute grid for STR/DEX/CON/INT/WIS/CHA equivalents using pt-BR labels or abbreviations.
- Tags for selected traits and class features.
- Pending validation list if incomplete.
- Completed state message when all required steps are filled.

Metric visual rules:

- HP/PV uses red accent.
- AC/CA uses blue accent.
- Proficiency uses green accent.
- Initiative uses gold/orange accent.
- Values should be large serif or mono numbers with small uppercase labels.

---

## Component Requirements

### Choice Cards

Used for classes, backgrounds, species, and similar selection groups.

Structure:

- Dark raised card surface.
- Thin border.
- Crimson gradient or line at top.
- Small uppercase eyebrow/source metadata.
- Serif title.
- Short summary only in the card body.
- Compact mechanical metadata.
- Footer with two equal buttons:
  - `DETAILS` as outline/ghost.
  - `SELECT` as solid crimson.

Selected state:

- Crimson border.
- Subtle crimson glow.
- `SELECTED` label or pressed state.
- Must remain accessible via keyboard and screen readers.

Do not put long lore, full progression tables, or large descriptions in cards. Put them inside detail dialogs.

### Detail Dialogs

Used for long class/species/background details.

Requirements:

- Centered modal on dark blurred overlay.
- Max width around `4xl` on desktop.
- Comfortable padding.
- Scrollable content with max height around `88vh`, not a tiny fixed-height panel.
- Visible title and accessible description.
- Clear close button with accessible label.
- Images must use containment behavior so character/species art is not cropped.
- Long tables must horizontally scroll inside their own container.
- Accordions may be used for class features and progression.

### Buttons

Primary:

- Solid crimson background.
- White text.
- Clear hover: deeper crimson.
- Active state: slight scale or darker shade.
- Focus-visible ring in crimson.

Secondary:

- Transparent or low-opacity white surface.
- Subtle border.
- Muted text becoming white on hover.

Icon buttons:

- Use familiar icons for notifications, settings, profile, view, plus, shield, book, wand, etc.
- Must include accessible labels.
- Use tooltips where meaning is not obvious.

Disabled:

- Lower opacity.
- No misleading hover state.
- Cursor and screen-reader state should indicate disabled.

### Forms and Controls

Controls must be styled, not browser-default raw.

Use:

- Segmented buttons for attribute generation method.
- Number steppers for point buy.
- Select fields for standard array.
- Number input for manual attributes.
- Checkbox cards for skills, features, equipment, and languages.
- Radio-card behavior for mutually exclusive choices.
- Textareas for narrative description fields.

Field labels must be visible. Inputs must have strong focus states and adequate contrast.

### Tags and Badges

Use compact tags for:

- Sources.
- Proficiencies.
- Class features.
- Traits.
- Equipment source.
- Level and ruleset metadata.

Tags should use dark surfaces with thin borders and muted text. Use accent colors sparingly to distinguish status or category.

### Attribute Editor

Must support three methods:

- `Standard Array`.
- `Point Buy`.
- `Manual`.

Show for each attribute:

- Attribute name.
- Base value control.
- Background bonus.
- Final value.
- Modifier.
- Current point-buy cost when relevant.

Point-buy controls should use clear minus/plus buttons and show remaining points in a compact status strip.

### Equipment Selector

Must distinguish:

- Class-provided items.
- Starting gold option.
- Optional/additional equipment.

Use selected cards or checkbox rows. Equipment rows should show item name, source type, source badge, armor class if relevant, and selected state.

### Description Form

Must include:

- Name.
- Alignment.
- Faith.
- Lifestyle.
- Age.
- Gender.
- Height.
- Weight.
- Eyes.
- Skin.
- Hair.
- Appearance.
- Personality.
- Traits.
- Notes.

Use a two-column layout on desktop and one column on mobile. Longer narrative fields span full width.

---

## Screen-Level Design Details

### Dashboard Empty State

Composition:

- Full-height centered layout below fixed header.
- Subtle low-opacity logo/forge mark.
- Main title in large serif.
- Supporting text in readable muted steel.
- Single primary action.

Visual mood:

- Quiet and dramatic.
- The empty state should feel intentional, not empty or broken.
- Avoid adding extra feature explanation cards.

### Dashboard Populated State

Composition:

- Greeting header.
- Character section title with crimson left border.
- Creation card first.
- Saved cards in responsive grid.

Character card data:

- Portrait or fallback icon.
- Name.
- Level badge.
- Species/class.
- Continue button.
- View/details icon.

Do not overload cards with every stat. Keep them as saved-character entry points.

### Class Selection Step

Each class card should show:

- Class name.
- Hit die and source.
- Short summary.
- Primary ability.
- Saving throws.
- Number of skill choices.
- Armor proficiencies.
- Weapon proficiencies.
- Level-one feature tags.
- `DETAILS` and `SELECT`.

Detail modal should show:

- Optional class image.
- Full description blocks.
- Class progression table.
- Spellcasting block when applicable.
- Accordions for all class features.

### Class Features Step

Use:

- Skill proficiency checklist with selected count.
- Initial proficiencies summary.
- Feature choice fieldsets.
- Level-one feature tags.

Selected checkbox cards use crimson border/background. Locked or maxed-out choices become visibly disabled.

### Background Step

Each background card should show:

- Name.
- Source.
- Origin feat.
- Skill/tool/language summary where available.
- Ability bonus selection.
- `DETAILS` and `SELECT`.

Make background ability bonuses visually distinct because they affect final attributes.

### Species Step

Each species card should show:

- Species name.
- Source.
- Short description.
- Size/speed if available.
- Trait tags.
- `DETAILS` and `SELECT`.

Detail modal should show species art with object containment, full description, and trait cards.

### Species Details Step

Use fieldsets for:

- Species internal choices.
- Standard languages.
- Rare/exotic languages.

Show selected count like `Idiomas (1/2)`. Prevent overflow in long language names.

### Attributes Step

Use compact controls with strong numeric hierarchy.

For each attribute, show:

- Label.
- Base score control.
- Background bonus.
- Final score.
- Modifier.

The user should instantly understand how background bonuses affect the final value.

### Equipment Step

Top section:

- Class starting equipment summary.
- Two acquisition options: class items or gold.
- If gold is selected, show a restrained gold status panel.
- If items are selected, show package selection cards.

Second section:

- Optional/additional equipment grid.
- Selected rows/cards use crimson state.
- Source badges stay compact.

### Description Step

Use polished form styling. Keep it quieter than mechanical steps. The focus here is character identity and narrative detail.

### Conclusion Step

Show a structured final review:

- Character identity.
- Class/species/background.
- Attributes and modifiers.
- Combat metrics.
- Proficiencies.
- Traits/features.
- Equipment.
- Description summary.
- Remaining pending items if any.

Primary final action should feel decisive but not flashy.

---

## Responsive Requirements

### Desktop Wide (`>=1280px`)

- Dashboard max content width around `1280px`.
- Builder uses 3 columns: sidebar, content, preview.
- Content card grids may use 2-3 columns.
- Right preview stays visible and sticky.

### Desktop / Laptop (`1024px-1279px`)

- Builder may keep 3 columns with narrower preview or allow preview collapse.
- Card grids use 2 columns.
- Avoid text truncation except for long character names or source metadata.

### Tablet (`768px-1023px`)

- Builder stacks or uses two-stage layout.
- Step navigation becomes horizontal.
- Preview can move below the active step.
- Dialog max width adapts to viewport.

### Mobile (`360px-767px`)

- No horizontal overflow at `360px` or `390px`.
- Single-column cards and forms.
- Top nav is compact.
- Bottom nav or sticky actions must not cover content.
- Touch targets should be at least `44px`.
- Dialogs use full-width mobile spacing with safe margins.
- Long tables scroll horizontally inside their container.

---

## Accessibility Requirements

Follow WCAG-minded behavior throughout.

- Use semantic landmarks: `header`, `nav`, `main`, `section`, `article`, `aside`, `footer`.
- Every screen region should have a visible heading or accessible label.
- Buttons are real buttons, links are real links.
- Forms use visible labels.
- Icon-only buttons require accessible names.
- Current wizard step uses `aria-current="step"` or equivalent.
- Toggle buttons expose pressed/expanded state.
- Disabled steps and disabled buttons are clearly unavailable.
- Dialogs trap focus, close predictably, and restore focus to the trigger.
- Focus-visible state must be obvious against dark backgrounds.
- Color cannot be the only indicator of selected/completed/locked states.
- Text contrast must be high enough for dark UI.
- Validation should not rely on timed banners or flashing status.
- Dynamic preview updates should be polite and not disruptive to screen readers.

---

## Interaction Rules

- Selecting a class advances to the next step only when the flow explicitly allows it.
- `Avancar` remains disabled until the current step is valid.
- `Voltar` is always secondary.
- Completed steps can be revisited.
- Future locked steps are visibly unavailable until previous required steps are complete.
- Details open in modal dialogs, not inline card expansion.
- Long details use accordions and tables inside dialogs.
- Saved character `Continuar` should feel primary within each character card.
- Creation card should be visibly different from saved-character cards.

---

## Content and Copy Guidance

Use concise Portuguese UI copy.

Preferred labels:

- `Forge & Fate`
- `Forje Sua Alma`
- `CRIAR NOVO PERSONAGEM`
- `Bem-vindo, Arquiteto`
- `Sua jornada continua.`
- `Seus Personagens`
- `Novo Heroi`
- `Continuar`
- `Classe`
- `Recursos de Classe`
- `Antecedente`
- `Raca/Especie`
- `Detalhes da Especie`
- `Atributos`
- `Equipamento`
- `Descricao`
- `Conclusao`
- `DETAILS`
- `SELECT`
- `SELECTED`
- `Voltar`
- `Avancar`
- `Pendencias`
- `Todas as etapas obrigatorias estao preenchidas.`

Use plain, direct copy. Avoid tutorial paragraphs inside the app. The interface itself should guide the user through hierarchy, labels, state, and disabled/enabled behavior.

---

## Data Density Rules

RPG data can be dense, but it must be organized.

- Use cards for high-level choices.
- Use fieldsets for grouped controls.
- Use tables only for progression or structured numeric data.
- Use tags for short lists.
- Use accordions for long feature collections.
- Use modals for extended lore/details.
- Avoid giant uninterrupted text blocks.
- Keep summaries short and put detail one interaction away.

---

## Generator Negative Prompt

When using Stitch or another design generator, avoid:

- Generic SaaS dashboards.
- Marketing landing pages.
- Bright fantasy illustrations as the entire UI.
- Beige parchment-dominant layouts.
- Cartoon game HUD styling.
- Purple-blue gradient themes.
- Decorative gradient orbs or bokeh blobs.
- Low-contrast gray-on-black text.
- Oversized hero sections.
- Cards nested inside other cards.
- Hover-only controls.
- Cropped character art in dialogs.
- Hidden scrollbars for important content.
- Inconsistent button labels.
- Raw default browser inputs.

---

## External Tool Usage Notes

For Stitch:

1. Start with the **Stitch Master Prompt** at the top of this file.
2. Ask for the dashboard, builder wizard, and sheet preview as a cohesive app.
3. If Stitch generates a landing page, correct it with: "Make the first screen the actual character dashboard app, not a marketing page."
4. If the result is too decorative, correct it with: "Reduce ornamentation, increase information density, and keep the dark fantasy mood professional."
5. If the result is too generic, correct it with: "Make the UI feel like a gothic D&D 5e character builder with class cards, step navigation, and a live sheet preview."
6. If mobile breaks, correct it with: "Redesign the mobile layout at 390px width with one-column cards, no horizontal overflow, and sticky actions that do not cover content."

This file intentionally contains no API keys, MCP headers, tokens, credentials, environment values, or local secret configuration.
