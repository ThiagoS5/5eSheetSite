import foundryReference from "@/src/_references/foundry-reference.json";
import type { CharacterBuilderState } from "@/src/store/characterStore.types";
import type { CharacterSheetSummary } from "@/types/builder";
import type { AttributeKey } from "@/types/dnd";

type AbilityAbbreviation = "str" | "dex" | "con" | "int" | "wis" | "cha";

export interface FoundryActorExport {
  name: string;
  type: "character";
  img?: string;
  system: FoundryCharacterSystem;
  prototypeToken?: Record<string, unknown>;
  items: FoundryItemExport[];
  effects?: unknown[];
  folder?: string | null;
  flags?: Record<string, unknown>;
  _stats?: Record<string, unknown>;
  ownership?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FoundryCharacterSystem {
  abilities: Record<AbilityAbbreviation, FoundryAbility>;
  attributes: {
    hp: FoundryHitPoints;
    ac: FoundryArmorClass;
    [key: string]: unknown;
  };
  details: Record<string, unknown>;
  traits?: Record<string, unknown>;
  resources?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FoundryAbility {
  value: number;
  proficient?: number;
  bonuses?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface FoundryHitPoints {
  value: number;
  max: number;
  temp?: number | null;
  tempmax?: number | null;
  [key: string]: unknown;
}

export interface FoundryArmorClass {
  flat: number;
  calc?: string;
  [key: string]: unknown;
}

export interface FoundryItemExport {
  _id: string;
  name: string;
  type: string;
  img: string;
  system: Record<string, unknown>;
  effects: unknown[];
  folder: string | null;
  flags: Record<string, unknown>;
  sort: number;
  ownership: Record<string, unknown>;
  [key: string]: unknown;
}

const ATTRIBUTE_TO_FOUNDRY: Record<AttributeKey, AbilityAbbreviation> = {
  forca: "str",
  destreza: "dex",
  constituicao: "con",
  inteligencia: "int",
  sabedoria: "wis",
  carisma: "cha",
};

export function createFoundryCharacterExport(
  state: CharacterBuilderState,
  summary: CharacterSheetSummary,
): FoundryActorExport {
  const actor = cloneReference();
  const characterName = state.description.nome.trim() || "Character";

  actor.name = characterName;
  actor.type = "character";

  for (const [attribute, foundryKey] of Object.entries(ATTRIBUTE_TO_FOUNDRY) as Array<
    [AttributeKey, AbilityAbbreviation]
  >) {
    actor.system.abilities[foundryKey] = {
      ...actor.system.abilities[foundryKey],
      value: summary.finalAttributes[attribute],
    };
  }

  actor.system.attributes.hp = {
    ...actor.system.attributes.hp,
    value: summary.hitPoints,
    max: summary.hitPoints,
  };
  actor.system.attributes.ac = {
    ...actor.system.attributes.ac,
    flat: summary.armorClass,
    calc: "flat",
  };
  actor.system.details = {
    ...actor.system.details,
    level: summary.level,
    race: summary.speciesId,
    background: summary.backgroundId,
    originalClass: summary.classId,
    alignment: state.description.alinhamento,
    faith: state.description.faith,
    lifestyle: state.description.lifestyle,
    appearance: state.description.aparencia,
    trait: state.description.tracos,
    age: state.description.age,
    height: state.description.height,
    weight: state.description.weight,
    eyes: state.description.eyes,
    skin: state.description.skin,
    hair: state.description.hair,
    gender: state.description.gender,
    biography: {
      value: createBiography(state),
      public: "",
    },
  };
  actor.system.traits = {
    ...actor.system.traits,
    languages: {
      ...(actor.system.traits?.languages as Record<string, unknown> | undefined),
      value: state.speciesLanguages.map(toFoundrySlug),
    },
  };
  actor.items = createFoundryItems(summary);

  return actor;
}

function cloneReference(): FoundryActorExport {
  return JSON.parse(JSON.stringify(foundryReference)) as FoundryActorExport;
}

function createFoundryItems(summary: CharacterSheetSummary): FoundryItemExport[] {
  const identityItems = [
    createFoundryItem(titleFromId(summary.classId), "class", "Classe selecionada."),
    createFoundryItem(titleFromId(summary.speciesId), "feat", "Espécie selecionada."),
    createFoundryItem(titleFromId(summary.backgroundId), "background", "Antecedente selecionado."),
  ].filter((item) => item.name !== "");
  const traitItems = summary.selectedTraits.map((trait) =>
    createFoundryItem(trait.name, "feat", trait.description),
  );
  const classFeatureItems = summary.classFeatures.map((feature) =>
    createFoundryItem(feature.name, "feat", feature.description),
  );
  const classChoiceItems = Object.entries(summary.classFeatureChoices).map(
    ([choiceId, values]) =>
      createFoundryItem(titleFromId(choiceId), "feat", values.join(", ")),
  );
  const equipmentItems = summary.selectedEquipment.map((equipment) =>
    createFoundryItem(equipment.name, "equipment", `Fonte: ${equipment.source}`),
  );

  return [
    ...identityItems,
    ...traitItems,
    ...classFeatureItems,
    ...classChoiceItems,
    ...equipmentItems,
  ].map((item, index) => ({
    ...item,
    sort: index * 100000,
  }));
}

function createFoundryItem(
  name: string,
  type: string,
  description: string,
): FoundryItemExport {
  return {
    _id: createFoundryId(name),
    name,
    type,
    img: "icons/svg/item-bag.svg",
    system: {
      description: {
        value: description,
        chat: "",
      },
      source: {
        custom: "Forge & Fate Character Builder",
      },
    },
    effects: [],
    folder: null,
    flags: {},
    sort: 0,
    ownership: {
      default: 0,
    },
  };
}

function createBiography(state: CharacterBuilderState): string {
  const fields = [
    state.description.aparencia,
    state.description.personalidade,
    state.description.tracos,
    state.description.notas,
  ].filter((value) => value.trim().length > 0);

  return fields.join("\n\n");
}

function toFoundrySlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function titleFromId(id: string): string {
  const [name] = id.split("-xphb");
  return name
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function createFoundryId(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 16)
    .padEnd(16, "0");
}
