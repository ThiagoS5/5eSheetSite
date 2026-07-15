/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeatureOptionStep } from "@/src/components/organisms/levelup/FeatureOptionStep";
import type { BuilderChoiceOption } from "@/src/types/builder";

const options: BuilderChoiceOption[] = [
  { label: "Longsword", value: "Longsword" },
  { label: "Shortsword", value: "Shortsword" },
  { label: "Greataxe", value: "Greataxe" },
];

describe("FeatureOptionStep", () => {
  afterEach(cleanup);

  it("adds a value on click", () => {
    const onChange = vi.fn();
    render(<FeatureOptionStep level={1} featureName="Weapon Mastery" count={2} options={options} selected={[]} onChange={onChange} />);
    screen.getByRole("button", { name: "Longsword" }).click();
    expect(onChange).toHaveBeenCalledWith(["Longsword"]);
  });

  it("removes an already-selected value on click", () => {
    const onChange = vi.fn();
    render(<FeatureOptionStep level={1} featureName="Weapon Mastery" count={2} options={options} selected={["Longsword"]} onChange={onChange} />);
    screen.getByRole("button", { name: "Longsword" }).click();
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("ignores clicks once count is reached", () => {
    const onChange = vi.fn();
    render(<FeatureOptionStep level={1} featureName="Weapon Mastery" count={2} options={options} selected={["Longsword", "Shortsword"]} onChange={onChange} />);
    screen.getByRole("button", { name: "Greataxe" }).click();
    expect(onChange).not.toHaveBeenCalled();
  });
});
