import { describe, expect, it } from "vitest";
import {
  backgroundQuizPitches,
  backgroundQuizQuestionPool,
  createBackgroundQuizSession,
  createSpeciesQuizSession,
  getBackgroundQuizRecommendation,
  getSpeciesQuizRecommendation,
  speciesQuizPitches,
  speciesQuizQuestionPool,
} from "@/src/data/guidedChoiceQuiz";
import {
  getBuilderBackgrounds,
  getBuilderSpecies,
} from "@/src/services/ruleService";

function seededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("guidedChoiceQuiz", () => {
  it("keeps the guided quiz bank above 50 prompts and answers", () => {
    const totalPromptsAndAnswers = [
      ...speciesQuizQuestionPool,
      ...backgroundQuizQuestionPool,
    ].reduce((total, question) => total + 1 + question.options.length, 0);

    expect(totalPromptsAndAnswers).toBeGreaterThan(50);
  });

  it("only references species ids that exist in the builder catalog", () => {
    const catalogIds = new Set(getBuilderSpecies().map((entry) => entry.id));
    const referencedIds = new Set([
      ...Object.keys(speciesQuizPitches),
      ...speciesQuizQuestionPool.flatMap((question) =>
        question.options.flatMap((option) => Object.keys(option.weights)),
      ),
    ]);

    for (const speciesId of referencedIds) {
      expect(catalogIds, `unknown species in quiz: ${speciesId}`).toContain(
        speciesId,
      );
    }
  });

  it("only references background ids that exist in the builder catalog", () => {
    const catalogIds = new Set(getBuilderBackgrounds().map((entry) => entry.id));
    const referencedIds = new Set([
      ...Object.keys(backgroundQuizPitches),
      ...backgroundQuizQuestionPool.flatMap((question) =>
        question.options.flatMap((option) => Object.keys(option.weights)),
      ),
    ]);

    for (const backgroundId of referencedIds) {
      expect(catalogIds, `unknown background in quiz: ${backgroundId}`).toContain(
        backgroundId,
      );
    }
  });

  it("creates 7-question species and background sessions", () => {
    const speciesSession = createSpeciesQuizSession(seededRandom(11));
    const backgroundSession = createBackgroundQuizSession(seededRandom(22));

    expect(speciesSession).toHaveLength(7);
    expect(backgroundSession).toHaveLength(7);
    expect(new Set(speciesSession.map((question) => question.id)).size).toBe(7);
    expect(new Set(backgroundSession.map((question) => question.id)).size).toBe(7);
  });

  it("recommends one species with reasons and a pitch", () => {
    const session = createSpeciesQuizSession(seededRandom(33));
    const answers = session.map((question) => question.options[0].id);
    const recommendation = getSpeciesQuizRecommendation(session, answers);

    expect(recommendation).not.toBeNull();
    expect(recommendation?.recommendedIds).toHaveLength(1);
    expect(recommendation?.reasons[recommendation.recommendedIds[0]].length).toBeGreaterThan(0);
    expect(speciesQuizPitches[recommendation!.recommendedIds[0]]).toBeTruthy();
  });

  it("recommends three backgrounds with reasons and pitches", () => {
    const session = createBackgroundQuizSession(seededRandom(44));
    const answers = session.map((question) => question.options[0].id);
    const recommendation = getBackgroundQuizRecommendation(session, answers);

    expect(recommendation).not.toBeNull();
    expect(new Set(recommendation?.recommendedIds).size).toBe(3);
    expect(recommendation?.recommendedIds).toHaveLength(3);

    for (const backgroundId of recommendation!.recommendedIds) {
      expect(recommendation?.reasons[backgroundId].length).toBeGreaterThan(0);
      expect(backgroundQuizPitches[backgroundId]).toBeTruthy();
    }
  });
});
