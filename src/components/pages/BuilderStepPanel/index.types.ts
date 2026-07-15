import type {
  BuilderBackground,
  BuilderClass,
  BuilderLanguage,
  BuilderSpecies,
  BuilderStepSlug,
  CatalogItem,
} from "@/src/types/builder";

export interface BuilderStepPanelProps {
  step: BuilderStepSlug;
  species: BuilderSpecies[];
  classes: BuilderClass[];
  backgrounds: BuilderBackground[];
  languages: BuilderLanguage[];
  itemCatalog: CatalogItem[];
}
