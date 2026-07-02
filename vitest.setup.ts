import { expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

// Matchers de acessibilidade (toHaveNoViolations) disponíveis em toda a suíte.
// Uso nos testes de UI (jsdom): `expect(await axe(container)).toHaveNoViolations()`.
expect.extend(axeMatchers);

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

if (!globalThis.localStorage) {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: createMemoryStorage(),
  });
}

if (!globalThis.sessionStorage) {
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: createMemoryStorage(),
  });
}

if (typeof window !== "undefined" && !window.localStorage) {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: globalThis.localStorage,
  });
}

if (typeof window !== "undefined" && !window.sessionStorage) {
  Object.defineProperty(window, "sessionStorage", {
    configurable: true,
    value: globalThis.sessionStorage,
  });
}
