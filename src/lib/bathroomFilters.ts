type Bathroom = { id: string; paid: boolean };

export function filterBathrooms(bathrooms: Bathroom[], filterId: string): Bathroom[] {
  if (filterId === "paid") return bathrooms.filter((b) => b.paid);
  return bathrooms;
}
