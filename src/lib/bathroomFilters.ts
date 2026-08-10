type Bathroom = { id: string; paid: boolean; kind: string };

export function filterBathrooms<T extends Bathroom>(bathrooms: T[], filterId: string): T[] {
  if (filterId === "paid") return bathrooms.filter((b) => b.paid);
  if (filterId === "public" || filterId === "instore") return bathrooms.filter((b) => b.kind === filterId);
  return bathrooms;
}
