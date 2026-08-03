export function mapElement(element: {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
}) {
  return {
    osm_id: element.id,
    kind: "public",
    paid: true,
    source: "osm",
    status: "approved",
    open_time: null,
    close_time: null,
    name: null,
    address: null,
    osm_tags: element.tags,
    lat: element.lat,
    lon: element.lon,
  };
}
