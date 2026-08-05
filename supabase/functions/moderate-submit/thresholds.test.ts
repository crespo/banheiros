import { expect, test } from "vitest";
import { parseThresholds } from "./thresholds";

test("returns the conservative default threshold when no env vars are set", () => {
  const thresholds = parseThresholds({});
  expect(thresholds.TOXICITY).toBe(0.7);
});

test("uses the env override for a threshold when set", () => {
  const thresholds = parseThresholds({ MODERATION_THRESHOLD_TOXICITY: "0.5" });
  expect(thresholds.TOXICITY).toBe(0.5);
});
