import { expect, test } from "vitest";
import { planSync } from "./plan-sync";

test("a new overpass element is planned for upsert", () => {
  const element = { id: 1, lat: 0, lon: 0, tags: { amenity: "toilets" } };
  const plan = planSync([element], []);
  expect(plan.toUpsert).toEqual([element]);
});

test("an existing osm bathroom absent from the sync with no user content is planned for removal", () => {
  const existing = [{ id: "bathroom-1", osm_id: 99, hasContent: false }];
  const plan = planSync([], existing);
  expect(plan.toRemove).toEqual(["bathroom-1"]);
});
