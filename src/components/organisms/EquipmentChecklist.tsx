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
  summary: string;
}

/**
 * Split a "Choose A or B: (A) …; or (B) …" summary into its two options so
 * option A can live under "Itens Oferecidos" and option B under "Ouro Inicial".
 */
function splitOptions(summary: string): { a: string; b: string } | null {
  const match = summary.match(/\(A\)\s*(.*?)\s*;?\s*or\s*\(B\)\s*(.*)$/i);
  if (!match) return null;
  const clean = (text: string) => text.replace(/[;.\s]+$/, "").trim();
  return { a: clean(match[1] ?? ""), b: clean(match[2] ?? "") };
}

/** Split a comma-separated item phrase into qty/label rows (matches the class kit layout). */
function parseItemList(text: string): { qty?: number; label: string }[] {
  return text
    .split(",")
    .map((piece) => piece.trim())
    .filter(Boolean)
    .map((piece) => {
      const match = piece.match(/^(\d+)\s+(.+)$/);
      if (match && !/^(gp|po|pp|pc)$/i.test(match[2] ?? "")) {
        return { qty: Number(match[1]), label: match[2] ?? piece };
      }
      return { label: piece };
    });
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
      summary: "",
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
      summary: selectedBackground.equipmentSummary ?? "",
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
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground">
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
                      {kit.items.filter((item) => item.value === undefined).length > 0 ? (
                        <ul className="grid gap-1 text-base text-subdued">
                          {kit.items
                            .filter((item) => item.value === undefined)
                            .map((item, index) => (
                              <li key={`${kit.id}-${item.id}-${index}`} className="flex gap-2">
                                <span className="font-semibold text-foreground">{item.quantity}×</span>
                                <span>{item.label}</span>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <ul className="grid gap-1 text-base text-subdued">
                          {parseItemList(splitOptions(source.summary)?.a ?? kit.summary).map(
                            (entry, index) => (
                              <li key={`${kit.id}-a-${index}`} className="flex gap-2">
                                {entry.qty ? (
                                  <span className="font-semibold text-foreground">
                                    {entry.qty}×
                                  </span>
                                ) : null}
                                <span>{entry.label}</span>
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-accent/20 bg-accent/10 px-4 py-3 text-base font-semibold text-accent">
                  {splitOptions(source.summary)?.b ?? source.goldLabel}
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
      className={`cursor-pointer rounded-md border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${
        active
          ? "border-brand-crimson-alt bg-brand-crimson-alt text-white"
          : "border-border bg-white/5 text-muted-foreground hover:border-border/80 hover:bg-surface-raised hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
