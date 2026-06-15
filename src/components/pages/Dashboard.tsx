"use client";

import {
  Bell,
  BookOpen,
  Eye,
  Plus,
  Settings,
  Shield,
  UserCircle,
  WandSparkles,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import {
  CHARACTER_SAVES_CHANGED_EVENT,
  getCharacter,
  listCharactersSync,
  saveCharacter,
} from "@/src/services/characterService";
import { createEmptyCharacterBuild } from "@/src/store/characterBuildModel";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import type { Character } from "@/types/Character";

const builderStartHref = "/builder/classe";
const emptyCharactersSnapshot: readonly Character[] = [];
const logoUrl =
  "https://lh3.googleusercontent.com/aida/AP1WRLs6nBKMZFXZPQWc3Dz44sd79kupXgFWy3_yGtyD_0pCoeQxNVqB_QUwSfqIpLA1hl-IVPXhnNf5ilC7E2rHE77Byl-_k6fE1pWeVQ34b3ewaoU9cNIx7DA-qNPTeftY3LpW8BX4__-HMQIu3eMmr335p7fBUXDeifo1qzI8SfHC96x6ONDvLU926xzzi2pHr4IYop0-hizeYiiLJ-KpoI-7yuXhvXl1jakw-iUuIWMbzYR2Fc440hKXTyw";
const profileUrl =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCPKVEQ-mHIcoHy24XPfpu3mf4Bcm836Y_tQSZ2L6gRoKP8XVR71TdBH8n7r9wL3UUmGYAI5_xPOS5RjWTnzLCAYPm62RM1PW-Z0lhEhTs2oTkQEUkRgf85kFIrc4escY8aA0vL2ewW1hwkEczeVZkp-2Co4_x6r34rngTf4PrkfrOCCRR1N3Rov0PaKESs4opO2MFVFNddvZOh8M6J5p3H-CtJijvLR2voTvqx9tnSKzY5O-qNy8S4AqTVYOSC9c2F_bdwZHZx1S0-";

export function Dashboard() {
  const router = useRouter();
  const loadCharacterBuild = useCharacterStore((state) => state.loadCharacterBuild);
  const characters = useSyncExternalStore(
    subscribeToLocalCharacters,
    listCharactersSync,
    getServerCharactersSnapshot,
  );
  const hasCharacters = characters.length > 0;

  function goToBuilder() {
    const build = createEmptyCharacterBuild();

    loadCharacterBuild(build);
    void saveCharacter(build);
    router.push(builderStartHref);
  }

  function continueCharacter(character: Character) {
    void getCharacter(character.id).then((build) => {
      if (build) {
        loadCharacterBuild(build);
      }
    });
    router.push(character.currentStepHref ?? builderStartHref);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0b10] text-[#e8e9f0] selection:bg-[#e61c23] selection:text-white">
      <DashboardTopNav />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-32 md:px-8">
        {hasCharacters ? (
          <PopulatedState
            characters={characters}
            onCreate={goToBuilder}
            onContinue={continueCharacter}
          />
        ) : (
          <EmptyState onCreate={goToBuilder} />
        )}
      </main>
      <DashboardBottomNav />
    </div>
  );
}

function subscribeToLocalCharacters(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CHARACTER_SAVES_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CHARACTER_SAVES_CHANGED_EVENT, onStoreChange);
  };
}

function getServerCharactersSnapshot(): readonly Character[] {
  return emptyCharactersSnapshot;
}

function DashboardTopNav() {
  return (
    <header className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-white/[0.06] bg-[#0a0b10]/90 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <ForgeFateLogo className="h-10 w-10" />
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
          Forge & Fate
        </h1>
      </div>

      <nav aria-label="Navegacao principal" className="hidden items-center gap-6 md:flex">
        {["Grimoire", "Vault", "Tavern", "Codex"].map((item, index) => (
          <button
            key={item}
            type="button"
            className={`font-serif text-2xl font-semibold transition-colors ${
              index === 0
                ? "border-b-2 border-[#e61c23] pb-1 text-white"
                : "text-[#b0b5cc] hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <IconButton label="Notificacoes" icon={<Bell className="h-5 w-5" />} />
        <IconButton label="Configuracoes" icon={<Settings className="h-5 w-5" />} />
        <button
          type="button"
          aria-label="Perfil"
          className="h-10 w-10 overflow-hidden rounded-full border border-white/[0.1] outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-[#e61c23]"
        >
          <Image
            unoptimized
            src={profileUrl}
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        </button>
      </div>
    </header>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <section
      id="empty-state"
      aria-labelledby="empty-state-title"
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <div className="relative mx-auto mb-8 w-full max-w-2xl">
        <div className="absolute inset-0 rounded-full bg-[#e61c23]/10 blur-[100px]" />
        <ForgeFateLogo
          decorative
          className="relative mx-auto h-64 w-64 animate-pulse opacity-40 mix-blend-screen"
        />
      </div>
      <h2 id="empty-state-title" className="mb-4 font-serif text-5xl font-bold text-white">
        Forje Sua Alma
      </h2>
      <p className="mx-auto mb-8 max-w-lg font-sans text-lg leading-7 text-[#b0b5cc]">
        O multiverso aguarda seu comando. Comece sua lenda criando seu primeiro personagem hoje.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="crimson-glow mx-auto flex items-center gap-3 rounded-lg bg-[#e61c23] px-8 py-4 font-sans font-bold text-white outline-none transition-all hover:bg-[#a91515] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#e61c23]"
      >
        <Plus className="h-5 w-5" />
        CRIAR NOVO PERSONAGEM
      </button>
    </section>
  );
}

function PopulatedState({
  characters,
  onCreate,
  onContinue,
}: {
  characters: readonly Character[];
  onCreate: () => void;
  onContinue: (character: Character) => void;
}) {
  return (
    <section id="populated-state" aria-labelledby="dashboard-title">
      <header className="mb-8">
        <h2 id="dashboard-title" className="mb-2 font-serif text-4xl font-semibold text-white">
          Bem-vindo, Arquiteto
        </h2>
        <p className="font-sans text-lg leading-7 text-[#b0b5cc]">Sua jornada continua.</p>
      </header>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="border-l-4 border-[#e61c23] pl-4 font-serif text-2xl font-semibold text-white">
          Seus Personagens
        </h3>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 font-sans font-bold text-white outline-none transition-colors hover:text-[#e61c23] md:hidden"
        >
          <Plus className="h-4 w-4" />
          Novo
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={onCreate}
          className="glass-card group flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.1] outline-none transition-colors hover:border-[#e61c23] focus-visible:ring-2 focus-visible:ring-[#e61c23]"
        >
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1c1e2a] transition-colors group-hover:bg-[#e61c23]/15">
            <Plus className="h-10 w-10 text-[#b0b5cc] transition-colors group-hover:text-white" />
          </span>
          <span className="font-serif text-2xl font-semibold text-[#b0b5cc] transition-colors group-hover:text-white">
            Novo Heroi
          </span>
        </button>

        {characters.map((character) => (
          <DashboardCharacterCard
            key={character.id}
            character={character}
            onContinue={() => onContinue(character)}
          />
        ))}
      </div>
    </section>
  );
}

function DashboardCharacterCard({
  character,
  onContinue,
}: {
  character: Character;
  onContinue: () => void;
}) {
  return (
    <article className="glass-card parchment-grain flex min-h-[280px] flex-col justify-between rounded-xl p-6">
      <div>
        <div className="mb-4 flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-white/[0.08] bg-[#1c1e2a]">
            {character.portraitUrl ? (
              <Image
                unoptimized
                src={character.portraitUrl}
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserCircle className="h-9 w-9 text-[#b0b5cc]" />
            )}
          </div>
          <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 font-mono text-xs font-bold uppercase tracking-[0.1em] text-white">
            Level {character.level ?? 1}
          </span>
        </div>
        <h4 className="mb-2 font-serif text-2xl font-semibold text-white">
          {character.nome}
        </h4>
        <p className="font-sans text-base text-[#b0b5cc]">
          {character.species} / {character.classe}
        </p>
      </div>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 rounded-lg bg-[#e61c23] py-2 font-mono text-xs font-bold uppercase tracking-[0.1em] text-white outline-none transition-all hover:bg-[#a91515] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#e61c23]"
        >
          Continuar
        </button>
        <button
          type="button"
          aria-label={`Ver ${character.nome}`}
          className="rounded-lg border border-white/[0.08] px-3 py-2 text-[#b0b5cc] outline-none transition-all hover:border-[#e61c23]/60 hover:bg-white/[0.04] hover:text-white active:scale-95 focus-visible:ring-2 focus-visible:ring-[#e61c23]"
        >
          <Eye className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

function DashboardBottomNav() {
  return (
    <nav
      aria-label="Navegacao mobile"
      className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl border-t border-white/[0.06] bg-[#14151b]/95 px-4 py-2 shadow-2xl backdrop-blur-lg lg:hidden"
    >
      <MobileNavItem active icon={<WandSparkles className="h-5 w-5" />} label="Forge" />
      <MobileNavItem icon={<BookOpen className="h-5 w-5" />} label="Spells" />
      <MobileNavItem icon={<Shield className="h-5 w-5" />} label="Vault" />
      <MobileNavItem icon={<UserCircle className="h-5 w-5" />} label="Profile" />
    </nav>
  );
}

function MobileNavItem({
  active = false,
  icon,
  label,
}: {
  active?: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`flex flex-col items-center justify-center rounded-xl p-2 font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
        active
          ? "bg-[#e61c23]/15 text-white ring-2 ring-[#e61c23]/25"
          : "text-[#b0b5cc] hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function IconButton({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="text-[#b0b5cc] outline-none transition-colors hover:text-white active:scale-95 focus-visible:ring-2 focus-visible:ring-[#e61c23]"
    >
      {icon}
    </button>
  );
}

function ForgeFateLogo({
  className,
  decorative = false,
}: {
  className: string;
  decorative?: boolean;
}) {
  const [hasImageError, setHasImageError] = useState(false);

  if (hasImageError) {
    return (
      <span
        aria-hidden={decorative}
        aria-label={decorative ? undefined : "Forge & Fate"}
        className={`${className} flex items-center justify-center rounded-full border border-white/[0.08] bg-[#14151b] text-[#e61c23]`}
      >
        <WandSparkles className="h-1/2 w-1/2" />
      </span>
    );
  }

  return (
    <Image
      unoptimized
      src={logoUrl}
      alt={decorative ? "" : "Forge & Fate"}
      width={256}
      height={256}
      loading="lazy"
      fetchPriority="low"
      className={`${className} object-contain`}
      onError={() => setHasImageError(true)}
    />
  );
}
