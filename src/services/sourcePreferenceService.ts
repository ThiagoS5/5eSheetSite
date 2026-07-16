import { getItemCatalog } from "@/src/services/itemCatalogService";
import {
  getBuilderBackgrounds,
  getBuilderClasses,
  getBuilderLanguages,
  getBuilderSpecies,
  getFeats,
} from "@/src/services/ruleService";
import { getSpellCatalog } from "@/src/services/spellService";
import type {
  CreationPreferences,
  ProgressionMode,
} from "@/src/types/characterBuild";
import {
  BASE_SOURCE_CODE,
  isInactiveSourceCode,
  normalizeSourceCode,
} from "@/src/utils/sourceFiltering";

export { BASE_SOURCE_CODE } from "@/src/utils/sourceFiltering";

export interface SourcePreferenceOption {
  code: string;
  label: string;
  bookTitle: string;
  locked: boolean;
  inactive: boolean;
  disabledReason?: string;
}

const SOURCE_BOOK_TITLES: Record<string, string> = {
  AAG: "Astral Adventurer's Guide",
  ABH: "Astarion's Book of Hungers",
  AI: "Acquisitions Incorporated",
  "AitFR-AVT": "Adventures in the Forgotten Realms: A Verdant Tomb",
  "AitFR-THP": "Adventures in the Forgotten Realms: The Hidden Page",
  AZfyT: "A Zib for Your Thoughts",
  BAM: "Boo's Astral Menagerie",
  BGDIA: "Baldur's Gate: Descent into Avernus",
  BGG: "Bigby Presents: Glory of the Giants",
  BMT: "The Book of Many Things",
  CM: "Candlekeep Mysteries",
  CoA: "Chains of Asmodeus",
  CoS: "Curse of Strahd",
  CRCotN: "Critical Role: Call of the Netherdeep",
  DC: "Divine Contention",
  DitLCoT: "Descent into the Lost Caverns of Tsojcanth",
  DMG: "Dungeon Master's Guide",
  DSotDQ: "Dragonlance: Shadow of the Dragon Queen",
  EET: "Elemental Evil: Trinkets",
  EFA: "Eberron: Forge of the Artificer",
  EGW: "Explorer's Guide to Wildemount",
  ERLW: "Eberron: Rising from the Last War",
  FRAiF: "Forgotten Realms: Adventures in Faerun",
  FRHoF: "Forgotten Realms: Heroes of Faerun",
  FTD: "Fizban's Treasury of Dragons",
  GGR: "Guildmasters' Guide to Ravnica",
  GoS: "Ghosts of Saltmarsh",
  "HAT-LMI": "Honor Among Thieves: Legendary Magic Items",
  HftT: "Hunt for the Thessalhydra",
  HotB: "Heroes of the Borderlands",
  HotDQ: "Hoard of the Dragon Queen",
  IDRotF: "Icewind Dale: Rime of the Frostmaiden",
  IMR: "Infernal Machine Rebuild",
  JttRC: "Journeys through the Radiant Citadel",
  KftGV: "Keys from the Golden Vault",
  LFL: "Lorwyn: First Light",
  LLK: "Lost Laboratory of Kwalish",
  LoX: "Light of Xaryxis",
  MCV2DC: "Monstrous Compendium Volume 2: Dragonlance Creatures",
  MM: "Monster Manual",
  MOT: "Mythic Odysseys of Theros",
  MTF: "Mordenkainen's Tome of Foes",
  NF: "Netheril's Fall",
  "NRH-AT": "NERDS Restoring Harmony: Adventure Together",
  "NRH-TLT": "NERDS Restoring Harmony: The Lost Tomb",
  OGA: "One Grung Above",
  OotA: "Out of the Abyss",
  PaBTSO: "Phandelver and Below: The Shattered Obelisk",
  PHB: "Player's Handbook",
  PotA: "Princes of the Apocalypse",
  PSA: "Plane Shift: Amonkhet",
  PSK: "Plane Shift: Kaladesh",
  PSX: "Plane Shift: Ixalan",
  QftIS: "Quests from the Infinite Staircase",
  RHW: "Ravenloft: The Horrors Within",
  RMBRE: "The Lost Dungeon of Rickedness: Big Rick Energy",
  RoT: "The Rise of Tiamat",
  RoTOS: "The Rise of Tiamat Online Supplement",
  SatO: "Sigil and the Outlands",
  SCAG: "Sword Coast Adventurer's Guide",
  SCC: "Strixhaven: A Curriculum of Chaos",
  SDW: "Sleeping Dragon's Wake",
  SKT: "Storm King's Thunder",
  TCE: "Tasha's Cauldron of Everything",
  TftYP: "Tales from the Yawning Portal",
  ToA: "Tomb of Annihilation",
  TTP: "The Tortle Package",
  UtHftLH: "Uni and the Hunt for the Lost Horn",
  VEoR: "Vecna: Eve of Ruin",
  VGM: "Volo's Guide to Monsters",
  VRGR: "Van Richten's Guide to Ravenloft",
  WBtW: "The Wild Beyond the Witchlight",
  WDH: "Waterdeep: Dragon Heist",
  WDMM: "Waterdeep: Dungeon of the Mad Mage",
  WttHC: "Stranger Things: Welcome to the Hellfire Club",
  XDMG: "Dungeon Master's Guide 2024",
  XGE: "Xanathar's Guide to Everything",
  XMM: "Monster Manual 2025",
  XMtS: "X Marks the Spot",
  XPHB: "Player's Handbook 2024",
};

let availableSourceOptionsCache: SourcePreferenceOption[] | undefined;

export function getAvailableSourcePreferenceOptions(): SourcePreferenceOption[] {
  availableSourceOptionsCache ??= buildAvailableSourcePreferenceOptions();

  return availableSourceOptionsCache;
}

export function getDefaultCreationPreferences(
  progressionMode: ProgressionMode = "xp",
): CreationPreferences {
  return {
    activeSources: getAvailableSourcePreferenceOptions()
      .filter((option) => !option.inactive)
      .map((option) => option.code),
    progressionMode,
  };
}

export function normalizeActiveSourceSelection(
  activeSources: readonly string[] | undefined,
): string[] {
  const knownSources = new Set(
    getAvailableSourcePreferenceOptions()
      .filter((option) => !option.inactive)
      .map((option) => option.code),
  );
  const normalizedSources = [
    BASE_SOURCE_CODE,
    ...(activeSources ?? []).map(normalizeSourceCode),
  ];
  const seenSources = new Set<string>();

  return normalizedSources.filter((source) => {
    if (!source || seenSources.has(source) || !knownSources.has(source)) {
      return false;
    }

    seenSources.add(source);
    return true;
  });
}

export function normalizeCreationPreferences(
  preferences: CreationPreferences | undefined,
): CreationPreferences | undefined {
  if (!preferences) {
    return undefined;
  }

  return {
    activeSources: normalizeActiveSourceSelection(preferences.activeSources),
    progressionMode: preferences.progressionMode,
  };
}

export function isLegacyBaseOnlySourceSelection(
  activeSources: readonly string[] | undefined,
): boolean {
  if (!activeSources || activeSources.length !== 1) {
    return false;
  }

  return normalizeSourceCode(activeSources[0] ?? "") === BASE_SOURCE_CODE;
}

function buildAvailableSourcePreferenceOptions(): SourcePreferenceOption[] {
  const codes = new Set<string>();

  for (const entry of getBuilderClasses()) {
    addSource(codes, entry.source);
    for (const subclass of entry.subclasses) {
      addSource(codes, subclass.source);
    }
  }
  for (const entry of getBuilderSpecies()) {
    addSource(codes, entry.source);
  }
  for (const entry of getBuilderBackgrounds()) {
    addSource(codes, entry.source);
  }
  for (const entry of getFeats()) {
    addSource(codes, entry.source);
  }
  for (const entry of getBuilderLanguages()) {
    addSource(codes, entry.source);
  }
  for (const entry of getItemCatalog()) {
    addSource(codes, entry.source);
  }
  for (const entry of getSpellCatalog()) {
    addSource(codes, entry.source);
  }

  codes.add(BASE_SOURCE_CODE);

  return [...codes]
    .sort((first, second) => {
      if (first === BASE_SOURCE_CODE) return -1;
      if (second === BASE_SOURCE_CODE) return 1;
      return first.localeCompare(second);
    })
    .map((code) => {
      const bookTitle = getSourceBookTitle(code);
      const inactive = isInactiveSourceCode(code);
      return {
        code,
        bookTitle,
        label: `${code} (${bookTitle})`,
        locked: code === BASE_SOURCE_CODE,
        inactive,
        disabledReason: inactive
          ? "Legacy D&D 2014 source is inactive in Forge & Fate."
          : undefined,
      };
    });
}

function addSource(codes: Set<string>, source: string | undefined): void {
  if (!source) {
    return;
  }

  codes.add(normalizeSourceCode(source));
}

export function getSourceBookTitle(code: string): string {
  const directTitle = SOURCE_BOOK_TITLES[code];
  if (directTitle) {
    return directTitle;
  }

  const normalizedCode = normalizeSourceCode(code);
  const matchingEntry = Object.entries(SOURCE_BOOK_TITLES).find(
    ([sourceCode]) => normalizeSourceCode(sourceCode) === normalizedCode,
  );

  return matchingEntry?.[1] ?? `${code} source`;
}
