import { expect, test } from "vitest";
import { bathroomDisplayName } from "./bathroomName";

test('bathroomDisplayName returns name when name is a non-empty string', () => {
  expect(bathroomDisplayName("Banheiro Central", "Banheiro")).toBe("Banheiro Central");
});

test('bathroomDisplayName returns fallback when name is null', () => {
  expect(bathroomDisplayName(null, "Banheiro")).toBe("Banheiro");
});
