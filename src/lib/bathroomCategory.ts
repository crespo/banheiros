export function categorizeBathroom(kind: string, paid: boolean) {
  if (kind === "instore") return { id: paid ? "instore_paid" : "instore", icon: "store", tone: "accent2" } as const;
  if (paid) return { id: "public_paid", icon: "building2", tone: "accent" } as const;
  return { id: "public", icon: "building2", tone: "accent" } as const;
}

export function decomposeCategory(category: string): { kind: "public" | "instore"; paid: boolean } {
  const paid = category.endsWith("_paid");
  const kind = category.startsWith("instore") ? "instore" : "public";
  return { kind, paid };
}
