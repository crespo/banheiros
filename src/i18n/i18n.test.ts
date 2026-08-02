import { beforeEach, expect, test, vi } from "vitest";
import { t, setLanguage } from "./i18n";

beforeEach(() => {
  localStorage.clear();
  setLanguage("pt");
});

test("t returns PT string for key with default language", () => {
  expect(t("auth.welcomeTitle")).toBe("Bem-vindo ao Banheiros");
});

test("t replaces {{var}} placeholder with provided value", () => {
  expect(t("review.hideUsernameNote", { default: "Visível" })).toBe("Padrão da sua conta: Visível. Você pode mudar isso em Perfil.");
});

test("t returns EN string after setLanguage('en')", () => {
  setLanguage("en");
  expect(t("auth.welcomeTitle")).toBe("Welcome to Banheiros");
});

test("setLanguage writes lang to localStorage", () => {
  setLanguage("en");
  expect(localStorage.getItem("banheiros_lang")).toBe("en");
});

test("module init reads lang from localStorage", async () => {
  localStorage.setItem("banheiros_lang", "en");
  vi.resetModules();
  const { t: freshT } = await import("./i18n");
  expect(freshT("auth.welcomeTitle")).toBe("Welcome to Banheiros");
});
