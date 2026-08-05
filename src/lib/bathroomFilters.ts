type Bathroom = { id: string; paid: boolean; kind: string };

export function filterBathrooms(bathrooms: Bathroom[], filterId: string): Bathroom[] {
  if (filterId === "paid") return bathrooms.filter((b) => b.paid);
  if (filterId === "public") return bathrooms.filter((b) => b.kind === "public");
  return bathrooms;
}
