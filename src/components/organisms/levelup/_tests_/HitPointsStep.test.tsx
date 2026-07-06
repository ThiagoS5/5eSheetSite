/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HitPointsStep } from "@/src/components/organisms/levelup/HitPointsStep";

describe("HitPointsStep", () => {
  afterEach(cleanup);

  it("offers average and roll, and confirms average", async () => {
    const onChoose = vi.fn();
    render(
      <HitPointsStep hitDie={10} targetLevel={5} conModifier={2} onChoose={onChoose} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /average/i }));
    expect(onChoose).toHaveBeenCalledWith("average");

    expect(screen.getByText(/6/)).toBeInTheDocument();
  });

  it("rolls a die and confirms the rolled number", async () => {
    const onChoose = vi.fn();
    render(
      <HitPointsStep
        hitDie={10}
        targetLevel={5}
        conModifier={0}
        onChoose={onChoose}
        rollFn={() => 7}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /roll/i }));
    await userEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onChoose).toHaveBeenCalledWith(7);
  });
});
