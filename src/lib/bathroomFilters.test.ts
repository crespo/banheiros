import { expect, test } from "vitest";
import { filterBathrooms } from "./bathroomFilters";

test('filterBathrooms("all") returns all bathrooms', () => {
  const bathrooms = [
    { id: "1", kind: "public", paid: false },
    { id: "2", kind: "instore", paid: true },
  ];
  const result = filterBathrooms(bathrooms, "all");
  expect(result).toEqual(bathrooms);
});

test('filterBathrooms("paid") returns only paid bathrooms', () => {
  const bathrooms = [
    { id: "1", kind: "public", paid: false },
    { id: "2", kind: "public", paid: true },
  ];
  const result = filterBathrooms(bathrooms, "paid");
  expect(result).toEqual([bathrooms[1]]);
});

test('filterBathrooms("public") returns only public bathrooms', () => {
  const bathrooms = [
    { id: "1", kind: "instore", paid: false },
    { id: "2", kind: "public", paid: false },
  ];
  const result = filterBathrooms(bathrooms, "public");
  expect(result).toEqual([bathrooms[1]]);
});
