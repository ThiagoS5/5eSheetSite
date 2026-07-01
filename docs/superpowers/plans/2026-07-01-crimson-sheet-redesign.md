# Crimson Sheet Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the character sheet and the builder's "Conclusão" step with the claude_design crimson redesign, matching the zip on desktop and mobile, without losing existing functionality.

**Architecture:** Both surfaces (`/sheet` via `CharacterSheetPage`, builder conclusion via `BuilderStepPanel` with `embedded`) render through one `CharacterSheetView`. We rebuild `CharacterSheetView` and its children to the mock's three-region desktop layout / single-column mobile layout, scope a crimson theme override to the sheet root, add a data-wired `ItemDetailModal`, and restyle the level-up trigger. The one-way data flow `selectCharacterSheetSummary(state) → view → children` is unchanged; no selector or schema changes.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Radix UI dialog, Zustand store, Font Awesome icons, Vitest + @testing-library/react + jsdom.

## Global Constraints

- **No selector/schema changes.** Do not modify `selectCharacterSheetSummary` core computations or the persisted `CharacterBuild` shape. No migration.
- **Theme scoped to sheet root only.** Never edit global tokens in `app/globals.css`. Crimson override values (verbatim): `--primary: oklch(0.59 0.23 27)`, `--brand-crimson-alt: oklch(0.53 0.2 28)`.
- **Origin color map (verbatim):** `class → var(--brand-gold-alt)`, `species → var(--brand-green)`, `background → var(--brand-blue)`.
- **Wire only real data.** Never fabricate spells, item prices, money, carry, or weapon damage. Where the selector has no value, render a styled empty/placeholder state.
- **Keep `LevelUpFlow` as-is.** Only restyle its trigger button. No level-up logic changes.
- **Tests live in `_tests_/` dirs** (single underscores), matching the existing convention. Run all with `npm test`; a single file with `npx vitest run <path>`.
- **Accessibility parity:** keep `focusRing` (`src/lib/styles.ts`) on hand-rolled interactive elements and `aria-hidden` on decorative icons, as existing components do.
- **Language:** all user-facing copy is Portuguese (pt-BR), matching existing components.

---

### Task 1: Sheet theme + origin-color helpers

**Files:**
- Create: `src/components/organisms/sheet/sheetTheme.ts`
- Test: `src/components/organisms/sheet/_tests_/sheetTheme.test.ts`

**Interfaces:**
- Produces:
  - `SHEET_THEME_VARS: React.CSSProperties` — crimson override to spread on the sheet root `style`.
  - `originColor(source: "class" | "species" | "background"): string` — returns a CSS color string (a `var(--…)`).
  - `originColorVars(source): { color: string; colorSoft: string; colorBg: string }` — for source-coded borders/badges.

- [ ] **Step 1: Write the failing test**

```ts
// src/components/organisms/sheet/_tests_/sheetTheme.test.ts
import { describe, it, expect } from "vitest";
import { SHEET_THEME_VARS, originColor, originColorVars } from "@/src/components/organisms/sheet/sheetTheme";

describe("sheetTheme", () => {
  it("exposes the crimson override vars", () => {
    expect(SHEET_THEME_VARS["--primary" as keyof typeof SHEET_THEME_VARS]).toBe("oklch(0.59 0.23 27)");
    expect(SHEET_THEME_VARS["--brand-crimson-alt" as keyof typeof SHEET_THEME_VARS]).toBe("oklch(0.53 0.2 28)");
  });

  it("maps each origin source to its brand color", () => {
    expect(originColor("class")).toBe("var(--brand-gold-alt)");
    expect(originColor("species")).toBe("var(--brand-green)");
    expect(originColor("background")).toBe("var(--brand-blue)");
  });

  it("derives soft/bg mixes from the base color", () => {
    const v = originColorVars("class");
    expect(v.color).toBe("var(--brand-gold-alt)");
    expect(v.colorSoft).toBe("color-mix(in oklab, var(--brand-gold-alt) 45%, transparent)");
    expect(v.colorBg).toBe("color-mix(in oklab, var(--brand-gold-alt) 13%, transparent)");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/organisms/sheet/_tests_/sheetTheme.test.ts`
Expected: FAIL — cannot find module `sheetTheme`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/components/organisms/sheet/sheetTheme.ts
import type { CSSProperties } from "react";

/** Crimson accent override, scoped to the sheet root (mirrors the mock's
 *  cardThemeVars). Spread onto the root element's `style`; every descendant
 *  using var(--primary)/var(--brand-crimson-alt) recolors via the cascade. */
export const SHEET_THEME_VARS = {
  "--primary": "oklch(0.59 0.23 27)",
  "--brand-crimson-alt": "oklch(0.53 0.2 28)",
} as CSSProperties;

export type OriginSource = "class" | "species" | "background";

const ORIGIN_COLOR: Record<OriginSource, string> = {
  class: "var(--brand-gold-alt)",
  species: "var(--brand-green)",
  background: "var(--brand-blue)",
};

export function originColor(source: OriginSource): string {
  return ORIGIN_COLOR[source];
}

export function originColorVars(source: OriginSource): {
  color: string;
  colorSoft: string;
  colorBg: string;
} {
  const color = ORIGIN_COLOR[source];
  return {
    color,
    colorSoft: `color-mix(in oklab, ${color} 45%, transparent)`,
    colorBg: `color-mix(in oklab, ${color} 13%, transparent)`,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/organisms/sheet/_tests_/sheetTheme.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/organisms/sheet/sheetTheme.ts src/components/organisms/sheet/_tests_/sheetTheme.test.ts
git commit -m "feat(sheet): add crimson theme + origin-color helpers"
```

---

### Task 2: SavingThrowsGrid molecule

**Files:**
- Create: `src/components/molecules/sheet/SavingThrowsGrid.tsx`
- Test: `src/components/molecules/sheet/_tests_/SavingThrowsGrid.test.tsx`

**Interfaces:**
- Consumes: `SheetSavingThrow[]` from `@/types/builder` (`{ attributeKey, label, abbr, modifier, isProficient }`).
- Produces: `SavingThrowsGrid({ savingThrows }: { savingThrows: SheetSavingThrow[] })`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/molecules/sheet/_tests_/SavingThrowsGrid.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SavingThrowsGrid } from "@/src/components/molecules/sheet/SavingThrowsGrid";
import type { SheetSavingThrow } from "@/types/builder";

const saves: SheetSavingThrow[] = [
  { attributeKey: "forca", label: "Força", abbr: "FOR", modifier: -1, isProficient: false },
  { attributeKey: "inteligencia", label: "Inteligência", abbr: "INT", modifier: 7, isProficient: true },
];

describe("SavingThrowsGrid", () => {
  it("renders one cell per saving throw with signed modifier", () => {
    render(<SavingThrowsGrid savingThrows={saves} />);
    expect(screen.getByText("FOR")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
    expect(screen.getByText("+7")).toBeInTheDocument();
  });

  it("marks proficient saves for assistive tech", () => {
    render(<SavingThrowsGrid savingThrows={saves} />);
    // Proficient INT cell exposes an accessible "Proficiente" label; FOR does not.
    expect(screen.getByText("Proficiente")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/molecules/sheet/_tests_/SavingThrowsGrid.test.tsx`
Expected: FAIL — cannot find module `SavingThrowsGrid`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/molecules/sheet/SavingThrowsGrid.tsx
import type { SheetSavingThrow } from "@/types/builder";

interface SavingThrowsGridProps {
  savingThrows: SheetSavingThrow[];
}

export function SavingThrowsGrid({ savingThrows }: SavingThrowsGridProps) {
  return (
    <section className="rounded-[11px] border border-border bg-card p-[14px]">
      <div className="mb-[11px] flex items-center gap-[7px]">
        <i aria-hidden="true" className="fa-solid fa-shield-halved text-[11px] text-primary" />
        <p className="text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-muted-foreground">
          Testes de Resistência
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {savingThrows.map((sv) => (
          <div
            key={sv.attributeKey}
            className="relative flex flex-col items-center gap-[3px] rounded-[9px] border border-border bg-surface-nested px-1 py-[9px]"
          >
            {sv.isProficient && (
              <>
                <span
                  aria-hidden="true"
                  className="absolute right-[6px] top-[6px] h-[7px] w-[7px] rounded-full bg-primary"
                />
                <span className="sr-only">Proficiente</span>
              </>
            )}
            <span className="text-[9px] font-bold leading-none tracking-[0.1em] text-muted-foreground">
              {sv.abbr}
            </span>
            <span className="font-serif text-lg font-extrabold text-foreground">
              {sv.modifier >= 0 ? "+" : ""}{sv.modifier}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/molecules/sheet/_tests_/SavingThrowsGrid.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/molecules/sheet/SavingThrowsGrid.tsx src/components/molecules/sheet/_tests_/SavingThrowsGrid.test.tsx
git commit -m "feat(sheet): add SavingThrowsGrid molecule"
```

---

### Task 3: SkillsPanel molecule (skills grouped by attribute)

**Files:**
- Create: `src/components/molecules/sheet/SkillsPanel.tsx`
- Test: `src/components/molecules/sheet/_tests_/SkillsPanel.test.tsx`

**Interfaces:**
- Consumes: `SheetSkill[]` from `@/types/builder` (`{ name, label, attributeKey, modifier, isProficient, isExpert }`).
- Produces: `SkillsPanel({ skills }: { skills: SheetSkill[] })`. Groups skills by `attributeKey` in canonical FOR/DES/CON/INT/SAB/CAR order; renders a crimson attribute-abbr subheading per non-empty group followed by that group's rows (proficiency dot, right-aligned signed modifier, label).

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/molecules/sheet/_tests_/SkillsPanel.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkillsPanel } from "@/src/components/molecules/sheet/SkillsPanel";
import type { SheetSkill } from "@/types/builder";

const skills: SheetSkill[] = [
  { name: "Arcana", label: "Arcanismo", attributeKey: "inteligencia", modifier: 7, isProficient: true, isExpert: false },
  { name: "Athletics", label: "Atletismo", attributeKey: "forca", modifier: -1, isProficient: false, isExpert: false },
];

describe("SkillsPanel", () => {
  it("renders skill labels with signed modifiers", () => {
    render(<SkillsPanel skills={skills} />);
    expect(screen.getByText("Arcanismo")).toBeInTheDocument();
    expect(screen.getByText("+7")).toBeInTheDocument();
    expect(screen.getByText("Atletismo")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
  });

  it("shows a subheading only for attributes that have skills", () => {
    render(<SkillsPanel skills={skills} />);
    expect(screen.getByText("INT")).toBeInTheDocument();
    expect(screen.getByText("FOR")).toBeInTheDocument();
    expect(screen.queryByText("CAR")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/molecules/sheet/_tests_/SkillsPanel.test.tsx`
Expected: FAIL — cannot find module `SkillsPanel`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/molecules/sheet/SkillsPanel.tsx
import type { SheetSkill } from "@/types/builder";
import type { AttributeKey } from "@/types/dnd";

const ATTRIBUTE_ORDER: AttributeKey[] = [
  "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma",
];
const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  forca: "FOR", destreza: "DES", constituicao: "CON",
  inteligencia: "INT", sabedoria: "SAB", carisma: "CAR",
};

interface SkillsPanelProps {
  skills: SheetSkill[];
}

export function SkillsPanel({ skills }: SkillsPanelProps) {
  const groups = ATTRIBUTE_ORDER.map((key) => ({
    key,
    abbr: ATTRIBUTE_ABBR[key],
    skills: skills.filter((s) => s.attributeKey === key),
  })).filter((g) => g.skills.length > 0);

  return (
    <section className="rounded-[11px] border border-border bg-card p-[14px]">
      <div className="mb-[11px] flex items-center gap-[7px]">
        <i aria-hidden="true" className="fa-solid fa-list-check text-[11px] text-muted-foreground" />
        <p className="text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-muted-foreground">
          Perícias
        </p>
      </div>
      <div className="flex flex-col gap-[10px]">
        {groups.map((grp) => (
          <div key={grp.key}>
            <p className="mb-[5px] text-[8.5px] font-bold uppercase leading-none tracking-[0.14em] text-brand-crimson-alt">
              {grp.abbr}
            </p>
            <div className="flex flex-col gap-px">
              {grp.skills.map((sk) => {
                const dot = sk.isExpert
                  ? "bg-brand-gold border-transparent"
                  : sk.isProficient
                    ? "bg-primary border-transparent"
                    : "bg-transparent border-border";
                const label = sk.isExpert ? "Especialista" : sk.isProficient ? "Proficiente" : "Não proficiente";
                return (
                  <div key={sk.name} className="flex items-center gap-[9px] rounded-md px-[6px] py-1 hover:bg-surface-nested">
                    <span aria-hidden="true" className={`h-[7px] w-[7px] shrink-0 rounded-full border ${dot}`} />
                    <span className="sr-only">{label}:</span>
                    <span className="min-w-[30px] text-right font-serif text-sm font-bold text-foreground">
                      {sk.modifier >= 0 ? "+" : ""}{sk.modifier}
                    </span>
                    <span className="text-[12.5px] text-subdued">{sk.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/molecules/sheet/_tests_/SkillsPanel.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/molecules/sheet/SkillsPanel.tsx src/components/molecules/sheet/_tests_/SkillsPanel.test.tsx
git commit -m "feat(sheet): add SkillsPanel molecule (skills grouped by attribute)"
```

---

### Task 4: AttributeGrid molecule (inline attribute cells)

**Files:**
- Create: `src/components/molecules/sheet/AttributeGrid.tsx`
- Test: `src/components/molecules/sheet/_tests_/AttributeGrid.test.tsx`

**Interfaces:**
- Consumes: `SheetAttribute[]` from `@/types/builder` (`{ key, label, abbr, score, modifier }`).
- Produces: `AttributeGrid({ attributes }: { attributes: SheetAttribute[] })` — the mock's flex-wrap row of attribute cells (accent top line, abbr, big serif modifier, score pill). Negative modifiers render muted.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/molecules/sheet/_tests_/AttributeGrid.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AttributeGrid } from "@/src/components/molecules/sheet/AttributeGrid";
import type { SheetAttribute } from "@/types/builder";

const attrs: SheetAttribute[] = [
  { key: "forca", label: "Força", abbr: "FOR", score: 8, modifier: -1 },
  { key: "inteligencia", label: "Inteligência", abbr: "INT", score: 18, modifier: 4 },
];

describe("AttributeGrid", () => {
  it("renders each attribute's abbr, signed modifier and score", () => {
    render(<AttributeGrid attributes={attrs} />);
    expect(screen.getByText("FOR")).toBeInTheDocument();
    expect(screen.getByText("-1")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("INT")).toBeInTheDocument();
    expect(screen.getByText("+4")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/molecules/sheet/_tests_/AttributeGrid.test.tsx`
Expected: FAIL — cannot find module `AttributeGrid`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/molecules/sheet/AttributeGrid.tsx
import type { SheetAttribute } from "@/types/builder";
import { cn } from "@/src/lib/utils";

interface AttributeGridProps {
  attributes: SheetAttribute[];
}

export function AttributeGrid({ attributes }: AttributeGridProps) {
  return (
    <div className="flex w-full max-w-[660px] flex-wrap justify-center gap-[10px]">
      {attributes.map((attr) => (
        <div
          key={attr.key}
          className="relative flex min-w-[88px] flex-1 basis-[94px] flex-col items-center gap-2 overflow-hidden rounded-xl border border-border bg-surface-nested px-2 pb-[10px] pt-3"
        >
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"
          />
          <span className="text-[10px] font-bold leading-none tracking-[0.16em] text-brand-crimson-alt">
            {attr.abbr}
          </span>
          <span
            className={cn(
              "font-serif text-[31px] font-extrabold leading-none",
              attr.modifier < 0 ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {attr.modifier >= 0 ? "+" : ""}{attr.modifier}
          </span>
          <span className="flex h-6 min-w-[36px] items-center justify-center rounded-full border border-border bg-background px-[9px] text-[12.5px] font-semibold text-muted-foreground">
            {attr.score}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/molecules/sheet/_tests_/AttributeGrid.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/components/molecules/sheet/AttributeGrid.tsx src/components/molecules/sheet/_tests_/AttributeGrid.test.tsx
git commit -m "feat(sheet): add AttributeGrid molecule"
```

---

### Task 5: Restyle LevelUpButton trigger (crimson pill)

**Files:**
- Modify: `src/components/molecules/LevelUpButton.tsx`

**Interfaces:**
- Unchanged public API: `LevelUpButton()` (no props). Still bumps level and opens `LevelUpFlow`.

- [ ] **Step 1: Update the trigger styling to the mock's crimson pill**

Replace the `<button>`'s `className` (keep all logic, imports, and `LevelUpFlow` usage identical):

```tsx
        className="inline-flex items-center gap-[7px] rounded-[9px] border border-brand-crimson-alt bg-primary px-[15px] py-[9px] text-[10.5px] font-bold uppercase tracking-[0.06em] text-white outline-none transition-colors hover:bg-brand-crimson-alt focus-visible:ring-3 focus-visible:ring-brand-crimson-alt/70 disabled:cursor-not-allowed disabled:opacity-40"
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no errors from this file).

- [ ] **Step 3: Commit**

```bash
git add src/components/molecules/LevelUpButton.tsx
git commit -m "style(sheet): crimson pill for level-up trigger"
```

---

### Task 6: ItemDetailModal organism

**Files:**
- Create: `src/components/organisms/sheet/ItemDetailModal.tsx`
- Test: `src/components/organisms/sheet/_tests_/ItemDetailModal.test.tsx`

**Interfaces:**
- Produces:
  - `type DetailItem =`
    - `{ kind: "weapon"; name: string; attackBonus: string; damage: string; notes: string }`
    - `| { kind: "equipment"; name: string; qty: number; source: string; cost?: string; armorClass?: number }`
    - `| { kind: "spell"; name: string; castingTime?: string; range?: string; target?: string; duration?: string; components?: string; classes?: string; description?: string }`
  - `ItemDetailModal({ item, onClose }: { item: DetailItem | null; onClose: () => void })` — Radix dialog; open iff `item != null`; renders only fields present on `item`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/organisms/sheet/_tests_/ItemDetailModal.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ItemDetailModal, type DetailItem } from "@/src/components/organisms/sheet/ItemDetailModal";

const weapon: DetailItem = { kind: "weapon", name: "Adaga", attackBonus: "+6", damage: "1d4+3 Perfurante", notes: "Acuidade" };

describe("ItemDetailModal", () => {
  it("renders nothing when item is null", () => {
    render(<ItemDetailModal item={null} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders weapon detail fields when open", () => {
    render(<ItemDetailModal item={weapon} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Adaga")).toBeInTheDocument();
    expect(screen.getByText("+6")).toBeInTheDocument();
    expect(screen.getByText("1d4+3 Perfurante")).toBeInTheDocument();
  });

  it("calls onClose when the close button is pressed", () => {
    const onClose = vi.fn();
    render(<ItemDetailModal item={weapon} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText("Fechar"));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/organisms/sheet/_tests_/ItemDetailModal.test.tsx`
Expected: FAIL — cannot find module `ItemDetailModal`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/organisms/sheet/ItemDetailModal.tsx
"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export type DetailItem =
  | { kind: "weapon"; name: string; attackBonus: string; damage: string; notes: string }
  | { kind: "equipment"; name: string; qty: number; source: string; cost?: string; armorClass?: number }
  | {
      kind: "spell";
      name: string;
      castingTime?: string;
      range?: string;
      target?: string;
      duration?: string;
      components?: string;
      classes?: string;
      description?: string;
    };

const KIND_LABEL: Record<DetailItem["kind"], string> = {
  weapon: "Ação",
  equipment: "Item",
  spell: "Magia",
};

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[9px] border border-border bg-surface-nested px-3 py-[9px]">
      <p className="mb-0.5 text-[8.5px] font-bold uppercase leading-none tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
      <p className="text-[12.5px] text-foreground">{value}</p>
    </div>
  );
}

interface ItemDetailModalProps {
  item: DetailItem | null;
  onClose: () => void;
}

export function ItemDetailModal({ item, onClose }: ItemDetailModalProps) {
  const open = item != null;
  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[210] flex items-center justify-center overflow-y-auto bg-black/70 p-[22px] backdrop-blur-sm">
          <Dialog.Content className="relative w-[min(600px,100%)] overflow-hidden rounded-2xl border border-brand-crimson-alt/40 bg-card text-foreground shadow-2xl shadow-black/60 outline-none">
            {item && (
              <>
                <div className="relative border-b border-border bg-gradient-to-b from-primary/[0.14] to-transparent px-[22px] py-5">
                  <div aria-hidden="true" className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-primary to-transparent" />
                  <div className="flex items-start justify-between gap-[10px]">
                    <div>
                      <Dialog.Title asChild>
                        <h2 className="m-0 font-serif text-[23px] font-extrabold text-foreground">{item.name}</h2>
                      </Dialog.Title>
                      <p className="mt-1 text-[9.5px] font-bold uppercase leading-none tracking-[0.2em] text-brand-crimson-alt">
                        {KIND_LABEL[item.kind]}
                      </p>
                    </div>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Fechar"
                        className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-border bg-surface-nested text-muted-foreground outline-none transition hover:border-brand-crimson-alt hover:text-foreground focus-visible:ring-3 focus-visible:ring-brand-crimson-alt/70"
                      >
                        <X aria-hidden="true" className="h-[18px] w-[18px]" />
                      </button>
                    </Dialog.Close>
                  </div>
                </div>
                <Dialog.Description className="sr-only">Detalhes de {item.name}.</Dialog.Description>

                <div className="flex flex-col gap-4 px-[22px] py-5">
                  {item.kind === "weapon" && (
                    <>
                      <div className="flex flex-wrap gap-[9px]">
                        <Tile label="Acerto" value={item.attackBonus} />
                        <Tile label="Dano" value={item.damage} />
                        {item.notes && <Tile label="Propriedades" value={item.notes} />}
                      </div>
                    </>
                  )}

                  {item.kind === "equipment" && (
                    <div className="flex flex-wrap gap-[9px]">
                      <Tile label="Quantidade" value={String(item.qty)} />
                      {item.cost && <Tile label="Custo" value={item.cost} />}
                      {item.armorClass != null && <Tile label="CA" value={String(item.armorClass)} />}
                      <Tile label="Origem" value={item.source} />
                    </div>
                  )}

                  {item.kind === "spell" && (
                    <>
                      <div className="grid grid-cols-2 gap-[9px]">
                        {item.castingTime && <Tile label="Tempo de Conjuração" value={item.castingTime} />}
                        {item.range && <Tile label="Alcance" value={item.range} />}
                        {item.target && <Tile label="Alvo" value={item.target} />}
                        {item.duration && <Tile label="Duração" value={item.duration} />}
                        {item.components && <Tile label="Componentes" value={item.components} />}
                        {item.classes && <Tile label="Classes" value={item.classes} />}
                      </div>
                      {item.description && (
                        <p className="m-0 text-[13px] leading-relaxed text-subdued">{item.description}</p>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/organisms/sheet/_tests_/ItemDetailModal.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/organisms/sheet/ItemDetailModal.tsx src/components/organisms/sheet/_tests_/ItemDetailModal.test.tsx
git commit -m "feat(sheet): add ItemDetailModal organism"
```

---

### Task 7: Rework ContentTabs (filter bars, card Ações, detail-modal wiring, empty states)

**Files:**
- Rewrite: `src/components/molecules/sheet/ContentTabs.tsx`
- Test: `src/components/molecules/sheet/_tests_/ContentTabs.test.tsx`

**Interfaces:**
- Consumes: `CharacterSheetSummary` (`summary.weapons`, `summary.features` with `source`, `summary.selectedEquipment` with `{ id, name, source, sourceType, armorClass?, value? }`, `summary.isSpellcaster`); `DetailItem`/`ItemDetailModal` (Task 6); `useCharacterStore` for notes.
- Produces: `ContentTabs({ summary }: { summary: CharacterSheetSummary })` — unchanged public prop.

**Chosen interpretation of "wire only real data" for filters** (documented here so the implementer doesn't re-decide): render a filter bar **only where it filters real data**. `Características` → origin filter (features carry `source`). `Inventário` → `Todos / Classe / Manual` filter (items carry `sourceType`). `Ações` and `Magias` render **no** filter bar (weapons carry no origin; the selector computes no spells). This keeps every control functional while preserving the mock's card/tab visuals.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/molecules/sheet/_tests_/ContentTabs.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ContentTabs } from "@/src/components/molecules/sheet/ContentTabs";
import type { CharacterSheetSummary } from "@/types/builder";

vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({ description: { notas: "" }, setDescriptionField: () => {} }),
}));

const summary = {
  isSpellcaster: false,
  weapons: [{ name: "Adaga", attackBonus: "+6", damage: "1d4+3 Perfurante", notes: "Acuidade" }],
  selectedEquipment: [
    { id: "grimoire", name: "Grimório", source: "Mago", sourceType: "class", value: 50 },
  ],
  features: [
    { name: "Conjuração", description: "…", source: "class" },
    { name: "Visão no Escuro", description: "…", source: "species" },
  ],
} as unknown as CharacterSheetSummary;

describe("ContentTabs", () => {
  beforeEach(() => render(<ContentTabs summary={summary} />));

  it("shows weapons as cards on the Ações tab by default", () => {
    expect(screen.getByText("Adaga")).toBeInTheDocument();
  });

  it("shows an intentional empty state on the Magias tab for a non-caster", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Magias/ }));
    expect(screen.getByText(/não possui magias|Nenhuma magia/i)).toBeInTheDocument();
  });

  it("filters features by origin on the Características tab", () => {
    fireEvent.click(screen.getByRole("tab", { name: /Características/ }));
    expect(screen.getByText("Conjuração")).toBeInTheDocument();
    expect(screen.getByText("Visão no Escuro")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Espécie" }));
    expect(screen.queryByText("Conjuração")).not.toBeInTheDocument();
    expect(screen.getByText("Visão no Escuro")).toBeInTheDocument();
  });

  it("opens the detail modal when a weapon card is clicked", () => {
    fireEvent.click(screen.getByText("Adaga"));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("1d4+3 Perfurante")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/molecules/sheet/_tests_/ContentTabs.test.tsx`
Expected: FAIL — current `ContentTabs` has no card Ações / detail modal.

- [ ] **Step 3: Write the implementation (full file rewrite)**

```tsx
// src/components/molecules/sheet/ContentTabs.tsx
"use client";

import { useState } from "react";
import type { CharacterSheetSummary } from "@/types/builder";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import { originColorVars } from "@/src/components/organisms/sheet/sheetTheme";
import { ItemDetailModal, type DetailItem } from "@/src/components/organisms/sheet/ItemDetailModal";

type MainTab = "actions" | "spells" | "inventory" | "features" | "notes";
type OriginFilter = "all" | "class" | "species" | "background";
type InvFilter = "all" | "class" | "manual";

const MAIN_TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: "actions",   label: "Ações",          icon: "fa-khanda" },
  { id: "spells",    label: "Magias",         icon: "fa-wand-sparkles" },
  { id: "inventory", label: "Inventário",     icon: "fa-box-open" },
  { id: "features",  label: "Características", icon: "fa-scroll" },
  { id: "notes",     label: "Anotações",      icon: "fa-feather" },
];

const ORIGIN_FILTERS: { id: OriginFilter; label: string }[] = [
  { id: "all",        label: "Todos" },
  { id: "class",      label: "Classe" },
  { id: "species",    label: "Espécie" },
  { id: "background", label: "Antecedente" },
];

const INV_FILTERS: { id: InvFilter; label: string }[] = [
  { id: "all",    label: "Todos" },
  { id: "class",  label: "Classe" },
  { id: "manual", label: "Manual" },
];

const chip =
  "whitespace-nowrap rounded-full border px-[14px] py-[6px] text-[11px] font-semibold transition-colors";

interface ContentTabsProps {
  summary: CharacterSheetSummary;
}

export function ContentTabs({ summary }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<MainTab>("actions");
  const [originFilter, setOriginFilter] = useState<OriginFilter>("all");
  const [invFilter, setInvFilter] = useState<InvFilter>("all");
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const notes = useCharacterStore((s) => s.description.notas);
  const setDescriptionField = useCharacterStore((s) => s.setDescriptionField);

  const realWeapons = summary.weapons.filter((w) => w.name.trim() !== "");
  const features =
    originFilter === "all" ? summary.features : summary.features.filter((f) => f.source === originFilter);
  const equipment =
    invFilter === "all"
      ? summary.selectedEquipment
      : summary.selectedEquipment.filter((it) => it.sourceType === invFilter);

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
      {/* Tab bar */}
      <div className="flex gap-0.5 overflow-x-auto border-b border-border px-2">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-[7px] whitespace-nowrap border-b-2 px-[15px] py-3 text-xs font-semibold transition-colors",
              focusRing,
              activeTab === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <i aria-hidden="true" className={`fa-solid ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter bar — only where it filters real data */}
      {activeTab === "features" && (
        <div className="flex flex-wrap items-center gap-[7px] border-b border-border bg-surface-nested px-4 py-[11px]">
          {ORIGIN_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={originFilter === f.id}
              onClick={() => setOriginFilter(f.id)}
              className={cn(
                chip,
                focusRing,
                originFilter === f.id
                  ? "border-primary bg-primary/20 text-foreground"
                  : "border-border bg-surface-nested text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      {activeTab === "inventory" && (
        <div className="flex flex-wrap items-center gap-[7px] border-b border-border bg-surface-nested px-4 py-[11px]">
          {INV_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={invFilter === f.id}
              onClick={() => setInvFilter(f.id)}
              className={cn(
                chip,
                focusRing,
                invFilter === f.id
                  ? "border-primary bg-primary/20 text-foreground"
                  : "border-border bg-surface-nested text-muted-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      <div className="p-4">
        {/* AÇÕES */}
        {activeTab === "actions" && (
          <div className="flex flex-col gap-4">
            {realWeapons.length > 0 ? (
              <div>
                <p className="mb-[9px] text-[9.5px] font-bold uppercase leading-none tracking-[0.14em] text-brand-crimson-alt">
                  Armas
                </p>
                <div className="flex flex-col gap-2">
                  {realWeapons.map((w, i) => (
                    <button
                      key={`${w.name}-${i}`}
                      type="button"
                      onClick={() => setDetail({ kind: "weapon", name: w.name, attackBonus: w.attackBonus, damage: w.damage, notes: w.notes })}
                      className={cn(
                        "flex items-center gap-3 rounded-[9px] border border-border border-l-[3px] border-l-brand-crimson-alt bg-surface-nested px-[13px] py-[11px] text-left transition-colors hover:bg-card",
                        focusRing,
                      )}
                    >
                      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                        <i aria-hidden="true" className="fa-solid fa-khanda text-sm text-brand-crimson-alt" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-bold text-foreground">{w.name}</p>
                        <p className="text-[11px] text-muted-foreground">{w.notes || "—"}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-center">
                        <span className="font-serif text-[17px] font-extrabold leading-none text-primary">{w.attackBonus}</span>
                        <span className="text-[8px] uppercase tracking-[0.08em] text-muted-foreground">Acerto</span>
                      </div>
                      <div className="flex min-w-[96px] shrink-0 items-center justify-center rounded-[7px] border border-border bg-card px-[10px] py-[7px] text-center text-xs font-semibold text-subdued">
                        {w.damage || "—"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState label="Nenhuma ação registrada." />
            )}
          </div>
        )}

        {/* MAGIAS — selector computes no spells today; intentional empty state */}
        {activeTab === "spells" && (
          <EmptyState
            label={summary.isSpellcaster ? "Nenhuma magia desta origem." : "Este personagem não possui magias."}
          />
        )}

        {/* INVENTÁRIO */}
        {activeTab === "inventory" && (
          <div className="flex flex-col gap-[14px]">
            <div className="flex flex-wrap gap-[9px]">
              <MoneyCard label="Peças de Ouro" value="—" />
              <MoneyCard label="Peças de Cobre" value="—" />
              <MoneyCard label="Carga" value="—" />
            </div>
            {equipment.length > 0 ? (
              <ul className="grid list-none grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-1.5 p-0">
                {equipment.map((item, index) => {
                  const color = item.sourceType === "class" ? "text-brand-gold-alt" : "text-muted-foreground";
                  return (
                    <li key={`${item.id}-${index}`}>
                      <button
                        type="button"
                        onClick={() => setDetail({
                          kind: "equipment",
                          name: item.name,
                          qty: 1,
                          source: item.sourceType === "class" ? "Classe" : "Manual",
                          cost: item.value != null ? `${item.value} PO` : undefined,
                          armorClass: item.armorClass ?? undefined,
                        })}
                        className={cn(
                          "flex w-full items-baseline gap-[9px] rounded-lg border border-border bg-surface-nested px-[11px] py-2 text-left text-[12.5px] text-subdued transition-colors hover:bg-card",
                          focusRing,
                        )}
                      >
                        <span className={cn("font-bold", color)}>1×</span>
                        <span>{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState label="Nenhum item desta origem." />
            )}
          </div>
        )}

        {/* CARACTERÍSTICAS */}
        {activeTab === "features" && (
          <div className="flex flex-col gap-[10px]">
            {features.length > 0 ? (
              features.map((f) => {
                const v = originColorVars(f.source);
                return (
                  <div
                    key={`${f.source}-${f.name}`}
                    className="rounded-[9px] border border-border border-l-[3px] bg-surface-nested px-[14px] py-3"
                    style={{ borderLeftColor: v.color }}
                  >
                    <div className="mb-[5px] flex items-center justify-between gap-2">
                      <span className="font-serif text-[15px] font-bold leading-tight text-foreground">{f.name}</span>
                      <span
                        className="whitespace-nowrap rounded border px-[7px] py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em]"
                        style={{ color: v.color, background: v.colorBg, borderColor: v.colorSoft }}
                      >
                        {f.source === "class" ? "Classe" : f.source === "species" ? "Espécie" : "Antecedente"}
                      </span>
                    </div>
                    {f.description && <p className="m-0 text-xs leading-relaxed text-subdued">{f.description}</p>}
                  </div>
                );
              })
            ) : (
              <EmptyState label="Nenhuma característica desta origem." />
            )}
          </div>
        )}

        {/* ANOTAÇÕES */}
        {activeTab === "notes" && (
          <textarea
            value={notes}
            onBlur={(e) => setDescriptionField("notas", e.target.value)}
            onChange={(e) => setDescriptionField("notas", e.target.value)}
            rows={8}
            placeholder="Escreva as anotações do personagem…"
            className={cn(
              "h-[440px] w-full resize-y rounded-[9px] border border-border bg-background px-4 py-[14px] text-[13px] text-subdued outline-none placeholder:text-muted-foreground focus:border-primary",
              focusRing,
            )}
          />
        )}
      </div>

      <ItemDetailModal item={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[9px] rounded-[9px] border border-dashed border-border p-4 text-[12.5px] text-muted-foreground">
      <i aria-hidden="true" className="fa-solid fa-circle-info" />
      {label}
    </div>
  );
}

function MoneyCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 basis-[90px] flex-col items-center gap-[3px] rounded-[10px] border border-border bg-surface-nested p-[11px]">
      <span className="font-serif text-xl font-extrabold text-foreground">{value}</span>
      <span className="text-[9.5px] uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/molecules/sheet/_tests_/ContentTabs.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/molecules/sheet/ContentTabs.tsx src/components/molecules/sheet/_tests_/ContentTabs.test.tsx
git commit -m "feat(sheet): rework ContentTabs with card Ações, filters and detail modal"
```

---

### Task 8: SheetHero organism

**Files:**
- Create: `src/components/organisms/sheet/SheetHero.tsx`
- Test: `src/components/organisms/sheet/_tests_/SheetHero.test.tsx`

**Interfaces:**
- Consumes: `CharacterSheetSummary`; `CombatStatFrame` (`variant`, `accentColor`); `AttributeGrid` (Task 4); `LevelUpButton` (Task 5).
- Produces: `SheetHero({ summary, onExport }: { summary: CharacterSheetSummary; onExport: () => void })` — the centered hero block: title row (Exportar left, centered title, LevelUpButton right), combat row (Iniciativa / CA shield / Deslocamento), HP+Proficiência pill between crimson rules, and the `AttributeGrid`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/organisms/sheet/_tests_/SheetHero.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SheetHero } from "@/src/components/organisms/sheet/SheetHero";
import type { CharacterSheetSummary } from "@/types/builder";

vi.mock("@/src/components/molecules/LevelUpButton", () => ({
  LevelUpButton: () => <button type="button">Subir de Nível</button>,
}));

const summary = {
  name: "Thalindra", level: 5, className: "Mago", speciesName: "Alta Elfa", backgroundName: "Sábia",
  armorClass: 13, initiative: 3, speedMeters: 9, currentHp: 27, maxHp: 27, proficiencyBonus: 3,
  attributes: [{ key: "forca", label: "Força", abbr: "FOR", score: 8, modifier: -1 }],
} as unknown as CharacterSheetSummary;

describe("SheetHero", () => {
  it("renders identity, CA and HP", () => {
    render(<SheetHero summary={summary} onExport={() => {}} />);
    expect(screen.getByRole("heading", { name: "Thalindra" })).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
    expect(screen.getByText("27")).toBeInTheDocument();
  });

  it("calls onExport when Exportar is pressed", () => {
    const onExport = vi.fn();
    render(<SheetHero summary={summary} onExport={onExport} />);
    fireEvent.click(screen.getByRole("button", { name: /Exportar/ }));
    expect(onExport).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/organisms/sheet/_tests_/SheetHero.test.tsx`
Expected: FAIL — cannot find module `SheetHero`.

- [ ] **Step 3: Write minimal implementation**

```tsx
// src/components/organisms/sheet/SheetHero.tsx
import type { CharacterSheetSummary } from "@/types/builder";
import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import { CombatStatFrame } from "@/src/components/atoms/sheet/frames/CombatStatFrame";
import { AttributeGrid } from "@/src/components/molecules/sheet/AttributeGrid";
import { LevelUpButton } from "@/src/components/molecules/LevelUpButton";

interface SheetHeroProps {
  summary: CharacterSheetSummary;
  onExport: () => void;
}

function fmt(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export function SheetHero({ summary, onExport }: SheetHeroProps) {
  return (
    <div className="flex flex-col items-center gap-[18px] rounded-2xl border border-border bg-surface-nested px-5 py-[22px] [background:radial-gradient(120%_90%_at_50%_0%,color-mix(in_oklab,var(--primary)_9%,transparent),transparent_60%),var(--surface-nested)]">
      {/* Title row */}
      <div className="flex w-full flex-wrap items-center justify-between gap-[14px]">
        <button
          type="button"
          onClick={onExport}
          className={cn(
            "inline-flex items-center gap-[7px] rounded-[9px] border border-border bg-card px-[14px] py-[9px] text-[10.5px] font-bold uppercase tracking-[0.05em] text-muted-foreground transition-colors hover:border-brand-crimson-alt hover:text-foreground",
            focusRing,
          )}
        >
          <i aria-hidden="true" className="fa-solid fa-file-export" />
          Exportar
        </button>
        <div className="min-w-[200px] flex-1 text-center">
          <p className="mb-1 text-[9px] font-bold uppercase leading-none tracking-[0.24em] text-brand-crimson-alt">
            ◆ Nível {summary.level} · Regras {summary.ruleset === "2024" ? "2024" : "2014"} ◆
          </p>
          <h1 className="m-0 font-serif text-[28px] font-extrabold leading-[1.02] text-foreground">
            {summary.name || "Personagem sem nome"}
          </h1>
          <p className="mt-[5px] text-[12.5px] text-muted-foreground">
            {summary.speciesName} {summary.className}
            {summary.backgroundName ? ` · ${summary.backgroundName}` : ""}
          </p>
        </div>
        <LevelUpButton />
      </div>

      {/* Combat row */}
      <div className="flex flex-wrap items-center justify-center gap-[22px]">
        <CombatStatFrame variant="square" accentColor="var(--brand-crimson-alt)">
          <i aria-hidden="true" className="fa-solid fa-bolt text-[13px] text-primary" />
          <span className="text-[8.5px] uppercase tracking-[0.05em] text-muted-foreground">Iniciativa</span>
          <span className="font-serif text-2xl font-extrabold text-foreground">{fmt(summary.initiative)}</span>
        </CombatStatFrame>

        <div className="relative flex h-[190px] w-[172px] items-center justify-center">
          <svg viewBox="0 0 100 110" className="pointer-events-none absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <path d="M 50 4 L 94 18 L 94 54 C 94 80 72 100 50 106 C 28 100 6 80 6 54 L 6 18 Z" fill="var(--card)" stroke="var(--brand-crimson-alt)" strokeWidth="1.5" />
            <path d="M 50 9 L 89 21 L 89 54 C 89 78 68 97 50 102 C 32 97 11 78 11 54 L 11 21 Z" fill="none" stroke="var(--brand-crimson-alt)" strokeWidth="0.6" opacity="0.5" />
          </svg>
          <div className="relative flex flex-col items-center gap-0.5 pb-4">
            <span className="text-center text-[9.5px] font-semibold uppercase leading-tight tracking-[0.08em] text-brand-crimson-alt">
              Classe de<br />Armadura
            </span>
            <span className="font-serif text-5xl font-extrabold leading-none text-foreground">{summary.armorClass}</span>
          </div>
        </div>

        <CombatStatFrame variant="square" accentColor="#8a8fb0">
          <i aria-hidden="true" className="fa-solid fa-shoe-prints text-[13px] text-muted-foreground" />
          <span className="text-[8.5px] uppercase tracking-[0.05em] text-muted-foreground">Desloc.</span>
          <span className="font-serif text-[22px] font-extrabold text-foreground">
            {summary.speedMeters}<span className="text-xs font-semibold text-muted-foreground">m</span>
          </span>
        </CombatStatFrame>
      </div>

      {/* HP / Proficiência pill */}
      <div className="flex w-full max-w-[560px] items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-brand-crimson-alt" />
        <div className="flex items-center gap-[10px] rounded-full border border-border bg-card px-4 py-[7px]">
          <i aria-hidden="true" className="fa-solid fa-heart text-xs text-primary" />
          <span className="font-serif text-xl font-extrabold text-foreground">
            {summary.currentHp}<span className="text-[13px] font-semibold text-muted-foreground"> / {summary.maxHp} PV</span>
          </span>
          <span className="h-[18px] w-px bg-border" />
          <i aria-hidden="true" className="fa-solid fa-star text-[11px] text-primary" />
          <span className="font-serif text-base font-extrabold text-foreground">+{summary.proficiencyBonus}</span>
          <span className="text-[9px] uppercase tracking-[0.08em] text-muted-foreground">Profic.</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-brand-crimson-alt to-transparent" />
      </div>

      <AttributeGrid attributes={summary.attributes} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/organisms/sheet/_tests_/SheetHero.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/organisms/sheet/SheetHero.tsx src/components/organisms/sheet/_tests_/SheetHero.test.tsx
git commit -m "feat(sheet): add SheetHero organism"
```

---

### Task 9: Rebuild CharacterSheetView layout (desktop three-region + single-column mobile)

**Files:**
- Rewrite: `src/components/pages/CharacterSheetView.tsx`
- Test: `src/components/pages/_tests_/CharacterSheetView.test.tsx`

**Interfaces:**
- Consumes: `useCharacterBuilderState`, `useCharacterStore` (description), `selectCharacterSheetSummary`, `createFoundryCharacterExport`; `SheetHero` (Task 8), `SavingThrowsGrid` (Task 2), `SkillsPanel` (Task 3), `ContentTabs` (Task 7), `CodexColumn`, `DefensesPanel`, `PassivesPanel`, `SensesPanel`, `ConditionsPanel`; `SHEET_THEME_VARS` (Task 1).
- Produces: `CharacterSheetView({ embedded }: { embedded?: boolean })` — unchanged public prop.

**Layout:** one responsive column that reflows into the mock's regions. The crimson `SHEET_THEME_VARS` are spread on the root wrapper `style`. Structure top→bottom: `SheetHero` → middle row (`lg:flex` with left column = SavingThrowsGrid + SkillsPanel, center = ContentTabs `flex-2`, right = CodexColumn) → bottom grid (Defenses / Passives / Senses / Conditions). On mobile everything stacks in source order (single column). No fixed bottom-nav. `embedded` only drops the full-screen `min-h-screen`/background chrome.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/pages/_tests_/CharacterSheetView.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterSheetView } from "@/src/components/pages/CharacterSheetView";

vi.mock("@/src/components/molecules/LevelUpButton", () => ({
  LevelUpButton: () => <button type="button">Subir de Nível</button>,
}));

// Minimal store/selector fakes so the view renders in isolation.
vi.mock("@/src/store/useCharacterBuilderState", () => ({ useCharacterBuilderState: () => ({}) }));
vi.mock("@/src/store/useCharacterStore", () => ({
  useCharacterStore: (selector: (s: unknown) => unknown) =>
    selector({ description: { notas: "", nome: "Thalindra" }, setDescriptionField: () => {} }),
}));
vi.mock("@/src/store/characterSelectors", () => ({
  selectCharacterSheetSummary: () => ({
    ruleset: "2024", name: "Thalindra", level: 5, className: "Mago", speciesName: "Alta Elfa",
    backgroundName: "Sábia", armorClass: 13, initiative: 3, speedMeters: 9, currentHp: 27, maxHp: 27,
    proficiencyBonus: 3, attributes: [], skills: [], savingThrows: [], features: [], weapons: [],
    selectedEquipment: [], isSpellcaster: false, resistances: [], immunities: [], vulnerabilities: [],
    passives: { perception: 11, investigation: 11, insight: 13 }, senses: [], languages: [],
  }),
}));

describe("CharacterSheetView", () => {
  it("renders the hero identity in standalone mode", () => {
    render(<CharacterSheetView />);
    expect(screen.getByRole("heading", { name: "Thalindra" })).toBeInTheDocument();
  });

  it("renders in embedded mode without throwing", () => {
    render(<CharacterSheetView embedded />);
    expect(screen.getByRole("heading", { name: "Thalindra" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/pages/_tests_/CharacterSheetView.test.tsx`
Expected: FAIL — current view still references removed columns / no `SheetHero`.

- [ ] **Step 3: Write the implementation (full file rewrite)**

```tsx
// src/components/pages/CharacterSheetView.tsx
"use client";

import { useMemo } from "react";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { useCharacterBuilderState } from "@/src/store/useCharacterBuilderState";
import { cn } from "@/src/lib/utils";
import { createFoundryCharacterExport } from "@/src/utils/foundryAdapter";
import { SHEET_THEME_VARS } from "@/src/components/organisms/sheet/sheetTheme";
import { SheetHero } from "@/src/components/organisms/sheet/SheetHero";
import { SavingThrowsGrid } from "@/src/components/molecules/sheet/SavingThrowsGrid";
import { SkillsPanel } from "@/src/components/molecules/sheet/SkillsPanel";
import { ContentTabs } from "@/src/components/molecules/sheet/ContentTabs";
import { CodexColumn } from "@/src/components/organisms/sheet/CodexColumn";
import { DefensesPanel } from "@/src/components/molecules/sheet/DefensesPanel";
import { PassivesPanel } from "@/src/components/molecules/sheet/PassivesPanel";
import { SensesPanel } from "@/src/components/molecules/sheet/SensesPanel";
import { ConditionsPanel } from "@/src/components/molecules/sheet/ConditionsPanel";

interface CharacterSheetViewProps {
  /** Embedded mode (builder conclusão) drops the full-screen chrome. */
  embedded?: boolean;
}

export function CharacterSheetView({ embedded = false }: CharacterSheetViewProps) {
  const state = useCharacterBuilderState();
  const description = useCharacterStore((s) => s.description);
  const summary = useMemo(() => selectCharacterSheetSummary(state), [state]);

  function handleExport() {
    const exportData = createFoundryCharacterExport(state, summary);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sanitizeFileName(summary.name)}-foundry-vtt.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const content = (
    <div className="flex flex-col gap-[14px]" style={SHEET_THEME_VARS}>
      <SheetHero summary={summary} onExport={handleExport} />

      {/* Middle region */}
      <div className="flex flex-wrap items-start gap-[14px]">
        <div className="flex min-w-0 flex-1 basis-[280px] flex-col gap-[14px]">
          <SavingThrowsGrid savingThrows={summary.savingThrows} />
          <SkillsPanel skills={summary.skills} />
        </div>
        <div className="min-w-[320px] flex-[2_1_400px]">
          <ContentTabs summary={summary} />
        </div>
        <div className="min-w-[230px] flex-1 basis-[250px]">
          <CodexColumn summary={summary} description={description} />
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[14px]">
        <DefensesPanel
          resistances={summary.resistances}
          immunities={summary.immunities}
          vulnerabilities={summary.vulnerabilities}
        />
        <PassivesPanel
          perception={summary.passives.perception}
          investigation={summary.passives.investigation}
          insight={summary.passives.insight}
        />
        <SensesPanel senses={summary.senses} languages={summary.languages} />
        <ConditionsPanel />
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className={cn("min-h-screen bg-background")}>
      <main className="p-3 lg:p-4">{content}</main>
    </div>
  );
}

function sanitizeFileName(value: string): string {
  return (
    value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "character"
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/pages/_tests_/CharacterSheetView.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/CharacterSheetView.tsx src/components/pages/_tests_/CharacterSheetView.test.tsx
git commit -m "feat(sheet): rebuild CharacterSheetView to crimson three-region layout"
```

---

### Task 10: Remove superseded components + full verification

**Files (delete only after confirming zero remaining imports):**
- Delete: `src/components/organisms/sheet/SheetHeader.tsx`
- Delete: `src/components/organisms/sheet/AttributesColumn.tsx`
- Delete: `src/components/organisms/sheet/SkillsColumn.tsx`
- Delete: `src/components/organisms/sheet/MainContentColumn.tsx`
- Modify (if present): any barrel/index re-exporting the deleted files.

**Note:** `SkillsColumn` currently re-exports nothing but composes `PassivesPanel`/`SensesPanel`; those panels are used directly by `CharacterSheetView` now, so they stay. `MainContentColumn`'s weapons table is superseded by the Ações tab; `DefensesPanel`/`ConditionsPanel` it used are in the bottom grid now.

- [ ] **Step 1: Confirm the four components are no longer imported**

Run: `git grep -nE "SheetHeader|AttributesColumn|SkillsColumn|MainContentColumn" -- "src" "app" ":!*_tests_*"`
Expected: no matches outside the files themselves. If any app/component still imports one, fix that import to the new equivalents before deleting.

- [ ] **Step 2: Delete the superseded files and their tests (if any)**

```bash
git rm src/components/organisms/sheet/SheetHeader.tsx \
       src/components/organisms/sheet/AttributesColumn.tsx \
       src/components/organisms/sheet/SkillsColumn.tsx \
       src/components/organisms/sheet/MainContentColumn.tsx
# Also remove any now-orphaned tests referencing them (check first):
git grep -lE "SheetHeader|AttributesColumn|SkillsColumn|MainContentColumn" -- "src/**/_tests_/**" || true
```

Delete any test files the grep lists.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS — all suites green (new sheet suites + existing `BuilderStepPanel`, `CharacterSheetPreview`, `BuilderSidebar`, layout tests). If `BuilderStepPanel.test.tsx` asserts old sheet copy/structure, update those assertions to the new hero identity (e.g. character name heading) — do not weaken unrelated assertions.

- [ ] **Step 4: Typecheck and lint**

Run: `npm run typecheck`
Expected: PASS (no TS errors).
Run: `npm run lint`
Expected: PASS (no new lint errors; watch `react-hooks` and `outline-none`-without-ring rules).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(sheet): remove components superseded by crimson redesign"
```

---

### Task 11: Browser parity verification (desktop + mobile)

**Files:** none (verification only).

- [ ] **Step 1: Ensure a dev server is running**

Use the preview tooling to start the app (`preview_start`, config name `dev` running `npm run dev`). If `.claude/launch.json` is absent, create it with a `dev` config: `runtimeExecutable: "npm"`, `runtimeArgs: ["run","dev"]`, `port: 3000`.

- [ ] **Step 2: Verify the builder conclusão step (embedded) and `/sheet` (standalone)**

Navigate to `/sheet`. Then check the builder conclusion route (the `[step]` slug that renders `BuilderStepPanel`'s embedded sheet).
- `preview_console_logs` (level error): expect none.
- `preview_snapshot`: confirm hero identity, "Testes de Resistência", "Perícias", tabs (Ações/Magias/Inventário/Características/Anotações), Códice, and bottom panels are present.

- [ ] **Step 3: Verify desktop layout (~1180px)**

`preview_resize` to width 1280. `preview_screenshot`. Confirm the three-region layout: hero on top, left saves+skills / center tabs / right codex, bottom panels grid. Compare against `Tela de Conclusão.dc.html` section 3a.

- [ ] **Step 4: Verify mobile layout (390px)**

`preview_resize` preset `mobile` (375×812) or width 390. `preview_screenshot`. Confirm single-column stack, no fixed bottom-nav, tabs card scrolls inside. Compare against mock section 4a.

- [ ] **Step 5: Verify interactions**

- Click a weapon card in Ações → `preview_snapshot` shows the detail dialog with damage. Close it.
- Switch to Características, click "Espécie" filter → only species features remain.
- Switch to Magias → intentional empty state visible.
- Click "Subir de Nível" → existing `LevelUpFlow` dialog opens (unchanged behavior).

- [ ] **Step 6: Share proof + final commit if any fixes were needed**

Capture desktop + mobile screenshots for the user. If Steps 2–5 required source fixes, re-run `npm test` and commit:

```bash
git add -A
git commit -m "fix(sheet): browser parity adjustments for crimson redesign"
```

---

## Self-Review

**Spec coverage:**
- Theme scoped to sheet root + origin colors → Task 1, applied in Task 9. ✅
- Desktop three-region layout → Tasks 8 (hero), 9 (composition). ✅
- SavingThrowsGrid → Task 2. ✅
- Skills grouped by attribute → Task 3. ✅
- Attribute cells → Task 4. ✅
- Tabs panel with per-tab filters + card Ações + empty states → Task 7 (with documented functional-filter interpretation). ✅
- ItemDetailModal wired to real data → Tasks 6, 7. ✅
- Level-up preserved, trigger restyled → Task 5. ✅
- Mobile single-column, no bottom-nav → Task 9. ✅
- Reused panels (Defenses/Passives/Senses/Conditions/Codex/CombatStatFrame) → Task 9. ✅
- Testing (SavingThrowsGrid, ItemDetailModal, ContentTabs, CharacterSheetView smoke, existing test updates) → Tasks 2, 6, 7, 9, 10. ✅
- Both surfaces (`/sheet`, builder conclusão) → covered by single `CharacterSheetView`, verified in Task 11. ✅

**Placeholder scan:** No TBD/TODO; every code step contains full code. Task 10 deletions are explicitly gated on a grep confirming no remaining imports. ✅

**Type consistency:** `DetailItem` defined in Task 6 is consumed with matching shape in Task 7. `originColorVars`/`originColor` signatures (Task 1) match usage in Task 7. `SHEET_THEME_VARS` (Task 1) matches usage in Task 9. `SheetHero` props (Task 8) match the call in Task 9. Component prop names (`savingThrows`, `skills`, `attributes`, `summary`, `onExport`, `item`, `onClose`) are consistent across producer/consumer tasks. ✅

**Deviation noted:** Task 7 documents that filter bars render only where they filter real data (Características: origin; Inventário: class/manual); Ações/Magias have no filter bar. This is the honest reading of the approved "wire only real data" decision; the full mock chip-set belongs to the declined "full parity" option.
