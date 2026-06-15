"use client";

import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  Save,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { FontAwesomeIcon } from "@/src/components/atoms/FontAwesomeIcon";
import { builderStepNavigation } from "@/src/components/templates/builderStepNavigation";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { BuilderStepSlug } from "@/types/builder";

interface BuilderSidebarProps {
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}

const stepIconBySlug: Record<BuilderStepSlug, string> = {
  classe: "fa-solid fa-wand",
  "recursos-classe": "fa-solid fa-wand-sparkles",
  antecedente: "fa-solid fa-scroll-old",
  especie: "fa-solid fa-dragon",
  "detalhes-especie": "fa-solid fa-eye-evil",
  atributos: "fa-regular fa-dice-d20",
  equipamento: "fa-solid fa-backpack",
  descricao: "fa-solid fa-feather-pointed",
  conclusao: "fa-solid fa-flag-pennant",
};

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
  const currentStep = builderStepNavigation[currentIndex] ?? builderStepNavigation[0];
  const totalCompletableSteps = Math.max(builderStepNavigation.length - 1, 1);
  const completedCount = Math.max(Math.min(maxUnlockedStepIndex, currentIndex), 0);
  const progress = (maxUnlockedStepIndex / totalCompletableSteps) * 100;

  return (
    <aside
      className={`flex min-w-0 flex-col border-b border-white/5 bg-[#0f1018] text-[#e8e9f0] xl:min-h-screen xl:border-b-0 xl:border-r ${
        collapsed ? "xl:w-[4.5rem]" : "xl:w-full"
      }`}
    >
      <header
        className={`border-b border-white/5 px-6 pb-6 pt-5 ${
          collapsed ? "xl:px-3 xl:pb-4" : ""
        }`}
      >
        <div
          className={`flex items-start gap-3 ${
            collapsed ? "xl:justify-center" : ""
          }`}
        >
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e61c23] font-serif text-sm font-bold text-white shadow-[0_0_18px_rgba(230,28,35,0.32)]"
          >
            F
          </span>
          <div className={collapsed ? "xl:sr-only" : ""}>
            <h2 className="font-serif text-sm font-bold uppercase tracking-[0.12em] text-white">
              Criação personagem
            </h2>
            <p className="mt-1 font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#e61c23]">
              Step {Math.max(currentIndex + 1, 1)}: {currentStep.label} (
              {completedCount}/{totalCompletableSteps})
            </p>
          </div>
        </div>
        <div
          className={`mt-3 h-1 overflow-hidden rounded-full bg-white/5 ${
            collapsed ? "xl:hidden" : ""
          }`}
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-[#e61c23] shadow-[0_0_8px_rgba(230,28,35,0.4)] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="px-4 pt-4">
        <button
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          onClick={onToggleCollapsed}
          className="flex min-h-10 w-full items-center justify-center gap-2 rounded border border-white/10 bg-white/5 px-3 font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#7a7e99] outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-[#e61c23]/70"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className={collapsed ? "xl:sr-only" : ""}>
            {collapsed ? "Expandir" : "Recolher"}
          </span>
        </button>
      </div>

      <NavigationMenu.Root
        orientation="vertical"
        aria-label="Etapas do Character Builder"
        className="min-w-0 flex-1 overflow-y-auto py-4"
      >
        <NavigationMenu.List className="flex w-full min-w-0 max-w-full list-none gap-2 overflow-x-auto px-3 pb-1 xl:flex-col xl:gap-0 xl:overflow-visible xl:px-0">
          {builderStepNavigation.map((step, index) => {
            const isCurrent = pathname === step.href;
            const isDone = maxUnlockedStepIndex > index;
            const isUnlocked = index <= maxUnlockedStepIndex;
            const icon = getStepIcon(step.slug);

            return (
              <NavigationMenu.Item key={step.href} className="shrink-0 xl:shrink">
                {isUnlocked ? (
                  <NavigationMenu.Link asChild active={isCurrent}>
                    <Link
                      href={step.href}
                      aria-label={step.label}
                      aria-current={isCurrent ? "step" : undefined}
                      className={`group flex min-h-12 items-center gap-3 border-l-4 px-4 py-3 text-left text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-[#e61c23]/70 xl:w-full ${
                        collapsed ? "xl:justify-center xl:px-0" : ""
                      } ${
                        isCurrent
                          ? "border-[#e61c23] bg-[#e61c23]/15 text-white active:translate-x-1"
                          : isDone
                            ? "border-transparent text-[#50c878] hover:bg-white/5"
                            : "border-transparent text-[#7a7e99] hover:bg-white/5 hover:text-[#b0b5cc]"
                      }`}
                    >
                      <StepIcon icon={icon} active={isCurrent} done={isDone && !isCurrent} />
                      <StepLabel
                        collapsed={collapsed}
                        label={step.label}
                        shortLabel={step.shortLabel}
                      />
                    </Link>
                  </NavigationMenu.Link>
                ) : (
                  <span
                    aria-disabled="true"
                    aria-label={`${step.label} bloqueada`}
                    className={`group flex min-h-12 cursor-not-allowed items-center gap-3 border-l-4 border-transparent px-4 py-3 text-left text-sm text-[#555a70] opacity-70 xl:w-full ${
                      collapsed ? "xl:justify-center xl:px-0" : ""
                    }`}
                  >
                    <StepIcon icon={icon} active={false} done={false} />
                    <StepLabel
                      collapsed={collapsed}
                      label={step.label}
                      shortLabel={step.shortLabel}
                    />
                  </span>
                )}
              </NavigationMenu.Item>
            );
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>

      <div
        className={`mt-auto border-t border-white/5 px-4 pt-4 ${
          collapsed ? "xl:hidden" : ""
        }`}
      >
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded border border-white/10 px-4 py-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[#7a7e99] outline-none transition-colors hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#e61c23]/70"
        >
          <Save className="h-4 w-4" />
          SAVE DRAFT
        </button>
        <div className="flex justify-between gap-4 pb-4 pt-4">
          <button
            type="button"
            className="flex items-center gap-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#7a7e99] outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#e61c23]/70"
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </button>
          <button
            type="button"
            className="flex items-center gap-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[#7a7e99] outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#e61c23]/70"
          >
            <MessageCircle className="h-4 w-4" />
            Feedback
          </button>
        </div>
      </div>
    </aside>
  );
}

function getStepIcon(slug: BuilderStepSlug): string {
  return stepIconBySlug[slug];
}

function StepIcon({
  icon,
  active,
  done,
}: {
  icon: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <FontAwesomeIcon
      iconClassName={icon}
      className={`h-5 w-5 shrink-0 ${
        active ? "text-[#e61c23]" : done ? "text-[#50c878]" : "text-current"
      }`}
    />
  );
}

function StepLabel({
  collapsed,
  label,
  shortLabel,
}: {
  collapsed: boolean;
  label: string;
  shortLabel: string;
}) {
  return (
    <span
      className={`min-w-0 font-sans text-sm ${
        collapsed ? "xl:sr-only" : ""
      }`}
    >
      <span className="hidden truncate font-medium xl:block">{label}</span>
      <span className="xl:hidden">{shortLabel}</span>
    </span>
  );
}
