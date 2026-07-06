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

  it("gates Continue until the subclass step is resolved", () => {
    render(<CharacterStoreProvider><Harness level={3} /></CharacterStoreProvider>);
    fireEvent.click(screen.getByRole("button", { name: "setup" }));


    expect(screen.getByRole("heading", { name: "Subclass" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue|Finish/ })).toBeDisabled();

    fireEvent.click(screen.getAllByRole("button", { name: /Select/ })[0]);
    expect(screen.getByRole("button", { name: /Continue|Finish/ })).toBeEnabled();
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
            selectSubclass("battle-master-xphb");
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


    fireEvent.click(screen.getByRole("button", { name: "open-l3" }));
    expect(screen.getByText("No pending choice.")).toBeInTheDocument();


    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "raise-and-reopen" }));


    expect(screen.getByRole("heading", { name: "Ability Score Improvement or Feat" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
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


    expect(screen.getByRole("heading", { name: "Hit Points" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue|Finish/ })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /use average/i }));


    expect(screen.getByRole("button", { name: /Continue|Finish/ })).toBeEnabled();
  }, INTEGRATION_TEST_TIMEOUT_MS);
});
