import type { SheetFeature } from "@/types/builder";
import { cn } from "@/src/lib/utils";

const SOURCE_BADGE: Record<SheetFeature["source"], string> = {
  class: "bg-[#e61c23]/15 text-[#e61c23] border-[#e61c23]/30",
  species: "bg-[#4a9eff]/15 text-[#4a9eff] border-[#4a9eff]/30",
  background: "bg-[#f3c969]/15 text-[#f3c969] border-[#f3c969]/30",
};

const SOURCE_LABEL: Record<SheetFeature["source"], string> = {
  class: "Classe",
  species: "Espécie",
  background: "Antecedente",
};

interface ActionCardProps {
  feature: SheetFeature;
}

export function ActionCard({ feature }: ActionCardProps) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-[#1c1e2a] p-3">
      <div className="mb-1 flex items-start gap-2">
        <span className={cn("rounded border px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-widest", SOURCE_BADGE[feature.source])}>
          {SOURCE_LABEL[feature.source]}
        </span>
        <h4 className="flex-1 text-sm font-semibold text-white">{feature.name}</h4>
      </div>
      {feature.description && (
        <p className="text-[0.72rem] leading-relaxed text-[#b0b5cc] line-clamp-3">
          {feature.description}
        </p>
      )}
    </div>
  );
}
