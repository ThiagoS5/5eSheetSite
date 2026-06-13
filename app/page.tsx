import { Dashboard } from "@/src/components/pages/Dashboard";
import { CharacterStoreProvider } from "@/store/useCharacterStore";

export default function Home() {
  return (
    <CharacterStoreProvider>
      <Dashboard />
    </CharacterStoreProvider>
  );
}
