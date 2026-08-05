import { expect, test } from "vitest";
import { validateUsernameFormat } from "./username";

test("rejects a username shorter than 3 characters", () => {
  expect(validateUsernameFormat("ab")).toBe("auth.usernameInvalidFormat");
});

test("rejects a username longer than 30 characters", () => {
  expect(validateUsernameFormat("a".repeat(31))).toBe("auth.usernameInvalidFormat");
});

test("rejects a username with characters outside a-z0-9._", () => {
  expect(validateUsernameFormat("Raul!")).toBe("auth.usernameInvalidFormat");
});

test("accepts a valid username", () => {
  expect(validateUsernameFormat("raul.crespo_1")).toBe(null);
});
