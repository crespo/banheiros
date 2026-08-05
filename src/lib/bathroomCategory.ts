export function categorizeBathroom(kind: string, _paid: boolean) {
  if (kind === "instore") return { id: "instore", icon: "store", tone: "accent2" };
  return { id: "public", icon: "building2", tone: "accent" };
}
