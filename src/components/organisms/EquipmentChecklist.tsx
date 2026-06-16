"use client";

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import type {
  EquipmentAcquisitionMode,
  EquipmentChoicesBySource,
  EquipmentSourceKey,
} from "@/src/store/characterStore.types";
import type {
  BuilderBackground,
  BuilderClass,
  BuilderEquipmentPackage,
  BuilderSpecies,
} from "@/types/builder";

interface EquipmentSourceKit {
  id: string;
  label: string;
  summary: string;
}

interface EquipmentSourceBlock {
  key: EquipmentSourceKey;
  heading: string;
  kits: EquipmentSourceKit[];
  goldLabel: string;
}

interface EquipmentChecklistProps {
  selectedClass?: BuilderClass;
  selectedBackground?: BuilderBackground;
  selectedSpecies?: BuilderSpecies; // reserved for future species equipment source
  choicesBySource: EquipmentChoicesBySource;
  onSourceModeChange: (source: EquipmentSourceKey, mode: EquipmentAcquisitionMode) => void;
  onSourceOptionChange: (source: EquipmentSourceKey, optionId: string) => void;
}

function buildEquipmentSources(
  selectedClass?: BuilderClass,
  selectedBackground?: BuilderBackground,
): EquipmentSourceBlock[] {
  const sources: EquipmentSourceBlock[] = [];

  if (selectedClass?.startingEquipmentPackages.length) {
    sources.push({
      key: "class",
      heading: "EQUIPAMENTO DA CLASSE",
      kits: selectedClass.startingEquipmentPackages.map(
        (entry: BuilderEquipmentPackage) => ({
          id: entry.id,
          label: entry.label,
          summary: entry.summary,
        }),
      ),
      goldLabel: selectedClass.startingEquipmentGold || "Ouro inicial",
    });
  }

  if (selectedBackground?.equipmentSummary) {
    // Background equipment has no structured item data yet — this block is presentational
    // only; the selector currently resolves real items from the class source.
    sources.push({
      key: "background",
      heading: "EQUIPAMENTO DO ANTECEDENTE",
      kits: [
        {
          id: "background-kit",
          label: "Itens do Antecedente",
          summary: selectedBackground.equipmentSummary,
        },
      ],
      goldLabel: "Ouro do antecedente",
    });
  }

  return sources;
}

export function EquipmentChecklist({
  selectedClass,
  selectedBackground,
  choicesBySource,
  onSourceModeChange,
  onSourceOptionChange,
}: EquipmentChecklistProps) {
  const sources = buildEquipmentSources(selectedClass, selectedBackground);

  return (
    <section aria-labelledby="equipment-title" className="grid gap-5">
      <div>
        <p className="text-[0.58rem] font-bold uppercase tracking-[0.14em] text-[#c41e1e]">
          Starting Gear
        </p>
        <h2
          id="equipment-title"
          className="mt-1 font-serif text-xl font-bold tracking-wide text-white"
        >
          Equipamento Inicial
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#7a7e99]">
          Escolha entre os itens oferecidos pela classe ou o ouro inicial.
        </p>
      </div>

      {sources.map((source) => {
        const choice = choicesBySource[source.key];
        const mode: EquipmentAcquisitionMode = choice?.mode ?? "items";

        return (
          <Card key={source.key} className="bg-[#10121b] ring-white/10">
            <CardHeader>
              <p className="text-xs uppercase tracking-widest text-[#7a7e99]">
                {source.heading}
              </p>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-2">
                <ModeButton
                  active={mode === "items"}
                  label="Itens Oferecidos"
                  onClick={() => onSourceModeChange(source.key, "items")}
                />
                <ModeButton
                  active={mode === "gold"}
                  label="Ouro Inicial"
                  onClick={() => onSourceModeChange(source.key, "gold")}
                />
              </div>

              {mode === "items" ? (
                <div className="grid gap-3">
                  {source.kits.map((kit) => {
                    const selected = choice?.selectedOptionId === kit.id;

                    return (
                      <button
                        key={kit.id}
                        type="button"
                        onClick={() => onSourceOptionChange(source.key, kit.id)}
                        className={`grid grid-cols-[1fr_auto] items-start gap-3 rounded-md border p-3 text-left transition ${
                          selected
                            ? "border-[#e61c23] bg-[#e61c23]/5"
                            : "border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span>
                          <span className="block font-bold text-white">{kit.label}</span>
                          <span className="mt-1 block text-sm text-[#b0b5cc]">
                            {kit.summary}
                          </span>
                        </span>
                        {selected ? (
                          <CheckCircle2
                            aria-hidden="true"
                            className="h-5 w-5 text-[#e61c23]"
                          />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-md border border-[#f3c969]/20 bg-[#f3c969]/10 px-4 py-3 text-sm font-semibold text-[#f3c969]">
                  {source.goldLabel}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}

    </section>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
        active
          ? "border-[#e61c23] bg-[#e61c23] text-white"
          : "border-white/10 bg-white/5 text-[#7a7e99] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
