export const GUIDED_CHOICE_QUESTION_COUNT = 7;

export interface GuidedChoiceQuizOption {
  id: string;
  label: string;
  flavor: string;
  weights: Record<string, number>;
}

export interface GuidedChoiceQuizQuestion {
  id: string;
  prompt: string;
  helper: string;
  options: GuidedChoiceQuizOption[];
}

export interface GuidedChoiceQuizRecommendation {
  recommendedIds: string[];
  reasons: Record<string, string[]>;
}

export const speciesQuizPitches: Record<string, string> = {
  "aasimar-xphb":
    "Aasimar carry celestial power. Pick one if your character should feel touched by prophecy, mercy, radiance, or a burden to stand against darkness.",
  "changeling-efa":
    "Changelings reshape identity itself. Pick one if disguise, social tension, secret lives, and reinvention are central to the character.",
  "dragonborn-xphb":
    "Dragonborn bring elemental breath and a proud draconic presence. Pick one for a bold hero whose ancestry should feel unmistakable in every scene.",
  "dwarf-xphb":
    "Dwarves are sturdy, enduring, and grounded in craft or clan. Pick one for a resilient character built around loyalty, grit, and tradition.",
  "elf-xphb":
    "Elves blend grace, perception, and otherworldly history. Pick one for a character who should feel ancient, elegant, magical, or tied to the wild.",
  "gnome-xphb":
    "Gnomes are curious, clever, and difficult to fool. Pick one for an inventive character who solves danger through wit and wonder.",
  "goliath-xphb":
    "Goliaths are powerful survivors shaped by giant ancestry. Pick one for a character who should feel physically imposing and hard to break.",
  "halfling-xphb":
    "Halflings turn courage and luck into survival. Pick one for a warm, brave character who stays steady when larger heroes panic.",
  "hexblood-rhw":
    "Hexbloods carry eerie fey marks and bargain-born mystery. Pick one for a character with unsettling magic and a story full of debts.",
  "human-xphb":
    "Humans are flexible and driven. Pick one if you want the broadest narrative canvas and a character defined more by choices than ancestry.",
  "kalashtar-efa":
    "Kalashtar are linked to dream spirits. Pick one for an introspective character guided by visions, empathy, or a quiet psychic edge.",
  "khoravar-efa":
    "Khoravar stand between cultures. Pick one for a bridge-builder, diplomat, wanderer, or hero shaped by belonging to more than one world.",
  "lupin-rhw":
    "Lupins bring keen senses and pack-minded loyalty. Pick one for a vigilant companion who tracks threats and protects their circle.",
  "orc-xphb":
    "Orcs are forceful, relentless, and hard to stop. Pick one for a character who meets danger head-on and refuses to stay down.",
  "reborn-rhw":
    "Reborn characters returned changed. Pick one when memory, death, unfinished business, or uncanny survival should define the story.",
  "shifter-efa":
    "Shifters reveal an inner beast under pressure. Pick one for a character who balances instinct, restraint, and sudden ferocity.",
  "tiefling-xphb":
    "Tieflings carry fiendish legacy without being defined by it. Pick one for a dramatic outsider with infernal flair and personal defiance.",
  "warforged-efa":
    "Warforged are living constructs searching for purpose. Pick one for a durable character exploring duty, identity, and what makes a soul.",
};

export const backgroundQuizPitches: Record<string, string> = {
  "acolyte-xphb":
    "Acolyte fits characters shaped by temples, doctrine, service, and spiritual duty before the adventure began.",
  "archaeologist-efa":
    "Archaeologist fits explorers who chase ruins, lost empires, artifacts, and the thrill of uncovering what history buried.",
  "artisan-xphb":
    "Artisan fits makers, tradespeople, and practical experts whose hands already built a life before they drew a blade.",
  "charlatan-xphb":
    "Charlatan fits charming frauds, false identities, and characters who know how to survive by selling a story.",
  "criminal-xphb":
    "Criminal fits underworld survivors with contacts, instincts, and a past that might still come collecting.",
  "entertainer-xphb":
    "Entertainer fits performers who understand crowds, timing, masks, applause, and the power of a memorable entrance.",
  "farmer-xphb":
    "Farmer fits humble heroes grounded in work, community, endurance, and a life close to soil and seasons.",
  "guard-xphb":
    "Guard fits watchful protectors trained by patrols, walls, discipline, and the habit of spotting trouble early.",
  "guide-xphb":
    "Guide fits pathfinders, scouts, and practical survivors who know how to move through harsh places safely.",
  "haunted-one-rhw":
    "Haunted One fits characters marked by horror, loss, curses, or a mystery they cannot outrun.",
  "hermit-xphb":
    "Hermit fits seekers who withdrew from society and returned with insight, secrets, or unsettling certainty.",
  "investigator-rhw":
    "Investigator fits truth-hunters who read clues, question motives, and keep pulling when a mystery resists.",
  "merchant-xphb":
    "Merchant fits dealmakers, travelers, and practical negotiators who understand value, leverage, and risk.",
  "noble-xphb":
    "Noble fits characters raised around titles, etiquette, obligation, privilege, and the expectations of a family name.",
  "sage-xphb":
    "Sage fits scholars, researchers, and lorekeepers who solve danger by knowing what others forgot.",
  "sailor-xphb":
    "Sailor fits characters shaped by ships, storms, crews, strange ports, and the discipline of surviving the sea.",
  "scribe-xphb":
    "Scribe fits record-keepers, legal minds, translators, and quiet observers who know that words can move kingdoms.",
  "soldier-xphb":
    "Soldier fits veterans trained by command, drills, battlefields, and the costs of following or giving orders.",
  "wayfarer-xphb":
    "Wayfarer fits streetwise wanderers, refugees, pilgrims, and travelers who learned to survive between safe places.",
};

export const speciesQuizQuestionPool: GuidedChoiceQuizQuestion[] = [
  {
    id: "species-place-in-world",
    prompt: "When you imagine this character entering a room, what should people notice first?",
    helper: "Answer as the character you want to build, not as yourself.",
    options: [
      {
        id: "species-place-in-world-commanding",
        label: "A proud, unmistakable presence",
        flavor: "The character's ancestry should feel dramatic on sight.",
        weights: { "dragonborn-xphb": 3, "goliath-xphb": 2, "orc-xphb": 2 },
      },
      {
        id: "species-place-in-world-graceful",
        label: "Grace, calm, and a touch of magic",
        flavor: "The room gets quieter because the character feels otherworldly.",
        weights: { "elf-xphb": 3, "aasimar-xphb": 2, "kalashtar-efa": 2 },
      },
      {
        id: "species-place-in-world-hidden",
        label: "Nothing obvious until it is too late",
        flavor: "Blending in is part of the concept.",
        weights: { "changeling-efa": 3, "halfling-xphb": 2, "gnome-xphb": 1 },
      },
      {
        id: "species-place-in-world-outsider",
        label: "That they do not quite belong",
        flavor: "The character is shaped by being watched, judged, or misunderstood.",
        weights: { "tiefling-xphb": 3, "reborn-rhw": 2, "hexblood-rhw": 2 },
      },
    ],
  },
  {
    id: "species-survival-instinct",
    prompt: "A monster breaks through the camp at midnight. What kind of body should your character trust?",
    helper: "This points toward durability, agility, senses, or supernatural resilience.",
    options: [
      {
        id: "species-survival-instinct-sturdy",
        label: "A body that can take the hit",
        flavor: "Hard to move, harder to break.",
        weights: { "dwarf-xphb": 3, "goliath-xphb": 3, "warforged-efa": 2 },
      },
      {
        id: "species-survival-instinct-fast",
        label: "A body that moves before danger lands",
        flavor: "Speed and reaction matter more than armor.",
        weights: { "elf-xphb": 2, "halfling-xphb": 2, "shifter-efa": 2 },
      },
      {
        id: "species-survival-instinct-senses",
        label: "Keen senses that catch the threat first",
        flavor: "The best defense is noticing the ambush.",
        weights: { "lupin-rhw": 3, "orc-xphb": 2, "elf-xphb": 1 },
      },
      {
        id: "species-survival-instinct-uncanny",
        label: "Something uncanny that refuses to die",
        flavor: "Survival feels stranger than ordinary toughness.",
        weights: { "reborn-rhw": 3, "hexblood-rhw": 2, "aasimar-xphb": 1 },
      },
    ],
  },
  {
    id: "species-story-theme",
    prompt: "Which story theme should the species reinforce?",
    helper: "Species should support the fantasy you want to roleplay across many sessions.",
    options: [
      {
        id: "species-story-theme-duty",
        label: "Duty, legacy, and community",
        flavor: "A character carrying a people, clan, or oath in their bones.",
        weights: { "dwarf-xphb": 3, "dragonborn-xphb": 2, "human-xphb": 2 },
      },
      {
        id: "species-story-theme-identity",
        label: "Identity, masks, and reinvention",
        flavor: "Who the character is may be the central mystery.",
        weights: { "changeling-efa": 3, "reborn-rhw": 2, "khoravar-efa": 2 },
      },
      {
        id: "species-story-theme-instinct",
        label: "Instinct, nature, and inner hunger",
        flavor: "The character has something wild to master.",
        weights: { "shifter-efa": 3, "lupin-rhw": 2, "orc-xphb": 2 },
      },
      {
        id: "species-story-theme-fate",
        label: "Prophecy, dreams, and supernatural signs",
        flavor: "The character's life feels touched by forces beyond them.",
        weights: { "aasimar-xphb": 3, "kalashtar-efa": 3, "hexblood-rhw": 1 },
      },
    ],
  },
  {
    id: "species-social-fit",
    prompt: "How should your character handle society?",
    helper: "Think about the campaign scenes where the party negotiates, hides, or asks for help.",
    options: [
      {
        id: "species-social-fit-adapt",
        label: "Adapt to any place and keep moving",
        flavor: "The species should not lock the character into one social role.",
        weights: { "human-xphb": 3, "khoravar-efa": 2, "halfling-xphb": 1 },
      },
      {
        id: "species-social-fit-charm",
        label: "Win people over with warmth or wit",
        flavor: "Small talk, humor, and trust open doors.",
        weights: { "halfling-xphb": 3, "gnome-xphb": 2, "khoravar-efa": 2 },
      },
      {
        id: "species-social-fit-awe",
        label: "Let awe or fear do some of the work",
        flavor: "The character's presence changes the negotiation before words begin.",
        weights: { "dragonborn-xphb": 2, "tiefling-xphb": 2, "aasimar-xphb": 2 },
      },
      {
        id: "species-social-fit-apart",
        label: "Stay apart and be hard to read",
        flavor: "Distance, restraint, and mystery are features, not bugs.",
        weights: { "warforged-efa": 3, "kalashtar-efa": 2, "reborn-rhw": 2 },
      },
    ],
  },
  {
    id: "species-power-source",
    prompt: "If the species adds a supernatural edge, what should it feel like?",
    helper: "This narrows radiant, infernal, fey, psychic, and constructed fantasies.",
    options: [
      {
        id: "species-power-source-radiant",
        label: "Radiant, merciful, and difficult to hide",
        flavor: "A light that asks the character to do more.",
        weights: { "aasimar-xphb": 3, "human-xphb": 1 },
      },
      {
        id: "species-power-source-infernal",
        label: "Infernal, dramatic, and defiant",
        flavor: "Legacy is not destiny, but it is never ignored.",
        weights: { "tiefling-xphb": 3, "hexblood-rhw": 1 },
      },
      {
        id: "species-power-source-dream",
        label: "Dreamlike, psychic, or inward",
        flavor: "The character senses truths others miss.",
        weights: { "kalashtar-efa": 3, "gnome-xphb": 1 },
      },
      {
        id: "species-power-source-made",
        label: "Built, forged, or altered",
        flavor: "The character's body is part of the question.",
        weights: { "warforged-efa": 3, "reborn-rhw": 2, "changeling-efa": 1 },
      },
    ],
  },
  {
    id: "species-home",
    prompt: "Where does this character feel most natural?",
    helper: "Home is not just geography; it tells you what kind of scenes feel right.",
    options: [
      {
        id: "species-home-cavern",
        label: "Stone halls, workshops, and old roads",
        flavor: "Craft, endurance, and memory matter.",
        weights: { "dwarf-xphb": 3, "gnome-xphb": 2, "warforged-efa": 1 },
      },
      {
        id: "species-home-wild",
        label: "Forests, trails, and places with no map",
        flavor: "The wild is a companion, not a threat.",
        weights: { "elf-xphb": 3, "shifter-efa": 2, "lupin-rhw": 2 },
      },
      {
        id: "species-home-city",
        label: "Cities, crossroads, and crowded inns",
        flavor: "People are the terrain this character understands.",
        weights: { "human-xphb": 3, "halfling-xphb": 2, "changeling-efa": 2 },
      },
      {
        id: "species-home-border",
        label: "Borders between worlds or cultures",
        flavor: "The character belongs in liminal spaces.",
        weights: { "khoravar-efa": 3, "tiefling-xphb": 2, "hexblood-rhw": 2 },
      },
    ],
  },
  {
    id: "species-conflict",
    prompt: "What personal conflict sounds most interesting to play?",
    helper: "The best species choice often gives the player a question to explore.",
    options: [
      {
        id: "species-conflict-control",
        label: "Controlling great strength",
        flavor: "Power is useful, but restraint makes it heroic.",
        weights: { "goliath-xphb": 3, "orc-xphb": 2, "dragonborn-xphb": 2 },
      },
      {
        id: "species-conflict-belonging",
        label: "Finding where I belong",
        flavor: "The character is between expectations.",
        weights: { "khoravar-efa": 3, "tiefling-xphb": 2, "human-xphb": 1 },
      },
      {
        id: "species-conflict-memory",
        label: "Understanding lost or borrowed memories",
        flavor: "The past is unreliable, but it still calls.",
        weights: { "reborn-rhw": 3, "kalashtar-efa": 2, "warforged-efa": 2 },
      },
      {
        id: "species-conflict-mask",
        label: "Choosing which face is the real one",
        flavor: "The character can become many things and must choose a self.",
        weights: { "changeling-efa": 3, "hexblood-rhw": 1, "gnome-xphb": 1 },
      },
    ],
  },
  {
    id: "species-table-vibe",
    prompt: "What table vibe should the species support?",
    helper: "Choose the answer that best matches the kind of scenes you want more often.",
    options: [
      {
        id: "species-table-vibe-heroic",
        label: "Classic heroic fantasy",
        flavor: "Clear silhouettes, big ideals, and adventure-first choices.",
        weights: { "human-xphb": 3, "elf-xphb": 2, "dwarf-xphb": 2 },
      },
      {
        id: "species-table-vibe-weird",
        label: "Strange, eerie, and personal",
        flavor: "Every answer opens another question.",
        weights: { "hexblood-rhw": 3, "reborn-rhw": 2, "kalashtar-efa": 1 },
      },
      {
        id: "species-table-vibe-tactical",
        label: "Tactical, tough, and physical",
        flavor: "The species should feel useful when maps and danger appear.",
        weights: { "goliath-xphb": 3, "orc-xphb": 2, "warforged-efa": 2 },
      },
      {
        id: "species-table-vibe-social",
        label: "Social play, secrets, and identity",
        flavor: "Conversation scenes should be as exciting as combat.",
        weights: { "changeling-efa": 3, "khoravar-efa": 2, "halfling-xphb": 1 },
      },
    ],
  },
];

export const backgroundQuizQuestionPool: GuidedChoiceQuizQuestion[] = [
  {
    id: "background-before-adventure",
    prompt: "Before becoming an adventurer, what kind of life shaped this character?",
    helper: "Answer as the character you want to build.",
    options: [
      {
        id: "background-before-adventure-service",
        label: "Service to a temple, cause, or community",
        flavor: "Their past taught duty before glory.",
        weights: { "acolyte-xphb": 3, "guard-xphb": 2, "farmer-xphb": 1 },
      },
      {
        id: "background-before-adventure-work",
        label: "Honest craft, trade, or labor",
        flavor: "They learned by making, repairing, selling, or harvesting.",
        weights: { "artisan-xphb": 3, "merchant-xphb": 2, "farmer-xphb": 2 },
      },
      {
        id: "background-before-adventure-road",
        label: "Roads, ships, ruins, or wilderness",
        flavor: "Movement shaped them more than any home.",
        weights: { "guide-xphb": 3, "sailor-xphb": 2, "wayfarer-xphb": 2 },
      },
      {
        id: "background-before-adventure-shadow",
        label: "Secrets, scams, crime, or fear",
        flavor: "Their old life left skills and consequences.",
        weights: { "criminal-xphb": 3, "charlatan-xphb": 2, "haunted-one-rhw": 2 },
      },
    ],
  },
  {
    id: "background-problem-solving",
    prompt: "When the party hits a locked problem, what old skill should help?",
    helper: "Backgrounds are great when they explain how the character solves noncombat scenes.",
    options: [
      {
        id: "background-problem-solving-research",
        label: "Research the answer from records and lore",
        flavor: "They know where knowledge hides.",
        weights: { "sage-xphb": 3, "scribe-xphb": 2, "archaeologist-efa": 2 },
      },
      {
        id: "background-problem-solving-question",
        label: "Question witnesses and follow clues",
        flavor: "Every detail has a motive behind it.",
        weights: { "investigator-rhw": 3, "guard-xphb": 1, "sage-xphb": 1 },
      },
      {
        id: "background-problem-solving-charm",
        label: "Talk, perform, or bluff past the obstacle",
        flavor: "A door opens faster when people like you.",
        weights: { "entertainer-xphb": 3, "charlatan-xphb": 2, "noble-xphb": 1 },
      },
      {
        id: "background-problem-solving-practical",
        label: "Use tools, contacts, and practical sense",
        flavor: "They do not theorize; they fix the problem.",
        weights: { "artisan-xphb": 2, "merchant-xphb": 2, "soldier-xphb": 1 },
      },
    ],
  },
  {
    id: "background-authority",
    prompt: "How did this character learn to deal with authority?",
    helper: "This helps choose between law, rank, rebellion, and survival.",
    options: [
      {
        id: "background-authority-chain",
        label: "By serving inside a chain of command",
        flavor: "Orders, reports, and discipline are familiar.",
        weights: { "soldier-xphb": 3, "guard-xphb": 3, "sailor-xphb": 1 },
      },
      {
        id: "background-authority-status",
        label: "By being raised near status and etiquette",
        flavor: "They understand polite power and inherited expectations.",
        weights: { "noble-xphb": 3, "merchant-xphb": 1, "scribe-xphb": 1 },
      },
      {
        id: "background-authority-dodge",
        label: "By avoiding authority whenever possible",
        flavor: "Rules are weather: annoying, dangerous, and sometimes useful.",
        weights: { "criminal-xphb": 3, "wayfarer-xphb": 2, "charlatan-xphb": 2 },
      },
      {
        id: "background-authority-distance",
        label: "By leaving society's noise behind",
        flavor: "The character trusts solitude more than institutions.",
        weights: { "hermit-xphb": 3, "guide-xphb": 2, "haunted-one-rhw": 1 },
      },
    ],
  },
  {
    id: "background-best-scene",
    prompt: "Which flashback scene should feel true for this character?",
    helper: "A background should make at least one past-life scene vivid.",
    options: [
      {
        id: "background-best-scene-stage",
        label: "A cheering room waiting for the next line",
        flavor: "They know performance and timing.",
        weights: { "entertainer-xphb": 3, "charlatan-xphb": 1 },
      },
      {
        id: "background-best-scene-battle",
        label: "A formation holding under terrible pressure",
        flavor: "They learned what fear sounds like in a crowd.",
        weights: { "soldier-xphb": 3, "guard-xphb": 2 },
      },
      {
        id: "background-best-scene-ruin",
        label: "Dusty ruins where one wrong step matters",
        flavor: "History is dangerous when it still has teeth.",
        weights: { "archaeologist-efa": 3, "sage-xphb": 1, "guide-xphb": 1 },
      },
      {
        id: "background-best-scene-nightmare",
        label: "A night they survived but never escaped",
        flavor: "The past is not just history; it is a wound.",
        weights: { "haunted-one-rhw": 3, "hermit-xphb": 1, "investigator-rhw": 1 },
      },
    ],
  },
  {
    id: "background-community",
    prompt: "What kind of people still know this character from before?",
    helper: "Contacts and reputation are often the practical benefit of a background.",
    options: [
      {
        id: "background-community-common",
        label: "Common folk, neighbors, and workers",
        flavor: "They belong among ordinary people.",
        weights: { "farmer-xphb": 3, "artisan-xphb": 2, "guard-xphb": 1 },
      },
      {
        id: "background-community-scholars",
        label: "Scholars, clerks, priests, and archivists",
        flavor: "They can find people who preserve answers.",
        weights: { "sage-xphb": 2, "scribe-xphb": 2, "acolyte-xphb": 2 },
      },
      {
        id: "background-community-travelers",
        label: "Travelers, crews, merchants, and innkeepers",
        flavor: "News travels with people who rarely stay still.",
        weights: { "merchant-xphb": 3, "sailor-xphb": 2, "wayfarer-xphb": 2 },
      },
      {
        id: "background-community-underworld",
        label: "Fence contacts, informants, and false friends",
        flavor: "They know people who do not use their real names.",
        weights: { "criminal-xphb": 3, "charlatan-xphb": 2, "investigator-rhw": 1 },
      },
    ],
  },
  {
    id: "background-motivation",
    prompt: "What pushed this character onto the adventuring road?",
    helper: "This makes the recommendation useful for roleplay, not only mechanics.",
    options: [
      {
        id: "background-motivation-calling",
        label: "A calling, vow, or revelation",
        flavor: "They believe the journey means something.",
        weights: { "acolyte-xphb": 3, "hermit-xphb": 2, "sage-xphb": 1 },
      },
      {
        id: "background-motivation-profit",
        label: "Profit, opportunity, or a risky deal",
        flavor: "Adventure is dangerous, but so is being broke.",
        weights: { "merchant-xphb": 3, "charlatan-xphb": 2, "criminal-xphb": 1 },
      },
      {
        id: "background-motivation-duty",
        label: "Duty to protect someone or something",
        flavor: "Leaving home was the responsible choice.",
        weights: { "guard-xphb": 3, "soldier-xphb": 2, "noble-xphb": 1 },
      },
      {
        id: "background-motivation-flight",
        label: "Flight from loss, guilt, or danger",
        flavor: "The road is safer than staying where the story began.",
        weights: { "haunted-one-rhw": 3, "wayfarer-xphb": 2, "sailor-xphb": 1 },
      },
    ],
  },
  {
    id: "background-tools",
    prompt: "What should this character be able to do when weapons are sheathed?",
    helper: "Think about downtime, social scenes, and investigation.",
    options: [
      {
        id: "background-tools-make",
        label: "Make or repair useful things",
        flavor: "Their hands remember work.",
        weights: { "artisan-xphb": 3, "farmer-xphb": 1, "scribe-xphb": 1 },
      },
      {
        id: "background-tools-read",
        label: "Read systems, documents, and fine print",
        flavor: "They find power in records.",
        weights: { "scribe-xphb": 3, "sage-xphb": 2, "merchant-xphb": 1 },
      },
      {
        id: "background-tools-navigate",
        label: "Navigate routes, weather, and hazards",
        flavor: "They keep people alive between destinations.",
        weights: { "guide-xphb": 3, "sailor-xphb": 2, "wayfarer-xphb": 1 },
      },
      {
        id: "background-tools-spot",
        label: "Spot lies, tracks, and suspicious details",
        flavor: "They notice what others walk past.",
        weights: { "investigator-rhw": 3, "guard-xphb": 2, "criminal-xphb": 1 },
      },
    ],
  },
  {
    id: "background-tone",
    prompt: "What tone should the past add to the character?",
    helper: "Pick the answer that would make the character easier to write and play.",
    options: [
      {
        id: "background-tone-hope",
        label: "Hopeful and grounded",
        flavor: "They know hardship, but not cynicism.",
        weights: { "farmer-xphb": 3, "acolyte-xphb": 2, "artisan-xphb": 1 },
      },
      {
        id: "background-tone-polished",
        label: "Polished and socially complex",
        flavor: "Manners can be armor.",
        weights: { "noble-xphb": 3, "merchant-xphb": 2, "entertainer-xphb": 1 },
      },
      {
        id: "background-tone-haunted",
        label: "Dark, wounded, and intense",
        flavor: "Something still follows them.",
        weights: { "haunted-one-rhw": 3, "hermit-xphb": 2, "criminal-xphb": 1 },
      },
      {
        id: "background-tone-restless",
        label: "Restless and hard to pin down",
        flavor: "Home is a moving target.",
        weights: { "wayfarer-xphb": 3, "sailor-xphb": 2, "guide-xphb": 2 },
      },
    ],
  },
];

const speciesTieBreakOrder = [
  "human-xphb",
  "elf-xphb",
  "dwarf-xphb",
  "halfling-xphb",
  "dragonborn-xphb",
  "aasimar-xphb",
  "tiefling-xphb",
  "gnome-xphb",
  "goliath-xphb",
  "orc-xphb",
  "changeling-efa",
  "warforged-efa",
  "kalashtar-efa",
  "khoravar-efa",
  "shifter-efa",
  "reborn-rhw",
  "hexblood-rhw",
  "lupin-rhw",
];

const backgroundTieBreakOrder = [
  "acolyte-xphb",
  "guard-xphb",
  "guide-xphb",
  "sage-xphb",
  "soldier-xphb",
  "criminal-xphb",
  "charlatan-xphb",
  "entertainer-xphb",
  "artisan-xphb",
  "farmer-xphb",
  "noble-xphb",
  "merchant-xphb",
  "sailor-xphb",
  "hermit-xphb",
  "haunted-one-rhw",
  "investigator-rhw",
  "archaeologist-efa",
  "wayfarer-xphb",
  "scribe-xphb",
];

function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

function createSession(
  questions: readonly GuidedChoiceQuizQuestion[],
  random: () => number,
): GuidedChoiceQuizQuestion[] {
  return shuffle(questions, random)
    .slice(0, GUIDED_CHOICE_QUESTION_COUNT)
    .map((question) => ({
      ...question,
      options: shuffle(question.options, random),
    }));
}

function getRecommendation(
  questions: readonly GuidedChoiceQuizQuestion[],
  answerOptionIds: readonly string[],
  limit: number,
  tieBreakOrder: readonly string[],
): GuidedChoiceQuizRecommendation | null {
  if (
    questions.length < GUIDED_CHOICE_QUESTION_COUNT ||
    answerOptionIds.length < questions.length
  ) {
    return null;
  }

  const chosenOptions = questions
    .map((question, index) =>
      question.options.find((option) => option.id === answerOptionIds[index]),
    )
    .filter((option): option is GuidedChoiceQuizOption => Boolean(option));

  const scores = new Map<string, number>();
  const reasons = new Map<string, Array<{ label: string; weight: number }>>();

  for (const option of chosenOptions) {
    for (const [id, weight] of Object.entries(option.weights)) {
      scores.set(id, (scores.get(id) ?? 0) + weight);
      const entries = reasons.get(id) ?? [];
      entries.push({ label: option.label, weight });
      reasons.set(id, entries);
    }
  }

  const ranked = [...scores.entries()].sort((a, b) => {
    if (b[1] !== a[1]) {
      return b[1] - a[1];
    }

    return tieBreakOrder.indexOf(a[0]) - tieBreakOrder.indexOf(b[0]);
  });

  const recommendedIds = ranked.slice(0, limit).map(([id]) => id);
  const buildReasons = (id: string): string[] =>
    (reasons.get(id) ?? [])
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((entry) => entry.label);

  return {
    recommendedIds,
    reasons: Object.fromEntries(
      recommendedIds.map((id) => [id, buildReasons(id)]),
    ),
  };
}

export function createSpeciesQuizSession(
  random: () => number = Math.random,
): GuidedChoiceQuizQuestion[] {
  return createSession(speciesQuizQuestionPool, random);
}

export function createBackgroundQuizSession(
  random: () => number = Math.random,
): GuidedChoiceQuizQuestion[] {
  return createSession(backgroundQuizQuestionPool, random);
}

export function getSpeciesQuizRecommendation(
  questions: readonly GuidedChoiceQuizQuestion[],
  answerOptionIds: readonly string[],
): GuidedChoiceQuizRecommendation | null {
  return getRecommendation(questions, answerOptionIds, 1, speciesTieBreakOrder);
}

export function getBackgroundQuizRecommendation(
  questions: readonly GuidedChoiceQuizQuestion[],
  answerOptionIds: readonly string[],
): GuidedChoiceQuizRecommendation | null {
  return getRecommendation(
    questions,
    answerOptionIds,
    3,
    backgroundTieBreakOrder,
  );
}
