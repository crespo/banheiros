export type Attribute = "TOXICITY" | "PROFANITY" | "THREAT" | "IDENTITY_ATTACK";
export type Scores = Record<Attribute, number>;
export type Thresholds = Record<Attribute, number>;

export function evaluateModeration(
  scores: Scores,
  thresholds: Thresholds,
): { verdict: "approved" | "rejected"; reason: Attribute | null } {
  return { verdict: "approved", reason: null };
}
