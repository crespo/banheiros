import { expect, test } from "vitest";
import { categorizeBathroom } from "./bathroomCategory";

test('categorizeBathroom("public", false) returns the public free category', () => {
  expect(categorizeBathroom("public", false)).toEqual({ id: "public", icon: "building2", tone: "accent" });
});
