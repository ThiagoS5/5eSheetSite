"use client";

import { useMemo, useState } from "react";
import { selectCharacterSheetSummary } from "@/src/store/characterSelectors";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import { cn } from "@/src/lib/utils";

type MobileTab = "attrs" | "skills" | "actions" | "codex";

const MOBILE_TABS: { id: MobileTab; icon: string; label: string }[] = [
  { id: "attrs",   icon: "fa-dice-d20",   label: "Atributos" },
  { id: "skills",  icon: "fa-list-check",  label: "Perícias" },
  { id: "actions", icon: "fa-sword",        label: "Ações" },
  { id: "codex",   icon: "fa-book-open",    label: "Códice" },
];

export function CharacterSheetPage() {
  const [mobileTab, setMobileTab] = useState<MobileTab>("attrs");
  const state = useSheetState();
  const summary = useMemo(() => selectCharacterSheetSummary(state), [state]);

  return (
    <div className="flex min-h-screen flex-col bg-[#12131a]">
      {/* Main grid — hidden on mobile, replaced by tab content */}
      <main className="flex-1 p-3 pb-20 md:pb-3 lg:p-4">
        {/* Desktop/tablet grid */}
        <div className="hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
          <div>{/* AttributesColumn placeholder */}</div>
          <div>{/* SkillsColumn placeholder */}</div>
          <div className="md:col-span-2 lg:col-span-1">{/* MainContentColumn placeholder */}</div>
          <div className="hidden xl:block">{/* CodexColumn placeholder */}</div>
        </div>

        {/* Mobile: single column driven by mobileTab */}
        <div className="md:hidden">
          {mobileTab === "attrs"   && <div className="text-white">Atributos mobile</div>}
          {mobileTab === "skills"  && <div className="text-white">Perícias mobile</div>}
          {mobileTab === "actions" && <div className="text-white">Ações mobile</div>}
          {mobileTab === "codex"   && <div className="text-white">Códice mobile</div>}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Seções da ficha"
        className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-white/10 bg-[#10121b] md:hidden"
      >
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMobileTab(tab.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-widest transition-colors",
              mobileTab === tab.id ? "text-[#e61c23]" : "text-[#7a7e99]",
            )}
          >
            <i aria-hidden="true" className={`fa-solid ${tab.icon} text-base`} />
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function useSheetState(): CharacterBuilderState {
  const ruleset = useCharacterStore((s) => s.ruleset);
  const level = useCharacterStore((s) => s.level);
  const selectedSpeciesId = useCharacterStore((s) => s.selectedSpeciesId);
  const selectedClassId = useCharacterStore((s) => s.selectedClassId);
  const selectedBackgroundId = useCharacterStore((s) => s.selectedBackgroundId);
  const inventory = useCharacterStore((s) => s.inventory);
  const equipmentChoicesBySource = useCharacterStore((s) => s.equipmentChoicesBySource);
  const maxUnlockedStepIndex = useCharacterStore((s) => s.maxUnlockedStepIndex);
  const pendingChoiceIds = useCharacterStore((s) => s.pendingChoiceIds);
  const classSkillProficiencies = useCharacterStore((s) => s.classSkillProficiencies);
  const skillTraining = useCharacterStore((s) => s.skillTraining);
  const classFeatureChoices = useCharacterStore((s) => s.classFeatureChoices);
  const speciesChoices = useCharacterStore((s) => s.speciesChoices);
  const speciesLanguages = useCharacterStore((s) => s.speciesLanguages);
  const attributeGenerationMethod = useCharacterStore((s) => s.attributeGenerationMethod);
  const baseAttributes = useCharacterStore((s) => s.baseAttributes);
  const backgroundAbilityBonuses = useCharacterStore((s) => s.backgroundAbilityBonuses);
  const description = useCharacterStore((s) => s.description);

  return useMemo(
    () => ({
      ruleset, level, selectedSpeciesId, selectedClassId, selectedBackgroundId,
      inventory, equipmentChoicesBySource, maxUnlockedStepIndex, pendingChoiceIds,
      classSkillProficiencies, skillTraining, classFeatureChoices, speciesChoices,
      speciesLanguages, attributeGenerationMethod, baseAttributes, backgroundAbilityBonuses,
      description,
    }),
    [
      ruleset, level, selectedSpeciesId, selectedClassId, selectedBackgroundId,
      inventory, equipmentChoicesBySource, maxUnlockedStepIndex, pendingChoiceIds,
      classSkillProficiencies, skillTraining, classFeatureChoices, speciesChoices,
      speciesLanguages, attributeGenerationMethod, baseAttributes, backgroundAbilityBonuses,
      description,
    ],
  );
}
