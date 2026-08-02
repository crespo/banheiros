import { expect, test } from "vitest";
import { t } from "./i18n";

test("t returns PT string for key with default language", () => {
  expect(t("auth.welcomeTitle")).toBe("Bem-vindo ao Banheiros");
});
