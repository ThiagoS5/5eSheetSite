import { describe, expect, it } from "vitest";
import {
  builderStepNavigation,
  getVisibleBuilderStepNavigation,
  getHiddenBuilderStepRedirect,
  getNextVisibleBuilderStep,
  getPreviousVisibleBuilderStep,
} from "@/src/components/templates/builderStepNavigation";

describe("builderStepNavigation visibility", () => {
  it("keeps the canonical ten-step sequence intact", () => {
    expect(builderStepNavigation.map((step) => step.slug)).toEqual([
      "classe",
      "recursos-classe",
      "subclasse",
      "antecedente",
      "especie",
      "detalhes-especie",
      "atributos",
      "equipamento",
      "descricao",
      "conclusao",
    ]);
  });

  it("hides the subclass step before level 3 without changing canonical order", () => {
    expect(getVisibleBuilderStepNavigation({ level: 2 }).map((step) => step.slug)).toEqual([
      "classe",
      "recursos-classe",
      "antecedente",
      "especie",
      "detalhes-especie",
      "atributos",
      "equipamento",
      "descricao",
      "conclusao",
    ]);
    expect(getVisibleBuilderStepNavigation({ level: 3 }).map((step) => step.slug)).toEqual(
      builderStepNavigation.map((step) => step.slug),
    );
  });

  it("skips the hidden subclass route when navigating below level 3", () => {
    expect(getNextVisibleBuilderStep("recursos-classe", { level: 1 })?.slug).toBe(
      "antecedente",
    );
    expect(getPreviousVisibleBuilderStep("antecedente", { level: 1 })?.slug).toBe(
      "recursos-classe",
    );
    expect(getHiddenBuilderStepRedirect("subclasse", { level: 1 })?.slug).toBe(
      "antecedente",
    );
  });
});
