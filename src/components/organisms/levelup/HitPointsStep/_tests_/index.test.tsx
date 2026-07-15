/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HitPointsStep } from "@/src/components/organisms/levelup/HitPointsStep";

describe("HitPointsStep", () => {
  afterEach(cleanup);

  it("shows the rolled HP value as a visible result before confirmation", () => {
    const onChoose = vi.fn();

    render(
      <HitPointsStep
        hitDie={10}
        targetLevel={2}
        conModifier={2}
        onChoose={onChoose}
        rollFn={() => 7}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /roll die/i }));

    expect(screen.getByText("Rolled HP")).toBeVisible();
    expect(screen.getByText("7")).toBeVisible();
    expect(screen.getByText("+2 CON")).toBeVisible();
    expect(screen.getByText("9 total")).toBeVisible();
    expect(onChoose).not.toHaveBeenCalled();
  });
});
