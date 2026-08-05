import { expect, test } from "vitest";
import { evaluateModeration } from "./evaluate";

test("approves content when all scores are below their thresholds", () => {
  const scores = { TOXICITY: 0.1, PROFANITY: 0.1, THREAT: 0.1, IDENTITY_ATTACK: 0.1 };
  const thresholds = { TOXICITY: 0.8, PROFANITY: 0.8, THREAT: 0.8, IDENTITY_ATTACK: 0.8 };
  expect(evaluateModeration(scores, thresholds).verdict).toBe("approved");
});

test("rejects content when TOXICITY exceeds its threshold, naming the reason", () => {
  const scores = { TOXICITY: 0.9, PROFANITY: 0.1, THREAT: 0.1, IDENTITY_ATTACK: 0.1 };
  const thresholds = { TOXICITY: 0.8, PROFANITY: 0.8, THREAT: 0.8, IDENTITY_ATTACK: 0.8 };
  const result = evaluateModeration(scores, thresholds);
  expect(result.verdict).toBe("rejected");
  expect(result.reason).toBe("TOXICITY");
});
