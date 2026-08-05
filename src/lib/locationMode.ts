export function resolveLocationMode(outcome: string): "precise" | "approximate" {
  if (outcome === "success") return "precise";
  return "approximate";
}
