import type { Attribute, Thresholds } from "./evaluate";

const DEFAULT_THRESHOLD = 0.7;

function thresholdFor(env: Record<string, string | undefined>, attribute: Attribute): number {
  const raw = env[`MODERATION_THRESHOLD_${attribute}`];
  const parsed = raw !== undefined ? Number(raw) : NaN;
  return Number.isNaN(parsed) ? DEFAULT_THRESHOLD : parsed;
}

export function parseThresholds(env: Record<string, string | undefined>): Thresholds {
  return {
    TOXICITY: thresholdFor(env, "TOXICITY"),
    PROFANITY: thresholdFor(env, "PROFANITY"),
    THREAT: thresholdFor(env, "THREAT"),
    IDENTITY_ATTACK: thresholdFor(env, "IDENTITY_ATTACK"),
  };
}
