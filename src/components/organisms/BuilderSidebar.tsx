"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { builderStepNavigation } from "@/src/components/templates/builderStepNavigation";
import { useCharacterStore } from "@/store/useCharacterStore";

interface BuilderSidebarProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

export function BuilderSidebar({
  collapsed = false,
  onToggleCollapsed,
}: BuilderSidebarProps) {
  const pathname = usePathname();
  const maxUnlockedStepIndex = useCharacterStore(
    (state) => state.maxUnlockedStepIndex,
  );
  const currentIndex = builderStepNavigation.findIndex(
    (step) => step.href === pathname,
  );
  const completedCount = Math.max(Math.min(maxUnlockedStepIndex, currentIndex), 0);
  const progress =
    (maxUnlockedStepIndex / Math.max(builderStepNavigation.length - 1, 1)) * 100;

  return (
    <aside
      className={`border-b border-white/[0.06] bg-[#0f1018] xl:min-h-screen xl:border-b-0 xl:border-r ${
        collapsed ? "xl:w-[4.5rem]" : ""
      }`}
    >
      <div
        className={`flex items-center gap-3 border-b border-white/[0.06] px-3 py-4 ${
          collapsed ? "xl:justify-center" : ""
        }`}
      >
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#c41e1e] font-serif text-sm font-bold text-white shadow-lg shadow-[#c41e1e]/25"
        >
          F
        </span>
        <div className={collapsed ? "xl:hidden" : ""}>
          <p className="font-serif text-sm font-bold uppercase tracking-[0.12em] text-[#e8e9f0]">
            Forge & Fate
          </p>
          <p className="text-[0.62rem] uppercase tracking-[0.16em] text-[#7a7e99]">
            Character Builder
          </p>
        </div>
      </div>

      <div className="px-3 pt-3">
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          onClick={onToggleCollapsed}
          className="flex min-h-10 w-full items-center justify-center rounded-md border border-white/10 bg-white/5 px-2 text-sm font-bold text-[#b0b5cc] outline-none transition hover:border-[#c41e1e]/60 hover:text-white focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70"
        >
          {collapsed ? ">" : "<"}
        </button>
      </div>

      <NavigationMenu.Root
        orientation="vertical"
        aria-label="Etapas do Character Builder"
        className="px-3 py-4"
      >
        <p
          className={`mb-2 px-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[#7a7e99] ${
            collapsed ? "xl:sr-only" : ""
          }`}
        >
          Criação
        </p>
        <NavigationMenu.List className="flex list-none gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible">
          {builderStepNavigation.map((step, index) => {
            const isCurrent = pathname === step.href;
            const isDone = maxUnlockedStepIndex > index;
            const isUnlocked = index <= maxUnlockedStepIndex;
            const marker = isDone ? "✓" : step.marker;

            return (
              <NavigationMenu.Item key={step.href} className="shrink-0 xl:shrink">
                {isUnlocked ? (
                  <NavigationMenu.Link asChild active={isCurrent}>
                    <Link
                      href={step.href}
                      aria-label={step.label}
                      aria-current={isCurrent ? "step" : undefined}
                      className="group flex min-h-12 items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 text-left text-sm text-[#b0b5cc] outline-none transition hover:border-white/10 hover:bg-[#1c1e2a] hover:text-white focus-visible:ring-2 focus-visible:ring-[#c41e1e]/70 data-[active]:border-[#c41e1e]/40 data-[active]:bg-[#c41e1e]/15 data-[active]:text-white"
                    >
                      <StepMarker marker={marker} active={isCurrent} done={isDone} />
                      <StepLabel collapsed={collapsed} label={step.label} index={index} />
                      <span className="xl:hidden">{step.shortLabel}</span>
                    </Link>
                  </NavigationMenu.Link>
                ) : (
                  <span
                    aria-disabled="true"
                    aria-label={`${step.label} bloqueada`}
                    className="group flex min-h-12 cursor-not-allowed items-center gap-2.5 rounded-md border border-transparent px-2.5 py-2 text-left text-sm text-[#555a70] opacity-70"
                  >
                    <StepMarker marker={step.marker} active={false} done={false} />
                    <StepLabel collapsed={collapsed} label={step.label} index={index} />
                    <span className="xl:hidden">{step.shortLabel}</span>
                  </span>
                )}
              </NavigationMenu.Item>
            );
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>

      <div className={`hidden border-t border-white/[0.06] px-3 py-4 xl:block ${collapsed ? "xl:hidden" : ""}`}>
        <section
          aria-labelledby="builder-progress-title"
          className="rounded-md border border-[#c41e1e]/20 bg-[#c41e1e]/10 px-3 py-3"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2
              id="builder-progress-title"
              className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[#7a7e99]"
            >
              Progresso
            </h2>
            <span className="text-xs font-semibold text-white">
              {completedCount}/{builderStepNavigation.length - 1}
            </span>
          </div>
          <div
            aria-hidden="true"
            className="h-1.5 overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#c41e1e] to-[#e63946] transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>
      </div>
    </aside>
  );
}

function StepMarker({
  marker,
  active,
  done,
}: {
  marker: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[0.62rem] font-bold ${
        active
          ? "border-[#c41e1e] bg-[#c41e1e] text-white"
          : done
            ? "border-[#50c878]/40 bg-[#50c878]/15 text-[#50c878]"
            : "border-white/10 bg-white/5 text-[#7a7e99]"
      }`}
    >
      {marker}
    </span>
  );
}

function StepLabel({
  collapsed,
  label,
  index,
}: {
  collapsed: boolean;
  label: string;
  index: number;
}) {
  return (
    <span className={`hidden min-w-0 xl:block ${collapsed ? "xl:sr-only" : ""}`}>
      <span className="block truncate font-medium">{label}</span>
      <span className="block text-[0.62rem] text-[#7a7e99]">
        Etapa {index + 1}
      </span>
    </span>
  );
}
