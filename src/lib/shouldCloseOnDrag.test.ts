import { expect, test } from "vitest";
import { shouldCloseOnDrag } from "./shouldCloseOnDrag";

test("shouldCloseOnDrag returns true when drag distance is 150", () => {
  expect(shouldCloseOnDrag(150)).toBe(true);
});
