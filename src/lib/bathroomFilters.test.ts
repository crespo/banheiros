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
