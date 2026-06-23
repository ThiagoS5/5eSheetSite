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
import type { DataSourceAuditEntry } from "@/types/builder";
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

export function getDataSourceAudit(): DataSourceAuditEntry[] {
  return [
    {
      step: "Classe",
      files: ["data/class/*.json"],
      purpose: "Classes, hit dice, proficiencies, features, and starting equipment.",
    },
    {
      step: "Raca/Especie",
      files: ["data/races.json", "data/languages.json"],
      purpose: "2024 species traits, size, speed, senses, resistances, and magic.",
    },
    {
      step: "Antecedente",
      files: ["data/backgrounds.json", "data/feats.json"],
      purpose: "2024 ability bonuses, origin feats, skills, tools, and equipment.",
    },
    {
      step: "Atributos",
      files: ["data/charcreationoptions.json", "data/backgrounds.json"],
      purpose: "Attribute generation methods and background ability choices.",
    },
    {
      step: "Equipamento",
      files: ["data/items.json", "data/class/*.json", "data/backgrounds.json"],
      purpose: "Class/background equipment and item-derived sheet values.",
    },
  ];
}

export function getBuilderSpecies() {
  return raceFile.race
    .filter((race) => is2024Source(race.source, race.edition))
    .map((race) =>
      normalizeSpecies(race, playerLore.species?.[toSlug(race.name, race.source)]),
    );
}

export function getBuilderBackgrounds() {
  return backgroundFile.background
    .filter((background) => is2024Source(background.source, background.edition))
    .map((background) =>
      normalizeBackground(
        background,
        playerLore.background?.[toSlug(background.name, background.source)],
      ),
    );
}

export function getBuilderClasses() {
  const weaponMasteryOptions = getWeaponMasteryOptions();

  return classFiles
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
    );
}

export function getSubclassesForClass(classId: string) {
  return (
    getBuilderClasses().find((entry) => entry.id === classId)?.subclasses ?? []
  );
}

export function getBuilderEquipmentOptions() {
  return [...itemFile.item, ...baseItemFile.baseitem]
    .filter((item) => is2024Source(item.source, item.edition))
    .map(normalizeEquipmentOption);
}

export function getBuilderLanguages() {
  return languageFile.language
    .filter((language) => is2024Source(language.source))
    .map(normalizeLanguage);
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
