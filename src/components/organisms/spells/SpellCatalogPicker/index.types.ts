import type { CharacterSpellcastingChoices } from "@/src/types/spells";

export interface SpellCatalogPickerProps {
  className: string;
  activeSources?: readonly string[];
  value?: CharacterSpellcastingChoices;
  cantripLimit: number;
  spellLimit: number;
  spellMode: "prepared" | "known";
  maxSpellLevel: number;
  disabled?: boolean;
  onChange: (choices: CharacterSpellcastingChoices) => void;
}
