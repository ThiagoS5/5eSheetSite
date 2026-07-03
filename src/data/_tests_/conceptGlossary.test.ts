import { describe, expect, it } from "vitest";
import { conceptGlossary, requiredConceptIds } from "@/src/data/conceptGlossary";

describe("conceptGlossary", () => {
  it("covers every required beginner concept from the master plan", () => {
    for (const id of requiredConceptIds) {
      const concept = conceptGlossary[id];

      expect(concept, id).toBeDefined();
      expect(concept.term.length).toBeGreaterThan(1);
      expect(concept.short.length).toBeGreaterThan(20);
      expect(concept.long.length).toBeGreaterThan(concept.short.length);
    }
  });
});
