/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CharacterStoreProvider, useCharacterStore } from "@/src/store/useCharacterStore";
import { LevelUpFlow } from "@/src/components/organisms/levelup/LevelUpFlow";

const INTEGRATION_TEST_TIMEOUT_MS = 15_000;

// Opens the flow AFTER setting up state (a real open transition), and pre-resolves
// the level-1 Weapon Mastery feature-option (3 arbitrary picks satisfy count===3)
// and the HP roll for the target level, leaving the subclass as the sole pending step.
function Harness({ level }: { level: number }) {
  const selectClass = useCharacterStore((s) => s.selectClass);
  const setLevel = useCharacterStore((s) => s.setLevel);
  const setClassFeatureChoice = useCharacterStore((s) => s.setClassFeatureChoice);
  const setLevelHpRoll = useCharacterStore((s) => s.setLevelHpRoll);
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => {
          selectClass("fighter-xphb");
          setLevel(level);
          setClassFeatureChoice("weapon-mastery", ["a", "b", "c"]);
          setLevelHpRoll(level, "average");
          setOpen(true);
        }}
      >
        setup
      </button>
      <LevelUpFlow open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

describe("LevelUpFlow", () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
  });

  it("gates Continuar until the subclass step is resolved", () => {
    render(<CharacterStoreProvider><Harness level={3} /></CharacterStoreProvider>);
    fireEvent.click(screen.getByRole("button", { name: "setup" }));

    // With Weapon Mastery pre-resolved, the only pending step is the subclass.
    expect(screen.getByRole("heading", { name: "Subclasse" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continuar|Concluir/ })).toBeDisabled();

    fireEvent.click(screen.getAllByRole("button", { name: /Selecionar/ })[0]);
    expect(screen.getByRole("button", { name: /Continuar|Concluir/ })).toBeEnabled();
  }, INTEGRATION_TEST_TIMEOUT_MS);

  it("re-snapshots pending choices on each reopen (not stale)", () => {
    function ReopenHarness() {
      const selectClass = useCharacterStore((s) => s.selectClass);
      const setLevel = useCharacterStore((s) => s.setLevel);
      const setClassFeatureChoice = useCharacterStore((s) => s.setClassFeatureChoice);
      const selectSubclass = useCharacterStore((s) => s.selectSubclass);
      const setLevelHpRoll = useCharacterStore((s) => s.setLevelHpRoll);
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button onClick={() => {
            selectClass("fighter-xphb");
            setLevel(3);
            setClassFeatureChoice("weapon-mastery", ["a", "b", "c"]);
            selectSubclass("battle-master-xphb"); // resolve level-3 subclass too
            setLevelHpRoll(3, "average");
            setOpen(true);
          }}>open-l3</button>
          <button onClick={() => { setLevel(4); setLevelHpRoll(4, "average"); setOpen(true); }}>raise-and-reopen</button>
          <button onClick={() => setOpen(false)}>close</button>
          <LevelUpFlow open={open} onClose={() => setOpen(false)} />
        </div>
      );
    }
    render(<CharacterStoreProvider><ReopenHarness /></CharacterStoreProvider>);

    // Open at level 3 with everything resolved → no pending steps.
    fireEvent.click(screen.getByRole("button", { name: "open-l3" }));
    expect(screen.getByText("Nenhuma escolha pendente.")).toBeInTheDocument();

    // Close, raise to level 4 (adds the ASI-or-feat choice), reopen.
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    fireEvent.click(screen.getByRole("button", { name: "raise-and-reopen" }));

    // The reopened flow must show the freshly-pending level-4 ASI/feat step.
    expect(screen.getByRole("heading", { name: "Aumento de Atributo ou Talento" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
  }, INTEGRATION_TEST_TIMEOUT_MS);

  it("inserts a HitPointsStep first when leveling up past level 1 without a recorded roll", () => {
    function HpHarness() {
      const selectClass = useCharacterStore((s) => s.selectClass);
      const setLevel = useCharacterStore((s) => s.setLevel);
      const setClassFeatureChoice = useCharacterStore((s) => s.setClassFeatureChoice);
      const selectSubclass = useCharacterStore((s) => s.selectSubclass);
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button onClick={() => {
            selectClass("fighter-xphb");
            setLevel(3);
            setClassFeatureChoice("weapon-mastery", ["a", "b", "c"]);
            selectSubclass("battle-master-xphb");
            setOpen(true);
          }}>open</button>
          <LevelUpFlow open={open} onClose={() => setOpen(false)} />
        </div>
      );
    }
    render(<CharacterStoreProvider><HpHarness /></CharacterStoreProvider>);
    fireEvent.click(screen.getByRole("button", { name: "open" }));

    // With subclass + weapon mastery already resolved, the only pending step is HP.
    expect(screen.getByRole("heading", { name: "Pontos de Vida" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continuar|Concluir/ })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /usar média/i }));

    // Choosing média records the roll, resolving the (only) HP step.
    expect(screen.getByRole("button", { name: /Continuar|Concluir/ })).toBeEnabled();
  }, INTEGRATION_TEST_TIMEOUT_MS);
});
