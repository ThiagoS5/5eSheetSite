import type { CharacterBuild } from "@/src/types/characterBuild";
import type { CharacterSheetSummary } from "@/src/types/builder";

export {
  selectCharacterSheetSummary,
} from "@/rules/characterSheetSummaryRules";
export { deriveStartingGoldPo } from "@/rules/startingGoldRules";

// The derived sheet is already recomputed on each patchCharacterState transition.
// UI consumers should prefer this selector over recalculating the full summary.
export function selectDerivedSheet(state: {
  characterBuild: CharacterBuild;
}): CharacterSheetSummary {
  return state.characterBuild.derivedSheet;
}
