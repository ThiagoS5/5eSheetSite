import type { SheetFeature } from "@/types/builder";
import { cn } from "@/src/lib/utils";

const SOURCE_BADGE: Record<SheetFeature["source"], string> = {
  class: "bg-primary/15 text-primary border-primary/30",
  species: "bg-brand-blue/15 text-brand-blue border-brand-blue/30",
  background: "bg-accent/15 text-accent border-accent/30",
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
    <div className="rounded-lg border border-white/[0.08] bg-card p-3">
      <div className="mb-1 flex items-start gap-2">
        <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest", SOURCE_BADGE[feature.source])}>
          {SOURCE_LABEL[feature.source]}
        </span>
        <h4 className="flex-1 text-sm font-semibold text-foreground">{feature.name}</h4>
      </div>
      {feature.description && (
        <p className="text-[0.72rem] leading-relaxed text-subdued line-clamp-3">
          {feature.description}
        </p>
      )}
    </div>
  );
}
