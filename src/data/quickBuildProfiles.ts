import type { CharacterAttributes } from "@/types/dnd";

export interface QuickBuildProfile {
  classId: string;
  label: string;
  skillProficiencies: string[];
  baseAttributes: CharacterAttributes;
}

const martialAttributes: CharacterAttributes = {
  forca: 15,
  destreza: 14,
  constituicao: 13,
  inteligencia: 8,
  sabedoria: 12,
  carisma: 10,
};

const agileAttributes: CharacterAttributes = {
  forca: 8,
  destreza: 15,
  constituicao: 13,
  inteligencia: 12,
  sabedoria: 14,
  carisma: 10,
};

const arcaneAttributes: CharacterAttributes = {
  forca: 8,
  destreza: 14,
  constituicao: 13,
  inteligencia: 15,
  sabedoria: 10,
  carisma: 12,
};

const divineAttributes: CharacterAttributes = {
  forca: 13,
  destreza: 10,
  constituicao: 14,
  inteligencia: 8,
  sabedoria: 15,
  carisma: 12,
};

const charismaCasterAttributes: CharacterAttributes = {
  forca: 8,
  destreza: 14,
  constituicao: 13,
  inteligencia: 10,
  sabedoria: 12,
  carisma: 15,
};

export const quickBuildProfiles: readonly QuickBuildProfile[] = [
  {
    classId: "artificer-efa",
    label: "Artifice inventivo",
    skillProficiencies: ["Arcana", "Investigation"],
    baseAttributes: arcaneAttributes,
  },
  {
    classId: "barbarian-xphb",
    label: "Barbaro resistente",
    skillProficiencies: ["Athletics", "Perception"],
    baseAttributes: martialAttributes,
  },
  {
    classId: "bard-xphb",
    label: "Bardo versatil",
    skillProficiencies: ["Performance", "Persuasion", "Insight"],
    baseAttributes: charismaCasterAttributes,
  },
  {
    classId: "cleric-xphb",
    label: "Clerigo de suporte",
    skillProficiencies: ["Insight", "Medicine"],
    baseAttributes: divineAttributes,
  },
  {
    classId: "druid-xphb",
    label: "Druida naturalista",
    skillProficiencies: ["Nature", "Survival"],
    baseAttributes: divineAttributes,
  },
  {
    classId: "fighter-xphb",
    label: "Guerreiro marcial",
    skillProficiencies: ["Athletics", "Perception"],
    baseAttributes: martialAttributes,
  },
  {
    classId: "monk-xphb",
    label: "Monge agil",
    skillProficiencies: ["Acrobatics", "Insight"],
    baseAttributes: agileAttributes,
  },
  {
    classId: "paladin-xphb",
    label: "Paladino protetor",
    skillProficiencies: ["Athletics", "Persuasion"],
    baseAttributes: {
      forca: 15,
      destreza: 8,
      constituicao: 13,
      inteligencia: 10,
      sabedoria: 12,
      carisma: 14,
    },
  },
  {
    classId: "ranger-xphb",
    label: "Patrulheiro explorador",
    skillProficiencies: ["Nature", "Perception", "Survival"],
    baseAttributes: agileAttributes,
  },
  {
    classId: "rogue-xphb",
    label: "Ladino furtivo",
    skillProficiencies: ["Acrobatics", "Deception", "Perception", "Stealth"],
    baseAttributes: agileAttributes,
  },
  {
    classId: "sorcerer-xphb",
    label: "Feiticeiro ofensivo",
    skillProficiencies: ["Arcana", "Persuasion"],
    baseAttributes: charismaCasterAttributes,
  },
  {
    classId: "warlock-xphb",
    label: "Bruxo enigmatico",
    skillProficiencies: ["Arcana", "Intimidation"],
    baseAttributes: charismaCasterAttributes,
  },
  {
    classId: "wizard-xphb",
    label: "Mago estudioso",
    skillProficiencies: ["Arcana", "Investigation"],
    baseAttributes: arcaneAttributes,
  },
];

export function getQuickBuildProfile(classId: string): QuickBuildProfile | undefined {
  return quickBuildProfiles.find((profile) => profile.classId === classId);
}
