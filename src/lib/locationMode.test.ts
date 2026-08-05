import { expect, test } from "vitest";
import { resolveLocationMode } from "./locationMode";

test('resolveLocationMode("success") returns the precise mode', () => {
  expect(resolveLocationMode("success")).toBe("precise");
});
