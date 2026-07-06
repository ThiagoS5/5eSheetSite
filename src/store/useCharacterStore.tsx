"use client";

import {
  createContext,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import { useStore } from "zustand";
import { createCharacterStore } from "@/src/store/createCharacterStore";
import type { CharacterBuilderStore } from "@/src/store/characterStore.types";

export type CharacterStoreApi = ReturnType<typeof createCharacterStore>;

const CharacterStoreContext = createContext<CharacterStoreApi | null>(null);

interface CharacterStoreProviderProps {
  store?: CharacterStoreApi;
}

export function CharacterStoreProvider({
  children,
  store: injectedStore,
}: PropsWithChildren<CharacterStoreProviderProps>) {
  const [store] = useState(() => injectedStore ?? createCharacterStore());

  return (
    <CharacterStoreContext.Provider value={store}>
      {children}
    </CharacterStoreContext.Provider>
  );
}

export function useCharacterStore<T>(
  selector: (state: CharacterBuilderStore) => T,
): T {
  const store = useContext(CharacterStoreContext);

  if (!store) {
    throw new Error(
      "useCharacterStore must be used within CharacterStoreProvider",
    );
  }

  return useStore(store, selector);
}
