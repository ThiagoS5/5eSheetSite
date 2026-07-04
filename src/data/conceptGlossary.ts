export const requiredConceptIds = [
  "class",
  "species",
  "background",
  "attribute",
  "modifier",
  "proficiency",
  "skill",
  "armor-class",
  "hit-points",
  "initiative",
  "speed",
  "saving-throw",
  "spell",
  "cantrip",
  "spell-level",
  "spell-slot",
  "spell-save-dc",
  "spell-attack",
  "subclass",
  "feat",
  "asi",
  "starting-equipment",
  "inventory",
  "hit-die",
  "rest",
  "table-use",
] as const;

export type ConceptId = (typeof requiredConceptIds)[number];

export interface BeginnerConcept {
  term: string;
  short: string;
  long: string;
}

export const conceptGlossary: Record<ConceptId, BeginnerConcept> = {
  class: {
    term: "Class",
    short: "A class is the hero's primary role: how they fight, endure, and solve problems.",
    long: "Think of class as the character's adventuring profession. A Fighter solves many problems with martial training, a Wizard with arcane study, and a Cleric with divine power. It defines Hit Die, proficiencies, features, and much of what you use at the table.",
  },
  species: {
    term: "Species",
    short: "Species describes the character's fantastic biological origin and natural traits.",
    long: "Human, Elf, Dwarf, and other species provide speed, senses, special traits, and language choices. Species does not decide your personality; it provides rule tools and a narrative foundation.",
  },
  background: {
    term: "Background",
    short: "A background shows what the character did before becoming an adventurer.",
    long: "Backgrounds grant ability score bonuses, skills, tools, equipment, and an Origin Feat. They help answer where the hero came from and why they know how to do certain things.",
  },
  attribute: {
    term: "Ability Score",
    short: "Ability scores are the six core numbers: Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma.",
    long: "Almost every important roll uses an ability score. High scores improve your odds; low scores create interesting weaknesses. The derived modifier is the number most often added to the roll.",
  },
  modifier: {
    term: "Modifier",
    short: "A modifier is the bonus or penalty derived from an ability score.",
    long: "An ability score of 16 gives a +3 modifier; an 8 gives -1. When the GM calls for a check, you roll a d20 and add that modifier, plus proficiency when it applies.",
  },
  proficiency: {
    term: "Proficiency",
    short: "Proficiency represents training and adds a bonus that grows with level.",
    long: "When your character is proficient with a skill, weapon, or saving throw, they add their Proficiency Bonus. This bonus starts at +2 and grows with total level.",
  },
  skill: {
    term: "Skill",
    short: "Skills are specialized uses of ability scores, such as Athletics, Stealth, and Perception.",
    long: "The GM calls for skills when an action has risk or uncertainty. Stealth uses Dexterity; Perception uses Wisdom. If you are proficient, you also add your Proficiency Bonus.",
  },
  "armor-class": {
    term: "Armor Class",
    short: "Armor Class, or AC, is the number enemies must meet or beat to hit you.",
    long: "When someone attacks your character, they roll a d20 and add the attack bonus. If the result equals or exceeds your AC, the attack hits. Armor, shields, and Dexterity usually affect this value.",
  },
  "hit-points": {
    term: "Hit Points",
    short: "Hit Points measure how much damage a character can withstand before dropping.",
    long: "HP are not only wounds; they represent stamina, luck, and resilience. At 0 HP, the character is in danger and may make death saving throws.",
  },
  initiative: {
    term: "Initiative",
    short: "Initiative determines turn order when combat begins.",
    long: "Each creature rolls a d20 and adds its Dexterity modifier. The highest result acts first. Good Dexterity helps characters who need to act early.",
  },
  speed: {
    term: "Speed",
    short: "Speed shows how many feet the character can move on a turn.",
    long: "Most characters walk 30 feet per turn. Difficult terrain, spells, armor, and species traits can alter this number.",
  },
  "saving-throw": {
    term: "Saving Throw",
    short: "Saving throws respond to dangers, spells, and effects that try to affect you.",
    long: "Unlike a skill check, a saving throw usually happens when something targets the character. Classes grant proficiency in certain saving throws.",
  },
  spell: {
    term: "Spell",
    short: "Spells are supernatural effects that spellcasters learn, prepare, or know.",
    long: "Spells can deal damage, heal, protect, control the field, or solve problems. Each spellcasting class has its own rules for learning and preparation.",
  },
  cantrip: {
    term: "Cantrip",
    short: "Cantrips are simple spells that do not spend spell slots.",
    long: "A cantrip can be used repeatedly. Cantrips are the spellcaster's baseline option when spending a larger resource is not worth it.",
  },
  "spell-level": {
    term: "Spell Level",
    short: "Spell level indicates a spell's power, from 1 to 9.",
    long: "Character level and spell level are not the same thing. A level 5 Wizard, for example, can access higher-level spells than a novice.",
  },
  "spell-slot": {
    term: "Spell Slot",
    short: "Slots are resources spent to cast spells of level 1 or higher.",
    long: "When you cast a spell, you spend a slot of the appropriate level or higher. Rests and class rules recover those slots.",
  },
  "spell-save-dc": {
    term: "Spell Save DC",
    short: "Spell Save DC is the difficulty targets must beat on a saving throw against your spell.",
    long: "The DC is usually 8 + proficiency + your spellcasting ability modifier. The higher it is, the harder your effects are to resist.",
  },
  "spell-attack": {
    term: "Spell Attack",
    short: "Spell attack is the bonus used when a spell calls for an attack roll.",
    long: "Some spells target like an attack: you roll a d20 and add proficiency plus your spellcasting ability modifier. Others ask the target to make a saving throw.",
  },
  subclass: {
    term: "Subclass",
    short: "A subclass is a specialization within the main class.",
    long: "It deepens the character's style. Fighters can follow different martial paths; Wizards choose traditions. The unlock level depends on the class.",
  },
  feat: {
    term: "Feat",
    short: "Feats are special improvements that grant new capabilities.",
    long: "Some feats come from backgrounds; others appear at specific levels. They can change ability scores, grant spells, proficiencies, or new combat options.",
  },
  asi: {
    term: "ASI",
    short: "ASI means Ability Score Improvement, a progression choice at certain levels.",
    long: "When the class grants an ASI, you improve ability scores or choose certain feats. Improving an ability can raise modifiers and several derived numbers.",
  },
  "starting-equipment": {
    term: "Starting Equipment",
    short: "Starting equipment is the kit the character receives when beginning the adventure.",
    long: "Class and background suggest weapons, armor, tools, and items. You can also choose gold when the rule allows it and build the inventory manually.",
  },
  inventory: {
    term: "Inventory",
    short: "Inventory is the list of items carried by the character.",
    long: "It records weapons, armor, tools, coins, and adventuring gear. As the campaign advances, inventory becomes a living part of the sheet.",
  },
  "hit-die": {
    term: "Hit Die",
    short: "Hit Die defines how much HP the class gains when leveling up.",
    long: "Durable classes use larger dice, such as d10 or d12. During short rests, Hit Dice can also be spent to recover HP.",
  },
  rest: {
    term: "Rest",
    short: "Rests recover some of the character's resources, HP, and capabilities.",
    long: "Short rests and long rests have different effects. The living sheet uses those rules to restore resources without changing permanent character choices.",
  },
  "table-use": {
    term: "What you use at the table",
    short: "At the table, you will check attacks, AC, HP, skills, spells, and remaining resources.",
    long: "The builder exists to produce a sheet that is easy to play. During a session, derived numbers must be clear, reliable, and fast to find.",
  },
};
