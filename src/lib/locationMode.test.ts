import { expect, test } from "vitest";
import { resolveLocationMode } from "./locationMode";

test('resolveLocationMode("success") returns the precise mode', () => {
  expect(resolveLocationMode("success")).toBe("precise");
});

test('resolveLocationMode("error") returns the approximate mode', () => {
  expect(resolveLocationMode("error")).toBe("approximate");
});
