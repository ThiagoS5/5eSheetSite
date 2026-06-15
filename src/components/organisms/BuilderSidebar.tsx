"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  MessageCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Save,
  Swords,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/components/ui/collapsible";
import { Progress } from "@/src/components/ui/progress";
import { Button } from "@/src/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/src/components/ui/sidebar";
import { cn } from "@/src/lib/utils";
import { FontAwesomeIcon } from "@/src/components/atoms/FontAwesomeIcon";
import { builderStepNavigation } from "@/src/components/templates/builderStepNavigation";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import { validateBuilderStep } from "@/rules/builderValidation";
import type { BuilderStepSlug } from "@/types/builder";

type StepStatus = "active" | "complete" | "available" | "locked";

interface SidebarStepGroup {
  id: "class" | "species";
  label: string;
  shortLabel: string;
  iconSlug: BuilderStepSlug;
  childSlugs: BuilderStepSlug[];
}

const classGroupSlugs: BuilderStepSlug[] = ["classe", "recursos-classe"];
const speciesGroupSlugs: BuilderStepSlug[] = ["especie", "detalhes-especie"];
const groupedSlugs = new Set<BuilderStepSlug>([
  ...classGroupSlugs,
  ...speciesGroupSlugs,
]);

const sidebarGroups: SidebarStepGroup[] = [
  {
    id: "class",
    label: "Classe",
    shortLabel: "Classe",
    iconSlug: "classe",
    childSlugs: classGroupSlugs,
  },
  {
    id: "species",
    label: "Raca/Especie",
    shortLabel: "Especie",
    iconSlug: "especie",
    childSlugs: speciesGroupSlugs,
  },
];

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

export function BuilderSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const characterState = useCharacterStore((state) => state);
  const collapsed = state === "collapsed";
  const currentIndex = builderStepNavigation.findIndex(
    (step) => step.href === pathname,
  );
  const currentStep = builderStepNavigation[currentIndex] ?? builderStepNavigation[0];
  const totalSteps = builderStepNavigation.length;
  const totalCompletableSteps = Math.max(totalSteps - 1, 1);
  const completedCount = Math.max(
    Math.min(characterState.maxUnlockedStepIndex, totalCompletableSteps),
    0,
  );
  const progress = ((Math.max(currentIndex, 0) + 1) / totalSteps) * 100;
  const currentSlug = currentStep.slug;
  const isClassRoute = classGroupSlugs.includes(currentSlug);
  const isSpeciesRoute = speciesGroupSlugs.includes(currentSlug);
  const [isClassOpen, setIsClassOpen] = useState(false);
  const [isSpeciesOpen, setIsSpeciesOpen] = useState(false);
  const classGroupOpen = isClassRoute || isClassOpen;
  const speciesGroupOpen = isSpeciesRoute || isSpeciesOpen;

  const flatSteps = useMemo(
    () => builderStepNavigation.filter((step) => !groupedSlugs.has(step.slug)),
    [],
  );

  return (
    <aside
      className={`hidden min-w-0 flex-col border-b border-white/5 bg-[#0f1018] text-[#e8e9f0] xl:flex xl:min-h-[calc(100dvh-4rem)] xl:border-b-0 xl:border-r ${
        collapsed ? "xl:w-[4.5rem]" : "xl:w-full"
      }`}
    >
        <Sidebar collapsible="icon" contained className="w-full bg-transparent">
          <SidebarHeader
            className={cn(
              "h-16 flex-row items-center border-b border-white/5 px-3 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            {collapsed ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Abrir barra lateral (Ctrl+B)"
                aria-label="Abrir barra lateral"
                onClick={toggleSidebar}
                className="h-10 w-10 text-[#b0b5cc] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#e61c23]/70"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            ) : (
              <div className="flex flex-1 items-center justify-between gap-3 px-2 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e61c23] text-white shadow-[0_0_18px_rgba(230,28,35,0.32)]"
                  >
                    <Swords className="h-5 w-5" />
                  </span>
                  <span className="truncate font-serif text-sm font-bold uppercase tracking-[0.12em] text-[#e61c23]">
                    FORGE & FATE
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Fechar barra lateral (Ctrl+B)"
                  aria-label="Fechar barra lateral"
                  onClick={toggleSidebar}
                  className="h-10 w-10 shrink-0 text-[#b0b5cc] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-[#e61c23]/70"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </Button>
              </div>
            )}
            <div className="sr-only">
              Step {Math.max(currentIndex + 1, 1)}: {currentStep.label} (
              {completedCount}/{totalCompletableSteps})
            </div>
          </SidebarHeader>

          <SidebarContent
            className={cn(
              "min-w-0 flex-1 overflow-y-auto px-3 py-4",
              collapsed && "xl:px-0",
            )}
          >
            <Progress
              value={progress}
              aria-label={`Progresso do wizard: etapa ${Math.max(
                currentIndex + 1,
                1,
              )} de ${totalSteps}`}
              className={cn(
                "mb-4 h-1 bg-white/5 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] [&>div]:bg-[#e61c23] [&>div]:shadow-[0_0_8px_rgba(230,28,35,0.4)]",
                collapsed && "xl:hidden",
              )}
            />
            <nav aria-label="Etapas do Character Builder" className="min-w-0">
              <SidebarMenu className={cn("min-w-0 gap-1", collapsed && "xl:items-center")}>
                <GroupedStepItem
                  group={sidebarGroups[0]}
                  open={classGroupOpen}
                  onOpenChange={setIsClassOpen}
                  collapsed={collapsed}
                  currentSlug={currentSlug}
                  characterState={characterState}
                />
                <FlatStepItems
                  steps={flatSteps.filter((step) => step.slug === "antecedente")}
                  collapsed={collapsed}
                  currentSlug={currentSlug}
                  characterState={characterState}
                />
                <GroupedStepItem
                  group={sidebarGroups[1]}
                  open={speciesGroupOpen}
                  onOpenChange={setIsSpeciesOpen}
                  collapsed={collapsed}
                  currentSlug={currentSlug}
                  characterState={characterState}
                />
                <FlatStepItems
                  steps={flatSteps.filter((step) => step.slug !== "antecedente")}
                  collapsed={collapsed}
                  currentSlug={currentSlug}
                  characterState={characterState}
                />
              </SidebarMenu>
            </nav>
          </SidebarContent>

          <SidebarFooter
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
          </SidebarFooter>
        </Sidebar>
    </aside>
  );
}

function GroupedStepItem({
  group,
  open,
  onOpenChange,
  collapsed,
  currentSlug,
  characterState,
}: {
  group: SidebarStepGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collapsed: boolean;
  currentSlug: BuilderStepSlug;
  characterState: CharacterBuilderState;
}) {
  const isGroupActive = group.childSlugs.includes(currentSlug);
  const groupHasCompletedChildren = group.childSlugs.some((slug) =>
    isStepComplete(slug, characterState),
  );

  return (
    <Collapsible open={open} onOpenChange={onOpenChange} asChild>
      <SidebarMenuItem className={collapsed ? "xl:flex xl:justify-center" : ""}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            type="button"
            aria-label={group.label}
            isActive={isGroupActive}
            className={cn(
              baseStepClass,
              isGroupActive
                ? activeStepClass
                : groupHasCompletedChildren
                  ? completeStepClass
                  : availableStepClass,
              collapsed && "xl:justify-center xl:px-0",
            )}
          >
            <StepIcon
              icon={getStepIcon(group.iconSlug)}
              active={isGroupActive}
              done={groupHasCompletedChildren && !isGroupActive}
            />
            <StepLabel
              collapsed={collapsed}
              label={group.label}
              shortLabel={group.shortLabel}
            />
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 text-[#7a7e99] transition-transform",
                open && "rotate-180",
                collapsed && "xl:hidden",
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className={collapsed ? "xl:hidden" : ""}>
          <SidebarMenuSub className="ml-3 border-l border-white/10 px-0 pl-3">
            {group.childSlugs.map((slug) => (
              <SubStepItem
                key={slug}
                slug={slug}
                currentSlug={currentSlug}
                characterState={characterState}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function FlatStepItems({
  steps,
  collapsed,
  currentSlug,
  characterState,
}: {
  steps: typeof builderStepNavigation;
  collapsed: boolean;
  currentSlug: BuilderStepSlug;
  characterState: CharacterBuilderState;
}) {
  return (
    <>
      {steps.map((step) => {
        const status = getStepStatus(step.slug, currentSlug, characterState);
        const isLocked = status === "locked";

        return (
          <SidebarMenuItem
            key={step.href}
            className={collapsed ? "xl:flex xl:justify-center" : ""}
          >
            {isLocked ? (
              <SidebarMenuButton
                aria-disabled="true"
                aria-label={`${step.label} bloqueada`}
                className={cn(
                  baseStepClass,
                  lockedStepClass,
                  collapsed && "xl:justify-center xl:px-0",
                )}
              >
                <StepIcon icon={getStepIcon(step.slug)} active={false} done={false} />
                <StepLabel
                  collapsed={collapsed}
                  label={step.label}
                  shortLabel={step.shortLabel}
                />
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                asChild
                isActive={status === "active"}
                className={cn(
                  baseStepClass,
                  getStepClass(status),
                  collapsed && "xl:justify-center xl:px-0",
                )}
              >
                <Link
                  href={step.href}
                  aria-label={step.label}
                  aria-current={status === "active" ? "step" : undefined}
                >
                  <StepIcon
                    icon={getStepIcon(step.slug)}
                    active={status === "active"}
                    done={status === "complete"}
                  />
                  <StepLabel
                    collapsed={collapsed}
                    label={step.label}
                    shortLabel={step.shortLabel}
                  />
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        );
      })}
    </>
  );
}

function SubStepItem({
  slug,
  currentSlug,
  characterState,
}: {
  slug: BuilderStepSlug;
  currentSlug: BuilderStepSlug;
  characterState: CharacterBuilderState;
}) {
  const step = getStepBySlug(slug);
  const status = getStepStatus(slug, currentSlug, characterState);
  const isLocked = status === "locked";

  if (!step) {
    return null;
  }

  return (
    <SidebarMenuSubItem>
      {isLocked ? (
        <SidebarMenuSubButton
          aria-disabled="true"
          className={cn(subStepClass, getSubStepClass(status))}
        >
          <SubStepStatusIcon status={status} />
          <span>{step.label}</span>
        </SidebarMenuSubButton>
      ) : (
        <SidebarMenuSubButton
          asChild
          isActive={status === "active"}
          className={cn(subStepClass, getSubStepClass(status))}
        >
          <Link
            href={step.href}
            aria-label={step.label}
            aria-current={status === "active" ? "step" : undefined}
          >
            <SubStepStatusIcon status={status} />
            <span>{step.label}</span>
          </Link>
        </SidebarMenuSubButton>
      )}
    </SidebarMenuSubItem>
  );
}

const baseStepClass =
  "min-h-12 gap-3 rounded-none border-l-4 px-4 py-3 text-left text-sm outline-none transition-all hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#e61c23]/70 data-[active=true]:bg-[#e61c23]/15 data-[active=true]:text-white";

const activeStepClass = "border-[#e61c23] bg-[#e61c23]/15 text-white";
const completeStepClass = "border-transparent text-[#50c878] hover:text-[#50c878]";
const availableStepClass = "border-transparent text-[#7a7e99] hover:text-[#b0b5cc]";
const lockedStepClass =
  "cursor-not-allowed border-transparent text-[#555a70] opacity-70 hover:bg-transparent hover:text-[#555a70]";
const subStepClass =
  "h-9 rounded-md px-2 font-sans text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#e61c23]/70";

function getStepClass(status: StepStatus): string {
  if (status === "active") {
    return activeStepClass;
  }

  if (status === "complete") {
    return completeStepClass;
  }

  if (status === "locked") {
    return lockedStepClass;
  }

  return availableStepClass;
}

function getSubStepClass(status: StepStatus): string {
  if (status === "active") {
    return "bg-[#e61c23]/15 text-[#e61c23] hover:text-[#e61c23]";
  }

  if (status === "complete") {
    return "text-[#50c878] hover:text-[#50c878]";
  }

  if (status === "locked") {
    return "cursor-not-allowed text-[#555a70] hover:bg-transparent hover:text-[#555a70]";
  }

  return "text-[#7a7e99] hover:text-[#b0b5cc]";
}

function getStepStatus(
  slug: BuilderStepSlug,
  currentSlug: BuilderStepSlug,
  state: CharacterBuilderState,
): StepStatus {
  const stepIndex = getStepIndex(slug);

  if (stepIndex > state.maxUnlockedStepIndex) {
    return "locked";
  }

  if (slug === currentSlug) {
    return "active";
  }

  if (isStepComplete(slug, state) && stepIndex < state.maxUnlockedStepIndex) {
    return "complete";
  }

  return "available";
}

function isStepComplete(
  slug: BuilderStepSlug,
  state: CharacterBuilderState,
): boolean {
  if (slug === "classe") {
    return Boolean(state.selectedClassId);
  }

  if (slug === "recursos-classe") {
    return Boolean(state.selectedClassId) && validateBuilderStep(slug, state).length === 0;
  }

  if (slug === "especie") {
    return Boolean(state.selectedSpeciesId);
  }

  if (slug === "detalhes-especie") {
    return Boolean(state.selectedSpeciesId) && validateBuilderStep(slug, state).length === 0;
  }

  return validateBuilderStep(slug, state).length === 0;
}

function getStepBySlug(slug: BuilderStepSlug) {
  return builderStepNavigation.find((step) => step.slug === slug);
}

function getStepIndex(slug: BuilderStepSlug): number {
  return builderStepNavigation.findIndex((step) => step.slug === slug);
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

function SubStepStatusIcon({ status }: { status: StepStatus }) {
  if (status === "complete") {
    return (
      <FontAwesomeIcon
        iconClassName="fa-solid fa-check"
        className="h-3 w-3 shrink-0 text-[#50c878]"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "h-2 w-2 shrink-0 rounded-full",
        status === "active" ? "bg-[#e61c23]" : "bg-[#555a70]",
      )}
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
