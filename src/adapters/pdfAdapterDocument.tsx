import type { ReactElement, ReactNode } from "react";
import {
  Circle,
  Document,
  type DocumentProps,
  Page,
  Path,
  Rect,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type {
  BuilderEquipmentOption,
  CharacterDescription,
  CharacterSheetSummary,
  SheetFeature,
} from "@/types/builder";
import type { BuilderSpell, CharacterSpellcastingSummary } from "@/types/spells";

export interface PdfCharacterInput {
  summary: CharacterSheetSummary;
  description: CharacterDescription;
  inventory?: PdfInventoryItem[];
}

export interface PdfExportOptions {
  pageSize?: "A4" | "LETTER";
}

export interface PdfInventoryItem {
  item: BuilderEquipmentOption;
  quantity: number;
}

export interface PdfInventoryRow {
  id: string;
  label: string;
  quantity: number;
  source: string;
  category: string;
  weightKg?: number;
  equipped: boolean;
}

type DescriptionField = { label: string; value: string };
type SpellGroup = { level: number; spells: BuilderSpell[] };

const PAGE_BACKGROUND = "#f6efe4";
const INK = "#241710";
const MUTED = "#715f50";
const BORDER = "#9b8063";
const ACCENT = "#7f1d1d";
const GOLD = "#b7791f";

const SOURCE_LABELS: Record<SheetFeature["source"], string> = {
  background: "Background",
  class: "Class",
  species: "Species",
};

export function buildPdfDocument(
  input: PdfCharacterInput,
  options: PdfExportOptions = {},
): ReactElement<DocumentProps> {
  const pageSize = options.pageSize ?? "A4";
  const { summary, description } = input;
  const inventoryRows = createInventoryRows(summary, input.inventory ?? []);

  return (
    <Document
      title={`${summary.name || "Unnamed Character"} - Forge & Fate Sheet`}
      author="Forge & Fate"
      creator="Forge & Fate"
      producer="Forge & Fate"
      subject="Dungeons & Dragons 2024 printable character sheet"
      language="en-US"
    >
      <Page size={pageSize} style={styles.page}>
        <CharacterHeader summary={summary} description={description} />

        <View style={styles.coreStatGrid}>
          <StatBox label="Armor Class" value={String(summary.armorClass)} />
          <StatBox label="Initiative" value={formatModifier(summary.initiative)} />
          <StatBox label="Speed" value={`${summary.speedFeet} ft.`} detail={`${summary.speedMeters} m`} />
          <StatBox
            label="Hit Points"
            value={`${summary.currentHp}/${summary.maxHp}`}
            detail={summary.tempHp > 0 ? `${summary.tempHp} temp` : summary.hitDice}
          />
          <StatBox label="Proficiency" value={formatModifier(summary.proficiencyBonus)} />
          <StatBox label="Hit Dice" value={summary.hitDice} />
        </View>

        <View style={styles.mainGrid}>
          <View style={styles.leftColumn}>
            <Section title="Abilities">
              <View style={styles.abilityGrid}>
                {summary.attributes.map((attribute) => (
                  <View key={attribute.key} style={styles.abilityBox}>
                    <Text style={styles.abilityAbbr}>{attribute.abbr}</Text>
                    <Text style={styles.abilityScore}>{attribute.score}</Text>
                    <Text style={styles.abilityMod}>{formatModifier(attribute.modifier)}</Text>
                  </View>
                ))}
              </View>
            </Section>

            <Section title="Saving Throws">
              {summary.savingThrows.map((savingThrow) => (
                <Row
                  key={savingThrow.attributeKey}
                  label={`${savingThrow.abbr}${savingThrow.isProficient ? " *" : ""}`}
                  value={formatModifier(savingThrow.modifier)}
                />
              ))}
            </Section>

            <Section title="Skills">
              {summary.skills.slice(0, 18).map((skill) => (
                <Row
                  key={skill.name}
                  label={`${skill.label}${skill.isProficient ? " *" : ""}${skill.isExpert ? " +" : ""}`}
                  value={formatModifier(skill.modifier)}
                />
              ))}
            </Section>
          </View>

          <View style={styles.centerColumn}>
            <Section title="Attacks">
              {summary.weapons.length > 0 ? (
                summary.weapons.slice(0, 5).map((weapon) => (
                  <View key={weapon.name} style={styles.blockItem}>
                    <Text style={styles.itemTitle}>{weapon.name}</Text>
                    <Text style={styles.bodyText}>
                      {weapon.attackBonus} to hit - {weapon.damage}
                    </Text>
                    <Text style={styles.mutedText}>{weapon.notes}</Text>
                  </View>
                ))
              ) : (
                <EmptyLine label="No equipped attacks" />
              )}
            </Section>

            <Section title="Equipment">
              {summary.selectedEquipment.length > 0 ? (
                summary.selectedEquipment.slice(0, 8).map((item) => (
                  <Row key={item.id} label={item.name} value={item.source} />
                ))
              ) : (
                <EmptyLine label="No equipped gear" />
              )}
              <Text style={styles.mutedText}>
                Carry {summary.carry.currentKg} / {summary.carry.maxKg} kg
              </Text>
            </Section>

            <Section title="Armor & Defenses">
              {(summary.armorClassBreakdown ?? []).map((part) => (
                <Row key={part.label} label={part.label} value={formatSignedNumber(part.value)} />
              ))}
              <Text style={styles.bodyText}>Resistances: {formatList(summary.resistances)}</Text>
              <Text style={styles.bodyText}>Immunities: {formatList(summary.immunities)}</Text>
              <Text style={styles.bodyText}>Vulnerabilities: {formatList(summary.vulnerabilities)}</Text>
            </Section>
          </View>

          <View style={styles.rightColumn}>
            {summary.spellcasting ? (
              <SpellcastingPrimer spellcasting={summary.spellcasting} />
            ) : (
              <FeaturePrimer features={summary.features} />
            )}

            <Section title="Senses & Languages">
              <Text style={styles.bodyText}>
                Passives: Perception {summary.passives.perception}, Investigation{" "}
                {summary.passives.investigation}, Insight {summary.passives.insight}
              </Text>
              <Text style={styles.bodyText}>
                Senses:{" "}
                {summary.senses.length > 0
                  ? summary.senses
                      .map((sense) =>
                        sense.rangeFeet ? `${sense.name} ${sense.rangeFeet} ft.` : sense.name,
                      )
                      .join(", ")
                  : "None"}
              </Text>
              <Text style={styles.bodyText}>Languages: {formatList(summary.languages)}</Text>
              <Text style={styles.bodyText}>Tools: {formatList(summary.toolProficiencies)}</Text>
            </Section>
          </View>
        </View>

        <View style={styles.bottomGrid}>
          <Section title="Coins">
            <Text style={styles.bodyText}>
              CP {summary.money.pc} - SP {summary.money.pp} - EP {summary.money.pe} - GP{" "}
              {summary.money.po} - PP {summary.money.pl}
            </Text>
          </Section>
          <Section title="Character Notes">
            <Text style={styles.bodyText}>
              {truncate(
                [description.aparencia, description.personalidade, description.tracos]
                  .filter(Boolean)
                  .join(" "),
                270,
              ) || "See description appendix."}
            </Text>
          </Section>
        </View>
      </Page>

      {summary.spellcasting ? (
        <Page size={pageSize} style={styles.page}>
          <AppendixHeader title="Spellcasting Appendix" />
          <SpellcastingAppendix spellcasting={summary.spellcasting} />
        </Page>
      ) : null}

      <Page size={pageSize} style={styles.page}>
        <AppendixHeader title="Features & Inventory Appendix" />
        <FeatureAppendix features={summary.features} />
        <InventoryAppendix inventoryRows={inventoryRows} summary={summary} />
      </Page>

      <Page size={pageSize} style={styles.page}>
        <AppendixHeader title="Description Appendix" />
        <DescriptionAppendix description={description} />
      </Page>
    </Document>
  );
}

function CharacterHeader({ description, summary }: PdfCharacterInput): ReactElement {
  return (
    <View style={styles.header}>
      <Portrait portraitId={description.portraitId} />
      <View style={styles.headerText}>
        <Text style={styles.characterName}>{summary.name || "Unnamed Character"}</Text>
        <Text style={styles.characterLine}>
          Level {summary.level} {summary.speciesName} {summary.className} - {summary.backgroundName} -{" "}
          {summary.ruleset} rules
        </Text>
        <Text style={styles.headerSmall}>
          XP {summary.xp} / {summary.xpThreshold} -{" "}
          {summary.progressionMode === "milestone" ? "Milestone" : "XP"} progression
        </Text>
      </View>
    </View>
  );
}

function Portrait({ portraitId }: { portraitId?: string }): ReactElement {
  const palette = getPortraitPalette(portraitId ?? "");

  return (
    <View style={styles.portraitFrame}>
      <Svg width="72" height="72" viewBox="0 0 72 72">
        <Rect x="2" y="2" width="68" height="68" rx="12" fill={palette.background} />
        <Circle cx="36" cy="24" r="10" fill={palette.accent} />
        <Path d="M18 62 C21 45 28 38 36 38 C44 38 51 45 54 62 Z" fill={palette.accent} />
        <Path d="M17 17 C28 7 44 7 55 17" stroke={GOLD} strokeWidth="3" fill="none" />
      </Svg>
    </View>
  );
}

function SpellcastingPrimer({ spellcasting }: { spellcasting: CharacterSpellcastingSummary }): ReactElement {
  return (
    <Section title="Spellcasting">
      <View style={styles.spellStatGrid}>
        <StatBox compact label="Ability" value={spellcasting.abilityLabel.slice(0, 3).toUpperCase()} />
        <StatBox compact label="Save DC" value={String(spellcasting.spellSaveDc)} />
        <StatBox compact label="Attack" value={formatModifier(spellcasting.spellAttackBonus)} />
      </View>
      <Text style={styles.bodyText}>
        Prepared {spellcasting.selectedPreparedCount}/{spellcasting.preparedSpellLimit} - Cantrips{" "}
        {spellcasting.selectedCantripCount}/{spellcasting.cantripsKnownLimit}
      </Text>
      <Text style={styles.bodyText}>
        Slots:{" "}
        {spellcasting.slots.map((slot) => `L${slot.level} ${slot.remaining}/${slot.total}`).join(", ") ||
          "None"}
      </Text>
      <Text style={styles.mutedText}>See spellcasting appendix for full spell list.</Text>
    </Section>
  );
}

function FeaturePrimer({ features }: { features: SheetFeature[] }): ReactElement {
  return (
    <Section title="Features">
      {splitFeatureSummary(features, 4).map((feature) => (
        <View key={`${feature.source}-${feature.name}`} style={styles.blockItem}>
          <Text style={styles.itemTitle}>{feature.name}</Text>
          <Text style={styles.mutedText}>{SOURCE_LABELS[feature.source]}</Text>
          <Text style={styles.bodyText}>{truncate(feature.description, 110)}</Text>
        </View>
      ))}
      {features.length > 4 ? (
        <Text style={styles.mutedText}>See appendix for {features.length - 4} more.</Text>
      ) : null}
    </Section>
  );
}

function SpellcastingAppendix({ spellcasting }: { spellcasting: CharacterSpellcastingSummary }): ReactElement {
  const grouped = groupSpellsByLevel([
    ...spellcasting.cantrips,
    ...spellcasting.knownSpells,
    ...spellcasting.preparedSpells,
  ]);

  return (
    <View style={styles.appendixGrid}>
      <Section title="Spell Stats">
        <Text style={styles.bodyText}>
          {spellcasting.abilityLabel} - Save DC {spellcasting.spellSaveDc} - Spell Attack{" "}
          {formatModifier(spellcasting.spellAttackBonus)}
        </Text>
        <Text style={styles.bodyText}>
          Slots:{" "}
          {spellcasting.slots.map((slot) => `L${slot.level} ${slot.remaining}/${slot.total}`).join(", ") ||
            "None"}
        </Text>
      </Section>

      {grouped.map((group) => (
        <Section key={group.level} title={group.level === 0 ? "Cantrips" : `Level ${group.level} Spells`}>
          {group.spells.map((spell) => (
            <View key={spell.id} style={styles.spellCard}>
              <Text style={styles.itemTitle}>
                {spell.name} <Text style={styles.mutedText}>({spell.school})</Text>
              </Text>
              <Text style={styles.mutedText}>
                {spell.castingTime} - {spell.range} - {spell.duration} - {spell.components}
              </Text>
              <Text style={styles.bodyText}>{getSpellAppendixDescription(spell)}</Text>
            </View>
          ))}
        </Section>
      ))}
    </View>
  );
}

function FeatureAppendix({ features }: { features: SheetFeature[] }): ReactElement {
  return (
    <Section title="Features">
      {features.length > 0 ? (
        features.map((feature) => (
          <View key={`${feature.source}-${feature.name}`} style={styles.spellCard}>
            <Text style={styles.itemTitle}>
              {feature.name} <Text style={styles.mutedText}>({SOURCE_LABELS[feature.source]})</Text>
            </Text>
            <Text style={styles.bodyText}>{feature.description}</Text>
          </View>
        ))
      ) : (
        <EmptyLine label="No features recorded" />
      )}
    </Section>
  );
}

function InventoryAppendix({
  inventoryRows,
  summary,
}: {
  inventoryRows: PdfInventoryRow[];
  summary: CharacterSheetSummary;
}): ReactElement {
  return (
    <Section title="Inventory & Attacks">
      <Text style={styles.bodyText}>
        Carrying {summary.carry.currentKg} / {summary.carry.maxKg} kg
      </Text>
      {inventoryRows.length > 0 ? (
        inventoryRows.map((row) => (
          <Row
            key={row.id}
            label={`${row.quantity > 1 ? `${row.quantity}x ` : ""}${row.label}${row.equipped ? " (equipped)" : ""}`}
            value={row.source}
          />
        ))
      ) : (
        <EmptyLine label="No inventory recorded" />
      )}
      {summary.weapons.map((weapon) => (
        <View key={weapon.name} style={styles.spellCard}>
          <Text style={styles.itemTitle}>{weapon.name}</Text>
          <Text style={styles.bodyText}>
            {weapon.attackBonus} to hit - {weapon.damage}
          </Text>
          <Text style={styles.mutedText}>{weapon.notes}</Text>
        </View>
      ))}
    </Section>
  );
}

function DescriptionAppendix({ description }: { description: CharacterDescription }): ReactElement {
  return (
    <View style={styles.descriptionGrid}>
      <View style={styles.descriptionPortrait}>
        <Portrait portraitId={description.portraitId} />
      </View>
      <View style={styles.descriptionFields}>
        {compactDescriptionFields(description).map((field) => (
          <Row key={field.label} label={field.label} value={field.value} />
        ))}
      </View>
      <Section title="Appearance">
        <Text style={styles.bodyText}>{description.aparencia || "Not recorded."}</Text>
      </Section>
      <Section title="Personality">
        <Text style={styles.bodyText}>{description.personalidade || "Not recorded."}</Text>
      </Section>
      <Section title="Traits">
        <Text style={styles.bodyText}>{description.tracos || "Not recorded."}</Text>
      </Section>
      <Section title="Notes">
        <Text style={styles.bodyText}>{description.notas || "Not recorded."}</Text>
      </Section>
    </View>
  );
}

function AppendixHeader({ title }: { title: string }): ReactElement {
  return (
    <View style={styles.appendixHeader}>
      <Text style={styles.appendixTitle}>{title}</Text>
      <Text style={styles.headerSmall}>Forge & Fate printable sheet</Text>
    </View>
  );
}

function Section({ children, title }: { children: ReactNode; title: string }): ReactElement {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function StatBox({
  compact = false,
  detail,
  label,
  value,
}: {
  compact?: boolean;
  detail?: string;
  label: string;
  value: string;
}): ReactElement {
  return (
    <View style={compact ? styles.compactStatBox : styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={compact ? styles.compactStatValue : styles.statValue}>{value}</Text>
      {detail ? <Text style={styles.statDetail}>{detail}</Text> : null}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function EmptyLine({ label }: { label: string }): ReactElement {
  return <Text style={styles.mutedText}>{label}</Text>;
}

export function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

export function formatList(values: string[]): string {
  return values.length > 0 ? values.join(", ") : "None";
}

export function splitFeatureSummary(features: SheetFeature[], limit: number): SheetFeature[] {
  return features.slice(0, limit);
}

export function groupSpellsByLevel(spells: BuilderSpell[]): SpellGroup[] {
  const groups = new Map<number, BuilderSpell[]>();

  for (const spell of spells) {
    const levelSpells = groups.get(spell.level) ?? [];
    levelSpells.push(spell);
    groups.set(spell.level, levelSpells);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([level, levelSpells]) => ({
      level,
      spells: [...levelSpells].sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

export function getSpellAppendixDescription(spell: BuilderSpell): string {
  return spell.description;
}

export function createInventoryRows(
  summary: CharacterSheetSummary,
  inventory: PdfInventoryItem[] = [],
): PdfInventoryRow[] {
  const equippedIds = new Set(summary.selectedEquipment.map((item) => item.id));
  const rows = new Map<string, PdfInventoryRow>();

  for (const entry of inventory) {
    rows.set(entry.item.id, {
      id: entry.item.id,
      label: entry.item.name,
      quantity: entry.quantity,
      source: entry.item.source,
      category: entry.item.category,
      weightKg: entry.item.weightKg,
      equipped: equippedIds.has(entry.item.id),
    });
  }

  for (const item of summary.selectedEquipment) {
    rows.set(item.id, {
      id: item.id,
      label: item.name,
      quantity: rows.get(item.id)?.quantity ?? 1,
      source: item.source,
      category: item.category,
      weightKg: item.weightKg,
      equipped: true,
    });
  }

  return [...rows.values()].sort((a, b) => {
    if (a.equipped !== b.equipped) {
      return a.equipped ? -1 : 1;
    }

    return a.label.localeCompare(b.label);
  });
}

export function compactDescriptionFields(description: CharacterDescription): DescriptionField[] {
  return [
    { label: "Alignment", value: description.alinhamento },
    { label: "Faith", value: description.faith },
    { label: "Lifestyle", value: description.lifestyle },
    { label: "Age", value: description.age },
    { label: "Height", value: description.height },
    { label: "Weight", value: description.weight },
    { label: "Eyes", value: description.eyes },
    { label: "Skin", value: description.skin },
    { label: "Hair", value: description.hair },
    { label: "Gender", value: description.gender },
  ].filter((field) => field.value.trim().length > 0);
}

function formatSignedNumber(value: number): string {
  return value >= 0 ? `+${value}` : String(value);
}

function truncate(value: string, limit: number): string {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1).trimEnd()}...`;
}

function getPortraitPalette(id: string): { background: string; accent: string } {
  if (id.includes("moon")) return { background: "#26204d", accent: "#c4b5fd" };
  if (id.includes("wild")) return { background: "#123524", accent: "#86efac" };
  if (id.includes("gold")) return { background: "#5c3b0c", accent: "#facc15" };
  if (id.includes("shadow")) return { background: "#111827", accent: "#93c5fd" };
  if (id.includes("storm")) return { background: "#4c1d52", accent: "#f0abfc" };
  if (id.includes("iron")) return { background: "#27272a", accent: "#d4d4d8" };
  if (id.includes("sea")) return { background: "#134e4a", accent: "#5eead4" };

  return { background: "#4a1515", accent: GOLD };
}

const styles = StyleSheet.create({
  abilityAbbr: {
    color: MUTED,
    fontSize: 7,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  abilityBox: {
    alignItems: "center",
    borderColor: BORDER,
    borderRadius: 4,
    borderWidth: 1,
    flexBasis: "30%",
    marginBottom: 5,
    padding: 5,
  },
  abilityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    justifyContent: "space-between",
  },
  abilityMod: {
    color: ACCENT,
    fontSize: 12,
    fontWeight: 700,
  },
  abilityScore: {
    color: INK,
    fontSize: 18,
    fontWeight: 700,
  },
  appendixGrid: {
    gap: 8,
  },
  appendixHeader: {
    borderBottomColor: ACCENT,
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingBottom: 6,
  },
  appendixTitle: {
    color: INK,
    fontSize: 18,
    fontWeight: 700,
  },
  blockItem: {
    borderBottomColor: "#d7c6b4",
    borderBottomWidth: 1,
    marginBottom: 5,
    paddingBottom: 4,
  },
  bodyText: {
    color: INK,
    fontSize: 8.5,
    lineHeight: 1.35,
  },
  bottomGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  centerColumn: {
    flexBasis: "36%",
    gap: 8,
  },
  characterLine: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: 700,
  },
  characterName: {
    color: INK,
    fontSize: 25,
    fontWeight: 700,
    lineHeight: 1.05,
  },
  compactStatBox: {
    alignItems: "center",
    borderColor: BORDER,
    borderRadius: 4,
    borderWidth: 1,
    flex: 1,
    padding: 4,
  },
  compactStatValue: {
    color: INK,
    fontSize: 13,
    fontWeight: 700,
  },
  coreStatGrid: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  descriptionFields: {
    flex: 1,
  },
  descriptionGrid: {
    gap: 8,
  },
  descriptionPortrait: {
    alignItems: "flex-start",
  },
  header: {
    alignItems: "center",
    borderBottomColor: ACCENT,
    borderBottomWidth: 2,
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
    paddingBottom: 8,
  },
  headerSmall: {
    color: MUTED,
    fontSize: 8,
    marginTop: 3,
  },
  headerText: {
    flex: 1,
  },
  itemTitle: {
    color: INK,
    fontSize: 9.5,
    fontWeight: 700,
  },
  leftColumn: {
    flexBasis: "27%",
    gap: 8,
  },
  mainGrid: {
    flexDirection: "row",
    gap: 8,
  },
  mutedText: {
    color: MUTED,
    fontSize: 7.5,
    lineHeight: 1.25,
  },
  page: {
    backgroundColor: PAGE_BACKGROUND,
    color: INK,
    fontFamily: "Helvetica",
    fontSize: 9,
    padding: 24,
  },
  portraitFrame: {
    alignItems: "center",
    borderColor: BORDER,
    borderRadius: 6,
    borderWidth: 1,
    height: 82,
    justifyContent: "center",
    width: 82,
  },
  rightColumn: {
    flexBasis: "37%",
    gap: 8,
  },
  row: {
    borderBottomColor: "#dfd1c2",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  rowLabel: {
    color: INK,
    flex: 1,
    fontSize: 8,
  },
  rowValue: {
    color: ACCENT,
    fontSize: 8,
    fontWeight: 700,
    textAlign: "right",
  },
  section: {
    borderColor: BORDER,
    borderRadius: 5,
    borderWidth: 1,
    flexGrow: 1,
    marginBottom: 6,
    padding: 7,
  },
  sectionTitle: {
    color: ACCENT,
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 0.9,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  spellCard: {
    borderColor: "#d7c6b4",
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 5,
    padding: 5,
  },
  spellStatGrid: {
    flexDirection: "row",
    gap: 5,
    marginBottom: 5,
  },
  statBox: {
    alignItems: "center",
    borderColor: BORDER,
    borderRadius: 5,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
    padding: 5,
  },
  statDetail: {
    color: MUTED,
    fontSize: 7,
  },
  statLabel: {
    color: MUTED,
    fontSize: 6.7,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  statValue: {
    color: INK,
    fontSize: 16,
    fontWeight: 700,
  },
});
