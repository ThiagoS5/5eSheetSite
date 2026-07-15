import aagData from "@/public/data/spells/spells-aag.json";
import aiData from "@/public/data/spells/spells-ai.json";
import aitfrAvtData from "@/public/data/spells/spells-aitfr-avt.json";
import bmtData from "@/public/data/spells/spells-bmt.json";
import efaData from "@/public/data/spells/spells-efa.json";
import frhofData from "@/public/data/spells/spells-frhof.json";
import ftdData from "@/public/data/spells/spells-ftd.json";
import idrotfData from "@/public/data/spells/spells-idrotf.json";
import llkData from "@/public/data/spells/spells-llk.json";
import phbData from "@/public/data/spells/spells-phb.json";
import satoData from "@/public/data/spells/spells-sato.json";
import sccData from "@/public/data/spells/spells-scc.json";
import tceData from "@/public/data/spells/spells-tce.json";
import xgeData from "@/public/data/spells/spells-xge.json";
import xphbData from "@/public/data/spells/spells-xphb.json";
import spellSourcesData from "@/public/data/spells/sources.json";
import { normalizeSpell, type RawSpell } from "@/src/adapters/spellAdapter";
import type { BuilderSpell, SpellCatalogFilter } from "@/src/types/spells";

interface SpellFile {
  spell?: RawSpell[];
}

interface SpellClassReference {
  name: string;
  source?: string;
}

type SpellSourceLookup = Record<
  string,
  Record<string, { class?: SpellClassReference[] }>
>;

const spellFiles: SpellFile[] = [
  aagData,
  aiData,
  aitfrAvtData,
  bmtData,
  efaData,
  frhofData,
  ftdData,
  idrotfData,
  llkData,
  phbData,
  satoData,
  sccData,
  tceData,
  xgeData,
  xphbData,
];

let catalogCache: BuilderSpell[] | undefined;

export function getSpellCatalog(): BuilderSpell[] {
  if (!catalogCache) {
    const sources = spellSourcesData as SpellSourceLookup;
    catalogCache = spellFiles
      .flatMap((file) => file.spell ?? [])
      .map((spell) =>
        normalizeSpell(spell, getClassNamesForSpell(sources, spell.name, spell.source)),
      )
      .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }

  return catalogCache;
}

export function getSpellById(spellId: string): BuilderSpell | undefined {
  return getSpellCatalog().find((spell) => spell.id === spellId);
}

export function getSpellCatalogForClass(input: {
  className: string;
  activeSources?: string[];
}): BuilderSpell[] {
  const activeSources = new Set(
    (input.activeSources?.length ? input.activeSources : ["XPHB"]).map((source) =>
      source.toUpperCase(),
    ),
  );
  const className = input.className.toLowerCase();

  return getSpellCatalog().filter(
    (spell) =>
      activeSources.has(spell.source.toUpperCase()) &&
      spell.classNames.some((name) => name.toLowerCase() === className),
  );
}

export function filterSpellCatalog(
  spells: BuilderSpell[],
  filter: SpellCatalogFilter,
): BuilderSpell[] {
  const query = filter.query?.trim().toLowerCase() ?? "";
  const levels = new Set(filter.levels ?? []);
  const schools = new Set(filter.schools ?? []);
  const sources = new Set((filter.sources ?? []).map((source) => source.toUpperCase()));

  return spells.filter((spell) => {
    if (query && !spell.name.toLowerCase().includes(query)) return false;
    if (levels.size > 0 && !levels.has(spell.level)) return false;
    if (schools.size > 0 && !schools.has(spell.school)) return false;
    if (sources.size > 0 && !sources.has(spell.source.toUpperCase())) return false;
    return true;
  });
}

function getClassNamesForSpell(
  sources: SpellSourceLookup,
  spellName: string,
  spellSource: string,
): string[] {
  const classRefs = sources[spellSource]?.[spellName]?.class ?? [];
  return Array.from(new Set(classRefs.map((entry) => entry.name))).sort();
}
