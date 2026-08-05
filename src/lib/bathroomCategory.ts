export function categorizeBathroom(kind: string, paid: boolean) {
  if (kind === "instore") return { id: paid ? "instore_paid" : "instore", icon: "store", tone: "accent2" };
  if (paid) return { id: "public_paid", icon: "building2", tone: "accent" };
  return { id: "public", icon: "building2", tone: "accent" };
}
