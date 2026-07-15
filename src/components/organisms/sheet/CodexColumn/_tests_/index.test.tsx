/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CodexColumn } from "@/src/components/organisms/sheet/CodexColumn";
import type { CharacterDescription, CharacterSheetSummary } from "@/src/types/builder";

const description: CharacterDescription = {
  nome: "Thalindra",
  alinhamento: "Neutral Good",
  faith: "Mystra",
  lifestyle: "Modest",
  age: "126",
  height: "5'7\"",
  weight: "120 lb",
  eyes: "",
  skin: "",
  hair: "",
  gender: "Female",
  aparencia: "Silver hair and ink-stained robes.",
  personalidade: "Careful, patient, curious.",
  tracos: "Raised in Candlekeep.",
  notas: "Keeps a coded travel journal.",
  historia: "",
  portraitId: "",
};

describe("CodexColumn", () => {
  afterEach(cleanup);

  it("renders narrative and identity fields", () => {
    render(
      <CodexColumn
        description={description}
        summary={{} as CharacterSheetSummary}
      />,
    );

    expect(screen.getByRole("complementary", { name: "Character codex" })).toBeInTheDocument();
    expect(screen.getByText("Neutral Good")).toBeInTheDocument();
    expect(screen.getByText("Mystra")).toBeInTheDocument();
    expect(screen.getByText("Silver hair and ink-stained robes.")).toBeInTheDocument();
    expect(screen.getByText("Keeps a coded travel journal.")).toBeInTheDocument();
  });
});
