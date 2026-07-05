import { describe, expect, it } from "vitest";
import { astToPlainText, parseRulesText } from "@/src/adapters/rulesTextAst";
import type { RulesTextNode } from "@/types/rulesText";

describe("parseRulesText", () => {
  it("converts a plain string entry into a paragraph", () => {
    expect(parseRulesText(["You gain a +1 bonus."])).toEqual<RulesTextNode[]>([
      {
        type: "paragraph",
        children: [{ type: "text", text: "You gain a +1 bonus." }],
      },
    ]);
  });

  it("parses interactive 5etools tags into typed internalRef nodes", () => {
    const [paragraph] = parseRulesText([
      "Cast {@spell Fireball|XPHB} while {@condition Prone|XPHB}.",
    ]);

    expect(paragraph).toEqual({
      type: "paragraph",
      children: [
        { type: "text", text: "Cast " },
        { type: "internalRef", refType: "spell", label: "Fireball", ref: "Fireball|XPHB" },
        { type: "text", text: " while " },
        { type: "internalRef", refType: "condition", label: "Prone", ref: "Prone|XPHB" },
        { type: "text", text: "." },
      ],
    });
  });

  it("prefers the 5etools display text (3rd pipe segment) for ref labels", () => {
    const [paragraph] = parseRulesText([
      "Cast {@spell animate objects|xphb|Animate Objects} or {@item longsword|xphb}.",
    ]);

    expect(paragraph).toEqual({
      type: "paragraph",
      children: [
        { type: "text", text: "Cast " },
        {
          type: "internalRef",
          refType: "spell",
          label: "Animate Objects",
          ref: "animate objects|xphb|Animate Objects",
        },
        { type: "text", text: " or " },
        {
          type: "internalRef",
          refType: "item",
          label: "longsword",
          ref: "longsword|xphb",
        },
        { type: "text", text: "." },
      ],
    });
  });

  it("parses dice and damage tags into dice nodes", () => {
    const [paragraph] = parseRulesText(["Take {@damage 8d6} or roll {@dice 1d20+5}."]);

    expect(paragraph).toEqual({
      type: "paragraph",
      children: [
        { type: "text", text: "Take " },
        { type: "dice", label: "8d6" },
        { type: "text", text: " or roll " },
        { type: "dice", label: "1d20+5" },
        { type: "text", text: "." },
      ],
    });
  });

  it("parses bold/italic tags with nested content", () => {
    const [paragraph] = parseRulesText(["{@b Rage} lasts while {@i you {@dice 1d4} focus}."]);

    expect(paragraph).toEqual({
      type: "paragraph",
      children: [
        { type: "bold", children: [{ type: "text", text: "Rage" }] },
        { type: "text", text: " lasts while " },
        {
          type: "italic",
          children: [
            { type: "text", text: "you " },
            { type: "dice", label: "1d4" },
            { type: "text", text: " focus" },
          ],
        },
        { type: "text", text: "." },
      ],
    });
  });

  it("degrades unknown tags to their visible label, never breaking", () => {
    const [paragraph] = parseRulesText(["Use {@unknownTag Mystery Value|extra}."]);

    expect(paragraph).toEqual({
      type: "paragraph",
      children: [
        { type: "text", text: "Use " },
        { type: "text", text: "Mystery Value" },
        { type: "text", text: "." },
      ],
    });
  });

  it("converts 5etools list entries (including named items) into list nodes", () => {
    const nodes = parseRulesText([
      {
        type: "list",
        items: [
          "First option.",
          { type: "item", name: "Second", entry: "Named option with {@dice 1d6}." },
        ],
      },
    ]);

    expect(nodes).toEqual<RulesTextNode[]>([
      {
        type: "list",
        items: [
          [{ type: "text", text: "First option." }],
          [
            { type: "bold", children: [{ type: "text", text: "Second. " }] },
            { type: "text", text: "Named option with " },
            { type: "dice", label: "1d6" },
            { type: "text", text: "." },
          ],
        ],
      },
    ]);
  });

  it("converts 5etools table entries into table nodes with caption and headers", () => {
    const nodes = parseRulesText([
      {
        type: "table",
        caption: "Rage Damage",
        colLabels: ["Level", "Bonus"],
        rows: [
          ["1st", "{@dice +2}"],
          [{ type: "cell", roll: { min: 5, max: 8 } }, "+3"],
        ],
      },
    ]);

    expect(nodes).toEqual<RulesTextNode[]>([
      {
        type: "table",
        caption: "Rage Damage",
        headers: [
          [{ type: "text", text: "Level" }],
          [{ type: "text", text: "Bonus" }],
        ],
        rows: [
          [[{ type: "text", text: "1st" }], [{ type: "dice", label: "+2" }]],
          [[{ type: "text", text: "5–8" }], [{ type: "text", text: "+3" }]],
        ],
      },
    ]);
  });

  it("recurses into named/section/entries wrappers, bolding entry names", () => {
    const nodes = parseRulesText([
      {
        type: "entries",
        name: "Danger Sense",
        entries: ["You have advantage.", { type: "list", items: ["While raging."] }],
      },
    ]);

    expect(nodes).toEqual<RulesTextNode[]>([
      {
        type: "paragraph",
        children: [
          { type: "bold", children: [{ type: "text", text: "Danger Sense. " }] },
          { type: "text", text: "You have advantage." },
        ],
      },
      { type: "list", items: [[{ type: "text", text: "While raging." }]] },
    ]);
  });

  it("never throws on malformed or hostile entries", () => {
    const hostile: unknown[] = [
      null,
      undefined,
      42,
      { type: "table" },
      { type: "list" },
      { type: "entries" },
      { type: "item" },
      { entries: [{ entries: [null] }] },
      "Unclosed {@dice 1d6 tag",
      "<script>alert(1)</script>",
      { type: "wat", entry: { nested: true } },
    ];

    expect(() => parseRulesText(hostile)).not.toThrow();
    expect(() => parseRulesText(undefined)).not.toThrow();
    expect(() => parseRulesText("solo string" as unknown as unknown[])).not.toThrow();
  });

  it("escapes nothing but also injects nothing: raw HTML stays inert text", () => {
    const [paragraph] = parseRulesText(["<b>bold?</b>"]);

    expect(paragraph).toEqual({
      type: "paragraph",
      children: [{ type: "text", text: "<b>bold?</b>" }],
    });
  });
});

describe("astToPlainText", () => {
  it("flattens paragraphs, lists and tables into readable text", () => {
    const nodes = parseRulesText([
      "Deal {@damage 2d6} damage with {@item Longsword|XPHB}.",
      { type: "list", items: ["One.", "Two."] },
      {
        type: "table",
        caption: "Sizes",
        colLabels: ["Size"],
        rows: [["Medium"]],
      },
    ]);

    expect(astToPlainText(nodes)).toBe(
      "Deal 2d6 damage with Longsword. One. Two. Sizes: Size; Medium",
    );
  });

  it("returns empty string for empty input", () => {
    expect(astToPlainText([])).toBe("");
  });
});
