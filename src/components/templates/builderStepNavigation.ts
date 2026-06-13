import type { BuilderStepSlug } from "@/types/builder";

export interface BuilderStepNavigationItem {
  slug: BuilderStepSlug;
  href: string;
  label: string;
  shortLabel: string;
  marker: string;
}

export const builderStepNavigation: readonly BuilderStepNavigationItem[] = [
  {
    slug: "classe",
    href: "/builder/classe",
    label: "Classe",
    shortLabel: "Classe",
    marker: "CL",
  },
  {
    slug: "recursos-classe",
    href: "/builder/recursos-classe",
    label: "Recursos de Classe",
    shortLabel: "Recursos",
    marker: "RC",
  },
  {
    slug: "antecedente",
    href: "/builder/antecedente",
    label: "Antecedente",
    shortLabel: "Origem",
    marker: "BG",
  },
  {
    slug: "especie",
    href: "/builder/especie",
    label: "Raca/Especie",
    shortLabel: "Especie",
    marker: "SP",
  },
  {
    slug: "detalhes-especie",
    href: "/builder/detalhes-especie",
    label: "Detalhes da Especie",
    shortLabel: "Detalhes",
    marker: "DE",
  },
  {
    slug: "atributos",
    href: "/builder/atributos",
    label: "Atributos",
    shortLabel: "Atributos",
    marker: "AT",
  },
  {
    slug: "equipamento",
    href: "/builder/equipamento",
    label: "Equipamento",
    shortLabel: "Equip.",
    marker: "EQ",
  },
  {
    slug: "descricao",
    href: "/builder/descricao",
    label: "Descricao",
    shortLabel: "Descricao",
    marker: "DS",
  },
  {
    slug: "conclusao",
    href: "/builder/conclusao",
    label: "Conclusao",
    shortLabel: "Resumo",
    marker: "OK",
  },
];

export function getStepPosition(step: BuilderStepSlug): number {
  return builderStepNavigation.findIndex((item) => item.slug === step) + 1;
}
