"use client";

import { useMemo, useState, type ReactNode } from "react";
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
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { useCharacterStore } from "@/src/store/useCharacterStore";

interface BuilderShellProps {
  children: ReactNode;
}

export function BuilderShell({ children }: BuilderShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const updatedAt = useCharacterStore(
    (state) => state.characterBuild.exportMetadata.updatedAt,
  );
  const characterState = useCharacterStore((state) => state);
  const commitCurrentBuild = useCharacterStore(
    (state) => state.commitCurrentBuild,
  );
  const description = useCharacterStore((state) => state.description);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sheetCollapsed, setSheetCollapsed] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  // The summary step is the full character sheet itself, so the live preview
  // aside is redundant there and is hidden.
  const isSummaryStep = pathname?.endsWith("/conclusao") ?? false;
  const showSheetPreview = !isSummaryStep;
  const gridClass = getGridClass(
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

  const summary = useMemo(
    () => selectCharacterSheetSummary(characterState),
    [characterState],
  );
  const className = getBuilderClasses().find(
    (entry) => entry.id === summary.classId,
  )?.name;

  const stepMessages = validateBuilderStep(currentStep.slug, characterState);
  const pendencies = useMemo(() => {
    const characterClass = getBuilderClasses().find(
      (entry) => entry.id === characterState.selectedClassId,
    );
    return deriveBuilderPendencies({ state: characterState, characterClass });
  }, [characterState]);
  const currentStepPendencies = pendencies.filter(
    (pendency) => pendency.stepSlug === currentStep.slug,
  );
  const nextBlockedReason =
    nextStep && (stepMessages.length > 0 || currentStepPendencies.length > 0)
      ? stepMessages[0] ??
        currentStepPendencies[0]?.label ??
        "Conclua as pendencias desta etapa para avancar."
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
      <main className="min-h-screen overflow-x-clip bg-surface-nested pt-16 text-foreground">
        <Header />
        <div className={`grid min-h-[calc(100dvh-4rem)] w-full min-w-0 ${gridClass}`}>
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
              name: description.nome || "Unnamed Hero",
              className: className || "Class",
              level: summary.level,
              hp: summary.hitPoints,
              ac: summary.armorClass,
            }}
            onOpenSheet={() => setMobileSheetOpen(true)}
          />
        ) : null}
      </main>

      {isMobile ? (
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetContent side="bottom" className="h-[85svh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Live Sheet</SheetTitle>
            </SheetHeader>
            <BuilderSidebar variant="drawer" />
          </SheetContent>
        </Sheet>
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
        className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[10px] font-bold uppercase tracking-[0.14em] outline-none transition focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 ${
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
        className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-card px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground"
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

function getGridClass(
  sidebarCollapsed: boolean,
  sheetCollapsed: boolean,
  showSheetPreview: boolean,
): string {
  if (!showSheetPreview) {
    return sidebarCollapsed
      ? "xl:grid-cols-[4.5rem_minmax(0,1fr)]"
      : "xl:grid-cols-[16rem_minmax(0,1fr)]";
  }

  if (sidebarCollapsed && sheetCollapsed) {
    return "xl:grid-cols-[4.5rem_minmax(0,1fr)_4.5rem]";
  }

  if (sidebarCollapsed) {
    return "xl:grid-cols-[4.5rem_minmax(0,1fr)_22rem] 2xl:grid-cols-[4.5rem_minmax(0,1fr)_24rem]";
  }

  if (sheetCollapsed) {
    return "xl:grid-cols-[16rem_minmax(0,1fr)_4.5rem]";
  }

  return "xl:grid-cols-[16rem_minmax(0,1fr)_22rem] 2xl:grid-cols-[16rem_minmax(0,1fr)_24rem]";
}
