import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderLanguages,
  getBuilderSpecies,
} from "@/src/services/ruleService";
import { getItemCatalog } from "@/src/services/itemCatalogService";
import { BuilderStepPanel } from "@/src/components/pages/BuilderStepPanel";
import type { BuilderStepSlug } from "@/types/builder";

const stepContent: Record<BuilderStepSlug, { title: string; description: string }> = {
  classe: {
    title: "Classe",
    description: "Escolha a classe de nivel 1 e abra detalhes para ler a progressao completa.",
  },
  "recursos-classe": {
    title: "Recursos de Classe",
    description: "Escolha pericias e recursos iniciais exigidos pela classe selecionada.",
  },
  antecedente: {
    title: "Antecedente",
    description: "Aplique bonus de atributo 2024, Talento de Origem e dados narrativos.",
  },
  especie: {
    title: "Raca/Especie",
    description: "Escolha os tracos de especie 2024. Bonus de atributo nao vem daqui.",
  },
  "detalhes-especie": {
    title: "Detalhes da Especie",
    description: "Configure escolhas internas como ancestral, linhagem e idiomas.",
  },
  atributos: {
    title: "Atributos",
    description: "Distribua valores base e veja os modificadores finais em tempo real.",
  },
  equipamento: {
    title: "Equipamento",
    description: "Selecione um pacote de equipamento inicial ou a alternativa em ouro.",
  },
  descricao: {
    title: "Descricao",
    description: "Registre identidade, aparencia, personalidade e notas do personagem.",
  },
  conclusao: {
    title: "Conclusao/Resumo",
    description: "Revise a ficha consolidada e exporte um ator Foundry VTT localmente.",
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
  const content = stepContent[currentStep];

  return (
    <article aria-labelledby="step-title" className="grid gap-5">
      <header className="max-w-4xl border-b border-white/[0.06] pb-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Builder 2024
        </p>
        <h2
          id="step-title"
          className="mt-1 font-serif text-2xl font-bold tracking-wide text-foreground"
        >
          {content.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-subdued">
          {content.description}
        </p>
      </header>

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
