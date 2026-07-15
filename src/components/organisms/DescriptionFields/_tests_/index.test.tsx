/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DescriptionFields } from "@/src/components/organisms/DescriptionFields";
import type { CharacterDescription } from "@/src/types/builder";

const description: CharacterDescription = {
  nome: "Thalindra",
  alinhamento: "Neutral Good",
  faith: "",
  lifestyle: "",
  age: "",
  height: "",
  weight: "",
  eyes: "",
  skin: "",
  hair: "",
  gender: "",
  aparencia: "",
  personalidade: "",
  tracos: "",
  notas: "",
  historia: "",
  portraitId: "",
};

describe("DescriptionFields", () => {
  afterEach(cleanup);

  it("renders editable description fields", () => {
    render(<DescriptionFields description={description} onFieldChange={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Description" })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Thalindra");
    expect(screen.getByLabelText("Alignment")).toHaveValue("Neutral Good");
  });

  it("emits the changed description field name and value", () => {
    const onFieldChange = vi.fn();
    render(<DescriptionFields description={description} onFieldChange={onFieldChange} />);

    fireEvent.change(screen.getByLabelText("Backstory"), {
      target: { value: "Raised in Candlekeep." },
    });

    expect(onFieldChange).toHaveBeenCalledWith("tracos", "Raised in Candlekeep.");
  });
});
