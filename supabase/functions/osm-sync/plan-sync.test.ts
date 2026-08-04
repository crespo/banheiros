import { expect, test } from "vitest";
import { planSync } from "./plan-sync";

test("a new overpass element is planned for upsert", () => {
  const element = { id: 1, lat: 0, lon: 0, tags: { amenity: "toilets" } };
  const plan = planSync([element]);
  expect(plan.toUpsert).toEqual([element]);
});
