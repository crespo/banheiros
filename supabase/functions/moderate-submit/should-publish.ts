type Status = "approved" | "pending" | "rejected";

export function shouldPublish(verdict: Status, existingStatus: Status | null): boolean {
  if (verdict === "approved") return true;
  if (existingStatus === "approved") return false;
  return true;
}
