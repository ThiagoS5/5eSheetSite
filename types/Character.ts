import type { CharacterAttributes } from "@/types/dnd";

export type { CharacterAttributes } from "@/types/dnd";

export interface Character {
  id: string;
  nome: string;
  classe: string;
  species: string;
  level?: number;
  portraitUrl?: string;
  currentStepHref?: string;
  atributos: CharacterAttributes;
}
