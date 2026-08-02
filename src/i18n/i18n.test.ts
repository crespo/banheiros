import { expect, test } from "vitest";
import { t } from "./i18n";

test("t returns PT string for key with default language", () => {
  expect(t("auth.welcomeTitle")).toBe("Bem-vindo ao Banheiros");
});

test("t replaces {{var}} placeholder with provided value", () => {
  expect(t("review.hideUsernameNote", { default: "Visível" })).toBe("Padrão da sua conta: Visível. Você pode mudar isso em Perfil.");
});
