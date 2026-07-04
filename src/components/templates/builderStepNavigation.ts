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
    label: "Class",
    shortLabel: "Class",
    marker: "CL",
  },
  {
    slug: "recursos-classe",
    href: "/builder/recursos-classe",
    label: "Class Features",
    shortLabel: "Features",
    marker: "RC",
  },
  {
    slug: "antecedente",
    href: "/builder/antecedente",
    label: "Background",
    shortLabel: "Origin",
    marker: "BG",
  },
  {
    slug: "especie",
    href: "/builder/especie",
    label: "Species",
    shortLabel: "Species",
    marker: "SP",
  },
  {
    slug: "detalhes-especie",
    href: "/builder/detalhes-especie",
    label: "Species Details",
    shortLabel: "Details",
    marker: "DE",
  },
  {
    slug: "atributos",
    href: "/builder/atributos",
    label: "Ability Scores",
    shortLabel: "Scores",
    marker: "AT",
  },
  {
    slug: "equipamento",
    href: "/builder/equipamento",
    label: "Equipment",
    shortLabel: "Gear",
    marker: "EQ",
  },
  {
    slug: "descricao",
    href: "/builder/descricao",
    label: "Description",
    shortLabel: "Story",
    marker: "DS",
  },
  {
    slug: "conclusao",
    href: "/builder/conclusao",
    label: "Summary",
    shortLabel: "Summary",
    marker: "OK",
  },
];

export function getStepPosition(step: BuilderStepSlug): number {
  return builderStepNavigation.findIndex((item) => item.slug === step) + 1;
}
