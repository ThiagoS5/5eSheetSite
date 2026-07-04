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
    className: "Fighter",
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
        onOpenSteps={() => {}}
      />,
    );

    expect(screen.getByText(/Step 3\/9/)).toBeInTheDocument();
  });

  it("shows the blocked reason as always-visible text and does not fire onNext", () => {
    const onNext = vi.fn();

    render(
      <MobileBuilderBar
        currentStepIndex={2}
        totalSteps={9}
        onBack={() => {}}
        onNext={onNext}
        nextBlockedReason="Select a class skill."
        identity={baseIdentity}
        onOpenSheet={() => {}}
        onOpenSteps={() => {}}
      />,
    );

    const reason = screen.getByText("Select a class skill.");
    expect(reason).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: /next/i });
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
        onOpenSteps={() => {}}
      />,
    );

    const nextButton = screen.getByRole("button", { name: /next/i });
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
        onOpenSteps={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows identity name, HP and AC", () => {
    render(
      <MobileBuilderBar
        currentStepIndex={2}
        totalSteps={9}
        onBack={() => {}}
        onNext={() => {}}
        identity={baseIdentity}
        onOpenSheet={() => {}}
        onOpenSteps={() => {}}
      />,
    );

    expect(screen.getByText("Aria")).toBeInTheDocument();
    expect(screen.getByText("Fighter")).toBeInTheDocument();
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
        onOpenSteps={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /open the live sheet/i }),
    ).toBeInTheDocument();
  });

  it("disables Next with a visible reason on the last step", () => {
    const onNext = vi.fn();

    render(
      <MobileBuilderBar
        currentStepIndex={8}
        totalSteps={9}
        onBack={() => {}}
        onNext={onNext}
        identity={baseIdentity}
        onOpenSheet={() => {}}
        onOpenSteps={() => {}}
        hasNextStep={false}
      />,
    );

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText(/last step/i)).toBeInTheDocument();

    fireEvent.click(nextButton);
    expect(onNext).not.toHaveBeenCalled();
  });

  it("disables Back with no-op guard on the first step", () => {
    const onBack = vi.fn();

    render(
      <MobileBuilderBar
        currentStepIndex={0}
        totalSteps={9}
        onBack={onBack}
        onNext={() => {}}
        identity={baseIdentity}
        onOpenSheet={() => {}}
        onOpenSteps={() => {}}
        hasPreviousStep={false}
      />,
    );

    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(backButton);
    expect(onBack).not.toHaveBeenCalled();
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
        onOpenSteps={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open the live sheet/i }));
    expect(onOpenSheet).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenSteps when the step indicator is clicked", () => {
    const onOpenSteps = vi.fn();

    render(
      <MobileBuilderBar
        currentStepIndex={2}
        totalSteps={9}
        onBack={() => {}}
        onNext={() => {}}
        identity={baseIdentity}
        onOpenSheet={() => {}}
        onOpenSteps={onOpenSteps}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open builder steps/i }));
    expect(onOpenSteps).toHaveBeenCalledTimes(1);
  });
});
