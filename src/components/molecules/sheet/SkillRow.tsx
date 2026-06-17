import type { SheetSkill } from "@/types/builder";
import { cn } from "@/src/lib/utils";

interface SkillRowProps {
  skill: SheetSkill;
  compact?: boolean;
}

export function SkillRow({ skill, compact = false }: SkillRowProps) {
  const sign = skill.modifier >= 0 ? "+" : "";

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        compact ? "py-0.5" : "py-1",
      )}
    >
      {/* Proficiency circle */}
      {skill.isExpert ? (
        <div className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-[#f3c969] bg-[#f3c969]/20">
          <div className="h-1.5 w-1.5 rounded-full bg-[#f3c969]" />
        </div>
      ) : skill.isProficient ? (
        <div className="flex h-3 w-3 shrink-0 items-center justify-center rounded border border-[#e61c23] bg-[#e61c23]/20">
          <div className="h-1.5 w-1.5 rounded-sm bg-[#e61c23]" />
        </div>
      ) : (
        <div className="h-3 w-3 shrink-0 rounded border border-white/30" />
      )}

      <span
        className={cn(
          "min-w-[1.5rem] text-right text-[0.72rem] font-semibold",
          skill.modifier >= 0 ? "text-white" : "text-[#b0b5cc]",
        )}
      >
        {sign}{skill.modifier}
      </span>

      <span className="text-[0.72rem] text-[#b0b5cc]">{skill.label}</span>
      <span className="ml-auto text-[0.6rem] text-[#7a7e99]">{skill.attributeKey.slice(0, 3).toUpperCase()}</span>
    </div>
  );
}
