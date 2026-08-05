import { expect, test } from "vitest";
import { extractText } from "./extract-text";

test("combines a pin's name and address into one string", () => {
  const text = extractText({ type: "pin", name: "Padaria Bom Pão", address: "Rua das Flores, 123" });
  expect(text).toBe("Padaria Bom Pão Rua das Flores, 123");
});
