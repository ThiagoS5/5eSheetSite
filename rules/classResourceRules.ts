import type { CharacterSheetSummary, SheetResource } from "@/src/types/builder";

/** Explicit 2024 pools. Mentioning a rest in prose does not define a resource. */
export function deriveClassResources(input: Pick<CharacterSheetSummary, "classId" | "level" | "finalAttributes">): SheetResource[] {
  const { classId, level, finalAttributes } = input;
  const pool = (id: string, label: string, maxUses: number, shortRestRecovery: number | "all" = 0): SheetResource => ({ id, label, maxUses, shortRestRecovery });
  switch (classId) {
    case "fighter-xphb": return [
      pool("second-wind", "Second Wind", level >= 10 ? 4 : level >= 4 ? 3 : 2, 1),
      ...(level >= 2 ? [pool("action-surge", "Action Surge", level >= 17 ? 2 : 1, "all")] : []),
      ...(level >= 9 ? [pool("indomitable", "Indomitable", level >= 17 ? 3 : level >= 13 ? 2 : 1)] : []),
    ];
    case "monk-xphb": return level >= 2 ? [pool("monks-focus", "Focus Points", level, "all")] : [];
    case "sorcerer-xphb": return level >= 2 ? [pool("font-of-magic", "Sorcery Points", level)] : [];
    case "bard-xphb": return [pool("bardic-inspiration", "Bardic Inspiration", Math.max(1, Math.floor((finalAttributes.carisma - 10) / 2)), level >= 5 ? "all" : 0)];
    case "barbarian-xphb": return [pool("rage", "Rage", level >= 17 ? 6 : level >= 12 ? 5 : level >= 6 ? 4 : level >= 3 ? 3 : 2, 1)];
    case "cleric-xphb": return level >= 2 ? [pool("channel-divinity", "Channel Divinity", level >= 18 ? 4 : level >= 6 ? 3 : 2, 1)] : [];
    case "druid-xphb": return level >= 2 ? [pool("wild-shape", "Wild Shape", level >= 17 ? 4 : level >= 6 ? 3 : 2, 1)] : [];
    case "paladin-xphb": return level >= 3 ? [pool("channel-divinity", "Channel Divinity", level >= 11 ? 3 : 2, 1)] : [];
    case "ranger-xphb": return [pool("favored-enemy", "Hunter's Mark (free casts)", 2 + Math.floor((level - 1) / 4))];
    case "warlock-xphb": return level >= 2 ? [pool("magical-cunning", "Magical Cunning", 1)] : [];
    case "wizard-xphb": return [pool("arcane-recovery", "Arcane Recovery", 1)];
    case "rogue-xphb": return level >= 20 ? [pool("stroke-of-luck", "Stroke of Luck", 1, "all")] : [];
    default: return [];
  }
}

export function recoverClassResources(uses: Record<string, number>, resources: readonly SheetResource[]): Record<string, number> {
  const next = { ...uses };
  for (const resource of resources) {
    const spent = next[resource.id] ?? 0;
    const recovered = resource.shortRestRecovery === "all" ? spent : resource.shortRestRecovery;
    if (recovered <= 0) continue;
    if (spent <= recovered) delete next[resource.id];
    else next[resource.id] = spent - recovered;
  }
  return next;
}
