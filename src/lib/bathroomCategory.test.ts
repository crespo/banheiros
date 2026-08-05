import { expect, test } from "vitest";
import { categorizeBathroom } from "./bathroomCategory";

test('categorizeBathroom("public", false) returns the public free category', () => {
  expect(categorizeBathroom("public", false)).toEqual({ id: "public", icon: "building2", tone: "accent" });
});

test('categorizeBathroom("instore", false) returns the instore category', () => {
  expect(categorizeBathroom("instore", false)).toEqual({ id: "instore", icon: "store", tone: "accent2" });
});

test('categorizeBathroom("public", true) returns the public paid category', () => {
  expect(categorizeBathroom("public", true)).toEqual({ id: "public_paid", icon: "building2", tone: "accent" });
});

test('categorizeBathroom("instore", true) returns the instore paid category', () => {
  expect(categorizeBathroom("instore", true)).toEqual({ id: "instore_paid", icon: "store", tone: "accent2" });
});
