import { expect, test } from "vitest";
import { isWithinCoverage } from "./mapCoverage";

test("isWithinCoverage returns true for a coordinate inside the Maceió bbox", () => {
  expect(isWithinCoverage(-9.58, -35.73)).toBe(true);
});

test("isWithinCoverage returns false for a latitude north of the bbox", () => {
  expect(isWithinCoverage(-8.00, -35.73)).toBe(false);
});
