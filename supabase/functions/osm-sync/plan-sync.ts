type OverpassElement = {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
};

export function planSync(elements: OverpassElement[]) {
  return { toUpsert: elements };
}
