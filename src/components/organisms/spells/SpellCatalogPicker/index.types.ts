import type { BuilderSpell, CharacterSpellcastingChoices } from "@/src/types/spells";

export interface SpellCatalogPickerProps {
  className: string;
  grantedSpells?: readonly BuilderSpell[];
  activeSources?: readonly string[];
  value?: CharacterSpellcastingChoices;
  additionalValue?: CharacterSpellcastingChoices;
  cantripLimit: number;
  spellLimit: number;
  spellMode: "prepared" | "known";
  maxSpellLevel: number;
  disabled?: boolean;
  allowExtraChoices?: boolean;
  onChange: (choices: CharacterSpellcastingChoices) => void;
  onAdditionalChange?: (choices: CharacterSpellcastingChoices) => void;
}
