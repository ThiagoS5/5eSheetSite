import type { AttributeGenerationMethod } from "@/src/store/characterStore.types";
import type { AttributeBonuses, AttributeKey, CharacterAttributes } from "@/src/types/dnd";

export interface AttributeEditorProps {
  method: AttributeGenerationMethod;
  baseAttributes: CharacterAttributes;
  backgroundBonuses: AttributeBonuses;
  onMethodChange: (method: AttributeGenerationMethod) => void;
  onAttributeChange: (attribute: AttributeKey, value: number) => void;
}
