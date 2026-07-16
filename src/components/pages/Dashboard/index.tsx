"use client";

import {
  Copy,
  FileDown,
  Eye,
  Plus,
  Search,
  Shield,
  Star,
  Trash2,
  UserCircle,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { ImportCharacterButton } from "@/src/components/molecules/ImportCharacterButton";
import {
  CHARACTER_SAVES_CHANGED_EVENT,
  deleteCharacter,
  duplicateCharacter,
  getCharacter,
  listCharactersSync,
  saveCharacter,
} from "@/src/services/characterService";
import {
  createCharacterBuildFromLegacyState,
  createEmptyCharacterBuild,
} from "@/src/store/characterBuildModel";
import { readGlobalPreferences, writeGlobalPreferences } from "@/src/services/preferencesService";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderLanguages,
  getBuilderSpecies,
} from "@/src/services/ruleService";
import { quickBuildProfiles, type QuickBuildProfile } from "@/src/data/quickBuildProfiles";
import { useCharacterStore } from "@/src/store/useCharacterStore";
import { serializeCharacterExport } from "@/src/utils/canonicalExport";
import type { CharacterBuild } from "@/src/types/characterBuild";
import type { BuilderBackground } from "@/src/types/builder";
import type { AttributeBonuses, AttributeKey } from "@/src/types/dnd";
import type { Character } from "@/src/types/Character";

const builderStartHref = "/builder/classe";
const sheetHref = "/sheet";
const emptyCharactersSnapshot: readonly Character[] = [];
const missingCharacterName = "Unnamed Character";
const missingSpeciesLabel = "Species pending";
const missingClassLabel = "Class pending";
const missingBackgroundLabel = "Background pending";
const builderStepOrder = [
  "classe",
  "recursos-classe",
  "subclasse",
  "antecedente",
  "especie",
  "detalhes-especie",
  "atributos",
  "equipamento",
  "descricao",
  "conclusao",
] as const;

const primaryNavigation = [
  { label: "Vault", href: "/", active: true },
  { label: "Create", href: builderStartHref, active: false },
  { label: "Sheet", href: sheetHref, active: false },
] as const;

const mobileNavigation = [
  { label: "Vault", href: "/", active: true, icon: Shield },
  { label: "Create", href: builderStartHref, active: false, icon: WandSparkles },
  { label: "Sheet", href: sheetHref, active: false, icon: Eye },
] as const;

export function Dashboard() {
  const router = useRouter();
  const loadCharacterBuild = useCharacterStore((state) => state.loadCharacterBuild);
  const [creationModeOpen, setCreationModeOpen] = useState(false);
  const [favoriteCharacterIds, setFavoriteCharacterIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const characters = useSyncExternalStore(
    subscribeToLocalCharacters,
    listCharactersSync,
    getServerCharactersSnapshot,
  );
  const hasCharacters = characters.length > 0;

  function goToBuilder() {
    const globalPrefs = readGlobalPreferences();

    if (typeof globalPrefs.beginnerMode === "boolean") {
      startNewCharacter(globalPrefs.beginnerMode);
      return;
    }

    setCreationModeOpen(true);
  }

  function startNewCharacter(beginnerMode: boolean) {
    const build = createBuildWithBeginnerMode(beginnerMode);

    loadCharacterBuild(build);
    void saveCharacter(build);
    writeGlobalPreferences({
      ...readGlobalPreferences(),
      beginnerMode,
    });
    router.push(builderStartHref);
  }

  function startQuickBuild(profile: QuickBuildProfile) {
    const build = createQuickBuild(profile);

    loadCharacterBuild(build);
    void saveCharacter(build);
    writeGlobalPreferences({
      ...readGlobalPreferences(),
      beginnerMode: false,
    });
    router.push("/builder/descricao");
  }

  function continueCharacter(character: Character) {
    void getCharacter(character.id).then((build) => {
      if (build) {
        loadCharacterBuild(build);
      }
    });
    router.push(character.currentStepHref ?? builderStartHref);
  }

  function viewCharacter(character: Character) {
    void getCharacter(character.id).then((build) => {
      if (build) {
        loadCharacterBuild(build);
        router.push(sheetHref);
      }
    });
  }

  function exportCharacter(character: Character) {
    void getCharacter(character.id).then((build) => {
      if (!build) {
        return;
      }

      const characterName = getCharacterName(character);

      downloadJson(
        `${sanitizeFileName(characterName)}-forge-fate.json`,
        serializeCharacterExport(build),
      );
    });
  }

  function toggleFavorite(character: Character) {
    setFavoriteCharacterIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (nextIds.has(character.id)) {
        nextIds.delete(character.id);
      } else {
        nextIds.add(character.id);
      }

      return nextIds;
    });
  }

  function duplicateSavedCharacter(character: Character) {
    void duplicateCharacter(character.id);
  }

  function deleteSavedCharacter(character: Character) {
    const characterName = getCharacterName(character);

    if (!window.confirm(`Delete ${characterName} from the Vault?`)) {
      return;
    }

    setFavoriteCharacterIds((currentIds) => {
      const nextIds = new Set(currentIds);

      nextIds.delete(character.id);

      return nextIds;
    });
    void deleteCharacter(character.id);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-primary selection:text-foreground">
      <DashboardTopNav />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-32 md:px-8">
        {hasCharacters ? (
          <PopulatedState
            characters={characters}
            favoriteCharacterIds={favoriteCharacterIds}
            onCreate={goToBuilder}
            onContinue={continueCharacter}
            onDelete={deleteSavedCharacter}
            onDuplicate={duplicateSavedCharacter}
            onExport={exportCharacter}
            onFavorite={toggleFavorite}
            onView={viewCharacter}
          />
        ) : (
          <EmptyState onCreate={goToBuilder} />
        )}
      </main>
      <CreationModeDialog
        open={creationModeOpen}
        onClose={() => setCreationModeOpen(false)}
        onGuided={() => {
          setCreationModeOpen(false);
          startNewCharacter(true);
        }}
        onStandard={() => {
          setCreationModeOpen(false);
          startNewCharacter(false);
        }}
        onQuickBuild={(profile) => {
          setCreationModeOpen(false);
          startQuickBuild(profile);
        }}
      />
      <DashboardBottomNav />
    </div>
  );
}

function createBuildWithBeginnerMode(beginnerMode: boolean): CharacterBuild {
  const build = createEmptyCharacterBuild();

  return createCharacterBuildFromLegacyState(
    {
      ...build.choices,
      characterBuild: build,
      beginnerMode,
    },
    {
      createdAt: build.exportMetadata.createdAt,
      currentStepSlug: "classe",
      saveId: build.exportMetadata.saveId,
      updatedAt: build.exportMetadata.updatedAt,
    },
  );
}

function createQuickBuild(profile: QuickBuildProfile): CharacterBuild {
  const build = createEmptyCharacterBuild();
  const classes = getBuilderClasses();
  const selectedClass = classes.find((entry) => entry.id === profile.classId) ?? classes[0];
  const species = getBuilderSpecies();
  const selectedSpecies =
    species.find((entry) => entry.id === "human-xphb") ?? species[0];
  const backgrounds = getBuilderBackgrounds();
  const selectedBackground =
    backgrounds.find((entry) => entry.id === "guard-xphb") ?? backgrounds[0];
  const requiredLanguageCount =
    2 +
    (selectedClass?.languageChoiceCount ?? 0) +
    (selectedBackground?.languageChoiceCount ?? 0);
  const speciesLanguages = getBuilderLanguages()
    .slice(0, requiredLanguageCount)
    .map((language) => language.name);

  return createCharacterBuildFromLegacyState(
    {
      characterBuild: build,
      beginnerMode: false,
      selectedClassId: selectedClass?.id ?? profile.classId,
      selectedSpeciesId: selectedSpecies?.id ?? "",
      selectedBackgroundId: selectedBackground?.id ?? "",
      maxUnlockedStepIndex: 7,
      classSkillProficiencies: profile.skillProficiencies.slice(
        0,
        selectedClass?.skillChoices.count ?? profile.skillProficiencies.length,
      ),
      skillTraining: Object.fromEntries(
        profile.skillProficiencies.map((skill) => [skill, "proficient"]),
      ),
      classFeatureChoices: Object.fromEntries(
        selectedClass?.featureChoiceGroups.map((group) => [
          group.id,
          group.options.slice(0, group.count).map((option) => option.value),
        ]) ?? [],
      ),
      speciesLanguages,
      attributeGenerationMethod: "standard-array",
      baseAttributes: profile.baseAttributes,
      backgroundAbilityBonuses: getDefaultBackgroundBonuses(selectedBackground),
      equipmentChoicesBySource: selectedClass?.startingEquipmentPackages[0]
        ? {
            class: {
              mode: "items",
              selectedOptionId: selectedClass.startingEquipmentPackages[0].id,
            },
          }
        : {},
    },
    {
      createdAt: build.exportMetadata.createdAt,
      currentStepSlug: "descricao",
      saveId: build.exportMetadata.saveId,
      updatedAt: build.exportMetadata.updatedAt,
    },
  );
}

function getDefaultBackgroundBonuses(
  background: BuilderBackground | undefined,
): AttributeBonuses {
  const option = background?.abilityOptions[0];

  if (!option) {
    return {};
  }

  if (option.mode === "+2/+1") {
    const [major, minor] = option.attributes;
    return {
      ...(major ? { [major]: 2 } : {}),
      ...(minor ? { [minor]: 1 } : {}),
    } as AttributeBonuses;
  }

  return option.attributes.reduce<AttributeBonuses>(
    (bonuses, attribute) => ({ ...bonuses, [attribute as AttributeKey]: 1 }),
    {},
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

function CreationModeDialog({
  open,
  onClose,
  onGuided,
  onStandard,
  onQuickBuild,
}: {
  open: boolean;
  onClose: () => void;
  onGuided: () => void;
  onStandard: () => void;
  onQuickBuild: (profile: QuickBuildProfile) => void;
}) {
  const classes = getBuilderClasses();
  const profiles = quickBuildProfiles.filter((profile) =>
    classes.some((entry) => entry.id === profile.classId),
  );

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md">
          <Dialog.Content className="relative max-h-[90dvh] w-full max-w-3xl overflow-y-auto rounded-lg border border-white/[0.08] bg-surface-nested p-5 text-foreground shadow-2xl shadow-black/60 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70">
            <Dialog.Title className="pr-10 font-serif text-2xl font-bold text-foreground">
              Is this your first time playing Dungeons & Dragons 5e?
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm leading-6 text-subdued">
              Choose how you want to start this character. You can change guided mode later in the builder.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close"
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </Dialog.Close>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <CreationModeButton
                title="Guided mode"
                description="Explain choices with contextual help during character creation."
                onClick={onGuided}
              />
              <CreationModeButton
                title="Standard mode"
                description="I already know the rules and want to proceed without extra explanations."
                onClick={onStandard}
              />
              <section className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Quick Build
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Choose a class to apply a recommended kit and go straight
                  to naming the hero.
                </p>
                <div className="mt-4 grid max-h-56 gap-2 overflow-y-auto pr-1">
                  {profiles.map((profile) => (
                    <button
                      key={profile.classId}
                      type="button"
                      onClick={() => onQuickBuild(profile)}
                      className="rounded-md border border-white/[0.08] px-3 py-2 text-left text-sm font-semibold text-foreground outline-none transition hover:border-primary/60 hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
                    >
                      {profile.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CreationModeButton({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={title}
      onClick={onClick}
      className="rounded-lg border border-white/[0.08] bg-card p-4 text-left outline-none transition hover:border-primary/60 hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
    >
      <span className="font-serif text-lg font-bold text-foreground">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-muted-foreground">
        {description}
      </span>
    </button>
  );
}

function DashboardTopNav() {
  return (
    <header className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-white/[0.06] bg-background/90 px-6 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <ForgeFateLogo className="h-10 w-10" />
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
          Forge & Fate
        </h1>
      </div>

      <nav aria-label="Primary navigation" className="hidden items-center gap-6 md:flex">
        {primaryNavigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={`font-serif text-2xl font-semibold transition-colors ${
              item.active
                ? "border-b-2 border-primary pb-1 text-foreground"
                : "text-subdued hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Profile"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-surface-base text-subdued outline-none transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-primary"
        >
          <UserCircle aria-hidden="true" className="h-6 w-6" />
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
      className="grid min-h-[60vh] place-items-center"
    >
      <Card
        size="default"
        className="w-full max-w-4xl border-border/70 bg-surface-base py-8"
      >
        <CardContent className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div className="flex justify-center">
            <ForgeFateLogo
              decorative
              className="h-44 w-44 opacity-70 sm:h-56 sm:w-56"
            />
          </div>
          <div className="text-left">
            <p className="mb-3 text-sm font-semibold text-subdued">
              Character Vault
            </p>
            <h2 id="empty-state-title" className="font-serif text-4xl font-bold text-foreground sm:text-5xl">
              Create your first character
            </h2>
            <p className="mt-4 max-w-xl font-sans text-base leading-7 text-subdued">
              The Vault stores drafts, living sheets, and characters ready for
              export. Start with guided creation and return here to track
              progress.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-subdued sm:grid-cols-3">
              <VaultBenefit label="Safe drafts" value="Continue where you left off" />
              <VaultBenefit label="Living sheet" value="HP, AC, and level on the card" />
              <VaultBenefit label="Table output" value="Export status" />
            </div>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-start">
              <ImportCharacterButton />
              <Button
                type="button"
                onClick={onCreate}
                size="lg"
                className="h-auto gap-3 px-6 py-3 font-sans font-bold hover:bg-destructive active:scale-95"
              >
                <Plus className="h-5 w-5" />
                Create Character
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function VaultBenefit({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface-nested px-3 py-3">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="mt-1 leading-5">{value}</p>
    </div>
  );
}

function PopulatedState({
  characters,
  favoriteCharacterIds,
  onCreate,
  onContinue,
  onDelete,
  onDuplicate,
  onExport,
  onFavorite,
  onView,
}: {
  characters: readonly Character[];
  favoriteCharacterIds: ReadonlySet<string>;
  onCreate: () => void;
  onContinue: (character: Character) => void;
  onDelete: (character: Character) => void;
  onDuplicate: (character: Character) => void;
  onExport: (character: Character) => void;
  onFavorite: (character: Character) => void;
  onView: (character: Character) => void;
}) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("en-US");
  const filteredCharacters = characters.filter((character) =>
    getSearchText(character).includes(normalizedQuery),
  );
  const visibleCharacters = [...filteredCharacters].sort((first, second) => {
    const firstFavorite = favoriteCharacterIds.has(first.id);
    const secondFavorite = favoriteCharacterIds.has(second.id);

    if (firstFavorite === secondFavorite) {
      return 0;
    }

    return firstFavorite ? -1 : 1;
  });
  const draftCount = characters.filter((character) => !isExportReady(character)).length;
  const exportReadyCount = characters.length - draftCount;
  const resultLabel =
    visibleCharacters.length === 1
      ? "1 character found"
      : `${visibleCharacters.length} characters found`;

  return (
    <section id="populated-state" aria-labelledby="dashboard-title">
      <header className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-subdued">Character Vault</p>
          <h2 id="dashboard-title" className="font-serif text-4xl font-semibold text-foreground">
            Character Vault
          </h2>
          <p className="mt-2 max-w-2xl font-sans text-base leading-7 text-subdued">
            Continue drafts, organize saved sheets, and prepare characters for the table.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-start">
          <ImportCharacterButton />
          <Button
            type="button"
            onClick={onCreate}
            className="h-auto w-full gap-2 px-5 py-3 font-sans font-bold active:scale-95 sm:w-auto"
          >
            <Plus className="h-5 w-5" />
            Create Character
          </Button>
        </div>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <VaultMetric label="No Vault" value={String(characters.length)} />
        <VaultMetric label="In progress" value={String(draftCount)} />
        <VaultMetric label="Ready to export" value={String(exportReadyCount)} />
      </div>

      <div className="mb-5 rounded-lg border border-border/70 bg-surface-base p-3">
        <label htmlFor="vault-search" className="sr-only">
          Search character
        </label>
        <div className="flex items-center gap-3 rounded-md border border-border/70 bg-surface-nested px-3 py-2 focus-within:ring-2 focus-within:ring-brand-gold-alt/70">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-subdued" />
          <input
            id="vault-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, class, species, background, or status"
            aria-describedby="vault-results"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p id="vault-results" aria-live="polite" className="mt-2 text-sm text-subdued">
          {resultLabel}
        </p>
      </div>

      {visibleCharacters.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AddCharacterCard onCreate={onCreate} />
          {visibleCharacters.map((character) => (
            <DashboardCharacterCard
              key={character.id}
              character={character}
              isFavorite={favoriteCharacterIds.has(character.id)}
              onContinue={() => onContinue(character)}
              onDelete={() => onDelete(character)}
              onDuplicate={() => onDuplicate(character)}
              onExport={() => onExport(character)}
              onFavorite={() => onFavorite(character)}
              onView={() => onView(character)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border/70 bg-surface-base p-6 text-sm text-subdued">
          No character matches the current search.
        </div>
      )}
    </section>
  );
}

function VaultMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-surface-base px-4 py-3">
      <p className="text-sm text-subdued">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function AddCharacterCard({ onCreate }: { onCreate: () => void }) {
  return (
    <button
      type="button"
      onClick={onCreate}
      className="group flex min-h-[320px] flex-col justify-between rounded-lg border border-dashed border-border bg-surface-base p-5 text-left outline-none transition-colors hover:border-primary/70 hover:bg-surface-elevated focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-border/70 bg-surface-nested text-subdued transition-colors group-hover:text-foreground">
        <Plus className="h-6 w-6" />
      </span>
      <span>
        <span className="block font-serif text-2xl font-semibold text-foreground">
          Create Character
        </span>
        <span className="mt-2 block text-sm leading-6 text-subdued">
          Start a guided sheet, a standard sheet, or a quick build.
        </span>
      </span>
    </button>
  );
}

function DashboardCharacterCard({
  character,
  isFavorite,
  onContinue,
  onDelete,
  onDuplicate,
  onExport,
  onFavorite,
  onView,
}: {
  character: Character;
  isFavorite: boolean;
  onContinue: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onFavorite: () => void;
  onView: () => void;
}) {
  const characterName = getCharacterName(character);
  const characterLine = getCharacterLine(character);
  const currentStepLabel = getCurrentStepLabel(character.currentStepHref);
  const status = getCharacterStatus(character);
  const readyToExport = isExportReady(character);
  const completionLabel = getCompletionLabel(character);

  return (
    <article
      aria-labelledby={`${character.id}-title`}
      className="flex min-h-[320px] flex-col justify-between rounded-lg border border-border/70 bg-surface-base p-5"
    >
      <div>
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-surface-nested">
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
              <UserCircle className="h-9 w-9 text-subdued" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h4
                id={`${character.id}-title`}
                translate="no"
                className="notranslate min-w-0 truncate font-serif text-2xl font-semibold text-foreground"
              >
                {characterName}
              </h4>
              <button
                type="button"
                onClick={onFavorite}
                aria-pressed={isFavorite}
                aria-label={
                  isFavorite
                    ? `Remove ${characterName} from favorites`
                    : `Favorite ${characterName}`
                }
                className="rounded-md p-1 text-subdued outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
              >
                <Star
                  aria-hidden="true"
                  className={`h-5 w-5 ${isFavorite ? "fill-accent text-accent" : ""}`}
                />
              </button>
            </div>
            <p translate="no" className="notranslate mt-1 line-clamp-2 text-sm leading-5 text-subdued">
              {characterLine}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <StatusBadge label={status} />
          <StatusBadge label={readyToExport ? "Export ready" : "Export pending"} />
        </div>

        <dl className="grid grid-cols-3 gap-2">
          <CharacterMetric label="Level" value={String(character.level ?? 1)} />
          <CharacterMetric label="HP" value={formatNullableNumber(character.hitPoints)} />
          <CharacterMetric label="AC" value={formatNullableNumber(character.armorClass)} />
        </dl>

        <div className="mt-4 rounded-lg border border-border/60 bg-surface-nested px-3 py-3 text-sm leading-6 text-subdued">
          <p>
            <span className="font-semibold text-foreground">Current step:</span>{" "}
            {currentStepLabel}
          </p>
          <p>
            <span className="font-semibold text-foreground">Completion:</span>{" "}
            {completionLabel}
          </p>
          <p>
            <span className="font-semibold text-foreground">Last edit:</span>{" "}
            {formatLastUpdated(character.updatedAt)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-2">
        <button
          type="button"
          onClick={readyToExport ? onView : onContinue}
          className="rounded-lg bg-primary px-3 py-2 font-sans text-sm font-bold text-foreground outline-none transition-colors hover:bg-destructive active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70"
        >
          {readyToExport ? "Open Sheet" : "Continue Creation"}
        </button>
        <div className="grid grid-cols-4 gap-2">
          <QuickActionButton
            label={`Export Forge & Fate JSON for ${characterName}`}
            disabled={!readyToExport}
            onClick={onExport}
            title={readyToExport ? "Export Forge & Fate JSON" : "Complete creation to export"}
          >
            <FileDown className="h-4 w-4" />
          </QuickActionButton>
          <QuickActionButton label={`Duplicate ${characterName}`} onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </QuickActionButton>
          <QuickActionButton label={`View ${characterName} sheet`} onClick={onView}>
            <Eye className="h-4 w-4" />
          </QuickActionButton>
          <QuickActionButton
            label={`Delete ${characterName}`}
            onClick={onDelete}
            variant="danger"
          >
            <Trash2 className="h-4 w-4" />
          </QuickActionButton>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border/70 bg-surface-nested px-3 py-1 text-xs font-semibold text-foreground">
      {label}
    </span>
  );
}

function CharacterMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-surface-nested px-3 py-2">
      <dt className="text-xs font-semibold text-subdued">{label}</dt>
      <dd className="mt-1 text-lg font-bold text-foreground">{value}</dd>
    </div>
  );
}

function QuickActionButton({
  children,
  disabled = false,
  label,
  onClick,
  title,
  variant = "default",
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  title?: string;
  variant?: "default" | "danger";
}) {
  const variantClass =
    variant === "danger"
      ? "hover:border-destructive/70 hover:text-foreground"
      : "hover:border-primary/60 hover:text-foreground";

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      title={title ?? label}
      className={`flex h-10 items-center justify-center rounded-lg border border-border/70 bg-surface-nested text-subdued outline-none transition-colors active:scale-95 focus-visible:ring-2 focus-visible:ring-brand-gold-alt/70 disabled:cursor-not-allowed disabled:opacity-45 ${variantClass}`}
    >
      {children}
    </button>
  );
}

function DashboardBottomNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-xl border-t border-white/[0.06] bg-surface-base/95 px-4 py-2 shadow-2xl backdrop-blur-lg lg:hidden"
    >
      {mobileNavigation.map((item) => (
        <MobileNavItem key={item.label} {...item} />
      ))}
    </nav>
  );
}

function MobileNavItem({
  active = false,
  href,
  icon: Icon,
  label,
}: {
  active?: boolean;
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  const className = `flex flex-col items-center justify-center rounded-xl p-2 font-mono text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
    active
      ? "bg-primary/15 text-foreground ring-2 ring-primary/25"
      : "text-subdued hover:text-foreground"
  }`;

  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={className}>
      <Icon aria-hidden="true" className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );
}

function isCharacterDraft(character: Character): boolean {
  return (
    !character.nome ||
    character.nome === missingCharacterName ||
    !character.classe ||
    isMissingClass(character.classe) ||
    !character.species ||
    isMissingSpecies(character.species)
  );
}

function isMissingClass(value: string): boolean {
  return value === missingClassLabel || value === "Classe nao definida" || value === "Class not set";
}

function isMissingSpecies(value: string): boolean {
  return value === missingSpeciesLabel || value === "Especie nao definida" || value === "Species not set";
}

function getCharacterName(character: Character): string {
  return character.nome && character.nome !== missingCharacterName
    ? character.nome
    : "Unnamed Draft";
}

function getCharacterLine(character: Character): string {
  const characterClass = character.classe && !isMissingClass(character.classe)
    ? character.classe
    : missingClassLabel;
  const species = character.species && !isMissingSpecies(character.species)
    ? character.species
    : missingSpeciesLabel;
  const background = character.background || missingBackgroundLabel;

  return `${characterClass} / ${species} / ${background}`;
}

function getSearchText(character: Character): string {
  return [
    getCharacterName(character),
    getCharacterLine(character),
    getCurrentStepLabel(character.currentStepHref),
    getCharacterStatus(character),
    isExportReady(character) ? "export ready ready export" : "export pending",
  ]
    .join(" ")
    .toLocaleLowerCase("en-US");
}

function getCharacterStatus(character: Character): string {
  if (isExportReady(character)) {
    return "Ready to export";
  }

  if (hasBlockingIssue(character)) {
    return "Incomplete";
  }

  return "In progress";
}

function isExportReady(character: Character): boolean {
  return getCurrentStepSlug(character.currentStepHref) === "conclusao" &&
    !isCharacterDraft(character) &&
    !hasBlockingIssue(character);
}

function hasBlockingIssue(character: Character): boolean {
  return (
    (character.validationMessages?.length ?? 0) > 0 ||
    character.pendencies?.some((pendency) => pendency.severity === "blocking") === true
  );
}

function getCompletionLabel(character: Character): string {
  if (isExportReady(character)) {
    return "Sheet complete";
  }

  const currentStep = getCurrentStepSlug(character.currentStepHref);
  const currentIndex = builderStepOrder.findIndex((step) => step === currentStep);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const completion = Math.round(((safeIndex + 1) / builderStepOrder.length) * 100);

  return `${completion}% complete`;
}

function sanitizeFileName(value: string): string {
  return (
    value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "character"
  );
}

function downloadJson(fileName: string, json: string): void {
  const blob = new Blob([json], { type: "application/json" });
  downloadBlob(blob, fileName);
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatNullableNumber(value: number | undefined): string {
  return Number.isFinite(value) ? String(value) : "—";
}

function formatLastUpdated(updatedAt: string | undefined): string {
  if (!updatedAt) {
    return "No record";
  }

  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return "No record";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getCurrentStepLabel(currentStepHref: string | undefined): string {
  const step = getCurrentStepSlug(currentStepHref);

  if (!step) {
    return "Class";
  }

  switch (step) {
    case "recursos-classe":
      return "Class Features";
    case "subclasse":
      return "Subclass";
    case "antecedente":
      return "Background";
    case "especie":
      return "Species";
    case "detalhes-especie":
      return "Species Details";
    case "atributos":
      return "Ability Scores";
    case "equipamento":
      return "Equipment";
    case "descricao":
      return "Description";
    case "conclusao":
      return "Summary";
    default:
      return "Class";
  }
}

function getCurrentStepSlug(
  currentStepHref: string | undefined,
): (typeof builderStepOrder)[number] | undefined {
  if (!currentStepHref) {
    return undefined;
  }

  const step = currentStepHref.split("/").filter(Boolean).at(-1);

  return builderStepOrder.find((entry) => entry === step);
}

function ForgeFateLogo({
  className,
  decorative = false,
}: {
  className: string;
  decorative?: boolean;
}) {
  return (
    <span
      aria-hidden={decorative}
      aria-label={decorative ? undefined : "Forge & Fate"}
      className={`${className} flex items-center justify-center rounded-full border border-white/[0.08] bg-surface-base text-primary`}
    >
      <WandSparkles className="h-1/2 w-1/2" />
    </span>
  );
}
