import type { CharacterBuild } from "@/src/types/characterBuild";
import type { CharacterSheetSummary } from "@/types/builder";

export {
  deriveStartingGoldPo,
  selectCharacterSheetSummary,
} from "@/rules/characterSheetSummaryRules";

// Ficha derivada já computada em cada transição de estado (patchCharacterState).
// Consumidores de UI devem preferir este selector a recomputar selectCharacterSheetSummary.
export function selectDerivedSheet(state: {
  characterBuild: CharacterBuild;
}): CharacterSheetSummary {
  return state.characterBuild.derivedSheet;
}
