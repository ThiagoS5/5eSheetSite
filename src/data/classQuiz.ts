

export const QUIZ_QUESTION_COUNT = 7;

export interface ClassQuizOption {
  id: string;

  label: string;

  flavor: string;

  weights: Record<string, number>;
}

export interface ClassQuizQuestion {
  id: string;

  prompt: string;

  helper: string;
  options: ClassQuizOption[];
}

export interface ClassQuizRecommendation {
  primaryClassId: string;
  secondaryClassId: string;

  reasons: Record<string, string[]>;
}


export const classQuizPitches: Record<string, string> = {
  "barbarian-xphb":
    "Raw fury: you take the front line, absorb punishment like no one else, and strike back harder. At the table, it is direct and visceral with few turn-by-turn decisions and high impact.",
  "bard-xphb":
    "You win with Charisma: inspire allies, disrupt enemies, and solve half the scene through conversation. At the table, you turn social situations into a performance.",
  "cleric-xphb":
    "A direct channel to divine power: heal the fallen, protect combatants, and punish evil in armor. At the table, the party breathes easier when you are nearby.",
  "druid-xphb":
    "Nature answers your call: conjure storms, heal wounds, and become wild animals. At the table, this is pure versatility with a form or spell for almost any problem.",
  "fighter-xphb":
    "Master of weapons and armor: reliable in any fight and easy to learn. At the table, you always know what to do on your turn and do it well.",
  "monk-xphb":
    "Body and discipline as weapons: run across walls, deliver flurries of strikes, and escape the impossible. At the table, your turns feel like choreography.",
  "paladin-xphb":
    "A sacred oath guides your blade: protect the weak, heal allies, and smite enemies with divine force. At the table, you are the hero every party wants nearby.",
  "ranger-xphb":
    "Hunter of the wilds: track any quarry, shoot with lethal precision, and know every trail. At the table, you shine in exploration and keep the party from getting lost.",
  "rogue-xphb":
    "Shadows, cunning, and the perfect strike: open locks, vanish from sight, and deal brutal damage when no one expects it. At the table, you solve the impossible quietly.",
  "sorcerer-xphb":
    "Magic runs in your blood: shape spells by instinct and empower them in ways no scholar can. At the table, your big moments are explosive, sometimes literally.",
  "warlock-xphb":
    "A pact with something powerful gave you magic and a price: few spells, devastating impact, and a patron full of secrets. At the table, it fuels strong stories.",
  "wizard-xphb":
    "The deepest spellbook in the game: you study magic like science and have an answer for almost everything. At the table, you turn fights with the right spell at the right time.",
};


const TIE_BREAK_ORDER = [
  "fighter-xphb",
  "cleric-xphb",
  "rogue-xphb",
  "wizard-xphb",
  "paladin-xphb",
  "ranger-xphb",
  "barbarian-xphb",
  "bard-xphb",
  "druid-xphb",
  "sorcerer-xphb",
  "warlock-xphb",
  "monk-xphb",
];

export const classQuizQuestionPool: ClassQuizQuestion[] = [
  {
    id: "instinto-de-combate",
    prompt:
      "The dungeon door groans open and an ogre charges in roaring. What is your first instinct?",
    helper:
      "This defines where your character stands in combat and how much danger they can handle up close.",
    options: [
      {
        id: "instinto-de-combate-aco",
        label: "Charge in with steel in hand",
        flavor: "Front line: trading blows face to face.",
        weights: {
          "barbarian-xphb": 3,
          "fighter-xphb": 3,
          "paladin-xphb": 2,
          "monk-xphb": 2,
        },
      },
      {
        id: "instinto-de-combate-mira",
        label: "Keep distance and aim for a weak point",
        flavor: "Precise, safer attacks away from the claws.",
        weights: {
          "ranger-xphb": 3,
          "rogue-xphb": 2,
          "fighter-xphb": 1,
        },
      },
      {
        id: "instinto-de-combate-magia",
        label: "Raise my hands and let magic speak",
        flavor: "Arcane power solves what muscle cannot.",
        weights: {
          "wizard-xphb": 3,
          "sorcerer-xphb": 3,
          "warlock-xphb": 2,
          "druid-xphb": 1,
        },
      },
      {
        id: "instinto-de-combate-escudo",
        label: "Stand between danger and my allies",
        flavor: "No one falls while you are still standing.",
        weights: {
          "paladin-xphb": 3,
          "cleric-xphb": 3,
          "fighter-xphb": 1,
        },
      },
    ],
  },
  {
    id: "papel-no-grupo",
    prompt: "At the end of the session, which role would make you proudest?",
    helper:
      "Every party needs different roles. Your favorite says a lot about the ideal class.",
    options: [
      {
        id: "papel-no-grupo-escudo",
        label: "I was the shield that held back danger",
        flavor: "Tank: you absorb hits so the party can shine.",
        weights: {
          "paladin-xphb": 3,
          "fighter-xphb": 2,
          "barbarian-xphb": 2,
          "cleric-xphb": 1,
        },
      },
      {
        id: "papel-no-grupo-dano",
        label: "I was the table's biggest damage source",
        flavor: "When you act, the enemy stat block suffers.",
        weights: {
          "rogue-xphb": 2,
          "sorcerer-xphb": 2,
          "warlock-xphb": 2,
          "barbarian-xphb": 2,
        },
      },
      {
        id: "papel-no-grupo-suporte",
        label: "I kept everyone alive",
        flavor: "Healing and protection at the right time change the game.",
        weights: {
          "cleric-xphb": 3,
          "druid-xphb": 2,
          "bard-xphb": 2,
          "paladin-xphb": 1,
        },
      },
      {
        id: "papel-no-grupo-controle",
        label: "I controlled the field and won with cunning",
        flavor: "A well-placed spell can be worth ten swords.",
        weights: {
          "wizard-xphb": 3,
          "bard-xphb": 2,
          "druid-xphb": 2,
        },
      },
    ],
  },
  {
    id: "estilo-de-turno",
    prompt: "Your turn begins and the whole table looks at you. What sounds most fun?",
    helper:
      "Classes have different complexity levels: some are direct, others offer many options each turn.",
    options: [
      {
        id: "estilo-de-turno-direto",
        label: "Act fast: a clean strike, no dilemma",
        flavor: "Simple to play and consistently effective, ideal for starting out.",
        weights: {
          "fighter-xphb": 3,
          "barbarian-xphb": 2,
          "rogue-xphb": 1,
        },
      },
      {
        id: "estilo-de-turno-truques",
        label: "Have a trick for every situation",
        flavor: "Many choices each turn, for players who like planning.",
        weights: {
          "wizard-xphb": 3,
          "bard-xphb": 2,
          "druid-xphb": 2,
        },
      },
      {
        id: "estilo-de-turno-devastador",
        label: "Few powers, but devastating ones",
        flavor: "Every spent resource should be worth the scene.",
        weights: {
          "warlock-xphb": 3,
          "sorcerer-xphb": 2,
          "paladin-xphb": 1,
        },
      },
      {
        id: "estilo-de-turno-combo",
        label: "Chain movement and strikes together",
        flavor: "Agile turns full of movement and style.",
        weights: {
          "monk-xphb": 3,
          "rogue-xphb": 2,
          "ranger-xphb": 1,
        },
      },
    ],
  },
  {
    id: "origem-do-poder",
    prompt: "Where does your hero's power come from?",
    helper:
      "The source of power shapes the character's story and whether they use magic, and what kind.",
    options: [
      {
        id: "origem-do-poder-treino",
        label: "Years of training and discipline",
        flavor: "No shortcuts: every ability was earned through effort.",
        weights: {
          "monk-xphb": 3,
          "fighter-xphb": 2,
          "ranger-xphb": 1,
        },
      },
      {
        id: "origem-do-poder-fe",
        label: "Faith in something greater than myself",
        flavor: "A god, an oath, or nature itself answers your call.",
        weights: {
          "cleric-xphb": 3,
          "paladin-xphb": 2,
          "druid-xphb": 2,
        },
      },
      {
        id: "origem-do-poder-estudo",
        label: "Study, research, and ancient secrets",
        flavor: "Knowledge is power, literally.",
        weights: {
          "wizard-xphb": 3,
          "warlock-xphb": 1,
        },
      },
      {
        id: "origem-do-poder-sangue",
        label: "A gift that runs in my blood",
        flavor: "You did not learn magic. You were born with it.",
        weights: {
          "sorcerer-xphb": 3,
          "warlock-xphb": 2,
          "bard-xphb": 1,
        },
      },
    ],
  },
  {
    id: "cena-na-cidade",
    prompt:
      "The city is celebrating and the party needs information about the villain. What do you do?",
    helper:
      "Much of the game happens outside combat. Think about how you want to shine in those scenes.",
    options: [
      {
        id: "cena-na-cidade-palco",
        label: "Charm the whole hall with a story",
        flavor: "While everyone laughs, tongues loosen.",
        weights: {
          "bard-xphb": 3,
          "sorcerer-xphb": 1,
          "warlock-xphb": 1,
        },
      },
      {
        id: "cena-na-cidade-sombras",
        label: "Disappear into the crowd and overhear what I should not",
        flavor: "No one keeps secrets from someone no one sees.",
        weights: {
          "rogue-xphb": 3,
          "ranger-xphb": 1,
          "monk-xphb": 1,
        },
      },
      {
        id: "cena-na-cidade-templo",
        label: "Seek out the temple and local sages",
        flavor: "Those who know the past can foresee danger.",
        weights: {
          "cleric-xphb": 2,
          "wizard-xphb": 2,
          "paladin-xphb": 1,
        },
      },
      {
        id: "cena-na-cidade-guarda",
        label: "Watch the exits and troublemakers",
        flavor: "Celebrations are where ambushes happen. Someone has to watch.",
        weights: {
          "fighter-xphb": 2,
          "ranger-xphb": 2,
          "barbarian-xphb": 1,
        },
      },
    ],
  },
  {
    id: "lar-do-heroi",
    prompt: "Close your eyes: where does your character feel at home?",
    helper:
      "The hero's natural environment helps GM and player create scenes where the class shines.",
    options: [
      {
        id: "lar-do-heroi-ermos",
        label: "In the wilds, far from civilization",
        flavor: "Trails, beasts, and the open sky overhead.",
        weights: {
          "ranger-xphb": 3,
          "druid-xphb": 3,
          "barbarian-xphb": 1,
        },
      },
      {
        id: "lar-do-heroi-torre",
        label: "Among books, towers, and ancient ruins",
        flavor: "Every dusty tome hides an answer.",
        weights: {
          "wizard-xphb": 3,
          "warlock-xphb": 1,
          "cleric-xphb": 1,
        },
      },
      {
        id: "lar-do-heroi-taverna",
        label: "In taverns, stages, and noble halls",
        flavor: "Where there are people, there is an audience and opportunity.",
        weights: {
          "bard-xphb": 3,
          "rogue-xphb": 2,
          "sorcerer-xphb": 1,
        },
      },
      {
        id: "lar-do-heroi-fortaleza",
        label: "In training yards and fortresses",
        flavor: "Discipline, steel, and the smell of battle in the air.",
        weights: {
          "fighter-xphb": 3,
          "paladin-xphb": 2,
          "monk-xphb": 1,
        },
      },
    ],
  },
  {
    id: "dilema-do-vilao",
    prompt: "The villain lies defeated at your feet and begs for mercy. What does your hero do?",
    helper:
      "There is no right answer, but your moral instinct fits some classes more than others.",
    options: [
      {
        id: "dilema-do-vilao-piedade",
        label: "Spare them. Everyone deserves a chance at redemption",
        flavor: "Honor and compassion above revenge.",
        weights: {
          "paladin-xphb": 3,
          "cleric-xphb": 2,
          "monk-xphb": 1,
        },
      },
      {
        id: "dilema-do-vilao-fim",
        label: "Finish the job. Mercy is expensive",
        flavor: "Cold pragmatism: a living villain is a delayed problem.",
        weights: {
          "rogue-xphb": 2,
          "warlock-xphb": 2,
          "barbarian-xphb": 2,
        },
      },
      {
        id: "dilema-do-vilao-informacao",
        label: "Turn them into a source of information",
        flavor: "A talking enemy is worth more than a dead one.",
        weights: {
          "bard-xphb": 2,
          "wizard-xphb": 2,
          "rogue-xphb": 1,
        },
      },
      {
        id: "dilema-do-vilao-destino",
        label: "Let nature, or fate, decide",
        flavor: "You are an instrument of something greater, not a judge.",
        weights: {
          "druid-xphb": 3,
          "ranger-xphb": 2,
          "sorcerer-xphb": 1,
        },
      },
    ],
  },
  {
    id: "momento-de-gloria",
    prompt: "Which scene do you dream of telling friends about after the session?",
    helper:
      "The big moments you imagine are the best clue to the class you will enjoy.",
    options: [
      {
        id: "momento-de-gloria-muralha",
        label: "I held the boss alone while the party escaped",
        flavor: "Heroic endurance: the last one to fall.",
        weights: {
          "fighter-xphb": 2,
          "paladin-xphb": 2,
          "barbarian-xphb": 2,
          "monk-xphb": 1,
        },
      },
      {
        id: "momento-de-gloria-magia",
        label: "I turned the fight with one spell at the perfect moment",
        flavor: "The whole table cheering for the perfect Fireball.",
        weights: {
          "wizard-xphb": 3,
          "sorcerer-xphb": 2,
          "warlock-xphb": 1,
        },
      },
      {
        id: "momento-de-gloria-resgate",
        label: "I saved an ally on the brink of death",
        flavor: "The last-second heal no one forgets.",
        weights: {
          "cleric-xphb": 3,
          "druid-xphb": 2,
          "paladin-xphb": 1,
        },
      },
      {
        id: "momento-de-gloria-roubo",
        label: "I stole the key to the entire plan without anyone noticing",
        flavor: "The silent play that solved the campaign.",
        weights: {
          "rogue-xphb": 3,
          "bard-xphb": 1,
          "ranger-xphb": 1,
        },
      },
    ],
  },
  {
    id: "forma-da-magia",
    prompt: "If magic answered your call, what would it look like?",
    helper:
      "Even characters who prefer steel can have a mystical edge. This separates spellcasting classes clearly.",
    options: [
      {
        id: "forma-da-magia-pacto",
        label: "A mysterious pact with something powerful",
        flavor: "Borrowed power has interest, and excellent stories.",
        weights: {
          "warlock-xphb": 3,
          "sorcerer-xphb": 1,
        },
      },
      {
        id: "forma-da-magia-bencao",
        label: "Blessings that heal and protect",
        flavor: "Your magic exists for others, not only yourself.",
        weights: {
          "cleric-xphb": 3,
          "druid-xphb": 2,
          "paladin-xphb": 2,
        },
      },
      {
        id: "forma-da-magia-formula",
        label: "Formulae studied with watchmaker precision",
        flavor: "Magic is science: study more, cast better.",
        weights: {
          "wizard-xphb": 3,
          "bard-xphb": 1,
        },
      },
      {
        id: "forma-da-magia-instinto",
        label: "Pure energy guided by instinct",
        flavor: "You feel magic before you understand it.",
        weights: {
          "sorcerer-xphb": 3,
          "monk-xphb": 1,
          "bard-xphb": 1,
        },
      },
    ],
  },
  {
    id: "mochila-do-heroi",
    prompt: "The party leaves tomorrow at dawn. What must be in your pack?",
    helper:
      "The equipment you value reveals how you plan to solve adventuring problems.",
    options: [
      {
        id: "mochila-do-heroi-arma",
        label: "A sharp weapon and reliable armor",
        flavor: "Prepared for the worst, because the worst always arrives.",
        weights: {
          "fighter-xphb": 3,
          "paladin-xphb": 2,
          "barbarian-xphb": 1,
        },
      },
      {
        id: "mochila-do-heroi-livros",
        label: "Books, maps, and strange components",
        flavor: "Knowledge weighs little and saves lives.",
        weights: {
          "wizard-xphb": 3,
          "cleric-xphb": 1,
          "druid-xphb": 1,
        },
      },
      {
        id: "mochila-do-heroi-ferramentas",
        label: "Rope, lockpicks, and a good pair of daggers",
        flavor: "Every locked door is an invitation.",
        weights: {
          "rogue-xphb": 3,
          "ranger-xphb": 2,
          "monk-xphb": 1,
        },
      },
      {
        id: "mochila-do-heroi-instrumento",
        label: "An instrument and good stories",
        flavor: "Whoever brightens the camp guides the journey.",
        weights: {
          "bard-xphb": 3,
          "sorcerer-xphb": 1,
          "warlock-xphb": 1,
        },
      },
    ],
  },
];

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}


export function createClassQuizSession(
  random: () => number = Math.random,
): ClassQuizQuestion[] {
  return shuffle(classQuizQuestionPool, random)
    .slice(0, QUIZ_QUESTION_COUNT)
    .map((question) => ({
      ...question,
      options: shuffle(question.options, random),
    }));
}


export function getClassQuizRecommendation(
  questions: readonly ClassQuizQuestion[],
  answerOptionIds: readonly string[],
): ClassQuizRecommendation | null {
  if (
    questions.length < QUIZ_QUESTION_COUNT ||
    answerOptionIds.length < questions.length
  ) {
    return null;
  }

  const chosenOptions = questions
    .map((question, index) =>
      question.options.find((option) => option.id === answerOptionIds[index]),
    )
    .filter((option): option is ClassQuizOption => Boolean(option));

  const scores = new Map<string, number>();
  const reasons = new Map<string, Array<{ label: string; weight: number }>>();

  for (const option of chosenOptions) {
    for (const [classId, weight] of Object.entries(option.weights)) {
      scores.set(classId, (scores.get(classId) ?? 0) + weight);
      const entries = reasons.get(classId) ?? [];
      entries.push({ label: option.label, weight });
      reasons.set(classId, entries);
    }
  }

  const ranked = [...scores.entries()].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return TIE_BREAK_ORDER.indexOf(a[0]) - TIE_BREAK_ORDER.indexOf(b[0]);
  });

  const [primary = "fighter-xphb", secondary = "cleric-xphb"] = ranked.map(
    ([classId]) => classId,
  );

  const buildReasons = (classId: string): string[] =>
    (reasons.get(classId) ?? [])
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((entry) => entry.label);

  return {
    primaryClassId: primary,
    secondaryClassId: secondary,
    reasons: {
      [primary]: buildReasons(primary),
      [secondary]: buildReasons(secondary),
    },
  };
}
