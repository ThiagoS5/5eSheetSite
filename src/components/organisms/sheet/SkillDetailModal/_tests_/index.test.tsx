/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { SkillDetailModal } from "@/src/components/organisms/sheet/SkillDetailModal";

describe("SkillDetailModal", () => {
  afterEach(cleanup);

  it("renders nothing when skillName is null", () => {
    render(<SkillDetailModal skillName={null} label="Arcana" onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with skill info when skillName is provided", () => {
    render(
      <SkillDetailModal
        skillName="Arcana"
        label="Arcana"
        onClose={() => {}}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Arcana")).toBeInTheDocument();
    expect(screen.getByText(/Intelligence/)).toBeInTheDocument();
    expect(
      screen.getByText("Knowledge of magic, arcane rituals, magical beings, and supernatural phenomena.")
    ).toBeInTheDocument();
  });

  it("calls onClose when the close button is pressed", () => {
    const onClose = vi.fn();
    render(
      <SkillDetailModal
        skillName="Arcana"
        label="Arcana"
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when skillName is unknown", () => {
    render(
      <SkillDetailModal
        skillName="UnknownSkill"
        label="Unknown Skill"
        onClose={() => {}}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
