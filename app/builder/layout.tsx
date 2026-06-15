import type { ReactNode } from "react";
import { CharacterStoreProvider } from "@/src/store/useCharacterStore";
import { BuilderShell } from "@/src/components/templates/BuilderShell";

interface BuilderLayoutProps {
  children: ReactNode;
}

export default function BuilderLayout({ children }: BuilderLayoutProps) {
  return (
    <CharacterStoreProvider>
      <BuilderShell>{children}</BuilderShell>
    </CharacterStoreProvider>
  );
}
