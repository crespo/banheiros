import { expect, test } from "vitest";
import { isOpenNow } from "./bathroomHours";

test("isOpenNow returns true when current time is within the open window", () => {
  const now = new Date(2024, 0, 1, 10, 0, 0);
  expect(isOpenNow("06:00", "22:00", now)).toBe(true);
});

test("isOpenNow returns true for an overnight schedule regardless of the current time", () => {
  expect(isOpenNow("22:00", "06:00", new Date(2024, 0, 1, 23, 0, 0))).toBe(true);
});

