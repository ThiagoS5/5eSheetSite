"use client";

import type { CharacterDescription, CharacterSheetSummary } from "@/types/builder";
import { cn } from "@/src/lib/utils";
import { truncate } from "@/src/utils/truncate";

interface CodexColumnProps {
  summary: CharacterSheetSummary;
  description: CharacterDescription;
  className?: string;
}

function isFilled(value: string | undefined | null): boolean {
  return Boolean(value && value.trim() !== "");
}

const labelClass =
  "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground";

function CodexField({
  label,
  value,
  limit,
}: {
  label: string;
  value: string | undefined | null;
  limit: number;
}) {
  const filled = isFilled(value);
  return (
    <div className="flex flex-col gap-0.5">
      <span className={labelClass}>{label}</span>
      <span
        className={cn(
          "text-sm",
          filled ? "text-foreground" : "select-none text-muted-foreground",
        )}
      >
        {truncate(value, limit)}
      </span>
    </div>
  );
}

function NarrativeField({
  label,
  value,
  limit,
  withCard = false,
}: {
  label: string;
  value: string | undefined | null;
  limit: number;
  withCard?: boolean;
}) {
  const filled = isFilled(value);
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        withCard && "rounded-lg border border-border/50 bg-surface-nested p-3",
      )}
    >
      <span className={labelClass}>{label}</span>
      <p
        className={cn(
          "text-base leading-relaxed",
          filled ? "text-subdued" : "select-none italic text-muted-foreground",
        )}
      >
        {truncate(value, limit)}
      </p>
    </div>
  );
}

export function CodexColumn({ description, className }: CodexColumnProps) {
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
        <NarrativeField label="Aparência Fiel" value={description.aparencia} limit={150} />
      </div>

      {/* Dados pessoais */}
      <div className="flex flex-col gap-3 rounded-lg border border-border/50 bg-surface-nested p-3">
        <CodexField label="Tendência" value={description.alinhamento} limit={25} />
        <CodexField label="Fé" value={description.faith} limit={40} />
        <CodexField label="Estilo de Vida" value={description.lifestyle} limit={40} />
        <div className="grid grid-cols-2 gap-3">
          <CodexField label="Idade" value={description.age} limit={12} />
          <CodexField label="Gênero" value={description.gender} limit={20} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CodexField label="Altura" value={description.height} limit={12} />
          <CodexField label="Peso" value={description.weight} limit={12} />
        </div>
      </div>

      {/* Traços de Personalidade — campos narrativos */}
      <section className="flex flex-col gap-4 rounded-lg border border-border/50 bg-surface-nested p-3">
        <h3 className="border-b border-border/50 pb-2 text-base font-semibold text-foreground">
          Traços de Personalidade
        </h3>
        <NarrativeField label="Personalidade & Maneirismos" value={description.personalidade} limit={100} />
        <NarrativeField label="História Prévia" value={description.tracos} limit={200} />
        <NarrativeField label="Notas" value={description.notas} limit={150} />
      </section>
    </aside>
  );
}
