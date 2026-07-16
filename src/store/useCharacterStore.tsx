"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useStore } from "zustand";
import {
  createCharacterStore,
  disposeCharacterStore,
} from "@/src/store/createCharacterStore";
import type { CharacterBuilderStore } from "@/src/store/characterStore.types";

export type CharacterStoreApi = ReturnType<typeof createCharacterStore>;

const CharacterStoreContext = createContext<CharacterStoreApi | null>(null);

type PersistHydrationApi = {
  persist?: {
    hasHydrated: () => boolean;
    onFinishHydration: (listener: () => void) => () => void;
  };
};

interface CharacterStoreProviderProps {
  store?: CharacterStoreApi;
}

export function CharacterStoreProvider({
  children,
  store: injectedStore,
}: PropsWithChildren<CharacterStoreProviderProps>) {
  // `owns` distingue o store criado aqui (que devemos liberar) de um injetado
  // por testes/consumidores externos (que não é nosso para descartar).
  const [{ store, owns }] = useState(() =>
    injectedStore
      ? { store: injectedStore, owns: false }
      : { store: createCharacterStore(), owns: true },
  );

  useEffect(() => {
    if (!owns) return;
    // Ao desmontar (ex.: trocar de grupo de rota), libera a subscription e o
    // listener de `pagehide` do autosave para não vazar o store.
    return () => disposeCharacterStore(store);
  }, [store, owns]);

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

export function useCharacterStoreHydrated(): boolean {
  const store = useContext(CharacterStoreContext);

  if (!store) {
    throw new Error(
      "useCharacterStoreHydrated must be used within CharacterStoreProvider",
    );
  }

  const persistApi = (store as PersistHydrationApi).persist;
  const [hydrated, setHydrated] = useState(() =>
    persistApi?.hasHydrated() ?? true,
  );

  useEffect(() => {
    const currentPersistApi = (store as PersistHydrationApi).persist;

    if (!currentPersistApi) {
      return undefined;
    }

    if (currentPersistApi.hasHydrated()) {
      return undefined;
    }

    return currentPersistApi.onFinishHydration(() => setHydrated(true));
  }, [store]);

  return hydrated;
}
