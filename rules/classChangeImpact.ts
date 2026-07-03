import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type { BuilderClass } from "@/types/builder";

export interface ClassChangeImpact {
  items: string[];
}

function formatSkillCount(count: number): string {
  return count === 1 ? "1 pericia de classe" : `${count} pericias de classe`;
}

/**
 * Pure rule: what a class change would reset, listed item a item (padrão DDB).
 * Resolves labels only from the `currentClass` passed in — no service calls.
 */
export function getClassChangeImpact({
  state,
  currentClass,
}: {
  state: CharacterBuilderState;
  currentClass: BuilderClass | undefined;
}): ClassChangeImpact {
  const items: string[] = [];

  if (!currentClass) {
    return { items };
  }

  if (state.classSkillProficiencies.length > 0) {
    items.push(formatSkillCount(state.classSkillProficiencies.length));
  }

  for (const group of currentClass.featureChoiceGroups) {
    if (state.classFeatureChoices[group.id]?.length) {
      items.push(group.label);
    }
  }

  if (state.equipmentChoicesBySource.class) {
    items.push("Kit de equipamento da classe");
  }

  if (state.selectedSubclassId) {
    const subclass = currentClass.subclasses.find(
      (entry) => entry.id === state.selectedSubclassId,
    );
    if (subclass) {
      items.push(`Subclasse: ${subclass.name}`);
    }
  }

  return { items };
}
