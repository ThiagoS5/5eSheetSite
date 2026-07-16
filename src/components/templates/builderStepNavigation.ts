import type { BuilderStepSlug } from "@/src/types/builder";

export interface BuilderStepNavigationItem {
  slug: BuilderStepSlug;
  href: string;
  label: string;
  shortLabel: string;
  marker: string;
}

export interface BuilderStepVisibilityInput {
  level: number;
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
    slug: "subclasse",
    href: "/builder/subclasse",
    label: "Subclass",
    shortLabel: "Subclass",
    marker: "SU",
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

export function isBuilderStepVisible(
  step: BuilderStepSlug,
  input: BuilderStepVisibilityInput,
): boolean {
  return step !== "subclasse" || input.level >= 3;
}

export function getVisibleBuilderStepNavigation(
  input: BuilderStepVisibilityInput,
): readonly BuilderStepNavigationItem[] {
  return builderStepNavigation.filter((step) => isBuilderStepVisible(step.slug, input));
}

export function getNextVisibleBuilderStep(
  currentStep: BuilderStepSlug,
  input: BuilderStepVisibilityInput,
): BuilderStepNavigationItem | undefined {
  const visibleSteps = getVisibleBuilderStepNavigation(input);
  const currentIndex = visibleSteps.findIndex((step) => step.slug === currentStep);

  if (currentIndex >= 0) {
    return visibleSteps[currentIndex + 1];
  }

  const canonicalIndex = builderStepNavigation.findIndex((step) => step.slug === currentStep);
  return visibleSteps.find(
    (step) => builderStepNavigation.findIndex((item) => item.slug === step.slug) > canonicalIndex,
  );
}

export function getPreviousVisibleBuilderStep(
  currentStep: BuilderStepSlug,
  input: BuilderStepVisibilityInput,
): BuilderStepNavigationItem | undefined {
  const visibleSteps = getVisibleBuilderStepNavigation(input);
  const currentIndex = visibleSteps.findIndex((step) => step.slug === currentStep);

  if (currentIndex >= 0) {
    return visibleSteps[currentIndex - 1];
  }

  const canonicalIndex = builderStepNavigation.findIndex((step) => step.slug === currentStep);
  return [...visibleSteps]
    .reverse()
    .find(
      (step) =>
        builderStepNavigation.findIndex((item) => item.slug === step.slug) < canonicalIndex,
    );
}

export function getHiddenBuilderStepRedirect(
  currentStep: BuilderStepSlug,
  input: BuilderStepVisibilityInput,
): BuilderStepNavigationItem | undefined {
  if (isBuilderStepVisible(currentStep, input)) {
    return undefined;
  }

  return (
    getNextVisibleBuilderStep(currentStep, input) ??
    getPreviousVisibleBuilderStep(currentStep, input) ??
    builderStepNavigation[0]
  );
}
