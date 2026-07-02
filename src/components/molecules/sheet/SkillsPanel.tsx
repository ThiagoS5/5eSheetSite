"use client";

import { useState } from "react";
import type { SheetSkill } from "@/types/builder";
import type { AttributeKey } from "@/types/dnd";
import type { SkillTrainingLevel } from "@/src/types/characterBuild";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { cn } from "@/src/lib/utils";
import { focusRing } from "@/src/lib/styles";
import { SkillDetailModal } from "@/src/components/organisms/sheet/SkillDetailModal";

const ATTRIBUTE_ORDER: AttributeKey[] = [
  "forca", "destreza", "constituicao", "inteligencia", "sabedoria", "carisma",
];
const ATTRIBUTE_ABBR: Record<AttributeKey, string> = {
  forca: "FOR", destreza: "DES", constituicao: "CON",
  inteligencia: "INT", sabedoria: "SAB", carisma: "CAR",
};

const TRAINING_CYCLE: SkillTrainingLevel[] = ["none", "proficient", "expertise"];

function currentTrainingLevel(sk: SheetSkill): SkillTrainingLevel {
  if (sk.isExpert) return "expertise";
  if (sk.isProficient) return "proficient";
  return "none";
}

function nextTrainingLevel(level: SkillTrainingLevel): SkillTrainingLevel {
  const idx = TRAINING_CYCLE.indexOf(level);
  return TRAINING_CYCLE[(idx + 1) % TRAINING_CYCLE.length];
}

interface SkillsPanelProps {
  skills: SheetSkill[];
}

export function SkillsPanel({ skills }: SkillsPanelProps) {
  const [editMode, setEditMode] = useState(false);
  const [openSkill, setOpenSkill] = useState<{ name: string; label: string } | null>(null);
  const setSkillTraining = useCharacterStore((s) => s.setSkillTraining);
  const setSkillOverride = useCharacterStore((s) => s.setSkillOverride);

  const groups = ATTRIBUTE_ORDER.map((key) => ({
    key,
    abbr: ATTRIBUTE_ABBR[key],
    skills: skills.filter((s) => s.attributeKey === key),
  })).filter((g) => g.skills.length > 0);

  return (
    <section className="rounded-[11px] border border-border bg-card p-[14px]">
      <div className="mb-[11px] flex items-center justify-between gap-[7px]">
        <div className="flex items-center gap-[7px]">
          <i aria-hidden="true" className="fa-solid fa-list-check text-[11px] text-muted-foreground" />
          <p className="text-[10px] font-bold uppercase leading-none tracking-[0.16em] text-muted-foreground">
            Perícias
          </p>
        </div>
        <button
          type="button"
          aria-pressed={editMode}
          aria-label="Configurar perícias"
          onClick={() => setEditMode((v) => !v)}
          className={cn(
            "inline-flex h-[22px] w-[22px] items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground",
            focusRing,
            editMode && "border-primary text-foreground",
          )}
        >
          <i aria-hidden="true" className="fa-solid fa-gear text-[11px]" />
        </button>
      </div>
      <div className="flex flex-col gap-[10px]">
        {groups.map((grp) => (
          <div key={grp.key}>
            <p className="mb-[5px] text-[8.5px] font-bold uppercase leading-none tracking-[0.14em] text-brand-crimson-alt">
              {grp.abbr}
            </p>
            <div className="flex flex-col gap-px">
              {grp.skills.map((sk) => {
                const dot = sk.isExpert
                  ? "bg-brand-gold border-transparent"
                  : sk.isProficient
                    ? "bg-primary border-transparent"
                    : "bg-transparent border-border";
                const label = sk.isExpert ? "Especialista" : sk.isProficient ? "Proficiente" : "Não proficiente";
                return (
                  <div key={sk.name} className="flex items-center gap-[9px] rounded-md px-[6px] py-1 hover:bg-surface-nested">
                    {editMode ? (
                      <button
                        type="button"
                        aria-label={`Treino: ${sk.label}`}
                        onClick={() => setSkillTraining(sk.name, nextTrainingLevel(currentTrainingLevel(sk)))}
                        className={cn(
                          "h-[7px] w-[7px] shrink-0 rounded-full border",
                          dot,
                          focusRing,
                        )}
                      />
                    ) : (
                      <span aria-hidden="true" className={`h-[7px] w-[7px] shrink-0 rounded-full border ${dot}`} />
                    )}
                    <span className="sr-only">{label}:</span>
                    <span className="min-w-[30px] text-right font-serif text-sm font-bold text-foreground">
                      {sk.modifier >= 0 ? "+" : ""}{sk.modifier}
                    </span>
                    <button
                      type="button"
                      className={cn("text-left text-[12.5px] text-subdued", !editMode && "underline", focusRing)}
                      onClick={() => setOpenSkill({ name: sk.name, label: sk.label })}
                    >
                      {sk.label}
                    </button>
                    {sk.isOverridden && (
                      <span aria-hidden="true" className="text-[10px] text-brand-crimson-alt">
                        *<span className="sr-only">valor ajustado</span>
                      </span>
                    )}
                    {editMode && (
                      <input
                        type="number"
                        aria-label={`Ajustar ${sk.label}`}
                        className={cn(
                          "ml-auto h-[20px] w-[44px] rounded border border-border bg-background px-1 text-right text-[11px] text-foreground",
                          focusRing,
                        )}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSkillOverride(sk.name, value === "" ? null : Number(value));
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <SkillDetailModal
        skillName={openSkill?.name ?? null}
        label={openSkill?.label ?? ""}
        onClose={() => setOpenSkill(null)}
      />
    </section>
  );
}
