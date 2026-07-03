/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MobileBuilderBar } from "@/src/components/organisms/MobileBuilderBar";

describe("MobileBuilderBar", () => {
  afterEach(() => {
    cleanup();
  });

  const baseIdentity = {
    name: "Aria",
    className: "Guerreiro",
    level: 3,
    hp: 28,
    ac: 16,
  };

  it("renders the current step position", () => {
    render(
      <MobileBuilderBar
        currentStepIndex={2}
        totalSteps={9}
        onBack={() => {}}
        onNext={() => {}}
        identity={baseIdentity}
        onOpenSheet={() => {}}
      />,
    );

    expect(screen.getByText(/Etapa 3\/9/)).toBeInTheDocument();
  });

  it("shows the blocked reason as always-visible text and does not fire onNext", () => {
    const onNext = vi.fn();

    render(
      <MobileBuilderBar
        currentStepIndex={2}
        totalSteps={9}
        onBack={() => {}}
        onNext={onNext}
        nextBlockedReason="Selecione uma perícia de classe."
        identity={baseIdentity}
        onOpenSheet={() => {}}
      />,
    );

    const reason = screen.getByText("Selecione uma perícia de classe.");
    expect(reason).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /avançar/i });
    expect(nextButton).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(nextButton);
    expect(onNext).not.toHaveBeenCalled();
  });

  it("fires onNext when unblocked", () => {
    const onNext = vi.fn();

    render(
      <MobileBuilderBar
        currentStepIndex={2}
        totalSteps={9}
        onBack={() => {}}
        onNext={onNext}
        identity={baseIdentity}
        onOpenSheet={() => {}}
      />,
    );

    const nextButton = screen.getByRole("button", { name: /avançar/i });
    expect(nextButton).not.toHaveAttribute("aria-disabled", "true");

    fireEvent.click(nextButton);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("fires onBack when the back button is clicked", () => {
    const onBack = vi.fn();

    render(
      <MobileBuilderBar
        currentStepIndex={2}
        totalSteps={9}
        onBack={onBack}
        onNext={() => {}}
        identity={baseIdentity}
        onOpenSheet={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows identity name, PV and CA", () => {
    render(
      <MobileBuilderBar
        currentStepIndex={2}
        totalSteps={9}
        onBack={() => {}}
        onNext={() => {}}
        identity={baseIdentity}
        onOpenSheet={() => {}}
      />,
    );

    expect(screen.getByText("Aria")).toBeInTheDocument();
    expect(screen.getByText("Guerreiro")).toBeInTheDocument();
    expect(screen.getByText(/28/)).toBeInTheDocument();
    expect(screen.getByText(/16/)).toBeInTheDocument();
  });

  it("gives all buttons accessible names", () => {
    render(
      <MobileBuilderBar
        currentStepIndex={2}
        totalSteps={9}
        onBack={() => {}}
        onNext={() => {}}
        identity={baseIdentity}
        onOpenSheet={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /voltar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /avançar/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /abrir ficha/i }),
    ).toBeInTheDocument();
  });

  it("calls onOpenSheet when the identity button is clicked", () => {
    const onOpenSheet = vi.fn();

    render(
      <MobileBuilderBar
        currentStepIndex={2}
        totalSteps={9}
        onBack={() => {}}
        onNext={() => {}}
        identity={baseIdentity}
        onOpenSheet={onOpenSheet}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /abrir ficha/i }));
    expect(onOpenSheet).toHaveBeenCalledTimes(1);
  });
});
