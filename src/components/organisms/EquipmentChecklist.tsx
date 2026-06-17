"use client";

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
  BuilderEquipmentPackageItem,
  BuilderSpecies,
} from "@/types/builder";

interface EquipmentSourceKit {
  id: string;
  label: string;
  summary: string;
  items: BuilderEquipmentPackageItem[];
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
          items: entry.items,
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
          items: [],
        },
      ],
      goldLabel: selectedBackground.equipmentGold ?? "Ouro do antecedente",
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
                  onClick={() => {
                    onSourceModeChange(source.key, "items");
                    if (source.kits[0]) onSourceOptionChange(source.key, source.kits[0].id);
                  }}
                />
                <ModeButton
                  active={mode === "gold"}
                  label="Ouro Inicial"
                  onClick={() => onSourceModeChange(source.key, "gold")}
                />
              </div>

              {mode === "items" ? (
                <div className="rounded-md border border-white/10 p-3">
                  {source.kits.map((kit) => (
                    <div key={kit.id}>
                      {kit.items.length > 0 ? (
                        <ul className="grid gap-1 text-sm text-[#b0b5cc]">
                          {kit.items.map((item) => (
                            <li key={item.id} className="flex gap-2">
                              <span className="font-semibold text-white">{item.quantity}×</span>
                              <span>{item.label}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-[#b0b5cc]">{kit.summary}</p>
                      )}
                    </div>
                  ))}
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
