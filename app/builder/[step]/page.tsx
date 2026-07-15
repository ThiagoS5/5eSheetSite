import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderLanguages,
  getBuilderSpecies,
} from "@/src/services/ruleService";
import { getItemCatalog } from "@/src/services/itemCatalogService";
import { BuilderStepPanel } from "@/src/components/pages/BuilderStepPanel";
import type { BuilderStepSlug } from "@/src/types/builder";

const stepContent: Record<BuilderStepSlug, { title: string; description: string }> = {
  classe: {
    title: "Class",
    description: "Choose the level 1 class and open details to read the full progression.",
  },
  "recursos-classe": {
    title: "Class Features",
    description: "Choose starting skills and features required by the selected class.",
  },
  subclasse: {
    title: "Subclass",
    description: "Specialize the class with a subclass and its exclusive features.",
  },
  antecedente: {
    title: "Background",
    description: "Apply 2024 ability score bonuses, Origin Feat, and narrative data.",
  },
  especie: {
    title: "Species",
    description: "Choose 2024 species traits. Ability score bonuses do not come from here.",
  },
  "detalhes-especie": {
    title: "Species Details",
    description: "Configure internal choices such as ancestry, lineage, and languages.",
  },
  atributos: {
    title: "Ability Scores",
    description: "Distribute base values and see final modifiers in real time.",
  },
  equipamento: {
    title: "Equipment",
    description: "Select a starting equipment package or the gold alternative.",
  },
  descricao: {
    title: "Description",
    description: "Record identity, appearance, personality, and character notes.",
  },
  conclusao: {
    title: "Summary",
    description: "Review the consolidated sheet and export a Foundry VTT actor locally.",
  },
};

interface BuilderStepPageProps {
  params: Promise<{
    step: string;
  }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(stepContent).map((step) => ({ step }));
}

export default async function BuilderStepPage({ params }: BuilderStepPageProps) {
  const { step } = await params;
  const currentStep = isBuilderStep(step) ? step : "classe";

  return (
    <article className="grid gap-5">
      <BuilderStepPanel
        step={currentStep}
        species={getBuilderSpecies()}
        classes={getBuilderClasses()}
        backgrounds={getBuilderBackgrounds()}
        languages={getBuilderLanguages()}
        itemCatalog={getItemCatalog()}
      />
    </article>
  );
}

function isBuilderStep(step: string): step is BuilderStepSlug {
  return step in stepContent;
}
