import type { BuilderBackground, BuilderClass, BuilderSpecies } from "@/types/builder";

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
}

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
}: {
  species?: BuilderSpecies;
  background?: BuilderBackground;
  characterClass?: BuilderClass;
}): PersonalDetailsRecommendations {
  const speciesPattern = species ? speciesPatterns[species.id] ?? defaultSpeciesPattern : defaultSpeciesPattern;
  const backgroundPattern = background
    ? backgroundPatterns[background.id] ?? backgroundPatterns["wayfarer-xphb"]
    : backgroundPatterns["wayfarer-xphb"];
  const classPattern = characterClass ? classPatterns[characterClass.id] : undefined;
  const names = speciesPattern.names
    .slice(0, 6)
    .map((name, index) => backgroundPattern.nameFrames[index % backgroundPattern.nameFrames.length](name));
  const titleParts = [species?.name, background?.name, characterClass?.name].filter(Boolean);

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
    appearance: `${speciesPattern.appearance} ${backgroundPattern.personality}`,
    personality: classPattern
      ? `${backgroundPattern.personality} ${classPattern.personality}`
      : backgroundPattern.personality,
    backstory: backgroundPattern.backstory,
    notes: classPattern?.notes ?? "Add one bond, one fear, one unfinished promise, and one question for the DM.",
  };
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
    notas: recommendations.notes,
  };
}
