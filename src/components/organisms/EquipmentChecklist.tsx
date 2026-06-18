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
    sources.push({
      key: "background",
      heading: "EQUIPAMENTO DO ANTECEDENTE",
      kits: [
        {
          id: "background-kit",
          label: "Itens do Antecedente",
          summary: selectedBackground.equipmentSummary,
          items: selectedBackground.equipmentItemsA ?? [],
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
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-crimson-alt">
          Starting Gear
        </p>
        <h2
          id="equipment-title"
          className="mt-1 font-serif text-xl font-bold tracking-wide text-foreground"
        >
          Equipamento Inicial
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Escolha entre os itens oferecidos pela classe ou o ouro inicial.
        </p>
      </div>

      {sources.map((source) => {
        const choice = choicesBySource[source.key];
        const mode: EquipmentAcquisitionMode = choice?.mode ?? "items";

        return (
          <Card key={source.key} className="bg-muted ring-white/10">
            <CardHeader>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
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
                <div className="rounded-md border border-border p-3">
                  {source.kits
                    .filter((kit) => !choice?.selectedOptionId || kit.id === choice.selectedOptionId)
                    .map((kit) => (
                    <div key={kit.id}>
                      {kit.items.length > 0 ? (
                        <ul className="grid gap-1 text-sm text-subdued">
                          {kit.items.map((item) => (
                            <li key={item.id} className="flex gap-2">
                              {item.value !== undefined ? (
                                <span className="text-foreground">{item.value / 100} GP</span>
                              ) : (
                                <>
                                  <span className="font-semibold text-foreground">{item.quantity}×</span>
                                  <span>{item.label}</span>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-subdued">{kit.summary}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-accent/20 bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">
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
          ? "border-primary bg-primary text-foreground"
          : "border-border bg-white/5 text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
