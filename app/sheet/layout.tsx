import type { ReactNode } from "react";
import { CharacterStoreProvider } from "@/src/store/useCharacterStore";

export default function SheetLayout({ children }: { children: ReactNode }) {
  return (
    <CharacterStoreProvider>
      <div className="min-h-screen bg-surface-nested">{children}</div>
    </CharacterStoreProvider>
  );
}
