import backgroundsData from "@/public/data/backgrounds.json";
import artificerData from "@/public/data/class/class-artificer.json";
import barbarianData from "@/public/data/class/class-barbarian.json";
import bardData from "@/public/data/class/class-bard.json";
import clericData from "@/public/data/class/class-cleric.json";
import druidData from "@/public/data/class/class-druid.json";
import fighterData from "@/public/data/class/class-fighter.json";
import monkData from "@/public/data/class/class-monk.json";
import paladinData from "@/public/data/class/class-paladin.json";
import rangerData from "@/public/data/class/class-ranger.json";
import rogueData from "@/public/data/class/class-rogue.json";
import sorcererData from "@/public/data/class/class-sorcerer.json";
import warlockData from "@/public/data/class/class-warlock.json";
import wizardData from "@/public/data/class/class-wizard.json";
import featsData from "@/public/data/feats.json";
import baseItemsData from "@/public/data/items-base.json";
import itemsData from "@/public/data/items.json";
import languagesData from "@/public/data/languages.json";
import playerLoreData from "@/public/data/player-lore.json";
import racesData from "@/public/data/races.json";
import {
  is2024Source,
  normalizeBackground,
  normalizeClass,
  normalizeEquipmentOption,
  normalizeLanguage,
  normalizeSpecies,
  formatTaggedTextAsPlain,
  toSlug,
} from "@/src/adapters/fiveEToolsAdapter";
import { normalizeFeats } from "@/src/adapters/featCatalog";
import type {
  BuilderBackground,
  BuilderClass,
  BuilderEquipmentOption,
  BuilderFeat,
  BuilderLanguage,
  BuilderSpecies,
  DataSourceAuditEntry,
} from "@/types/builder";
import type {
  Raw5eBackgroundFile,
  Raw5eClassFile,
  Raw5eItem,
  Raw5eItemFile,
  Raw5eLanguageFile,
  RawPlayerLoreFile,
  Raw5eRaceFile,
} from "@/types/fiveETools";

const raceFile = racesData as Raw5eRaceFile;
const backgroundFile = backgroundsData as Raw5eBackgroundFile;
const itemFile = itemsData as Raw5eItemFile;
const languageFile = languagesData as Raw5eLanguageFile;
const baseItemFile = baseItemsData as { baseitem: Raw5eItem[] };
const playerLore = playerLoreData as RawPlayerLoreFile;
const classFiles = [
  artificerData,
  barbarianData,
  bardData,
  clericData,
  druidData,
  fighterData,
  monkData,
  paladinData,
  rangerData,
  rogueData,
  sorcererData,
  warlockData,
  wizardData,
] as Raw5eClassFile[];

let builderSpeciesCache: BuilderSpecies[] | undefined;
let builderBackgroundsCache: BuilderBackground[] | undefined;
let builderClassesCache: BuilderClass[] | undefined;
let builderEquipmentOptionsCache: BuilderEquipmentOption[] | undefined;
let builderLanguagesCache: BuilderLanguage[] | undefined;
let featsCache: BuilderFeat[] | undefined;

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (!value || typeof value !== "object") return value;

  const objectValue = value as object;
  if (seen.has(objectValue)) return value;
  seen.add(objectValue);

  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child, seen);
  }

  return Object.freeze(value);
}

export function getDataSourceAudit(): DataSourceAuditEntry[] {
  return [
    {
      step: "Class",
      files: ["data/class/*.json"],
      purpose: "Classes, hit dice, proficiencies, features, and starting equipment.",
    },
    {
      step: "Species",
      files: ["data/races.json", "data/languages.json"],
      purpose: "2024 species traits, size, speed, senses, resistances, and magic.",
    },
    {
      step: "Background",
      files: ["data/backgrounds.json", "data/feats.json"],
      purpose: "2024 ability bonuses, origin feats, skills, tools, and equipment.",
    },
    {
      step: "Ability Scores",
      files: ["data/charcreationoptions.json", "data/backgrounds.json"],
      purpose: "Attribute generation methods and background ability choices.",
    },
    {
      step: "Equipment",
      files: ["data/items.json", "data/class/*.json", "data/backgrounds.json"],
      purpose: "Class/background equipment and item-derived sheet values.",
    },
  ];
}

export function getBuilderSpecies() {
  builderSpeciesCache ??= deepFreeze(
    raceFile.race
      .filter((race) => is2024Source(race.source, race.edition))
      .map((race) =>
        normalizeSpecies(race, playerLore.species?.[toSlug(race.name, race.source)]),
      ),
  );

  return builderSpeciesCache;
}

export function getBuilderBackgrounds() {
  builderBackgroundsCache ??= deepFreeze(
    backgroundFile.background
      .filter((background) => is2024Source(background.source, background.edition))
      .map((background) =>
        normalizeBackground(
          background,
          playerLore.background?.[toSlug(background.name, background.source)],
        ),
      ),
    );

  return builderBackgroundsCache;
}

export function getBuilderClasses() {
  if (builderClassesCache) return builderClassesCache;

  const weaponMasteryOptions = getWeaponMasteryOptions();

  builderClassesCache = deepFreeze(
    classFiles
      .flatMap((file) =>
        file.class
          .filter((rawClass) => is2024Source(rawClass.source, rawClass.edition))
          .map((rawClass) =>
            normalizeClass(
              rawClass,
              file.classFeature ?? [],
              [],
              playerLore.class?.[toSlug(rawClass.name, rawClass.source)],
              weaponMasteryOptions,
              file.subclass ?? [],
              file.subclassFeature ?? [],
            ),
          ),
      ),
  );

  return builderClassesCache;
}

export function getSubclassesForClass(classId: string) {
  return (
    getBuilderClasses().find((entry) => entry.id === classId)?.subclasses ?? []
  );
}

export function getBuilderEquipmentOptions() {
  builderEquipmentOptionsCache ??= deepFreeze(
    [...itemFile.item, ...baseItemFile.baseitem]
      .filter((item) => is2024Source(item.source, item.edition))
      .map(normalizeEquipmentOption),
  );

  return builderEquipmentOptionsCache;
}

export function getBuilderLanguages() {
  builderLanguagesCache ??= deepFreeze(
    languageFile.language
      .filter((language) => is2024Source(language.source))
      .map(normalizeLanguage),
  );

  return builderLanguagesCache;
}

export function getFeats() {
  featsCache ??= deepFreeze(
    normalizeFeats(
      featsData.feat.filter((feat) => is2024Source(feat.source)) as unknown as Parameters<
        typeof normalizeFeats
      >[0],
    ),
  );

  return featsCache;
}

function getWeaponMasteryOptions() {
  return baseItemFile.baseitem
    .filter((item) => is2024Source(item.source, item.edition))
    .filter((item) => item.weaponCategory && item.mastery)
    .map((item) => {
      const masteryReference = Array.isArray(item.mastery)
        ? item.mastery[0]
        : item.mastery;
      const mastery = masteryReference
        ? formatTaggedTextAsPlain(masteryReference.split("|")[0] ?? masteryReference)
        : "";
      const weaponRange = item.type?.startsWith("M") ? "melee" : "ranged";

      return {
        label: mastery ? `${item.name} (${mastery})` : item.name,
        value: toSlug(item.name, item.source),
        description: `${weaponRange} ${item.weaponCategory ?? ""}`.trim(),
      };
    });
}
