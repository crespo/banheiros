import { expect, test } from "vitest";
import { mapElement } from "./map-element";

test("maps amenity=toilets with fee=yes to a public paid row", () => {
  expect(
    mapElement({
      type: "node",
      id: 123,
      lat: -9.66,
      lon: -35.73,
      tags: { amenity: "toilets", fee: "yes" },
    })
  ).toEqual({
    osm_id: 123,
    kind: "public",
    paid: true,
    source: "osm",
    status: "approved",
    open_time: null,
    close_time: null,
    name: null,
    address: null,
    osm_tags: { amenity: "toilets", fee: "yes" },
    lat: -9.66,
    lon: -35.73,
  });
});
