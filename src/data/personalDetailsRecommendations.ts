import type { BuilderBackground, BuilderClass, BuilderSpecies } from "@/src/types/builder";

type NameFrame = (name: string) => string;

interface SpeciesPattern {
  names: string[];
  age: string;
  height: string;
  weight: string;
  eyes: string[];
  skin: string[];
  hair: string[];
  appearance: string;
}

interface BackgroundPattern {
  nameFrames: NameFrame[];
  alignments: string[];
  faiths: string[];
  lifestyle: string;
  personality: string;
  backstory: string;
}

interface ClassPattern {
  personality: string;
  notes: string;
}

export interface PersonalDetailsRecommendations {
  title: string;
  names: string[];
  alignments: string[];
  faiths: string[];
  lifestyle: string;
  age: string;
  height: string;
  weight: string;
  eyes: string[];
  skin: string[];
  hair: string[];
  appearance: string;
  personality: string;
  backstory: string;
  notes: string;
  suggestions: {
    aparencia: string[];
    personalidade: string[];
    historia: string[];
    notas: string[];
  };
}

const SUGGESTION_COUNT = 50;

const defaultSpeciesPattern: SpeciesPattern = {
  names: ["Alden", "Mira", "Rowan", "Kael", "Thalia", "Dain"],
  age: "Young adult, seasoned veteran, or elder whose exact age matters to the campaign.",
  height: "Average for the chosen species, adjusted to fit the silhouette you picture.",
  weight: "Match build and equipment: lean traveler, armored veteran, or sturdy survivor.",
  eyes: ["gray", "hazel", "green", "dark brown"],
  skin: ["weathered", "freckled", "warm brown", "pale"],
  hair: ["cropped black", "braided brown", "silver-streaked", "auburn"],
  appearance: "Lead with one readable silhouette: travel-worn, ceremonial, polished, or unsettling.",
};

const speciesPatterns: Record<string, SpeciesPattern> = {
  "aasimar-xphb": {
    names: ["Seraphine", "Aurel", "Iria", "Cassiel", "Liora", "Maelis"],
    age: "18-90, often written as someone carrying a calling before they feel ready.",
    height: "Usually humanlike, with a calm or luminous presence.",
    weight: "Humanlike, from slight oracle to armored champion.",
    eyes: ["gold", "silver", "white-blue", "sunlit amber"],
    skin: ["warm bronze", "moon-pale", "radiant brown", "faintly opalescent"],
    hair: ["silver", "white-gold", "black with bright strands", "braided gold"],
    appearance: "Subtle radiance, symmetrical features, ritual marks, or light that leaks through restraint.",
  },
  "changeling-efa": {
    names: ["Vey", "Lio", "Mask", "Nara", "Sil", "Eris"],
    age: "18-80, with a public age that may differ from the truth.",
    height: "Variable, often chosen to avoid attention.",
    weight: "Variable, usually described by posture rather than exact mass.",
    eyes: ["pale gray", "mirror-black", "soft blue", "ever-changing"],
    skin: ["porcelain", "ashen", "borrowed tone", "smooth ivory"],
    hair: ["white", "ink-black", "changing", "cropped"],
    appearance: "A face that feels rehearsed, a perfect disguise, or one feature they never change.",
  },
  "dragonborn-xphb": {
    names: ["Arjhan", "Balasar", "Kava", "Nymmurh", "Rhogar", "Shamash"],
    age: "15-80, with adulthood arriving early and reputation mattering fast.",
    height: "Tall and broad, built to make ancestry obvious.",
    weight: "Heavy, powerful, and armor-friendly.",
    eyes: ["gold", "ember", "ice-blue", "acid green"],
    skin: ["red scale", "bronze scale", "black scale", "blue scale"],
    hair: ["crest spines", "horn rings", "no hair", "braided tendrils"],
    appearance: "A proud draconic silhouette, scale patterns, clan marks, and elemental tells.",
  },
  "dwarf-xphb": {
    names: ["Brom", "Dagna", "Fargrim", "Helja", "Korga", "Torbren"],
    age: "50-350, often old enough to carry clan memory and grudges.",
    height: "Short, dense, and grounded.",
    weight: "Stocky, muscular, and heavier than height suggests.",
    eyes: ["deep brown", "steel gray", "moss green", "coal black"],
    skin: ["stone-brown", "ruddy", "deep tan", "ash-freckled"],
    hair: ["braided black", "copper beard", "iron-gray", "ritual plaits"],
    appearance: "Craft marks, clan jewelry, careful grooming, and a stance that does not yield.",
  },
  "elf-xphb": {
    names: ["Aelar", "Thia", "Lethariel", "Soveliss", "Vaelora", "Erevan"],
    age: "100-750, from newly independent wanderer to ancient witness.",
    height: "Graceful and lean, usually taller than a human or unnervingly slight.",
    weight: "Light for the height, more dancer than brawler.",
    eyes: ["silver", "violet", "forest green", "moonlit blue"],
    skin: ["copper", "deep brown", "pale gold", "cool ivory"],
    hair: ["raven-black", "silver", "copper", "long white"],
    appearance: "Fine movement, ageless calm, old jewelry, and a trace of the wild or the arcane.",
  },
  "gnome-xphb": {
    names: ["Alston", "Bimpnottin", "Fenna", "Nissa", "Warryn", "Zook"],
    age: "40-350, curious at every age and rarely done experimenting.",
    height: "Small and quick, with expressive posture.",
    weight: "Light, compact, and tool-laden.",
    eyes: ["bright blue", "hazel", "violet", "quick black"],
    skin: ["warm tan", "freckled", "deep brown", "rosy"],
    hair: ["wild white", "copper curls", "violet-dyed", "tufted black"],
    appearance: "Ink stains, clever gadgets, restless hands, and eyes that track every mechanism.",
  },
  "goliath-xphb": {
    names: ["Aukan", "Eglath", "Gae-Al", "Keothi", "Maveith", "Thalai"],
    age: "18-80, often measured by contests, climbs, and scars.",
    height: "Towering and athletic.",
    weight: "Very heavy, built for endurance and impact.",
    eyes: ["ice gray", "storm blue", "dark brown", "pale amber"],
    skin: ["stone-gray", "earth-brown", "snow-pale", "mottled slate"],
    hair: ["shaved", "dark braids", "white topknot", "none"],
    appearance: "Stone-like markings, trophy scars, mountain gear, and a body used to hard weather.",
  },
  "halfling-xphb": {
    names: ["Ander", "Bree", "Cora", "Lyle", "Meri", "Tilda"],
    age: "20-150, often older and steadier than strangers assume.",
    height: "Small, approachable, and hard to intimidate.",
    weight: "Light, sturdy, and travel-ready.",
    eyes: ["warm brown", "green", "hazel", "bright blue"],
    skin: ["sun-browned", "freckled", "warm brown", "rosy"],
    hair: ["curly brown", "sandy", "black curls", "chestnut"],
    appearance: "Practical clothes, quick smiles, road dust, and courage worn casually.",
  },
  "hexblood-rhw": {
    names: ["Briar", "Hester", "Marn", "Ori", "Thorn", "Ysolde"],
    age: "Any apparent adult age, often marked by the moment the bargain changed them.",
    height: "Humanlike, with an uncanny detail that draws the eye.",
    weight: "Humanlike, but describe tension, stillness, or fey oddity first.",
    eyes: ["green-gold", "black", "milk-white", "violet"],
    skin: ["moss-touched", "ashen", "warm brown with strange marks", "pale green tint"],
    hair: ["matted black", "flower-threaded", "white", "thorn-braided"],
    appearance: "A living crown, omen marks, fey scent, or beauty that feels one step wrong.",
  },
  "human-xphb": defaultSpeciesPattern,
  "kalashtar-efa": {
    names: ["Havra", "Keth", "Lashai", "Miraash", "Tariq", "Vashti"],
    age: "18-100, often with a maturity shaped by dream memory.",
    height: "Humanlike, usually calm and composed.",
    weight: "Humanlike, with body language that feels controlled.",
    eyes: ["deep violet", "soft gray", "black", "dream-blue"],
    skin: ["warm brown", "golden tan", "deep umber", "pale olive"],
    hair: ["black", "dark waves", "silver-streaked", "bound braids"],
    appearance: "Quiet intensity, faraway focus, and small signs of a second presence within.",
  },
  "khoravar-efa": {
    names: ["Aeren", "Dalia", "Joras", "Lyris", "Mavik", "Sana"],
    age: "20-180, often shaped by more than one home or tradition.",
    height: "Humanlike with elven grace.",
    weight: "Lean or balanced, depending on the culture they grew up in.",
    eyes: ["green", "hazel", "silver-gray", "dark brown"],
    skin: ["olive", "warm brown", "golden", "pale copper"],
    hair: ["black waves", "auburn", "silver-brown", "braided dark"],
    appearance: "Blended fashions, careful diplomacy, and details borrowed from two worlds.",
  },
  "lupin-rhw": {
    names: ["Bran", "Fen", "Kara", "Larka", "Rusk", "Tovan"],
    age: "18-90, often defined by pack bonds and watchful habits.",
    height: "Lean, alert, and built for motion.",
    weight: "Athletic, with practical muscle.",
    eyes: ["amber", "pale blue", "dark brown", "gold"],
    skin: ["furred gray", "furred brown", "black-and-white", "russet"],
    hair: ["mane-like", "short fur", "braided ruff", "silvered"],
    appearance: "Keen ears, restless attention, weathered travel gear, and protective posture.",
  },
  "orc-xphb": {
    names: ["Dench", "Gell", "Holg", "Murook", "Shump", "Volen"],
    age: "14-80, direct, urgent, and shaped by hard-won endurance.",
    height: "Tall, heavy, and physically direct.",
    weight: "Powerful and dense, built to push through danger.",
    eyes: ["black", "yellow", "brown", "red-brown"],
    skin: ["deep green", "gray-green", "brown", "ashen"],
    hair: ["black braids", "shaved sides", "topknot", "wild dark"],
    appearance: "Tusks, old injuries, heavy gear, and the look of someone hard to stop.",
  },
  "reborn-rhw": {
    names: ["Vesper", "Morrow", "Null", "Riven", "Ash", "Eidren"],
    age: "Any apparent age; true age may be missing, impossible, or counted since return.",
    height: "Whatever the old body was, now carried with unusual stillness.",
    weight: "Humanlike or strangely light/heavy for the frame.",
    eyes: ["clouded gray", "black", "dead blue", "faint gold"],
    skin: ["ashen", "stitched pale", "cool brown", "waxen"],
    hair: ["white from shock", "patchy black", "dusty brown", "shorn"],
    appearance: "A body with evidence of return: scars, still breathing, mismatched memories, or ritual repairs.",
  },
  "shifter-efa": {
    names: ["Bren", "Kessa", "Reth", "Sarra", "Tavik", "Yara"],
    age: "18-80, with instincts that sharpen under stress.",
    height: "Humanlike, usually wiry or powerful.",
    weight: "Athletic, compact, and ready to spring.",
    eyes: ["amber", "green", "gold", "dark brown"],
    skin: ["warm brown", "tan", "deep umber", "weathered"],
    hair: ["thick black", "brown mane", "red-brown", "wild gray"],
    appearance: "Animal tells, restless movement, and a controlled ferocity that surfaces in danger.",
  },
  "tiefling-xphb": {
    names: ["Akta", "Damakos", "Kallista", "Morthos", "Nyx", "Zariel"],
    age: "18-100, often old enough to have opinions about being judged.",
    height: "Humanlike, with horns, tail, or infernal elegance changing the silhouette.",
    weight: "Humanlike, from slight courtier to armored outsider.",
    eyes: ["solid gold", "red", "black", "white"],
    skin: ["crimson", "violet", "deep brown", "ashen blue"],
    hair: ["black", "white", "dark red", "silver"],
    appearance: "Horns, tail, infernal marks, dramatic clothes, and a practiced answer to suspicion.",
  },
  "warforged-efa": {
    names: ["Anvil", "Bastion", "Cipher", "Grit", "Lumen", "Vigil"],
    age: "Counted since awakening, service, repair, or the first independent choice.",
    height: "Built tall, compact, elegant, or utilitarian by design.",
    weight: "Heavy for size due to metal, stone, wood, or composite plating.",
    eyes: ["blue lenses", "amber lights", "green glow", "black glass"],
    skin: ["darkwood plating", "brass", "iron", "porcelain enamel"],
    hair: ["none", "cable braids", "engraved crest", "fiber cords"],
    appearance: "Plating, maker marks, replacement parts, and the question of whether they dress like a person or a tool.",
  },
};

const backgroundPatterns: Record<string, BackgroundPattern> = {
  "acolyte-xphb": {
    nameFrames: [
      (name) => `${name} Dawn-Votary`,
      (name) => `Brother ${name}`,
      (name) => `Sister ${name}`,
      (name) => `${name} Candlekeeper`,
      (name) => `${name} of the Quiet Bell`,
      (name) => `Novice ${name}`,
    ],
    alignments: ["Lawful Good", "Neutral Good", "Lawful Neutral", "True Neutral"],
    faiths: ["temple oath", "ancestor saints", "sun liturgy", "quiet heresy"],
    lifestyle: "Modest (1 GP/day)",
    personality: "Patient, ritual-minded, protective of the vulnerable, and slow to break vows.",
    backstory: "Temple service gave them a doctrine, a community, and one question faith cannot answer yet.",
  },
  "archaeologist-efa": {
    nameFrames: [(name) => `${name} Dustmark`, (name) => `Professor ${name}`, (name) => `${name} Relic-Hand`, (name) => `${name} of the Broken Map`],
    alignments: ["Neutral Good", "True Neutral", "Chaotic Neutral"],
    faiths: ["old gods", "lost empires", "skeptical scholarship"],
    lifestyle: "Modest (1 GP/day)",
    personality: "Curious, cautious around ruins, excited by inscriptions, and bad at leaving mysteries buried.",
    backstory: "A dig uncovered a truth that powerful people preferred forgotten.",
  },
  "artisan-xphb": {
    nameFrames: [(name) => `${name} Copperhand`, (name) => `${name} the Maker`, (name) => `Guild ${name}`, (name) => `${name} Truework`],
    alignments: ["Lawful Neutral", "Neutral Good", "True Neutral"],
    faiths: ["craft saints", "guild tradition", "honest work"],
    lifestyle: "Modest (1 GP/day)",
    personality: "Practical, precise, proud of good work, and impatient with waste.",
    backstory: "Their trade taught them who pays fairly, who cheats, and which tools become weapons.",
  },
  "charlatan-xphb": {
    nameFrames: [(name) => `${name} Vale`, (name) => `${name} the Gilded`, (name) => `Doctor ${name}`, (name) => `${name} No-Ledger`, (name) => `${name} Silkgrin`, (name) => `Captain ${name}`],
    alignments: ["Chaotic Neutral", "Neutral Evil", "True Neutral", "Chaotic Good"],
    faiths: ["luck", "a false patron", "no gods, only tells", "the next mark"],
    lifestyle: "Comfortable (2 GP/day)",
    personality: "Charming, evasive, quick with names, and always measuring what someone wants to hear.",
    backstory: "A false identity worked too well, and now the lie has enemies, debts, or believers.",
  },
  "criminal-xphb": {
    nameFrames: [(name) => `${name} Blacklane`, (name) => `${name} Lockwise`, (name) => `${name} Underbridge`, (name) => `${name} Red-Coin`],
    alignments: ["Chaotic Neutral", "Neutral Evil", "True Neutral"],
    faiths: ["street luck", "underworld codes", "a saint of thieves"],
    lifestyle: "Poor (2 SP/day)",
    personality: "Suspicious, resourceful, loyal once earned, and hard to corner.",
    backstory: "They left the underworld with a useful contact and a problem that knows their old name.",
  },
  "entertainer-xphb": {
    nameFrames: [(name) => `${name} Brightstage`, (name) => `${name} Applause`, (name) => `${name} the Mask`, (name) => `Maestro ${name}`],
    alignments: ["Chaotic Good", "Chaotic Neutral", "Neutral Good"],
    faiths: ["muses", "fame", "patron spirits", "the crowd"],
    lifestyle: "Modest (1 GP/day)",
    personality: "Expressive, dramatic under pressure, hungry for stories, and careful with public image.",
    backstory: "A performance changed someone's fate and turned applause into obligation.",
  },
  "farmer-xphb": {
    nameFrames: [(name) => `${name} Greenbarrow`, (name) => `${name} Fieldborn`, (name) => `${name} of the South Acres`, (name) => `${name} Hearthrow`],
    alignments: ["Neutral Good", "Lawful Good", "True Neutral"],
    faiths: ["harvest rites", "household gods", "seasonal spirits"],
    lifestyle: "Poor (2 SP/day)",
    personality: "Grounded, patient, stubbornly kind, and not impressed by titles.",
    backstory: "Something threatened ordinary people, and staying home stopped being harmless.",
  },
  "guard-xphb": {
    nameFrames: [(name) => `${name} Watchmark`, (name) => `${name} Gatehand`, (name) => `${name} Lantern-Post`, (name) => `Sergeant ${name}`],
    alignments: ["Lawful Good", "Lawful Neutral", "Neutral Good"],
    faiths: ["city oaths", "protective saints", "the law"],
    lifestyle: "Modest (1 GP/day)",
    personality: "Watchful, direct, protective, and used to noticing trouble before anyone thanks them.",
    backstory: "They saw a threat the official report ignored.",
  },
  "guide-xphb": {
    nameFrames: [(name) => `${name} Trailwise`, (name) => `${name} Mapless`, (name) => `${name} Greenpath`, (name) => `${name} Storm-Read`],
    alignments: ["Neutral Good", "True Neutral", "Chaotic Good"],
    faiths: ["road shrines", "nature spirits", "practical superstition"],
    lifestyle: "Modest (1 GP/day)",
    personality: "Calm outdoors, blunt indoors, protective of stragglers, and always checking the sky.",
    backstory: "They know a route others need and a place they swore never to revisit.",
  },
  "haunted-one-rhw": {
    nameFrames: [(name) => `${name} Hollow`, (name) => `${name} Blackwake`, (name) => `${name} of the Last Door`, (name) => `${name} Never-Sleep`],
    alignments: ["Neutral Good", "True Neutral", "Chaotic Neutral"],
    faiths: ["warding rites", "dead gods", "desperate prayers"],
    lifestyle: "Poor (2 SP/day)",
    personality: "Intense, wary of comfort, gentle with other victims, and sharp around omens.",
    backstory: "They survived a horror that still has a shape, a sign, or a voice.",
  },
  "hermit-xphb": {
    nameFrames: [(name) => `${name} Stillwater`, (name) => `${name} Farcell`, (name) => `${name} of the Quiet Stone`, (name) => `Old ${name}`],
    alignments: ["True Neutral", "Neutral Good", "Lawful Neutral"],
    faiths: ["solitude", "hidden revelation", "ascetic vows"],
    lifestyle: "Wretched (0 GP/day)",
    personality: "Soft-spoken, observant, uncomfortable with crowds, and certain about one strange truth.",
    backstory: "Isolation revealed a secret that adventure is finally forcing into the world.",
  },
  "investigator-rhw": {
    nameFrames: [(name) => `${name} Casefile`, (name) => `${name} Lens`, (name) => `${name} Cluewise`, (name) => `Inspector ${name}`],
    alignments: ["Lawful Good", "Neutral Good", "Lawful Neutral", "True Neutral"],
    faiths: ["truth", "justice", "cold reason"],
    lifestyle: "Modest (1 GP/day)",
    personality: "Patient, skeptical, detail-hungry, and unable to leave contradictions alone.",
    backstory: "One unresolved case keeps producing new bodies, symbols, or lies.",
  },
  "merchant-xphb": {
    nameFrames: [(name) => `${name} Goldroad`, (name) => `${name} Faircount`, (name) => `${name} Ledgerborn`, (name) => `Factor ${name}`],
    alignments: ["True Neutral", "Lawful Neutral", "Neutral Good"],
    faiths: ["fortune", "trade gods", "family contracts"],
    lifestyle: "Comfortable (2 GP/day)",
    personality: "Polite, calculating, generous when it creates trust, and always aware of risk.",
    backstory: "A deal, caravan, or debt put them on the road with more at stake than coin.",
  },
  "noble-xphb": {
    nameFrames: [(name) => `${name} Highmere`, (name) => `Lord ${name}`, (name) => `Lady ${name}`, (name) => `${name} of House Veyr`],
    alignments: ["Lawful Neutral", "Lawful Good", "Neutral Evil"],
    faiths: ["house chapel", "ancestral duty", "public piety"],
    lifestyle: "Wealthy (4 GP/day)",
    personality: "Polished, duty-bound, socially strategic, and burdened by a family expectation.",
    backstory: "Privilege gave them access, but inheritance brought a command they may reject.",
  },
  "sage-xphb": {
    nameFrames: [(name) => `${name} Quill`, (name) => `${name} Inkward`, (name) => `Archivist ${name}`, (name) => `${name} Star-Read`],
    alignments: ["True Neutral", "Neutral Good", "Lawful Neutral"],
    faiths: ["knowledge", "old libraries", "arcane theory"],
    lifestyle: "Modest (1 GP/day)",
    personality: "Analytical, distracted by lore, generous with answers, and dangerous when ignored.",
    backstory: "A text, map, or prophecy made danger personal.",
  },
  "sailor-xphb": {
    nameFrames: [(name) => `${name} Saltwake`, (name) => `${name} Tidehand`, (name) => `${name} Stormkeel`, (name) => `Boatswain ${name}`],
    alignments: ["Chaotic Good", "True Neutral", "Neutral Good"],
    faiths: ["sea gods", "storm omens", "crew luck"],
    lifestyle: "Modest (1 GP/day)",
    personality: "Practical, superstitious, loyal to crews, and quick to read changing weather.",
    backstory: "A voyage ended wrong, leaving a map, debt, wreck, or missing crewmate.",
  },
  "scribe-xphb": {
    nameFrames: [(name) => `${name} Redline`, (name) => `${name} Faircopy`, (name) => `Notary ${name}`, (name) => `${name} Sealhand`],
    alignments: ["Lawful Neutral", "True Neutral", "Lawful Good"],
    faiths: ["law", "history", "the written word"],
    lifestyle: "Modest (1 GP/day)",
    personality: "Precise, discreet, formal with language, and aware that words can ruin lives.",
    backstory: "They copied, witnessed, or altered a document someone would kill to recover.",
  },
  "soldier-xphb": {
    nameFrames: [(name) => `${name} Ironstep`, (name) => `${name} Battlewake`, (name) => `Corporal ${name}`, (name) => `${name} Redshield`],
    alignments: ["Lawful Neutral", "Lawful Good", "True Neutral"],
    faiths: ["fallen comrades", "war gods", "unit traditions"],
    lifestyle: "Modest (1 GP/day)",
    personality: "Disciplined, gallows-humored, protective in formation, and wary of easy orders.",
    backstory: "A campaign ended, but one command, survivor, or battlefield truth followed them home.",
  },
  "wayfarer-xphb": {
    nameFrames: [(name) => `${name} Roadworn`, (name) => `${name} No-Home`, (name) => `${name} Bridgewise`, (name) => `${name} Open-Sky`],
    alignments: ["Chaotic Good", "Chaotic Neutral", "True Neutral"],
    faiths: ["road shrines", "luck", "small kindnesses"],
    lifestyle: "Poor (2 SP/day)",
    personality: "Adaptable, wary of promises, kind to outsiders, and always ready to leave.",
    backstory: "The road taught survival, but a person or place finally made running feel unfinished.",
  },
};

const classPatterns: Record<string, ClassPattern> = {
  "artificer-efa": {
    personality: "Adds maker logic: they test ideas, name tools, and notice how objects fail.",
    notes: "Tie one invention, prototype, or repair scar to the character's current goal.",
  },
  "barbarian-xphb": {
    personality: "Adds raw presence: they speak plainly, protect fiercely, and remember insults physically.",
    notes: "Choose what their rage protects, not only what it destroys.",
  },
  "bard-xphb": {
    personality: "Adds performance instincts: they read rooms, collect stories, and weaponize timing.",
    notes: "Pick a song, scandal, patron, or audience they cannot forget.",
  },
  "cleric-xphb": {
    personality: "Adds sacred duty: even doubt becomes part of how they serve.",
    notes: "Name one rite they perform before danger or after victory.",
  },
  "druid-xphb": {
    personality: "Adds natural rhythm: they think in seasons, signs, and living consequences.",
    notes: "Choose a place, animal sign, or natural law they refuse to betray.",
  },
  "fighter-xphb": {
    personality: "Adds practiced discipline: they check exits, weigh reach, and trust repetition.",
    notes: "Give their training a source: mentor, regiment, arena, militia, or self-defense.",
  },
  "monk-xphb": {
    personality: "Adds restraint: movement, breath, and small rituals reveal their inner life.",
    notes: "Pick the lesson they understand and the lesson they keep failing.",
  },
  "paladin-xphb": {
    personality: "Adds oath pressure: they judge themselves by promises more than comfort.",
    notes: "Write the vow in one sentence and decide who first heard it.",
  },
  "ranger-xphb": {
    personality: "Adds watchfulness: they track patterns, speak sparingly, and prepare for terrain.",
    notes: "Choose a trail, prey, homeland, or threat that taught them vigilance.",
  },
  "rogue-xphb": {
    personality: "Adds edge and timing: they test locks, motives, exits, and trust.",
    notes: "Give them one rule they never break and one person who can make them break it.",
  },
  "sorcerer-xphb": {
    personality: "Adds volatility: emotion and magic are never fully separate.",
    notes: "Pick the first uncontrolled sign of power and who witnessed it.",
  },
  "warlock-xphb": {
    personality: "Adds bargain logic: every gift has a shadow, and they know it.",
    notes: "Define what the patron wants next, even if the character is pretending not to know.",
  },
  "wizard-xphb": {
    personality: "Adds study habits: they annotate, compare, prepare, and fear ignorance more than pain.",
    notes: "Pick a forbidden note, mentor, school, or failed spell that shaped the spellbook.",
  },
};

export function getPersonalDetailsRecommendations({
  species,
  background,
  characterClass,
  alignment,
}: {
  species?: BuilderSpecies;
  background?: BuilderBackground;
  characterClass?: BuilderClass;
  alignment?: string;
}): PersonalDetailsRecommendations {
  const speciesPattern = species ? speciesPatterns[species.id] ?? defaultSpeciesPattern : defaultSpeciesPattern;
  const backgroundPattern = background
    ? backgroundPatterns[background.id] ?? backgroundPatterns["wayfarer-xphb"]
    : backgroundPatterns["wayfarer-xphb"];
  const classPattern = characterClass ? classPatterns[characterClass.id] : undefined;
  const resolvedAlignment = alignment || backgroundPattern.alignments[0] || "True Neutral";
  const names = speciesPattern.names
    .slice(0, 6)
    .map((name, index) => backgroundPattern.nameFrames[index % backgroundPattern.nameFrames.length](name));
  const titleParts = [species?.name, background?.name, characterClass?.name].filter(Boolean);
  const appearance = `${speciesPattern.appearance} ${backgroundPattern.personality}`;
  const personality = classPattern
    ? `${backgroundPattern.personality} ${classPattern.personality}`
    : backgroundPattern.personality;
  const backstory = `${backgroundPattern.backstory} ${resolvedAlignment} choices should shape the cost, mercy, and risk they accept.`;
  const notes = classPattern?.notes ?? "Add one bond, one fear, one unfinished promise, and one question for the DM.";

  return {
    title: titleParts.length ? titleParts.join(" / ") : "Open character concept",
    names,
    alignments: backgroundPattern.alignments,
    faiths: backgroundPattern.faiths,
    lifestyle: backgroundPattern.lifestyle,
    age: `${speciesPattern.age} ${background ? background.name : "The chosen past"} suggests: ${backgroundPattern.backstory}`,
    height: speciesPattern.height,
    weight: speciesPattern.weight,
    eyes: speciesPattern.eyes,
    skin: speciesPattern.skin,
    hair: speciesPattern.hair,
    appearance,
    personality,
    backstory,
    notes,
    suggestions: buildSuggestionSet({
      species,
      background,
      characterClass,
      speciesPattern,
      backgroundPattern,
      classPattern,
      alignment: resolvedAlignment,
      base: { appearance, personality, backstory, notes },
    }),
  };
}

function buildSuggestionSet({
  species,
  background,
  characterClass,
  speciesPattern,
  backgroundPattern,
  classPattern,
  alignment,
  base,
}: {
  species?: BuilderSpecies;
  background?: BuilderBackground;
  characterClass?: BuilderClass;
  speciesPattern: SpeciesPattern;
  backgroundPattern: BackgroundPattern;
  classPattern?: ClassPattern;
  alignment: string;
  base: {
    appearance: string;
    personality: string;
    backstory: string;
    notes: string;
  };
}): PersonalDetailsRecommendations["suggestions"] {
  const speciesName = species?.name ?? "their species";
  const backgroundName = background?.name ?? "chosen background";
  const className = characterClass?.name ?? "adventuring role";
  const speciesGuard = getSpeciesGuard(species);
  const context: SuggestionContext = {
    speciesName,
    backgroundName,
    className,
    alignment,
    speciesGuard,
    speciesHooks: getSpeciesLoreHooks(species, speciesPattern),
    backgroundHooks: getBackgroundLoreHooks(background, backgroundPattern),
    classHooks: getClassLoreHooks(characterClass, classPattern),
    alignmentHooks: getAlignmentHooks(alignment),
  };

  return {
    aparencia: composeSuggestions(base.appearance, context, appearanceDetails, (part) =>
      `${part.opening}, ${part.speciesHook} shapes the silhouette through ${part.detail}. Let the ${part.backgroundName} past show as ${part.backgroundHook}, while ${part.alignmentHook}.`,
    ),
    personalidade: composeSuggestions(base.personality, context, personalityDetails, (part) =>
      `${part.opening}, ${part.backgroundHook} becomes a habit: ${part.detail}. As a ${part.speciesName}, ${part.speciesGuard} Under ${part.alignment} pressure, ${part.alignmentHook}.`,
    ),
    historia: composeSuggestions(base.backstory, context, historyDetails, (part) =>
      `${part.opening}, ${part.backgroundHook} did more than mark the past; it taught them ${part.detail}. Their ${part.speciesName} history adds ${part.speciesHook}, and the ${part.className} path adds ${part.classHook}. A ${part.alignment} choice decides what they now protect, exploit, or refuse.`,
    ),
    notas: composeSuggestions(base.notes, context, noteDetails, (part) =>
      `${part.opening}, write one table-ready note about ${part.detail}. Connect ${part.classHook} to ${part.backgroundName}, anchor it in ${part.speciesHook}, and let ${part.alignmentHook}.`,
    ),
  };
}

interface SuggestionContext {
  speciesName: string;
  backgroundName: string;
  className: string;
  alignment: string;
  speciesGuard: string;
  speciesHooks: string[];
  backgroundHooks: string[];
  classHooks: string[];
  alignmentHooks: string[];
}

interface SuggestionPart extends SuggestionContext {
  opening: string;
  detail: string;
  speciesHook: string;
  backgroundHook: string;
  classHook: string;
  alignmentHook: string;
}

const suggestionOpenings = [
  "At first glance",
  "Under torchlight",
  "In crowded rooms",
  "Before danger",
  "After mercy",
  "When cornered",
  "On festival nights",
  "During negotiations",
  "Near old ruins",
  "Around children",
  "With bitter rivals",
  "Among trusted allies",
  "Beside shrines",
  "Inside taverns",
  "On watch",
  "Under hard rain",
  "Across market stalls",
  "Before spellwork",
  "After betrayal",
  "When praised",
  "Facing nobles",
  "Near graves",
  "Crossing borders",
  "During repairs",
  "Before oaths",
  "After failures",
  "In careful silence",
  "At crossroads",
  "When accused",
  "Beside campfires",
  "During storms",
  "At city gates",
  "Among strangers",
  "When wounded",
  "After bargains",
  "Inside libraries",
  "At sea",
  "In wild country",
  "Near closed doors",
  "Over shared meals",
  "Before dawn",
  "Past midnight",
  "With old friends",
  "Around authority",
  "During celebrations",
  "After lost causes",
  "When challenged",
  "At the threshold",
  "Behind a smile",
  "Without witnesses",
];

const appearanceDetails = [
  "one unmistakable feature no disguise or armor quite hides",
  "a carefully chosen color, tool, scar, or keepsake",
  "a posture learned from danger rather than fashion",
  "a visible contradiction between polish and survival",
  "small ritual marks that make strangers look twice",
  "equipment arranged like a memory palace",
  "a silhouette that tells the table what they fear losing",
  "a travel habit that has become part of the body",
  "hands, eyes, or voice carrying the first clue",
  "clothes that reveal who paid, who lied, or who left",
];

const personalityDetails = [
  "answering kindness with suspicion before choosing trust",
  "testing every promise for hidden cost",
  "making jokes only when the room becomes dangerous",
  "protecting one taboo even when it costs advantage",
  "collecting names, exits, and favors in the same breath",
  "turning shame into preparation instead of confession",
  "refusing comfort that feels like a trap",
  "showing mercy in a way that still looks practical",
  "letting one person see the fear behind the performance",
  "treating beauty, truth, and leverage as separate tools",
];

const historyDetails = [
  "which lie became useful, which truth became expensive, and who still remembers",
  "why the road is safer than the place that should have been home",
  "what price they paid before they understood the contract",
  "how one rescued stranger became a liability or a vow",
  "why a respectable name is more dangerous than a criminal one",
  "which object, omen, or witness can still expose the old wound",
  "what they learned to fake before learning what they actually wanted",
  "how survival became a philosophy instead of a habit",
  "why the next job feels like freedom and punishment at once",
  "which mercy ruined a perfect plan",
];

const noteDetails = [
  "a recurring phrase the DM can hand back under pressure",
  "a contact who knows the old version of the character",
  "a taboo that blocks one easy solution",
  "a physical tell that appears before a risky choice",
  "a keepsake with a practical use and an emotional cost",
  "a public rumor that is half true for the wrong reason",
  "a private rule that explains one brave mistake",
  "a place name that should make the player sit forward",
  "a debt that can be called in without warning",
  "a harmless habit that becomes evidence later",
];

function composeSuggestions(
  first: string,
  context: SuggestionContext,
  details: string[],
  build: (part: SuggestionPart) => string,
): string[] {
  const suggestions = [first];

  for (let index = 0; suggestions.length < SUGGESTION_COUNT; index += 1) {
    suggestions.push(
      build({
        ...context,
        opening: pick(suggestionOpenings, index),
        detail: pick(details, index, 2),
        speciesHook: pick(context.speciesHooks, index, 1),
        backgroundHook: pick(context.backgroundHooks, index, 3),
        classHook: pick(context.classHooks, index, 5),
        alignmentHook: pick(context.alignmentHooks, index, 7),
      }),
    );
  }

  return suggestions;
}

function pick<T>(items: T[], index: number, offset = 0): T {
  return items[(index + offset) % items.length];
}

function getSpeciesLoreHooks(
  species: BuilderSpecies | undefined,
  pattern: SpeciesPattern,
): string[] {
  switch (species?.id) {
    case "elf-xphb":
      return [
        "Trance memories making old grief feel freshly polished",
        "long-lived patience that treats mortal urgency as a warning sign",
        "ancestral art, wild magic, or court etiquette carried in tiny gestures",
        "ageless poise cracked only by beauty, insult, or unfinished duty",
      ];
    case "hexblood-rhw":
      return [
        "their living crown tightening near broken promises",
        "an old fey bargain leaving omens in mirrors, milk, or rainwater",
        "hag-touched beauty making kindness feel slightly dangerous",
        "a briar mark blooming whenever a confident lie enters the room",
        "the scent of moss, iron, and a bargain not yet paid",
      ];
    case "changeling-efa":
      return [
        "one unchanged feature acting as a private anchor",
        "a borrowed face chosen for safety rather than vanity",
        "the habit of rehearsing identity before entering a room",
        "a true voice kept for people who have earned the risk",
      ];
    case "reborn-rhw":
      return [
        "returned memories arriving as fragments instead of answers",
        "ritual scars that make the body read like a sealed document",
        "stillness that unnerves healers, priests, and former friends",
        "a missing death story that keeps demanding witnesses",
      ];
    case "warforged-efa":
      return [
        "maker marks placed where a heartbeat would be expected",
        "repair lines treated like biography rather than damage",
        "the question of whether adornment is camouflage or selfhood",
        "a constructed body learning which comforts are chosen, not installed",
      ];
    case "kalashtar-efa":
      return [
        "a second presence guiding instinct before words arrive",
        "dream-memory discipline visible in posture and restraint",
        "quiet resistance to invasive thoughts, bargains, or easy certainty",
        "a calm gaze that seems to consult someone just out of sight",
      ];
    case "dragonborn-xphb":
      return [
        "scale patterns turning ancestry into a visible declaration",
        "elemental tells escaping through breath, temper, or ritual",
        "clan pride balanced against the need to become more than a name",
        "a draconic silhouette that makes reputation arrive first",
      ];
    case "dwarf-xphb":
      return [
        "craft marks and clan memory carried with stubborn precision",
        "a grudge polished into practical caution",
        "stone-sense shaping how they judge homes, promises, and people",
        "jewelry or braids recording debts no ledger could hold",
      ];
    case "gnome-xphb":
      return [
        "restless curiosity turning every quiet moment into a tiny experiment",
        "ink stains and clever gadgets betraying the next question",
        "a bright laugh used to test danger before naming it",
        "small hands always mapping hinges, seams, locks, and exits",
      ];
    case "goliath-xphb":
      return [
        "trophy scars measured against climbs, contests, and storms",
        "a mountain-born respect for effort over title",
        "stone-like markings that make endurance visible",
        "the habit of turning challenge into introduction",
      ];
    case "halfling-xphb":
      return [
        "ordinary courage worn so casually strangers underestimate it",
        "road dust, hospitality, and a hard line about bullies",
        "small comforts protected with startling ferocity",
        "luck treated as a relationship rather than a miracle",
      ];
    case "tiefling-xphb":
      return [
        "horns, tail, or infernal marks answered with practiced composure",
        "a dramatic silhouette built before strangers can define them",
        "old suspicion converted into social armor",
        "a private answer to every public superstition",
      ];
    default:
      return [
        pattern.appearance,
        "species lore changing posture, taboos, and first impressions",
        "family, homeland, or body history making one ordinary habit specific",
        "a visible feature that creates story before dialogue begins",
      ];
  }
}

function getBackgroundLoreHooks(
  background: BuilderBackground | undefined,
  pattern: BackgroundPattern,
): string[] {
  switch (background?.id) {
    case "charlatan-xphb":
      return [
        "a false identity with its own friends, enemies, and unpaid rooms",
        "the mark who believed the con too sincerely",
        "an alias registered in a city they cannot safely revisit",
        "debts hidden under perfume, forged seals, and perfect handwriting",
        "the habit of hearing what a room wants before deciding what to sell",
      ];
    case "acolyte-xphb":
      return [
        "a temple lesson that still interrupts easy choices",
        "a sacred duty complicated by doubt rather than erased by it",
        "a ritual phrase that survives even when faith wavers",
        "a community they protect, disappoint, or secretly question",
      ];
    case "criminal-xphb":
      return [
        "an underworld contact who knows the old name",
        "a rule from the street that matters more than law",
        "one job that ended with mercy where profit should have been",
        "a hidden route, fence, or favor that can become trouble",
      ];
    case "haunted-one-rhw":
      return [
        "a surviving horror with a sign the character cannot ignore",
        "warding habits learned from fear and refined into discipline",
        "compassion for victims sharpened by private dread",
        "a voice, symbol, or threshold that still changes the room",
      ];
    case "wayfarer-xphb":
      return [
        "a road lesson about kindness that never felt sentimental",
        "the instinct to leave before comfort becomes a cage",
        "a bridge, alley, or shrine that feels more honest than home",
        "a survival habit that now reads as quiet generosity",
      ];
    default:
      return [
        pattern.backstory,
        pattern.personality,
        "a past profession leaving useful contacts, debts, and habits",
        "one ordinary routine made sharp by the life they came from",
      ];
  }
}

function getClassLoreHooks(
  characterClass: BuilderClass | undefined,
  pattern: ClassPattern | undefined,
): string[] {
  switch (characterClass?.id) {
    case "artificer-efa":
      return [
        "a prototype that only works when the stakes become personal",
        "a repair scar etched into their favorite tool",
        "maker logic turning fear into schematics",
        "an invention named after the first person it failed to save",
        "tool marks revealing what they value before they say it",
      ];
    case "rogue-xphb":
      return [
        "a rule they never break unless one person is in danger",
        "lockpicks, exits, and motives checked in the same glance",
        "timing learned from hunger, pursuit, or impossible odds",
        "a clean getaway they regret more than a failed one",
      ];
    case "cleric-xphb":
      return [
        "a rite performed before danger even when doubt is louder",
        "a holy symbol treated like burden and shelter at once",
        "mercy measured against doctrine instead of convenience",
        "a prayer that changes meaning after every hard choice",
      ];
    case "druid-xphb":
      return [
        "seasonal thinking that judges actions by what they make possible later",
        "an animal sign or natural law they refuse to betray",
        "a place remembered as teacher rather than property",
        "wild patience that can look like indifference until it moves",
      ];
    case "wizard-xphb":
      return [
        "a margin note that became more dangerous than the spell",
        "study habits built from awe, fear, and pride",
        "a forbidden question that makes ignorance feel unbearable",
        "prepared magic organized like an argument with the future",
      ];
    default:
      return [
        pattern?.notes ?? "their current goal giving the DM one usable hook",
        pattern?.personality ?? "their adventuring role changing how they solve pressure",
        "a class feature expressed as habit before it becomes mechanics",
        "training, talent, or power leaving a visible table cue",
      ];
  }
}

function getAlignmentHooks(alignment: string): string[] {
  const lower = alignment.toLowerCase();

  if (lower.includes("chaotic") && lower.includes("neutral")) {
    return [
      "freedom matters more than reputation",
      "loyalty stays personal instead of institutional",
      "rules become tools, warnings, or targets depending on who is harmed",
      "curiosity wins whenever safety and control start sounding alike",
    ];
  }

  if (lower.includes("chaotic") && lower.includes("good")) {
    return [
      "mercy outruns procedure when someone vulnerable is cornered",
      "authority proves itself before receiving obedience",
      "personal kindness matters more than clean approval",
      "a broken rule feels justified only when it protects someone real",
    ];
  }

  if (lower.includes("lawful") && lower.includes("good")) {
    return [
      "duty and compassion argue until both become sharper",
      "promises remain binding even when no one is watching",
      "mercy seeks structure instead of impulse",
      "a hard order demands conscience before obedience",
    ];
  }

  if (lower.includes("lawful")) {
    return [
      "order becomes the tool they trust when emotions run hot",
      "contracts, oaths, or traditions reveal what they will not cheapen",
      "procedure protects them from becoming the threat",
      "reputation matters because it keeps promises legible",
    ];
  }

  if (lower.includes("evil")) {
    return [
      "need, pride, or revenge justify costs they still notice",
      "mercy appears only when it buys leverage or protects an obsession",
      "trust becomes a scarce resource spent with calculation",
      "power feels safer than being understood",
    ];
  }

  if (lower.includes("good")) {
    return [
      "kindness remains practical instead of naive",
      "risk makes sense when another person would otherwise pay it",
      "compassion survives suspicion, hunger, and fear",
      "a small mercy becomes the clearest proof of who they are",
    ];
  }

  return [
    `${alignment} instincts make survival, loyalty, and curiosity negotiate every choice`,
    `${alignment} pressure turn certainty into a question the table can test`,
    `${alignment} choices show what they protect when reward and safety split`,
    `${alignment} priorities decide which debt, truth, or person comes first`,
  ];
}

function getSpeciesGuard(species: BuilderSpecies | undefined): string {
  if (species?.id === "elf-xphb") {
    return "their trance, long memory, and ageless poise shape habits without ordinary bedtime rituals.";
  }

  if (species?.id === "warforged-efa") {
    return "their constructed body, repairs, and maker marks shape how they read comfort and identity.";
  }

  if (species?.id === "changeling-efa") {
    return "identity is practiced, chosen, and sometimes protected behind a familiar face.";
  }

  if (species?.id === "reborn-rhw") {
    return "fragmented memory and returned existence make small routines feel deliberate.";
  }

  return "their lore should change body language, taboos, instincts, and social habits.";
}

export function buildPersonalDetailsFieldHelp(
  recommendations: PersonalDetailsRecommendations,
): Record<
  | "nome"
  | "alinhamento"
  | "faith"
  | "lifestyle"
  | "age"
  | "gender"
  | "height"
  | "weight"
  | "eyes"
  | "skin"
  | "hair"
  | "aparencia"
  | "personalidade"
  | "tracos"
  | "historia"
  | "notas",
  string
> {
  return {
    nome: `Think about the character you want to build from the choices already made. Name ideas for ${recommendations.title}: ${recommendations.names.join(", ")}.`,
    alinhamento: `Recommended alignments for this combination: ${recommendations.alignments.join(", ")}. Pick the one that best explains their choices under pressure.`,
    faith: `Faith ideas: ${recommendations.faiths.join(", ")}. This can be devotion, doubt, philosophy, patronage, or a private ritual.`,
    lifestyle: `A fitting default is ${recommendations.lifestyle}, adjusted upward or downward if the story says they are hiding wealth, in exile, or sponsored.`,
    age: recommendations.age,
    gender: "Use the identity that makes the character clear at the table. It can be simple, specific, fluid, unknown, or irrelevant to the concept.",
    height: recommendations.height,
    weight: recommendations.weight,
    eyes: `Eye ideas: ${recommendations.eyes.join(", ")}.`,
    skin: `Skin ideas: ${recommendations.skin.join(", ")}.`,
    hair: `Hair ideas: ${recommendations.hair.join(", ")}.`,
    aparencia: recommendations.appearance,
    personalidade: recommendations.personality,
    tracos: recommendations.backstory,
    historia: recommendations.backstory,
    notas: recommendations.notes,
  };
}
