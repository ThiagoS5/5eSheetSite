import type { BuilderBackground, BuilderClass, BuilderSpecies } from "@/src/types/builder";
export interface PersonalDetailsEditorProps {
  beginnerMode?: boolean;
  selectedSpecies?: BuilderSpecies;
  selectedBackground?: BuilderBackground;
  selectedClass?: BuilderClass;
}
