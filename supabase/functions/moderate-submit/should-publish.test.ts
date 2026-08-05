import { expect, test } from "vitest";
import { shouldPublish } from "./should-publish";

test("keeps the previous approved review when a re-moderated edit is rejected", () => {
  expect(shouldPublish("rejected", "approved")).toBe(false);
});
