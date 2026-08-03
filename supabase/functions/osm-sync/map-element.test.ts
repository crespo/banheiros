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

test("maps name tag to name field", () => {
  expect(
    mapElement({
      id: 1,
      lat: 0,
      lon: 0,
      tags: { amenity: "toilets", name: "Banheiro da Praça" },
    }).name
  ).toBe("Banheiro da Praça");
});

test("maps opening_hours tag to open_time and close_time", () => {
  expect(
    mapElement({
      id: 1,
      lat: 0,
      lon: 0,
      tags: { amenity: "toilets", opening_hours: "06:00-22:00" },
    })
  ).toMatchObject({ open_time: "06:00", close_time: "22:00" });
});
