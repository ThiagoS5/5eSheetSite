"use client";

import type { CharacterDescription, CharacterSheetSummary } from "@/types/builder";

interface CodexColumnProps {
  summary: CharacterSheetSummary;
  description: CharacterDescription;
  className?: string;
}

function CodexRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
        {label}
      </span>
      <span className="text-[0.8rem] text-[#e8e9f0]">{value}</span>
    </div>
  );
}

export function CodexColumn({ summary: _summary, description, className }: CodexColumnProps) {
  return (
    <aside aria-label="Códice do personagem" className={`flex flex-col gap-3 ${className ?? ""}`}>
      {/* Avatar placeholder */}
      <div className="glass-card flex aspect-[3/4] w-full items-center justify-center rounded-xl">
        <i aria-hidden="true" className="fa-solid fa-user text-5xl text-[#7a7e99]" />
      </div>

      {/* Identity info */}
      <div className="glass-card flex flex-col gap-3 rounded-xl p-4">
        <CodexRow label="Tendência" value={description.alinhamento} />
        <CodexRow label="Fé" value={description.faith} />
        <CodexRow label="Estilo de Vida" value={description.lifestyle} />
        <div className="grid grid-cols-2 gap-3">
          <CodexRow label="Idade" value={description.age} />
          <CodexRow label="Gênero" value={description.gender} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CodexRow label="Altura" value={description.height} />
          <CodexRow label="Peso" value={description.weight} />
        </div>
      </div>

      {/* Personality */}
      {description.personalidade && (
        <div className="glass-card flex flex-col gap-1.5 rounded-xl p-4">
          <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
            Personalidade
          </span>
          <p className="text-[0.8rem] leading-relaxed text-[#b0b5cc]">
            {description.personalidade}
          </p>
        </div>
      )}

      {/* Appearance */}
      {description.aparencia && (
        <div className="glass-card flex flex-col gap-1.5 rounded-xl p-4">
          <span className="text-[0.6rem] font-semibold uppercase tracking-widest text-[#7a7e99]">
            Aparência Fiel
          </span>
          <p className="text-[0.8rem] leading-relaxed text-[#b0b5cc]">
            {description.aparencia}
          </p>
        </div>
      )}
    </aside>
  );
}
