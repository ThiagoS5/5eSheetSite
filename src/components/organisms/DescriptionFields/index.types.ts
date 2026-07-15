import type { CharacterDescription } from "@/src/types/builder";

export interface DescriptionFieldsProps {
  description: CharacterDescription;
  onFieldChange: (field: keyof CharacterDescription, value: string) => void;
}
