import { expect, test } from "vitest";
import { parseThresholds } from "./thresholds";

test("returns the conservative default threshold when no env vars are set", () => {
  const thresholds = parseThresholds({});
  expect(thresholds.TOXICITY).toBe(0.7);
});
