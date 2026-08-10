import { parseOpeningHours } from "./opening-hours.ts";

export function mapElement(element: {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}) {
  return {
    osm_id: element.id,
    kind: element.tags.amenity === "toilets" ? "public" : "instore",
    paid: element.tags.fee === "yes",
    source: "osm",
    status: "approved",
    ...(parseOpeningHours(element.tags.opening_hours ?? "") ?? { open_time: null, close_time: null }),
    name: element.tags.name ?? null,
    address: null,
    osm_tags: element.tags,
    lat: element.center?.lat ?? element.lat,
    lon: element.center?.lon ?? element.lon,
  };
}
