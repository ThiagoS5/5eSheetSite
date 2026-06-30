/**
 * @vitest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import { useCharacterBuilderState } from "@/src/store/useCharacterBuilderState";
import { CharacterStoreProvider } from "@/src/store/useCharacterStore";

describe("useCharacterBuilderState", () => {
  it("includes level-up choices required by the derived sheet", () => {
    const store = createCharacterStore();
    store.getState().selectClass("fighter-xphb");
    store.getState().setLevel(4);
    store.getState().selectSubclass("battle-master-xphb");
    store
      .getState()
      .setLevelAsiOrFeat(4, { mode: "asi", increases: { constituicao: 2 } });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <CharacterStoreProvider store={store}>{children}</CharacterStoreProvider>
    );

    const { result } = renderHook(() => useCharacterBuilderState(), { wrapper });

    expect(result.current.selectedSubclassId).toBe("battle-master-xphb");
    expect(result.current.asiOrFeatByLevel["4"]).toEqual({
      mode: "asi",
      increases: { constituicao: 2 },
    });
  });
});
