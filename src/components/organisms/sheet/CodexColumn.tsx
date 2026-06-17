"use client";

import type { CharacterDescription, CharacterSheetSummary } from "@/types/builder";
import { cn } from "@/src/lib/utils";

interface CodexColumnProps {
  summary: CharacterSheetSummary;
  description: CharacterDescription;
  className?: string;
}

function isFilled(value: string | undefined | null): boolean {
  return Boolean(value && value.trim() !== "");
}

function fieldValue(value: string | undefined | null): string {
  return isFilled(value) ? (value as string) : "—";
}

const labelClass =
  "text-[0.6rem] font-semibold uppercase tracking-widest text-muted-foreground";

function CodexField({ label, value }: { label: string; value: string | undefined | null }) {
  const filled = isFilled(value);
  return (
    <div className="flex flex-col gap-0.5">
      <span className={labelClass}>{label}</span>
      <span
        className={cn(
          "text-[0.8rem]",
          filled ? "text-foreground" : "select-none text-muted-foreground",
        )}
      >
        {fieldValue(value)}
      </span>
    </div>
  );
}

function CodexTextField({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) {
  const filled = isFilled(value);
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border/50 bg-surface-nested p-3">
      <span className={labelClass}>{label}</span>
      <p
        className={cn(
          "text-[0.8rem] leading-relaxed",
          filled ? "text-subdued" : "select-none text-muted-foreground",
        )}
      >
        {fieldValue(value)}
      </p>
    </div>
  );
}

export function CodexColumn({ summary: _summary, description, className }: CodexColumnProps) {
  return (
    <aside
      aria-label="Códice do personagem"
      className={cn(
        "relative flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-card p-4",
        className,
      )}
    >
      {/* Linha decorativa no topo */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-primary/60 via-primary/20 to-transparent"
      />

      {/* Header da seção */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <i aria-hidden="true" className="fa-solid fa-scroll text-primary" />
        <h2 className="text-sm font-semibold uppercase tracking-widest text-foreground">
          Códice do Personagem
        </h2>
      </div>

      {/* Aparência: avatar + descrição fiel */}
      <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-surface-nested p-3">
        <div className="flex aspect-[3/4] w-full items-center justify-center rounded-lg border border-border/50 bg-muted">
          <i aria-hidden="true" className="fa-solid fa-user text-5xl text-muted-foreground" />
        </div>
        <CodexFieldInline label="Aparência Fiel" value={description.aparencia} />
      </div>

      {/* Dados pessoais */}
      <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-surface-nested p-3">
        <CodexField label="Tendência" value={description.alinhamento} />
        <CodexField label="Fé" value={description.faith} />
        <CodexField label="Estilo de Vida" value={description.lifestyle} />
        <div className="grid grid-cols-2 gap-3">
          <CodexField label="Idade" value={description.age} />
          <CodexField label="Gênero" value={description.gender} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CodexField label="Altura" value={description.height} />
          <CodexField label="Peso" value={description.weight} />
        </div>
      </div>

      {/* Personalidade */}
      <CodexTextField
        label="Traços de Personalidade"
        value={description.personalidade}
      />
    </aside>
  );
}

/** Texto longo dentro de um sub-card já existente (sem container próprio). */
function CodexFieldInline({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) {
  const filled = isFilled(value);
  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClass}>{label}</span>
      <p
        className={cn(
          "text-[0.8rem] leading-relaxed",
          filled ? "text-subdued" : "select-none text-muted-foreground",
        )}
      >
        {fieldValue(value)}
      </p>
    </div>
  );
}
