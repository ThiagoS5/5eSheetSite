"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
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
import { getBuilderClasses } from "@/src/services/ruleService";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import { deriveBuilderPendencies } from "@/rules/pendencyRules";
import type { BuilderStepSlug, Pendency } from "@/types/builder";

type StepStatus = "active" | "complete" | "warning" | "available" | "locked";

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
    label: "Class",
    shortLabel: "Class",
    iconSlug: "classe",
    childSlugs: classGroupSlugs,
  },
  {
    id: "species",
    label: "Species",
    shortLabel: "Species",
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

interface BuilderSidebarProps {
  variant?: "desktop" | "drawer";
}

export function BuilderSidebar({ variant = "desktop" }: BuilderSidebarProps) {
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
  const pendencies = useMemo(() => {
    const characterClass = getBuilderClasses().find(
      (entry) => entry.id === characterState.selectedClassId,
    );
    return deriveBuilderPendencies({ state: characterState, characterClass });
  }, [characterState]);

  const flatSteps = useMemo(
    () => builderStepNavigation.filter((step) => !groupedSlugs.has(step.slug)),
    [],
  );

  const asideClassName =
    variant === "drawer"
      ? "flex min-w-0 h-full min-h-0 flex-col border-border/50 bg-muted text-foreground"
      : `hidden min-w-0 flex-col border-b border-border/50 bg-muted text-foreground xl:flex xl:min-h-[calc(100dvh-4rem)] xl:border-b-0 xl:border-r ${
          collapsed ? "xl:w-[4.5rem]" : "xl:w-full"
        }`;

  return (
    <aside className={asideClassName}>
        <Sidebar collapsible="icon" contained className="w-full bg-transparent">
          <SidebarHeader
            className={cn(
              "h-16 flex-row items-center border-b border-border/50 px-3 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            {collapsed ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Open sidebar (Ctrl+B)"
                aria-label="Open sidebar"
                onClick={toggleSidebar}
                className="h-10 w-10 text-subdued transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-white/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                <PanelLeftOpen className="h-5 w-5" />
              </Button>
            ) : (
              <div className="flex flex-1 items-center justify-between gap-3 px-2 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-foreground shadow-elevation-2"
                  >
                    <Swords className="h-5 w-5" />
                  </span>
                  <span className="truncate font-serif text-sm font-bold uppercase tracking-[0.12em] text-foreground">
                    FORGE & FATE
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Close sidebar (Ctrl+B)"
                  aria-label="Close sidebar"
                  onClick={toggleSidebar}
                  className="h-10 w-10 shrink-0 text-subdued transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-white/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/70"
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
              aria-label={`Wizard progress: step ${Math.max(
                currentIndex + 1,
                1,
              )} of ${totalSteps}`}
              className={cn(
                "mb-4 h-1 bg-white/5 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] [&>div]:bg-primary [&>div]:shadow-[0_0_8px_rgba(230,28,35,0.4)]",
                collapsed && "xl:hidden",
              )}
            />
            <nav aria-label="Character Builder steps" className="min-w-0">
              <SidebarMenu className={cn("min-w-0 gap-1", collapsed && "xl:items-center")}>
                <GroupedStepItem
                  group={sidebarGroups[0]}
                  open={classGroupOpen}
                  onOpenChange={setIsClassOpen}
                  collapsed={collapsed}
                  currentSlug={currentSlug}
                  characterState={characterState}
                  pendencies={pendencies}
                />
                <FlatStepItems
                  steps={flatSteps.filter((step) => step.slug === "antecedente")}
                  collapsed={collapsed}
                  currentSlug={currentSlug}
                  characterState={characterState}
                  pendencies={pendencies}
                />
                <GroupedStepItem
                  group={sidebarGroups[1]}
                  open={speciesGroupOpen}
                  onOpenChange={setIsSpeciesOpen}
                  collapsed={collapsed}
                  currentSlug={currentSlug}
                  characterState={characterState}
                  pendencies={pendencies}
                />
                <FlatStepItems
                  steps={flatSteps.filter((step) => step.slug !== "antecedente")}
                  collapsed={collapsed}
                  currentSlug={currentSlug}
                  characterState={characterState}
                  pendencies={pendencies}
                />
              </SidebarMenu>
            </nav>
          </SidebarContent>
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
  pendencies,
}: {
  group: SidebarStepGroup;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collapsed: boolean;
  currentSlug: BuilderStepSlug;
  characterState: CharacterBuilderState;
  pendencies: Pendency[];
}) {
  const isGroupActive = group.childSlugs.includes(currentSlug);
  const groupHasCompletedChildren = group.childSlugs.some((slug) =>
    isStepComplete(slug, characterState, pendencies),
  );
  const groupHasPendingChildren = group.childSlugs.some((slug) =>
    getStepPendencies(slug, pendencies).length > 0,
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
                  : groupHasPendingChildren
                    ? warningStepClass
                    : availableStepClass,
              collapsed && "xl:justify-center xl:px-0",
            )}
          >
            <StepIcon
              icon={getStepIcon(group.iconSlug)}
              active={isGroupActive}
              done={groupHasCompletedChildren && !isGroupActive}
              warning={groupHasPendingChildren && !isGroupActive}
            />
            <StepLabel
              collapsed={collapsed}
              label={group.label}
              shortLabel={group.shortLabel}
            />
            <ChevronDown
              className={cn(
                "ml-auto h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-180",
                collapsed && "xl:hidden",
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className={collapsed ? "xl:hidden" : ""}>
          <SidebarMenuSub className="ml-3 border-l border-border px-0 pl-3">
            {group.childSlugs.map((slug) => (
              <SubStepItem
                key={slug}
                slug={slug}
                currentSlug={currentSlug}
                characterState={characterState}
                pendencies={pendencies}
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
  pendencies,
}: {
  steps: typeof builderStepNavigation;
  collapsed: boolean;
  currentSlug: BuilderStepSlug;
  characterState: CharacterBuilderState;
  pendencies: Pendency[];
}) {
  return (
    <>
      {steps.map((step) => {
        const stepPendencies = getStepPendencies(step.slug, pendencies);
        const status = getStepStatus(step.slug, currentSlug, characterState, pendencies);
        const isLocked = status === "locked";

        return (
          <SidebarMenuItem
            key={step.href}
            className={collapsed ? "xl:flex xl:justify-center" : ""}
          >
            {isLocked ? (
              <SidebarMenuButton
                aria-disabled="true"
                aria-label={`${step.label} locked`}
                className={cn(
                  baseStepClass,
                  lockedStepClass,
                  collapsed && "xl:justify-center xl:px-0",
                )}
              >
                <StepIcon
                  icon={getStepIcon(step.slug)}
                  active={false}
                  done={false}
                  warning={false}
                />
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
                    warning={status === "warning"}
                  />
                  <StepLabel
                    collapsed={collapsed}
                    label={step.label}
                    shortLabel={step.shortLabel}
                  />
                  <PendencyBadge count={stepPendencies.length} />
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
  pendencies,
}: {
  slug: BuilderStepSlug;
  currentSlug: BuilderStepSlug;
  characterState: CharacterBuilderState;
  pendencies: Pendency[];
}) {
  const step = getStepBySlug(slug);
  const status = getStepStatus(slug, currentSlug, characterState, pendencies);
  const stepPendencies = getStepPendencies(slug, pendencies);
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
            <PendencyBadge count={stepPendencies.length} />
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
            <PendencyBadge count={stepPendencies.length} />
          </Link>
        </SidebarMenuSubButton>
      )}
    </SidebarMenuSubItem>
  );
}

const baseStepClass =
  "min-h-12 gap-3 rounded-md px-4 py-3 text-left text-sm outline-none transition-all hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary/70 data-[active=true]:bg-primary/15 data-[active=true]:text-foreground";

const activeStepClass = "bg-primary/15 text-foreground";
const completeStepClass = "text-brand-green hover:text-brand-green";
const warningStepClass = "text-accent hover:text-accent";
const availableStepClass = "text-muted-foreground hover:text-subdued";
const lockedStepClass =
  "cursor-not-allowed text-faint opacity-70 hover:bg-transparent hover:text-faint";
const subStepClass =
  "h-9 rounded-md px-2 font-sans text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/70";

function getStepClass(status: StepStatus): string {
  if (status === "active") {
    return activeStepClass;
  }

  if (status === "complete") {
    return completeStepClass;
  }

  if (status === "warning") {
    return warningStepClass;
  }

  if (status === "locked") {
    return lockedStepClass;
  }

  return availableStepClass;
}

function getSubStepClass(status: StepStatus): string {
  if (status === "active") {
    return "bg-primary/15 text-foreground hover:text-foreground";
  }

  if (status === "complete") {
    return "text-brand-green hover:text-brand-green";
  }

  if (status === "warning") {
    return "text-accent hover:text-accent";
  }

  if (status === "locked") {
    return "cursor-not-allowed text-faint hover:bg-transparent hover:text-faint";
  }

  return "text-muted-foreground hover:text-subdued";
}

function getStepStatus(
  slug: BuilderStepSlug,
  currentSlug: BuilderStepSlug,
  state: CharacterBuilderState,
  pendencies: Pendency[],
): StepStatus {
  const stepIndex = getStepIndex(slug);

  if (stepIndex > state.maxUnlockedStepIndex) {
    return "locked";
  }

  if (slug === currentSlug) {
    return "active";
  }

  if (getStepPendencies(slug, pendencies).length > 0) {
    return "warning";
  }

  if (isStepComplete(slug, state, pendencies) && stepIndex < state.maxUnlockedStepIndex) {
    return "complete";
  }

  return "available";
}

function isStepComplete(
  slug: BuilderStepSlug,
  state: CharacterBuilderState,
  pendencies: Pendency[],
): boolean {
  if (slug === "classe") {
    return Boolean(state.selectedClassId) && getStepPendencies(slug, pendencies).length === 0;
  }

  if (slug === "especie") {
    return Boolean(state.selectedSpeciesId) && getStepPendencies(slug, pendencies).length === 0;
  }

  return getStepPendencies(slug, pendencies).length === 0;
}

function getStepPendencies(slug: BuilderStepSlug, pendencies: Pendency[]): Pendency[] {
  return pendencies.filter((pendency) => pendency.stepSlug === slug);
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
  warning,
}: {
  icon: string;
  active: boolean;
  done: boolean;
  warning: boolean;
}) {
  return (
    <FontAwesomeIcon
      iconClassName={icon}
      className={`h-5 w-5 shrink-0 ${
        active ? "text-primary" : warning ? "text-accent" : done ? "text-brand-green" : "text-current"
      }`}
    />
  );
}

function SubStepStatusIcon({ status }: { status: StepStatus }) {
  if (status === "complete") {
    return (
      <FontAwesomeIcon
        iconClassName="fa-solid fa-check"
        className="h-3 w-3 shrink-0 text-brand-green"
      />
    );
  }

  if (status === "warning") {
    return (
      <FontAwesomeIcon
        iconClassName="fa-solid fa-triangle-exclamation"
        className="h-3 w-3 shrink-0 text-accent"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "h-2 w-2 shrink-0 rounded-full",
        status === "active" ? "bg-primary" : "bg-faint",
      )}
    />
  );
}

function PendencyBadge({ count }: { count: number }) {
  if (count === 0) {
    return null;
  }

  return (
    <span className="ml-auto rounded border border-accent/40 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-normal text-accent">
      <FontAwesomeIcon
        iconClassName="fa-solid fa-triangle-exclamation"
        className="mr-1 inline h-3 w-3"
      />
      {count} pending
    </span>
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
