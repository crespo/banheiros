import { expect, test } from "vitest";
import { isOpenNow } from "./bathroomHours";

test("isOpenNow returns true when current time is within the open window", () => {
  const now = new Date(2024, 0, 1, 10, 0, 0);
  expect(isOpenNow("06:00", "22:00", now)).toBe(true);
});
