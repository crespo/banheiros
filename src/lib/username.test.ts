import { expect, test } from "vitest";
import { validateUsernameFormat } from "./username";

test("rejects a username shorter than 3 characters", () => {
  expect(validateUsernameFormat("ab")).toBe("auth.usernameInvalidFormat");
});
