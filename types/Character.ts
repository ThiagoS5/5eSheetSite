import type { CharacterAttributes } from "@/types/dnd";

export type { CharacterAttributes } from "@/types/dnd";

export interface Character {
  id: string;
  nome: string;
  classe: string;
  species: string;
  background?: string;
  level?: number;
  hitPoints?: number;
  armorClass?: number;
  updatedAt?: string;
  validationMessages?: readonly string[];
  pendencies?: readonly { severity: "blocking" | "warning" }[];
  portraitUrl?: string;
  currentStepHref?: string;
  atributos: CharacterAttributes;
}
