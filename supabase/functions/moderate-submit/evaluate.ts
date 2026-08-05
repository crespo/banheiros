export type Attribute = "TOXICITY" | "PROFANITY" | "THREAT" | "IDENTITY_ATTACK";
export type Scores = Record<Attribute, number>;
export type Thresholds = Record<Attribute, number>;

const ATTRIBUTES: Attribute[] = ["TOXICITY", "PROFANITY", "THREAT", "IDENTITY_ATTACK"];

export function evaluateModeration(
  scores: Scores,
  thresholds: Thresholds,
): { verdict: "approved" | "rejected"; reason: Attribute | null } {
  for (const attribute of ATTRIBUTES) {
    if (scores[attribute] >= thresholds[attribute]) {
      return { verdict: "rejected", reason: attribute };
    }
  }
  return { verdict: "approved", reason: null };
}
