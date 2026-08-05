import type { Thresholds } from "./evaluate";

const DEFAULT_THRESHOLD = 0.7;

export function parseThresholds(env: Record<string, string | undefined>): Thresholds {
  return {
    TOXICITY: DEFAULT_THRESHOLD,
    PROFANITY: DEFAULT_THRESHOLD,
    THREAT: DEFAULT_THRESHOLD,
    IDENTITY_ATTACK: DEFAULT_THRESHOLD,
  };
}
