import { expect, test } from "vitest";
import { shouldPublish } from "./should-publish";

test("keeps the previous approved review when a re-moderated edit is rejected", () => {
  expect(shouldPublish("rejected", "approved")).toBe(false);
});

test("publishes when a re-moderated edit remains approved", () => {
  expect(shouldPublish("approved", "approved")).toBe(true);
});

test("publishes a first-time rejected submission with no prior approved version", () => {
  expect(shouldPublish("rejected", null)).toBe(true);
});
