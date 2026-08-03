import { expect, test } from "vitest";
import { mapElement } from "./map-element";

test("maps amenity=toilets with fee=yes to a public paid row", () => {
  expect(
    mapElement({
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

test("maps toilets=yes on a commercial POI to kind instore", () => {
  expect(
    mapElement({
      id: 456,
      lat: -9.66,
      lon: -35.73,
      tags: { shop: "supermarket", toilets: "yes" },
    }).kind
  ).toBe("instore");
});

test("maps missing fee tag to paid false", () => {
  expect(
    mapElement({
      id: 456,
      lat: -9.66,
      lon: -35.73,
      tags: { shop: "supermarket", toilets: "yes" },
    }).paid
  ).toBe(false);
});
