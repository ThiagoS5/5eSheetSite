import { describe, expect, it } from "vitest";
import { getBuilderClasses } from "@/src/services/ruleService";
import {
  QUIZ_QUESTION_COUNT,
  classQuizPitches,
  classQuizQuestionPool,
  createClassQuizSession,
  getClassQuizRecommendation,
} from "@/src/data/classQuiz";

function seededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

describe("classQuiz", () => {
  it("only references class ids that exist in the builder catalog", () => {
    const catalogIds = new Set(getBuilderClasses().map((entry) => entry.id));
    const referencedIds = new Set([
      ...Object.keys(classQuizPitches),
      ...classQuizQuestionPool.flatMap((question) =>
        question.options.flatMap((option) => Object.keys(option.weights)),
      ),
    ]);

    for (const classId of referencedIds) {
      expect(catalogIds, `classe desconhecida no quiz: ${classId}`).toContain(
        classId,
      );
    }
  });

  it("creates sessions with 7 unique questions drawn from a larger pool", () => {
    const session = createClassQuizSession(seededRandom(42));

    expect(classQuizQuestionPool.length).toBeGreaterThan(QUIZ_QUESTION_COUNT);
    expect(session).toHaveLength(QUIZ_QUESTION_COUNT);
    expect(new Set(session.map((question) => question.id)).size).toBe(
      QUIZ_QUESTION_COUNT,
    );
  });

  it("randomizes questions and answer order between sessions", () => {
    const first = createClassQuizSession(seededRandom(1));
    const second = createClassQuizSession(seededRandom(999));

    const firstSignature = first
      .map(
        (question) =>
          `${question.id}:${question.options.map((option) => option.id).join(",")}`,
      )
      .join("|");
    const secondSignature = second
      .map(
        (question) =>
          `${question.id}:${question.options.map((option) => option.id).join(",")}`,
      )
      .join("|");

    expect(firstSignature).not.toBe(secondSignature);
  });

  it("returns null until every question is answered", () => {
    const session = createClassQuizSession(seededRandom(7));
    const partialAnswers = session
      .slice(0, QUIZ_QUESTION_COUNT - 1)
      .map((question) => question.options[0].id);

    expect(getClassQuizRecommendation(session, partialAnswers)).toBeNull();
  });

  it("recommends exactly two distinct classes with reasons and pitches", () => {
    const session = createClassQuizSession(seededRandom(7));
    const answers = session.map((question) => question.options[0].id);
    const recommendation = getClassQuizRecommendation(session, answers);

    expect(recommendation).not.toBeNull();
    expect(recommendation?.primaryClassId).not.toBe(
      recommendation?.secondaryClassId,
    );
    expect(
      recommendation?.reasons[recommendation.primaryClassId]?.length,
    ).toBeGreaterThan(0);
    expect(
      recommendation?.reasons[recommendation.secondaryClassId]?.length,
    ).toBeGreaterThan(0);
    expect(classQuizPitches[recommendation!.primaryClassId]).toBeTruthy();
    expect(classQuizPitches[recommendation!.secondaryClassId]).toBeTruthy();
  });

  it("scores answers deterministically for the same choices", () => {
    const session = createClassQuizSession(seededRandom(123));
    const answers = session.map((question) => question.options[0].id);

    expect(getClassQuizRecommendation(session, answers)).toEqual(
      getClassQuizRecommendation(session, answers),
    );
  });
});
