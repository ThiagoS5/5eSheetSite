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
    render(<SkillDetailModal skillName={null} label="Arcanismo" onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog with skill info when skillName is provided", () => {
    render(
      <SkillDetailModal
        skillName="Arcana"
        label="Arcanismo"
        onClose={() => {}}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Arcanismo")).toBeInTheDocument();
    expect(screen.getByText(/Inteligência/)).toBeInTheDocument();
    expect(
      screen.getByText("Conhecimento sobre magia, rituais arcanos, entidades mágicas e fenômenos sobrenaturais.")
    ).toBeInTheDocument();
  });

  it("calls onClose when the close button is pressed", () => {
    const onClose = vi.fn();
    render(
      <SkillDetailModal
        skillName="Arcana"
        label="Arcanismo"
        onClose={onClose}
      />
    );
    fireEvent.click(screen.getByLabelText("Fechar"));
    expect(onClose).toHaveBeenCalled();
  });

  it("renders nothing when skillName is unknown", () => {
    render(
      <SkillDetailModal
        skillName="UnknownSkill"
        label="Perícia Desconhecida"
        onClose={() => {}}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
