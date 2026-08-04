type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
};

type ExistingBathroom = { id: string; osm_id: number; hasContent: boolean };

export function planSync(elements: OverpassElement[], existing: ExistingBathroom[]) {
  const seenOsmIds = new Set(elements.map((e) => e.id));
  const toRemove = existing
    .filter((b) => !seenOsmIds.has(b.osm_id) && !b.hasContent)
    .map((b) => b.id);

  return { toUpsert: elements, toRemove };
}
