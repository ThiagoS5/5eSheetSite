"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Save, Settings } from "lucide-react";
import { BuilderSidebar } from "@/src/components/organisms/BuilderSidebar";
import { CharacterSheetPreview } from "@/src/components/organisms/CharacterSheetPreview";
import { CreationPreferencesDialog } from "@/src/components/organisms/CreationPreferencesDialog";
import { Header } from "@/src/components/organisms/Header";
import { MobileBuilderBar } from "@/src/components/organisms/MobileBuilderBar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";
import { SidebarProvider } from "@/src/components/ui/sidebar";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { builderStepNavigation } from "@/src/components/templates/builderStepNavigation";
import { deriveBuilderPendencies } from "@/rules/pendencyRules";
import { validateBuilderStep } from "@/rules/builderValidation";
import { getBuilderClasses } from "@/src/services/ruleService";
import { readGlobalPreferences, writeGlobalPreferences } from "@/src/services/preferencesService";
import { selectDerivedSheet } from "@/src/store/characterSelectors";
import { useCharacterBuilderState } from "@/src/store/useCharacterBuilderState";
import { useCharacterStore } from "@/src/store/useCharacterStore";

import type { BuilderShellProps } from "./index.types";
export type { BuilderShellProps } from "./index.types";
export function BuilderShell({ children }: BuilderShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const updatedAt = useCharacterStore(
    (state) => state.characterBuild.exportMetadata.updatedAt,
  );
  const characterState = useCharacterBuilderState();
  const commitCurrentBuild = useCharacterStore(
    (state) => state.commitCurrentBuild,
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sheetCollapsed, setSheetCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileStepsOpen, setMobileStepsOpen] = useState(false);
  const isSummaryStep = pathname?.endsWith("/conclusao") ?? false;
  const showSheetPreview = !isSummaryStep;
  const gridLayout = getGridLayout(
    sidebarCollapsed,
    sheetCollapsed,
    showSheetPreview,
  );

  const currentStepIndex = builderStepNavigation.findIndex(
    (step) => step.href === pathname,
  );
  const currentStep =
    builderStepNavigation[currentStepIndex] ?? builderStepNavigation[0];
  const previousStep = builderStepNavigation[currentStepIndex - 1];
  const nextStep = builderStepNavigation[currentStepIndex + 1];
  const totalSteps = builderStepNavigation.length;

  const summary = useCharacterStore(selectDerivedSheet);
  const builderClasses = useMemo(() => getBuilderClasses(), []);
  const className = useMemo(
    () => builderClasses.find((entry) => entry.id === summary.classId)?.name,
    [builderClasses, summary.classId],
  );

  const stepMessages = validateBuilderStep(currentStep.slug, characterState);
  const pendencies = useMemo(() => {
    const characterClass = builderClasses.find(
      (entry) => entry.id === characterState.selectedClassId,
    );
    return deriveBuilderPendencies({ state: characterState, characterClass });
  }, [builderClasses, characterState]);
  const currentStepPendencies = pendencies.filter(
    (pendency) => pendency.stepSlug === currentStep.slug,
  );
  const nextBlockedReason =
    nextStep && (stepMessages.length > 0 || currentStepPendencies.length > 0)
      ? stepMessages[0] ??
        currentStepPendencies[0]?.label ??
        "Complete this step's pending items to continue."
      : undefined;

  function handleBack() {
    if (previousStep) {
      router.push(previousStep.href);
    }
  }

  function handleNext() {
    if (!nextStep) {
      return;
    }

    void commitCurrentBuild(nextStep.slug, currentStepIndex + 1).then(() => {
      router.push(nextStep.href);
    });
  }

  return (
    <SidebarProvider
      open={!sidebarCollapsed}
      onOpenChange={(open) => setSidebarCollapsed(!open)}
      className="block min-h-0 w-full bg-transparent"
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4.5rem",
        } as React.CSSProperties
      }
    >
      <main className="builder-shell-main min-h-screen overflow-x-clip bg-surface-nested text-foreground">
        <Header />
        <div
          data-builder-layout={gridLayout}
          className="builder-shell-grid grid min-h-[calc(100dvh-4rem)] w-full min-w-0"
        >
          {isMobile ? null : <BuilderSidebar />}

          <section
            aria-labelledby="builder-title"
            className="min-w-0 border-x border-white/[0.06] bg-surface-nested"
          >
            <div
              className={`px-4 py-5 md:px-6 ${
                isMobile ? (nextBlockedReason ? "pb-36" : "pb-28") : ""
              }`}
            >
              <AutosaveStatus updatedAt={updatedAt} />
              {children}
            </div>
          </section>

          {showSheetPreview && !isMobile ? (
            <CharacterSheetPreview
              collapsed={sheetCollapsed}
              onToggleCollapsed={() => setSheetCollapsed((value) => !value)}
            />
          ) : null}
        </div>

        {isMobile ? (
          <MobileBuilderBar
            currentStepIndex={Math.max(currentStepIndex, 0)}
            totalSteps={totalSteps}
            onBack={handleBack}
            onNext={handleNext}
            nextBlockedReason={nextBlockedReason}
            hasPreviousStep={Boolean(previousStep)}
            hasNextStep={Boolean(nextStep)}
            identity={{
              name: characterState.description.nome || "Unnamed Hero",
              className: className || "Class",
              level: summary.level,
              hp: summary.hitPoints,
              ac: summary.armorClass,
            }}
            onOpenSheet={() => setMobileSheetOpen(true)}
            onOpenSteps={() => setMobileStepsOpen(true)}
          />
        ) : null}
      </main>

      {isMobile ? (
        <>
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetContent side="bottom" className="h-[85svh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Live Sheet</SheetTitle>
              </SheetHeader>
              <CharacterSheetPreview variant="drawer" />
            </SheetContent>
          </Sheet>

          <Sheet open={mobileStepsOpen} onOpenChange={setMobileStepsOpen}>
            <SheetContent side="bottom" className="h-[85svh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Builder steps</SheetTitle>
              </SheetHeader>
              <BuilderSidebar variant="drawer" />
            </SheetContent>
          </Sheet>
        </>
      ) : null}
    </SidebarProvider>
  );
}

function AutosaveStatus({ updatedAt }: { updatedAt: string }) {
  const savedAt = formatSavedAt(updatedAt);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const beginnerMode = useCharacterStore((state) => state.beginnerMode);
  const setBeginnerMode = useCharacterStore((state) => state.setBeginnerMode);

  function handleBeginnerModeToggle() {
    const next = !beginnerMode;
    setBeginnerMode(next);
    writeGlobalPreferences({
      ...readGlobalPreferences(),
      beginnerMode: next,
    });
  }

  return (
    <div className="mb-4 flex flex-wrap justify-end gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={beginnerMode}
        aria-label="Guided mode"
        onClick={handleBeginnerModeToggle}
        className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[11px] font-bold uppercase tracking-[0.12em] outline-none transition focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 ${
          beginnerMode
            ? "border-brand-gold-alt/60 bg-brand-gold-alt/15 text-foreground"
            : "border-white/[0.08] bg-card text-muted-foreground hover:text-foreground"
        }`}
      >
        Guided mode
        <span
          aria-hidden="true"
          className={`h-2.5 w-2.5 rounded-full ${
            beginnerMode ? "bg-brand-gold-alt" : "bg-muted-foreground"
          }`}
        />
      </button>
      <button
        type="button"
        aria-label="Creation preferences"
        onClick={() => setPreferencesOpen(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-card text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
      >
        <Settings aria-hidden="true" className="h-4 w-4" />
      </button>
      <div
        role="status"
        aria-label="Draft saved"
        className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-card px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground"
      >
        <Save aria-hidden="true" className="h-3.5 w-3.5 text-brand-green" />
        Saved <span suppressHydrationWarning>{savedAt}</span>
      </div>
      <CreationPreferencesDialog
        open={preferencesOpen}
        onClose={() => setPreferencesOpen(false)}
      />
    </div>
  );
}

function formatSavedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getGridLayout(
  sidebarCollapsed: boolean,
  sheetCollapsed: boolean,
  showSheetPreview: boolean,
): string {
  if (!showSheetPreview) {
    return sidebarCollapsed ? "summary-collapsed" : "summary-expanded";
  }

  if (sidebarCollapsed && sheetCollapsed) {
    return "full-collapsed";
  }

  if (sidebarCollapsed) {
    return "full-sidebar-collapsed";
  }

  if (sheetCollapsed) {
    return "full-sheet-collapsed";
  }

  return "full-expanded";
}
